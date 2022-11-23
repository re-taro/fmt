import { defineRules } from "../../utils";

export default defineRules({
  "unicorn/error-message": "error",
  "unicorn/escape-case": "error",
  "unicorn/no-array-instanceof": "error",
  "unicorn/no-new-buffer": "error",
  "unicorn/no-unsafe-regex": "off",
  "unicorn/number-literal-case": "error",
  "unicorn/prefer-exponentiation-operator": "error",
  "unicorn/prefer-includes": "error",
  "unicorn/prefer-starts-ends-with": "error",
  "unicorn/prefer-text-content": "error",
  "unicorn/prefer-type-error": "error",
  "unicorn/throw-new-error": "error",
});
