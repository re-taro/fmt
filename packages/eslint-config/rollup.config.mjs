import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

import pkg from "./package.json";

const externals = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.devDependencies),
];

/** @type {import('rollup').RollupOptions} */
const options = {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: false,
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: false,
    },
  ],
  external: (id) => externals.some((d) => id.startsWith(d)),
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      outDir: ".",
      declaration: true,
    }),
    terser(),
  ],
};

export default options;
