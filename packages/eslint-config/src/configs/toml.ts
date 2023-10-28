import type { FlatESLintConfigItem, Parser } from "eslint-define-config";

import { GLOB_TOML } from "../globs";
import { parserToml, pluginToml } from "../plugins";
import type { OptionsOverrides } from "../types";

export const toml = ({
  overrides,
}: OptionsOverrides = {}): FlatESLintConfigItem[] => [
  {
    plugins: {
      toml: pluginToml,
    },
  },
  {
    languageOptions: {
      parser: parserToml as unknown as Parser,
    },
    files: [GLOB_TOML],
    rules: {
      ...(pluginToml.configs.recommended.rules as any),
      "no-irregular-whitespace": "off",
      "spaced-comment": "off",
      ...overrides,
    },
  },
];
