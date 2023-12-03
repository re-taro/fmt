import { GLOB_SVELTE } from "../globs";
import { parserSvelte, pluginSvelte } from "../plugins";
import type {
	ConfigItem,
	OptionsHasTypeScript,
	OptionsOverrides,
} from "../types";

export const svelte = ({
	overrides,
	typescript,
}: OptionsHasTypeScript & OptionsOverrides = {}): ConfigItem[] => [
	{
		plugins: {
			svelte: pluginSvelte,
		},
	},
	{
		files: GLOB_SVELTE,
		languageOptions: {
			parser: parserSvelte,
			parserOptions: {
				extraFileExtensions: [".svelte", ".svx"],
				parser: typescript ? "@typescript-eslint/parser" : undefined,
				sourceType: "module",
			},
		},
		processor: pluginSvelte.processors[".svelte"],
		rules: {
			// https://sveltejs.github.io/eslint-plugin-svelte/rules
			...(pluginSvelte.configs.base.overrides[0].rules as any),
			...(pluginSvelte.configs.recommended?.rules as any),

			...overrides,
		},
	},
];
