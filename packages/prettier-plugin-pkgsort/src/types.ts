import type { ParserOptions } from "prettier";
import type { Options } from "prettier-package-json";

type PkgsortOptions = {
	[K in keyof Options as `pkgsort${Capitalize<K & string>}`]?: Options[K];
};

export type PrettierOptions = ParserOptions & PkgsortOptions;
