import { handleDailyReport } from './sharedMethods/dailyReportHandler.js';
import { handleSummary } from './sharedMethods/summaryHandler.js';
import { doesTodaysReportExist } from './sharedMethods/dailyReportRequired.js';
import { isSummaryRequired } from './sharedMethods/summaryRequired.js';
import { dataObjects, main } from './index.js';

// Mock the dependent modules
jest.mock('./sharedMethods/summaryRequired');
jest.mock('./sharedMethods/dailyReportRequired');
jest.mock('./sharedMethods/summaryHandler');
jest.mock('./sharedMethods/dailyReportHandler');

describe('main function', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
  });

  it('should handle summary and daily report when both are required', async () => {
    isSummaryRequired.mockResolvedValue(true);
    doesTodaysReportExist.mockResolvedValue(false);

    await main();

    expect(handleSummary).toHaveBeenCalled();
    expect(handleDailyReport).toHaveBeenCalled();
  });

  it('should only handle daily report when summary is not required', async () => {
    isSummaryRequired.mockResolvedValue(false);
    doesTodaysReportExist.mockResolvedValue(false);

    await main();

    expect(handleSummary).not.toHaveBeenCalled();
    expect(handleDailyReport).toHaveBeenCalled();
  });

  it('should log no summary message when summary is not required', async () => {
    isSummaryRequired.mockResolvedValue(false);
    doesTodaysReportExist.mockResolvedValue(true);
    console.info = jest.fn();

    await main();

    expect(console.info).toHaveBeenCalledWith(
      `No ${dataObjects.lastMonth} summary required`
    );
  });

  it("should log no report message when today's report already exists", async () => {
    isSummaryRequired.mockResolvedValue(true);
    doesTodaysReportExist.mockResolvedValue(true);
    console.info = jest.fn();

    await main();

    expect(console.info).toHaveBeenCalledWith("Today's report already exists");
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Test error');
    isSummaryRequired.mockRejectedValue(error);
    console.error = jest.fn();

    await main();

    expect(console.error).toHaveBeenCalledWith(
      'An error occurred during the report and summary handling: ',
      error
    );
  });
});
