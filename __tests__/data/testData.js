import { jest } from '@jest/globals';
import { faker } from '@faker-js/faker';
import { formatDuration } from '../../src/sharedMethods/dateFormatting';
import {
  ALL_TEAM_NAMES,
  TEST_CATEGORIES_AVAILABLE,
  TEST_TYPES_AVAILABLE,
} from '../../src/constants';

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

// Dynamic test data generation utilities
export const generateRandomTestData = () => {
  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const generateRandomFolderStructure = () => {
    const numFolders = Math.floor(Math.random() * 6) + 1;
    const folders = Array.from({ length: numFolders }, () =>
      faker.lorem.word()
    );
    return folders.join('/');
  };

  const speedMillis = faker.number.int({ min: 0, max: 9999999 });
  const currentState = getRandomElement([
    'passed',
    'failed',
    'skipped',
    'pending',
  ]);
  const typesAvailable = TEST_TYPES_AVAILABLE();
  const categoriesAvailable = TEST_CATEGORIES_AVAILABLE();
  const teamNamesAvailable = ALL_TEAM_NAMES();

  return {
    area: generateRandomFolderStructure(),
    spec: `${faker.lorem.word()}`,
    testName: `${faker.lorem.words({ min: 1, max: 3 })} - ${faker.lorem.sentence(
      { min: 1, max: 6 }
    )} - ${faker.lorem.words({ min: 1, max: 3 })}`,
    type: getRandomElement(typesAvailable),
    category: getRandomElement(categoriesAvailable),
    teamName: getRandomElement(teamNamesAvailable),
    manualTestId: `C${faker.number.int({ min: 10, max: 99999 })}`,
    error:
      currentState === 'failed' ? faker.lorem.words({ min: 5, max: 20 }) : '',
    speedMillis: speedMillis,
    speed: formatDuration(speedMillis),
    state: currentState,
    projectName: faker.lorem.word(),
  };
};

