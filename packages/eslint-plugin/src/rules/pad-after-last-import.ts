import type { TSESTree } from "@typescript-eslint/types"
import { createEslintRule } from "../utils"
import type { RuleModule } from "../utils"

export const RULE_NAME = "pad-after-last-import"
export type MessageIds = "padAfterLastImport"
export type Options = []

export const rule: RuleModule<Options> = createEslintRule<Options, MessageIds>({
	create: (context) => {
		const sourceCode = context.sourceCode
		let lastImportNode: TSESTree.ImportDeclaration | null = null

		return {
			ImportDeclaration(node) {
				lastImportNode = node
			},
			"Program:exit": function () {
				if (lastImportNode) {
					const nextToken = sourceCode.getTokenAfter(lastImportNode)
					const firstCommentAfterTokenStartLine
						= sourceCode.getCommentsAfter(lastImportNode)[0]?.loc.start.line
					const expectedLine = lastImportNode.loc.end.line + 1
					const nextTokenStartLine = nextToken?.loc.start.line

					if (
						nextToken
						// Workaround: Vue
						&& nextToken.value !== "</script>"
						&& (expectedLine === nextTokenStartLine
						|| expectedLine === firstCommentAfterTokenStartLine)
					) {
						context.report({
							fix: fixer => fixer.insertTextAfter(lastImportNode!, "\n"),
							messageId: "padAfterLastImport",
							node: lastImportNode,
						})
					}
				}
			},
		}
	},
	defaultOptions: [],
	meta: {
		docs: {
			description: "Pad after the last import.",
			recommended: "stylistic",
		},
		fixable: "code",
		messages: {
			padAfterLastImport: "Expected a blank line after the last import.",
		},
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
})
