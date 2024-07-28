import type { FlatGitignoreOptions } from "eslint-config-flat-gitignore";
import type { ParserOptions } from "@typescript-eslint/parser";
import type { Options as VueBlocksOptions } from "eslint-processor-vue-blocks";
import type { Linter } from "eslint";
import type { StylisticCustomizeOptions } from "@stylistic/eslint-plugin";
import type { VendoredPrettierOptions } from "./vendor/prettier-types";
import type { ConfigNames, RuleOptions } from "./typegen";

export type Awaitable<T> = Promise<T> | T;

export type Rules = RuleOptions;

export type { ConfigNames };

export type TypedFlatConfigItem = {
	// Relax plugins type limitation, as most of the plugins did not have correct type info yet.
	/**
	 * An object containing a name-value mapping of plugin names to plugin objects. When `files` is specified, these plugins are only available to the matching files.
	 *
	 * @see [Using plugins in your configuration](https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#using-plugins-in-your-configuration)
	 */
	plugins?: Record<string, any>;
} & Omit<Linter.Config<Linter.RulesRecord & Rules>, "plugins">;

export interface OptionsFiles {
	/**
	 * Override the `files` option to provide custom globs.
	 */
	files?: string[];
}

export interface OptionsVue extends OptionsOverrides {
	/**
	 * Create virtual files for Vue SFC blocks to enable linting.
	 *
	 * @see https://github.com/antfu/eslint-processor-vue-blocks
	 * @default true
	 */
	sfcBlocks?: VueBlocksOptions | boolean;

	/**
	 * Vue version. Apply different rules set from `eslint-plugin-vue`.
	 *
	 * @default 3
	 */
	vueVersion?: 2 | 3;
}

export type OptionsTypescript =
  (OptionsOverrides & OptionsTypeScriptParserOptions)
  | (OptionsOverrides & OptionsTypeScriptWithTypes);

export interface OptionsFormatters {
	/**
	 * Enable formatting support for Astro.
	 *
	 * Currently only support Prettier.
	 */
	astro?: "prettier" | boolean;

	/**
	 * Enable formatting support for CSS, Less, Sass, and SCSS.
	 *
	 * Currently only support Prettier.
	 */
	css?: "prettier" | boolean;

	/**
	 * Custom options for dprint.
	 *
	 * By default it's controlled by our own config.
	 */
	dprintOptions?: boolean;

	/**
	 * Enable formatting support for GraphQL.
	 */
	graphql?: "prettier" | boolean;

	/**
	 * Enable formatting support for HTML.
	 *
	 * Currently only support Prettier.
	 */
	html?: "prettier" | boolean;

	/**
	 * Enable formatting support for Markdown.
	 *
	 * Support both Prettier and dprint.
	 *
	 * When set to `true`, it will use Prettier.
	 */
	markdown?: "dprint" | "prettier" | boolean;

	/**
	 * Custom options for Prettier.
	 *
	 * By default it's controlled by our own config.
	 */
	prettierOptions?: VendoredPrettierOptions;

	/**
	 * Install the prettier plugin for handle Slidev markdown
	 *
	 * Only works when `markdown` is enabled with `prettier`.
	 */
	slidev?: {
		files?: string[];
	} | boolean;

	/**
	 * Enable formatting support for XML.
	 *
	 * Currently only support Prettier.
	 */
	xml?: "prettier" | boolean;
}

export interface OptionsComponentExts {
	/**
	 * Additional extensions for components.
	 *
	 * @example ['vue']
	 * @default []
	 */
	componentExts?: string[];
}

export interface OptionsTypeScriptParserOptions {
	/**
	 * Glob patterns for files that should be type aware.
	 * @default ['**\/*.{ts,tsx}']
	 */
	filesTypeAware?: string[];

	/**
	 * Glob patterns for files that should not be type aware.
	 * @default ['**\/*.md\/**', '**\/*.astro/*.ts']
	 */
	ignoresTypeAware?: string[];

	/**
	 * Additional parser options for TypeScript.
	 */
	parserOptions?: Partial<ParserOptions>;
}

export interface OptionsTypeScriptWithTypes {
	/**
	 * When this options is provided, type aware rules will be enabled.
	 * @see https://typescript-eslint.io/linting/typed-linting/
	 */
	tsconfigPath?: string;
}

export interface OptionsHasTypeScript {
	typescript?: boolean;
}

export interface OptionsStylistic {
	stylistic?: StylisticConfig | boolean;
}

export interface StylisticConfig
	extends Pick<StylisticCustomizeOptions, "indent" | "jsx" | "quotes" | "semi"> {
}

export interface OptionsOverrides {
	overrides?: TypedFlatConfigItem["rules"];
}

export interface OptionsProjectType {
	/**
	 * Type of the project. `lib` will enable more strict rules for libraries.
	 *
	 * @default 'app'
	 */
	type?: "app" | "lib";
}

export interface OptionsRegExp {
	/**
	 * Override rulelevels
	 */
	level?: "error" | "warn";
}

export interface OptionsPerfectionist {
	astro?: boolean;
	jsx?: boolean;
	svelte?: boolean;
	vue?: boolean;
}

