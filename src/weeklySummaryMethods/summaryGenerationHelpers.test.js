import { jest } from '@jest/globals';
import {
  fetchLastWeekTabValues,
  getSourceColumnNumbers,
  findHeaderRowIndex,
  getHeaderMetricsSourceColumnStart,
  getHeaderMetricsSourceColumnEnd,
  getAdjustedHeaderRowIndex,
  findLongestHeaderWithinWeeklySeries,
  initializeWeeklyReportPayload,
  processWeeklySourceTabTitles,
} from './summaryGenerationHelpers.js';
import { getTabValuesByTitle } from '../google/googleSheetIntegration/getSheetData.js';
import {
  findMatchingColumnByWeeklyTabId,
  findTabTitleDataInArray,
  getHeaderAndFooterDataByWeeklyTabTitle,
} from '../google/sheetDataMethods/getSheetInfo.js';
import { dataObjects } from '../index.js';
import { HEADER_INDICATORS, DEFAULT_HEADER_METRICS } from '../../constants.js';

// Mock dependencies
jest.mock('../google/googleSheetIntegration/getSheetData.js', () => ({
  getTabValuesByTitle: jest.fn().mockResolvedValue({
    data: {
      values: [
        ['TYPE', 'CATEGORY', 'TEAM', 'TEST_NAME', 'RESULT'],
        ['E2E', 'Login', 'Team1', 'Test1', 'Pass'],
      ],
    },
  }),
}));

jest.mock('../google/sheetDataMethods/getSheetInfo.js', () => ({
  findMatchingColumnByWeeklyTabId: jest.fn().mockResolvedValue(5),
  findTabTitleDataInArray: jest.fn().mockResolvedValue({
    data: {
      values: [
        ['TYPE', 'CATEGORY', 'TEAM', 'TEST_NAME', 'RESULT'],
        ['E2E', 'Login', 'Team1', 'Test1', 'Pass'],
      ],
    },
  }),
  getHeaderAndFooterDataByWeeklyTabTitle: jest.fn().mockResolvedValue({
    headerValues: ['TYPE', 'CATEGORY', 'TEAM', 'TEST_NAME', 'RESULT'],
    headerRow: 2,
    footerRow: 10,
  }),
}));

jest.mock('../index.js', () => ({
  dataObjects: {
    lastWeekSheetValues: [],
  },
}));

