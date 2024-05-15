import {
  DEFAULT_HEADER_METRICS,
  TEST_TYPES_AVAILABLE,
} from '../../constants.js';
import {
  initializeDailyPayload,
  constructReportPayloadEntry,
  processTestSuites,
  appendStateReportsToHeader,
} from '../../src/dailyReportMethods/buildReport.js';
import { extractTeamNameFromTest } from '../../src/dailyReportMethods/dataExtractionUtilities.js';
import { testResultData } from './buildReportTestData.js';

describe('Daily Report Methods', () => {
  describe('initializeDailyPayload', () => {
    test('should return an object with empty arrays for payload segments', () => {
      const payload = initializeDailyPayload();
      expect(payload).toEqual(testResultData.emptyDailyPayload);
    });
  });

  describe('constructReportPayloadEntry', () => {
    test('should construct a payload entry based on test result and details', async () => {
      const mockResults = testResultData.fullReportOutput.results[0];
      const mockTest = mockResults.suites[0].tests[0];
      const typesAvailable = TEST_TYPES_AVAILABLE();
      const allTeamNames = testResultData.allTeamNames;
      const payloadEntry = await constructReportPayloadEntry(
        mockResults,
        mockTest,
        false // Assuming this is not a Playwright test for this example
      );

      expect(payloadEntry).toEqual(testResultData.expectedPayloadEntry);
    });
  });

  describe('processTestSuites', () => {
    test('should process test suites and extract payload entries', async () => {
      const allTeamNames = testResultData.allTeamNames;
      const testDataEntries = testResultData.expectedPayloadEntries.map(
        (entry, index) => ({
          ...entry,
          team: '', // update with team names parsed from allteams and the index of the testdata entries
        })
      );
      const dataSet = testResultData.fullReportOutput.results;
      const payloadEntries = await processTestSuites(
        dataSet,
        false // Assuming this is not a Playwright test for this example
      );

      expect(payloadEntries).toEqual(testDataEntries);
    });
  });

  describe('extractTeamNameFromTest', () => {
    const allTeamNames = ['team1', 'Team2', 'team-3'];

    test('should extract the team name from the test fullTitle', () => {
      const test = { fullTitle: 'Some test [Team2]' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toBe('Team2');
    });

    test('should return empty string if no team name is found', () => {
      const test = { fullTitle: 'Some test without team name' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toBe('');
    });

    test('should handle multiple team names and extract the correct one', () => {
      const test = { fullTitle: 'Some test [team-3] [Team2]' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toBe('team-3');
    });

    test('should be case insensitive', () => {
      const test = { fullTitle: 'Some test [team1]' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toBe('team1');
    });

    test('should throw TypeError if test object does not have fullTitle property', () => {
      const test = { title: 'Some test' };
      expect(() => extractTeamNameFromTest(test, allTeamNames)).toThrow(
        'The "test" object must have a "fullTitle" property of type string.'
      );
    });

    test('should throw TypeError if fullTitle is not a string', () => {
      const test = { fullTitle: 12345 };
      expect(() => extractTeamNameFromTest(test, allTeamNames)).toThrow(
        'The "test" object must have a "fullTitle" property of type string.'
      );
    });

    test('should return empty string if allTeamNames is empty', () => {
      const test = { fullTitle: 'Some test [Team2]' };
      const result = extractTeamNameFromTest(test, []);
      expect(result).toBe('');
    });

    test('should handle special characters in team names', () => {
      const specialTeamNames = ['team$pecial', 'team^'];
      const test = { fullTitle: 'Some test [team$pecial]' };
      const result = extractTeamNameFromTest(test, specialTeamNames);
      expect(result).toBe('team$pecial');
    });
  });

  describe('appendStateReportsToHeader', () => {
    it('should correctly append state reports to a non-empty header payload', async () => {
      const modifiedHeader = testResultData.unappendedHeaderPayload;
      appendStateReportsToHeader(modifiedHeader, DEFAULT_HEADER_METRICS);

      expect(modifiedHeader).toEqual(testResultData.appendedHeaderPayload);
    });

    it('should correctly append state reports to an empty header payload', async () => {
      const modifiedHeader = testResultData.emptyHeaderPayload;
      appendStateReportsToHeader(modifiedHeader, DEFAULT_HEADER_METRICS);

      expect(modifiedHeader).toEqual(testResultData.appendedEmptyHeaderPayload);
    });
  });
});
