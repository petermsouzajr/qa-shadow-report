module.exports = {
  env: {
    es2021: true,
    node: true,
    jest: true,
    commonjs: true,
  },
  extends: 'eslint:recommended',
  plugins: ['jsdoc'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'docs/',
    'cypress-example/',
    'playwright-example/',
    '**/*.test.js',
    '__tests__/',
  ],
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'prefer-const': 'error',
    'jsdoc/require-jsdoc': [
      'warn',
      {
        publicOnly: true,
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
        },
      },
    ],
    'jsdoc/require-param': 'warn',
    'jsdoc/require-returns': 'warn',
    'jsdoc/require-returns-type': 'warn',
    'jsdoc/valid-types': 'warn',
  },
};
