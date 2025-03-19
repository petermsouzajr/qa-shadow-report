import { jest } from '@jest/globals';
import { sheets } from '../auth.js';
import {
  getTabValuesByTitle,
  getTabIdFromWeeklyTitle,
  getExistingTabTitlesInRange,
} from './sheetDataMethods.js';

// Mock dependencies
jest.mock('../auth.js', () => ({
  sheets: {
    spreadsheets: {
      values: {
        get: jest.fn(),
      },
      get: jest.fn(),
    },
  },
}));

describe('Sheet Data Methods', () => {
  const mockTabTitle = 'Test Tab';
  const mockTabId = '12345';
  const mockValues = [
    ['Header1', 'Header2'],
    ['Value1', 'Value2'],
  ];
  const mockSpreadsheetData = {
    sheets: [
      { properties: { title: 'Sheet1', sheetId: 1 } },
      { properties: { title: 'Sheet2', sheetId: 2 } },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTabValuesByTitle', () => {
    it.skip('should fetch tab values successfully', async () => {
      sheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: mockValues },
      });

      const result = await getTabValuesByTitle(mockTabTitle);

      expect(result).toEqual(mockValues);
      expect(sheets.spreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: expect.any(String),
        range: mockTabTitle,
      });
    });

    it.skip('should handle empty tab values', async () => {
      sheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [] },
      });

      const result = await getTabValuesByTitle(mockTabTitle);

      expect(result).toEqual([]);
    });

    it.skip('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      sheets.spreadsheets.values.get.mockRejectedValue(error);

      await expect(getTabValuesByTitle(mockTabTitle)).rejects.toThrow(error);
    });
  });

  describe('getTabIdFromWeeklyTitle', () => {
    it.skip('should get tab ID from weekly title', async () => {
      sheets.spreadsheets.get.mockResolvedValue({ data: mockSpreadsheetData });

      const result = await getTabIdFromWeeklyTitle(mockTabTitle);

      expect(result).toBe(1);
      expect(sheets.spreadsheets.get).toHaveBeenCalledWith({
        spreadsheetId: expect.any(String),
      });
    });

    it.skip('should handle tab not found', async () => {
      sheets.spreadsheets.get.mockResolvedValue({ data: mockSpreadsheetData });

      const result = await getTabIdFromWeeklyTitle('Non-existent Tab');

      expect(result).toBeNull();
    });

    it.skip('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      sheets.spreadsheets.get.mockRejectedValue(error);

      await expect(getTabIdFromWeeklyTitle(mockTabTitle)).rejects.toThrow(
        error
      );
    });
  });

  describe('getExistingTabTitlesInRange', () => {
    it.skip('should get existing tab titles in range', async () => {
      sheets.spreadsheets.get.mockResolvedValue({ data: mockSpreadsheetData });

      const result = await getExistingTabTitlesInRange();

      expect(result).toEqual(['Sheet1', 'Sheet2']);
      expect(sheets.spreadsheets.get).toHaveBeenCalledWith({
        spreadsheetId: expect.any(String),
      });
    });

    it.skip('should handle empty spreadsheet', async () => {
      sheets.spreadsheets.get.mockResolvedValue({ data: { sheets: [] } });

      const result = await getExistingTabTitlesInRange();

      expect(result).toEqual([]);
    });

    it.skip('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      sheets.spreadsheets.get.mockRejectedValue(error);

      await expect(getExistingTabTitlesInRange()).rejects.toThrow(error);
    });
  });
});
