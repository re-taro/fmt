import { createRequire } from "node:module";

import type { Config } from "./types";

export const require = createRequire(import.meta.url);

export function mergeConfig(...configs: Config[]): Config {
	return configs.reduce<Config>(
		(acc, config) => ({
			...acc,
			...config,
			overrides: [...(acc.overrides ?? []), ...(config.overrides ?? [])],
			plugins: [...(acc.plugins ?? []), ...(config.plugins ?? [])],
		}),
		{},
	);
}
