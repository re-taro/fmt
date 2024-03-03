import { TSESTree } from "@typescript-eslint/types";

import { createEslintRule } from "../utils";

const RULE_NAME = "require-async-with-await";
type MessageIds = "requireAsyncWithAwait";
type Options = [];

type FunctionNode =
	| TSESTree.FunctionExpression
	| TSESTree.FunctionDeclaration
	| TSESTree.ArrowFunctionExpression;

const rule = createEslintRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: "problem",
		docs: {
			description: "Require using async keyword with await.",
			recommended: "recommended",
		},
		fixable: "code",
		schema: [],
		messages: {
			requireAsyncWithAwait: "Expect using async keyword with await.",
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
				const node = functionNodeStack[functionNodeStack.length - 1];

				if (!node || node.async) {
					return;
				}

				let fixRange: TSESTree.Range | undefined;

				if (node.type === TSESTree.AST_NODE_TYPES.ArrowFunctionExpression) {
					fixRange = node.range;
				}

				if (
					node.type === TSESTree.AST_NODE_TYPES.FunctionDeclaration ||
					node.type === TSESTree.AST_NODE_TYPES.FunctionExpression
				) {
					if (
						node.parent.type === TSESTree.AST_NODE_TYPES.Property ||
						node.parent.type === TSESTree.AST_NODE_TYPES.MethodDefinition
					) {
						if (node.parent.kind === "method" || node.parent.kind === "init") {
							fixRange = node.parent.key.range;
						}
					} else {
						fixRange = node.range;
					}
				}

				if (fixRange) {
					context.report({
						node,
						messageId: "requireAsyncWithAwait",
						fix: (fixer) => fixer.insertTextBeforeRange(fixRange!, "async "),
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

	const valid = [
		"async () => { await 1; }",
		"async function a() { await 1; }",
		"class a { async a() { await 1; } }",
		"class a { static async a() { await 1; } }",
		"class a { constructor() { await 1; } }", // We don't handle constructor
		"class a { get a() { await 1; }; set a() { await 1; } }", // nor getters and setters
		"const a = { get a() { await 1; }, set a() { await 1; } }", // and inside an object
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
		["const a = { a() { await 1; } }", "const a = { async a() { await 1; } }"],
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
				errors: [{ messageId: "requireAsyncWithAwait" }],
			})),
		});
	});
}
