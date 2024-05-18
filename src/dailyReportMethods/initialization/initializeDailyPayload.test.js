import { initializeDailyPayload } from './initializeDailyPayload.js';
import { testResultData } from '../buildReportTestData.js';

describe('initializeDailyPayload', () => {
  test('should return an object with empty arrays for payload segments', () => {
    const payload = initializeDailyPayload();
    expect(payload).toEqual(testResultData.emptyDailyPayload);
  });
});