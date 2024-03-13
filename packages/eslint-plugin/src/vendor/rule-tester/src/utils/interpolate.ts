import type { TSESLint } from "@typescript-eslint/utils";

export function interpolate(
	text: string,
	data: TSESLint.ReportDescriptorMessageData,
): string {
	if (!data)
		return text;

	// Substitution content for any {{ }} markers.
	return text.replace(
		/\{\{([^{}]+?)\}\}/gu,
		(fullMatch, termWithWhitespace: string) => {
			const term = termWithWhitespace.trim();

			if (term in data)
				return String(data[term]);

			// Preserve old behavior: If parameter name not provided, don't replace it.
			return fullMatch;
		},
	);
}
