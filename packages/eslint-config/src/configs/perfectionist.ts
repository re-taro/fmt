import type { OptionsPerfectionist, TypedFlatConfigItem } from "../types";
import { pluginPerfectionist } from "../plugins";
import { GLOB_JSX, GLOB_TSX } from "../globs";

/**
 * Optional perfectionist plugin for props and items sorting.
 *
 * @see https://github.com/azat-io/eslint-plugin-perfectionist
 */
export async function perfectionist(options: OptionsPerfectionist = {}): Promise<TypedFlatConfigItem[]> {
	const configs: TypedFlatConfigItem[] = [
		{
			name: "re-taro/perfectionist/setup",
			plugins: {
				perfectionist: pluginPerfectionist,
			},
		},
		{
			name: "re-taro/perfectionist/rules",
			rules: {
				"perfectionist/sort-array-includes": [
					"error",
					{
						type: "natural",
					},
				],
				"perfectionist/sort-enums": [
					"error",
					{
						type: "natural",
					},
				],
				"perfectionist/sort-exports": [
					"error",
					{
						type: "natural",
					},
				],
				"perfectionist/sort-interfaces": [
					"error",
					{
						groupKind: "required-first",
						type: "natural",
					},
				],
				"perfectionist/sort-intersection-types": [
					"error",
					{
						type: "natural",
					},
				],
				"perfectionist/sort-named-exports": [
					"error",
					{
						groupKind: "types-first",
						type: "natural",
					},
				],
				"perfectionist/sort-object-types": [
					"error",
					{
						groupKind: "required-first",
						type: "natural",
					},
				],
				"perfectionist/sort-objects": [
					"error",
					{
						type: "natural",
					},
				],
				"perfectionist/sort-switch-case": [
					"error",
					{
						type: "natural",
					},
				],
				"perfectionist/sort-union-types": [
					"error",
					{
						groups: [
							"named",
							"intersection",
							"union",
							"conditional",
							"function",
							"object",
							"import",
							"operator",
							"literal",
							"keyword",
							"tuple",
							"unknown",
							"nullish",
						],
						type: "natural",
					},
				],
			},
		},
	];

	if (options.jsx) {
		configs.push({
			files: [GLOB_TSX, GLOB_JSX],
			name: "re-taro/perfectionist/jsx",
			rules: {
				"perfectionist/sort-jsx-props": [
					"error",
					{
						groups: ["multiline", "shorthand"],
						type: "natural",
					},
				],
			},
		});
	}

	return configs;
}
