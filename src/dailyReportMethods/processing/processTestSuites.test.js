import { processTestSuites } from './processTestSuites.js';
import { testResultData } from '../buildReportTestData.js';

describe('processTestSuites', () => {
  test('should process test suites and extract payload entries', async () => {
    // @ts-ignore
    const allTeamNames = [
      testResultData.testData1.teamName,
      testResultData.testData2.teamName,
    ];
    const testDataEntries = testResultData.expectedPayloadEntries.map(
      // @ts-ignore
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
