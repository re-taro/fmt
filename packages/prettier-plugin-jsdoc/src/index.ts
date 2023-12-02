import type { Parser, ParserOptions, SupportOption } from "prettier";
import parserBabel from "prettier/plugins/babel";
import parserFlow from "prettier/plugins/flow";
import parserTypescript from "prettier/plugins/typescript";

import { getParser } from "./parser";
import type { JsdocOptions } from "./types";
import { findPluginByParser } from "./utils";

export const options = {
  jsdocSpaces: {
    name: "jsdocSpaces",
    type: "int",
    category: "jsdoc",
    default: 1,
    description: "How many spaces will be used to separate tag elements.",
  },
  jsdocDescriptionWithDot: {
    name: "jsdocDescriptionWithDot",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Should dot be inserted at the end of description",
  },
  jsdocDescriptionTag: {
    name: "jsdocDescriptionTag",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Should description tag be used",
  },
  jsdocVerticalAlignment: {
    name: "jsdocVerticalAlignment",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Should tags, types, names and description be aligned",
  },
  jsdocKeepUnParseAbleExampleIndent: {
    name: "jsdocKeepUnParseAbleExampleIndent",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description:
      "Should unParseAble example (pseudo code or no js code) keep its indentation",
  },
  jsdocCommentLineStrategy: {
    name: "jsdocCommentLineStrategy",
    type: "choice",
    choices: [
      {
        since: "1.1.0",
        value: "singleLine",
        description: "Should compact single line comment, if possible",
      },
      {
        since: "1.1.0",
        value: "multiline",
        description: "Should compact multi line comment",
      },
      {
        since: "1.1.0",
        value: "keep",
        description: "Should keep original line comment",
      },
    ],
    category: "jsdoc",
    default: "singleLine",
    description: "How comments line should be",
  },
  jsdocSeparateReturnsFromParam: {
    name: "jsdocSeparateReturnsFromParam",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Add an space between last @param and @returns",
  },
  jsdocSeparateTagGroups: {
    name: "jsdocSeparateTagGroups",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Add an space between tag groups",
  },
  jsdocCapitalizeDescription: {
    name: "jsdocCapitalizeDescription",
    type: "boolean",
    category: "jsdoc",
    default: true,
    description: "Should capitalize first letter of description",
  },
  tsdoc: {
    name: "tsdoc",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: "Should format as tsdoc",
  },
  jsdocPrintWidth: {
    name: "jsdocPrintWidth",
    type: "int",
    category: "jsdoc",
    default: undefined as any,
    description:
      "If You don't set value to jsdocPrintWidth, the printWidth will be use as jsdocPrintWidth.",
  },
  jsdocAddDefaultToDescription: {
    name: "jsdocAddDefaultToDescription",
    type: "boolean",
    category: "jsdoc",
    default: true,
    description: "Add Default value of a param to end description",
  },
  jsdocPreferCodeFences: {
    name: "jsdocPreferCodeFences",
    type: "boolean",
    category: "jsdoc",
    default: false,
    description: `Prefer to render code blocks using "fences" (triple backticks). If not set, blocks without a language tag will be rendered with a four space indentation.`,
  },
  jsdocLineWrappingStyle: {
    name: "jsdocLineWrappingStyle",
    type: "choice",
    choices: [
      {
        since: "0.3.39",
        value: "greedy",
        description: "Lines wrap as soon as they reach the print width",
      },
    ],
    category: "jsdoc",
    default: "greedy",
    description:
      "Strategy for wrapping lines for the given print width. More options may be added in the future.",
  },
} satisfies Record<keyof JsdocOptions, SupportOption>;

export const defaultOptions: JsdocOptions = {
  jsdocSpaces: options.jsdocSpaces.default,
  jsdocPrintWidth: options.jsdocPrintWidth.default as unknown as undefined,
  jsdocDescriptionWithDot: options.jsdocDescriptionWithDot.default as boolean,
  jsdocDescriptionTag: options.jsdocDescriptionTag.default as boolean,
  jsdocVerticalAlignment: options.jsdocVerticalAlignment.default as boolean,
  jsdocKeepUnParseAbleExampleIndent: options.jsdocKeepUnParseAbleExampleIndent
    .default as boolean,
  jsdocCommentLineStrategy: options.jsdocCommentLineStrategy
    .default as "singleLine",
  jsdocSeparateReturnsFromParam: options.jsdocSeparateReturnsFromParam
    .default as boolean,
  jsdocSeparateTagGroups: options.jsdocSeparateTagGroups.default as boolean,
  jsdocCapitalizeDescription: options.jsdocCapitalizeDescription
    .default as boolean,
  jsdocAddDefaultToDescription: options.jsdocAddDefaultToDescription
    .default as boolean,
  jsdocPreferCodeFences: options.jsdocPreferCodeFences.default as boolean,
  tsdoc: options.tsdoc.default as boolean,
  jsdocLineWrappingStyle: options.jsdocLineWrappingStyle.default as "greedy",
};

export const parsers = {
  // JS - Babel
  get babel() {
    const parser = parserBabel.parsers.babel;

    return mergeParsers(parser, "babel");
  },
  get "babel-flow"() {
    const parser = parserBabel.parsers["babel-flow"];

    return mergeParsers(parser, "babel-flow");
  },
  get "babel-ts"() {
    const parser = parserBabel.parsers["babel-ts"];

    return mergeParsers(parser, "babel-ts");
  },
  // JS - Flow
  get flow() {
    const parser = parserFlow.parsers.flow;

    return mergeParsers(parser, "flow");
  },
  // JS - TypeScript
  get typescript(): Parser {
    const parser = parserTypescript.parsers.typescript;

    return mergeParsers(parser, "typescript");
    // require("./parser-typescript").parsers.typescript;
  },
  get "jsdoc-parser"() {
    // Backward compatible, don't use this in new version since 1.0.0
    const parser = parserBabel.parsers["babel-ts"];

    return mergeParsers(parser, "babel-ts");
  },
};

function mergeParsers(originalParser: Parser, parserName: string) {
  const jsDocParse = getParser(originalParser.parse, parserName) as any;

  const parser = {
    ...originalParser,
    preprocess: jsDocPreprocess,
    parse: jsDocParse,
  };

  function jsDocPreprocess(text: string, options: ParserOptions) {
    const tsPluginParser = findPluginByParser(parserName, options);

    if (!tsPluginParser) {
      return originalParser.preprocess
        ? originalParser.preprocess(text, options)
        : text;
    }

    const preprocess = tsPluginParser.preprocess ?? originalParser.preprocess;

    Object.assign(parser, {
      ...parser,
      ...tsPluginParser,
      preprocess: jsDocPreprocess,
      parse: jsDocParse,
    });

    return preprocess ? preprocess(text, options) : text;
  }

  return parser;
}
export type Options = Partial<JsdocOptions>;
