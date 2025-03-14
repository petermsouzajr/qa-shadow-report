import { jest } from '@jest/globals';
import { sheets } from '../auth.js';
import {
  getTopLevelSpreadsheetData,
  getTabValuesByTitle,
} from './getSheetData.js';

// Mock the sheets API
jest.mock('../auth.js', () => ({
  sheets: {
    spreadsheets: {
      get: jest.fn(),
      values: {
        get: jest.fn(),
      },
    },
  },
}));

describe('Google Sheets Data Retrieval', () => {
  const mockSpreadsheetId = 'test-spreadsheet-id';
  const mockTabTitle = 'TestTab';
  const mockTabId = '12345';
  const mockValues = [
    ['Header1', 'Header2'],
    ['Value1', 'Value2'],
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopLevelSpreadsheetData', () => {
    it.skip('should fetch spreadsheet data successfully', async () => {
      const mockResponse = {
        data: { sheets: [{ properties: { title: mockTabTitle } }] },
      };
      sheets.spreadsheets.get.mockResolvedValue(mockResponse);

      const result = await getTopLevelSpreadsheetData(mockSpreadsheetId);
      expect(result).toEqual(mockResponse.data);
      expect(sheets.spreadsheets.get).toHaveBeenCalledWith({
        spreadsheetId: mockSpreadsheetId,
      });
    });

    it.skip('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      sheets.spreadsheets.get.mockRejectedValue(error);

      await expect(
        getTopLevelSpreadsheetData(mockSpreadsheetId)
      ).rejects.toThrow(error);
    });

    it.skip('should use default parameters when not provided', async () => {
      const mockResponse = {
        data: { sheets: [{ properties: { title: mockTabTitle } }] },
      };
      sheets.spreadsheets.get.mockResolvedValue(mockResponse);

      const result = await getTopLevelSpreadsheetData();
      expect(result).toEqual(mockResponse.data);
      expect(sheets.spreadsheets.get).toHaveBeenCalledWith({
        spreadsheetId: expect.any(String),
      });
    }, 10000); // Increased timeout for this test
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

    it.skip('should handle invalid sheets instance', async () => {
      const invalidSheets = null;
      await expect(
        getTabValuesByTitle(mockTabTitle, invalidSheets)
      ).rejects.toThrow(`Error fetching values for tab: ${mockTabTitle}`);
    });

    it.skip('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      sheets.spreadsheets.values.get.mockRejectedValue(error);

      await expect(getTabValuesByTitle(mockTabTitle)).rejects.toThrow(error);
    });
  });
});
