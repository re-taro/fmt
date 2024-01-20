import type { JsdocOptions } from "@re-taro/prettier-plugin-curly-and-jsdoc";
import type { Options as BaseOptions } from "prettier";

export interface Options extends BaseOptions, JsdocOptions {}

export interface Config extends Options {
	overrides?: {
		files: string | string[];
		excludeFiles?: string | string[];
		options?: Options;
	}[];
}

export interface OptionsConfig {
	/**
	 * Enable Astro support.
	 *
	 * @default auto-detect based on the dependencies
	 */
	astro?: boolean;

	/**
	 * Ignore files.
	 */
	ignoreFiles?: string[];
}

export interface OptionsIgnores {
	/**
	 * Ignore files.
	 */
	ignoreFiles?: string[];
}
