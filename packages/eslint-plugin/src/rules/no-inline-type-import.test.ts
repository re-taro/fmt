import { unindent as $ } from "eslint-vitest-rule-tester"
import { run } from "./_test"
import { RULE_NAME, rule } from "./no-inline-type-import"

const valids = ["import type { a } from \"foo\";"]
const invalids = [
	[
		"import { type a } from \"foo\";",
		"import type { a } from \"foo\";",
	],
	[
		"import { type a, b } from \"foo\";",
		$`
			import type { a } from "foo";
			import { b } from "foo";
		`,
	],
	[
		"import D, { type a, b } from \"foo\";",
		$`
			import type { a } from "foo";
			import D, { b } from "foo";
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
		errors: [{ messageId: "noInlineTypeImport" }],
	})),
})
