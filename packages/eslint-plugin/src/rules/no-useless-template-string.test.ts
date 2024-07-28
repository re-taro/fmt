import { run } from "./_test"
import { RULE_NAME, rule } from "./no-useless-template-string"

const valids = [
	"const a = '1';",
	"const a = \"1\"",
	// eslint-disable-next-line no-template-curly-in-string
	"const a = `1${b}`",
	"String.raw`str`",
	"`\"\"`",
	"`''`",
]
const invalids = [
	[
		"const a = `1`",
		"const a = \"1\"",
	],
]

run({
	name: RULE_NAME,
	rule,
	valid: valids,
	invalid: invalids.map(i => ({
		code: i[0],
		output: i[1],
		errors: [{ messageId: "noUselessTemplateString" }],
	})),
})
