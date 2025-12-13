import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,

  // Disable Prettier conflicts - focus on code quality, not style
  prettierConfig,

  // Your custom rules
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        alert: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        setInterval: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        history: 'readonly',
        navigator: 'readonly',

        // Common module globals you might use
        gtag: 'readonly',
        L: 'readonly', // Leaflet
        P4C: 'writable', // Your custom namespace
      },
    },
    rules: {
      // Code Quality Rules
      eqeqeq: ['error', 'always'], // Forces use of === instead of ==
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warn about unused variables

      // Allows console messages for debugging
      'no-console': 'off',

      // More lenient naming conventions
      'no-useless-escape': 'warn',

      // Stylistic rules - set to warn to avoid conflicts with existing code
      quotes: ['warn', 'single'],
      semi: ['warn', 'always'],
    },
  },
];
