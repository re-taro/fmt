import type { Block, Spec } from "comment-parser";
import { parse, tokenizers } from "comment-parser";
import type { Parser } from "prettier";

import {
  TAGS_DESCRIPTION_NEEDED,
  TAGS_GROUP_CONDITION,
  TAGS_GROUP_HEAD,
  TAGS_NAMELESS,
  TAGS_ORDER,
  TAGS_SYNONYMS,
  TAGS_TYPELESS,
  TAGS_VERTICALLY_ALIGN_ABLE,
} from "./roles";
import { stringify } from "./stringify";
import { DESCRIPTION, EXAMPLE, PARAM, RETURNS, SPACE_TAG_DATA } from "./tags";
import type { AllOptions, AST, PrettierComment, Token } from "./types";
import {
  addStarsToTheBeginningOfTheLines,
  convertToModernType,
  detectEndOfLine,
  findPluginByParser,
  findTokenIndex,
  formatType,
  isDefaultTag,
} from "./utils";

const {
  name: nameTokenizer,
  tag: tagTokenizer,
  type: typeTokenizer,
  description: descriptionTokenizer,
} = tokenizers;

const isBlockComment = (comment: PrettierComment): boolean =>
  comment.type === "CommentBlock" || comment.type === "Block";

export const getParser = (originalParse: Parser["parse"], parserName: string) =>
  async function jsdocParser(
    text: string,
    parsersOrOptions: Parameters<Parser["parse"]>[1],
    maybeOptions?: AllOptions,
  ): Promise<AST> {
    let options = (maybeOptions ?? parsersOrOptions) as AllOptions;
    const prettierParse =
      findPluginByParser(parserName, options)?.parse ?? originalParse;

    const ast = prettierParse(text, options) as AST;

    options = {
      ...options,
      printWidth: options.jsdocPrintWidth ?? options.printWidth,
    };

    const eol =
      options.endOfLine === "auto" ? detectEndOfLine(text) : options.endOfLine;
    options = { ...options, endOfLine: "lf" };

    await Promise.all(
      ast.comments.map(async (comment) => {
        if (!isBlockComment(comment)) return;
        const tokenIndex = findTokenIndex(ast.tokens, comment);
        const paramsOrder = getParamsOrders(ast, tokenIndex);
        const originalValue = comment.value;

        comment.value = comment.value.replace(/^(?:[*]+)/g, "*");
        const commentString = `/*${comment.value.replace(/\r\n?/g, "\n")}*/`;

        /**
         * Check if this comment block is a JSDoc. Based on:
         * https://github.com/jsdoc/jsdoc/blob/master/packages/jsdoc/plugins/commentsOnly.js
         */
        if (!/^\/\*\*[\s\S]+?\*\/$/.test(commentString)) return;

        const parsed = parse(commentString, {
          spacing: "preserve",
          tokenizers: [
            tagTokenizer(),
            (spec) => {
              if (isDefaultTag(spec.tag)) {
                return spec;
              }

              return typeTokenizer("preserve")(spec);
            },
            nameTokenizer(),
            descriptionTokenizer("preserve"),
          ],
        })[0];

        comment.value = "";

        if (!parsed) {
          return;
        }

        normalizeTags(parsed);
        convertCommentDescToDescTag(parsed);

        const commentContentPrintWidth = getIndentationWidth(
          comment,
          text,
          options,
        );

        let maxTagTitleLength = 0;
        let maxTagTypeLength = 0;
        let maxTagNameLength = 0;

        let tags = parsed.tags.map(({ type, optional, ...rest }) => {
          if (type) {
            type = type.replace(/[=]$/, () => {
              optional = true;

              return "";
            });

            type = convertToModernType(type);
          }

          return {
            ...rest,
            type,
            optional,
          } as Spec;
        });

        tags = sortTags(tags, paramsOrder, options);

        if (options.jsdocSeparateReturnsFromParam) {
          tags = tags.flatMap((tag, index) => {
            if (tag.tag === RETURNS && tags[index - 1]?.tag === PARAM) {
              return [SPACE_TAG_DATA, tag];
            }

            return [tag];
          });
        }
        if (options.jsdocAddDefaultToDescription) {
          tags = tags.map(addDefaultValueToDescription);
        }

        tags = await Promise.all(
          tags
            .map(assignOptionalAndDefaultToName)
            .map(async ({ type, ...rest }) => {
              if (type) {
                type = await formatType(type, {
                  ...options,
                  printWidth: commentContentPrintWidth,
                });
              }

              return {
                ...rest,
                type,
              } as Spec;
            }),
        ).then((formattedTags) =>
          formattedTags.map(({ type, name, description, tag, ...rest }) => {
            const isVerticallyAlignAbleTags =
              TAGS_VERTICALLY_ALIGN_ABLE.includes(tag);

            if (isVerticallyAlignAbleTags) {
              maxTagTitleLength = Math.max(maxTagTitleLength, tag.length);
              maxTagTypeLength = Math.max(maxTagTypeLength, type.length);
              maxTagNameLength = Math.max(maxTagNameLength, name.length);
            }

            return {
              type,
              name,
              description,
              tag,
              ...rest,
            };
          }),
        );

        if (options.jsdocSeparateTagGroups) {
          tags = tags.flatMap((tag, index) => {
            const prevTag = tags[index - 1];
            if (
              prevTag &&
              prevTag.tag !== DESCRIPTION &&
              prevTag.tag !== EXAMPLE &&
              prevTag.tag !== SPACE_TAG_DATA.tag &&
              tag.tag !== SPACE_TAG_DATA.tag &&
              prevTag.tag !== tag.tag
            ) {
              return [SPACE_TAG_DATA, tag];
            }

            return [tag];
          });
        }

        const filteredTags = tags.filter(({ description, tag }) => {
          if (!description && TAGS_DESCRIPTION_NEEDED.includes(tag)) {
            return false;
          }

          return true;
        });

        for (const [tagIndex, tagData] of filteredTags.entries()) {
          const formattedTag = await stringify(
            tagData,
            tagIndex,
            filteredTags,
            { ...options, printWidth: commentContentPrintWidth },
            maxTagTitleLength,
            maxTagTypeLength,
            maxTagNameLength,
          );
          comment.value += formattedTag;
        }

        comment.value = comment.value.trimEnd();

        if (comment.value) {
          comment.value = addStarsToTheBeginningOfTheLines(
            originalValue,
            comment.value,
            options,
          );
        }

        if (eol === "cr") {
          comment.value = comment.value.replace(/\n/g, "\r");
        } else if (eol === "crlf") {
          comment.value = comment.value.replace(/\n/g, "\r\n");
        }
      }),
    );

    ast.comments = ast.comments.filter(
      (comment) => !(isBlockComment(comment) && !comment.value),
    );

    return ast;
  };

