// src/sharedMethods/summaryRequired.test.js

// --- Define mock function instances for OTHER dependencies ---
const mockGetDayIndex = jest.fn();
const mockGetFormattedMonth = jest.fn();
const mockGetFormattedYear = jest.fn();
const mockCreateSummaryTitle = jest.fn();
const mockCreateWeeklySummaryTitle = jest.fn();
const mockWEEK_START = jest.fn();
const mockGetTopLevelSpreadsheetData = jest.fn();

// --- Define mock function instances for getSheetInfo.js exports ---
const mockGetExistingTabTitlesInRange = jest.fn();
const mockFindTabTitleDataInArray = jest.fn();
const mockGetExistingTabTitlesInWeeklyRange = jest.fn();
const mockGetTabIdFromTitle = jest.fn();
const mockGetTabIdFromWeeklyTitle = jest.fn();
const mockFindMatchingColumnByWeeklyTabId = jest.fn();
const mockFindMatchingColumnByTabId = jest.fn();
const mockGetHeaderAndFooterDataByTabTitle = jest.fn();
const mockGetHeaderAndFooterDataByWeeklyTabTitle = jest.fn();

// NO jest.mock or jest.doMock for getSheetInfo.js here initially

// --- jest.mock calls for OTHER modules (these are hoisted) ---
jest.mock('./dateFormatting.js', () => ({
  getDayIndex: mockGetDayIndex,
  getFormattedMonth: mockGetFormattedMonth,
  getFormattedYear: mockGetFormattedYear,
}));

jest.mock('../google/sheetDataMethods/createTabNames.js', () => ({
  createSummaryTitle: mockCreateSummaryTitle,
}));

// REMOVE this static mock for summaryHandler.js
// jest.mock('../sharedMethods/summaryHandler.js', () => ({
//   createWeeklySummaryTitle: mockCreateWeeklySummaryTitle,
// }));

jest.mock('../../constants.js', () => ({
  WEEK_START: mockWEEK_START,
}));

jest.mock('../google/googleSheetIntegration/getSheetData.js', () => ({
  getTopLevelSpreadsheetData: mockGetTopLevelSpreadsheetData,
}));
// --- End of jest.mock calls ---

import { jest } from '@jest/globals';

const DEFAULT_MOCK_DATE = '2024-03-15T12:00:00.000Z';

