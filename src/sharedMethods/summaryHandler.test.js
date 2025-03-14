import { jest } from '@jest/globals';

// Mock the constants first
jest.mock('../../constants.js', () => ({
  HEADER_INDICATORS: ['TYPE', 'CATEGORY', 'TEAM'],
  WEEK_START: 1,
  DAYS: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  SHORT_DAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  MONTHS: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
}));

// Mock dependencies
jest.mock('../google/sheetDataMethods/getSheetInfo.js');
jest.mock('../google/auth.js', () => ({
  auth: {},
  sheets: {
    spreadsheets: {
      batchUpdate: jest.fn(),
      values: {
        batchUpdate: jest.fn(),
      },
    },
  },
  spreadsheetId: '12345',
}));
jest.mock('../google/sheetDataMethods/processSheetData.js');
jest.mock('../google/sheetDataMethods/createTabNames.js');
jest.mock('../monthlySummaryMethods/buildSummary.js');
jest.mock('../weeklySummaryMethods/buildSummary.js');
jest.mock('../google/sheetDataMethods/getLastMonthTabTitles.js');
jest.mock('../google/googleSheetIntegration/createNewTab.js');
jest.mock('./summaryRequired.js');
jest.mock('./dateFormatting.js');

// Import after mocks
import {
  getHeaderIndicatorsLength,
  initializeReportColumnMetrics,
  handleSummary,
  handleWeeklySummary,
} from './summaryHandler.js';
import {
  getExistingTabTitlesInRange,
  getExistingTabTitlesInWeeklyRange,
  getTabIdFromTitle,
  getTabIdFromWeeklyTitle,
} from '../google/sheetDataMethods/getSheetInfo.js';
import { auth, sheets, spreadsheetId } from '../google/auth.js';
import { addColumnsAndRowsToTabId } from '../google/sheetDataMethods/processSheetData.js';
import { createSummaryTitle } from '../google/sheetDataMethods/createTabNames.js';
import { constructPayloadForCopyPaste } from '../monthlySummaryMethods/buildSummary.js';
import { constructWeeklyPayloadForCopyPaste } from '../weeklySummaryMethods/buildSummary.js';
import { getLastMonthTabTitles } from '../google/sheetDataMethods/getLastMonthTabTitles.js';
import {
  createNewTab,
  createNewWeeklyTab,
} from '../google/googleSheetIntegration/createNewTab.js';
import {
  isSummaryRequired,
  isWeeklySummaryRequired,
} from './summaryRequired.js';
import {
  getCurrentTime,
  getFormattedMonth,
  getPreviousMonthsYear,
} from './dateFormatting.js';

describe('Summary Handler', () => {
  const mockSheetId = 12345;
  const mockSummaryTitle = 'Summary_2024_02';
  const mockWeeklyTitle = 'Weekly_2024_02_12';
  const mockLastMonthTitles = ['Sheet1_2024_02_01', 'Sheet2_2024_02_02'];
  const mockHeaderIndicators = ['TYPE', 'CATEGORY', 'TEAM'];
  const mockFullPayload = {
    headerPayload: [['Header1', 'Header2']],
    bodyPayload: [{ copyPaste: { destination: { endRowIndex: 10 } } }],
    summaryHeaderStylePayload: { mergeCells: {} },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Google Sheets API calls
    sheets.spreadsheets.batchUpdate.mockResolvedValue({});
    sheets.spreadsheets.values.batchUpdate.mockResolvedValue({});

    // Mock getSheetInfo functions
    getTabIdFromTitle.mockResolvedValue(mockSheetId);
    getTabIdFromWeeklyTitle.mockResolvedValue(mockSheetId);
    getExistingTabTitlesInRange.mockResolvedValue(mockLastMonthTitles);
    getExistingTabTitlesInWeeklyRange.mockResolvedValue(mockLastMonthTitles);

    // Mock tab creation and naming
    createSummaryTitle.mockReturnValue(mockSummaryTitle);
    createNewTab.mockResolvedValue();
    createNewWeeklyTab.mockResolvedValue();

    // Mock date formatting
    getCurrentTime.mockReturnValue('123456');
    getFormattedMonth.mockReturnValue('Feb');
    getPreviousMonthsYear.mockReturnValue('2024');

    // Mock tab titles and payload construction
    getLastMonthTabTitles.mockResolvedValue(mockLastMonthTitles);
    constructPayloadForCopyPaste.mockResolvedValue(mockFullPayload);
    constructWeeklyPayloadForCopyPaste.mockResolvedValue(mockFullPayload);

    // Mock summary requirements
    isSummaryRequired.mockResolvedValue(true);
    isWeeklySummaryRequired.mockResolvedValue(true);

    // Mock sheet data processing
    addColumnsAndRowsToTabId.mockResolvedValue();
  });

  describe('getHeaderIndicatorsLength', () => {
    it.skip('should return the length of header indicators', () => {
      expect(getHeaderIndicatorsLength()).toBe(mockHeaderIndicators.length);
    });
  });

  describe('initializeReportColumnMetrics', () => {
    it.skip('should initialize column metrics with correct values', () => {
      const metrics = initializeReportColumnMetrics(
        mockHeaderIndicators.length
      );
      expect(metrics).toEqual({
        nextAvailableColumn: 0,
        defaultHeaderMetricsDestinationColumn: 0,
        longestHeaderEnd: 0,
        defaultHeaderMetricsDestinationColumnEnd: mockHeaderIndicators.length,
      });
    });
  });

  describe('handleSummary', () => {
    it.skip('should handle monthly summary creation successfully', async () => {
      const result = await handleSummary({ csv: false });

      expect(isSummaryRequired).toHaveBeenCalled();
      expect(getLastMonthTabTitles).toHaveBeenCalled();
      expect(createSummaryTitle).toHaveBeenCalled();
      expect(createNewTab).toHaveBeenCalledWith(mockSummaryTitle);
      expect(constructPayloadForCopyPaste).toHaveBeenCalledWith(
        mockLastMonthTitles,
        mockSummaryTitle
      );
      expect(sheets.spreadsheets.batchUpdate).toHaveBeenCalled();
    });

    it.skip('should skip summary creation when not required', async () => {
      isSummaryRequired.mockResolvedValue(false);

      await handleSummary({ csv: false });

      expect(getLastMonthTabTitles).not.toHaveBeenCalled();
      expect(createNewTab).not.toHaveBeenCalled();
    });

    it.skip('should handle errors during summary creation', async () => {
      const error = new Error('Test error');
      createNewTab.mockRejectedValue(error);

      await expect(handleSummary({ csv: false })).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('handleWeeklySummary', () => {
    it.skip('should handle weekly summary creation successfully', async () => {
      const result = await handleWeeklySummary({ csv: false });

      expect(isWeeklySummaryRequired).toHaveBeenCalled();
      expect(getExistingTabTitlesInWeeklyRange).toHaveBeenCalled();
      expect(createNewWeeklyTab).toHaveBeenCalled();
      expect(constructWeeklyPayloadForCopyPaste).toHaveBeenCalled();
      expect(sheets.spreadsheets.batchUpdate).toHaveBeenCalled();
    });

    it.skip('should skip weekly summary creation when not required', async () => {
      isWeeklySummaryRequired.mockResolvedValue(false);

      await handleWeeklySummary({ csv: false });

      expect(getExistingTabTitlesInWeeklyRange).not.toHaveBeenCalled();
      expect(createNewWeeklyTab).not.toHaveBeenCalled();
    });
  });
});