function sortTags(
  tags: Spec[],
  paramsOrder: string[] | undefined,
  options: AllOptions,
): Spec[] {
  let canGroupNextTags = false;
  let shouldSortAgain = false;

  tags = tags
    .reduce<Spec[][]>((tagGroups, cur) => {
      if (
        tagGroups.length === 0 ||
        (TAGS_GROUP_HEAD.includes(cur.tag) && canGroupNextTags)
      ) {
        canGroupNextTags = false;
        tagGroups.push([]);
      }
      if (TAGS_GROUP_CONDITION.includes(cur.tag)) {
        canGroupNextTags = true;
      }
      tagGroups[tagGroups.length - 1].push(cur);

      return tagGroups;
    }, [])
    .flatMap((tagGroup, index, array) => {
      tagGroup.sort((a, b) => {
        if (
          paramsOrder &&
          paramsOrder.length > 1 &&
          a.tag === PARAM &&
          b.tag === PARAM
        ) {
          const aIndex = paramsOrder.indexOf(a.name);
          const bIndex = paramsOrder.indexOf(b.name);
          if (aIndex > -1 && bIndex > -1) {
            return aIndex - bIndex;
          }

          return 0;
        }

        return (
          getTagOrderWeight(a.tag, options) - getTagOrderWeight(b.tag, options)
        );
      });

      if (array.length - 1 !== index) {
        tagGroup.push(SPACE_TAG_DATA);
      }

      if (
        index > 0 &&
        tagGroup[0]?.tag &&
        !TAGS_GROUP_HEAD.includes(tagGroup[0].tag)
      ) {
        shouldSortAgain = true;
      }

      return tagGroup;
    });

  return shouldSortAgain ? sortTags(tags, paramsOrder, options) : tags;
}

