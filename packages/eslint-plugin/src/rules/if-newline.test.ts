import { run } from "./_test"
import { RULE_NAME, rule } from "./if-newline"

const valids = [
  `if (true)
  console.log('hello')
`,
  `if (true) {
  console.log('hello')
}`,
]
const invalids = [
	["if (true) console.log('hello')", "if (true) \nconsole.log('hello')"],
]

run({
	invalid: invalids.map(i => ({
		code: i[0],
		errors: [{ messageId: "missingIfNewline" }],
		output: i[1],
	})),
	name: RULE_NAME,
	rule,
	valid: valids,
})
