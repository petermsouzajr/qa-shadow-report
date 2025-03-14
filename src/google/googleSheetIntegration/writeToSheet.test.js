import { jest } from '@jest/globals';
import { writeToSheet, batchUpdateMasterSheet } from './writeToSheet';

describe('Google Sheets Write Operations', () => {
  // Test Data Setup
  const createMockSheetsAPI = (auth, spreadsheetId, append, batchUpdate) => ({
    auth,
    spreadsheetId,
    spreadsheets: {
      values: {
        append,
      },
      batchUpdate,
    },
  });

  // Mock Setup
  let mockSheetsAPI;
  let mockAppend;
  let mockBatchUpdate;
  let mockAuth;
  let mockSpreadsheetId;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    global.console.error = jest.fn();

    // Initialize mock data
    mockAppend = jest.fn();
    mockBatchUpdate = jest.fn();
    mockAuth = { dummyAuth: true };
    mockSpreadsheetId = 'dummySpreadsheetId';
    mockSheetsAPI = createMockSheetsAPI(
      mockAuth,
      mockSpreadsheetId,
      mockAppend,
      mockBatchUpdate
    );
  });

  // writeToSheet Tests
  describe('writeToSheet', () => {
    const mockSheetTitle = 'Sheet1';
    const mockValues = [
      ['data1', 'data2'],
      ['data3', 'data4'],
    ];

    it('should append values to the specified sheet', async () => {
      const mockResponse = { data: 'success' };
      mockAppend.mockResolvedValue(mockResponse);

      await writeToSheet(mockSheetTitle, mockValues, mockSheetsAPI);

      expect(mockAppend).toHaveBeenCalledWith({
        auth: mockAuth,
        spreadsheetId: mockSpreadsheetId,
        range: mockSheetTitle,
        valueInputOption: 'USER_ENTERED',
        resource: { values: mockValues },
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockAppend.mockRejectedValue(mockError);

      await expect(
        writeToSheet(mockSheetTitle, mockValues, mockSheetsAPI)
      ).rejects.toThrow('API Error');

      expect(console.error).toHaveBeenCalledWith(
        `Error writing to sheet "${mockSheetTitle}":`,
        mockError
      );
    });

    it('should use default parameters when not provided', async () => {
      const mockResponse = { data: 'success' };
      mockAppend.mockResolvedValue(mockResponse);

      // Provide sensible defaults for auth and spreadsheetId
      const defaultAuth = { dummyAuth: true };
      const defaultSpreadsheetId = 'defaultSpreadsheetId';

      await writeToSheet(mockSheetTitle, mockValues, {
        auth: defaultAuth,
        spreadsheetId: defaultSpreadsheetId,
        spreadsheets: {
          values: {
            append: mockAppend,
          },
        },
      });

      expect(mockAppend).toHaveBeenCalledWith({
        auth: defaultAuth,
        spreadsheetId: defaultSpreadsheetId,
        range: mockSheetTitle,
        valueInputOption: 'USER_ENTERED',
        resource: { values: mockValues },
      });
    });

    it('should handle empty values array', async () => {
      const mockResponse = { data: 'success' };
      mockAppend.mockResolvedValue(mockResponse);

      await writeToSheet(mockSheetTitle, [], mockSheetsAPI);

      expect(mockAppend).toHaveBeenCalledWith({
        auth: mockAuth,
        spreadsheetId: mockSpreadsheetId,
        range: mockSheetTitle,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [] },
      });
    });

    it('should handle special characters in sheet title', async () => {
      const specialTitle = 'Special@#$%^&*()';
      const mockResponse = { data: 'success' };
      mockAppend.mockResolvedValue(mockResponse);

      await writeToSheet(specialTitle, mockValues, mockSheetsAPI);

      expect(mockAppend).toHaveBeenCalledWith({
        auth: mockAuth,
        spreadsheetId: mockSpreadsheetId,
        range: specialTitle,
        valueInputOption: 'USER_ENTERED',
        resource: { values: mockValues },
      });
    });

    it('should handle large data sets', async () => {
      const largeValues = Array(1000)
        .fill()
        .map(() => ['data1', 'data2']);
      const mockResponse = { data: 'success' };
      mockAppend.mockResolvedValue(mockResponse);

      await writeToSheet(mockSheetTitle, largeValues, mockSheetsAPI);

      expect(mockAppend).toHaveBeenCalledWith({
        auth: mockAuth,
        spreadsheetId: mockSpreadsheetId,
        range: mockSheetTitle,
        valueInputOption: 'USER_ENTERED',
        resource: { values: largeValues },
      });
    });
  });

  // batchUpdateMasterSheet Tests
  describe('batchUpdateMasterSheet', () => {
    const mockPayload = {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              title: 'NewTitle',
            },
            fields: 'title',
          },
        },
      ],
    };

    it('should apply batch update with the correct payload', async () => {
      const mockResponse = { data: 'success' };
      mockBatchUpdate.mockResolvedValue(mockResponse);

      await batchUpdateMasterSheet(mockPayload, mockSheetsAPI);

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: mockAuth,
        spreadsheetId: mockSpreadsheetId,
        resource: mockPayload,
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockBatchUpdate.mockRejectedValue(mockError);

      await expect(
        batchUpdateMasterSheet(mockPayload, mockSheetsAPI)
      ).rejects.toThrow('API Error');

      expect(console.error).toHaveBeenCalledWith(
        'Error applying batch update:',
        mockError
      );
    });

    it('should use default parameters when not provided', async () => {
      const mockResponse = { data: 'success' };
      mockBatchUpdate.mockResolvedValue(mockResponse);

      // Provide sensible defaults for auth and spreadsheetId
      const defaultAuth = { dummyAuth: true };
      const defaultSpreadsheetId = 'defaultSpreadsheetId';

      await batchUpdateMasterSheet(mockPayload, {
        auth: defaultAuth,
        spreadsheetId: defaultSpreadsheetId,
        spreadsheets: {
          batchUpdate: mockBatchUpdate,
        },
      });

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: defaultAuth,
        spreadsheetId: defaultSpreadsheetId,
        resource: mockPayload,
      });
    });

    it('should handle empty payload', async () => {
      const emptyPayload = { requests: [] };
      const mockResponse = { data: 'success' };
      mockBatchUpdate.mockResolvedValue(mockResponse);

      await batchUpdateMasterSheet(emptyPayload, mockSheetsAPI);

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: mockAuth,
        spreadsheetId: mockSpreadsheetId,
        resource: emptyPayload,
      });
    });

    it('should handle complex batch update payloads', async () => {
      const complexPayload = {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                title: 'NewTitle',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 100,
                },
              },
              fields: 'title,gridProperties',
            },
          },
          {
            updateCells: {
              rows: Array(100)
                .fill()
                .map(() => ({
                  values: Array(10)
                    .fill()
                    .map(() => ({
                      userEnteredValue: { stringValue: 'test' },
                    })),
                })),
            },
          },
        ],
      };

      const mockResponse = { data: 'success' };
      mockBatchUpdate.mockResolvedValue(mockResponse);

      await batchUpdateMasterSheet(complexPayload, mockSheetsAPI);

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: mockAuth,
        spreadsheetId: mockSpreadsheetId,
        resource: complexPayload,
      });
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should handle multiple write operations efficiently', async () => {
      const mockResponse = { data: 'success' };
      mockAppend.mockResolvedValue(mockResponse);
      mockBatchUpdate.mockResolvedValue(mockResponse);

      const startTime = performance.now();
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        await writeToSheet(`Sheet${i}`, [['data']], mockSheetsAPI);
        await batchUpdateMasterSheet(
          {
            requests: [
              {
                updateSheetProperties: {
                  properties: { title: `NewTitle${i}` },
                },
              },
            ],
          },
          mockSheetsAPI
        );
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});
