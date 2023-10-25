import type { Rule } from "../utils";
import { createEslintRule } from "../utils";

const RULE_NAME = "no-import-promises-as";
type MessageIds = "noImportPromisesAs";
type Options = [];

const _POSSIBLE_IMPORT_SOURCES = ["dns", "fs", "readline", "stream"];
const POSSIBLE_IMPORT_SOURCES = [
  ..._POSSIBLE_IMPORT_SOURCES,
  ..._POSSIBLE_IMPORT_SOURCES.map((s) => `node:${s}`),
];

const rule: Rule<Options, MessageIds> = createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "Disallow import promises as.",
      recommended: "stylistic",
    },
    fixable: "code",
    schema: [],
    messages: {
      noImportPromisesAs: "Expect no import promises as.",
    },
  },
  defaultOptions: [],
  create: (context) => {
    const sourceCode = context.getSourceCode();
    const { text } = sourceCode;

    return {
      ImportDeclaration(node) {
        if (!POSSIBLE_IMPORT_SOURCES.includes(node.source.value)) {
          return;
        }
        const promisesSpecifier = node.specifiers.find(
          (s) =>
            s.type === "ImportSpecifier" &&
            s.imported.name === "promises" &&
            s.local.name !== "promises"
        );
        const as = promisesSpecifier?.local.name;
        if (!promisesSpecifier || !as) {
          return;
        }
        context.report({
          node,
          messageId: "noImportPromisesAs",
          *fix(fixer) {
            const s = promisesSpecifier.range[0];
            let e = promisesSpecifier.range[1];
            if (text[e] === ",") {
              e += 1;
            }

            yield fixer.removeRange([s, e]);
            yield fixer.insertTextAfter(
              node,
              `\nimport ${as} from "${node.source.value}/promises";`
            );
          },
        });
      },
    };
  },
});

export default rule;

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { RuleTester } = await import("@typescript-eslint/utils/ts-eslint");

  const valid = ['import { promises } from "fs";'];
  const invalid = [
    [
      'import { promises as fs } from "fs";',
      'import {  } from "fs";\nimport fs from "fs/promises";',
    ],
    [
      'import { promises as fs } from "node:fs";',
      'import {  } from "node:fs";\nimport fs from "node:fs/promises";',
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
        errors: [{ messageId: "noImportPromisesAs" }],
      })),
    });
  });
}
