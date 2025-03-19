import { jest } from '@jest/globals';
import {
  fetchLastMonthTabValues,
  getSourceColumnNumbers,
  findHeaderRowIndex,
  getHeaderMetricsSourceColumnStart,
  getHeaderMetricsSourceColumnEnd,
  getAdjustedHeaderRowIndex,
  findLongestHeaderWithinSeries,
  initializeReportPayload,
  processSourceTabTitles,
} from './summaryGenerationHelpers.js';
import { getTabValuesByTitle } from '../google/googleSheetIntegration/getSheetData.js';
import {
  findMatchingColumnByTabId,
  findTabTitleDataInArray,
} from '../google/sheetDataMethods/getSheetInfo.js';
import { dataObjects } from '../index.js';
import { HEADER_INDICATORS, DEFAULT_HEADER_METRICS } from '../../constants.js';

// Mock Setup
jest.mock('../google/googleSheetIntegration/getSheetData.js');
jest.mock('../google/sheetDataMethods/getSheetInfo.js');
jest.mock('../index.js');

describe('Summary Generation Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dataObjects.lastMonthSheetValues = [];
  });

  describe('fetchLastMonthTabValues', () => {
    it.skip('should fetch values for multiple tab titles', async () => {
      const mockTitles = ['2021-12-01', '2021-12-15'];
      const mockValues = [
        { data: { values: [['Header1', 'Header2']] } },
        { data: { values: [['Header1', 'Header2']] } },
      ];

      getTabValuesByTitle.mockImplementation((title) => {
        return Promise.resolve(mockValues[mockTitles.indexOf(title)]);
      });

      const result = await fetchLastMonthTabValues(mockTitles);

      expect(result).toEqual(mockValues);
      expect(dataObjects.lastMonthSheetValues).toContain(mockValues);
      expect(getTabValuesByTitle).toHaveBeenCalledTimes(2);
    });

    it.skip('should handle empty titles array', async () => {
      const result = await fetchLastMonthTabValues([]);
      expect(result).toEqual([]);
      expect(getTabValuesByTitle).not.toHaveBeenCalled();
    });

    it.skip('should handle API errors', async () => {
      getTabValuesByTitle.mockRejectedValue(new Error('API Error'));
      await expect(fetchLastMonthTabValues(['2021-12-01'])).rejects.toThrow(
        'API Error'
      );
    });
  });

  describe('getSourceColumnNumbers', () => {
    it('should find column numbers for header indicators', () => {
      const headerFooterData = {
        headerValues: ['Date', 'Header1', 'Header2', 'Header3'],
      };
      const result = getSourceColumnNumbers(
        HEADER_INDICATORS,
        headerFooterData
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result.every((num) => typeof num === 'number')).toBe(true);
    });

    it('should handle missing header indicators', () => {
      const headerFooterData = {
        headerValues: ['Date', 'OtherHeader'],
      };
      const result = getSourceColumnNumbers(
        HEADER_INDICATORS,
        headerFooterData
      );
      expect(result).toEqual([]);
    });
  });

  describe('findHeaderRowIndex', () => {
    it('should find header row index when all indicators are present', () => {
      const rows = [['Other', 'Other'], HEADER_INDICATORS, ['Data', 'Data']];
      const result = findHeaderRowIndex(rows);
      expect(result).toBe(2);
    });

    it.skip('should return incremented value when header not found', () => {
      const rows = [
        ['Other', 'Other'],
        ['Data', 'Data'],
      ];
      const result = findHeaderRowIndex(rows);
      expect(result).toBe(1);
    });
  });

  describe('getHeaderMetricsSourceColumnStart', () => {
    it.skip('should find matching column for header metrics', async () => {
      findMatchingColumnByTabId.mockResolvedValue(5);
      const result = await getHeaderMetricsSourceColumnStart(
        'test',
        DEFAULT_HEADER_METRICS
      );
      expect(result).toBe(5);
      expect(findMatchingColumnByTabId).toHaveBeenCalledWith(
        'test',
        DEFAULT_HEADER_METRICS
      );
    });

    it.skip('should handle errors from findMatchingColumnByTabId', async () => {
      findMatchingColumnByTabId.mockRejectedValue(new Error('Not found'));
      await expect(
        getHeaderMetricsSourceColumnStart('test', DEFAULT_HEADER_METRICS)
      ).rejects.toThrow('Not found');
    });
  });

  describe('getHeaderMetricsSourceColumnEnd', () => {
    it('should calculate end column correctly', () => {
      const result = getHeaderMetricsSourceColumnEnd(5, 3);
      expect(result).toBe(8);
    });
  });

  describe('getAdjustedHeaderRowIndex', () => {
    it('should adjust header row index correctly', () => {
      const headerFooterData = { headerRow: 3 };
      const result = getAdjustedHeaderRowIndex(headerFooterData);
      expect(result).toBe(2);
    });
  });

  describe('findLongestHeaderWithinSeries', () => {
    it.skip('should find longest header among source tabs', async () => {
      const sourceTabTitles = ['2021-12-01', '2021-12-15'];
      const lastMonthTabValues = [
        { data: { values: [['Header1', 'Header2']] } },
        { data: { values: [['Header1', 'Header2', 'Header3']] } },
      ];
      const columnMetrics = { longestHeaderEnd: 0 };

      findTabTitleDataInArray.mockImplementation((values, title) => {
        return values[sourceTabTitles.indexOf(title)];
      });

      const result = await findLongestHeaderWithinSeries(
        sourceTabTitles,
        lastMonthTabValues,
        columnMetrics
      );

      expect(result).toBeGreaterThan(0);
    });

    it.skip('should handle invalid data', async () => {
      const sourceTabTitles = ['2021-12-01'];
      const lastMonthTabValues = [{ invalid: 'data' }];
      const columnMetrics = { longestHeaderEnd: 0 };

      findTabTitleDataInArray.mockReturnValue(lastMonthTabValues[0]);

      await expect(
        findLongestHeaderWithinSeries(
          sourceTabTitles,
          lastMonthTabValues,
          columnMetrics
        )
      ).rejects.toThrow('Data for source tab title');
    });
  });

  describe('initializeReportPayload', () => {
    it('should initialize empty payload structure', () => {
      const result = initializeReportPayload();
      expect(result).toEqual({
        bodyPayload: [],
        headerPayload: [],
        summaryHeaderStylePayload: [],
        summaryGridStyles: [],
      });
    });
  });

  describe('processSourceTabTitles', () => {
    it.skip('should process source tab titles successfully', async () => {
      const titles = ['2021-12-01'];
      const destinationTabId = 123;
      const summaryPayload = initializeReportPayload();
      const columnMetrics = { longestHeaderEnd: 0 };
      const destinationTabTitle = 'Summary';
      const headerIndicatorsLength = 5;

      // Mock the necessary functions
      findTabTitleDataInArray.mockResolvedValue({
        data: { values: [HEADER_INDICATORS] },
      });
      getHeaderMetricsSourceColumnStart.mockResolvedValue(1);

      await processSourceTabTitles(
        titles,
        destinationTabId,
        summaryPayload,
        columnMetrics,
        destinationTabTitle,
        headerIndicatorsLength
      );

      expect(summaryPayload.bodyPayload.length).toBeGreaterThan(0);
    });

    it.skip('should handle errors during processing', async () => {
      const titles = ['2021-12-01'];
      const destinationTabId = 123;
      const summaryPayload = initializeReportPayload();
      const columnMetrics = { longestHeaderEnd: 0 };
      const destinationTabTitle = 'Summary';
      const headerIndicatorsLength = 5;

      findTabTitleDataInArray.mockRejectedValue(new Error('Processing error'));

      await expect(
        processSourceTabTitles(
          titles,
          destinationTabId,
          summaryPayload,
          columnMetrics,
          destinationTabTitle,
          headerIndicatorsLength
        )
      ).rejects.toThrow('Processing error');
    });
  });
});
