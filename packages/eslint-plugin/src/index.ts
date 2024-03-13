import type { ESLint, Linter } from "eslint";
import { version } from "../package.json";
import ifNewline from "./rules/if-newline";
import importDedupe from "./rules/import-dedupe";
import topLevelFunction from "./rules/top-level-function";
import noTsExportEqual from "./rules/no-ts-export-equal";
import consistentListNewline from "./rules/consistent-list-newline";
import noInlineTypeImport from "./rules/no-inline-type-import";
import noNegatedComparison from "./rules/no-negated-comparison";
import noUselessTemplateString from "./rules/no-useless-template-string";
import padAfterLastImport from "./rules/pad-after-last-import";

const plugin = {
	meta: {
		version,
	},
	rules: {
		"consistent-list-newline": consistentListNewline,
		"if-newline": ifNewline,
		"import-dedupe": importDedupe,
		"no-inline-type-import": noInlineTypeImport,
		"no-negated-comparison": noNegatedComparison,
		"no-ts-export-equal": noTsExportEqual,
		"no-useless-template-string": noUselessTemplateString,
		"pad-after-last-import": padAfterLastImport,
		"top-level-function": topLevelFunction,
	},
} satisfies ESLint.Plugin;

export default plugin;

type RuleDefinitions = (typeof plugin)["rules"];

export type RuleOptions = {
	[K in keyof RuleDefinitions]: RuleDefinitions[K]["defaultOptions"];
};

export type Rules = {
	[K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>;
};
