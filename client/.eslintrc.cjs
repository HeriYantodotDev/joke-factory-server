module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    semi: ['warn', 'always'], 
    'comma-dangle': ['warn', 'always-multiline'],
    quotes: ['warn', 'single'],
    'max-len': ['warn', { code: 121 }], 
    indent: ['warn', 2, { SwitchCase: 1}],
    'no-console': 'warn', 
  },
}
