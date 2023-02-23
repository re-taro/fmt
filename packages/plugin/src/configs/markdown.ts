import { defineConfig } from '../utils';

export default defineConfig({
  extends: [
    'plugin:markdown/recommended',
  ],
  overrides: [
    {
      files: ['**/*.md/*.*'],
      rules: {
        'no-alert': 'off',
        'no-console': 'off',
        'no-restricted-imports': 'off',
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-unused-expressions': 'off',
        'react/jsx-no-undef': 'off',
        'import/no-unresolved': 'off',
        '@typescript-eslint/no-redeclare': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
});
