import { TSESTree } from "@typescript-eslint/types";

import type { Rule } from "../utils";
import { createEslintRule } from "../utils";

const RULE_NAME = "use-async-with-await";
type MessageIds = "useAsyncWithAwait";
type Options = [];

type FunctionNode =
  | TSESTree.FunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.ArrowFunctionExpression;

const rule: Rule<Options, MessageIds> = createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "Enforce using async keyword with await.",
      recommended: "recommended",
    },
    fixable: "code",
    schema: [],
    messages: {
      useAsyncWithAwait: "Expect using async keyword with await.",
    },
  },
  defaultOptions: [],
  create: (context) => {
    const functionNodeStack: FunctionNode[] = [];
    function setupNode(node: FunctionNode) {
      functionNodeStack.push(node);
    }
    function clearNode() {
      functionNodeStack.pop();
    }

    return {
      "FunctionExpression": setupNode,
      "FunctionExpression:exit": clearNode,
      "FunctionDeclaration": setupNode,
      "FunctionDeclaration:exit": clearNode,
      "ArrowFunctionExpression": setupNode,
      "ArrowFunctionExpression:exit": clearNode,
      AwaitExpression() {
        const closestFunctionNode =
          functionNodeStack[functionNodeStack.length - 1];
        if (!closestFunctionNode || closestFunctionNode.async) {
          return;
        }
        const node =
          closestFunctionNode.type ===
            TSESTree.AST_NODE_TYPES.FunctionExpression &&
          closestFunctionNode.parent?.type ===
            TSESTree.AST_NODE_TYPES.MethodDefinition
            ? closestFunctionNode.parent
            : closestFunctionNode;
        const fixRange =
          node.type === TSESTree.AST_NODE_TYPES.MethodDefinition
            ? node.key.range
            : node.range;
        context.report({
          node,
          messageId: "useAsyncWithAwait",
          fix: (fixer) => fixer.insertTextBeforeRange(fixRange, "async "),
        });
      },
    };
  },
});

export default rule;

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { RuleTester } = await import("@typescript-eslint/utils/ts-eslint");

  const valid = [
    "async () => { await 1; }",
    "async function a() { await 1; }",
    "class a { async a() { await 1; } }",
    "class a { static async a() { await 1; } }",
  ];

  const invalid = [
    ["() => { await 1; }", "async () => { await 1; }"],
    ["function a() { await 1; }", "async function a() { await 1; }"],
    [
      "() => { function a() { await 1; } }",
      "() => { async function a() { await 1; } }",
    ],
    ["() => { () => {}; await 1; }", "async () => { () => {}; await 1; }"],
    ["class a { a() { await 1; } }", "class a { async a() { await 1; } }"],
    [
      "class a { @foo a() { await 1; } }",
      "class a { @foo async a() { await 1; } }",
    ],
    [
      "class a { static a() { await 1; } }",
      "class a { static async a() { await 1; } }",
    ],
    [
      "class a { @foo static a() { await 1; } }",
      "class a { @foo static async a() { await 1; } }",
    ],
    [
      "class a { @foo static a() { await 1; } }",
      "class a { @foo static async a() { await 1; } }",
    ],
    [
      "class a { a = function a() { await 1; } }",
      "class a { a = async function a() { await 1; } }",
    ],
  ];

  it("runs", () => {
    const ruleTester = new RuleTester({
      parser: require.resolve("@typescript-eslint/parser"),
    });

    ruleTester.run(RULE_NAME, rule, {
      valid,
      invalid: invalid.map((i) => ({
        code: i[0] || "",
        output: i[1] || null,
        errors: [{ messageId: "useAsyncWithAwait" }],
      })),
    });
  });
}
