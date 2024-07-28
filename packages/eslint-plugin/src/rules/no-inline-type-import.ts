import { AST_NODE_TYPES } from "@typescript-eslint/types"
import { createEslintRule } from "../utils"
import type { RuleModule } from "../utils"

export const RULE_NAME = "no-inline-type-import"
export type MessageIds = "noInlineTypeImport"
export type Options = []

export const rule: RuleModule<Options> = createEslintRule<Options, MessageIds>({
	create: (context) => {
		const sourceCode = context.sourceCode

		return {
			ImportDeclaration: (node) => {
				const { specifiers } = node
				const typeSpecifiers = specifiers.filter(
					s =>
						s.type === AST_NODE_TYPES.ImportSpecifier
						&& s.importKind === "type",
				)
				const valueSpecifiers = specifiers.filter(
					s =>
						s.type === AST_NODE_TYPES.ImportSpecifier
						&& s.importKind === "value",
				)
				const defaultImportSpecifier = specifiers.find(
					s => s.type === AST_NODE_TYPES.ImportDefaultSpecifier,
				)
				if (typeSpecifiers.length > 0 && valueSpecifiers.length > 0) {
					context.report({
						fix(fixer) {
							const typeSpecifiersText = typeSpecifiers
								.map(s => sourceCode.getText(s).replace("type ", ""))
								.join(", ")
							const valueSpecifiersText = valueSpecifiers
								.map(s => sourceCode.getText(s))
								.join(", ")
							const defaultImportSpecifierText = sourceCode.getText(
								defaultImportSpecifier,
							)
							const defaultAndValueSpecifiersText = defaultImportSpecifier
								? `import ${defaultImportSpecifierText}, { ${valueSpecifiersText} } from "${node.source.value}";`
								: `import { ${valueSpecifiersText} } from "${node.source.value}";`
							const texts = [
								`import type { ${typeSpecifiersText} } from "${node.source.value}";`,
								defaultAndValueSpecifiersText,
							]

							return fixer.replaceText(node, texts.join("\n"))
						},
						messageId: "noInlineTypeImport",
						node,
					})
				}
				else if (typeSpecifiers.length > 0) {
					context.report({
						fix(fixer) {
							const typeSpecifiersText = typeSpecifiers
								.map(s => sourceCode.getText(s).replace("type ", ""))
								.join(", ")

							return fixer.replaceText(
								node,
								`import type { ${typeSpecifiersText} } from "${node.source.value}";`,
							)
						},
						messageId: "noInlineTypeImport",
						node,
					})
				}
			},
		}
	},
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow inline type import.",
			recommended: "stylistic",
		},
		fixable: "code",
		messages: {
			noInlineTypeImport: "Expected no inline type import.",
		},
		schema: [],
		type: "layout",
	},
	name: RULE_NAME,
})