describe('Summary Generation Helpers', () => {
  const mockHeaderFooterData = {
    headerValues: ['TYPE', 'CATEGORY', 'TEAM', 'TEST_NAME', 'RESULT'],
    headerRow: 2,
    footerRow: 10,
  };

  const mockTabValues = [
    {
      data: {
        values: [
          ['TYPE', 'CATEGORY', 'TEAM', 'TEST_NAME', 'RESULT'],
          ['E2E', 'Login', 'Team1', 'Test1', 'Pass'],
        ],
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    dataObjects.lastWeekSheetValues = [];
  });

  describe('fetchLastWeekTabValues', () => {
    it.skip('should fetch values for given titles', async () => {
      const titles = ['2024-03-01', '2024-03-02'];
      getTabValuesByTitle.mockResolvedValue(mockTabValues[0]);

      const result = await fetchLastWeekTabValues(titles);

      expect(result).toEqual(mockTabValues);
      expect(getTabValuesByTitle).toHaveBeenCalledTimes(2);
      expect(dataObjects.lastWeekSheetValues).toContainEqual(mockTabValues);
    });

    it('should handle empty titles array', async () => {
      const result = await fetchLastWeekTabValues([]);
      expect(result).toEqual([]);
    });
  });

  describe('getSourceColumnNumbers', () => {
    it.skip('should return correct column numbers for header indicators', () => {
      const result = getSourceColumnNumbers(
        HEADER_INDICATORS,
        mockHeaderFooterData
      );
      expect(result).toEqual([0, 1, 2, 3, 4]);
    });

    it.skip('should handle missing header indicators', () => {
      const headerData = {
        headerValues: ['TYPE', 'CATEGORY', 'OTHER'],
      };
      const result = getSourceColumnNumbers(HEADER_INDICATORS, headerData);
      expect(result).toEqual([0, 1, -1, -1, -1]);
    });
  });

  describe('findHeaderRowIndex', () => {
    it.skip('should find header row index', () => {
      const rows = [
        ['Other', 'Headers'],
        ['TYPE', 'CATEGORY', 'TEAM', 'TEST_NAME', 'RESULT'],
      ];
      const result = findHeaderRowIndex(rows);
      expect(result).toBe(2);
    });

    it.skip('should return incremented value when header not found', () => {
      const rows = [['Other', 'Headers']];
      const result = findHeaderRowIndex(rows);
      expect(result).toBe(1);
    });
  });

  describe('getHeaderMetricsSourceColumnStart', () => {
    it.skip('should return correct starting column', async () => {
      findMatchingColumnByWeeklyTabId.mockResolvedValue(5);
      const result = await getHeaderMetricsSourceColumnStart(
        'test',
        DEFAULT_HEADER_METRICS
      );
      expect(result).toBe(5);
    });
  });

  describe('getHeaderMetricsSourceColumnEnd', () => {
    it('should calculate correct ending column', () => {
      const result = getHeaderMetricsSourceColumnEnd(5, 3);
      expect(result).toBe(8);
    });
  });

  describe('getAdjustedHeaderRowIndex', () => {
    it('should return adjusted header row index', () => {
      const result = getAdjustedHeaderRowIndex(mockHeaderFooterData);
      expect(result).toBe(1);
    });
  });

  describe('findLongestHeaderWithinWeeklySeries', () => {
    it.skip('should find longest header within series', async () => {
      const sourceTitles = ['2024-03-01', '2024-03-02'];
      const columnMetrics = { longestHeaderEnd: 0 };
      findTabTitleDataInArray.mockResolvedValue(mockTabValues[0]);

      const result = await findLongestHeaderWithinWeeklySeries(
        sourceTitles,
        mockTabValues,
        columnMetrics
      );

      expect(result).toBe(2);
    });

    it.skip('should handle invalid data', async () => {
      const sourceTitles = ['2024-03-01'];
      const columnMetrics = { longestHeaderEnd: 0 };
      findTabTitleDataInArray.mockResolvedValue({ data: { values: null } });

      await expect(
        findLongestHeaderWithinWeeklySeries(sourceTitles, [], columnMetrics)
      ).rejects.toThrow();
    });
  });

  describe('initializeWeeklyReportPayload', () => {
    it('should initialize empty payload structure', () => {
      const result = initializeWeeklyReportPayload();
      expect(result).toEqual({
        bodyPayload: [],
        headerPayload: [],
        summaryHeaderStylePayload: [],
        summaryGridStyles: [],
      });
    });
  });

  describe('processWeeklySourceTabTitles', () => {
    it.skip('should process source tab titles', async () => {
      const titles = ['2024-03-01'];
      const destinationId = '123';
      const summaryPayload = initializeWeeklyReportPayload();
      const columnMetrics = { nextAvailableColumn: 0 };
      const destinationTitle = 'Weekly_2024_03_01';
      const headerLength = 5;

      getHeaderAndFooterDataByWeeklyTabTitle.mockResolvedValue(
        mockHeaderFooterData
      );
      findMatchingColumnByWeeklyTabId.mockResolvedValue(0);

      await processWeeklySourceTabTitles(
        titles,
        destinationId,
        summaryPayload,
        columnMetrics,
        destinationTitle,
        headerLength
      );

      expect(summaryPayload.bodyPayload.length).toBeGreaterThan(0);
      expect(summaryPayload.headerPayload.length).toBeGreaterThan(0);
    });

    it.skip('should handle errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      getHeaderAndFooterDataByWeeklyTabTitle.mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        processWeeklySourceTabTitles(
          ['2024-03-01'],
          '123',
          initializeWeeklyReportPayload(),
          { nextAvailableColumn: 0 },
          'Weekly_2024_03_01',
          5
        )
      ).rejects.toThrow();

      consoleSpy.mockRestore();
    });
  });
});
