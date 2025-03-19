import { jest } from '@jest/globals';

// Mock constants before importing modules
jest.unstable_mockModule('../../constants.js', () => ({
  TEST_TYPES_AVAILABLE: () => ['e2e', 'integration', 'unit'],
  TEST_CATEGORIES_AVAILABLE: () => ['smoke', 'regression', 'sanity'],
  ALL_TEAM_NAMES: () => ['Team1', 'Team2', 'team-3', 'team1'],
}));

// Mock helper functions
jest.unstable_mockModule('./extraction/dataExtractionUtilities.js', () => ({
  extractAreaFromFullFile: jest.fn(async (fullFile) => 'TestArea'),
  extractSpecFromFullFile: jest.fn(async (fullFile) => 'TestSpec'),
  extractTypeFromFullFile: jest.fn(async (fullFile, types) => 'e2e'),
  extractManualTestCaseIdFromTest: jest.fn(async (test) => 'TC123'),
  extractTeamNameFromTest: jest.fn((test, teams) => {
    if (!test || !test.fullTitle) {
      throw new TypeError(
        'The "test" object must have a "fullTitle" property of type string.'
      );
    }
    if (typeof test.fullTitle !== 'string') {
      throw new TypeError(
        'The "test" object must have a "fullTitle" property of type string.'
      );
    }
    if (!Array.isArray(teams) || teams.length === 0) {
      return '';
    }
    const match = test.fullTitle.match(/\[(.*?)\]/);
    return match ? match[1] : '';
  }),
  extractCategoryFromTest: jest.fn(async (test, categories) => 'smoke'),
  extractTestNameFromFullTitle: jest.fn(async (fullTitle) => 'Test Case'),
}));

jest.unstable_mockModule('../sharedMethods/dateFormatting.js', () => ({
  formatDuration: jest.fn(async (duration) => '1s'),
}));

jest.unstable_mockModule('./utilities/cellMaxLength.js', () => ({
  enforceMaxLength: jest.fn(
    (str, maxLength) => str?.substring(0, maxLength) || ''
  ),
}));

// Import modules after mocking
const { constructReportPayloadEntry } = await import('./buildReport.js');
const { extractTeamNameFromTest } = await import(
  './extraction/dataExtractionUtilities.js'
);

