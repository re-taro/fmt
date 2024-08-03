import type { TSESTree } from "@typescript-eslint/utils";
import { createEslintRule } from "../utils";
import type { RuleModule } from "../utils";

export const RULE_NAME = "curly";
export type MessageIds = "missingCurlyBrackets";
export type Options = [];

export const rule: RuleModule<Options> = createEslintRule<Options, MessageIds>({
	create: (context) => {
		function requireCurly(body: TSESTree.Expression | TSESTree.Statement): boolean {
			if (!body)
				return false;
			// already has curly brackets
			if (body.type === "BlockStatement")
				return true;
			// nested statements
			if (["DoWhileStatement", "ForInStatement", "ForOfStatement", "ForStatement", "IfStatement", "WhileStatement"].includes(body.type))
				return true;
			const statement = body.type === "ExpressionStatement"
				? body.expression
				: body;
			// multiline
			if (statement.loc.start.line !== statement.loc.end.line)
				return true;
			return false;
		}

		function wrapCurlyIfNeeded(body: TSESTree.Statement): void {
			if (body.type === "BlockStatement")
				return;
			context.report({
				*fix(fixer) {
					yield fixer.insertTextAfter(body, "\n}");
					const token = context.sourceCode.getTokenBefore(body);
					yield fixer.insertTextAfterRange(token!.range, " {");
				},
				messageId: "missingCurlyBrackets",
				node: body,
			});
		}

		function check(bodies: TSESTree.Statement[], additionalChecks: TSESTree.Expression[] = []): void {
			const requires = [...bodies, ...additionalChecks].map(body => requireCurly(body));

			// If any of the bodies requires curly brackets, wrap all of them to be consistent
			if (requires.some(i => i))
				bodies.map(body => wrapCurlyIfNeeded(body));
		}

		return {
			DoWhileStatement(node) {
				check([node.body], [node.test]);
			},
			ForInStatement(node) {
				check([node.body]);
			},
			ForOfStatement(node) {
				check([node.body]);
			},
			ForStatement(node) {
				check([node.body]);
			},
			IfStatement(node) {
				const parent = node.parent;
				// Already handled by the upper level if statement
				if (parent.type === "IfStatement" && parent.alternate === node)
					return;

				const statements: TSESTree.Statement[] = [];
				const tests: TSESTree.Expression[] = [];

				function addIf(node: TSESTree.IfStatement): void {
					statements.push(node.consequent);
					if (node.test)
						tests.push(node.test);
					if (node.alternate) {
						if (node.alternate.type === "IfStatement")
							addIf(node.alternate);
						else
							statements.push(node.alternate);
					}
				}

				addIf(node);
				check(statements, tests);
			},
			WhileStatement(node) {
				check([node.body], [node.test]);
			},
		};
	},
	defaultOptions: [],
	meta: {
		docs: {
			description: "Enforce style of curly bracket",
		},
		fixable: "whitespace",
		messages: {
			missingCurlyBrackets: "Expect curly brackets",
		},
		schema: [],
		type: "layout",
	},
	name: RULE_NAME,
});
