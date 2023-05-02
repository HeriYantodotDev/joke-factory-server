/* eslint-disable-next-line no-undef */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    eqeqeq: 'warn',
    semi: ['error', 'always'],
    quotes: ['warn', 'single'],
    'comma-dangle': [
      'warn',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'never',
        exports: 'never',
        functions: 'never',
      },
    ],
    '@typescript-eslint/member-delimiter-style': ['warn', {
      'multiline': {
        'delimiter': 'comma',
        'requireLast': true,
      },
      'singleline': {
        'delimiter': 'semi',
        'requireLast': false,
      },
    }],
    'max-len': ['warn', { 'code': 115 }],
    'no-console': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    'build-client/',
    'dist/',
    '*.config.js',
  ],
};
