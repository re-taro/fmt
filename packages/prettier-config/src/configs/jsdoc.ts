import type { Config } from "../types";
import { require } from "../utils";

export const jsdoc = (): Config => ({
	plugins: [require.resolve("@re-taro/prettier-plugin-curly-and-jsdoc")],

	jsdocPreferCodeFences: true,
	jsdocCommentLineStrategy: "multiline",
	tsdoc: true,
});
