import { jest } from '@jest/globals';
import { batchUpdateMasterSheet } from '../googleSheetIntegration/writeToSheet.js';
import { addColumnsAndRowsToTabId } from './processSheetData.js';

// Mock Setup
jest.mock('../googleSheetIntegration/writeToSheet.js', () => ({
  batchUpdateMasterSheet: jest.fn().mockImplementation(async (payload) => {
    if (!payload || !payload.requests || !Array.isArray(payload.requests)) {
      throw new Error('Invalid payload structure');
    }
    return Promise.resolve();
  }),
}));

describe('Google Sheets Data Processing', () => {
  // Test Data Setup
  const mockTabId = 12345;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation to the default success case
    batchUpdateMasterSheet.mockImplementation(async (payload) => {
      if (!payload || !payload.requests || !Array.isArray(payload.requests)) {
        throw new Error('Invalid payload structure');
      }
      return Promise.resolve();
    });
  });

  describe('addColumnsAndRowsToTabId', () => {
    it.skip('should add columns and rows when both quantities are positive', async () => {
      const columnQuantity = 5;
      const rowQuantity = 10;

      const expectedPayload = {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: mockTabId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: columnQuantity,
              },
              inheritFromBefore: false,
            },
          },
          {
            insertDimension: {
              range: {
                sheetId: mockTabId,
                dimension: 'ROWS',
                startIndex: 0,
                endIndex: rowQuantity,
              },
              inheritFromBefore: false,
            },
          },
        ],
      };

      await addColumnsAndRowsToTabId(mockTabId, columnQuantity, rowQuantity);
      expect(batchUpdateMasterSheet).toHaveBeenCalledWith(expectedPayload);
    });

    it.skip('should only add columns when rowQuantity is 0', async () => {
      const columnQuantity = 5;
      const rowQuantity = 0;

      const expectedPayload = {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: mockTabId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: columnQuantity,
              },
              inheritFromBefore: false,
            },
          },
        ],
      };

      await addColumnsAndRowsToTabId(mockTabId, columnQuantity, rowQuantity);
      expect(batchUpdateMasterSheet).toHaveBeenCalledWith(expectedPayload);
    });

    it.skip('should only add rows when columnQuantity is 0', async () => {
      const columnQuantity = 0;
      const rowQuantity = 10;

      const expectedPayload = {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: mockTabId,
                dimension: 'ROWS',
                startIndex: 0,
                endIndex: rowQuantity,
              },
              inheritFromBefore: false,
            },
          },
        ],
      };

      await addColumnsAndRowsToTabId(mockTabId, columnQuantity, rowQuantity);
      expect(batchUpdateMasterSheet).toHaveBeenCalledWith(expectedPayload);
    });

    it.skip('should not call batchUpdateMasterSheet when both quantities are 0', async () => {
      await addColumnsAndRowsToTabId(mockTabId, 0, 0);
      expect(batchUpdateMasterSheet).not.toHaveBeenCalled();
    });

    it.skip('should handle errors from batchUpdateMasterSheet', async () => {
      const error = new Error('API Error');
      batchUpdateMasterSheet.mockRejectedValue(error);

      await expect(addColumnsAndRowsToTabId(mockTabId, 5, 5)).rejects.toThrow(
        error
      );
    });

    it.skip('should handle negative quantities gracefully', async () => {
      const columnQuantity = -5;
      const rowQuantity = -10;

      const expectedPayload = {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: mockTabId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 0,
              },
              inheritFromBefore: false,
            },
          },
          {
            insertDimension: {
              range: {
                sheetId: mockTabId,
                dimension: 'ROWS',
                startIndex: 0,
                endIndex: 0,
              },
              inheritFromBefore: false,
            },
          },
        ],
      };

      await addColumnsAndRowsToTabId(mockTabId, columnQuantity, rowQuantity);
      expect(batchUpdateMasterSheet).toHaveBeenCalledWith(expectedPayload);
    });

    it.skip('should handle decimal quantities by rounding down', async () => {
      const columnQuantity = 5.7;
      const rowQuantity = 10.3;

      const expectedPayload = {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: mockTabId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 5,
              },
              inheritFromBefore: false,
            },
          },
          {
            insertDimension: {
              range: {
                sheetId: mockTabId,
                dimension: 'ROWS',
                startIndex: 0,
                endIndex: 10,
              },
              inheritFromBefore: false,
            },
          },
        ],
      };

      await addColumnsAndRowsToTabId(mockTabId, columnQuantity, rowQuantity);
      expect(batchUpdateMasterSheet).toHaveBeenCalledWith(expectedPayload);
    });

    it.skip('should handle large quantities efficiently', async () => {
      const columnQuantity = 1000;
      const rowQuantity = 1000;

      const startTime = performance.now();
      await addColumnsAndRowsToTabId(mockTabId, columnQuantity, rowQuantity);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(batchUpdateMasterSheet).toHaveBeenCalled();
    });
  });
});
