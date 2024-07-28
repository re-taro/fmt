import { createEslintRule } from "../utils"
import type { RuleModule } from "../utils"

export const RULE_NAME = "import-dedupe"
export type MessageIds = "importDedupe"
export type Options = []

export const rule: RuleModule<Options> = createEslintRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: "problem",
		docs: {
			description: "Fix duplication in imports",
			recommended: "strict",
		},
		fixable: "code",
		schema: [],
		messages: {
			importDedupe: "Expect no duplication in imports",
		},
	},
	defaultOptions: [],
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
							node,
							loc: {
								start: n.loc.end,
								end: n.loc.start,
							},
							messageId: "importDedupe",
							fix(fixer) {
								const s = n.range[0]
								let e = n.range[1]
								if (context.sourceCode.text[e] === ",")
									e += 1
								return fixer.removeRange([s, e])
							},
						})
					}
					names.add(id)
				})
			},
		}
	},
})
