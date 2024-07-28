import { createEslintRule } from "../utils"
import type { RuleModule } from "../utils"

export const RULE_NAME = "import-dedupe"
export type MessageIds = "importDedupe"
export type Options = []

export const rule: RuleModule<Options> = createEslintRule<Options, MessageIds>({
	create: (context) => {
		return {
			ImportDeclaration(node) {
				if (node.specifiers.length <= 1)
					return

				const names = new Set<string>()
				node.specifiers.forEach((n) => {
					const id = n.local.name
					if (names.has(id)) {
						context.report({
							fix(fixer) {
								const s = n.range[0]
								let e = n.range[1]
								if (context.sourceCode.text[e] === ",")
									e += 1
								return fixer.removeRange([s, e])
							},
							loc: {
								end: n.loc.start,
								start: n.loc.end,
							},
							messageId: "importDedupe",
							node,
						})
					}
					names.add(id)
				})
			},
		}
	},
	defaultOptions: [],
	meta: {
		docs: {
			description: "Fix duplication in imports",
			recommended: "strict",
		},
		fixable: "code",
		messages: {
			importDedupe: "Expect no duplication in imports",
		},
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
})
