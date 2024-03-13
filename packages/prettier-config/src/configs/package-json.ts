import type { Config } from "../types";
import { require } from "../utils";

export function packageJson(): Config {
	return {
		plugins: [require.resolve("prettier-plugin-pkgsort")],
	};
}
