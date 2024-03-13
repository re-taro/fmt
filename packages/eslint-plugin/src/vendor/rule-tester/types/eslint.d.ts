declare module "eslint/use-at-your-own-risk" {
	import type { TSESLint } from "@typescript-eslint/utils";

	export const builtinRules: ReadonlyMap<string, TSESLint.AnyRuleModule>;
}

declare module "@eslint/eslintrc" {
	import type { TSESLint } from "@typescript-eslint/utils";

	export const Legacy: {
		ConfigOps: {
			normalizeConfigGlobal: (
				configuredValue: boolean | string | null,
			) => TSESLint.Linter.GlobalVariableOptionBase;
			// ...
		};
		environments: Map<string, TSESLint.Linter.Environment>;
		// ...
	};
}

declare module "eslint" {
	import type { TSESLint } from "@typescript-eslint/utils";

	export const SourceCode: TSESLint.SourceCode;
}
