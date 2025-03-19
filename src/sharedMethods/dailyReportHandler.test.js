import { jest } from '@jest/globals';
import { createTestResult, createTestDataSet } from '../testHelpers.js';

// Mock all external dependencies
jest.mock('../google/googleSheetIntegration/createNewTab.js');
jest.mock('../google/googleSheetIntegration/writeToSheet.js');
jest.mock('../sharedMethods/dataHandler.js');
jest.mock('./dateFormatting.js');
jest.mock('./styles.js');
jest.mock('./csvHandler.js');
jest.mock('./dailyReportRequired.js');
jest.mock('./convertPayloads.js');
jest.mock(
  '../dailyReportMethods/reportGeneration/processHeaderWithFormulas.js'
);
jest.mock('../dailyReportMethods/reportGeneration/buildDailyPayload.js');
jest.mock('../google/sheetDataMethods/getSheetInfo.js');
jest.mock('../dailyReportMethods/reportGeneration/reportGenerationHelpers.js');
jest.mock('../../constants.js', () => ({
  TEST_DATA: jest.fn((cypress) =>
    cypress ? 'cypress.json' : 'playwright.json'
  ),
}));

import { handleDailyReport } from './dailyReportHandler.js';
import { createNewTab } from '../google/googleSheetIntegration/createNewTab.js';
import {
  writeToSheet,
  batchUpdateMasterSheet,
} from '../google/googleSheetIntegration/writeToSheet.js';
import { loadJSON } from '../sharedMethods/dataHandler.js';
import { getCurrentTime, getTodaysFormattedDate } from './dateFormatting.js';
import { saveCSV, calculateDailySummaryMetrics } from './csvHandler.js';
import { doesTodaysReportExist } from './dailyReportRequired.js';
import { transformPlaywrightToFriendlyFormat } from './convertPayloads.js';
import { processHeaderWithFormulas } from '../dailyReportMethods/reportGeneration/processHeaderWithFormulas.js';
import { buildDailyPayload } from '../dailyReportMethods/reportGeneration/buildDailyPayload.js';
import { getTabIdFromTitle } from '../google/sheetDataMethods/getSheetInfo.js';
import { createMergeQueries } from '../dailyReportMethods/reportGeneration/reportGenerationHelpers.js';
import {
  BuildTextStyles,
  buildColorStylesPayload,
  buildRowHeightPayload,
  createConditionalFormattingPayload,
  freezeRowsInSheet,
  sendGridStyle,
  setColumnWidths,
  createTextAlignmentPayload,
  setTextWrappingToClip,
} from './styles.js';

