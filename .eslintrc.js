module.exports = {
  extends: ['next/core-web-vitals'],
  plugins: ['simple-import-sort', '@typescript-eslint'],
  rules: {
    'simple-import-sort/exports': 'error',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // Packages 'react' related packages come first.
              ['^react', '^@?\\w'],
              // Internal packages.
              ['^@components/(.*)$'],
              // Side effect imports.
              ['^\\u0000'],
              // Parent imports. Put '..' last.
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Other relative imports. Put same-folder imports and '.' last.
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              // Style imports.
            ],
          },
        ],
      },
    },
  ],
};
