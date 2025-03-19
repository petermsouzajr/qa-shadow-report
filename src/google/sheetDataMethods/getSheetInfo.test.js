import { jest } from '@jest/globals';
import { dataObjects } from '../../index.js';
import {
  getFormattedMonth,
  getPreviousMonthsYear,
  getTodaysFormattedDate,
} from '../../sharedMethods/dateFormatting.js';
import { getTopLevelSpreadsheetData } from '../googleSheetIntegration/getSheetData.js';
import { createSummaryTitle } from './createTabNames.js';
import {
  findTabTitleDataInArray,
  getExistingTabTitlesInRange,
  getTabIdFromTitle,
  findMatchingColumnByTabId,
  getHeaderAndFooterDataByTabTitle,
} from './getSheetInfo.js';

// Mock Setup
jest.mock('../../sharedMethods/dateFormatting.js');
jest.mock('../googleSheetIntegration/getSheetData.js');
jest.mock('../../index.js', () => ({
  dataObjects: {
    topLevelSpreadsheetData: {},
    summaryTabData: {},
    todaysReportData: {},
    lastWeekSheetValues: [],
  },
}));

describe('Google Sheets Info Operations', () => {
  // Test Data Setup
  const createMockSheetData = (title, sheetId) => ({
    properties: { title, sheetId },
  });

  const createMockSheetConfig = (url) => ({
    config: { url },
  });

  // findTabTitleDataInArray Tests
  describe('findTabTitleDataInArray', () => {
    it.skip('should find the sheet data object by title', () => {
      const sheetValuesArray = [
        createMockSheetConfig('http://example.com/sheet1'),
        createMockSheetConfig('http://example.com/sheet2'),
      ];
      const sheetTitle = 'sheet2';
      const result = findTabTitleDataInArray(sheetValuesArray, sheetTitle);
      expect(result).toEqual(
        createMockSheetConfig('http://example.com/sheet2')
      );
    });

    it.skip('should return undefined if the sheet title is not found', () => {
      const sheetValuesArray = [
        createMockSheetConfig('http://example.com/sheet1'),
        createMockSheetConfig('http://example.com/sheet3'),
      ];
      const sheetTitle = 'sheet2';
      const result = findTabTitleDataInArray(sheetValuesArray, sheetTitle);
      expect(result).toBeUndefined();
    });

    it.skip('should handle URL-encoded titles', () => {
      const sheetValuesArray = [
        createMockSheetConfig('http://example.com/Sheet%20With%20Spaces'),
      ];
      const sheetTitle = 'Sheet With Spaces';
      const result = findTabTitleDataInArray(sheetValuesArray, sheetTitle);
      expect(result).toEqual(
        createMockSheetConfig('http://example.com/Sheet%20With%20Spaces')
      );
    });

    it.skip('should throw a TypeError if sheetValuesArray is not an array', () => {
      const invalidInputs = [{}, null, undefined, 'string', 123, true];
      invalidInputs.forEach((input) => {
        expect(() => findTabTitleDataInArray(input, 'sheet1')).toThrow(
          'Invalid sheetValuesArray: Expected an array.'
        );
      });
    });

    it.skip('should throw a TypeError if sheetTitle is not a string', () => {
      const invalidInputs = [null, undefined, 123, true, {}];
      invalidInputs.forEach((input) => {
        expect(() => findTabTitleDataInArray([], input)).toThrow(
          'Invalid sheetTitle: Expected a string.'
        );
      });
    });

    it.skip('should throw a TypeError if sheet config URL is invalid', () => {
      const sheetValuesArray = [
        { config: { url: null } },
        { config: { url: undefined } },
        { config: { url: 123 } },
      ];
      sheetValuesArray.forEach((sheet) => {
        expect(() => findTabTitleDataInArray([sheet], 'sheet1')).toThrow(
          'Invalid sheet config: Expected url to be a string.'
        );
      });
    });
  });

  // getExistingTabTitlesInRange Tests
  describe.skip('getExistingTabTitlesInRange', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      getFormattedMonth.mockImplementation((when) => {
        if (when === 'lastMonth') return 'Feb';
        return 'Mar';
      });
      getPreviousMonthsYear.mockReturnValue('2023');
      getTopLevelSpreadsheetData.mockResolvedValue({
        data: {
          sheets: [
            createMockSheetData('Feb 15, 2023', 1),
            createMockSheetData('Mar 1, 2023', 2),
            createMockSheetData('Feb 28, 2023', 3),
          ],
        },
      });
    });

    it.skip('should return titles that match the last month and year criteria', async () => {
      const titles = await getExistingTabTitlesInRange('lastMonth');
      expect(titles).toEqual(['Feb 15, 2023', 'Feb 28, 2023']);
      expect(getFormattedMonth).toHaveBeenCalledWith('lastMonth');
      expect(getPreviousMonthsYear).toHaveBeenCalled();
    });

    it.skip('should return all titles if "when" is not "lastMonth"', async () => {
      const titles = await getExistingTabTitlesInRange('');
      expect(titles).toEqual(['Feb 15, 2023', 'Mar 1, 2023', 'Feb 28, 2023']);
    });

    it.skip('should handle case-insensitive month matching', async () => {
      getTopLevelSpreadsheetData.mockResolvedValue({
        data: {
          sheets: [
            createMockSheetData('FEB 15, 2023', 1),
            createMockSheetData('feb 28, 2023', 2),
          ],
        },
      });

      const titles = await getExistingTabTitlesInRange('lastMonth');
      expect(titles).toEqual(['FEB 15, 2023', 'feb 28, 2023']);
    });

    it.skip('should throw a TypeError if "when" is not a string', async () => {
      const invalidInputs = [null, undefined, 123, true, {}];
      for (const input of invalidInputs) {
        await expect(getExistingTabTitlesInRange(input)).rejects.toThrow(
          'Invalid input: "when" must be a string.'
        );
      }
    });

    it.skip('should throw an error if metadata format is invalid', async () => {
      getTopLevelSpreadsheetData.mockResolvedValue({ data: {} });
      await expect(getExistingTabTitlesInRange('lastMonth')).rejects.toThrow(
        'Invalid spreadsheet metadata format.'
      );
    });

    it.skip('should handle errors during data fetching', async () => {
      getTopLevelSpreadsheetData.mockRejectedValue(new Error('Network error'));
      await expect(getExistingTabTitlesInRange('lastMonth')).rejects.toThrow(
        'Unable to fetch sheet titles in range.'
      );
    });
  });

  // getTabIdFromTitle Tests
  describe.skip('getTabIdFromTitle', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      createSummaryTitle.mockReturnValue('Summary Title');
      getTodaysFormattedDate.mockReturnValue("Today's Date");
    });

    it.skip('should throw an error if tabTitle is not a valid string', async () => {
      const invalidInputs = ['', null, undefined];
      for (const input of invalidInputs) {
        await expect(getTabIdFromTitle(input)).rejects.toThrow(
          'Invalid tabTitle: Expected a non-empty string.'
        );
      }
    });

    it.skip('should return null if sheet list data is not available', async () => {
      dataObjects.topLevelSpreadsheetData = {};
      dataObjects.summaryTabData = {};
      dataObjects.todaysReportData = {};

      const tabId = await getTabIdFromTitle('Some Title');
      expect(tabId).toBeNull();
    });

    it.skip("should return the sheet ID for summary or today's report titles", async () => {
      const mockSheetId = 12345;
      dataObjects.summaryTabData = {
        data: {
          replies: [{ addSheet: { properties: { sheetId: mockSheetId } } }],
        },
      };
      dataObjects.todaysReportData = {
        data: {
          replies: [{ addSheet: { properties: { sheetId: mockSheetId } } }],
        },
      };

      let tabId = await getTabIdFromTitle('Summary Title');
      expect(tabId).toBe(mockSheetId);

      tabId = await getTabIdFromTitle("Today's Date");
      expect(tabId).toBe(mockSheetId);
    });

    it.skip('should return the sheet ID for other titles', async () => {
      const mockSheetId = 67890;
      dataObjects.topLevelSpreadsheetData = {
        data: {
          sheets: [createMockSheetData('Other Title', mockSheetId)],
        },
      };

      const tabId = await getTabIdFromTitle('Other Title');
      expect(tabId).toBe(mockSheetId);
    });

    it.skip('should handle errors during data fetching', async () => {
      dataObjects.topLevelSpreadsheetData = {
        data: {
          sheets: [{ properties: { title: 'Error Sheet' } }],
        },
      };

      await expect(getTabIdFromTitle('Error Sheet')).rejects.toThrow(
        'Unable to fetch tab ID from title.'
      );
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it.skip('should handle large arrays efficiently', async () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) =>
        createMockSheetData(`Sheet ${i}`, i)
      );

      getTopLevelSpreadsheetData.mockResolvedValue({
        data: { sheets: largeArray },
      });

      const startTime = performance.now();
      const titles = await getExistingTabTitlesInRange('');
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(titles.length).toBe(1000);
    });
  });
});
