import { run } from "./_test"
import { RULE_NAME, rule } from "./no-negated-comparison"

const valids = ["a != b", "a !== b"]
const invalids = [
	[
		"!(a == b)",
		"(a!=b)",
	],
	[
		"!(a === b)",
		"(a!==b)",
	],
	[
		"!(a != b)",
		"(a==b)",
	],
	[
		"!(a !== b)",
		"(a===b)",
	],
	[
		"!(a < b)",
		"(a>=b)",
	],
	[
		"!(a <= b)",
		"(a>b)",
	],
	[
		"!(a > b)",
		"(a<=b)",
	],
	[
		"!(a >= b)",
		"(a<b)",
	],
]

run({
	name: RULE_NAME,
	rule,
	valid: valids,
	invalid: invalids.map(i => ({
		code: i[0],
		output: i[1],
		errors: [{ messageId: "noNegatedComparison" }],
	})),
})
