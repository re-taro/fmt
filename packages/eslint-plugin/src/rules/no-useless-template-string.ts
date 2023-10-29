import type { TSESTree } from "@typescript-eslint/types";

import type { Rule } from "../utils";
import { createEslintRule } from "../utils";

const RULE_NAME = "no-useless-template-string";
type MessageIds = "noUselessTemplateString";
type Options = [];

const rule: Rule<Options, MessageIds> = createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "No useless template string.",
      recommended: "stylistic",
    },
    fixable: "code",
    schema: [],
    messages: {
      noUselessTemplateString: "No useless template string.",
    },
  },
  defaultOptions: [],
  create: (context) => ({
    "TemplateLiteral:not(TaggedTemplateExpression > TemplateLiteral)"(
      node: TSESTree.TemplateLiteral,
    ) {
      const { quasis } = node;
      const isSafe = !quasis.some(
        ({ value: { raw } }) =>
          raw.includes('"') || raw.includes("'") || raw.includes("\n"),
      );
      if (node.expressions.length === 0 && isSafe) {
        context.report({
          node,
          messageId: "noUselessTemplateString",
          fix(fixer) {
            return fixer.replaceTextRange(
              node.range,
              `"${node.quasis[0].value.raw}"`,
            );
          },
        });
      }
    },
  }),
});

export default rule;

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { RuleTester } = await import("@typescript-eslint/utils/ts-eslint");

  const valid = [
    "const a = '1';",
    'const a = "1"',
    // eslint-disable-next-line no-template-curly-in-string
    "const a = `1${b}`",
    "String.raw`str`",
    '`""`',
    "`''`",
  ];
  const invalid = [["const a = `1`", 'const a = "1"']];

  it("runs", () => {
    const ruleTester = new RuleTester({
      parser: require.resolve("@typescript-eslint/parser"),
    });

    ruleTester.run(RULE_NAME, rule, {
      valid,
      invalid: invalid.map((i) => ({
        code: i[0],
        output: i[1],
        errors: [{ messageId: "noUselessTemplateString" }],
      })),
    });
  });
}