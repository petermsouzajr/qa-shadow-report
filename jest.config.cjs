module.exports = {
  // Other Jest configuration options...
  transform: {
    '^.+\\.m?js$': 'babel-jest', // This regex allows for both .mjs and .js file extensions
  },
  transformIgnorePatterns: [
    'node_modules/(?!(module-that-needs-transpiling)/)', // Add any modules that need to be transpiled by Babel
  ],
  // If you're using ESM, you might need the following options as well:
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'ts', 'json', 'node'],
  collectCoverageFrom: ['src/**/*.mjs', 'src/**/*.js'],
  testMatch: [
    '**/__tests__/**/*.mjs',
    '**/?(*.)+(spec|test).mjs',
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  // ... any other configuration options
};
