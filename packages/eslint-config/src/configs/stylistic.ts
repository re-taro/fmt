import { interopDefault } from "../utils";
import type {
	FlatConfigItem,
	OptionsOverrides,
	StylisticConfig,
} from "../types";
import { pluginRetaro } from "../plugins";

export const StylisticConfigDefaults: StylisticConfig = {
	indent: "tab",
	jsx: true,
	quotes: "double",
	semi: true,
};

export async function stylistic(
	options: StylisticConfig & OptionsOverrides = {},
): Promise<FlatConfigItem[]> {
	const {
		indent,
		jsx,
		overrides = {},
		quotes,
		semi,
	} = {
		...StylisticConfigDefaults,
		...options,
	};

	const pluginStylistic = await interopDefault(
		import("@stylistic/eslint-plugin"),
	);

	const config = pluginStylistic.configs.customize({
		flat: true,
		indent,
		jsx,
		pluginName: "style",
		quotes,
		semi,
	});

	return [
		{
			name: "re-taro:stylistic",
			plugins: {
				"re-taro": pluginRetaro,
				"style": pluginStylistic,
			},
			rules: {
				...config.rules,

				"curly": ["error", "multi-or-nest", "consistent"],
				"re-taro/consistent-list-newline": "error",
				"re-taro/if-newline": "error",
				"re-taro/no-negated-comparison": "error",
				"re-taro/no-useless-template-string": "error",

				"re-taro/top-level-function": "error",

				...overrides,
			},
		},
	];
}
