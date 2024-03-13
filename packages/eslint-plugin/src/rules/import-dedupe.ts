import { createEslintRule } from "../utils";

const RULE_NAME = "import-dedupe";
type MessageIds = "importDedupe";
type Options = [];

const rule = createEslintRule<Options, MessageIds>({
	create: (context) => {
		return {
			ImportDeclaration(node) {
				if (node.specifiers.length <= 1)
					return;

				const names = new Set<string>();
				node.specifiers.forEach((n) => {
					const id = n.local.name;
					if (names.has(id)) {
						context.report({
							fix(fixer) {
								const s = n.range[0];
								let e = n.range[1];
								if (context.sourceCode.text[e] === ",")
									e += 1;

								return fixer.removeRange([s, e]);
							},
							loc: {
								end: n.loc.start,
								start: n.loc.end,
							},
							messageId: "importDedupe",
							node,
						});
					}
					names.add(id);
				});
			},
		};
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
});

export default rule;

if (import.meta.vitest) {
	const { afterAll, describe, it } = import.meta.vitest;
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
		invalid: invalids.map(i => ({
			code: i[0],
			errors: [
				{ messageId: "importDedupe" },
				{ messageId: "importDedupe" },
				{ messageId: "importDedupe" },
			],
			output: i[1],
		})),
		valid: valids,
	});
}