describe('Daily Report Methods', () => {
  // Test Data Setup
  const createTestParams = (result, test, playwright) => ({
    result,
    test,
    playwright,
  });

  // constructReportPayloadEntry Tests
  describe('constructReportPayloadEntry', () => {
    const isPlaywrightOptions = [true, false];
    isPlaywrightOptions.forEach((isPlaywright) => {
      const testFramework = isPlaywright ? 'Playwright' : 'Cypress';

      describe(`when using ${testFramework}`, () => {
        it('should construct a payload entry with valid inputs', async () => {
          const params = createTestParams(
            {
              fullFile: 'path/to/test.spec.js',
              state: 'passed',
            },
            {
              fullTitle: 'Test Suite [Team1] Test Case',
              duration: 1000,
              projectName: 'Project A',
              err: null,
              state: 'passed',
            },
            isPlaywright
          );

          const result = await constructReportPayloadEntry(
            params.result,
            params.test,
            params.playwright
          );

          expect(result).toBeDefined();
          expect(result).toHaveProperty('area');
          expect(result).toHaveProperty('spec');
          expect(result).toHaveProperty('testName');
          expect(result).toHaveProperty('type');
          expect(result).toHaveProperty('category');
          expect(result).toHaveProperty('team');
          expect(result).toHaveProperty('priority');
          expect(result).toHaveProperty('status');
          expect(result).toHaveProperty('state');
          expect(result).toHaveProperty('manualTestId');
          expect(result).toHaveProperty('error');
          expect(result).toHaveProperty('speed');
        });

        it('should handle test failures', async () => {
          const errorMessage = 'Test failed due to assertion error';
          const params = createTestParams(
            {
              fullFile: 'path/to/test.spec.js',
              state: 'failed',
            },
            {
              fullTitle: 'Test Suite [Team1] Test Case',
              duration: 1000,
              projectName: 'Project A',
              err: isPlaywright ? errorMessage : { message: errorMessage },
              state: 'failed',
            },
            isPlaywright
          );

          const result = await constructReportPayloadEntry(
            params.result,
            params.test,
            params.playwright
          );

          expect(result.state).toBe('failed');
          expect(result.error).toBe(errorMessage);
        });

        it('should handle test timeouts', async () => {
          const params = createTestParams(
            {
              fullFile: 'path/to/test.spec.js',
              state: 'timeout',
            },
            {
              fullTitle: 'Test Suite [Team1] Test Case',
              duration: 30000,
              projectName: 'Project A',
              err: isPlaywright ? 'Test timeout' : { message: 'Test timeout' },
              state: 'timeout',
            },
            isPlaywright
          );

          const result = await constructReportPayloadEntry(
            params.result,
            params.test,
            params.playwright
          );

          expect(result.state).toBe('timeout');
          expect(result.error).toBe('Test timeout');
        });

        it('should handle missing optional fields', async () => {
          const params = createTestParams(
            {
              fullFile: 'path/to/test.spec.js',
              state: 'passed',
            },
            {
              fullTitle: 'Test Suite Test Case',
              duration: 1000,
              projectName: 'Project A',
              err: null,
              state: 'passed',
            },
            isPlaywright
          );

          const result = await constructReportPayloadEntry(
            params.result,
            params.test,
            params.playwright
          );

          expect(result.team).toBe('');
          expect(result.manualTestId).toBe('TC123');
          expect(result.category).toBe('smoke');
        });

        it('should enforce maximum length for all fields', async () => {
          const longString = 'A'.repeat(1000);
          const params = createTestParams(
            {
              fullFile: 'path/to/test.spec.js',
              state: 'passed',
            },
            {
              fullTitle: `Test Suite [Team1] ${longString}`,
              duration: 1000,
              projectName: longString,
              err: null,
              state: 'passed',
            },
            isPlaywright
          );

          const result = await constructReportPayloadEntry(
            params.result,
            params.test,
            params.playwright
          );

          Object.values(result).forEach((value) => {
            if (typeof value === 'string') {
              expect(value.length).toBeLessThanOrEqual(500);
            }
          });
        });

        it('should handle invalid file paths', async () => {
          const params = createTestParams(
            {
              fullFile: 'invalid/path',
              state: 'passed',
            },
            {
              fullTitle: 'Test Suite [Team1] Test Case',
              duration: 1000,
              projectName: 'Project A',
              err: null,
              state: 'passed',
            },
            isPlaywright
          );

          const result = await constructReportPayloadEntry(
            params.result,
            params.test,
            params.playwright
          );

          expect(result.spec).toBe('TestSpec');
          expect(result.type).toBe('e2e');
        });
      });
    });

    it('should throw an error for invalid inputs', async () => {
      const invalidInputs = [
        { result: null, test: {}, playwright: true },
        { result: {}, test: null, playwright: true },
        { result: {}, test: {}, playwright: 'not a boolean' },
      ];

      for (const input of invalidInputs) {
        await expect(
          constructReportPayloadEntry(
            input.result,
            input.test,
            input.playwright
          )
        ).rejects.toThrow();
      }
    });
  });

  // extractTeamNameFromTest Tests
  describe('extractTeamNameFromTest', () => {
    it('should extract the team name from the test fullTitle', () => {
      const test = { fullTitle: 'Some test [Team2]' };
      const result = extractTeamNameFromTest(test, [
        'Team1',
        'Team2',
        'team-3',
        'team1',
      ]);
      expect(result).toBe('Team2');
    });

    it('should return empty string if no team name is found', () => {
      const test = { fullTitle: 'Some test without team name' };
      const result = extractTeamNameFromTest(test, [
        'Team1',
        'Team2',
        'team-3',
        'team1',
      ]);
      expect(result).toBe('');
    });

    it('should handle multiple team names and extract the correct one', () => {
      const test = { fullTitle: 'Some test [team-3] [Team2]' };
      const result = extractTeamNameFromTest(test, [
        'Team1',
        'Team2',
        'team-3',
        'team1',
      ]);
      expect(result).toBe('team-3');
    });

    it('should be case insensitive', () => {
      const test = { fullTitle: 'Some test [team1]' };
      const result = extractTeamNameFromTest(test, [
        'Team1',
        'Team2',
        'team-3',
        'team1',
      ]);
      expect(result).toBe('team1');
    });

    it('should throw TypeError if test object does not have fullTitle property', () => {
      const test = { title: 'Some test' };
      expect(() =>
        extractTeamNameFromTest(test, ['Team1', 'Team2', 'team-3', 'team1'])
      ).toThrow(
        'The "test" object must have a "fullTitle" property of type string.'
      );
    });

    it('should throw TypeError if fullTitle is not a string', () => {
      const test = { fullTitle: 12345 };
      expect(() =>
        extractTeamNameFromTest(test, ['Team1', 'Team2', 'team-3', 'team1'])
      ).toThrow(
        'The "test" object must have a "fullTitle" property of type string.'
      );
    });

    it('should return empty string if allTeamNames is empty', () => {
      const test = { fullTitle: 'Some test [Team2]' };
      const result = extractTeamNameFromTest(test, []);
      expect(result).toBe('');
    });

    it('should handle special characters in team names', () => {
      const specialTeamNames = ['team$pecial', 'team^'];
      const test = { fullTitle: 'Some test [team$pecial]' };
      const result = extractTeamNameFromTest(test, specialTeamNames);
      expect(result).toBe('team$pecial');
    });

    it('should handle team names with spaces', () => {
      const teamNames = ['Team Alpha', 'Team Beta'];
      const test = { fullTitle: 'Some test [Team Alpha]' };
      const result = extractTeamNameFromTest(test, teamNames);
      expect(result).toBe('Team Alpha');
    });

    it('should handle team names with numbers', () => {
      const teamNames = ['Team1', 'Team2', 'Team3'];
      const test = { fullTitle: 'Some test [Team2]' };
      const result = extractTeamNameFromTest(test, teamNames);
      expect(result).toBe('Team2');
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should construct payload entries efficiently', async () => {
      const params = createTestParams(
        {
          fullFile: 'path/to/test.spec.js',
          state: 'passed',
        },
        {
          fullTitle: 'Test Suite [Team1] Test Case',
          duration: 1000,
          projectName: 'Project A',
          err: null,
        },
        true
      );

      const startTime = performance.now();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        await constructReportPayloadEntry(
          params.result,
          params.test,
          params.playwright
        );
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should extract team names efficiently', () => {
      const test = { fullTitle: 'Test Suite [Team1] Test Case' };
      const startTime = performance.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        extractTeamNameFromTest(test, ['Team1', 'Team2', 'team-3', 'team1']);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
