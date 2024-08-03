import { AST_NODE_TYPES } from "@typescript-eslint/types";

import type { RuleModule } from "../utils";
import { createEslintRule } from "../utils";

export const RULE_NAME = "no-negated-comparison";
export type MessageIds = "noNegatedComparison";
export type Options = [];

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

export const rule: RuleModule<Options> = createEslintRule<Options, MessageIds>({
	create: context => ({
		BinaryExpression(node) {
			const { left, operator, parent, right } = node;
			if (!parent) {
				return;
			}
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
