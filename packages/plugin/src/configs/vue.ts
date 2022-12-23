import { VueEquivalents } from '../constants'
import { defineConfig, fromEntries, ruleFromStandard } from '../utils'

export default defineConfig({
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      extends: ['plugin:vue/vue3-recommended'],
      env: {
        'vue/setup-compiler-macros': true,
      },
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
        ...fromEntries(VueEquivalents.map(name => [`vue/${name}`, ruleFromStandard(name)])),
        'vue/quote-props': ['error', 'consistent-as-needed'],
        'vue/no-unused-vars': ['error', { ignorePattern: '^_' }],
        'vue/camelcase': 'off',
        'vue/comma-dangle': ['error', 'always-multiline'],
        'vue/max-attributes-per-line': ['warn', { singleline: 5 }],
        'vue/no-v-html': 'off',
        'vue/require-default-prop': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/block-tag-newline': ['error', {
          singleline: 'always',
          multiline: 'always',
        }],
        'vue/component-name-in-template-casing': ['error', 'PascalCase'],
        'vue/component-options-name-casing': ['error', 'PascalCase'],
        'vue/custom-event-name-casing': ['error', 'camelCase'],
        'vue/define-macros-order': ['error', {
          order: ['defineProps', 'defineEmits'],
        }],
        'vue/html-comment-content-spacing': ['error', 'always', {
          exceptions: ['-'],
        }],
        'vue/no-restricted-v-bind': ['error', '/^v-/'],
        'vue/no-useless-v-bind': 'error',
        'vue/no-v-text-v-html-on-component': 'error',
        'vue/padding-line-between-blocks': ['error', 'always'],
        'vue/prefer-separate-static-class': 'error',
      },
    },
  ],
})
