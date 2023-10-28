import type { FlatESLintConfigItem, Parser } from "eslint-define-config";

import { GLOB_YAML } from "../globs";
import { parserYaml, pluginYaml } from "../plugins";
import type { OptionsOverrides } from "../types";
import { renameRules } from "../utils";

export const yaml = ({
  overrides,
}: OptionsOverrides = {}): FlatESLintConfigItem[] => [
  {
    plugins: {
      yaml: pluginYaml,
    },
    languageOptions: {
      parser: parserYaml as unknown as Parser,
    },
    files: [GLOB_YAML],
    rules: {
      ...renameRules(pluginYaml.configs.prettier.rules, "yml/", "yaml/"),
      ...renameRules(pluginYaml.configs.recommended.rules, "yml/", "yaml/"),
      "yaml/no-empty-document": "off",
      "spaced-comment": "off",
      ...overrides,
    },
  },
];
