import type { TSESTree } from "@typescript-eslint/utils";
import { ESLintUtils } from "@typescript-eslint/utils";

export const createEslintRule = ESLintUtils.RuleCreator((ruleName) => ruleName);

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
		// @ts-expect-error - TS doesn't understand that body is an array here
		const index = body.indexOf(node);
		if (index > 0) {
			return body[index - 1];
		}
	}
}
