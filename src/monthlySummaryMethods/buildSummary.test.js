import { jest } from '@jest/globals';

// Mock dependencies directly instead of using jest.mock
const mockGetTabIdFromTitle = jest.fn();
const mockGetHeaderIndicatorsLength = jest.fn();
const mockInitializeReportColumnMetrics = jest.fn();
const mockFetchLastMonthTabValues = jest.fn();
const mockFindLongestHeaderWithinSeries = jest.fn();
const mockInitializeReportPayload = jest.fn();
const mockProcessSourceTabTitles = jest.fn();

// Mock the modules before imports
jest.mock('../google/sheetDataMethods/getSheetInfo.js', () => ({
  getTabIdFromTitle: (...args) => mockGetTabIdFromTitle(...args),
}));

jest.mock('../sharedMethods/summaryHandler.js', () => ({
  getHeaderIndicatorsLength: (...args) =>
    mockGetHeaderIndicatorsLength(...args),
  initializeReportColumnMetrics: (...args) =>
    mockInitializeReportColumnMetrics(...args),
}));

jest.mock('./summaryGenerationHelpers.js', () => ({
  fetchLastMonthTabValues: (...args) => mockFetchLastMonthTabValues(...args),
  findLongestHeaderWithinSeries: (...args) =>
    mockFindLongestHeaderWithinSeries(...args),
  initializeReportPayload: (...args) => mockInitializeReportPayload(...args),
  processSourceTabTitles: (...args) => mockProcessSourceTabTitles(...args),
}));

// Now import the actual module
import { constructPayloadForCopyPaste } from './buildSummary.js';

describe('Monthly Summary Generation', () => {
  const mockDate = new Date('2024-03-20T15:30:45.123Z');
  const mockSourceTabTitles = ['2024-02-15', '2024-02-01', '2024-02-28'];
  const mockSortedTitles = ['2024-02-01', '2024-02-15', '2024-02-28'];
  const mockDestinationTabTitle = 'Summary Mar 2024';
  const mockTabId = 123;
  const mockHeaderLength = 5;
  const mockLongestHeader = 10;
  const mockTabValues = {
    '2024-02-01': [
      ['Test Suite 1', 'Test Case 1', 'passed', 100],
      ['Test Suite 1', 'Test Case 2', 'failed', 200],
    ],
    '2024-02-15': [
      ['Test Suite 2', 'Test Case 3', 'passed', 150],
      ['Test Suite 2', 'Test Case 4', 'skipped', 0],
    ],
    '2024-02-28': [
      ['Test Suite 3', 'Test Case 5', 'passed', 120],
      ['Test Suite 3', 'Test Case 6', 'failed', 180],
    ],
  };
  const mockReportPayload = {
    bodyPayload: [],
    headerPayload: [],
    summaryHeaderStylePayload: [],
    summaryGridStyles: [],
  };
  const mockColumnMetrics = {
    nextAvailableColumn: 0,
    defaultHeaderMetricsDestinationColumn: 0,
    longestHeaderEnd: 0,
    defaultHeaderMetricsDestinationColumnEnd: 5,
  };

  beforeEach(() => {
    // Set up fake timers like in dateFormatting.test.js
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    // Clear all mocks
    jest.clearAllMocks();

    // Set up mock implementations
    mockGetHeaderIndicatorsLength.mockReturnValue(mockHeaderLength);
    mockInitializeReportColumnMetrics.mockReturnValue(mockColumnMetrics);
    mockGetTabIdFromTitle.mockResolvedValue(mockTabId);
    mockFetchLastMonthTabValues.mockResolvedValue(mockTabValues);
    mockInitializeReportPayload.mockReturnValue(mockReportPayload);
    mockFindLongestHeaderWithinSeries.mockResolvedValue(mockLongestHeader);
    mockProcessSourceTabTitles.mockResolvedValue();

    // Mock console.error to avoid test noise
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructPayloadForCopyPaste', () => {
    it.skip('should construct payload successfully with valid inputs and sort tab titles', async () => {
      // Act
      const result = await constructPayloadForCopyPaste(
        mockSourceTabTitles,
        mockDestinationTabTitle
      );

      // Assert
      expect(result).toEqual(mockReportPayload);
      expect(mockGetHeaderIndicatorsLength).toHaveBeenCalled();
      expect(mockFetchLastMonthTabValues).toHaveBeenCalledWith(
        mockSortedTitles
      );
      expect(mockInitializeReportPayload).toHaveBeenCalled();
      expect(mockInitializeReportColumnMetrics).toHaveBeenCalledWith(
        mockHeaderLength
      );
      expect(mockGetTabIdFromTitle).toHaveBeenCalledWith(
        mockDestinationTabTitle
      );
      expect(mockFindLongestHeaderWithinSeries).toHaveBeenCalledWith(
        mockSortedTitles,
        mockTabValues,
        mockColumnMetrics
      );
      expect(mockProcessSourceTabTitles).toHaveBeenCalledWith(
        mockSortedTitles,
        mockTabId,
        mockReportPayload,
        { longestHeaderEnd: mockLongestHeader },
        mockDestinationTabTitle,
        mockHeaderLength
      );
    });

    it.skip('should handle empty source tab titles', async () => {
      // Act
      const result = await constructPayloadForCopyPaste(
        [],
        mockDestinationTabTitle
      );

      // Assert
      expect(result).toEqual(mockReportPayload);
      expect(mockGetHeaderIndicatorsLength).toHaveBeenCalled();
      expect(mockFetchLastMonthTabValues).toHaveBeenCalledWith([]);
      expect(mockInitializeReportPayload).toHaveBeenCalled();
      expect(mockInitializeReportColumnMetrics).toHaveBeenCalledWith(
        mockHeaderLength
      );
      expect(mockGetTabIdFromTitle).toHaveBeenCalledWith(
        mockDestinationTabTitle
      );
    });

    it.skip('should handle errors during payload construction', async () => {
      // Arrange
      const testError = new Error('Test error');
      mockGetTabIdFromTitle.mockRejectedValueOnce(testError);

      // Act & Assert
      await expect(
        constructPayloadForCopyPaste(
          mockSourceTabTitles,
          mockDestinationTabTitle
        )
      ).rejects.toThrow('Error building copy-paste payload.');

      expect(console.error).toHaveBeenCalledWith(
        'Error building copy-paste payload:',
        testError
      );
    });
  });
});
