import type { Rule } from "../utils";
import { createEslintRule } from "../utils";

const RULE_NAME = "import-dedupe";
type MessageIds = "importDedupe";
type Options = [];

const rule: Rule<Options, MessageIds> = createEslintRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: "problem",
		docs: {
			description: "Fix duplication in imports.",
			recommended: "recommended",
		},
		fixable: "code",
		schema: [],
		messages: {
			importDedupe: "Expect no duplication in imports.",
		},
	},
	defaultOptions: [],
	create: (context) => ({
		ImportDeclaration(node) {
			if (node.specifiers.length <= 1) {
				return;
			}

			const names = new Set<string>();
			for (const n of node.specifiers) {
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
							const start = n.range[0];
							let end = n.range[1];
							const nextToken = context.getSourceCode().getTokenAfter(n);
							if (nextToken && nextToken.value === ",") {
								end = nextToken.range[1];
							}

							return fixer.removeRange([start, end]);
						},
					});
				}
				names.add(id);
			}
		},
	}),
});

export default rule;

if (import.meta.vitest) {
	const { it } = import.meta.vitest;
	const { RuleTester } = await import("@typescript-eslint/utils/ts-eslint");

	const valid = ['import { a } from "foo";'];
	const invalid = [
		[
			'import { a, b, a, a, c, a , } from "foo";',
			'import { a, b,   c,  } from "foo";',
		],
	];

	it("runs", () => {
		const ruleTester = new RuleTester({
			parser: require.resolve("@typescript-eslint/parser"),
		});

		ruleTester.run(RULE_NAME, rule, {
			valid,
			invalid: invalid.map((i) => ({
				code: i[0],
				output: i[1],
				errors: [
					{ messageId: "importDedupe" },
					{ messageId: "importDedupe" },
					{ messageId: "importDedupe" },
				],
			})),
		});
	});
}
