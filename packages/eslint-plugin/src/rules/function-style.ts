import type { TSESTree } from "@typescript-eslint/types";
import { AST_NODE_TYPES } from "@typescript-eslint/types";
import type {
	InvalidTestCase,
	Scope,
} from "@typescript-eslint/utils/ts-eslint";

import type { Rule } from "../utils";
import { createEslintRule, getPreviousNode } from "../utils";

const RULE_NAME = "function-style";
type MessageIds = "arrow" | "declaration";
type Options = [];

const rule: Rule<Options, MessageIds> = createEslintRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: "problem",
		docs: {
			description: "Enforce function style.",
			recommended: "stylistic",
		},
		fixable: "code",
		schema: [],
		messages: {
			arrow: "Expected an arrow function shorthand.",
			declaration: "Expected a function declaration.",
		},
	},
	defaultOptions: [],
	create: (context) => {
		const sourceCode = context.getSourceCode();

		function getLoneReturnStatement(
			node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression,
		) {
			const { body } = node;
			if (body.type !== AST_NODE_TYPES.BlockStatement) {
				return;
			}
			const { body: blockBody } = body;
			const allComments = sourceCode.getCommentsInside(node);
			if (blockBody.length !== 1) {
				return;
			}
			const [statement] = blockBody;
			const statementComments = sourceCode.getCommentsInside(statement);
			if (allComments.length !== statementComments.length) {
				return;
			}
			if (statement?.type === AST_NODE_TYPES.ReturnStatement) {
				return statement;
			}
		}

		function generateFunction(
			type: "arrow",
			name: string | null,
			node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
			rawStatement: string,
			asVariable?: boolean,
		): string;
		function generateFunction(
			type: "declaration",
			name: string,
			node:
				| TSESTree.FunctionDeclaration
				| TSESTree.FunctionExpression
				| TSESTree.ArrowFunctionExpression,
		): string;
		function generateFunction(
			type: "arrow" | "declaration",
			name: string | null,
			node:
				| TSESTree.FunctionDeclaration
				| TSESTree.FunctionExpression
				| TSESTree.ArrowFunctionExpression,
			rawStatement?: string,
			asVariable = true,
		) {
			const async = node.async ? "async " : "";
			const generics = node.typeParameters
				? sourceCode.getText(node.typeParameters)
				: "";
			const params = node.params
				.map((param) => sourceCode.getText(param))
				.join(", ");
			const returnType = node.returnType
				? sourceCode.getText(node.returnType)
				: "";
			const body = sourceCode.getText(node.body);
			const variableDeclaration = asVariable && name ? `const ${name} = ` : "";

			return type === "arrow"
				? `${variableDeclaration}${async}${generics}(${params})${returnType} => ${rawStatement!};`
				: `${async}function ${name!}${generics}(${params})${returnType} ${body}`;
		}

		const scopeStack: Scope.Scope[] = [];
		let haveThisAccess = false;
		function setupScope() {
			scopeStack.push(context.getScope());
		}
		function clearThisAccess() {
			scopeStack.pop();
			haveThisAccess = false;
		}

		return {
			FunctionExpression: setupScope,
			"FunctionExpression:exit"(node: TSESTree.FunctionExpression) {
				if (
					(node.parent as any)?.id?.typeAnnotation ||
					node.parent?.type !== AST_NODE_TYPES.VariableDeclarator ||
					haveThisAccess
				) {
					clearThisAccess();

					return;
				}
				const name = (node.parent.id as any).name as string;
				context.report({
					node,
					messageId: "declaration",
					fix: (fixer) =>
						fixer.replaceText(
							node.parent.parent!,
							generateFunction("declaration", name, node),
						),
				});
				clearThisAccess();
			},
			"FunctionDeclaration:not(TSDeclareFunction + FunctionDeclaration)":
				setupScope,
			"FunctionDeclaration:not(TSDeclareFunction + FunctionDeclaration):exit"(
				node: TSESTree.FunctionDeclaration,
			) {
				if (haveThisAccess) {
					return;
				}
				const previousNode = getPreviousNode(node.parent);
				if (
					previousNode?.type === AST_NODE_TYPES.ExportNamedDeclaration &&
					previousNode.declaration?.type === AST_NODE_TYPES.TSDeclareFunction
				) {
					return;
				}
				const statement = getLoneReturnStatement(node);
				const isExportDefault =
					node.parent?.type === AST_NODE_TYPES.ExportDefaultDeclaration;
				if (
					!statement?.argument ||
					(!node.id?.name && !isExportDefault) ||
					node.generator
				) {
					clearThisAccess();

					return;
				}
				const returnVal = `(${sourceCode.getText(statement.argument)})`;
				context.report({
					node,
					messageId: "arrow",
					fix: (fixer) =>
						fixer.replaceText(
							node,
							generateFunction(
								"arrow",
								node.id?.name ?? null,
								node,
								returnVal,
								!isExportDefault,
							),
						),
				});
				clearThisAccess();
			},
			ArrowFunctionExpression: setupScope,
			"ArrowFunctionExpression:exit"(node: TSESTree.ArrowFunctionExpression) {
				if (haveThisAccess) {
					return;
				}
				const { body, parent } = node;
				const statement = getLoneReturnStatement(node);
				if (statement?.argument) {
					const returnVal = `(${sourceCode.getText(statement.argument)})`;
					context.report({
						node,
						messageId: "arrow",
						fix: (fixer) => fixer.replaceText(node.body, returnVal),
					});
				} else if (
					body.type === AST_NODE_TYPES.BlockStatement &&
					!(parent as any)?.id?.typeAnnotation
				) {
					const { body: blockBody } = body;
					if (
						blockBody.length > 0 &&
						node.parent?.parent?.type === AST_NODE_TYPES.VariableDeclaration
					) {
						const { parent: grandParent } = node.parent;
						context.report({
							node: grandParent,
							messageId: "declaration",
							fix: (fixer) =>
								fixer.replaceText(
									grandParent,
									generateFunction(
										"declaration",
										(node.parent as any).id.name,
										node,
									),
								),
						});
					}
				}
				clearThisAccess();
			},
			ThisExpression() {
				haveThisAccess = scopeStack.includes(context.getScope());
			},
		};
	},
});

