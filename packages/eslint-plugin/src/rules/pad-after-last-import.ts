import type { TSESTree } from "@typescript-eslint/types";

import { createEslintRule } from "../utils";

const RULE_NAME = "pad-after-last-import";
type MessageIds = "padAfterLastImport";
type Options = [];

const rule = createEslintRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: "problem",
		docs: {
			description: "Pad after the last import.",
			recommended: "stylistic",
		},
		fixable: "code",
		schema: [],
		messages: {
			padAfterLastImport: "Expected a blank line after the last import.",
		},
	},
	defaultOptions: [],
	create: (context) => {
		const sourceCode = context.sourceCode;
		let lastImportNode: TSESTree.ImportDeclaration | null = null;

		return {
			ImportDeclaration(node) {
				lastImportNode = node;
			},
			"Program:exit"() {
				if (lastImportNode) {
					const nextToken = sourceCode.getTokenAfter(lastImportNode);
					const firstCommentAfterTokenStartLine =
						sourceCode.getCommentsAfter(lastImportNode)[0]?.loc.start.line;
					const expectedLine = lastImportNode.loc.end.line + 1;
					const nextTokenStartLine = nextToken?.loc.start.line;

					if (
						nextToken &&
						// Workaround: Vue
						nextToken.value !== "</script>" &&
						(expectedLine === nextTokenStartLine ||
							expectedLine === firstCommentAfterTokenStartLine)
					) {
						context.report({
							node: lastImportNode,
							messageId: "padAfterLastImport",
							fix: (fixer) => fixer.insertTextAfter(lastImportNode!, "\n"),
						});
					}
				}
			},
		};
	},
});

export default rule;

if (import.meta.vitest) {
	const { afterAll, it, describe } = import.meta.vitest;
	const { RuleTester } = await import("../vendor/rule-tester/src/RuleTester");

	const valids = ['import a from "foo";\n\nconst b = 1;'];

	const invalids = [
		[
			'import a from "foo";\nconst b = 1;',
			'import a from "foo";\n\nconst b = 1;',
		],
		[
			'import a from "foo";\n// comment\nconst b = 1;',
			'import a from "foo";\n\n// comment\nconst b = 1;',
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
			errors: [{ messageId: "padAfterLastImport" }],
		})),
	});
}
