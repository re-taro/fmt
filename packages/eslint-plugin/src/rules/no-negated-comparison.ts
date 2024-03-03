import { AST_NODE_TYPES } from "@typescript-eslint/types";

import { createEslintRule } from "../utils";

const RULE_NAME = "no-negated-comparison";
type MessageIds = "noNegatedComparison";
type Options = [];

const negatedToPositive = {
	"==": "!=",
	"===": "!==",
	"!=": "==",
	"!==": "===",
	"<": ">=",
	"<=": ">",
	">": "<=",
	">=": "<",
} as const;
type Negatives = keyof typeof negatedToPositive;
const negatives = Object.keys(negatedToPositive) as Negatives[];

const rule = createEslintRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: "problem",
		docs: {
			description: "Disallow negated comparison.",
			recommended: "stylistic",
		},
		fixable: "code",
		schema: [],
		messages: {
			noNegatedComparison: "Expect no negated comparison.",
		},
	},
	defaultOptions: [],
	create: (context) => ({
		BinaryExpression(node) {
			const { parent, left, right, operator } = node;
			if (!parent) {
				return;
			}
			if (
				negatives.includes(operator as any) &&
				parent.type === AST_NODE_TYPES.UnaryExpression && // Is this necessary?
				parent.operator === "!"
			) {
				context.report({
					node,
					messageId: "noNegatedComparison",
					*fix(fixer) {
						const operatorRange = [left.range[1], right.range[0]] as const;
						const fixedOperator = negatedToPositive[operator as Negatives];
						yield fixer.replaceTextRange(operatorRange, fixedOperator);
						yield fixer.removeRange([parent.range[0], parent.range[0] + 1]);
					},
				});
			}
		},
	}),
});

export default rule;

if (import.meta.vitest) {
	const { it } = import.meta.vitest;
	const { RuleTester } = await import("@typescript-eslint/utils/ts-eslint");

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

	it("runs", () => {
		const ruleTester = new RuleTester({
			parser: require.resolve("@typescript-eslint/parser"),
		});

		ruleTester.run(RULE_NAME, rule, {
			valid,
			invalid: invalid.map((i) => ({
				code: i[0],
				output: i[1],
				errors: [{ messageId: "noNegatedComparison" }],
			})),
		});
	});
}
