import { run } from "./_test";
import { RULE_NAME, rule } from "./no-useless-template-string";

const valids = [
	"const a = '1';",
	"const a = \"1\"",
	// eslint-disable-next-line no-template-curly-in-string
	"const a = `1${b}`",
	"String.raw`str`",
	"`\"\"`",
	"`''`",
];
const invalids = [
	[
		"const a = `1`",
		"const a = \"1\"",
	],
];

run({
	invalid: invalids.map(i => ({
		code: i[0],
		errors: [{ messageId: "noUselessTemplateString" }],
		output: i[1],
	})),
	name: RULE_NAME,
	rule,
	valid: valids,
});
