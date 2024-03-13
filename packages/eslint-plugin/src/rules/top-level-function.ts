import { createEslintRule } from "../utils";

const RULE_NAME = "top-level-function";
type MessageIds = "topLevelFunctionDeclaration";
type Options = [];

const rule = createEslintRule<Options, MessageIds>({
	create: (context) => {
		return {
			VariableDeclaration(node) {
				if (
					node.parent.type !== "Program"
					&& node.parent.type !== "ExportNamedDeclaration"
				)
					return;

				if (node.declarations.length !== 1)
					return;

				if (node.kind !== "const")
					return;

				if (node.declare)
					return;

				const declaration = node.declarations[0];

				if (declaration.init?.type !== "ArrowFunctionExpression")
					return;

				if (declaration.id?.type !== "Identifier")
					return;

				if (declaration.id.typeAnnotation)
					return;

				if (
					declaration.init.body.type !== "BlockStatement"
					&& declaration.id?.loc.start.line === declaration.init?.body.loc.end.line
				)
					return;

				const arrowFn = declaration.init;
				const body = declaration.init.body;
				const id = declaration.id;

				context.report({
					fix(fixer) {
						const code = context.sourceCode.text;
						const textName = code.slice(id.range[0], id.range[1]);
						const textArgs = arrowFn.params.length
							? code.slice(
								arrowFn.params[0].range[0],
								arrowFn.params[arrowFn.params.length - 1].range[1],
							)
							: "";
						const textBody
							= body.type === "BlockStatement"
								? code.slice(body.range[0], body.range[1])
								: `{\n  return ${code.slice(body.range[0], body.range[1])}\n}`;
						const textGeneric = arrowFn.typeParameters
							? code.slice(
								arrowFn.typeParameters.range[0],
								arrowFn.typeParameters.range[1],
							)
							: "";
						const textTypeReturn = arrowFn.returnType
							? code.slice(
								arrowFn.returnType.range[0],
								arrowFn.returnType.range[1],
							)
							: "";
						const textAsync = arrowFn.async ? "async " : "";

						const final = `${textAsync}function ${textName} ${textGeneric}(${textArgs})${textTypeReturn} ${textBody}`;

						return fixer.replaceTextRange(
							[node.range[0], node.range[1]],
							final,
						);
					},
					loc: {
						end: body.loc.start,
						start: id.loc.start,
					},
					messageId: "topLevelFunctionDeclaration",
					node,
				});
			},
		};
	},
	defaultOptions: [],
	meta: {
		docs: {
			description:
				"Enforce top-level functions to be declared with function keyword",
			recommended: "stylistic",
		},
		fixable: "code",
		messages: {
			topLevelFunctionDeclaration:
				"Top-level functions should be declared with function keyword",
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

	const valids = [
		"function foo() {}",
		// allow arrow function inside function
		"function foo() { const bar = () => {} }",
		// allow arrow function when type is specified
		"const Foo: Bar = () => {}",
		// allow let/var
		"let foo = () => {}",
		// allow arrow function in as
		"const foo = (() => {}) as any",
		// allow iife
		";(() => {})()",
		// allow export default
		"export default () => {}",
		"export default defineConfig(() => {})",
		// allow one-line arrow function
		"const foo = (x, y) => x + y",
		"const foo = async (x, y) => x + y",
		"const foo = () => String(123)",
		"const foo = () => ({})",
	];

	const invalids = [
		[
			"const foo = (x, y) => \nx + y",
			"function foo (x, y) {\n  return x + y\n}",
		],
		[
			"const foo = (as: string, bar: number) => { return as + bar }",
			"function foo (as: string, bar: number) { return as + bar }",
		],
		[
			"const foo = <K, T extends Boolean>(as: string, bar: number): Omit<T, K> => \nas + bar",
			"function foo <K, T extends Boolean>(as: string, bar: number): Omit<T, K> {\n  return as + bar\n}",
		],
		["export const foo = () => {}", "export function foo () {}"],
		[
			"export const foo = () => \n({})",
			"export function foo () {\n  return {}\n}",
		],
		[
			"export const foo = async () => \n({})",
			"export async function foo () {\n  return {}\n}",
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
			errors: [{ messageId: "topLevelFunctionDeclaration" }],
			output: i[1],
		})),
		valid: valids,
	});
}
