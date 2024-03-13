import type { Config } from "../types";
import { require } from "../utils";

export function jsdoc(): Config {
	return {
		jsdocCommentLineStrategy: "multiline",

		jsdocPreferCodeFences: true,
		plugins: [require.resolve("@re-taro/prettier-plugin-curly-and-jsdoc")],
		tsdoc: true,
	};
}