export default rule;

if (import.meta.vitest) {
	const { it } = import.meta.vitest;
	const { RuleTester } = await import("@typescript-eslint/utils/ts-eslint");

	const valid = [
		"const a = () => 1;",
		`function a() {
      stuff;
      return 1;
    }`,
		`function a(some: Type)
    function a(some: Another)
    function a() {
      return 1;
    }`,
		`const a: Annotation = () => {
      stuff;
      return 1;
    };`,
		"function* a() {}",
		"const a = () => {}",
		"function a() {}",
		// This is fucking ugly but cannot be fixed
		"const a: Type = async function foo(): Returns {}",
		"const a = () => { a = this; return 1; }",
		"function a() { return this; }",
		"function a() { return () => this }",
		"const a = () => { foo; function a() { this; } }",
		`export function last(array: readonly []): undefined;
    export function last<T>(array: readonly T[]): T;
    export function last<T>(array: readonly T[]): T | undefined {
      return at(array, -1);
    }`,
		`export default function () {
    return
  }`,
		`function a() {
    return
  }`,
		"const a = () => { const b = () => { return this; }; return this; };",
		`function a() {
    // foo
    return 1
  }`,
	];

	const invalid: InvalidTestCase<MessageIds, []>[] = [
		{
			code: "const a = () => { return 1; };",
			output: "const a = () => (1);",
			errors: [{ messageId: "arrow" }],
		},
		{
			code: "const a = () => { stuff; return 1; };",
			output: "function a() { stuff; return 1; }",
			errors: [{ messageId: "declaration" }],
		},
		{
			code: "const a = () => { stuff; };",
			output: "function a() { stuff; }",
			errors: [{ messageId: "declaration" }],
		},
		{
			code: "const a = async () => { return 1; };",
			output: "const a = async () => (1);",
			errors: [{ messageId: "arrow" }],
		},
		{
			code: "const a = async () => { stuff; return 1; };",
			output: "async function a() { stuff; return 1; }",
			errors: [{ messageId: "declaration" }],
		},
		{
			code: "const a = async (): Promise<1> => { stuff; return 1; };",
			output: "async function a(): Promise<1> { stuff; return 1; }",
			errors: [{ messageId: "declaration" }],
		},
		{
			code: "const a: Some = async (): Type => { return 1; };",
			output: "const a: Some = async (): Type => (1);",
			errors: [{ messageId: "arrow" }],
		},
		{
			code: "async function a(): Type { return 1; }",
			output: "const a = async (): Type => (1);",
			errors: [{ messageId: "arrow" }],
		},
		{
			code: "const a = async function foo(): Returns {}",
			output: "async function a(): Returns {}",
			errors: [{ messageId: "declaration" }],
		},
		{
			code: `const a = () => {
        return {
          a: 1,
        };
      };`,
			output: `const a = () => ({
          a: 1,
        });`,
			errors: [{ messageId: "arrow" }],
		},
		{
			code: `export default function a() {
    return {};
  }`,
			output: "export default () => ({});",
			errors: [{ messageId: "arrow" }],
		},
		{
			code: `export default function() {
    return {};
  }`,
			output: "export default () => ({});",
			errors: [{ messageId: "arrow" }],
		},
		{
			code: `function foo() {
    return [
      // foo
    ];
  }`,
			output: `const foo = () => ([
      // foo
    ]);`,
			errors: [{ messageId: "arrow" }],
		},
		{
			code: "function foo() { return{} }",
			output: "const foo = () => ({});",
			errors: [{ messageId: "arrow" }],
		},
	];

	it("runs", () => {
		const ruleTester = new RuleTester({
			parser: require.resolve("@typescript-eslint/parser"),
		});

		ruleTester.run(RULE_NAME, rule, {
			valid,
			invalid,
		});
	});
}
