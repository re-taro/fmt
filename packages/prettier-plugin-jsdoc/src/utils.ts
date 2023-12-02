import BSearch from "binary-searching";
import type { Options, ParserOptions, Plugin } from "prettier";
import { format } from "prettier";

import { TAGS_DEFAULT } from "./roles";
import type { AllOptions, Token } from "./types";

const convertToModernType = (oldType: string): string =>
  withoutStrings(oldType, (type) => {
    type = type.trim();

    type = type.replace(/\.</g, "<");

    type = type.replace(/\*/g, " any ");

    type = type
      .replace(/^\?\s*(\w+)$/, "$1 | null")
      .replace(/^(\w+)\s*\?$/, "$1 | null");

    let changed = true;
    while (changed) {
      changed = false;
      type = type.replace(
        /(^|[^$\w\xA0-\uFFFF])Array\s*<((?:[^<>=]|=>|=(?!>)|<(?:[^<>=]|=>|=(?!>))+>)+)>/g,
        (_, prefix, inner) => {
          changed = true;

          return `${prefix}(${inner})[]`;
        },
      );
    }

    return type;
  });

/**
 * Given a valid TS type expression, this will replace all string literals in
 * the type with unique identifiers. The modified type expression will be passed
 * to the given map function. The unique identifiers in the output if the map
 * function will then be replaced with the original string literals.
 *
 * This allows the map function to do type transformations without worrying
 * about string literals.
 *
 * @param type
 * @param mapFn
 */
function withoutStrings(type: string, mapFn: (type: string) => string): string {
  const strings: string[] = [];
  let modifiedType = type.replace(
    /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/g,
    (m) => {
      strings.push(m);

      return `String$${strings.length - 1}$`;
    },
  );

  if (modifiedType.includes("`")) {
    return type;
  }

  modifiedType = mapFn(modifiedType);

  return modifiedType.replace(/String\$(\d+)\$/g, (_, index) => strings[index]);
}

async function formatType(type: string, options?: Options): Promise<string> {
  try {
    const TYPE_START = "type name = ";

    let pretty = type;

    let rest = false;
    if (pretty.startsWith("...")) {
      rest = true;
      pretty = `(${pretty.slice(3)})[]`;
    }

    pretty = await format(`${TYPE_START}${pretty}`, {
      ...options,
      parser: "typescript",
      plugins: [],
      filepath: "file.ts",
    });
    pretty = pretty.slice(TYPE_START.length);

    pretty = pretty
      .replace(/^\s*/g, "")
      .replace(/[;\n]*$/g, "")
      .replace(/^\|/g, "")
      .trim();

    if (rest) {
      pretty = `...${pretty.replace(/\[\s*\]$/, "")}`;
    }

    return pretty;
  } catch {
    return type;
  }
}

const numberOfAStringInString = (string: string, search: string | RegExp) =>
  (string.match(new RegExp(search, "g")) ?? []).length;

function addStarsToTheBeginningOfTheLines(
  originalComment: string,
  comment: string,
  options: AllOptions,
): string {
  if (
    (options.jsdocCommentLineStrategy === "singleLine" &&
      numberOfAStringInString(comment.trim(), "\n") === 0) ||
    (options.jsdocCommentLineStrategy === "keep" &&
      numberOfAStringInString(originalComment, "\n") === 0)
  ) {
    return `* ${comment.trim()} `;
  }

  return `*${comment.replace(/(?:\n(?!$))/g, "\n * ")}\n `;
}

function capitalizer(str: string): string {
  if (!str) {
    return str;
  }

  if (/^https?:\/\//i.test(str)) {
    return str;
  }

  if (str.startsWith("- ")) {
    return str.slice(0, 2) + capitalizer(str.slice(2));
  }

  return str[0].toUpperCase() + str.slice(1);
}

/**
 * Detects the line ends of the given text.
 *
 * If multiple line ends are used, the most common one will be returned.
 *
 * If the given text is a single line, "lf" will be returned.
 *
 * @param text
 */
function detectEndOfLine(text: string): "cr" | "crlf" | "lf" {
  const counter = {
    "\r": 0,
    "\r\n": 0,
    "\n": 0,
  };

  const lineEndPattern = /\r\n?|\n/g;
  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = lineEndPattern.exec(text))) {
    counter[m[0] as keyof typeof counter]++;
  }

  const cr = counter["\r"];
  const crlf = counter["\r\n"];
  const lf = counter["\n"];
  const max = Math.max(cr, crlf, lf);

  if (lf === max) {
    return "lf";
  } else if (crlf === max) {
    return "crlf";
  } else {
    return "cr";
  }
}

/**
 * Returns the index of a token within the given token array.
 *
 * This method uses binary search using the token location.
 *
 * @param tokens
 * @param token
 */
const findTokenIndex = (tokens: Token[], token: Token): number =>
  BSearch.eq(tokens, token, (a, b) =>
    a.loc.start.line === b.loc.start.line
      ? a.loc.start.column - b.loc.start.column
      : a.loc.start.line - b.loc.start.line,
  );

async function formatCode(
  result: string,
  beginningSpace: string,
  options: AllOptions,
): Promise<string> {
  const { printWidth, jsdocKeepUnParseAbleExampleIndent } = options;

  if (
    result
      .split("\n")
      .slice(1)
      .every((v) => !v.trim() || v.startsWith(beginningSpace))
  ) {
    result = result.replace(
      new RegExp(`\n${beginningSpace.replace(/[\t]/g, "[\\t]")}`, "g"),
      "\n",
    );
  }

  try {
    let formattedExample = "";
    const examplePrintWith = printWidth - 4;

    formattedExample = await (result.trim().startsWith("{")
      ? format(result || "", {
        ...options,
        parser: "json",
        printWidth: examplePrintWith,
      })
      : format(result || "", {
        ...options,
        printWidth: examplePrintWith,
      }));

    result = formattedExample.replace(/(^|\n)/g, `\n${beginningSpace}`);
  } catch {
    result = `\n${result
      .split("\n")
      .map(
        (l) =>
          `${beginningSpace}${jsdocKeepUnParseAbleExampleIndent ? l : l.trim()
          }`,
      )
      .join("\n")}\n`;

    result = result.replace(/^\n[\s]+\n/g, "\n");
  }

  return result;
}

function findPluginByParser(parserName: string, options: ParserOptions) {
  const tsPlugin = options.plugins.find(
    (plugin) =>
      typeof plugin === "object" &&
      (plugin as any).name &&
      plugin.parsers &&
      // eslint-disable-next-line no-prototype-builtins
      plugin.parsers.hasOwnProperty(parserName),
  ) as Plugin | undefined;

  return !tsPlugin ||
    (tsPlugin as any).name === "@re-taro/prettier-plugin-jsdoc" ||
    // eslint-disable-next-line no-prototype-builtins
    tsPlugin.parsers?.hasOwnProperty("jsdoc-parser")
    ? undefined
    : tsPlugin.parsers?.[parserName];
}

const isDefaultTag = (tag: string): boolean => TAGS_DEFAULT.includes(tag);

export {
  addStarsToTheBeginningOfTheLines,
  capitalizer,
  convertToModernType,
  detectEndOfLine,
  findPluginByParser,
  findTokenIndex,
  formatCode,
  formatType,
  isDefaultTag,
};
