import type { RuleFixer, RuleListener } from "@typescript-eslint/utils/ts-eslint";
import type { TSESTree } from "@typescript-eslint/utils";
import { createEslintRule } from "../utils";

const RULE_NAME = "consistent-list-newline";
type MessageIds = "shouldWrap" | "shouldNotWrap";
type Options = [{
	ArrayExpression?: boolean;
	ArrowFunctionExpression?: boolean;
	CallExpression?: boolean;
	ExportNamedDeclaration?: boolean;
	FunctionDeclaration?: boolean;
	FunctionExpression?: boolean;
	ImportDeclaration?: boolean;
	NewExpression?: boolean;
	ObjectExpression?: boolean;
	TSInterfaceDeclaration?: boolean;
	TSTupleType?: boolean;
	TSTypeLiteral?: boolean;
	TSTypeParameterDeclaration?: boolean;
	TSTypeParameterInstantiation?: boolean;
	ObjectPattern?: boolean;
	ArrayPattern?: boolean;
}];

const rule = createEslintRule<Options, MessageIds>({
	create: (context, [options = {}] = [{}]) => {
		function removeLines(fixer: RuleFixer, start: number, end: number) {
			const range = [start, end] as const;
			const code = context.sourceCode.text.slice(...range);
			return fixer.replaceTextRange(range, code.replace(/(\r\n|\n)/g, ""));
		}

		function check(
			node: TSESTree.Node,
			children: (TSESTree.Node | null)[],
			nextNode?: TSESTree.Node,
		) {
			const items = children.filter(Boolean) as TSESTree.Node[];
			if (items.length === 0)
				return;

			// Look for the opening bracket, we first try to get the first token of the parent node
			// and fallback to the token before the first item
			let startToken = ["CallExpression", "NewExpression"].includes(node.type)
				? undefined
				: context.sourceCode.getFirstToken(node);
			if (startToken?.type !== "Punctuator")
				startToken = context.sourceCode.getTokenBefore(items[0]);

			const endToken = context.sourceCode.getTokenAfter(items[items.length - 1]);
			const startLine = startToken!.loc.start.line;

			if (startToken!.loc.start.line === endToken!.loc.end.line)
				return;

			let mode: "inline" | "newline" | null = null;
			let lastLine = startLine;

			items.forEach((item, idx) => {
				if (mode == null) {
					mode = item.loc.start.line === lastLine ? "inline" : "newline";
					lastLine = item.loc.end.line;
					return;
				}

				const currentStart = item.loc.start.line;

				if (mode === "newline" && currentStart === lastLine) {
					context.report({
						data: {
							name: node.type,
						},
						*fix(fixer) {
							yield fixer.insertTextBefore(item, "\n");
						},
						messageId: "shouldWrap",
						node: item,
					});
				}
				else if (mode === "inline" && currentStart !== lastLine) {
					const lastItem = items[idx - 1];
					if (context.sourceCode.getCommentsBefore(item).length > 0)
						return;
					context.report({
						data: {
							name: node.type,
						},
						*fix(fixer) {
							yield removeLines(fixer, lastItem!.range[1], item.range[0]);
						},
						messageId: "shouldNotWrap",
						node: item,
					});
				}

				lastLine = item.loc.end.line;
			});

			const endRange = nextNode
				? Math.min(
					context.sourceCode.getTokenBefore(nextNode)!.range[0],
					node.range[1],
				)
				: node.range[1];
			const endLoc = context.sourceCode.getLocFromIndex(endRange);

			const lastItem = items[items.length - 1]!;
			if (mode === "newline" && endLoc.line === lastLine) {
				context.report({
					data: {
						name: node.type,
					},
					*fix(fixer) {
						yield fixer.insertTextAfter(lastItem, "\n");
					},
					messageId: "shouldWrap",
					node: lastItem,
				});
			}
			else if (mode === "inline" && endLoc.line !== lastLine) {
				// If there is only one multiline item, we allow the closing bracket to be on the a different line
				if (items.length === 1 && items[0].loc.start.line !== items[1]?.loc.start.line)
					return;
				if (context.sourceCode.getCommentsAfter(lastItem).length > 0)
					return;

				const content = context.sourceCode.text.slice(lastItem.range[1], endRange);
				if (content.includes("\n")) {
					context.report({
						data: {
							name: node.type,
						},
						*fix(fixer) {
							yield removeLines(fixer, lastItem.range[1], endRange);
						},
						messageId: "shouldNotWrap",
						node: lastItem,
					});
				}
			}
		}

		const listenser = {
			ArrayExpression: (node) => {
				check(node, node.elements);
			},
			ArrayPattern(node) {
				check(node, node.elements);
			},
			ArrowFunctionExpression: (node) => {
				if (node.params.length <= 1)
					return;
				check(
					node,
					node.params,
					node.returnType || node.body,
				);
			},
			CallExpression: (node) => {
				check(node, node.arguments);
			},
			ExportNamedDeclaration: (node) => {
				check(node, node.specifiers);
			},
			FunctionDeclaration: (node) => {
				check(
					node,
					node.params,
					node.returnType || node.body,
				);
			},
			FunctionExpression: (node) => {
				check(
					node,
					node.params,
					node.returnType || node.body,
				);
			},
			ImportDeclaration: (node) => {
				check(node, node.specifiers);
			},
			NewExpression: (node) => {
				check(node, node.arguments);
			},
			ObjectExpression: (node) => {
				check(node, node.properties);
			},
			ObjectPattern(node) {
				check(node, node.properties, node.typeAnnotation);
			},
			TSInterfaceDeclaration: (node) => {
				check(node, node.body.body);
			},
			TSTupleType: (node) => {
				check(node, node.elementTypes);
			},
			TSTypeLiteral: (node) => {
				check(node, node.members);
			},
			TSTypeParameterDeclaration(node) {
				check(node, node.params);
			},
			TSTypeParameterInstantiation(node) {
				check(node, node.params);
			},
		} satisfies RuleListener;

		type KeysListener = keyof typeof listenser;
		type KeysOptions = keyof Options[0];

		// Type assertion to check if all keys are exported
		exportType<KeysListener, KeysOptions>();
		exportType<KeysOptions, KeysListener>();

		(Object.keys(options) as KeysOptions[]).forEach((key) => {
			if (options[key] === false)
				delete listenser[key];
		});

		return listenser;
	},
	defaultOptions: [{}],
	meta: {
		docs: {
			description: "Having line breaks styles to object, array and named imports",
			recommended: "stylistic",
		},
		fixable: "whitespace",
		messages: {
			shouldNotWrap: "Should not have line breaks between items, in node {{name}}",
			shouldWrap: "Should have line breaks between items, in node {{name}}",
		},
		schema: [{
			additionalProperties: false,
			properties: {
				ArrayExpression: { type: "boolean" },
				ArrayPattern: { type: "boolean" },
				ArrowFunctionExpression: { type: "boolean" },
				CallExpression: { type: "boolean" },
				ExportNamedDeclaration: { type: "boolean" },
				FunctionDeclaration: { type: "boolean" },
				FunctionExpression: { type: "boolean" },
				ImportDeclaration: { type: "boolean" },
				NewExpression: { type: "boolean" },
				ObjectExpression: { type: "boolean" },
				ObjectPattern: { type: "boolean" },
				TSInterfaceDeclaration: { type: "boolean" },
				TSTupleType: { type: "boolean" },
				TSTypeLiteral: { type: "boolean" },
				TSTypeParameterDeclaration: { type: "boolean" },
				TSTypeParameterInstantiation: { type: "boolean" },
			} satisfies Record<keyof Options[0], { type: "boolean" }>,
			type: "object",
		}],
		type: "layout",
	},
	name: RULE_NAME,
});