describe('Daily Report Handler', () => {
  // Common test data
  const mockDate = '2024-03-20';
  const mockTime = '10:00:00';
  const mockTabId = '123456';

  // Create test results using helper functions
  const mockTestResults = [
    createTestResult({ title: 'Test 1', state: 'passed', duration: 1000 }),
    createTestResult({ title: 'Test 2', state: 'failed', duration: 2000 }),
  ];

  // Create test data set using helper function
  const mockTestData = createTestDataSet(mockTestResults);

  // Mock payload structure
  const mockPayload = {
    headerPayload: [['Header 1', 'Header 2']],
    bodyPayload: [['Data 1', 'Data 2']],
    footerPayload: [['Footer 1', 'Footer 2']],
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup common mocks
    getTodaysFormattedDate.mockReturnValue(mockDate);
    getCurrentTime.mockReturnValue(mockTime);
    loadJSON.mockResolvedValue(mockTestData);
    buildDailyPayload.mockResolvedValue(mockPayload);
    getTabIdFromTitle.mockResolvedValue(mockTabId);
    createMergeQueries.mockReturnValue({ requests: [] });
    createConditionalFormattingPayload.mockReturnValue({ requests: [] });
    freezeRowsInSheet.mockResolvedValue({ requests: [] });
    buildColorStylesPayload.mockResolvedValue({ requests: [] });
    buildRowHeightPayload.mockResolvedValue({ requests: [] });
    BuildTextStyles.mockResolvedValue({ requests: [] });
    setTextWrappingToClip.mockResolvedValue({ requests: [] });
    createTextAlignmentPayload.mockResolvedValue({ requests: [] });
    setColumnWidths.mockResolvedValue({ requests: [] });
    writeToSheet.mockResolvedValue();
    batchUpdateMasterSheet.mockResolvedValue();
    sendGridStyle.mockResolvedValue();
    calculateDailySummaryMetrics.mockReturnValue([['Summary']]);
    saveCSV.mockResolvedValue();
    transformPlaywrightToFriendlyFormat.mockReturnValue([]);
    processHeaderWithFormulas.mockResolvedValue();
  });

  describe('CSV Report Generation', () => {
    it.skip('should generate CSV report successfully', async () => {
      await handleDailyReport({
        csv: true,
        duplicate: false,
        cypress: true,
        playwright: false,
      });

      expect(loadJSON).toHaveBeenCalledWith('cypress.json');
      expect(buildDailyPayload).toHaveBeenCalledWith(mockTestResults, false);
      expect(calculateDailySummaryMetrics).toHaveBeenCalledWith(
        mockPayload.bodyPayload
      );
      expect(saveCSV).toHaveBeenCalledWith(expect.any(Array), false);
    });

    it.skip('should handle duplicate CSV report generation', async () => {
      await handleDailyReport({
        csv: true,
        duplicate: true,
        cypress: true,
        playwright: false,
      });

      expect(loadJSON).toHaveBeenCalledWith('cypress.json');
      expect(saveCSV).toHaveBeenCalledWith(expect.any(Array), true);
    });
  });

  describe('Google Sheets Report Generation', () => {
    it.skip('should generate Google Sheets report successfully', async () => {
      doesTodaysReportExist.mockResolvedValue(false);

      await handleDailyReport({
        csv: false,
        duplicate: false,
        cypress: true,
        playwright: false,
      });

      expect(createNewTab).toHaveBeenCalledWith(mockDate);
      expect(writeToSheet).toHaveBeenCalledTimes(3); // header, body, footer
      expect(batchUpdateMasterSheet).toHaveBeenCalled();
    });

    it.skip('should skip report generation if report exists and duplicate is false', async () => {
      doesTodaysReportExist.mockResolvedValue(true);

      await handleDailyReport({
        csv: false,
        duplicate: false,
        cypress: true,
        playwright: false,
      });

      expect(createNewTab).not.toHaveBeenCalled();
      expect(writeToSheet).not.toHaveBeenCalled();
    });

    it.skip('should handle duplicate Google Sheets report generation', async () => {
      doesTodaysReportExist.mockResolvedValue(true);

      await handleDailyReport({
        csv: false,
        duplicate: true,
        cypress: true,
        playwright: false,
      });

      expect(createNewTab).toHaveBeenCalledWith(`${mockDate}_${mockTime}`);
      expect(writeToSheet).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it.skip('should handle JSON loading errors', async () => {
      loadJSON.mockRejectedValue(new Error('Failed to load JSON'));

      await expect(
        handleDailyReport({
          csv: true,
          duplicate: false,
          cypress: true,
          playwright: false,
        })
      ).rejects.toThrow('Failed to load JSON');
    });

    it.skip('should handle CSV saving errors', async () => {
      saveCSV.mockRejectedValue(new Error('Failed to save CSV'));

      await expect(
        handleDailyReport({
          csv: true,
          duplicate: false,
          cypress: true,
          playwright: false,
        })
      ).rejects.toThrow('Failed to save CSV');
    });

    it.skip('should handle Google Sheets API errors', async () => {
      doesTodaysReportExist.mockResolvedValue(false);
      createNewTab.mockRejectedValue(new Error('API Error'));

      await expect(
        handleDailyReport({
          csv: false,
          duplicate: false,
          cypress: true,
          playwright: false,
        })
      ).rejects.toThrow('API Error');
    });
  });
});
