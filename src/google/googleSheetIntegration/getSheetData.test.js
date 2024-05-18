import { jest } from '@jest/globals';
import {
  getTopLevelSpreadsheetData,
  getTabValuesByTitle,
} from './getSheetData';

// Mocking dependencies
const mockSheets = {
  spreadsheets: {
    get: jest.fn(),
    values: {
      get: jest.fn(),
    },
  },
};
const mockAuth = {};
const mockSpreadsheetId = 'mockedSpreadsheetId';
const mockDataObjects = { topLevelSpreadsheetData: null };

describe('Google Sheets Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to prevent it from logging during tests
    global.console.error = jest.fn();
  });

  describe('getTopLevelSpreadsheetData', () => {
    it('retrieves top-level spreadsheet data and updates dataObjects', async () => {
      const mockResponse = { data: 'topLevelData' };
      mockSheets.spreadsheets.get.mockResolvedValue(mockResponse);

      const data = await getTopLevelSpreadsheetData(
        mockSheets,
        mockAuth,
        mockSpreadsheetId,
        mockDataObjects
      );
      expect(mockSheets.spreadsheets.get).toHaveBeenCalledWith({
        auth: mockAuth,
        spreadsheetId: mockSpreadsheetId,
      });
      expect(data).toEqual(mockResponse);
      expect(mockDataObjects.topLevelSpreadsheetData).toEqual(data);
    });

    it('throws an error when fetching top-level data fails', async () => {
      const mockError = new Error('API Error');
      mockSheets.spreadsheets.get.mockRejectedValue(mockError);

      await expect(
        getTopLevelSpreadsheetData(
          mockSheets,
          mockAuth,
          mockSpreadsheetId,
          mockDataObjects
        )
      ).rejects.toThrow('Error fetching top-level spreadsheet data.');
    });
  });

  describe('getTabValuesByTitle', () => {
    it('retrieves values from a specific tab by title', async () => {
      const tabTitle = 'TestTab';
      const mockResponse = { data: 'tabValues' };
      mockSheets.spreadsheets.values.get.mockResolvedValue(mockResponse);

      const data = await getTabValuesByTitle(
        tabTitle,
        mockSheets,
        mockAuth,
        mockSpreadsheetId
      );
      expect(mockSheets.spreadsheets.values.get).toHaveBeenCalledWith({
        auth: mockAuth,
        spreadsheetId: mockSpreadsheetId,
        range: tabTitle,
      });
      expect(data).toEqual(mockResponse);
    });

    it('throws an error when fetching tab values fails', async () => {
      const tabTitle = 'TestTab';
      const mockError = new Error('API Error');
      mockSheets.spreadsheets.values.get.mockRejectedValue(mockError);

      await expect(
        getTabValuesByTitle(tabTitle, mockSheets, mockAuth, mockSpreadsheetId)
      ).rejects.toThrow(`Error fetching values for tab: ${tabTitle}`);
    });
  });
});
