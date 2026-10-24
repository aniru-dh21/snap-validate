const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  // Global ignores (replaces .eslintignore)
  {
    ignores: ['node_modules/', 'dist/', 'coverage/']
  },

  // ESLint's recommended baseline
  js.configs.recommended,

  // Project source (CommonJS)
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      }
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-unused-vars': 'error',
      'no-console': 'warn'
    }
  },

  // ESM entry point (esm/*.mjs): same style rules, module syntax
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-unused-vars': 'error'
    }
  },

  // Tests: add Jest globals and allow console
  {
    files: ['tests/**/*.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    },
    rules: {
      'no-console': 'off'
    }
  }
];
