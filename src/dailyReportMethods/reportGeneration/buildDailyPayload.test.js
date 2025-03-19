import { jest } from '@jest/globals';
import * as constants from '../../../constants.js';
import { buildDailyPayload } from './buildDailyPayload.js';

// Mock the global configuration
global.shadowConfigDetails = {
  testTypes: ['unit', 'integration', 'e2e'],
  testCategories: ['smoke', 'regression', 'performance'],
  teamNames: ['team1', 'team2'],
};

// Mock the modules before importing
jest.mock('../../../constants.js', () => {
  const mockColumnsAvailable = jest.fn();
  mockColumnsAvailable.mockImplementation((playwright) => {
    let baseColumns = [
      'area',
      'spec',
      'testName',
      'type',
      'category',
      'team',
      'priority',
      'status',
      'state',
      'manualTestId',
      'error',
      'speed',
    ];

    if (playwright) {
      baseColumns.shift();
      baseColumns = ['browser', ...baseColumns];
    }

    return baseColumns;
  });

  return {
    COLUMNS_AVAILABLE: mockColumnsAvailable,
    DEFAULT_HEADER_METRICS: [
      'Total Tests',
      'Passed',
      'Failed',
      'Skipped',
      'Pending',
    ],
    FOOTER_ROW: ['', '', '', '', '', '', '', '', 'Total'],
  };
});

jest.mock('../extraction/dataExtractionUtilities.js', () => ({
  extractAreaFromFullFile: jest.fn().mockResolvedValue('test-area'),
  extractSpecFromFullFile: jest.fn().mockReturnValue('test.spec.js'),
  extractTypeFromFullFile: jest.fn().mockReturnValue('Smoke'),
  extractManualTestCaseIdFromTest: jest.fn().mockReturnValue('TC-123'),
  extractTeamNameFromTest: jest.fn().mockReturnValue('Team1'),
  extractCategoryFromTest: jest.fn().mockReturnValue('Category1'),
  extractTestNameFromFullTitle: jest.fn().mockReturnValue('Test Name'),
}));

jest.mock('../initialization/initializeDailyPayload.js', () => ({
  initializeDailyPayload: jest.fn().mockReturnValue({
    bodyPayload: [],
    headerPayload: [],
    footerPayload: [],
    summaryHeaderStylePayload: [],
    summaryGridStyles: [],
  }),
}));

jest.mock('../processing/processTestSuites.js', () => ({
  processTestSuites: jest
    .fn()
    .mockImplementation(async (results, playwright) => {
      return results.flatMap((suite) =>
        suite.suites.flatMap((s) =>
          s.tests.map((test) => ({
            area: 'test-area',
            spec: 'test.spec.js',
            testName: test.title,
            type: 'Smoke',
            category: 'Category1',
            team: 'Team1',
            priority: 'P1',
            status: test.state,
            state: test.state,
            manualTestId: 'TC-123',
            error: test.err?.message || '',
            speed: test.speed,
          }))
        )
      );
    }),
}));

jest.mock('../processing/sortDailyReportRows.js', () => ({
  sortPayload: jest.fn(),
}));

jest.mock('./appendStateReportsToHeader.js', () => ({
  appendStateReportsToHeader: jest.fn(),
}));

jest.mock('./constructHeaderReport.js', () => ({
  constructHeaderReport: jest
    .fn()
    .mockResolvedValue([
      ['Test Report'],
      ['Date: 2025-03-04'],
      ['Total Tests: 2'],
      ['Passed: 1'],
      ['Failed: 1'],
      ['Skipped: 0'],
      ['Pending: 0'],
    ]),
}));

jest.mock('../../monthlySummaryMethods/summaryGenerationHelpers.js', () => ({
  findHeaderRowIndex: jest.fn().mockReturnValue(3),
}));

// Mock global functions
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
  // Reset global configuration
  global.shadowConfigDetails = {
    testTypes: ['unit', 'integration', 'e2e'],
    testCategories: ['smoke', 'regression', 'performance'],
    teamNames: ['team1', 'team2'],
  };
});

