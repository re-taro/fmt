import { defineRules } from '../../utils';

export default defineRules({
  'block-scoped-var': 'error',
  'eqeqeq': ['error', 'smart'],
  'no-alert': 'warn',
  'no-unreachable': 'error',
  'semi': ['error', 'always'],
  'vars-on-top': 'error',
  'no-eval': 'error',
});
