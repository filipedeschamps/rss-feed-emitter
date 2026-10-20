import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [
  {
    ignores: ['coverage/**', 'types/**', '**/*{.,-}min.js'],
  },
  js.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
    braceStyle: '1tbs',
    arrowParens: true,
  }),
  {
    files: ['**/*.js', '**/*.cjs'],
    plugins: { jsdoc },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    settings: {
      jsdoc: {
        mode: 'typescript',
        tagNamePreference: { return: 'returns', augments: 'extends' },
        preferredTypes: {
          String: 'string',
          Number: 'number',
          Boolean: 'boolean',
          Function: 'function',
          object: 'Object',
          date: 'Date',
          error: 'Error',
        },
      },
    },
    rules: {
      complexity: ['error', 10],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      eqeqeq: ['error', 'always'],
      'no-unused-expressions': 'error',
      '@stylistic/max-len': ['error', { code: 140, ignoreStrings: true, ignoreTemplateLiterals: true }],
      '@stylistic/operator-linebreak': ['error', 'before'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/max-statements-per-line': 'off',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/check-types': ['error', { unifyParentAndChildTypeChecks: true }],
      'jsdoc/require-param-type': 'error',
      'jsdoc/require-returns-type': 'error',
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      strict: ['error', 'global'],
    },
  },
  {
    files: ['test/**/*.js', 'test/**/*.cjs'],
    languageOptions: {
      globals: { ...globals.mocha },
    },
    rules: {
      'no-unused-expressions': 'off',
    },
  },
];
