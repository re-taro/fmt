# @re-taro/eslint-config and @re-taro/prettier-config

[![npm](https://img.shields.io/npm/v/@re-taro/eslint-config?color=a1b858&label=)](https://npmjs.com/package/@re-taro/eslint-config)

## Features

- Double quotes, with semicolons
- Auto fix for formatting (Powered by [Prettier](https://github.com/prettier/prettier))
- Supports TypeScript, Vue, React, Svelte, Solid, MDX, JSON, Yaml, Markdown, HTML out-of-box!
- Sorted imports, dangling commas for cleaner commit diff
- Autofix for syntax errors, e.g. automatically add `async` keyword when using `await` in a non-async function
- Focused on consistent code style, with custom rules to enforce style
- Reasonable defaults, best practices, only one-line of config
- Respects `.gitignore` by default
- [ESLint Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new), compose easily!
- **Style principle**: Consistent for reading, stable for diff. More automated style fixes is better.

> [!IMPORTANT]
> The main branch is for v2.0.0 release, which rewrites to ESLint Flat config.

## Usage

### Install

```bash
pnpm add -D eslint prettier @re-taro/eslint-config @re-taro/prettier-config
```

### Config `eslint.config.js` and `prettier.config.js`

```js
// eslint.config.js
import { re_taro } from "@re-taro/eslint-config";

export default re_taro();
```

Or using CJS:

```js
// eslint.config.js
const { re_taro } = require("@re-taro/eslint-config");

module.exports = re_taro();
```

```js
import re_taro from "@re-taro/prettier-config";

export default re_taro;
```

> Note that `.eslintignore` no longer works in Flat config, see [customization](#customization) for more details.

### Add script for package.json

For example:

```json
{
	"scripts": {
		"lint": "eslint . && prettier . --check",
		"lint:fix": "eslint . -- fix && prettier . --write"
	}
}
```

### Config VS Code auto fix

Create `.vscode/settings.json`

```json
{
	"editor.defaultFormatter": "esbenp.vscode-prettier",
	"editor.formatOnSave": true,
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": "explicit"
	},
	// Enable flat config support
	"eslint.experimental.useFlatConfig": true
}
```

## Customization

Since v2.0.0, we migrated to [ESLint Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new). It provides a much better organization and composition.

Normally you only need to import the `re-taro` preset:

```js
// eslint.config.js
import { re_taro } from "@re-taro/eslint-config";

export default re_taro();
```

And that's it! Or you can configure each integration individually, for example:

```js
// eslint.config.js
import { re_taro } from "@re-taro/eslint-config";

export default re_taro(
	{
		typescript: true,
		vue: true,
		solid: false,
		jsonc: false,
		yaml: false,
	},
	{
		// `.eslintignore` is no longer supported in Flat config, use `ignores` instead
		ignores: [
			"./fixtures",
			// ...globs
		],
	},
);
```

The `re-taro` factory function also accepts any number of arbitrary custom config overrides:

```js
// eslint.config.js
import { re_taro } from "@re-taro/eslint-config";

export default re_taro(
	{
		// Configures for re-taro's config
	},

	// From the second arguments they are ESLint Flat Configs
	// you can have multiple configs
	{
		files: ["**/*.ts"],
		rules: {},
	},
	{
		rules: {},
	},
);
```

Going more advanced, you can also import fine-grained configs and compose them as you wish:

```js
// eslint.config.js
import {
	comments,
	formatting,
	html,
	ignores,
	imports,
	javascript,
	jsonc,
	mdx,
	node,
	onlyError,
	promise,
	solid,
	sortImports,
	test,
	toml,
	typescript,
	unicorn,
	vue,
	yaml,
} from "@re-taro/eslint-config";

export default [
	...comments(),
	...formatting(),
	...html(),
	...ignores(),
	...imports(),
	...javascript(),
	...jsonc(),
	...mdx(),
	...node(),
	...onlyError(),
	...promise(),
	...solid(),
	...sortImports(),
	...test(),
	...toml(),
	...typescript(),
	...unicorn(),
	...vue(),
	...yaml(),
];
```

Check out the [configs](https://github.com/re-taro/eslint-config/blob/main/packages/eslint-config/configs) and [factory](https://github.com/re-taro/eslint-config/blob/main/packages/eslint-config/factory.ts) for more details.

> Thanks to [sxzz/eslint-config](https://github.com/sxzz/eslint-config) and [antfu/eslint-config](https://github.com/antfu/eslint-config) for the inspiration and reference.

## Plugins Renaming

Since flat config requires us to explicitly provide the plugin names (instead of mandatory convention from npm package name), we renamed some plugins to make overall scope more consistent and easier to write.

| New Prefix | Original Prefix        | Source Plugin                                                                              |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| `import/*` | `i/*`                  | [eslint-plugin-i](https://github.com/un-es/eslint-plugin-i)                                |
| `node/*`   | `n/*`                  | [eslint-plugin-n](https://github.com/eslint-community/eslint-plugin-n)                     |
| `yaml/*`   | `yml/*`                | [eslint-plugin-yml](https://github.com/ota-meshi/eslint-plugin-yml)                        |
| `ts/*`     | `@typescript-eslint/*` | [@typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint) |
| `html/*`   | `@html-eslint/*`       | [@html-eslint](https://github.com/yeonjuan/html-eslint)                                    |

When you want to override rules, or disable them inline, you need to update to the new prefix:

```diff
-// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
+// eslint-disable-next-line ts/consistent-type-definitions
type foo = { bar: 2 }
```

### Rules Overrides

Certain rules would only be enabled in specific files, for example, `ts/*` rules would only be enabled in `.ts` files and `vue/*` rules would only be enabled in `.vue` files. If you want to override the rules, you need to specify the file extension:

```js
// eslint.config.js
import { re_taro } from "@re-taro/eslint-config";

export default re_taro(
	{ vue: true, typescript: true },
	{
		// Remember to specify the file glob here, otherwise it might cause the vue plugin to handle non-vue files
		files: ["**/*.vue"],
		rules: {
			"vue/operator-linebreak": ["error", "before"],
		},
	},
	{
		// Without `files`, they are general rules for all files
		rules: {
			"style/semi": ["error", "never"],
		},
	},
);
```

We also provided an `overrides` options to make it easier:

```js
// eslint.config.js
import { re_taro } from "@re-taro/eslint-config";

export default re_taro({
	overrides: {
		vue: {
			"vue/operator-linebreak": ["error", "before"],
		},
		typescript: {
			"ts/consistent-type-definitions": ["error", "interface"],
		},
		yaml: {},
		// ...
	},
});
```

### Type Aware Rules

[Type Aware Rules](https://typescript-eslint.io/linting/typed-linting/) are enabled by default.

## License

MIT
