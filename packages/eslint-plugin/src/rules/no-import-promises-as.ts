import type { RuleModule } from "../utils"
import { createEslintRule } from "../utils"

export const RULE_NAME = "no-import-promises-as"
export type MessageIds = "noImportPromisesAs"
export type Options = []

const _POSSIBLE_IMPORT_SOURCES = ["dns", "fs", "readline", "stream"]
const POSSIBLE_IMPORT_SOURCES = [
	..._POSSIBLE_IMPORT_SOURCES,
	..._POSSIBLE_IMPORT_SOURCES.map(s => `node:${s}`),
]

export const rule: RuleModule<Options> = createEslintRule<Options, MessageIds>({
	create: (context) => {
		const sourceCode = context.sourceCode
		const { text } = sourceCode

		return {
			ImportDeclaration(node) {
				if (!POSSIBLE_IMPORT_SOURCES.includes(node.source.value)) {
					return
				}
				const promisesSpecifier = node.specifiers.find(
					s =>
						s.type === "ImportSpecifier"
						&& s.imported.name === "promises"
						&& s.local.name !== "promises",
				)
				const as = promisesSpecifier?.local.name
				if (!promisesSpecifier || !as) {
					return
				}
				context.report({
					*fix(fixer) {
						const s = promisesSpecifier.range[0]
						let e = promisesSpecifier.range[1]
						if (text[e] === ",") {
							e += 1
						}

						yield fixer.removeRange([s, e])
						yield fixer.insertTextAfter(
							node,
							`\nimport ${as} from "${node.source.value}/promises";`,
						)
					},
					messageId: "noImportPromisesAs",
					node,
				})
			},
		}
	},
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow import promises as.",
			recommended: "stylistic",
		},
		fixable: "code",
		messages: {
			noImportPromisesAs: "Expect no import promises as.",
		},
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
})
