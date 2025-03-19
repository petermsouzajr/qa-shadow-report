import { jest } from '@jest/globals';
import { createNewTab, createNewWeeklyTab } from './createNewTab';

describe('Google Sheets Tab Creation', () => {
  // Test Data Setup
  const createMockData = () => ({
    summaryTabData: null,
    todaysReportData: null,
    weeklySummaryTabData: null,
  });

  const createMockSheetsAPI = (auth, spreadsheetId, batchUpdate) => ({
    auth,
    spreadsheetId,
    spreadsheets: {
      batchUpdate,
    },
  });

  // Mock Setup
  let mockDataObjects;
  let mockSheetsAPI;
  let mockBatchUpdate;
  let mockCreateSummaryTitle;
  let mockCreateWeeklySummaryTitle;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    global.console.error = jest.fn();

    // Initialize mock data
    mockDataObjects = createMockData();
    mockBatchUpdate = jest.fn();
    mockCreateSummaryTitle = jest.fn();
    mockCreateWeeklySummaryTitle = jest.fn();

    // Setup mock Sheets API
    mockSheetsAPI = createMockSheetsAPI(
      { dummyAuth: true },
      'dummySpreadsheetId',
      mockBatchUpdate
    );
  });

  // createNewTab Tests
  describe('createNewTab', () => {
    it('should create a new summary tab and update summaryTabData', async () => {
      const mockSheetName = 'Summary';
      const mockResponse = { data: 'mockResponse' };
      mockBatchUpdate.mockResolvedValue(mockResponse);
      mockCreateSummaryTitle.mockReturnValue('Summary');

      const response = await createNewTab(
        mockSheetName,
        mockCreateSummaryTitle,
        mockDataObjects,
        mockSheetsAPI
      );

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: { dummyAuth: true },
        spreadsheetId: 'dummySpreadsheetId',
        requestBody: {
          requests: [{ addSheet: { properties: { title: mockSheetName } } }],
        },
      });
      expect(response).toEqual(mockResponse);
      expect(mockDataObjects.summaryTabData).toEqual(mockResponse);
    });

    it('should create a new regular tab and update todaysReportData', async () => {
      const mockSheetName = 'RegularTab';
      const mockResponse = { data: 'mockRegularResponse' };
      mockBatchUpdate.mockResolvedValue(mockResponse);
      mockCreateSummaryTitle.mockReturnValue('DifferentTitle');

      const response = await createNewTab(
        mockSheetName,
        mockCreateSummaryTitle,
        mockDataObjects,
        mockSheetsAPI
      );

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: { dummyAuth: true },
        spreadsheetId: 'dummySpreadsheetId',
        requestBody: {
          requests: [{ addSheet: { properties: { title: mockSheetName } } }],
        },
      });
      expect(response).toEqual(mockResponse);
      expect(mockDataObjects.todaysReportData).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      const mockSheetName = 'ErrorTab';
      const mockError = new Error('API Error');
      mockBatchUpdate.mockRejectedValue(mockError);

      await expect(
        createNewTab(
          mockSheetName,
          mockCreateSummaryTitle,
          mockDataObjects,
          mockSheetsAPI
        )
      ).rejects.toThrow('API Error');

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: { dummyAuth: true },
        spreadsheetId: 'dummySpreadsheetId',
        requestBody: {
          requests: [{ addSheet: { properties: { title: mockSheetName } } }],
        },
      });
      expect(console.error).toHaveBeenCalledWith(
        '"createNewTab": Error creating new sheet:',
        mockError
      );
    });

    it('should call createSummaryTitle with correct parameters', async () => {
      const mockSheetName = 'Summary';
      mockBatchUpdate.mockResolvedValue({ data: 'mockResponse' });
      mockCreateSummaryTitle.mockReturnValue(mockSheetName);

      await createNewTab(
        mockSheetName,
        mockCreateSummaryTitle,
        mockDataObjects,
        mockSheetsAPI
      );

      expect(mockCreateSummaryTitle).toHaveBeenCalledWith();
    });

    it('should handle empty sheet name', async () => {
      const mockSheetName = '';
      mockBatchUpdate.mockResolvedValue({ data: 'mockResponse' });

      await createNewTab(
        mockSheetName,
        mockCreateSummaryTitle,
        mockDataObjects,
        mockSheetsAPI
      );

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: { dummyAuth: true },
        spreadsheetId: 'dummySpreadsheetId',
        requestBody: {
          requests: [{ addSheet: { properties: { title: '' } } }],
        },
      });
    });

    it('should handle special characters in sheet name', async () => {
      const mockSheetName = 'Special@#$%^&*()';
      mockBatchUpdate.mockResolvedValue({ data: 'mockResponse' });

      await createNewTab(
        mockSheetName,
        mockCreateSummaryTitle,
        mockDataObjects,
        mockSheetsAPI
      );

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: { dummyAuth: true },
        spreadsheetId: 'dummySpreadsheetId',
        requestBody: {
          requests: [{ addSheet: { properties: { title: mockSheetName } } }],
        },
      });
    });
  });

  // createNewWeeklyTab Tests
  describe('createNewWeeklyTab', () => {
    it('should create a new weekly summary tab and update weeklySummaryTabData', async () => {
      const mockSheetName = 'Weekly Summary';
      const mockResponse = { data: 'mockWeeklyResponse' };
      mockBatchUpdate.mockResolvedValue(mockResponse);
      mockCreateWeeklySummaryTitle.mockReturnValue('Weekly Summary');

      const response = await createNewWeeklyTab(
        mockSheetName,
        mockCreateWeeklySummaryTitle,
        mockDataObjects,
        mockSheetsAPI
      );

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: { dummyAuth: true },
        spreadsheetId: 'dummySpreadsheetId',
        requestBody: {
          requests: [{ addSheet: { properties: { title: mockSheetName } } }],
        },
      });
      expect(response).toEqual(mockResponse);
      expect(mockDataObjects.weeklySummaryTabData).toEqual(mockResponse);
    });

    it('should create a new regular tab and update todaysReportData for non-summary tabs', async () => {
      const mockSheetName = 'RegularWeeklyTab';
      const mockResponse = { data: 'mockRegularWeeklyResponse' };
      mockBatchUpdate.mockResolvedValue(mockResponse);
      mockCreateWeeklySummaryTitle.mockReturnValue('DifferentWeeklyTitle');

      const response = await createNewWeeklyTab(
        mockSheetName,
        mockCreateWeeklySummaryTitle,
        mockDataObjects,
        mockSheetsAPI
      );

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: { dummyAuth: true },
        spreadsheetId: 'dummySpreadsheetId',
        requestBody: {
          requests: [{ addSheet: { properties: { title: mockSheetName } } }],
        },
      });
      expect(response).toEqual(mockResponse);
      expect(mockDataObjects.todaysReportData).toEqual(mockResponse);
    });

    it('should handle API errors gracefully for weekly tabs', async () => {
      const mockSheetName = 'WeeklyErrorTab';
      const mockError = new Error('Weekly API Error');
      mockBatchUpdate.mockRejectedValue(mockError);

      await expect(
        createNewWeeklyTab(
          mockSheetName,
          mockCreateWeeklySummaryTitle,
          mockDataObjects,
          mockSheetsAPI
        )
      ).rejects.toThrow('Weekly API Error');

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: { dummyAuth: true },
        spreadsheetId: 'dummySpreadsheetId',
        requestBody: {
          requests: [{ addSheet: { properties: { title: mockSheetName } } }],
        },
      });
      expect(console.error).toHaveBeenCalledWith(
        '"createNewTab": Error creating new sheet:',
        mockError
      );
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should create tabs efficiently', async () => {
      const mockSheetName = 'PerformanceTest';
      const mockResponse = { data: 'mockResponse' };
      mockBatchUpdate.mockResolvedValue(mockResponse);

      const startTime = performance.now();
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        await createNewTab(
          `${mockSheetName}${i}`,
          mockCreateSummaryTitle,
          mockDataObjects,
          mockSheetsAPI
        );
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
