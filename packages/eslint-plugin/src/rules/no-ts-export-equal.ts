import { createEslintRule } from "../utils";

const RULE_NAME = "no-ts-export-equal";
type MessageIds = "noTsExportEqual";
type Options = [];

const rule = createEslintRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: "problem",
		docs: {
			description: "Do not use `exports =`",
			recommended: "recommended",
		},
		schema: [],
		messages: {
			noTsExportEqual: "Use ESM `export default` instead",
		},
	},
	defaultOptions: [],
	create: (context) => {
		const extension = context.filename.split(".").pop();
		if (!extension) {
			return {};
		}
		if (!["ts", "tsx", "mts", "cts"].includes(extension)) {
			return {};
		}

		return {
			TSExportAssignment(node) {
				context.report({
					node,
					messageId: "noTsExportEqual",
				});
			},
		};
	},
});

export default rule;

if (import.meta.vitest) {
	const { afterAll, it, describe } = import.meta.vitest;
	const { RuleTester } = await import("../vendor/rule-tester/src/RuleTester");

	const valids = [
		{ code: "export default {}", filename: "test.ts" },
		{ code: "export = {}", filename: "test.js" },
	];

	const invalids = [{ code: "export = {}", filename: "test.ts" }];

	RuleTester.afterAll = afterAll;
	RuleTester.it = it;
	RuleTester.itOnly = it.only;
	RuleTester.describe = describe;

	const ruleTester = new RuleTester({
		parser: require.resolve("@typescript-eslint/parser"),
	});

	ruleTester.run(RULE_NAME, rule as any, {
		valid: valids,
		invalid: invalids.map((i) => ({
			...i,
			errors: [{ messageId: "noTsExportEqual" }],
		})),
	});
}
