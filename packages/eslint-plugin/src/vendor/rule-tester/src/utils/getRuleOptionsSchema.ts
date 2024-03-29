import type { JSONSchema, TSESLint } from "@typescript-eslint/utils";

import { isReadonlyArray } from "./isReadonlyArray";

/**
 * Gets a complete options schema for a rule.
 *
 * @param rule A new-style rule object
 * @returns JSON Schema for the rule's options.
 */
export function getRuleOptionsSchema(
	rule: TSESLint.AnyRuleModule,
): JSONSchema.JSONSchema4 | null {
	const schema = rule.meta?.schema;

	// Given a tuple of schemas, insert warning level at the beginning
	if (isReadonlyArray(schema)) {
		if (schema.length) {
			return {
				items: schema as JSONSchema.JSONSchema4[],
				maxItems: schema.length,
				minItems: 0,
				type: "array",
			};
		}
		return {
			maxItems: 0,
			minItems: 0,
			type: "array",
		};
	}

	// Given a full schema, leave it alone
	return schema || null;
}