describe('Summary Required', () => {
  let consoleErrorSpy;
  let isSummaryRequired_SUT;
  let isWeeklySummaryRequired_SUT;
  // localMock_getExistingTabTitlesInRange will now refer to the top-level defined mock
  // let localMock_getExistingTabTitlesInRange; // No longer needed here

  beforeEach(async () => {
    jest.resetModules(); // Reset module cache before each test

    // Mock getSheetInfo.js using jest.unstable_mockModule
    // This must be done AFTER jest.resetModules() and BEFORE importing the SUT
    jest.unstable_mockModule(
      '../google/sheetDataMethods/getSheetInfo.js',
      () => ({
        findTabTitleDataInArray: mockFindTabTitleDataInArray,
        getExistingTabTitlesInRange: mockGetExistingTabTitlesInRange,
        getExistingTabTitlesInWeeklyRange:
          mockGetExistingTabTitlesInWeeklyRange,
        getTabIdFromTitle: mockGetTabIdFromTitle,
        getTabIdFromWeeklyTitle: mockGetTabIdFromWeeklyTitle,
        findMatchingColumnByWeeklyTabId: mockFindMatchingColumnByWeeklyTabId,
        findMatchingColumnByTabId: mockFindMatchingColumnByTabId,
        getHeaderAndFooterDataByTabTitle: mockGetHeaderAndFooterDataByTabTitle,
        getHeaderAndFooterDataByWeeklyTabTitle:
          mockGetHeaderAndFooterDataByWeeklyTabTitle,
      })
    );

    // ADD unstable_mockModule for summaryHandler.js
    jest.unstable_mockModule('../sharedMethods/summaryHandler.js', () => ({
      // Ensure all exports from summaryHandler are mocked if SUT uses them,
      // for now, only createWeeklySummaryTitle is critical for this test.
      // Other functions from summaryHandler.js if used by SUT would need mocks here too.
      createWeeklySummaryTitle: mockCreateWeeklySummaryTitle,
      // Add other exports from summaryHandler.js with their mocks if needed by SUT
      // e.g., getHeaderIndicatorsLength: jest.fn(), initializeReportColumnMetrics: jest.fn(), etc.
      // For this specific test suite focusing on summaryRequired.js, we only *know* we need createWeeklySummaryTitle.
    }));

    // 1. Re-initialize implementations for OTHER top-level const mocks
    mockGetDayIndex.mockImplementation((type) => (type === 'Monday' ? 1 : 0));
    mockGetFormattedMonth.mockImplementation((type) => {
      const currentDate = new Date(Date.now());
      if (type === 'lastMonth') {
        const lastMonthIndex = currentDate.getMonth() - 1;
        return [
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
        ][lastMonthIndex < 0 ? 11 : lastMonthIndex];
      }
      return [
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
      ][currentDate.getMonth()];
    });
    mockGetFormattedYear.mockImplementation((type) => {
      const currentDate = new Date(Date.now());
      if (type === 'lastYear') return currentDate.getFullYear() - 1;
      return currentDate.getFullYear();
    });
    mockCreateSummaryTitle.mockImplementation(
      (month, yearString) => `Monthly summary ${month} ${yearString}`
    );
    mockCreateWeeklySummaryTitle.mockImplementation(() => {
      const now = new Date(Date.now()); // Respects jest.setSystemTime
      const weekStartDayName = mockWEEK_START();
      const dayIndexForWeekStart = mockGetDayIndex(weekStartDayName);

      const startDate = new Date(now);
      startDate.setDate(
        now.getDate() - ((now.getDay() + 7 - dayIndexForWeekStart) % 7)
      );

      const year = startDate.getFullYear();
      const monthNumeric = (startDate.getMonth() + 1)
        .toString()
        .padStart(2, '0');
      const dayNumeric = startDate.getDate().toString().padStart(2, '0');
      return `Weekly_${year}_${monthNumeric}_${dayNumeric}`;
    });
    mockWEEK_START.mockImplementation(() => 'Monday');
    // Corrected mock return value structure for getTopLevelSpreadsheetData
    mockGetTopLevelSpreadsheetData.mockResolvedValue({ data: { sheets: [] } });

    // Reset the primary mock we are testing
    mockGetExistingTabTitlesInRange.mockReset();
    // Provide a default implementation for getExistingTabTitlesInRange
    mockGetExistingTabTitlesInRange.mockResolvedValue([]);

    // 2. Dynamically import the SUT (AFTER jest.unstable_mockModule)
    const summaryRequiredModule = await import('./summaryRequired.js');
    isSummaryRequired_SUT = summaryRequiredModule.isSummaryRequired;
    isWeeklySummaryRequired_SUT = summaryRequiredModule.isWeeklySummaryRequired;

    // 3. Setup timers and spies
    jest.useFakeTimers();
    jest.setSystemTime(new Date(DEFAULT_MOCK_DATE));
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    if (consoleErrorSpy && typeof consoleErrorSpy.mockRestore === 'function') {
      consoleErrorSpy.mockRestore();
    }
    jest.resetAllMocks(); // This will also reset mocks defined with jest.fn() at top level
  });

  describe('isSummaryRequired', () => {
    it('should return true when summary is needed', async () => {
      jest.setSystemTime(new Date('2024-03-01T12:00:00.000Z'));
      // Ensure the mock is a function before calling mockResolvedValue
      if (typeof mockGetExistingTabTitlesInRange !== 'function')
        // Use the top-level mock
        throw new Error('Mock is not a function in test');
      mockGetExistingTabTitlesInRange.mockResolvedValue([
        // Use the top-level mock
        'UNIQUE_VAL_1',
        'UNIQUE_VAL_2_Feb_2024',
      ]);
      const result = await isSummaryRequired_SUT({ csv: false });
      expect(mockGetExistingTabTitlesInRange).toHaveBeenCalled(); // Use the top-level mock
      expect(result).toBe(true);
    });

    it('should return false when summary already exists', async () => {
      jest.setSystemTime(new Date('2024-03-01T12:00:00.000Z'));
      const summaryTitle = mockCreateSummaryTitle('Feb', '2024');
      if (typeof mockGetExistingTabTitlesInRange !== 'function')
        // Use the top-level mock
        throw new Error('Mock is not a function in test');
      mockGetExistingTabTitlesInRange.mockResolvedValue([
        // Use the top-level mock
        'UNIQUE_VAL_1',
        summaryTitle,
      ]);
      const result = await isSummaryRequired_SUT({ csv: false });
      expect(mockGetExistingTabTitlesInRange).toHaveBeenCalled(); // Use the top-level mock
      expect(result).toBe(false);
    });

    it('should return false when no sheets from last month exist', async () => {
      jest.setSystemTime(new Date('2024-03-01T12:00:00.000Z'));
      if (typeof mockGetExistingTabTitlesInRange !== 'function')
        // Use the top-level mock
        throw new Error('Mock is not a function in test');
      mockGetExistingTabTitlesInRange.mockResolvedValue([
        // Use the top-level mock
        'Mar 1, 2024',
        'Mar 2, 2024',
      ]);
      const result = await isSummaryRequired_SUT({ csv: false });
      expect(mockGetExistingTabTitlesInRange).toHaveBeenCalled(); // Use the top-level mock
      expect(result).toBe(false);
    });

    it('should return true if it is January and summary for December of last year is needed', async () => {
      jest.setSystemTime(new Date('2024-01-05T12:00:00.000Z'));
      if (typeof mockGetExistingTabTitlesInRange !== 'function')
        // Use the top-level mock
        throw new Error('Mock is not a function in test');
      mockGetExistingTabTitlesInRange.mockResolvedValue([
        // Use the top-level mock
        'Dec 1, 2023',
        'Dec 2, 2023',
      ]);
      const result = await isSummaryRequired_SUT({ csv: false });
      expect(mockGetExistingTabTitlesInRange).toHaveBeenCalled(); // Use the top-level mock
      expect(result).toBe(true);
    });

    it('should return false and log error if getExistingTabTitlesInRange fails', async () => {
      if (typeof mockGetExistingTabTitlesInRange !== 'function')
        // Use the top-level mock
        throw new Error('Mock is not a function in test');
      mockGetExistingTabTitlesInRange.mockRejectedValue(
        // Use the top-level mock
        new Error('Sheet API error')
      );
      const result = await isSummaryRequired_SUT({ csv: false });
      expect(mockGetExistingTabTitlesInRange).toHaveBeenCalled(); // Use the top-level mock
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in isSummaryRequired:',
        expect.any(Error)
      );
    });
  });

  describe('isWeeklySummaryRequired', () => {
    it('should return false when CSV option is true', async () => {
      const result = await isWeeklySummaryRequired_SUT({ csv: true });
      expect(result).toBe(false);
    });

    it('should return true when weekly summary is needed and it is end of week (Sunday)', async () => {
      jest.setSystemTime(new Date('2024-02-18T12:00:00.000Z')); // Sunday
      mockCreateWeeklySummaryTitle.mockReturnValue('Weekly_2024_02_12'); // For week starting Mon Feb 12
      if (typeof mockGetExistingTabTitlesInRange !== 'function')
        // Use the top-level mock
        throw new Error('Mock is not a function in test');
      mockGetExistingTabTitlesInRange.mockResolvedValue([
        // Use the top-level mock
        'Feb 12, 2024',
        'Feb 13, 2024',
      ]);
      const result = await isWeeklySummaryRequired_SUT({ csv: false });
      expect(mockGetExistingTabTitlesInRange).toHaveBeenCalled(); // Use the top-level mock
      expect(result).toBe(true);
    });

    it('should return false when weekly summary already exists', async () => {
      jest.setSystemTime(new Date('2024-02-18T12:00:00.000Z')); // Sunday
      const weeklySummaryTitle = mockCreateWeeklySummaryTitle(); // 'Weekly_2024_02_12'
      if (typeof mockGetExistingTabTitlesInRange !== 'function')
        // Use the top-level mock
        throw new Error('Mock is not a function in test');
      mockGetExistingTabTitlesInRange.mockResolvedValue([
        // Use the top-level mock
        'Feb 12, 2024',
        weeklySummaryTitle, // This is 'Weekly_2024_02_12'
      ]);
      const result = await isWeeklySummaryRequired_SUT({ csv: false });
      expect(mockGetExistingTabTitlesInRange).toHaveBeenCalled(); // Use the top-level mock
      expect(result).toBe(false);
    });

    it('should return false when not at end of week (e.g., Wednesday)', async () => {
      jest.setSystemTime(new Date('2024-02-14T12:00:00.000Z')); // Wednesday
      if (typeof mockGetExistingTabTitlesInRange !== 'function')
        // Use the top-level mock
        throw new Error('Mock is not a function in test');
      mockGetExistingTabTitlesInRange.mockResolvedValue(['Feb 12, 2024']); // Use the top-level mock
      const result = await isWeeklySummaryRequired_SUT({ csv: false });
      // The SUT should not call getExistingTabTitlesInRange if it's not the end of the week.
      // However, the current SUT logic calls it then checks the date.
      // Let's keep the expectation for now and see if tests pass.
      // If this specific test fails due to the mock being called,
      // we might need to adjust the SUT or the test.
      expect(mockGetExistingTabTitlesInRange).toHaveBeenCalled(); // Use the top-level mock
      expect(result).toBe(false);
    });

    it('should return false when no sheets exist, even if end of week', async () => {
      jest.setSystemTime(new Date('2024-02-18T12:00:00.000Z')); // Sunday
      if (typeof mockGetExistingTabTitlesInRange !== 'function')
        // Use the top-level mock
        throw new Error('Mock is not a function in test');
      // mockImplementationOnce is fine, but mockResolvedValue([]) is more direct for an empty array
      mockGetExistingTabTitlesInRange.mockResolvedValue([]); // Use the top-level mock
      const result = await isWeeklySummaryRequired_SUT({ csv: false });
      expect(mockGetExistingTabTitlesInRange).toHaveBeenCalled(); // Use the top-level mock
      expect(result).toBe(false);
    });

    it('should return false and log error if getExistingTabTitlesInRange fails', async () => {
      jest.setSystemTime(new Date('2024-02-18T12:00:00.000Z')); // Sunday
      if (typeof mockGetExistingTabTitlesInRange !== 'function')
        // Use the top-level mock
        throw new Error('Mock is not a function in test');
      mockGetExistingTabTitlesInRange.mockRejectedValue(
        // Use the top-level mock
        new Error('Sheet API error')
      );
      const result = await isWeeklySummaryRequired_SUT({ csv: false });
      expect(mockGetExistingTabTitlesInRange).toHaveBeenCalled(); // Use the top-level mock
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in isWeeklySummaryRequired:',
        expect.any(Error)
      );
    });
  });
});