// Generate sample test data
export const SAMPLE_TEST_DATA = {
  test1: generateRandomTestData(),
  test2: generateRandomTestData(),
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

// Report generation test data
export const REPORT_TEST_DATA = {
  fullReportOutput: {
    stats: {
      suites: 59,
      tests: 90,
      passes: 11,
      pending: 0,
      failures: 64,
      testsRegistered: 90,
      passPercent: 12.222222222222221,
      pendingPercent: 0,
      other: 0,
      hasOther: false,
      skipped: 15,
      hasSkipped: true,
      start: '2023-10-01T00:10:27.925Z',
      end: '2023-10-01T00:25:07.330Z',
      duration: 879405,
    },
    results: [
      {
        uuid: 'fkejghh8-a2ed-477d-g45jh-gdf5465',
        title: '',
        fullFile: `cypress/e2e/${SAMPLE_TEST_DATA.test1.area}/${SAMPLE_TEST_DATA.test1.spec}.spec.ts`,
        file: 'cypress/e2e/cart/groceries.spec.ts',
        beforeHooks: [],
        afterHooks: [],
        tests: [],
        suites: [
          {
            uuid: '4f53g4g-53d2-4af7-933e-gh456fghf',
            title: 'Cart',
            fullFile: '',
            file: '',
            beforeHooks: [],
            afterHooks: [],
            tests: [
              {
                title: 'should display link for adding to a cart',
                fullTitle: SAMPLE_TEST_DATA.test1.testName,
                timedOut: null,
                duration: SAMPLE_TEST_DATA.test1.speedMillis,
                state: SAMPLE_TEST_DATA.test1.state,
                speed: null,
                pass: false,
                fail: true,
                pending: false,
                context: null,
                code: "cart_1.CartsPage.elements.addToCartBtn().should('be.visible');",
                err: {
                  message: SAMPLE_TEST_DATA.test1.error,
                  estack:
                    "CypressError: `cy.task('ctrLogFiles')` failed with the following error:\n\nThe task 'ctrLogFiles' was not handled in the setupNodeEvents method. The following tasks are registered: getLocalConfig, dispatchSignIn, fileExists, safeReadJson, deleteFile\n\nFix this in your setupNodeEvents method here:",
                  diff: null,
                },
                uuid: '8f2f42fd-e603-4b7b-8c66-dfhjd456456',
                parentUUID: '4f53g4g-53d2-4af7-933e-gh456fghf',
                isHook: false,
                skipped: false,
                projectName: SAMPLE_TEST_DATA.test1.projectName,
              },
            ],
            suites: [],
            passes: [],
            failures: ['8f2f42fd-e603-4b7b-8c66-dfhjd456456'],
            pending: [],
            skipped: [
              '969a4015-008c-49d5-8afc-h4h6h6rydy',
              '4e6g6gfy-155f-4203-a06f-gh546gfd',
            ],
            duration: 199,
            root: false,
            rootEmpty: false,
            _timeout: 2000,
          },
        ],
        passes: [],
        failures: [],
        pending: [],
        skipped: [],
        duration: 0,
        root: true,
        rootEmpty: true,
        _timeout: 2000,
      },
      {
        uuid: 'df56-d2c5-4cd9-a1d3-gdh56456',
        title: '',
        fullFile: `cypress/e2e/${SAMPLE_TEST_DATA.test2.type}/${SAMPLE_TEST_DATA.test2.area}/${SAMPLE_TEST_DATA.test2.spec}.spec.ts`,
        file: 'cypress/e2e/shopper/getCart.spec.ts',
        beforeHooks: [],
        afterHooks: [],
        tests: [],
        suites: [
          {
            uuid: 'c9b6d209-24aa-472c-8f64-a15cae284337',
            title: 'Shopper - resend Coupon',
            fullFile: '',
            file: '',
            beforeHooks: [],
            afterHooks: [],
            tests: [],
            suites: [
              {
                uuid: 'hfg76-6521-4b60-9583-3562ffadd9a6',
                title: 'shopOwner',
                fullFile: '',
                file: '',
                beforeHooks: [],
                afterHooks: [],
                tests: [
                  {
                    title: `can resend invite to a user, [${SAMPLE_TEST_DATA.test2.manualTestId}]`,
                    fullTitle: `[${SAMPLE_TEST_DATA.test2.teamName}] ${SAMPLE_TEST_DATA.test2.testName}, [${SAMPLE_TEST_DATA.test2.category}]`,
                    timedOut: null,
                    duration: SAMPLE_TEST_DATA.test2.speedMillis,
                    state: SAMPLE_TEST_DATA.test2.state,
                    speed: null,
                    pass: false,
                    fail: true,
                    pending: false,
                    context: null,
                    code: 'cy.createShopper().then(function (response) {;',
                    err: {
                      message: SAMPLE_TEST_DATA.test2.error,
                      estack:
                        "CypressError: `cy.task('ctrLogFiles')` failed with the  error:\n\nThe task 'ctrLogFiles' was not handled in the setupNodeEvents method. The following tasks are registered: getLocalConfig, dispatchSignIn, fileExists, safeReadJson, deleteFile\n\nFix this in your setupNodeEvents method here:",
                      diff: null,
                    },
                    uuid: 'dgh6545-4555-45a0-a3cc-1068c2155ed6',
                    parentUUID: 'hfg76-6521-4b60-9583-3562ffadd9a6',
                    isHook: false,
                    skipped: false,
                    projectName: SAMPLE_TEST_DATA.test2.projectName,
                  },
                ],
                suites: [],
                passes: [],
                failures: ['dgh6545-4555-45a0-a3cc-1068c2155ed6'],
                pending: [],
                skipped: [],
                duration: 218,
                root: false,
                rootEmpty: false,
                _timeout: 2000,
              },
            ],
            passes: [],
            failures: [],
            pending: [],
            skipped: [],
            duration: 0,
            root: false,
            rootEmpty: false,
            _timeout: 2000,
          },
        ],
        passes: [],
        failures: [],
        pending: [],
        skipped: [],
        duration: 0,
        root: true,
        rootEmpty: true,
        _timeout: 2000,
      },
    ],
    meta: {
      mocha: {
        version: '7.0.1',
      },
      mochawesome: {
        options: {
          quiet: false,
          reportFilename: 'mochawesome',
          saveHtml: false,
          saveJson: true,
          consoleReporter: 'spec',
          useInlineDiffs: false,
          code: true,
        },
        version: '7.1.3',
      },
      marge: {
        options: {
          reportDir: 'cypress/reports',
          overwrite: false,
          html: false,
          json: true,
        },
        version: '6.2.0',
      },
    },
  },
};

// Utility functions for test data manipulation
export const updateErrorMessage = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => updateErrorMessage(item));
  }
  if (obj && typeof obj === 'object') {
    const newObj = { ...obj };
    for (const key in newObj) {
      if (key === 'err' || key === 'error') {
        newObj[key] = {
          message: faker.lorem.sentence(),
          estack: faker.lorem.paragraph(),
          diff: null,
        };
      } else {
        newObj[key] = updateErrorMessage(newObj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

// Test data validation
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
