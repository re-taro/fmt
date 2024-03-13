import type { Config } from "../types";
import { require } from "../utils";

export function astro(): Config {
	return {
		overrides: [
			{
				files: ["*.astro"],
				options: {
					parser: "astro",
				},
			},
		],

		plugins: [require.resolve("prettier-plugin-astro")],
	};
}
