import { run } from "./_test";
import { RULE_NAME, rule } from "./no-negated-comparison";

const valids = ["a != b", "a !== b"];
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
];

run({
	invalid: invalids.map(i => ({
		code: i[0],
		errors: [{ messageId: "noNegatedComparison" }],
		output: i[1],
	})),
	name: RULE_NAME,
	rule,
	valid: valids,
});
