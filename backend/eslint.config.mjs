import tsParser from '@typescript-eslint/parser';
export default [
  { ignores: ['node_modules/**', 'dist/**', '.angular/**', 'coverage/**'] },
  { files: ['src/**/*.ts'], languageOptions: { parser: tsParser, ecmaVersion: 'latest', sourceType: 'module' },
    rules: { 'no-debugger': 'error', 'no-dupe-else-if': 'error', 'no-unreachable': 'error', 'constructor-super': 'error' } },
];