describe('buildDailyPayload', () => {
  // Basic Functionality Tests
  describe('Basic Functionality', () => {
    it.skip('should build the daily payload correctly for Playwright', async () => {
      const testSuite = {
        uuid: '6a4a6edb-925e-4089-b954-fd8eb5f2a2d6',
        title: 'Test Suite 1',
        fullFile: 'tests/e2e/specs/test.spec.js',
        file: 'tests/e2e/specs/test.spec.js',
        beforeHooks: [],
        afterHooks: [],
        tests: [],
        suites: [
          {
            uuid: 'c277659e-02d3-47a2-953a-3434cf00b6d0',
            title: 'Actions',
            fullFile: 'tests/e2e/specs/test.spec.js',
            file: 'tests/e2e/specs/test.spec.js',
            beforeHooks: [],
            afterHooks: [],
            tests: [
              {
                title: '[TC-123] Test 1',
                fullTitle: '[Team1] [Smoke] Test Suite 1 Test 1',
                timedOut: null,
                duration: 100,
                state: 'passed',
                speed: 'fast',
                pass: true,
                fail: false,
                pending: false,
                context: null,
                code: '',
                err: {},
                uuid: '90ee21a3-c0e2-446a-9374-5ddfd6b206fe',
                parentUUID: 'c277659e-02d3-47a2-953a-3434cf00b6d0',
                isHook: false,
                skipped: false,
                projectName: 'TestProject',
              },
              {
                title: '[TC-124] Test 2',
                fullTitle: '[Team1] [Regression] Test Suite 1 Test 2',
                timedOut: null,
                duration: 200,
                state: 'failed',
                speed: 'fast',
                pass: false,
                fail: true,
                pending: false,
                context: null,
                code: '',
                err: { message: 'Test failed' },
                uuid: '538cb73f-76b2-48bf-bebf-ce491a0c7938',
                parentUUID: 'c277659e-02d3-47a2-953a-3434cf00b6d0',
                isHook: false,
                skipped: false,
                projectName: 'TestProject',
              },
            ],
            suites: [],
            passes: ['90ee21a3-c0e2-446a-9374-5ddfd6b206fe'],
            failures: ['538cb73f-76b2-48bf-bebf-ce491a0c7938'],
            pending: [],
            skipped: [],
            duration: 300,
            root: false,
            rootEmpty: false,
            _timeout: 2000,
          },
        ],
        passes: [],
        failures: [],
        pending: [],
        skipped: [],
        duration: 300,
        root: true,
        rootEmpty: false,
        _timeout: 2000,
      };

      const dataSet = {
        stats: {
          suites: 1,
          tests: 2,
          passes: 1,
          pending: 0,
          failures: 1,
          start: '2025-03-04T07:19:16.992Z',
          end: '2025-03-04T07:20:38.764Z',
          duration: 300,
        },
        results: [testSuite],
      };

      const playwright = true;

      const payload = await buildDailyPayload(dataSet, playwright);

      expect(payload).toHaveProperty('bodyPayload');
      expect(payload).toHaveProperty('headerPayload');
      expect(payload).toHaveProperty('footerPayload');
      expect(payload.bodyPayload).toHaveLength(2);
      expect(payload.headerPayload.length).toBeGreaterThan(0);
      expect(payload.footerPayload).toHaveLength(1);
    });

    it('should throw an error if dataSet is not an object', async () => {
      await expect(buildDailyPayload(null, true)).rejects.toThrow(
        'Invalid dataSet: Expected an object.'
      );
    });

    it('should throw an error if playwright is not a boolean', async () => {
      const dataSet = {
        stats: {
          suites: 0,
          tests: 0,
          passes: 0,
          pending: 0,
          failures: 0,
          start: '2025-03-04T07:19:16.992Z',
          end: '2025-03-04T07:20:38.764Z',
          duration: 0,
        },
        results: [],
      };

      await expect(buildDailyPayload(dataSet, 'not-a-boolean')).rejects.toThrow(
        'Invalid playwright flag: Expected a boolean.'
      );
    });

    it.skip('should throw an error if columnsAvailable is not an array', async () => {
      const dataSet = {
        stats: {
          suites: 0,
          tests: 0,
          passes: 0,
          pending: 0,
          failures: 0,
          start: '2025-03-04T07:19:16.992Z',
          end: '2025-03-04T07:20:38.764Z',
          duration: 0,
        },
        results: () => {},
      };

      // Update the mock implementation for this test
      const { COLUMNS_AVAILABLE } = jest.requireMock('../../../constants.js');
      COLUMNS_AVAILABLE.mockReturnValue('not an array');

      await expect(buildDailyPayload(dataSet, true)).rejects.toThrow(
        'Invalid dataSet: Expected results to be an array.'
      );

      // Reset the mock for other tests
      COLUMNS_AVAILABLE.mockImplementation((playwright) => {
        let baseColumns = [
          'area',
          'spec',
          'testName',
          'type',
          'category',
          'team',
          'priority',
          'status',
          'state',
          'manualTestId',
          'error',
          'speed',
        ];

        if (playwright) {
          baseColumns.shift();
          baseColumns = ['browser', ...baseColumns];
        }

        return baseColumns;
      });
    });
  });
});
