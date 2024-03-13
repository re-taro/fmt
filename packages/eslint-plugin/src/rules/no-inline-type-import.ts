import { AST_NODE_TYPES } from "@typescript-eslint/types";

import { createEslintRule } from "../utils";

const RULE_NAME = "no-inline-type-import";
type MessageIds = "noInlineTypeImport";
type Options = [];

const rule = createEslintRule<Options, MessageIds>({
	create: (context) => {
		const sourceCode = context.sourceCode;

		return {
			ImportDeclaration: (node) => {
				const { specifiers } = node;
				const typeSpecifiers = specifiers.filter(
					s =>
						s.type === AST_NODE_TYPES.ImportSpecifier
						&& s.importKind === "type",
				);
				const valueSpecifiers = specifiers.filter(
					s =>
						s.type === AST_NODE_TYPES.ImportSpecifier
						&& s.importKind === "value",
				);
				const defaultImportSpecifier = specifiers.find(
					s => s.type === AST_NODE_TYPES.ImportDefaultSpecifier,
				);
				if (typeSpecifiers.length > 0 && valueSpecifiers.length > 0) {
					context.report({
						fix(fixer) {
							const typeSpecifiersText = typeSpecifiers
								.map(s => sourceCode.getText(s).replace("type ", ""))
								.join(", ");
							const valueSpecifiersText = valueSpecifiers
								.map(s => sourceCode.getText(s))
								.join(", ");
							const defaultImportSpecifierText = sourceCode.getText(
								defaultImportSpecifier,
							);
							const defaultAndValueSpecifiersText = defaultImportSpecifier
								? `import ${defaultImportSpecifierText}, { ${valueSpecifiersText} } from "${node.source.value}";`
								: `import { ${valueSpecifiersText} } from "${node.source.value}";`;
							const texts = [
								`import type { ${typeSpecifiersText} } from "${node.source.value}";`,
								defaultAndValueSpecifiersText,
							];

							return fixer.replaceText(node, texts.join("\n"));
						},
						messageId: "noInlineTypeImport",
						node,
					});
				}
				else if (typeSpecifiers.length > 0) {
					context.report({
						fix(fixer) {
							const typeSpecifiersText = typeSpecifiers
								.map(s => sourceCode.getText(s).replace("type ", ""))
								.join(", ");

							return fixer.replaceText(
								node,
								`import type { ${typeSpecifiersText} } from "${node.source.value}";`,
							);
						},
						messageId: "noInlineTypeImport",
						node,
					});
				}
			},
		};
	},
	defaultOptions: [],
	meta: {
		docs: {
			description: "Disallow inline type import.",
			recommended: "stylistic",
		},
		fixable: "code",
		messages: {
			noInlineTypeImport: "Expected no inline type import.",
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

	const valid = ["import type { a } from \"foo\";"];

	const invalid = [
		["import { type a } from \"foo\";", "import type { a } from \"foo\";"],
		[
			"import { type a, b } from \"foo\";",
			"import type { a } from \"foo\";\nimport { b } from \"foo\";",
		],
		[
			"import D, { type a, b } from \"foo\";",
			"import type { a } from \"foo\";\nimport D, { b } from \"foo\";",
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
		invalid: invalid.map(i => ({
			code: i[0],
			errors: [{ messageId: "noInlineTypeImport" }],
			output: i[1],
		})),
		valid: valid.map(code => ({ code })),
	});
}
