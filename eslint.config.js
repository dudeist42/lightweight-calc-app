import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from "eslint-config-prettier/flat";
import prettierPlugin from 'eslint-plugin-prettier';

export default defineConfig([
  {
    ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**'],
  },
  
  eslintConfigPrettier,
  
  ...tseslint.configs.recommended,
  
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      prettier: prettierPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      "react/no-unknown-property": ["error", { ignore: ["css"] }],
      "prettier/prettier": "error"
    },
    settings: {
      react: { version: '19' },
    },
  },
]);