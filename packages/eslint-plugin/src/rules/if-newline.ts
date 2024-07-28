import { createEslintRule } from "../utils";
import type { RuleModule } from "../utils";

export const RULE_NAME = "if-newline";
export type MessageIds = "missingIfNewline";
export type Options = [];

export const rule: RuleModule<Options> = createEslintRule<Options, MessageIds>({
	create: (context) => {
		return {
			IfStatement(node) {
				if (!node.consequent)
					return;
				if (node.consequent.type === "BlockStatement")
					return;
				if (node.test.loc.end.line === node.consequent.loc.start.line) {
					context.report({
						fix(fixer) {
							return fixer.replaceTextRange([node.consequent.range[0], node.consequent.range[0]], "\n");
						},
						loc: {
							end: node.consequent.loc.start,
							start: node.test.loc.end,
						},
						messageId: "missingIfNewline",
						node,
					});
				}
			},
		};
	},
	defaultOptions: [],
	meta: {
		docs: {
			description: "Newline after if",
			recommended: "stylistic",
		},
		fixable: "whitespace",
		messages: {
			missingIfNewline: "Expect newline after if",
		},
		schema: [],
		type: "layout",
	},
	name: RULE_NAME,
});
