import type { Config } from "../types";
import { require } from "../utils";

export const astro = (): Config => ({
	plugins: [require.resolve("prettier-plugin-astro")],

	overrides: [
		{
			files: ["*.astro"],
			options: {
				parser: "astro",
			},
		},
	],
});
