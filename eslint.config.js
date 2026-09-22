const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*', '.expo/*', 'src/uniwind-types.d.ts'],
  },
  {
    rules: {
      'import/no-named-as-default-member': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['../*'], message: 'Use the @/ alias instead of parent-relative imports.' },
          ],
        },
      ],
    },
  },
]);
