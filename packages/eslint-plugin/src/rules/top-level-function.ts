import { createEslintRule } from "../utils"
import type { RuleModule } from "../utils"

export const RULE_NAME = "top-level-function"
export type MessageIds = "topLevelFunctionDeclaration"
export type Options = []

export const rule: RuleModule<Options> = createEslintRule<Options, MessageIds>({
	create: (context) => {
		return {
			VariableDeclaration(node) {
				if (node.parent.type !== "Program" && node.parent.type !== "ExportNamedDeclaration")
					return

				if (node.declarations.length !== 1)
					return
				if (node.kind !== "const")
					return
				if (node.declare)
					return

				const declaration = node.declarations[0]

				if (declaration.init?.type !== "ArrowFunctionExpression")
					return
				if (declaration.id?.type !== "Identifier")
					return
				if (declaration.id.typeAnnotation)
					return
				if (
					declaration.init.body.type !== "BlockStatement"
					&& declaration.id?.loc.start.line === declaration.init?.body.loc.end.line
				) {
					return
				}

				const arrowFn = declaration.init
				const body = declaration.init.body
				const id = declaration.id

				context.report({
					fix(fixer) {
						const code = context.sourceCode.text
						const textName = code.slice(id.range[0], id.range[1])
						const textArgs = arrowFn.params.length
							? code.slice(arrowFn.params[0].range[0], arrowFn.params[arrowFn.params.length - 1].range[1])
							: ""
						const textBody = body.type === "BlockStatement"
							? code.slice(body.range[0], body.range[1])
							: `{\n  return ${code.slice(body.range[0], body.range[1])}\n}`
						const textGeneric = arrowFn.typeParameters
							? code.slice(arrowFn.typeParameters.range[0], arrowFn.typeParameters.range[1])
							: ""
						const textTypeReturn = arrowFn.returnType
							? code.slice(arrowFn.returnType.range[0], arrowFn.returnType.range[1])
							: ""
						const textAsync = arrowFn.async ? "async " : ""

						const final = `${textAsync}function ${textName} ${textGeneric}(${textArgs})${textTypeReturn} ${textBody}`

						return fixer.replaceTextRange([node.range[0], node.range[1]], final)
					},
					loc: {
						end: body.loc.start,
						start: id.loc.start,
					},
					messageId: "topLevelFunctionDeclaration",
					node,
				})
			},
		}
	},
	defaultOptions: [],
	meta: {
		docs: {
			description: "Enforce top-level functions to be declared with function keyword",
			recommended: "stylistic",
		},
		fixable: "code",
		messages: {
			topLevelFunctionDeclaration: "Top-level functions should be declared with function keyword",
		},
		schema: [],
		type: "problem",
	},
	name: RULE_NAME,
})
