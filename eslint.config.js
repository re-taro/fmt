// @ts-expect-error missing types
import styleMigrate from '@stylistic/eslint-plugin-migrate'
import { tsImport } from 'tsx/esm/api'

/** @type {typeof import('./packages/eslint-config/src/index.ts')} */
const { re_taro } = await tsImport("./packages/eslint-config/src/index.ts", import.meta.url)

export default re_taro(
	{
    vue: true,
    react: true,
    solid: true,
    svelte: true,
    astro: true,
    typescript: true,
    formatters: true,
    type: 'lib',
  },
  {
    ignores: [
      'packages/eslint-config/fixtures',
      'packages/eslint-config/_fixtures',
    ],
  },
  {
    files: ['packages/eslint-config/src/**/*.ts'],
    rules: {
      'perfectionist/sort-objects': 'error',
    },
  },
  {
    files: ['packages/eslint-config/src/configs/*.ts'],
    plugins: {
      'style-migrate': styleMigrate,
    },
    rules: {
      'style-migrate/migrate': ['error', { namespaceTo: 'style' }],
    },
  },
);
