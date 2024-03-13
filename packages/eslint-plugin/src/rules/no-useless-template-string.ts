import type { TSESTree } from "@typescript-eslint/types";

import { createEslintRule } from "../utils";

const RULE_NAME = "no-useless-template-string";
type MessageIds = "noUselessTemplateString";
type Options = [];

const rule = createEslintRule<Options, MessageIds>({
	create: context => ({
		"TemplateLiteral:not(TaggedTemplateExpression > TemplateLiteral)": function (
			node: TSESTree.TemplateLiteral,
		) {
			const { quasis } = node;
			const isSafe = !quasis.some(
				({ value: { raw } }) =>
					raw.includes("\"") || raw.includes("'") || raw.includes("\n"),
			);
			if (node.expressions.length === 0 && isSafe) {
				context.report({
					fix(fixer) {
						return fixer.replaceTextRange(
							node.range,
							`"${node.quasis[0].value.raw}"`,
						);
					},
					messageId: "noUselessTemplateString",
					node,
				});
			}
		},
	}),
	defaultOptions: [],
	meta: {
		docs: {
			description: "No useless template string.",
			recommended: "stylistic",
		},
		fixable: "code",
		messages: {
			noUselessTemplateString: "No useless template string.",
		},
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
});

export default rule;

if (import.meta.vitest) {
	const { afterAll, describe, it } = import.meta.vitest;
	const { RuleTester } = await import("../vendor/rule-tester/src/RuleTester");

	const valid = [
		"const a = '1';",
		"const a = \"1\"",
		// eslint-disable-next-line no-template-curly-in-string
		"const a = `1${b}`",
		"String.raw`str`",
		"`\"\"`",
		"`''`",
	];

	const invalid = [["const a = `1`", "const a = \"1\""]];

	RuleTester.afterAll = afterAll;
	RuleTester.it = it;
	RuleTester.itOnly = it.only;
	RuleTester.describe = describe;

	const ruleTester = new RuleTester({
		parser: require.resolve("@typescript-eslint/parser"),
	});

	ruleTester.run(RULE_NAME, rule as any, {
		invalid: invalid.map(i => ({
			code: i[0],
			errors: [{ messageId: "noUselessTemplateString" }],
			output: i[1],
		})),
		valid,
	});
}
