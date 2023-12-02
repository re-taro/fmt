import type { Spec } from "comment-parser";

import { descriptionEndLine, formatDescription } from "./formatter";
import {
  TAGS_ORDER,
  TAGS_PEV_FORMATE_DESCRIPTION,
  TAGS_VERTICALLY_ALIGN_ABLE,
} from "./roles";
import {
  DESCRIPTION,
  EXAMPLE,
  PRIVATE_REMARKS,
  REMARKS,
  SPACE_TAG_DATA,
} from "./tags";
import type { AllOptions } from "./types";
import { formatCode, isDefaultTag } from "./utils";

async function stringify(
  { name, description, type, tag }: Spec,
  tagIndex: number,
  finalTagsArray: Spec[],
  options: AllOptions,
  maxTagTitleLength: number,
  maxTagTypeNameLength: number,
  maxTagNameLength: number,
): Promise<string> {
  let tagString = "\n";

  if (tag === SPACE_TAG_DATA.tag) {
    return tagString;
  }

  const {
    printWidth,
    jsdocSpaces,
    jsdocVerticalAlignment,
    jsdocDescriptionTag,
    tsdoc,
    useTabs,
    tabWidth,
    jsdocSeparateTagGroups,
  } = options;
  const gap = " ".repeat(jsdocSpaces);

  let tagTitleGapAdj = 0;
  let tagTypeGapAdj = 0;
  let tagNameGapAdj = 0;
  let descGapAdj = 0;

  if (jsdocVerticalAlignment && TAGS_VERTICALLY_ALIGN_ABLE.includes(tag)) {
    if (tag) tagTitleGapAdj += maxTagTitleLength - tag.length;
    else if (maxTagTitleLength) descGapAdj += maxTagTitleLength + gap.length;

    if (type) tagTypeGapAdj += maxTagTypeNameLength - type.length;
    else if (maxTagTypeNameLength)
      descGapAdj += maxTagTypeNameLength + gap.length;

    if (name) tagNameGapAdj += maxTagNameLength - name.length;
    else if (maxTagNameLength) descGapAdj = maxTagNameLength + gap.length;
  }

  const useTagTitle = tag !== DESCRIPTION || jsdocDescriptionTag;

  if (useTagTitle) {
    tagString += `@${tag}${" ".repeat(tagTitleGapAdj || 0)}`;
  }
  if (type) {
    function getUpdatedType() {
      if (!isDefaultTag(tag)) {
        return `{${type}}`;
      }

      if (type === "[]") return "[ ]";
      if (type === "{}") return "{ }";

      const isAnObject = (value: string): boolean =>
        /^{.*[A-z0-9_]+ ?:.*}$/.test(value);
      const fixObjectCommas = (objWithBrokenCommas: string): string =>
        objWithBrokenCommas.replace(/; ([A-z0-9_])/g, ", $1");

      if (isAnObject(type)) {
        return fixObjectCommas(type);
      }

      return type;
    }
    const updatedType = getUpdatedType();
    tagString += gap + updatedType + " ".repeat(tagTypeGapAdj);
  }
  if (name) tagString += `${gap}${name}${" ".repeat(tagNameGapAdj)}`;

  if (tag === EXAMPLE && !tsdoc) {
    const exampleCaption = description.match(
      /<caption>(?:[\s\S]*?)<\/caption>/i,
    );

    if (exampleCaption) {
      description = description.replace(exampleCaption[0], "");
      tagString = `${tagString} ${exampleCaption[0]}`;
    }

    const beginningSpace = useTabs ? "\t" : " ".repeat(tabWidth);
    const formattedExample = await formatCode(
      description,
      beginningSpace,
      options,
    );

    tagString += formattedExample
      .replace(
        new RegExp(
          `^\\n${beginningSpace
            .replace(/[\t]/g, "[\\t]")
            .replace(/[^S\r\n]/g, "[^S\\r\\n]")}\\n`,
        ),
        "",
      )
      .trimEnd();
  } else if (description) {
    let descriptionString = "";
    if (useTagTitle) tagString += gap + " ".repeat(descGapAdj);
    if (
      TAGS_PEV_FORMATE_DESCRIPTION.includes(tag) ||
      !TAGS_ORDER.includes(tag)
    ) {
      descriptionString = description;
    } else {
      const [, firstWord] = /^\s*(\S+)/.exec(description) ?? ["", ""];

      const beginningSpace =
        tag === DESCRIPTION ||
        ([EXAMPLE, REMARKS, PRIVATE_REMARKS].includes(tag) && tsdoc)
          ? ""
          : "  ";

      // eslint-disable-next-line unicorn/prefer-ternary
      if (
        (tag !== DESCRIPTION &&
          tagString.length + firstWord.length > printWidth) ||
        [REMARKS, PRIVATE_REMARKS].includes(tag)
      ) {
        descriptionString = `\n${beginningSpace}${await formatDescription(
          tag,
          description,
          options,
          {
            beginningSpace,
          },
        )}`;
      } else {
        descriptionString = await formatDescription(tag, description, options, {
          tagStringLength: tagString.length - 1,
          beginningSpace,
        });
      }
    }

    if (jsdocSeparateTagGroups) {
      descriptionString = descriptionString.trimEnd();
    }

    tagString += descriptionString.startsWith("\n")
      ? descriptionString.replace(/^\n[\s]+\n/g, "\n")
      : descriptionString.trimStart();
  }

  tagString += descriptionEndLine({
    tag,
    isEndTag: tagIndex === finalTagsArray.length - 1,
  });

  return tagString;
}

export { stringify };
