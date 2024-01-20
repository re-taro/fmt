import type { Config } from "../types";
import { require } from "../utils";

export const toml = (): Config => ({
	plugins: [require.resolve("prettier-plugin-toml")],
});
