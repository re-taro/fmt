import functionStyle from "./rules/function-style";
import importDedupe from "./rules/import-dedupe";
import noImportPromisesAs from "./rules/no-import-promises-as";
import noInlineTypeImport from "./rules/no-inline-type-import";
import noNegatedComparison from "./rules/no-negated-comparison";
import noUselessTemplateString from "./rules/no-useless-template-string";
import padAfterLastImport from "./rules/pad-after-last-import";
import useAsyncWithAwait from "./rules/use-async-with-await";
import type { Rule } from "./utils";

interface RuleConfig<T extends Record<string, Rule<[], string>>> {
	rules: Record<keyof T, T[keyof T]>;
}

const plugins: RuleConfig<{
	"function-style": typeof functionStyle;
	"import-dedupe": typeof importDedupe;
	"no-inline-type-import": typeof noInlineTypeImport;
	"no-negated-comparison": typeof noNegatedComparison;
	"no-useless-template-string": typeof noUselessTemplateString;
	"no-import-promises-as": typeof noImportPromisesAs;
	"pad-after-last-import": typeof padAfterLastImport;
	"use-async-with-await": typeof useAsyncWithAwait;
}> = {
	rules: {
		"function-style": functionStyle,
		"import-dedupe": importDedupe,
		"no-inline-type-import": noInlineTypeImport,
		"no-negated-comparison": noNegatedComparison,
		"no-useless-template-string": noUselessTemplateString,
		"no-import-promises-as": noImportPromisesAs,
		"pad-after-last-import": padAfterLastImport,
		"use-async-with-await": useAsyncWithAwait,
	},
};

export default plugins;