// eslint-disable-next-line unused-imports/no-unused-vars
function exportType<A, B extends A>() {}

export default rule;

if (import.meta.vitest) {
	const { afterAll, describe, expect, it } = import.meta.vitest;
	const { RuleTester } = await import("../vendor/rule-tester/src/RuleTester");

	const valids = [
		"const a = { foo: \"bar\", bar: 2 }",
		"const a = {\nfoo: \"bar\",\nbar: 2\n}",
		"const a = [1, 2, 3]",
		"const a = [\n1,\n2,\n3\n]",
		"import { foo, bar } from \"foo\"",
		"import {\nfoo,\nbar\n} from \"foo\"",
		"const a = [`\n\n`, `\n\n`]",
		"log(a, b)",
		"log(\na,\nb\n)",
		"function foo(a, b) {}",
		"function foo(\na,\nb\n) {}",
		"const foo = (a, b) => {\n\n}",
		"const foo = (a, b): {a:b} => {\n\n}",
		"interface Foo { a: 1, b: 2 }",
		"interface Foo {\na: 1\nb: 2\n}",
		"a\n.filter(items => {\n\n})",
		"new Foo(a, b)",
		"new Foo(\na,\nb\n)",
		"function foo<T = {\na: 1,\nb: 2\n}>(a, b) {}",
		"foo(() =>\nbar())",
		"foo(() =>\nbar()\n)",
		`call<{\nfoo: 'bar'\n}>('')`,
		`
	(Object.keys(options) as KeysOptions[])
	.forEach((key) => {
		if (options[key] === false)
			delete listenser[key]
	})
		`,
		`function fn({ foo, bar }: {\nfoo: 'foo'\nbar: 'bar'\n}) {}`,
		{
			code: "foo(\na, b\n)",
			options: [{ CallExpression: false }],
		},
		{
			code: `
	const a = (
		<div>
			{text.map((item, index) => (
				<p>
				</p>
			))}
		</div>
	)
		`,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		`
	export const getTodoList = request.post<
		Params,
		ResponseData,
	>('/api/todo-list')
	`,
		{
			code: `
	function TodoList() {
		const { data, isLoading } = useSwrInfinite(
			(page) => ['/api/todo/list', { page }],
			([, params]) => getToDoList(params),
		)
		return <div></div>
	}`,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		`
	bar(
		foo => foo
			? ''
			: ''
	)
			`,
		`
	bar(
		(ruleName, foo) => foo
			? ''
			: ''
	)
		`,
		`
	const a = [
		(1),
		(2)
	];
		`,
		"const a = [(1), (2)];",

	];

	// Check snapshot for fixed code
	const invalid = [
		"const a = {\nfoo: \"bar\", bar: 2 }",
		"const a = {foo: \"bar\", \nbar: 2\n}",
		"const a = [\n1, 2, 3]",
		"const a = [1, \n2, 3\n]",
		"import {\nfoo, bar } from \"foo\"",
		"import { foo, \nbar } from \"foo\"",
		"const a = {foo: \"bar\", \r\nbar: 2\r\n}",
		"log(\na, b)",
		"function foo(\na, b) {}",
		"const foo = (\na, b) => {}",
		"const foo = (\na, b): {\na:b} => {}",
		"const foo = (\na, b): {a:b} => {}",
		"interface Foo {\na: 1,b: 2\n}",
		"type Foo = {\na: 1,b: 2\n}",
		"type Foo = [1,2,\n3]",
		"new Foo(1,2,\n3)",
		"new Foo(\n1,2,\n3)",
		"foo(\n()=>bar(),\n()=>\nbaz())",
		"foo(()=>bar(),\n()=>\nbaz())",
		"foo<X,\nY>(1, 2)",
		"foo<\nX,Y>(\n1, 2)",
		"function foo<\nX,Y>() {}",
		"const {a,\nb\n} = c",
		"const [\na,b] = c",
		"foo(([\na,b]) => {})",
		{
			code: `
	const a = (
		<div>
			{text.map((
				item, index) => (
				<p>
				</p>
			))}
		</div>
	)
		`,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		`
	export default antfu({
	},
	{
		foo: 'bar'
	}
		// some comment
		// hello
	)`,
	`
	export default antfu({
	},
	// some comment
	{
		foo: 'bar'
	},
	{
	}
		// hello
	)`,
	];

	RuleTester.afterAll = afterAll;
	RuleTester.it = it;
	RuleTester.itOnly = it.only;
	RuleTester.describe = describe;

	const ruleTester = new RuleTester({
		parser: require.resolve("@typescript-eslint/parser"),
	});

	ruleTester.run(RULE_NAME, rule as any, {
		invalid: invalid.map(i => typeof i === "string"
			? {
					code: i,
					errors: null,
					onOutput: (output: string) => {
						expect(output).toMatchSnapshot();
					},
				}
			: {
					...i,
					errors: null,
					onOutput: (output: string) => {
						expect(output).toMatchSnapshot();
					},
				},
		),
		valid: valids,
	});
}
