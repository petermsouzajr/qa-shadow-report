import {
  buildFormulas,
  constructHeaderRegex,
  createMergeQueries,
  determineSubjectColumn,
  generatePlaceholders,
  generateReport,
  generateReportEntry,
  generateStateReports,
  generateTeamReport,
  generateTypeReport,
  getKeysPattern,
} from './reportGenerationHelpers.js';
import { numberToLetter } from '../../sharedMethods/dataHandler.js';
import { initializeReportColumnMetrics } from '../../sharedMethods/summaryHandler.js';
import {
  PAYLOAD_TEST_DATA,
  TEST_OBJECTS,
  TEST_TYPES,
  TEST_CATEGORIES,
} from '../../../__tests__/data/testData';
import { jest } from '@jest/globals';

describe('report generation helpers', () => {
  // Test Data Setup
  const createTestParams = (params) => ({
    ...params,
  });

  // generatePlaceholders Tests
  describe('generatePlaceholders', () => {
    it('should generate the correct number of placeholders', () => {
      const count = 3;
      const placeholders = generatePlaceholders(count);
      expect(placeholders).toEqual([
        ['', ''],
        ['', ''],
        ['', ''],
      ]);
    });

    it('should handle zero count', () => {
      const placeholders = generatePlaceholders(0);
      expect(placeholders).toEqual([]);
    });

    it('should handle large count', () => {
      const count = 1000;
      const placeholders = generatePlaceholders(count);
      expect(placeholders.length).toBe(count);
      expect(placeholders[0]).toEqual(['', '']);
    });

    it('should throw a TypeError if count is not a number', () => {
      expect(() => generatePlaceholders('3')).toThrow(
        'The count must be a number.'
      );
    });

    it('should throw a TypeError if count is not an integer', () => {
      expect(() => generatePlaceholders(3.5)).toThrow(
        'The count must be an integer.'
      );
    });

    it('should throw a TypeError if count is a negative number', () => {
      expect(() => generatePlaceholders(-1)).toThrow(
        'The count must be a non-negative integer.'
      );
    });
  });

  // generateReportEntry Tests
  describe('generateReportEntry', () => {
    it('should create a report entry with valid inputs', () => {
      const title = 'Test Title';
      const formula = 'SUM(A1:A10)';
      const reportEntry = generateReportEntry(title, formula);
      expect(reportEntry).toEqual([title, formula]);
    });

    it('should handle long titles and formulas', () => {
      const title = 'A'.repeat(100);
      const formula = 'SUM(A1:A1000)';
      const reportEntry = generateReportEntry(title, formula);
      expect(reportEntry).toEqual([title, formula]);
    });

    it('should throw a TypeError if title is not a string', () => {
      expect(() => generateReportEntry(123, 'SUM(A1:A10)')).toThrow(
        'Title must be a string.'
      );
    });

    it('should throw an Error if title is an empty string', () => {
      expect(() => generateReportEntry('', 'SUM(A1:A10)')).toThrow(
        'Title cannot be an empty string.'
      );
    });

    it('should throw a TypeError if formula is not a string', () => {
      expect(() => generateReportEntry('Test Title', 123)).toThrow(
        'Formula must be a string.'
      );
    });

    it('should throw an Error if formula is an empty string', () => {
      expect(() => generateReportEntry('Test Title', '')).toThrow(
        'Formula cannot be an empty string.'
      );
    });
  });

  // generateStateReports Tests
  describe('generateStateReports', () => {
    it('should generate report entries with valid inputs', () => {
      const defaultHeaderMetrics = [
        '# Total tests',
        '# Passed tests',
        '# Failed tests',
      ];
      const index = 0;
      const reports = generateStateReports(defaultHeaderMetrics, index);
      expect(reports).toEqual([
        ['# Total tests', 'Total formula base'],
        ['# Passed tests', 'Total formula base'],
        ['# Failed tests', 'Total formula base'],
      ]);
    });

    it('should handle different metric types', () => {
      const defaultHeaderMetrics = ['# Skipped tests', '# Pending tests'];
      const index = 0;
      const reports = generateStateReports(defaultHeaderMetrics, index);
      expect(reports).toEqual([
        ['# Skipped tests', 'Skipped formula base'],
        ['# Pending tests', 'Skipped formula base'],
      ]);
    });

    it('should throw a TypeError if defaultHeaderMetrics is not an array', () => {
      expect(() => generateStateReports('not an array', 0)).toThrow(
        'defaultHeaderMetrics must be an array of strings.'
      );
    });

    it('should throw a TypeError if defaultHeaderMetrics contains non-string elements', () => {
      expect(() => generateStateReports([1, 2, 3], 0)).toThrow(
        'Each item in defaultHeaderMetrics must be a string.'
      );
    });

    it('should throw a TypeError if index is not a number', () => {
      expect(() =>
        generateStateReports(['# Total tests'], 'not a number')
      ).toThrow('index must be an integer.');
    });

    it('should throw a RangeError if index is out of bounds', () => {
      expect(() => generateStateReports(['# Total tests'], 1)).toThrow(
        'index is out of bounds for defaultHeaderMetrics.'
      );
    });

    it('should throw a TypeError if the extracted type is not a string', () => {
      expect(() => generateStateReports(['#  tests'], 0)).toThrow(
        'The extracted type must be a non-empty string.'
      );
    });
  });

  // generateTeamReport Tests
  describe('generateTeamReport', () => {
    it('should generate a report entry with a valid type', () => {
      const type = 'Team Alpha';
      const reportEntry = generateTeamReport(type);
      expect(reportEntry).toEqual([
        '# Team Alpha tests passed',
        'Team Alpha formula tests passed',
      ]);
    });

    it('should handle team names with special characters', () => {
      const type = 'Team-123_Alpha';
      const reportEntry = generateTeamReport(type);
      expect(reportEntry).toEqual([
        '# Team-123_Alpha tests passed',
        'Team-123_Alpha formula tests passed',
      ]);
    });

    it('should throw a TypeError if type is not a string', () => {
      expect(() => generateTeamReport(123)).toThrow(
        'Type must be a non-empty string.'
      );
    });

    it('should throw a TypeError if type is an empty string', () => {
      expect(() => generateTeamReport('')).toThrow(
        'Type must be a non-empty string.'
      );
    });

    it('should throw a TypeError if type is a string with only whitespace', () => {
      expect(() => generateTeamReport('   ')).toThrow(
        'Type must be a non-empty string.'
      );
    });
  });

  // generateTypeReport Tests
  describe('generateTypeReport', () => {
    it('should generate report entries with a valid type', () => {
      const type = 'Unit';
      const reportEntries = generateTypeReport(type);
      expect(reportEntries).toEqual([
        ['# Unit tests passed', 'Unit formula tests passed'],
      ]);
    });

    it('should handle test types with special characters', () => {
      const type = 'E2E-Test';
      const reportEntries = generateTypeReport(type);
      expect(reportEntries).toEqual([
        ['# E2E-Test tests passed', 'E2E-Test formula tests passed'],
      ]);
    });

    it('should throw a TypeError if type is not a string', () => {
      expect(() => generateTypeReport(123)).toThrow(
        'Type must be a non-empty string.'
      );
    });

    it('should throw a TypeError if type is an empty string', () => {
      expect(() => generateTypeReport('')).toThrow(
        'Type must be a non-empty string.'
      );
    });

    it('should throw a TypeError if type is a string with only whitespace', () => {
      expect(() => generateTypeReport('   ')).toThrow(
        'Type must be a non-empty string.'
      );
    });
  });

  // generateReport Tests
  describe('generateReport', () => {
    it('should generate a report with valid inputs', () => {
      const types = ['Unit', 'Integration'];
      const payload = [
        ['Unit', 'Test 1', 'Passed'],
        ['Integration', 'Test 2', 'Failed'],
        ['Unit', 'Test 3', 'Passed'],
      ];
      const searchIndex = 0;
      const isTeam = false;
      const report = generateReport(types, payload, searchIndex, isTeam);
      expect(report).toEqual([
        ['# Unit tests passed', 'Unit formula tests passed'],
        ['# Integration tests passed', 'Integration formula tests passed'],
      ]);
    });

    it('should handle team reports', () => {
      const types = ['Team Alpha', 'Team Beta'];
      const payload = [
        ['Team Alpha', 'Test 1', 'Passed'],
        ['Team Beta', 'Test 2', 'Failed'],
      ];
      const searchIndex = 0;
      const isTeam = true;
      const report = generateReport(types, payload, searchIndex, isTeam);
      expect(report).toEqual([
        ['# Team Alpha tests passed', 'Team Alpha formula tests passed'],
        ['# Team Beta tests passed', 'Team Beta formula tests passed'],
      ]);
    });

    it('should handle empty types array gracefully', () => {
      const report = generateReport([], [['Unit', 'Test 1']], 0);
      expect(report).toEqual([]);
    });

    it('should handle empty payload gracefully', () => {
      const report = generateReport(['Unit'], [], 0);
      expect(report).toEqual([]);
    });

    it('should throw an error if types is not an array', () => {
      expect(() => generateReport('not an array', [], 0)).toThrow(
        'Types must be an array.'
      );
    });

    it('should throw an error if types contains non-string elements', () => {
      expect(() => generateReport([123], [], 0)).toThrow(
        'All types must be strings.'
      );
    });

    it('should throw an error if payload is not an array', () => {
      expect(() => generateReport([], 'not an array', 0)).toThrow(
        'Payload must be an array.'
      );
    });

    it('should throw an error if searchIndex is not a non-negative integer', () => {
      expect(() => generateReport([], [], -1)).toThrow(
        'SearchIndex must be a non-negative integer.'
      );
    });

    it('should throw an error if isTeam is not a boolean', () => {
      expect(() => generateReport([], [], 0, 'not a boolean')).toThrow(
        'isTeam must be a boolean.'
      );
    });
  });

  // buildFormulas Tests
  describe('buildFormulas', () => {
    it('should build formulas with valid inputs', () => {
      const params = createTestParams({
        type: 'Unit',
        headerRowIndex: 1,
        totalNumberOfRows: 10,
        bodyRowCount: 8,
        subjectColumn: 'A',
        stateColumn: 'B',
      });

      const formulas = buildFormulas(
        params.type,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.subjectColumn,
        params.stateColumn
      );

      expect(formulas).toBeDefined();
      expect(typeof formulas).toBe('object');
    });

    it('should handle different column combinations', () => {
      const params = createTestParams({
        type: 'Integration',
        headerRowIndex: 1,
        totalNumberOfRows: 10,
        bodyRowCount: 8,
        subjectColumn: 'C',
        stateColumn: 'D',
      });

      const formulas = buildFormulas(
        params.type,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.subjectColumn,
        params.stateColumn
      );

      expect(formulas).toBeDefined();
      expect(typeof formulas).toBe('object');
    });

    it('should throw an error if type is not a string', () => {
      const params = createTestParams({
        type: 123,
        headerRowIndex: 1,
        totalNumberOfRows: 10,
        bodyRowCount: 8,
        subjectColumn: 'A',
        stateColumn: 'B',
      });

      expect(() =>
        buildFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow('Type must be a string.');
    });

    it('should throw an error if headerRowIndex is not a positive integer', () => {
      const params = createTestParams({
        type: 'Unit',
        headerRowIndex: 0,
        totalNumberOfRows: 10,
        bodyRowCount: 8,
        subjectColumn: 'A',
        stateColumn: 'B',
      });

      expect(() =>
        buildFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow('Header row index must be a positive integer.');
    });

    it('should throw an error if totalNumberOfRows is not greater than headerRowIndex', () => {
      const params = createTestParams({
        type: 'Unit',
        headerRowIndex: 5,
        totalNumberOfRows: 5,
        bodyRowCount: 8,
        subjectColumn: 'A',
        stateColumn: 'B',
      });

      expect(() =>
        buildFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow(
        'Total number of rows must be an integer greater than header row index.'
      );
    });

    it('should throw an error if bodyRowCount is not a positive integer', () => {
      const params = createTestParams({
        type: 'Unit',
        headerRowIndex: 1,
        totalNumberOfRows: 10,
        bodyRowCount: 0,
        subjectColumn: 'A',
        stateColumn: 'B',
      });

      expect(() =>
        buildFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow('Body row count must be a positive integer.');
    });

    it('should throw an error if subjectColumn is not a non-empty string', () => {
      const params = createTestParams({
        type: 'Unit',
        headerRowIndex: 1,
        totalNumberOfRows: 10,
        bodyRowCount: 8,
        subjectColumn: '',
        stateColumn: 'B',
      });

      expect(() =>
        buildFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow('Subject column must be a non-empty string.');
    });

    it('should throw an error if stateColumn is not a non-empty string', () => {
      const params = createTestParams({
        type: 'Unit',
        headerRowIndex: 1,
        totalNumberOfRows: 10,
        bodyRowCount: 8,
        subjectColumn: 'A',
        stateColumn: '',
      });

      expect(() =>
        buildFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow('State column must be a non-empty string.');
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should generate reports efficiently for large datasets', () => {
      const types = Array(100).fill('Unit');
      const payload = Array(1000).fill(['Unit', 'Test', 'Passed']);
      const searchIndex = 0;
      const isTeam = false;

      const startTime = performance.now();

      const report = generateReport(types, payload, searchIndex, isTeam);

      const endTime = performance.now();

      expect(report).toBeDefined();
      expect(Array.isArray(report)).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should build formulas efficiently for large datasets', () => {
      const params = createTestParams({
        type: 'Unit',
        headerRowIndex: 1,
        totalNumberOfRows: 1000,
        bodyRowCount: 998,
        subjectColumn: 'A',
        stateColumn: 'B',
      });

      const startTime = performance.now();

      const formulas = buildFormulas(
        params.type,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.subjectColumn,
        params.stateColumn
      );

      const endTime = performance.now();

      expect(formulas).toBeDefined();
      expect(typeof formulas).toBe('object');
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe('initializeReportColumnMetrics', () => {
    it('should initialize column metrics', () => {
      const headerIndicatorsLength = 3;
      const result = initializeReportColumnMetrics(headerIndicatorsLength);

      expect(result).toEqual({
        nextAvailableColumn: 0,
        defaultHeaderMetricsDestinationColumn: 0,
        longestHeaderEnd: 0,
        defaultHeaderMetricsDestinationColumnEnd: 3,
      });
    });

    it('should handle zero length', () => {
      const result = initializeReportColumnMetrics(0);
      expect(result).toEqual({
        nextAvailableColumn: 0,
        defaultHeaderMetricsDestinationColumn: 0,
        longestHeaderEnd: 0,
        defaultHeaderMetricsDestinationColumnEnd: 0,
      });
    });
  });
});
