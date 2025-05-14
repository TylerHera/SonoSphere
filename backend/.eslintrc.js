module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json', // Assumes tsconfig.json is in the same directory (backend/)
    tsconfigRootDir: __dirname, // Correctly sets the root for tsconfig.json path resolution
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
    // 'prettier', // If you only want to disable ESLint rules that conflict with Prettier, not run Prettier as a linter rule.
    'plugin:prettier/recommended', // Displays Prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  root: true, // Important to prevent ESLint from looking for configs in parent directories
  env: {
    node: true, // Enables Node.js global variables and Node.js scoping.
    jest: true, // Adds all of the Jest testing global variables.
  },
  ignorePatterns: [
    '.eslintrc.js', 
    'dist/**', // Ignore the build output directory
    'node_modules/**' // Standard ignore
  ],
  rules: {
    // Override or add rules settings here. 
    // Example: Turning off rules that might be too strict during initial development.
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}; 