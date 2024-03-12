import { createEslintRule } from "../utils";

const RULE_NAME = "if-newline";
type MessageIds = "missingIfNewline";
type Options = [];

const rule = createEslintRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: "layout",
		docs: {
			description: "Newline after if",
			recommended: "stylistic",
		},
		fixable: "whitespace",
		schema: [],
		messages: {
			missingIfNewline: "Expect newline after if",
		},
	},
	defaultOptions: [],
	create: (context) => {
		return {
			IfStatement(node) {
				if (!node.consequent) {
					return;
				}
				if (node.consequent.type === "BlockStatement") {
					return;
				}
				if (node.test.loc.end.line === node.consequent.loc.start.line) {
					context.report({
						node,
						loc: {
							start: node.test.loc.end,
							end: node.consequent.loc.start,
						},
						messageId: "missingIfNewline",
						fix(fixer) {
							return fixer.replaceTextRange(
								[node.consequent.range[0], node.consequent.range[0]],
								"\n",
							);
						},
					});
				}
			},
		};
	},
});

export default rule;

if (import.meta.vitest) {
	const { afterAll, it, describe } = import.meta.vitest;
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
		valid: valids,
		invalid: invalids.map((i) => ({
			code: i[0],
			output: i[1],
			errors: [{ messageId: "missingIfNewline" }],
		})),
	});
}
