import { createRequire } from "node:module";

import type { Config } from "prettier";

const require = createRequire(import.meta.url);

const plugins = [
	...["curly-and-jsdoc", "pkgsort"].map((p) =>
		require.resolve(`@re-taro/prettier-plugin-${p}`),
	),
	...["astro", "toml"].map((p) => require.resolve(`prettier-plugin-${p}`)),
];

const config: Config = {
	useTabs: true,
	endOfLine: "lf",
	quoteProps: "preserve",
	trailingComma: "all",
	htmlWhitespaceSensitivity: "ignore",
	overrides: [
		{
			files: "*.html",
			options: {
				parser: "angular",
			},
		},
		{
			files: ["*.json", "*.json5", "*.jsonc", ".eslintrc"],
			options: {
				trailingComma: "none",
			},
		},
		...["package-lock.json", "pnpm-lock.yaml", ".yarn/**"].map((filename) => ({
			files: [filename],
			options: {
				requirePragma: true,
			},
		})),
	],
	plugins,

	// Plugin Options
	// JSDoc
	jsdocPreferCodeFences: true,
	jsdocCommentLineStrategy: "multiline",
	tsdoc: true,
};

export default config;

declare module "prettier" {
	interface Config {
		jsdocPreferCodeFences?: boolean;
		jsdocCommentLineStrategy?: "singleLine" | "multiline" | "keep";
		tsdoc?: boolean;
	}
}
