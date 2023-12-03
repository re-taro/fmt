import type { TSESTree } from "@typescript-eslint/utils";
import { ESLintUtils } from "@typescript-eslint/utils";
import type { RuleWithMetaAndName } from "@typescript-eslint/utils/eslint-utils";
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

export type Rule<
	TOptions extends readonly unknown[],
	TMessageIds extends string,
> = RuleModule<TMessageIds, TOptions>;

export const createEslintRule: <
	TOptions extends readonly unknown[],
	TMessageIds extends string,
>({
	name,
	meta,
	...rule
}: Readonly<RuleWithMetaAndName<TOptions, TMessageIds>>) => Rule<
	TOptions,
	TMessageIds
> = ESLintUtils.RuleCreator((ruleName) => ruleName);

export function getPreviousNode(
	node?: TSESTree.Node,
): TSESTree.Node | undefined {
	if (!node) {
		return;
	}
	const { parent } = node;
	if (parent && "body" in parent) {
		const { body } = parent;
		if (!Array.isArray(body)) {
			return;
		}
		// @ts-expect-error
		const index = body.indexOf(node);
		if (index > 0) {
			return body[index - 1];
		}
	}
}
