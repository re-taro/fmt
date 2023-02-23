import { defineConfig, fromEntries, ruleFromStandard } from '../utils';
import { TSEquivalents, resolverExtensionsWithTS } from '../constants';

export default defineConfig({
  extends: ['plugin:@re-taro/esnext', 'plugin:import/typescript'],
  settings: {
    'import/extensions': resolverExtensionsWithTS,
    'import/external-module-folders': ['node_modules', 'node_modules/@types'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: resolverExtensionsWithTS,
      },
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  overrides: [
    {
      files: ['*.d.ts'],
      rules: {
        'import/no-duplicates': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        ...fromEntries(TSEquivalents.map(name => [name, 'off'])),
        ...fromEntries(
          TSEquivalents.map(name => [
            `@typescript-eslint/${name}`,
            ruleFromStandard(name),
          ]),
        ),
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-use-before-define': [
          'error',
          {
            functions: false,
            classes: false,
            enums: false,
            variables: true,
            typedefs: false,
          },
        ],
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
        '@typescript-eslint/space-before-function-paren': ['error', 'never'],
        '@typescript-eslint/ban-ts-comment': [
          'error',
          { 'ts-ignore': 'allow-with-description' },
        ],
        '@typescript-eslint/member-delimiter-style': [
          'error',
          {
            multiline: { delimiter: 'none' },
            singleline: { delimiter: 'comma', requireLast: false },
          },
        ],
        '@typescript-eslint/type-annotation-spacing': 'error',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', disallowTypeAnnotations: false },
        ],
        '@typescript-eslint/consistent-indexed-object-style': [
          'error',
          'record',
        ],
        '@typescript-eslint/consistent-type-definitions': [
          'error',
          'interface',
        ],
        '@typescript-eslint/prefer-ts-expect-error': 'error',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/parameter-properties': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-namespace': 'off',
      },
    },
  ],
});
