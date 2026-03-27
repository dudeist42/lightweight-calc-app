export default {
  printWidth: 100,
  semi: true,
  trailingComma: 'all',
  tabWidth: 2,
  singleQuote: true,
  bracketSpacing: true,
  arrowParens: 'always',
  overrides: [
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
  ],
};