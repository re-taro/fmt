import { run } from "./_test"
import { RULE_NAME, rule } from "./import-dedupe"

const valids = [
	"import { a } from 'foo'",
]
const invalids = [
	[
		"import { a, b, a, a, c, a } from 'foo'",
		"import { a, b,   c,  } from 'foo'",
	],
]

run({
	invalid: invalids.map(i => ({
		code: i[0],
		errors: [{ messageId: "importDedupe" }, { messageId: "importDedupe" }, { messageId: "importDedupe" }],
		output: i[1],
	})),
	name: RULE_NAME,
	rule,
	valid: valids,
})