/**
 * Control order of tags by weights. Smaller value brings tag higher.
 */
function getTagOrderWeight(tag: string, options: AllOptions): number {
  if (tag === DESCRIPTION && !options.jsdocDescriptionTag) {
    return -1;
  }
  const index = TAGS_ORDER.indexOf(tag);

  return index === -1 ? TAGS_ORDER.indexOf("other") : index;
}

function getIndentationWidth(
  comment: PrettierComment,
  text: string,
  options: AllOptions,
): number {
  const line = text.split(/\r\n?|\n/g)[comment.loc.start.line - 1];

  let spaces = 0;
  let tabs = 0;
  for (let i = comment.loc.start.column - 1; i >= 0; i--) {
    const c = line[i];
    if (c === " ") {
      spaces++;
    } else if (c === "\t") {
      tabs++;
    } else {
      break;
    }
  }

  return options.printWidth - (spaces + tabs * options.tabWidth) - " * ".length;
}

const TAGS_ORDER_LOWER = TAGS_ORDER.map((tagOrder) => tagOrder.toLowerCase());
/**
 * This will adjust the casing of tag titles, resolve synonyms, fix
 * incorrectly parsed tags, correct incorrectly assigned names and types, and
 * trim spaces.
 *
 * @param parsed
 */
function normalizeTags(parsed: Block): void {
  parsed.tags = parsed.tags.map(
    ({ tag, type, name, description, default: _default, ...rest }) => {
      tag = tag || "";
      type = type || "";
      name = name || "";
      description = description || "";
      _default = _default?.trim();

      const tagSticksToType = tag.indexOf("{");
      if (tagSticksToType !== -1 && tag[tag.length - 1] === "}") {
        type = `${tag.slice(tagSticksToType + 1, -1)} ${type}`;
        tag = tag.slice(0, tagSticksToType);
      }

      tag = tag.trim();
      const lower = tag.toLowerCase();
      const tagIndex = TAGS_ORDER_LOWER.indexOf(lower);
      if (tagIndex >= 0) {
        tag = TAGS_ORDER[tagIndex];
      } else if (lower in TAGS_SYNONYMS) {
        tag = TAGS_SYNONYMS[lower as keyof typeof TAGS_SYNONYMS];
      }

      type = type.trim();
      name = name.trim();

      if (name && TAGS_NAMELESS.includes(tag)) {
        description = `${name} ${description}`;
        name = "";
      }
      if (type && TAGS_TYPELESS.includes(tag)) {
        description = `{${type}} ${description}`;
        type = "";
      }

      return {
        tag,
        type,
        name,
        description,
        default: _default,
        ...rest,
      };
    },
  );
}

/**
 * This will merge the comment description and all `@description` tags into one
 * `@description` tag.
 *
 * @param parsed
 */
