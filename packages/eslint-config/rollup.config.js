// @ts-check

import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
import nodeResolve from "@rollup/plugin-node-resolve";
import outputSize, { summarize } from "rollup-plugin-output-size";
import commonjs from "@rollup/plugin-commonjs";
import autoExternal from "rollup-plugin-auto-external";
import json from "@rollup/plugin-json";

import pkg from "./package.json" with { type: "json" };

/**
 * @type {import("rollup").RollupOptions}
 */
const options = {
	input: "src/index.ts",
	output: [
		{
			file: pkg.exports["."].require,
			format: "cjs",
		},
		{
			file: pkg.exports["."].import,
			format: "es",
		},
	],
	plugins: [
		autoExternal({
			packagePath: "./package.json",
		}),
		nodeResolve(),
		commonjs(),
		json(),
		typescript({
			declaration: true,
			rootDir: "src",
			outDir: "dist",
			emitDeclarationOnly: true,
		}),
		replace({
			values: {
				"process.env.NODE_ENV": JSON.stringify("production"),
				"import.meta.env.NODE_ENV": JSON.stringify("production"),
				"import.meta.vitest": "undefined",
			},
			preventAssignment: true,
		}),
		terser({
			compress: {
				passes: 5,
			},
		}),
		outputSize({
			summary(summary) {
				// eslint-disable-next-line no-console
				console.log(summarize(summary));
			},
		}),
	],
};

export default options;
