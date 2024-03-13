import { createEslintRule } from "../utils";

const RULE_NAME = "if-newline";
type MessageIds = "missingIfNewline";
type Options = [];

const rule = createEslintRule<Options, MessageIds>({
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
							return fixer.replaceTextRange(
								[node.consequent.range[0], node.consequent.range[0]],
								"\n",
							);
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

export default rule;

if (import.meta.vitest) {
	const { afterAll, describe, it } = import.meta.vitest;
	const { RuleTester } = await import("../vendor/rule-tester/src/RuleTester");

	const valids = [
		`if (true)
		console.log('hello')
	`,
		`if (true) {
		console.log('hello')
	}`,
	];
	const invalids = [
		["if (true) console.log('hello')", "if (true) \nconsole.log('hello')"],
	];

	RuleTester.afterAll = afterAll;
	RuleTester.it = it;
	RuleTester.itOnly = it.only;
	RuleTester.describe = describe;

	const ruleTester = new RuleTester({
		parser: require.resolve("@typescript-eslint/parser"),
	});

	ruleTester.run(RULE_NAME, rule as any, {
		invalid: invalids.map(i => ({
			code: i[0],
			errors: [{ messageId: "missingIfNewline" }],
			output: i[1],
		})),
		valid: valids,
	});
}
