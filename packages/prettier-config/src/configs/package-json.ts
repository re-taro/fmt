import type { Config } from "../types";
import { require } from "../utils";

export const packageJson = (): Config => ({
	plugins: [require.resolve("prettier-plugin-pkgsort")],
});
