import type { Config } from "../types";

export function base(): Config {
	return {
		endOfLine: "lf",
		htmlWhitespaceSensitivity: "ignore",
		quoteProps: "preserve",
		trailingComma: "all",
		useTabs: true,
	};
}