export interface OptionsIsInEditor {
	isInEditor?: boolean;
}

export interface OptionsUnoCSS extends OptionsOverrides {
	/**
	 * Enable attributify support.
	 * @default true
	 */
	attributify?: boolean;
	/**
	 * Enable strict mode by throwing errors about blocklisted classes.
	 * @default false
	 */
	strict?: boolean;
}

export interface OptionsConfig extends OptionsComponentExts, OptionsProjectType {
	/**
	 * Enable ASTRO support.
	 *
	 * Requires installing:
	 * - `eslint-plugin-astro`
	 *
	 * Requires installing for formatting .astro:
	 * - `prettier-plugin-astro`
	 *
	 * @default false
	 */
	astro?: OptionsOverrides | boolean;

	/**
	 * Automatically rename plugins in the config.
	 *
	 * @default true
	 */
	autoRenamePlugins?: boolean;

	/**
	 * Use external formatters to format files.
	 *
	 * Requires installing:
	 * - `eslint-plugin-format`
	 *
	 * When set to `true`, it will enable all formatters.
	 *
	 * @default false
	 */
	formatters?: OptionsFormatters | boolean;

	/**
	 * Enable gitignore support.
	 *
	 * Passing an object to configure the options.
	 *
	 * @see https://github.com/antfu/eslint-config-flat-gitignore
	 * @default true
	 */
	gitignore?: FlatGitignoreOptions | boolean;

	/**
	 * Control to disable some rules in editors.
	 * @default auto-detect based on the process.env
	 */
	isInEditor?: boolean;

	/**
	 * Core rules. Can't be disabled.
	 */
	javascript?: OptionsOverrides;

	/**
	 * Enable JSONC support.
	 *
	 * @default true
	 */
	jsonc?: OptionsOverrides | boolean;

	/**
	 * Enable JSX related rules.
	 *
	 * Currently only stylistic rules are included.
	 *
	 * @default true
	 */
	jsx?: boolean;

	/**
	 * Enable linting for **code snippets** in Markdown.
	 *
	 * For formatting Markdown content, enable also `formatters.markdown`.
	 *
	 * @default true
	 */
	markdown?: OptionsOverrides | boolean;

	/**
	 * Provide overrides for rules for each integration.
	 *
	 * @deprecated use `overrides` option in each integration key instead
	 */
	overrides?: {
		javascript?: TypedFlatConfigItem["rules"];
		jsonc?: TypedFlatConfigItem["rules"];
		markdown?: TypedFlatConfigItem["rules"];
		react?: TypedFlatConfigItem["rules"];
		stylistic?: TypedFlatConfigItem["rules"];
		svelte?: TypedFlatConfigItem["rules"];
		test?: TypedFlatConfigItem["rules"];
		toml?: TypedFlatConfigItem["rules"];
		typescript?: TypedFlatConfigItem["rules"];
		vue?: TypedFlatConfigItem["rules"];
		yaml?: TypedFlatConfigItem["rules"];
	};

	perfectionist?: OptionsPerfectionist;

	/**
	 * Enable react rules.
	 *
	 * @default auto-detect based on the dependencies
	 */
	react?: OptionsOverrides | boolean;

	/**
	 * Enable regexp rules.
	 *
	 * @see https://ota-meshi.github.io/eslint-plugin-regexp/
	 * @default true
	 */
	regexp?: (OptionsOverrides & OptionsRegExp) | boolean;

	/**
	 * Enable solid rules.
	 *
	 * Requires installing:
	 * - `eslint-plugin-solid`
	 *
	 * @default auto-detect based on the dependencies
	 */
	solid?: OptionsOverrides | boolean;
	/**
	 * Enable stylistic rules.
	 *
	 * @see https://eslint.style/
	 * @default true
	 */
	stylistic?: (OptionsOverrides & StylisticConfig) | boolean;

	/**
	 * Enable svelte rules.
	 *
	 * Requires installing:
	 * - `eslint-plugin-svelte`
	 *
	 * @default false
	 */
	svelte?: boolean;

	/**
	 * Enable test support.
	 *
	 * @default true
	 */
	test?: OptionsOverrides | boolean;

	/**
	 * Enable TOML support.
	 *
	 * @default true
	 */
	toml?: OptionsOverrides | boolean;

	/**
	 * Enable TypeScript support.
	 *
	 * Passing an object to enable TypeScript Language Server support.
	 *
	 * @default auto-detect based on the dependencies
	 */
	typescript?: OptionsTypescript | boolean;

	/**
	 * Enable unocss rules.
	 *
	 * Requires installing:
	 * - `@unocss/eslint-plugin`
	 *
	 * @default false
	 */
	unocss?: OptionsUnoCSS | boolean;

	/**
	 * Enable Vue support.
	 *
	 * Requires installing:
	 * - `eslint-plugin-vue`
	 * = `vue-eslint-parser`
	 * - `eslint-processor-vue-blocks`
	 *
	 * @default false
	 */
	vue?: OptionsVue | boolean;

	/**
	 * Enable YAML support.
	 *
	 * @default true
	 */
	yaml?: OptionsOverrides | boolean;
}
