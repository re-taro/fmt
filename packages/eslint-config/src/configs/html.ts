import { GLOB_HTML } from "../globs";
import { parserHtml, pluginHtml, pluginHtmlJsSupport } from "../plugins";
import type { ConfigItem } from "../types";

export const html = (): ConfigItem[] => [
  {
    plugins: {
      html: pluginHtml,
      "html-js-support": pluginHtmlJsSupport,
    },
  },
  {
    languageOptions: {
      parser: parserHtml,
    },
    settings: {
      "html/report-bad-indent": "off",
    },
    files: [GLOB_HTML],
    rules: {
      ...pluginHtml.configs.recommended.rules,
      "html/indent": "off",
      "html/no-trailing-spaces": "off",
      "html/require-closing-tags": "off",
      "html/no-extra-spacing-attrs": "off",
      "html/quotes": "off",
    },
  },
];
