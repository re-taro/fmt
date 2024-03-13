import type { Config } from "../types";

export function json(): Config {
	return {
		overrides: [
			{
				files: ["*.json", "*.json5", "*.jsonc", ".eslintrc"],
				options: {
					trailingComma: "none",
				},
			},
		],
	};
}
