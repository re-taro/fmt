import { basename } from "node:path";

import type { Parser } from "prettier";
import { format as prettierFormat } from "prettier";
import { parsers as prettierParsers } from "prettier/plugins/babel";
import type { Options } from "prettier-package-json";
import { format } from "prettier-package-json";

import { defaultOptions } from "./default-options";
import type { PrettierOptions } from "./types";

const parser = prettierParsers["json-stringify"];
const isPackageJson = (path: string) => basename(path) === "package.json";

export const parsers = {
  "json-stringify": {
    ...parser,
    async parse(text, options: PrettierOptions) {
      if (!isPackageJson(options.filepath)) {
        return parser.parse(text, options);
      }

      text = await prettierFormat(text, { filepath: "package.json" });

      if (parser.preprocess) {
        text = parser.preprocess(text, options);
      }

      const formatOptions: Options = {
        useTabs: options.useTabs,
        tabWidth: options.tabWidth,
        expandUsers: options.pkgsortExpandUsers ?? defaultOptions.expandUsers,
        keyOrder: options.pkgsortKeyOrder ?? defaultOptions.keyOrder,
      };

      text = format(JSON.parse(text), formatOptions);

      return parser.parse(text, options);
    },
  } as const satisfies Parser,
};

if (import.meta.vitest) {
  const { default: module } = await import("node:module");
  const { default: url } = await import("node:url");
  const { it, expect } = import.meta.vitest;

  it("should be requireable", () => {
    const imported = module.createRequire(import.meta.url)("..");

    expect(imported).toMatchObject({
      parsers: {},
    });
  });

  it("should be resolvable", () => {
    const actualPath = url.fileURLToPath(
      new URL("../dist/index.cjs", import.meta.url)
    );

    const resolved = require.resolve("..");

    expect(resolved).toEqual(actualPath);
  });
}
