import type { Config } from "../types";
import { require } from "../utils";

export function toml(): Config {
	return {
		plugins: [require.resolve("prettier-plugin-toml")],
	};
}
