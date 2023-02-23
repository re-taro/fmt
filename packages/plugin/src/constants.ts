import config from 'eslint-config-standard/.eslintrc.json';
import type { TSESLint } from '@typescript-eslint/utils';

export const TSEquivalents = [
  'comma-spacing',
  'brace-style',
  'func-call-spacing',
  'indent',
  'keyword-spacing',
  'lines-between-class-members',
  'no-array-constructor',
  'no-dupe-class-members',
  'no-redeclare',
  'no-unused-vars',
  'no-unused-expressions',
  'no-useless-constructor',
  'no-use-before-define',
  'quotes',
  'space-before-function-paren',
  'space-infix-ops',
  'object-curly-spacing',
] as const;

export const VueEquivalents = [
  'array-bracket-spacing',
  'arrow-spacing',
  'block-spacing',
  'brace-style',
  'camelcase',
  'comma-dangle',
  'comma-spacing',
  'comma-style',
  'dot-location',
  'dot-notation',
  'eqeqeq',
  'func-call-spacing',
  'key-spacing',
  'keyword-spacing',
  'no-constant-condition',
  'no-empty-pattern',
  'no-extra-parens',
  'no-irregular-whitespace',
  'no-loss-of-precision',
  'no-sparse-arrays',
  'object-curly-newline',
  'object-curly-spacing',
  'object-property-newline',
  'object-shorthand',
  'operator-linebreak',
  'quote-props',
  'space-in-parens',
  'space-infix-ops',
  'space-unary-ops',
  'template-curly-spacing',
] as const;

export const configStandard = config as unknown as TSESLint.Linter.Config;

export const resolverExtensions = ['.js', '.jsx', '.mjs', '.cjs', '.json'];
export const resolverExtensionsWithTS = ['.ts', '.tsx', ...resolverExtensions];
