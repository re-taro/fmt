import { unindent as $ } from "eslint-vitest-rule-tester"
import { run } from "./_test"
import { RULE_NAME, rule } from "./pad-after-last-import"

const valids = ["import a from \"foo\";\n\nconst b = 1;"]
const invalids = [
	[
		"import a from \"foo\";\nconst b = 1;",
		$`
			import a from "foo";

			const b = 1;
		`,
	],
	[
		"import a from \"foo\";\n// comment\nconst b = 1;",
		$`
			import a from "foo";

			// comment
			const b = 1;
		`,
	],
]

run({
	name: RULE_NAME,
	rule,
	valid: valids,
	invalid: invalids.map(i => ({
		code: i[0],
		output: i[1],
		errors: [{ messageId: "padAfterLastImport" }],
	})),
})
