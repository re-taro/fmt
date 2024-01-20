import { isPackageExists } from "local-pkg";

import { astro, base, ignores, jsdoc, json, packageJson } from "./configs";
import type { Config, OptionsConfig } from "./types";
import { mergeConfig } from "./utils";

export function re_taro(
	options: OptionsConfig = {},
	userConfig: Config = {},
): Config {
	const { astro: enableAstro = isPackageExists("astro"), ignoreFiles = [] } =
		options;

	const configs: Config[] = [];

	configs.push(
		base(),
		packageJson(),
		json(),
		jsdoc(),
		ignores({ ignoreFiles }),
	);

	if (enableAstro) {
		configs.push(astro());
	}

	return mergeConfig(...configs, userConfig);
}
