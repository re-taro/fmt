import { isPackageExists } from "local-pkg";
import { GLOB_ASTRO, GLOB_ASTRO_TS, GLOB_CSS, GLOB_GRAPHQL, GLOB_HTML, GLOB_LESS, GLOB_MARKDOWN, GLOB_POSTCSS, GLOB_SCSS, GLOB_XML } from "../globs";
import type { VendoredPrettierOptions } from "../vendor/prettier-types";
import { ensurePackages, interopDefault, parserPlain } from "../utils";
import type { OptionsFormatters, StylisticConfig, TypedFlatConfigItem } from "../types";
import { pluginRetaro } from "../plugins";
import { StylisticConfigDefaults } from "./stylistic";

export async function formatters(
	options: OptionsFormatters | true = {},
	stylistic: StylisticConfig = {},
): Promise<TypedFlatConfigItem[]> {
	if (options === true) {
		options = {
			astro: isPackageExists("prettier-plugin-astro"),
			css: true,
			graphql: true,
			html: true,
			markdown: true,
			slidev: isPackageExists("@slidev/cli"),
			xml: isPackageExists("@prettier/plugin-xml"),
		};
	}

	await ensurePackages([
		"eslint-plugin-format",
		options.markdown && options.slidev ? "prettier-plugin-slidev" : undefined,
		options.astro ? "prettier-plugin-astro" : undefined,
		options.xml ? "@prettier/plugin-xml" : undefined,
	]);

	if (options.slidev && options.markdown !== true && options.markdown !== "prettier")
		throw new Error("`slidev` option only works when `markdown` is enabled with `prettier`");

	const {
		indent,
		quotes,
		semi,
	} = {
		...StylisticConfigDefaults,
		...stylistic,
	};

	const vendoredPrettierOptions: VendoredPrettierOptions = {
		endOfLine: "auto",
		semi,
		singleQuote: quotes === "single",
		tabWidth: typeof indent === "number" ? indent : 2,
		trailingComma: "all",
		useTabs: indent === "tab",
	};

	const prettierOptions: VendoredPrettierOptions = Object.assign(vendoredPrettierOptions, options.prettierOptions || {});

	const prettierXmlOptions = {
		xmlQuoteAttributes: "double",
		xmlSelfClosingSpace: true,
		xmlSortAttributesByKey: false,
		xmlWhitespaceSensitivity: "ignore",
	};

	const dprintOptions = Object.assign(
		{
			indentWidth: typeof indent === "number" ? indent : 2,
			quoteStyle: quotes === "single" ? "preferSingle" : "preferDouble",
			useTabs: indent === "tab",
		},
		options.dprintOptions || {},
	);

	const pluginFormat = await interopDefault(import("eslint-plugin-format"));

	const configs: TypedFlatConfigItem[] = [
		{
			name: "re-taro/formatter/setup",
			plugins: {
				"format": pluginFormat,
				"re-taro": pluginRetaro,
			},
		},
		{
			name: "re-taro/formatter/rules",
			rules: {
				"re-taro/no-import-promises-as": "error",
				"re-taro/no-negated-comparison": "error",
				"re-taro/no-useless-template-string": "error",
				"re-taro/pad-after-last-import": "error",
			},
		},
	];

	if (options.css) {
		configs.push(
			{
				files: [GLOB_CSS, GLOB_POSTCSS],
				languageOptions: {
					parser: parserPlain,
				},
				name: "re-taro/formatter/css",
				rules: {
					"format/prettier": [
						"error",
						{
							...prettierOptions,
							parser: "css",
						},
					],
				},
			},
			{
				files: [GLOB_SCSS],
				languageOptions: {
					parser: parserPlain,
				},
				name: "re-taro/formatter/scss",
				rules: {
					"format/prettier": [
						"error",
						{
							...prettierOptions,
							parser: "scss",
						},
					],
				},
			},
			{
				files: [GLOB_LESS],
				languageOptions: {
					parser: parserPlain,
				},
				name: "re-taro/formatter/less",
				rules: {
					"format/prettier": [
						"error",
						{
							...prettierOptions,
							parser: "less",
						},
					],
				},
			},
		);
	}

	if (options.html) {
		configs.push({
			files: [GLOB_HTML],
			languageOptions: {
				parser: parserPlain,
			},
			name: "re-taro/formatter/html",
			rules: {
				"format/prettier": [
					"error",
					{
						...prettierOptions,
						parser: "html",
					},
				],
			},
		});
	}

	if (options.xml) {
		configs.push({
			files: [GLOB_XML],
			languageOptions: {
				parser: parserPlain,
			},
			name: "re-taro/formatter/xml",
			rules: {
				"format/prettier": [
					"error",
					{
						...prettierXmlOptions,
						...prettierOptions,
						parser: "xml",
						plugins: [
							"@prettier/plugin-xml",
						],
					},
				],
			},
		});
	}

	if (options.markdown) {
		const formater = options.markdown === true
			? "prettier"
			: options.markdown;

		const GLOB_SLIDEV = !options.slidev
			? []
			: options.slidev === true
				? ["**/slides.md"]
				: options.slidev.files;

		configs.push({
			files: [GLOB_MARKDOWN],
			ignores: GLOB_SLIDEV,
			languageOptions: {
				parser: parserPlain,
			},
			name: "re-taro/formatter/markdown",
			rules: {
				[`format/${formater}`]: [
					"error",
					formater === "prettier"
						? {
								printWidth: 120,
								...prettierOptions,
								embeddedLanguageFormatting: "off",
								parser: "markdown",
							}
						: {
								...dprintOptions,
								language: "markdown",
							},
				],
			},
		});

		if (options.slidev) {
			configs.push({
				files: GLOB_SLIDEV,
				languageOptions: {
					parser: parserPlain,
				},
				name: "re-taro/formatter/slidev",
				rules: {
					"format/prettier": [
						"error",
						{
							printWidth: 120,
							...prettierOptions,
							embeddedLanguageFormatting: "off",
							parser: "slidev",
							plugins: [
								"prettier-plugin-slidev",
							],
						},
					],
				},
			});
		}
	}

	if (options.astro) {
		configs.push({
			files: [GLOB_ASTRO],
			languageOptions: {
				parser: parserPlain,
			},
			name: "re-taro/formatter/astro",
			rules: {
				"format/prettier": [
					"error",
					{
						...prettierOptions,
						parser: "astro",
						plugins: [
							"prettier-plugin-astro",
						],
					},
				],
			},
		});

		configs.push({
			files: [GLOB_ASTRO, GLOB_ASTRO_TS],
			name: "re-taro/formatter/astro/disables",
			rules: {
				"style/arrow-parens": "off",
				"style/block-spacing": "off",
				"style/comma-dangle": "off",
				"style/indent": "off",
				"style/no-multi-spaces": "off",
				"style/quotes": "off",
				"style/semi": "off",
			},
		});
	}

	if (options.graphql) {
		configs.push({
			files: [GLOB_GRAPHQL],
			languageOptions: {
				parser: parserPlain,
			},
			name: "re-taro/formatter/graphql",
			rules: {
				"format/prettier": [
					"error",
					{
						...prettierOptions,
						parser: "graphql",
					},
				],
			},
		});
	}

	return configs;
}
