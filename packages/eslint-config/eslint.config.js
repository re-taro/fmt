// @ts-check

import styleMigrate from "@stylistic/eslint-plugin-migrate";
import JITI from "jiti";

const jiti = JITI(import.meta.url);
/**
 * @type {import('./src')}
 */
const { re_taro } = jiti("./src");

export default re_taro(
	{
		vue: true,
		react: true,
		svelte: true,
		astro: true,
		typescript: true,
		formatters: true,
	},
	{
		ignores: [
			"fixtures",
			"_fixtures",
		],
	},
	{
		files: ["src/**/*.ts"],
		rules: {
			"perfectionist/sort-objects": "error",
		},
	},
	{
		files: ["src/configs/*.ts"],
		plugins: {
			"style-migrate": styleMigrate,
		},
		rules: {
			"style-migrate/migrate": ["error", { namespaceTo: "style" }],
		},
	},
);
