import { defineConfig } from "../utils";

export default defineConfig({
  extends: ["plugin:jsonc/recommended-with-jsonc"],
  overrides: [
    {
      files: ["*.json", "*.json5", "*.jsonc"],
      parser: "jsonc-eslint-parser",
      rules: {
        strict: "off",
        "no-unused-expressions": "off",
        "no-irregular-whitespace": "off",
      },
    },
    {
      files: ["package.json"],
      parser: "jsonc-eslint-parser",
      rules: {
        indent: ["error", 2, { SwitchCase: 1 }],
        "jsonc/sort-keys": [
          "error",
          {
            pathPattern: "^$",
            order: [
              "name",
              "description",
              "private",
              "type",
              "version",
              "packageManager",
              "keywords",
              "license",
              "author",
              "repository",
              "funding",
              "main",
              "module",
              "types",
              "unpkg",
              "jsdelivr",
              "exports",
              "files",
              "bin",
              "sideEffects",
              "scripts",
              "peerDependencies",
              "peerDependenciesMeta",
              "dependencies",
              "optionalDependencies",
              "devDependencies",
              "husky",
              "lint-staged",
              "eslintConfig",
            ],
          },
          {
            pathPattern: "^(?:dev|peer|optional|bundled)?[Dd]ependencies$",
            order: { type: "asc" },
          },
        ],
      },
    },
  ],
});
