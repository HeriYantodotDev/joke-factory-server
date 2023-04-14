/* eslint-disable-next-line no-undef */
module.exports = {
  // prettier-ignore
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './server/tsconfig.eslint.json',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    eqeqeq: 'warn',
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        trailingComma: 'all',
        arrowParens: 'avoid',
        printWidth: 108,
        tabWidth: 2,
      },
    ],
  },
};

// //common use
// semi: 'warn',
// quotes: ['warn', 'single'],
// indent: ['error', 2],
// 'no-console': 'warn',
// 'no-debugger': 'error',
// 'no-alert': 'error',
// 'no-dupe-args': 'error',
// 'no-empty': ['error', { allowEmptyCatch: true }],
// 'no-eq-null': 'error',
// 'no-invalid-this': 'error',
// 'no-multi-spaces': 'error',
// 'no-use-before-define': ['error', { functions: false, classes: false }],
// 'no-var': 'error',
// 'prefer-const': 'error',
// 'prefer-template': 'error',
// 'prefer-arrow-callback': 'error',
// 'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
// 'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
// 'arrow-spacing': 'error',
// 'prefer-destructuring': ['error', { object: true, array: false }],
// 'object-shorthand': 'error',
// 'array-bracket-spacing': ['error', 'never'],
// 'no-unused-vars': 'off',
// '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
