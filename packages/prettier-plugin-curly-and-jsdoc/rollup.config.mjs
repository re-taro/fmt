import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

import pkg from "./package.json" assert { type: "json" };

const externals = [...Object.keys(pkg.dependencies)];

/**
 * @type {import("rollup").RollupOptions}
 */
const options = {
	input: "src/index.ts",
	output: [
		{
			file: pkg.exports,
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
