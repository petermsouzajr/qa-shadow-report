import { DEFAULT_HEADER_METRICS } from '../../constants.js';
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
} from '../../src/dailyReportMethods/reportGenerationHelpers.js';

describe('report generation helpers', () => {
  describe('generatePlaceholders', () => {
    it('should generate the correct number of placeholder entries', () => {
      const count = 3;
      const expectedPlaceholders = [
        ['', ''],
        ['', ''],
        ['', ''],
      ];

      const placeholders = generatePlaceholders(count);

      expect(placeholders).toEqual(expectedPlaceholders);
      expect(placeholders.length).toBe(count);
    });

    it('should return an empty array when count is zero', () => {
      const count = 0;
      const expectedPlaceholders = [];

      const placeholders = generatePlaceholders(count);

      expect(placeholders).toEqual(expectedPlaceholders);
    });

    it('should throw TypeError if count is a negative number', () => {
      const count = -1;

      expect(() => {
        generatePlaceholders(count);
      }).toThrow(TypeError);
      expect(() => {
        generatePlaceholders(count);
      }).toThrow('The count must be a non-negative integer.');
    });

    it('should throw TypeError if count is not a number', () => {
      const count = 'invalid';

      expect(() => {
        generatePlaceholders(count);
      }).toThrow(TypeError);
      expect(() => {
        generatePlaceholders(count);
      }).toThrow('The count must be a non-negative integer.');
    });

    it('should throw TypeError if count is a floating-point number', () => {
      const count = 3.5;

      expect(() => {
        generatePlaceholders(count);
      }).toThrow(TypeError);
      expect(() => {
        generatePlaceholders(count);
      }).toThrow('The count must be a non-negative integer.');
    });
  });

  describe('generateReportEntry', () => {
    it('should return an array with title and formula for valid inputs', () => {
      const title = 'Test Title';
      const formula = 'Test Formula';
      const result = generateReportEntry(title, formula);
      expect(result).toEqual([title, formula]);
    });

    it('should throw TypeError if title is not a string', () => {
      const title = 123; // Not a string
      const formula = 'Test Formula';
      expect(() => generateReportEntry(title, formula)).toThrow(TypeError);
      expect(() => generateReportEntry(title, formula)).toThrow(
        'Title must be a string.'
      );
    });

    it('should throw TypeError if formula is not a string', () => {
      const title = 'Test Title';
      const formula = 123; // Not a string
      expect(() => generateReportEntry(title, formula)).toThrow(TypeError);
      expect(() => generateReportEntry(title, formula)).toThrow(
        'Formula must be a string.'
      );
    });
  });
  describe('generateStateReports', () => {
    it('should generate state reports for given index', () => {
      const index = 0; // Index for 'passed tests'
      const reports = generateStateReports(DEFAULT_HEADER_METRICS, index);
      expect(reports).toHaveLength(DEFAULT_HEADER_METRICS.length);
      expect(reports[0]).toEqual(['# passed tests', 'passed formula base']);
    });

    it('should throw TypeError if defaultHeaderMetrics is not an array', () => {
      expect(() => generateStateReports('not an array', 0)).toThrow(TypeError);
    });
  });
  describe('generateTeamReport', () => {
    it('should generate a report for a valid team type', () => {
      const type = 'team1';
      const report = generateTeamReport(type);
      expect(report).toEqual([
        '# team1 tests passed',
        'team1 formula tests passed',
      ]);
    });

    it('should throw TypeError if type is not a string or is empty', () => {
      expect(() => generateTeamReport(123)).toThrow(TypeError);
      expect(() => generateTeamReport('')).toThrow(TypeError);
    });
  });
  describe('generateTypeReport', () => {
    it('should generate a report for a valid type', () => {
      const type = 'type1';
      const report = generateTypeReport(type);
      expect(report).toHaveLength(1);
      expect(report[0]).toEqual([
        '# type1 tests passed',
        'type1 formula tests passed',
      ]);
    });

    it('should throw TypeError if type is not a string or is empty', () => {
      expect(() => generateTypeReport(123)).toThrow(TypeError);
      expect(() => generateTypeReport('')).toThrow(TypeError);
    });
  });
  describe('generateReport', () => {
    const types = ['type1', 'type2'];
    const payload = [
      ['type1', 'data1'],
      ['type2', 'data2'],
    ];
    const validSearchIndex = 0;
    const invalidSearchIndex = -1;

    it('should generate a report based on types and payload', async () => {
      const report = await generateReport(types, payload, validSearchIndex);
      expect(report).toHaveLength(2); // Two types, one report each
    });

    it('should throw an error for invalid types array', async () => {
      expect(() =>
        generateReport('not an array', payload, validSearchIndex)
      ).toThrow(Error);
    });

    it('should throw an error for invalid payload array', async () => {
      expect(() =>
        generateReport(types, 'not an array', validSearchIndex)
      ).toThrow(Error);
    });

    it('should throw an error for invalid searchIndex', async () => {
      expect(() => generateReport(types, payload, invalidSearchIndex)).toThrow(
        Error
      );
    });
  });
  describe('buildFormulas', () => {
    it('should create formulas correctly', () => {
      const formulas = buildFormulas('testType', 1, 10, 9, 'A', 'B');
      expect(formulas).toBeInstanceOf(Object);
      // Add more specific expectations here based on your actual formula templates
    });

    it('throws error for invalid type', () => {
      expect(() => buildFormulas(123, 1, 10, 9, 'A', 'B')).toThrow(Error);
      // Add tests for other invalid parameters
    });
  });
  describe('constructHeaderRegex', () => {
    it('should return a regex pattern', () => {
      const regex = constructHeaderRegex();
      expect(regex).toBeInstanceOf(RegExp);
      // You can also test if the regex works correctly with some example strings
    });
  });
  describe('determineSubjectColumn', () => {
    it('should determine the correct column letter', () => {
      const column = determineSubjectColumn('smoke');
      expect(column).toBe('E'); // Replace 'A' with the expected result
    });
  });
  describe('getKeysPattern', () => {
    it('should return a string pattern for regex matching', () => {
      const pattern = getKeysPattern();
      expect(typeof pattern).toBe('string');
      // Add more specific expectations about the pattern format
    });
  });
  describe('createMergeQueries', () => {
    const data = [
      ['header1', 'header2'],
      ['data1', 'data2'],
      ['data1', 'data3'],
    ];
    const headerRowIndex = 1;
    const sheetId = 0;

    it('should create merge queries correctly', () => {
      const queries = createMergeQueries(data, headerRowIndex, sheetId);
      expect(queries).toBeInstanceOf(Object);
      // Add more specific expectations about the structure and content of queries
    });

    it('handles empty data correctly', () => {
      const queries = createMergeQueries([], headerRowIndex, sheetId);
      expect(queries.requests).toHaveLength(0);
    });
  });
});
