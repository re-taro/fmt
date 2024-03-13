import type { FlatConfigItem, OptionsStylistic } from "../types";
import { pluginImport, pluginRetaro } from "../plugins";

export async function imports(
	options: OptionsStylistic = {},
): Promise<FlatConfigItem[]> {
	const { stylistic = true } = options;

	return [
		{
			name: "re-taro:imports",
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
				"re-taro/import-dedupe": "error",
				"re-taro/no-inline-type-import": "error",
				"re-taro/pad-after-last-import": "error",

				...(stylistic
					? {
							"import/newline-after-import": [
								"error",
								{ considerComments: true, count: 1 },
							],
						}
					: {}),
			},
		},
	];
}
