import { createRequire } from "node:module";

import type { Config } from "./types";

export const require = createRequire(import.meta.url);

export const mergeConfig = (...configs: Config[]): Config =>
	configs.reduce<Config>(
		(acc, config) => ({
			...acc,
			...config,
			overrides: [...(acc.overrides ?? []), ...(config.overrides ?? [])],
			plugins: [...(acc.plugins ?? []), ...(config.plugins ?? [])],
		}),
		{},
	);
