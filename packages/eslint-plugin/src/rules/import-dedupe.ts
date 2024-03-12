import { createEslintRule } from "../utils";

const RULE_NAME = "import-dedupe";
type MessageIds = "importDedupe";
type Options = [];

const rule = createEslintRule<Options, MessageIds>({
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
				if (node.specifiers.length <= 1) {
					return;
				}

				const names = new Set<string>();
				node.specifiers.forEach((n) => {
					const id = n.local.name;
					if (names.has(id)) {
						context.report({
							node,
							loc: {
								start: n.loc.end,
								end: n.loc.start,
							},
							messageId: "importDedupe",
							fix(fixer) {
								const s = n.range[0];
								let e = n.range[1];
								if (context.sourceCode.text[e] === ",") {
									e += 1;
								}
								return fixer.removeRange([s, e]);
							},
						});
					}
					names.add(id);
				});
			},
		};
	},
});

export default rule;

if (import.meta.vitest) {
	const { afterAll, it, describe } = import.meta.vitest;
	const { RuleTester } = await import("../vendor/rule-tester/src/RuleTester");

	const valids = ["import { a } from 'foo'"];
	const invalids = [
		[
			"import { a, b, a, a, c, a } from 'foo'",
			"import { a, b,   c,  } from 'foo'",
		],
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
			errors: [
				{ messageId: "importDedupe" },
				{ messageId: "importDedupe" },
				{ messageId: "importDedupe" },
			],
		})),
	});
}
