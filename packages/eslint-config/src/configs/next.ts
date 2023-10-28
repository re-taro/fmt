import type { FlatESLintConfigItem } from "eslint-define-config";

import { pluginNext } from "../plugins";
import type { OptionsOverrides } from "../types";

export const next = ({
  overrides,
}: OptionsOverrides = {}): FlatESLintConfigItem[] => [
  {
    plugins: {
      next: pluginNext,
    },
  },
  {
    rules: {
      "@next/next/no-img-element": "off",

      ...overrides,
    },
  },
];
