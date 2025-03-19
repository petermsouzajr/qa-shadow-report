import { jest } from '@jest/globals';

// Mock the modules before importing
const mockProcessWeeklySourceTabTitles = jest.fn();
const mockGetTabIdFromWeeklyTitle = jest.fn();
const mockGetDayIndex = jest.fn();
const mockGetHeaderIndicatorsLength = jest.fn();
const mockInitializeReportColumnMetrics = jest.fn();
const mockFindLongestHeaderWithinWeeklySeries = jest.fn();
const mockFetchLastWeekTabValues = jest.fn();
const mockInitializeWeeklyReportPayload = jest.fn();

jest.unstable_mockModule('./summaryGenerationHelpers.js', () => ({
  findLongestHeaderWithinWeeklySeries:
    mockFindLongestHeaderWithinWeeklySeries.mockResolvedValue(10),
  processWeeklySourceTabTitles: mockProcessWeeklySourceTabTitles,
  fetchLastWeekTabValues: mockFetchLastWeekTabValues,
  initializeWeeklyReportPayload:
    mockInitializeWeeklyReportPayload.mockReturnValue({
      metadata: {},
      headerPayload: [],
      bodyPayload: [],
      summaryHeaderStylePayload: [],
    }),
}));

jest.unstable_mockModule('../google/sheetDataMethods/getSheetInfo.js', () => ({
  getTabIdFromWeeklyTitle: mockGetTabIdFromWeeklyTitle,
}));

jest.unstable_mockModule('../sharedMethods/dateFormatting.js', () => ({
  getDayIndex: mockGetDayIndex,
}));

jest.unstable_mockModule('../sharedMethods/summaryHandler.js', () => ({
  getHeaderIndicatorsLength: mockGetHeaderIndicatorsLength,
  initializeReportColumnMetrics: mockInitializeReportColumnMetrics,
}));

const { constructWeeklyPayloadForCopyPaste } = await import(
  './buildSummary.js'
);

describe('constructWeeklyPayloadForCopyPaste', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    mockGetTabIdFromWeeklyTitle.mockResolvedValue('123');
    mockGetDayIndex.mockReturnValue(1);
    mockGetHeaderIndicatorsLength.mockReturnValue(5);
    mockInitializeReportColumnMetrics.mockReturnValue({
      nextAvailableColumn: 0,
      defaultHeaderMetricsDestinationColumn: 0,
      longestHeaderEnd: 0,
      defaultHeaderMetricsDestinationColumnEnd: 5,
    });
    mockFetchLastWeekTabValues.mockResolvedValue([]);
  });

  it('should construct weekly payload successfully', async () => {
    const sourceTitles = ['Mar 20, 2024'];
    const destinationTitle = 'Weekly Summary';

    const result = await constructWeeklyPayloadForCopyPaste(
      sourceTitles,
      destinationTitle
    );

    expect(result).toBeDefined();
    expect(result.metadata.summaryType).toBe('weekly');
    expect(result.metadata.startDate).toBeDefined();
    expect(result.metadata.endDate).toBeDefined();
  });

  it('should filter source titles within date range', async () => {
    const sourceTitles = ['Mar 20, 2024', 'Mar 21, 2024'];
    const destinationTitle = 'Weekly Summary';

    // Mock the current date to be March 20, 2024
    const mockDate = new Date('2024-03-20T12:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    // Mock getDayIndex to return Monday (1)
    mockGetDayIndex.mockReturnValue(1);

    // These titles should be within the week range
    const expectedFilteredTitles = sourceTitles;
    mockFetchLastWeekTabValues.mockResolvedValue(expectedFilteredTitles);

    await constructWeeklyPayloadForCopyPaste(sourceTitles, destinationTitle);

    expect(mockProcessWeeklySourceTabTitles).toHaveBeenCalledWith(
      expectedFilteredTitles,
      '123',
      expect.any(Object),
      expect.any(Object),
      destinationTitle,
      5
    );

    jest.useRealTimers();
  });

  it('should sort source titles by date', async () => {
    const unsortedTitles = ['Mar 22, 2024', 'Mar 20, 2024', 'Mar 21, 2024'];
    const sortedTitles = ['Mar 20, 2024', 'Mar 21, 2024', 'Mar 22, 2024'];
    const destinationTitle = 'Weekly Summary';

    // Mock the current date to be March 22, 2024
    const mockDate = new Date('2024-03-22T12:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    // Mock getDayIndex to return Monday (1)
    mockGetDayIndex.mockReturnValue(1);

    // Mock fetchLastWeekTabValues to return the sorted titles
    mockFetchLastWeekTabValues.mockResolvedValue(sortedTitles);

    await constructWeeklyPayloadForCopyPaste(unsortedTitles, destinationTitle);

    // Verify that processWeeklySourceTabTitles was called with sorted titles
    expect(mockProcessWeeklySourceTabTitles).toHaveBeenCalledWith(
      sortedTitles,
      '123',
      expect.any(Object),
      expect.any(Object),
      destinationTitle,
      5
    );

    jest.useRealTimers();
  });

  it('should handle empty source titles', async () => {
    const sourceTitles = [];
    const destinationTitle = 'Weekly Summary';

    mockFetchLastWeekTabValues.mockResolvedValue([]);

    const result = await constructWeeklyPayloadForCopyPaste(
      sourceTitles,
      destinationTitle
    );

    expect(result).toBeDefined();
    expect(mockProcessWeeklySourceTabTitles).toHaveBeenCalledWith(
      [],
      '123',
      expect.any(Object),
      expect.any(Object),
      destinationTitle,
      5
    );
  });

  it('should handle errors gracefully', async () => {
    const sourceTitles = ['Mar 20, 2024'];
    const destinationTitle = 'Weekly Summary';
    mockGetTabIdFromWeeklyTitle.mockRejectedValue(new Error('Test error'));

    await expect(
      constructWeeklyPayloadForCopyPaste(sourceTitles, destinationTitle)
    ).rejects.toThrow('Error building weekly copy-paste payload.');
  });
});
