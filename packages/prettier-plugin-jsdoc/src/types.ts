import type { ParserOptions } from "prettier";

export interface JsdocOptions {
  jsdocSpaces: number;
  jsdocPrintWidth?: number;
  jsdocDescriptionWithDot: boolean;
  jsdocDescriptionTag: boolean;
  jsdocVerticalAlignment: boolean;
  jsdocKeepUnParseAbleExampleIndent: boolean;
  /** @default "singleLine" */
  jsdocCommentLineStrategy: "singleLine" | "multiline" | "keep";
  jsdocSeparateReturnsFromParam: boolean;
  jsdocSeparateTagGroups: boolean;
  jsdocAddDefaultToDescription: boolean;
  jsdocCapitalizeDescription: boolean;
  jsdocPreferCodeFences: boolean;
  tsdoc: boolean;
  jsdocLineWrappingStyle: "greedy";
}

export interface AllOptions extends ParserOptions, JsdocOptions {}

interface LocationDetails {
  line: number;
  column: number;
}
interface Location {
  start: LocationDetails;
  end: LocationDetails;
}

export interface PrettierComment {
  type: "CommentBlock" | "Block";
  value: string;
  start: number;
  end: number;
  loc: Location;
}

export interface Token {
  type:
    | "CommentBlock"
    | "Block"
    | {
        label: string;
        keyword?: string;
        beforeExpr: boolean;
        startsExpr: boolean;
        rightAssociative: boolean;
        isLoop: boolean;
        isAssign: boolean;
        prefix: boolean;
        postfix: boolean;
        binop: null;
      };
  value: string;
  start: number;
  end: number;
  loc: Location;
}

export interface AST {
  start: number;
  end: number;
  loc: Location;
  errors: [];
  program: {
    type: "Program";
    start: number;
    end: number;
    loc: [];
    sourceType: "module";
    interpreter: null;
    body: [];
    directives: [];
  };
  comments: PrettierComment[];
  tokens: Token[];
}
