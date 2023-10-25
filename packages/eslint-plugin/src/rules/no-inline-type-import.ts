import { AST_NODE_TYPES } from "@typescript-eslint/types";

import type { Rule } from "../utils";
import { createEslintRule } from "../utils";

const RULE_NAME = "no-inline-type-import";
type MessageIds = "noInlineTypeImport";
type Options = [];

const rule: Rule<Options, MessageIds> = createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "layout",
    docs: {
      description: "Disallow inline type import.",
      recommended: "stylistic",
    },
    fixable: "code",
    schema: [],
    messages: {
      noInlineTypeImport: "Expected no inline type import.",
    },
  },
  defaultOptions: [],
  create: (context) => {
    const sourceCode = context.getSourceCode();

    return {
      ImportDeclaration: (node) => {
        const { specifiers } = node;
        const typeSpecifiers = specifiers.filter(
          (s) =>
            s.type === AST_NODE_TYPES.ImportSpecifier && s.importKind === "type"
        );
        const valueSpecifiers = specifiers.filter(
          (s) =>
            s.type === AST_NODE_TYPES.ImportSpecifier &&
            s.importKind === "value"
        );
        const defaultImportSpecifier = specifiers.find(
          (s) => s.type === AST_NODE_TYPES.ImportDefaultSpecifier
        );
        if (typeSpecifiers.length > 0 && valueSpecifiers.length > 0) {
          context.report({
            node,
            messageId: "noInlineTypeImport",
            fix(fixer) {
              const typeSpecifiersText = typeSpecifiers
                .map((s) => sourceCode.getText(s).replace("type ", ""))
                .join(", ");
              const valueSpecifiersText = valueSpecifiers
                .map((s) => sourceCode.getText(s))
                .join(", ");
              const defaultImportSpecifierText = sourceCode.getText(
                defaultImportSpecifier
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
          });
        } else if (typeSpecifiers.length > 0) {
          context.report({
            node,
            messageId: "noInlineTypeImport",
            fix(fixer) {
              const typeSpecifiersText = typeSpecifiers
                .map((s) => sourceCode.getText(s).replace("type ", ""))
                .join(", ");

              return fixer.replaceText(
                node,
                `import type { ${typeSpecifiersText} } from "${node.source.value}";`
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
  const { it } = import.meta.vitest;
  const { RuleTester } = await import("@typescript-eslint/utils/ts-eslint");

  const valid = ['import type { a } from "foo";'];
  const invalid = [
    ['import { type a } from "foo";', 'import type { a } from "foo";'],
    [
      'import { type a, b } from "foo";',
      'import type { a } from "foo";\nimport { b } from "foo";',
    ],
    [
      'import D, { type a, b } from "foo";',
      'import type { a } from "foo";\nimport D, { b } from "foo";',
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
        errors: [{ messageId: "noInlineTypeImport" }],
      })),
    });
  });
}
