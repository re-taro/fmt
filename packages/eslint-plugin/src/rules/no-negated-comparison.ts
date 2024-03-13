import { AST_NODE_TYPES } from "@typescript-eslint/types";

import { createEslintRule } from "../utils";

const RULE_NAME = "no-negated-comparison";
type MessageIds = "noNegatedComparison";
type Options = [];

const negatedToPositive = {
	"!=": "==",
	"!==": "===",
	"<": ">=",
	"<=": ">",
	"==": "!=",
	"===": "!==",
	">": "<=",
	">=": "<",
} as const;
type Negatives = keyof typeof negatedToPositive;
const negatives = Object.keys(negatedToPositive) as Negatives[];

const rule = createEslintRule<Options, MessageIds>({
	create: context => ({
		BinaryExpression(node) {
			const { left, operator, parent, right } = node;
			if (!parent)
				return;

			if (
				negatives.includes(operator as any)
				&& parent.type === AST_NODE_TYPES.UnaryExpression // Is this necessary?
				&& parent.operator === "!"
			) {
				context.report({
					*fix(fixer) {
						const operatorRange = [left.range[1], right.range[0]] as const;
						const fixedOperator = negatedToPositive[operator as Negatives];
						yield fixer.replaceTextRange(operatorRange, fixedOperator);
						yield fixer.removeRange([parent.range[0], parent.range[0] + 1]);
					},
					messageId: "noNegatedComparison",
					node,
				});
			}
		},
	}),
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow negated comparison.",
			recommended: "stylistic",
		},
		fixable: "code",
		messages: {
			noNegatedComparison: "Expect no negated comparison.",
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

	const valid = ["a != b", "a !== b"];

	const invalid = [
		["!(a == b)", "(a!=b)"],
		["!(a === b)", "(a!==b)"],
		["!(a != b)", "(a==b)"],
		["!(a !== b)", "(a===b)"],
		["!(a < b)", "(a>=b)"],
		["!(a <= b)", "(a>b)"],
		["!(a > b)", "(a<=b)"],
		["!(a >= b)", "(a<b)"],
	];

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
			errors: [{ messageId: "noNegatedComparison" }],
			output: i[1],
		})),
		valid: valid.map(code => ({ code })),
	});
}
