import type { FlatESLintConfigItem } from "eslint-define-config";

import { GLOB_STORIES, GLOB_STORYBOOKCONFIG } from "../globs";
import { pluginStorybook } from "../plugins";
import type { OptionsOverrides } from "../types";

export const storybook = ({
  overrides,
}: OptionsOverrides = {}): FlatESLintConfigItem[] => [
  {
    plugins: {
      storybook: pluginStorybook,
    },
  },
  {
    files: GLOB_STORIES,
    rules: {
      "storybook/await-interactions": "error",
      "storybook/context-in-play-function": "error",
      "storybook/default-exports": "error",
      "storybook/hierarchy-separator": "warn",
      "storybook/no-redundant-story-name": "warn",
      "storybook/prefer-pascal-case": "warn",
      "storybook/story-exports": "error",
      "storybook/use-storybook-expect": "error",
      "storybook/use-storybook-testing-library": "error",

      ...overrides,
    },
  },
  {
    files: [GLOB_STORYBOOKCONFIG],
    rules: {
      "storybook/no-uninstalled-addons": "error",
    },
  },
];
