import type { Config } from "../types";

export function html(): Config {
	return {
		files: ["*.html"],
		options: {
			parser: "html",
		},
	};
}
