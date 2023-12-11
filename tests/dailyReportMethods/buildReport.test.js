import { DEFAULT_HEADER_METRICS } from '../../constants.js';
import {
  initializeDailyPayload,
  constructReportPayloadEntry,
  processTestSuites,
  appendStateReportsToHeader,
} from '../../src/dailyReportMethods/buildReport.js';
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

      const payloadEntry = await constructReportPayloadEntry(
        mockResults,
        mockTest
      );

      expect(payloadEntry).toEqual(testResultData.expectedPayloadEntry);
    });
  });

  describe('processTestSuites', () => {
    test('should process test suites and extract payload entries', async () => {
      const dataSet = testResultData.fullReportOutput.results;
      const payloadEntries = await processTestSuites(dataSet);

      expect(payloadEntries).toEqual(testResultData.expectedPayloadEntries);
    });
  });

  describe('appendStateReportsToHeader', () => {
    it('should correctly append state reports to a non-empty header payload', async () => {
      const modifiedHeader = testResultData.unappendedHeaderPayload;
      appendStateReportsToHeader(modifiedHeader, DEFAULT_HEADER_METRICS);

      expect(modifiedHeader).toEqual(testResultData.appendedHeaderPayload);
    });

    it('should correctly append state reports to an emoty header payload', async () => {
      const modifiedHeader = testResultData.emptyHeaderPayload;
      appendStateReportsToHeader(modifiedHeader, DEFAULT_HEADER_METRICS);

      expect(modifiedHeader).toEqual(testResultData.appendedEmptyHeaderPayload);
    });
  });
});
