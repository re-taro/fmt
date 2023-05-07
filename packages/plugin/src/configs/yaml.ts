import { defineConfig } from "../utils";

export default defineConfig({
  extends: ["plugin:yml/standard"],
  rules: {
    "yml/quotes": ["error", { prefer: "double", avoidEscape: false }],
    "yml/no-empty-document": "off",
    "yml/no-empty-mapping-value": "off",
  },
});
