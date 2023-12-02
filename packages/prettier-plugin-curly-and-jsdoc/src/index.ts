import type { Parser, SupportOption } from "prettier";
import { parsers as curlyParsers } from "prettier-plugin-curly";
import {
  defaultOptions as jsdocDefaultOptions,
  options as jsdocOptions,
  parsers as jsdocParsers,
} from "prettier-plugin-jsdoc";

const options: Record<string, SupportOption> = jsdocOptions;
const defaultOptions: typeof jsdocDefaultOptions = jsdocDefaultOptions;

const parsers: Record<string, Parser> = {
  ...jsdocParsers,
  babel: {
    ...jsdocParsers.babel,
    preprocess: (code: string, options: any) =>
      jsdocParsers.babel.preprocess(
        curlyParsers.babel.preprocess(code, options),
        options,
      ),
  },
  typescript: {
    ...jsdocParsers.typescript,
    preprocess: (code: string, options: any) =>
      jsdocParsers.typescript.preprocess!(
        curlyParsers.typescript.preprocess(code, options),
        options,
      ),
  },
};

export { defaultOptions, options, parsers };
