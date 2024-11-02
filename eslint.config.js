import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        Image: 'readonly',
        requestAnimationFrame: 'readonly',
      },
    },
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    rules: {
      'prefer-const': 'warning',
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
    },
  }
);