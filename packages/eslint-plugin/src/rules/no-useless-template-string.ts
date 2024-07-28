import type { TSESTree } from "@typescript-eslint/types"
import { createEslintRule } from "../utils"
import type { RuleModule } from "../utils"

export const RULE_NAME = "no-useless-template-string"
export type MessageIds = "noUselessTemplateString"
export type Options = []

export const rule: RuleModule<Options> = createEslintRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: "problem",
		docs: {
			description: "No useless template string.",
			recommended: "stylistic",
		},
		fixable: "code",
		schema: [],
		messages: {
			noUselessTemplateString: "No useless template string.",
		},
	},
	defaultOptions: [],
	create: context => ({
		"TemplateLiteral:not(TaggedTemplateExpression > TemplateLiteral)": function (
			node: TSESTree.TemplateLiteral,
		) {
			const { quasis } = node
			const isSafe = !quasis.some(
				({ value: { raw } }) =>
					raw.includes("\"") || raw.includes("'") || raw.includes("\n"),
			)
			if (node.expressions.length === 0 && isSafe) {
				context.report({
					node,
					messageId: "noUselessTemplateString",
					fix(fixer) {
						return fixer.replaceTextRange(
							node.range,
							`"${node.quasis[0].value.raw}"`,
						)
					},
				})
			}
		},
	}),
})
