import { defineConfig } from "../utils";
import reactRules from "./rules/react";

export default defineConfig({
  overrides: [
    {
      files: ["*.jsx", "*.tsx"],
      extends: [
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
      ],
      settings: {
        react: {
          version: "18",
        },
      },
      rules: {
        "jsx-quotes": ["error", "prefer-double"],
        "react/prop-types": "off",
        "react/no-unknown-property": "off",
        ...reactRules,
      },
    },
  ],
});