function convertCommentDescToDescTag(parsed: Block): void {
  let description = parsed.description || "";
  parsed.description = "";

  parsed.tags = parsed.tags.filter(({ description: _description, tag }) => {
    if (tag.toLowerCase() === DESCRIPTION) {
      if (_description.trim()) {
        description += `\n\n${_description}`;
      }

      return false;
    } else {
      return true;
    }
  });

  if (description) {
    parsed.tags.unshift({
      tag: DESCRIPTION,
      description,
      name: undefined as any,
      type: undefined as any,
      source: [],
      optional: false,
      problems: [],
    });
  }
}

function getParamsOrders(ast: AST, tokenIndex: number): string[] | undefined {
  let params: Token[] | undefined;

  try {
    const nextTokenType = ast.tokens[tokenIndex + 1]?.type;
    if (typeof nextTokenType !== "object") {
      return undefined;
    }
    if (nextTokenType.label === "function") {
      let openedParenthesesCount = 1;
      const tokensAfterComment = ast.tokens.slice(tokenIndex + 4);

      const endIndex = tokensAfterComment.findIndex(({ type }) => {
        if (typeof type === "string") {
          return false;
        } else if (type.label === "(") {
          openedParenthesesCount++;
        } else if (type.label === ")") {
          openedParenthesesCount--;
        }

        return openedParenthesesCount === 0;
      });

      params = tokensAfterComment.slice(0, endIndex + 1);
    }

    if (nextTokenType.label === "const") {
      let openedParenthesesCount = 1;
      let tokensAfterComment = ast.tokens.slice(tokenIndex + 1);
      const firstParenthesesIndex = tokensAfterComment.findIndex(
        ({ type }) => typeof type === "object" && type.label === "(",
      );

      tokensAfterComment = tokensAfterComment.slice(firstParenthesesIndex + 1);

      const endIndex = tokensAfterComment.findIndex(({ type }) => {
        if (typeof type === "string") {
          return false;
        } else if (type.label === "(") {
          openedParenthesesCount++;
        } else if (type.label === ")") {
          openedParenthesesCount--;
        }

        return openedParenthesesCount === 0;
      });

      const arrowItem: Token | undefined = tokensAfterComment[endIndex + 1];

      if (
        typeof arrowItem?.type === "object" &&
        arrowItem.type.label === "=>"
      ) {
        params = tokensAfterComment.slice(0, endIndex + 1);
      }
    }

    return params
      ?.filter(({ type }) => typeof type === "object" && type.label === "name")
      .map(({ value }) => value);
  } catch {
    //
  }
}

function addDefaultValueToDescription(tag: Spec): Spec {
  if (tag.optional && tag.default) {
    let { description } = tag;

    description = description.replace(/[\s]*Default[\s]*is[\s]*`.*`\.?$/, "");

    if (description && !/[.\n]$/.test(description)) {
      description += ".";
    }

    description += ` Default is \`${tag.default}\``;

    return {
      ...tag,
      description: description.trim(),
    };
  } else {
    return tag;
  }
}

function assignOptionalAndDefaultToName({
  name,
  optional,
  default: default_,
  tag,
  type,
  source,
  description,
  ...rest
}: Spec): Spec {
  if (isDefaultTag(tag)) {
    const usefulSourceLine =
      source.find((x) => x.source.includes(`@${tag}`))?.source ?? "";

    const tagMatch = usefulSourceLine.match(
      // eslint-disable-next-line regexp/no-unused-capturing-group
      /@default(Value)? (\[.*]|{.*}|\(.*\)|'.*'|".*"|`.*`| \w+)( ((?!\*\/).+))?/,
    );
    const tagValue = tagMatch?.[2] ?? "";
    const tagDescription = tagMatch?.[4] ?? "";

    if (tagMatch) {
      type = tagValue;
      name = "";
      description = tagDescription;
    }
  } else if (optional) {
    if (name) {
      name = default_ ? `[${name}=${default_}]` : `[${name}]`;
    } else {
      type = `${type} | undefined`;
    }
  }

  return {
    ...rest,
    tag,
    name,
    description,
    optional,
    type,
    source,
    default: default_,
  };
}
