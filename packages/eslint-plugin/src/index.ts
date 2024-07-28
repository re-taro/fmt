import type { ESLint, Linter } from "eslint"
import { version } from "../package.json"
import { rule as ifNewline } from "./rules/if-newline"
import { rule as importDedupe } from "./rules/import-dedupe"
import { rule as topLevelFunction } from "./rules/top-level-function"
import { rule as consistentListNewline } from "./rules/consistent-list-newline"
import { rule as curly } from "./rules/curly"
import { rule as noImportPromisesAs } from "./rules/no-import-promises-as"
import { rule as noInlineTypeImport } from "./rules/no-inline-type-import"
import { rule as noNegatedComparison } from "./rules/no-negated-comparison"
import { rule as noUselessTemplateString } from "./rules/no-useless-template-string"
import { rule as padAfterLastImport } from "./rules/pad-after-last-import"

export const plugin: ESLint.Plugin = {
	meta: {
		name: "re-taro",
		version,
	},
	// @keep-sorted
	rules: {
		"consistent-list-newline": consistentListNewline,
		"curly": curly,
		"if-newline": ifNewline,
		"import-dedupe": importDedupe,
		"no-import-promises-as": noImportPromisesAs,
		"no-inline-type-import": noInlineTypeImport,
		"no-negated-comparison": noNegatedComparison,
		"no-useless-template-string": noUselessTemplateString,
		"pad-after-last-import": padAfterLastImport,
		"top-level-function": topLevelFunction,
	},
}

type RuleDefinitions = typeof plugin["rules"]

export type RuleOptions = {
	[K in keyof RuleDefinitions]: RuleDefinitions[K]["defaultOptions"]
}

export type Rules = {
	[K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>
}
