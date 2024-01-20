import type { Config } from "../types";

export const html = (): Config => ({
	files: ["*.html"],
	options: {
		parser: "html",
	},
});
