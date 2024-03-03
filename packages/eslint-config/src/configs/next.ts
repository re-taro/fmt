import { pluginNext } from "../plugins";
import type { ConfigItem, OptionsOverrides } from "../types";

export const next = ({ overrides }: OptionsOverrides = {}): ConfigItem[] => [
	{
		plugins: {
			next: pluginNext,
		},
	},
	{
		rules: {
			...overrides,
		},
	},
];
