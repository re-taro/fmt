import type { JSONSchema } from "@typescript-eslint/utils";

const baseConfigProperties: Record<string, JSONSchema.JSONSchema4> = {
	$schema: { type: "string" },
	defaultFilenames: {
		additionalProperties: false,
		properties: {
			ts: { type: "string" },
			tsx: { type: "string" },
		},
		required: ["ts", "tsx"],
		type: "object",
	},
	dependencyConstraints: {
		additionalProperties: {
			type: "string",
		},
		type: "object",
	},
	ecmaFeatures: { type: "object" }, // deprecated; logs a warning when used
	env: { type: "object" },
	extends: { $ref: "#/definitions/stringOrStrings" },
	globals: { type: "object" },
	noInlineConfig: { type: "boolean" },
	overrides: {
		additionalItems: false,
		items: { $ref: "#/definitions/overrideConfig" },
		type: "array",
	},
	parser: { type: ["string", "null"] },
	parserOptions: { type: "object" },
	plugins: { type: "array" },
	processor: { type: "string" },
	reportUnusedDisableDirectives: { type: "boolean" },
	rules: { type: "object" },

	settings: { type: "object" },
};

export const configSchema: JSONSchema.JSONSchema4 = {
	$ref: "#/definitions/objectConfig",

	definitions: {
		// Config at top-level.
		objectConfig: {
			additionalProperties: false,
			properties: {
				ignorePatterns: { $ref: "#/definitions/stringOrStrings" },
				root: { type: "boolean" },
				...baseConfigProperties,
			},
			type: "object",
		},
		// Config in `overrides`.
		overrideConfig: {
			additionalProperties: false,
			properties: {
				excludedFiles: { $ref: "#/definitions/stringOrStrings" },
				files: { $ref: "#/definitions/stringOrStringsRequired" },
				...baseConfigProperties,
			},
			required: ["files"],
			type: "object",
		},

		stringOrStrings: {
			oneOf: [
				{ type: "string" },
				{
					additionalItems: false,
					items: { type: "string" },
					type: "array",
				},
			],
		},

		stringOrStringsRequired: {
			oneOf: [
				{ type: "string" },
				{
					additionalItems: false,
					items: { type: "string" },
					minItems: 1,
					type: "array",
				},
			],
		},
	},
};
