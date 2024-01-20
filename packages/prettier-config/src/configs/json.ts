import type { Config } from "../types";

export const json = (): Config => ({
	overrides: [
		{
			files: ["*.json", "*.json5", "*.jsonc", ".eslintrc"],
			options: {
				trailingComma: "none",
			},
		},
	],
});
