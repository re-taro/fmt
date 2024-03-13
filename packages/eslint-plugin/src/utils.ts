import type {
	RuleListener,
	RuleWithMeta,
	RuleWithMetaAndName,
} from "@typescript-eslint/utils/eslint-utils";
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { Rule } from "eslint";

export interface RuleModule<T extends readonly unknown[]>
	extends Rule.RuleModule {
	defaultOptions: T;
}

/**
 * Creates reusable function to create rules with default options and docs URLs.
 *
 * @param urlCreator Creates a documentation URL for a given rule name.
 * @returns Function to create a rule with the docs URL format.
 */
function RuleCreator() {
	// This function will get much easier to call when this is merged https://github.com/Microsoft/TypeScript/pull/26349
	// TODO - when the above PR lands; add type checking for the context.report `data` property
	return function createNamedRule<
		TOptions extends readonly unknown[],
		TMessageIds extends string,
	>({
		name,
		meta,
		...rule
	}: Readonly<
		RuleWithMetaAndName<TOptions, TMessageIds>
	>): RuleModule<TOptions> {
		return createRule<TOptions, TMessageIds>({
			meta: {
				...meta,
				docs: {
					...meta.docs,
				},
			},
			...rule,
		});
	};
}

/**
 * Creates a well-typed TSESLint custom ESLint rule without a docs URL.
 *
 * @remarks
 * It is generally better to provide a docs URL function to RuleCreator.
 * @returns Well-typed TSESLint custom ESLint rule.
 */
function createRule<
	TOptions extends readonly unknown[],
	TMessageIds extends string,
>({
	create,
	defaultOptions,
	meta,
}: Readonly<RuleWithMeta<TOptions, TMessageIds>>): RuleModule<TOptions> {
	return {
		create: ((
			context: Readonly<RuleContext<TMessageIds, TOptions>>,
		): RuleListener => {
			const optionsWithDefault = context.options.map((options, index) => {
				return {
					...(defaultOptions[index] || {}),
					...(options || {}),
				};
			}) as unknown as TOptions;
			return create(context, optionsWithDefault);
		}) as any,
		defaultOptions,
		meta: meta as any,
	};
}

export const createEslintRule = RuleCreator() as <
	TOptions extends readonly unknown[],
	TMessageIds extends string,
>({
	name,
	meta,
	...rule
}: Readonly<
	RuleWithMetaAndName<TOptions, TMessageIds>
>) => RuleModule<TOptions>;
