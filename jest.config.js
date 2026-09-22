export default {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'node'],
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.js',
    'scripts/**/*.js',
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/cypress-example/',
    '/playwright-example/',
  ],
  transform: {},
};
