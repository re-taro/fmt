import type { OptionsStylistic, TypedFlatConfigItem } from "../types";
import { pluginImport, pluginRetaro } from "../plugins";
import { GLOB_DTS } from "../globs";

export async function imports(options: OptionsStylistic = {}): Promise<TypedFlatConfigItem[]> {
	const {
		stylistic = true,
	} = options;

	return [
		{
			name: "re-taro/imports/rules",
			plugins: {
				"import": pluginImport,
				"re-taro": pluginRetaro,
			},
			rules: {
				"import/first": "error",
				"import/no-duplicates": "error",
				"import/no-mutable-exports": "error",
				"import/no-named-default": "error",
				"import/no-self-import": "error",
				"import/no-webpack-loader-syntax": "error",
				"import/order": "error",

				...stylistic
					? {
							"import/newline-after-import": ["error", { count: 1 }],
						}
					: {},
			},
		},
		{
			files: [GLOB_DTS],
			name: "re-taro/imports/rules/dts",
			rules: {
				"import/no-duplicates": "off",
			},
		},
	];
}
