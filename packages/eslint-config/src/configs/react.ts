import { GLOB_JSX, GLOB_TSX } from "../globs";
import { pluginJsxA11y, pluginReact, pluginReactHooks } from "../plugins";
import type { ConfigItem, OptionsOverrides } from "../types";

export const react = ({ overrides }: OptionsOverrides = {}): ConfigItem[] => [
  {
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "jsx-a11y": pluginJsxA11y,
    },
  },
  {
    files: [GLOB_JSX, GLOB_TSX],
    settings: {
      react: {
        version: "18",
      },
    },
    rules: {
      ...(pluginReact.configs.recommended.rules as any),
      ...(pluginReact.configs["jsx-runtime"].rules as any),
      ...(pluginReactHooks.configs.recommended.rules as any),
      ...(pluginJsxA11y.configs.recommended.rules as any),

      "react/prop-types": "off",
      "react/no-unknown-property": "off",
      "react/jsx-handler-names": "warn",
      "react/jsx-no-useless-fragment": ["warn", { allowExpressions: true }],
      "react/no-invalid-html-attribute": "warn",
      "react/no-unstable-nested-components": "error",
      "jsx-a11y/anchor-ambiguous-text": "error",
      "jsx-a11y/control-has-associated-label": "error",
      "jsx-a11y/no-aria-hidden-on-focusable": "error",

      ...overrides,
    },
  },
];
