import { jest } from '@jest/globals';

/**
 * Centralized test data for the qa-shadow-report project
 * This file contains all shared test data used across different test files
 */

// File paths used in tests
export const TEST_PATHS = {
  cypress: 'cypress/e2e/cart/shopping.spec.ts',
  unit: 'src/tests/unit/cart/shopping.spec.ts',
  integration: 'integration/tests/anotherTest.test.jsx',
  nested: 'src/tests/deeply/nested/directory/testFile.spec.ts',
  complexName: 'src/tests/complex.name.spec.ts',
  noExtension: 'src/tests/noExtension',
  dotFile: 'src/tests/.spec.ts',
  cyTest: 'tests/unit/someTest.cy.js',
};

// Test categories used in test titles
export const TEST_CATEGORIES = {
  valid: ['functional', 'performance', 'regression'],
  invalid: 'invalidCategory',
  empty: [],
};

// Test types used in file paths
export const TEST_TYPES = {
  valid: ['unit', 'integration', 'e2e'],
  invalid: 'invalidType',
  empty: [],
};

// Team names used in test titles
export const TEST_TEAMS = {
  valid: ['TeamA', 'TeamB', 'TeamC'],
  invalid: ['InvalidTeam'],
  empty: [],
};

// Test case IDs used in test titles
export const TEST_IDS = {
  valid: ['C12345', 'C67890', 'C11111'],
  invalid: ['InvalidID'],
  empty: [],
};

// Sample test objects
export const TEST_OBJECTS = {
  valid: {
    fullTitle: '[functional] [TeamA] Test Name - [C12345]',
    fullFile: TEST_PATHS.cypress,
  },
  multipleCategories: {
    fullTitle:
      '[performance] [regression] [TeamA] [TeamB] Complex Test - [C12345]',
    fullFile: TEST_PATHS.integration,
  },
  noCategory: {
    fullTitle: 'Add items to cart - [C12345]',
    fullFile: TEST_PATHS.unit,
  },
  invalidCategory: {
    fullTitle: '[invalidCategory] Add items to cart - [C12345]',
    fullFile: TEST_PATHS.unit,
  },
  emptyTitle: {
    fullTitle: '',
    fullFile: TEST_PATHS.unit,
  },
  longTitle: {
    fullTitle: '[functional] ' + 'a'.repeat(1000) + ' - [C12345]',
    fullFile: TEST_PATHS.unit,
  },
};

// Boundary test data
export const BOUNDARY_TEST_DATA = {
  maxLengthPath: 'a/'.repeat(255) + 'test.spec.ts',
  minLengthPath: 'a.spec.ts',
  largePath: 'a/'.repeat(1000) + 'test.spec.ts',
};

// Invalid test data
export const INVALID_TEST_DATA = {
  nonString: 12345,
  nonArray: 'notAnArray',
  nullValue: null,
  undefinedValue: undefined,
  emptyObject: {},
  missingProperty: { title: 'Missing fullTitle' },
};

// Payload test data
export const PAYLOAD_TEST_DATA = {
  emptyDailyPayload: {
    passed: [],
    failed: [],
    pending: [],
    skipped: [],
    stats: {
      suites: 0,
      tests: 0,
      passes: 0,
      pending: 0,
      failures: 0,
      testsRegistered: 0,
      passPercent: 0,
      pendingPercent: 0,
      other: 0,
      hasOther: false,
      skipped: 0,
      hasSkipped: false,
      start: '',
      end: '',
      duration: 0,
    },
  },
  sampleDailyPayload: {
    passed: [
      {
        title: 'Test 1',
        fullTitle: '[functional] [TeamA] Test 1 - [C12345]',
        state: 'passed',
        duration: 100,
      },
    ],
    failed: [
      {
        title: 'Test 2',
        fullTitle: '[performance] [TeamB] Test 2 - [C67890]',
        state: 'failed',
        duration: 200,
        error: 'Test failed',
      },
    ],
    pending: [
      {
        title: 'Test 3',
        fullTitle: '[regression] [TeamC] Test 3 - [C11111]',
        state: 'pending',
        duration: 0,
      },
    ],
    skipped: [
      {
        title: 'Test 4',
        fullTitle: '[functional] [TeamA] Test 4 - [C12345]',
        state: 'skipped',
        duration: 0,
      },
    ],
    stats: {
      suites: 4,
      tests: 4,
      passes: 1,
      pending: 1,
      failures: 1,
      testsRegistered: 4,
      passPercent: 25,
      pendingPercent: 25,
      other: 0,
      hasOther: false,
      skipped: 1,
      hasSkipped: true,
      start: '2024-03-11T00:00:00.000Z',
      end: '2024-03-11T00:00:00.300Z',
      duration: 300,
    },
  },
  invalidPayload: {
    passed: 'not an array',
    failed: null,
    pending: undefined,
    skipped: 123,
    stats: 'not an object',
  },
};

describe('Test Data', () => {
  describe('TEST_PATHS', () => {
    it('should contain valid file paths', () => {
      expect(TEST_PATHS.cypress).toBe('cypress/e2e/cart/shopping.spec.ts');
      expect(TEST_PATHS.unit).toBe('src/tests/unit/cart/shopping.spec.ts');
      expect(TEST_PATHS.integration).toBe(
        'integration/tests/anotherTest.test.jsx'
      );
      expect(TEST_PATHS.nested).toBe(
        'src/tests/deeply/nested/directory/testFile.spec.ts'
      );
      expect(TEST_PATHS.complexName).toBe('src/tests/complex.name.spec.ts');
      expect(TEST_PATHS.noExtension).toBe('src/tests/noExtension');
      expect(TEST_PATHS.dotFile).toBe('src/tests/.spec.ts');
      expect(TEST_PATHS.cyTest).toBe('tests/unit/someTest.cy.js');
    });
  });

  describe('TEST_CATEGORIES', () => {
    it('should contain valid test categories', () => {
      expect(TEST_CATEGORIES.valid).toEqual([
        'functional',
        'performance',
        'regression',
      ]);
      expect(TEST_CATEGORIES.invalid).toBe('invalidCategory');
      expect(TEST_CATEGORIES.empty).toEqual([]);
    });
  });

  describe('TEST_TYPES', () => {
    it('should contain valid test types', () => {
      expect(TEST_TYPES.valid).toEqual(['unit', 'integration', 'e2e']);
      expect(TEST_TYPES.invalid).toBe('invalidType');
      expect(TEST_TYPES.empty).toEqual([]);
    });
  });

  describe('TEST_TEAMS', () => {
    it('should contain valid team names', () => {
      expect(TEST_TEAMS.valid).toEqual(['TeamA', 'TeamB', 'TeamC']);
      expect(TEST_TEAMS.invalid).toEqual(['InvalidTeam']);
      expect(TEST_TEAMS.empty).toEqual([]);
    });
  });

  describe('TEST_IDS', () => {
    it('should contain valid test IDs', () => {
      expect(TEST_IDS.valid).toEqual(['C12345', 'C67890', 'C11111']);
      expect(TEST_IDS.invalid).toEqual(['InvalidID']);
      expect(TEST_IDS.empty).toEqual([]);
    });
  });

  describe('TEST_OBJECTS', () => {
    it('should contain valid test objects', () => {
      expect(TEST_OBJECTS.valid.fullTitle).toBe(
        '[functional] [TeamA] Test Name - [C12345]'
      );
      expect(TEST_OBJECTS.valid.fullFile).toBe(TEST_PATHS.cypress);
    });
  });
});
