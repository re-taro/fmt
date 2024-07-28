import { join, resolve } from "node:path"
import { afterAll, beforeAll, it } from "vitest"
import fs from "fs-extra"
import { execa } from "execa"
import fg from "fast-glob"
import type { OptionsConfig, TypedFlatConfigItem } from "../src/types"

beforeAll(async () => {
	await fs.rm("_fixtures", { force: true, recursive: true })
})
afterAll(async () => {
	await fs.rm("_fixtures", { force: true, recursive: true })
})

runWithConfig("js", {
	typescript: false,
	vue: false,
})
runWithConfig("all", {
	astro: true,
	svelte: true,
	typescript: true,
	vue: true,
})
runWithConfig("no-style", {
	stylistic: false,
	typescript: true,
	vue: true,
})

// https://github.com/antfu/eslint-config/issues/255
runWithConfig(
	"ts-override",
	{
		typescript: true,
	},
	{
		rules: {
			"ts/consistent-type-definitions": ["error", "type"],
		},
	},
)

// https://github.com/antfu/eslint-config/issues/255
runWithConfig(
	"ts-strict",
	{
		typescript: {
			tsconfigPath: "../../../../tsconfig.json",
		},
	},
	{
		rules: {
			"ts/no-unsafe-return": ["off"],
		},
	},
)

runWithConfig(
	"with-formatters",
	{
		astro: true,
		formatters: true,
		typescript: true,
		vue: true,
	},
)

runWithConfig(
	"no-markdown-with-formatters",
	{
		formatters: {
			markdown: true,
		},
		jsx: false,
		markdown: false,
		vue: false,
	},
)

function runWithConfig(name: string, configs: OptionsConfig, ...items: TypedFlatConfigItem[]) {
	it.concurrent(name, async ({ expect }) => {
		const from = resolve("fixtures/input")
		const output = resolve("fixtures/output", name)
		const target = resolve("_fixtures", name)

		await fs.copy(from, target, {
			filter: (src) => {
				return !src.includes("node_modules")
			},
		})
		await fs.writeFile(join(target, "eslint.config.js"), `
// @eslint-disable
import { re_taro } from '@re-taro/eslint-config'

export default re_taro(
  ${JSON.stringify(configs)},
  ...${JSON.stringify(items) ?? []},
)
  `)

		await execa("npx", ["eslint", ".", "--fix"], {
			cwd: target,
			stdio: "pipe",
		})

		const files = await fg("**/*", {
			cwd: target,
			ignore: [
				"node_modules",
				"eslint.config.js",
			],
		})

		await Promise.all(files.map(async (file) => {
			const content = await fs.readFile(join(target, file), "utf-8")
			const source = await fs.readFile(join(from, file), "utf-8")
			const outputPath = join(output, file)
			if (content === source) {
				if (fs.existsSync(outputPath))
					await fs.remove(outputPath)
				return
			}
			await expect.soft(content).toMatchFileSnapshot(join(output, file))
		}))
	}, 30_000)
}
