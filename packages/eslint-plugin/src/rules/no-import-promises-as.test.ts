import { unindent as $ } from "eslint-vitest-rule-tester";
import { run } from "./_test";
import { RULE_NAME, rule } from "./no-import-promises-as";

const valids = ["import { promises } from 'fs';"];
const invalids = [
	[
		"import { promises as fs } from 'fs';",
		$`
			import {  } from 'fs';
			import fs from "fs/promises";
		`,
	],
	[
		"import { promises as fs } from 'node:fs';",
		$`
			import {  } from 'node:fs';
			import fs from "node:fs/promises";
		`,
	],
];

run({
	invalid: invalids.map(i => ({
		code: i[0],
		errors: [{ messageId: "noImportPromisesAs" }],
		output: i[1],
	})),
	name: RULE_NAME,
	rule,
	valid: valids,
});
