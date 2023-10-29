import { re_taro } from "@re-taro/eslint-config";

export default re_taro(
  {
    parserOptions: {
      project: "./tsconfig.json",
    },
  },
  {
    ignores: ["**/rollup.config.mjs"],
  },
);
