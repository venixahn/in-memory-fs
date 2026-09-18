import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import prettier from 'eslint-config-prettier'
import sonarjs from 'eslint-plugin-sonarjs'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const config = tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  eslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*'],
              message: 'Use the @app/ alias',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    plugins: { sonarjs },
    rules: {
      'no-restricted-imports': 'off',
      'prefer-arrow-callback': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      complexity: ['error', 10],
      'sonarjs/cognitive-complexity': ['error', 15],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'max-lines-per-function': [
        'error',
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
      'max-statements': ['error', 20],
      'max-nested-callbacks': ['error', 3],
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      'prefer-arrow-callback': 'off',
      'func-style': ['error', 'declaration', { allowArrowFunctions: false }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ArrowFunctionExpression',
          message: 'Use a normal function in tests, not an arrow',
        },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,ts}'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'always',
          asyncArrow: 'always',
        },
      ],
    },
  },
)

export default config
