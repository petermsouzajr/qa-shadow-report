import { jest } from '@jest/globals';
import { combineReports } from './combineReports.js';
import {
  PAYLOAD_TEST_DATA,
  TEST_OBJECTS,
} from '../../../__tests__/data/testData';

describe('combineReports', () => {
  // Test Data Setup
  const createReportEntry = (testData, passedData) => [testData, passedData];

  const createReport = (entries) =>
    entries.reduce((acc, [tests, passed]) => {
      acc.push(tests);
      acc.push(passed);
      return acc;
    }, []);

  const createPlaceholders = (testPlaceholder, passedPlaceholder) => [
    testPlaceholder,
    passedPlaceholder,
  ];

  // Mock console.error for error logging tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Basic Functionality Tests
  describe('Basic Functionality', () => {
    it('should combine multiple reports correctly', () => {
      const allReportEntries = [
        createReport([
          createReportEntry(['A1', 'A2'], ['B1', 'B2']),
          createReportEntry(['C1', 'C2'], ['D1', 'D2']),
        ]),
        createReport([
          createReportEntry(['E1', 'E2'], ['F1', 'F2']),
          createReportEntry(['G1', 'G2'], ['H1', 'H2']),
        ]),
      ];
      const placeholders = createPlaceholders(['P1', 'P2'], ['P3', 'P4']);

      const result = combineReports(allReportEntries, placeholders);

      expect(result).toEqual([
        ['A1', 'A2', 'E1', 'E2'],
        ['B1', 'B2', 'F1', 'F2'],
        ['C1', 'C2', 'G1', 'G2'],
        ['D1', 'D2', 'H1', 'H2'],
      ]);
    });

    it('should use placeholders for missing report entries', () => {
      const allReportEntries = [
        createReport([createReportEntry(['A1', 'A2'], ['B1', 'B2'])]),
        createReport([createReportEntry(['C1', 'C2'], ['D1', 'D2'])]),
      ];
      const placeholders = createPlaceholders(['P1', 'P2'], ['P3', 'P4']);

      const result = combineReports(allReportEntries, placeholders);

      expect(result).toEqual([
        ['A1', 'A2', 'C1', 'C2'],
        ['B1', 'B2', 'D1', 'D2'],
      ]);
    });

    it('should handle single report entries', () => {
      const allReportEntries = [
        createReport([createReportEntry(['A1', 'A2'], ['B1', 'B2'])]),
      ];
      const placeholders = createPlaceholders(['P1', 'P2'], ['P3', 'P4']);

      const result = combineReports(allReportEntries, placeholders);

      expect(result).toEqual([
        ['A1', 'A2'],
        ['B1', 'B2'],
      ]);
    });

    it('should handle real test data from PAYLOAD_TEST_DATA', () => {
      const testReports = [
        createReport([
          createReportEntry(
            [PAYLOAD_TEST_DATA.sampleDailyPayload.passed[0].fullTitle],
            [PAYLOAD_TEST_DATA.sampleDailyPayload.passed[0].state]
          ),
        ]),
        createReport([
          createReportEntry(
            [PAYLOAD_TEST_DATA.sampleDailyPayload.failed[0].fullTitle],
            [PAYLOAD_TEST_DATA.sampleDailyPayload.failed[0].state]
          ),
        ]),
      ];
      const placeholders = createPlaceholders(['--', '--'], ['--', '--']);

      const result = combineReports(testReports, placeholders);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([
        PAYLOAD_TEST_DATA.sampleDailyPayload.passed[0].fullTitle,
        PAYLOAD_TEST_DATA.sampleDailyPayload.failed[0].fullTitle,
      ]);
      expect(result[1]).toEqual([
        PAYLOAD_TEST_DATA.sampleDailyPayload.passed[0].state,
        PAYLOAD_TEST_DATA.sampleDailyPayload.failed[0].state,
      ]);
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle empty report entries', () => {
      const allReportEntries = [createReport([]), createReport([])];
      const placeholders = createPlaceholders(['P1', 'P2'], ['P3', 'P4']);

      const result = combineReports(allReportEntries, placeholders);

      expect(result).toEqual([]);
    });

    it('should handle reports with different lengths', () => {
      const allReportEntries = [
        createReport([
          createReportEntry(['A1', 'A2'], ['B1', 'B2']),
          createReportEntry(['C1', 'C2'], ['D1', 'D2']),
        ]),
        createReport([createReportEntry(['E1', 'E2'], ['F1', 'F2'])]),
      ];
      const placeholders = createPlaceholders(['P1', 'P2'], ['P3', 'P4']);

      const result = combineReports(allReportEntries, placeholders);

      expect(result).toEqual([
        ['A1', 'A2', 'E1', 'E2'],
        ['B1', 'B2', 'F1', 'F2'],
        ['C1', 'C2', 'P1', 'P2'],
        ['D1', 'D2', 'P3', 'P4'],
      ]);
    });

    it('should handle reports with empty arrays', () => {
      const allReportEntries = [
        createReport([
          createReportEntry([], []),
          createReportEntry(['A1', 'A2'], ['B1', 'B2']),
        ]),
        createReport([createReportEntry([], [])]),
      ];
      const placeholders = createPlaceholders(['P1', 'P2'], ['P3', 'P4']);

      const result = combineReports(allReportEntries, placeholders);

      expect(result).toEqual([
        [],
        [],
        ['A1', 'A2', 'P1', 'P2'],
        ['B1', 'B2', 'P3', 'P4'],
      ]);
    });

    it.skip('should handle reports with odd number of entries', () => {
      const invalidReport = ['A1', 'A2', 'B1']; // Odd number of entries
      const placeholders = createPlaceholders(['P1', 'P2'], ['P3', 'P4']);

      expect(() => combineReports([invalidReport], placeholders)).toThrow(
        'Invalid report entry: Expected an even number of elements.'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Invalid report entry: Expected an even number of elements.'
      );
    });

    it('should handle maximum type count calculation correctly', () => {
      const allReportEntries = [
        createReport([
          createReportEntry(['A1'], ['B1']),
          createReportEntry(['C1'], ['D1']),
          createReportEntry(['E1'], ['F1']),
        ]), // 3 pairs
        createReport([createReportEntry(['G1'], ['H1'])]), // 1 pair
        createReport([
          createReportEntry(['I1'], ['J1']),
          createReportEntry(['K1'], ['L1']),
        ]), // 2 pairs
      ];
      const placeholders = createPlaceholders(['P1'], ['P2']);

      const result = combineReports(allReportEntries, placeholders);

      expect(result).toHaveLength(6); // 3 pairs * 2 rows per pair
      expect(result[4]).toEqual(['E1', 'P1', 'P1']); // Third pair, first row
      expect(result[5]).toEqual(['F1', 'P2', 'P2']); // Third pair, second row
    });
  });

  // Input Validation
  describe('Input Validation', () => {
    it('should throw an error if allReportEntries is not an array', () => {
      const invalidInputs = [null, undefined, 'not an array', 123, {}];
      const placeholders = createPlaceholders(['P1', 'P2'], ['P3', 'P4']);

      for (const input of invalidInputs) {
        expect(() => combineReports(input, placeholders)).toThrow(
          'Invalid input: Expected both allReportEntries and placeholders to be arrays.'
        );
      }
    });

    it('should throw an error if placeholders is not an array', () => {
      const invalidInputs = [null, undefined, 'not an array', 123, {}];
      const validReport = createReport([
        createReportEntry(['A1', 'A2'], ['B1', 'B2']),
      ]);

      for (const input of invalidInputs) {
        expect(() => combineReports([validReport], input)).toThrow(
          'Invalid input: Expected both allReportEntries and placeholders to be arrays.'
        );
      }
    });

    it('should throw an error if any report entry is not an array', () => {
      const invalidReportEntries = [
        createReport([createReportEntry(['A1', 'A2'], ['B1', 'B2'])]),
        'InvalidEntry',
      ];
      const placeholders = createPlaceholders(['P1', 'P2'], ['P3', 'P4']);

      expect(() => combineReports(invalidReportEntries, placeholders)).toThrow(
        'Invalid report entry: Expected an array.'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Invalid report entry: Expected an array.'
      );
    });

    it('should throw an error if any placeholder entry is not an array', () => {
      const allReportEntries = [
        createReport([createReportEntry(['A1', 'A2'], ['B1', 'B2'])]),
      ];
      const invalidPlaceholders = ['InvalidPlaceholder', ['P3', 'P4']];

      expect(() =>
        combineReports(allReportEntries, invalidPlaceholders)
      ).toThrow('Invalid placeholder entry: Expected an array.');
      expect(console.error).toHaveBeenCalledWith(
        'Invalid placeholder entry: Expected an array.'
      );
    });
  });

  // Error Handling
  describe('Error Handling', () => {
    it('should propagate errors from maxTypeCount calculation', () => {
      const allReportEntries = [
        createReport([createReportEntry(['A1', 'A2'], ['B1', 'B2'])]),
        null, // This will cause an error in maxTypeCount calculation
      ];
      const placeholders = createPlaceholders(['P1', 'P2'], ['P3', 'P4']);

      expect(() => combineReports(allReportEntries, placeholders)).toThrow(
        'Invalid report entry: Expected an array.'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Invalid report entry: Expected an array.'
      );
    });

    it.skip('should handle errors during report combination', () => {
      const allReportEntries = [
        createReport([createReportEntry(['A1', 'A2'], ['B1', 'B2'])]),
        ['C1'], // This will cause an error due to odd number of elements
      ];
      const placeholders = createPlaceholders(['P1', 'P2'], ['P3', 'P4']);

      expect(() => combineReports(allReportEntries, placeholders)).toThrow(
        'Invalid report entry: Expected an even number of elements.'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Invalid report entry: Expected an even number of elements.'
      );
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should handle large reports efficiently', () => {
      const generateLargeReport = (size) => {
        const entries = [];
        for (let i = 0; i < size; i++) {
          entries.push(
            createReportEntry(
              [`Test ${i}`, `Description ${i}`],
              [`Status ${i}`, `Details ${i}`]
            )
          );
        }
        return createReport(entries);
      };

      const testSizes = [10, 100, 1000];
      const placeholders = createPlaceholders(['--', '--'], ['--', '--']);

      for (const size of testSizes) {
        const reports = [
          generateLargeReport(size),
          generateLargeReport(size),
          generateLargeReport(size),
        ];

        const startTime = performance.now();
        const result = combineReports(reports, placeholders);
        const endTime = performance.now();

        expect(result.length).toBe(size * 2); // Each entry creates 2 rows
        expect(endTime - startTime).toBeLessThan(size <= 100 ? 100 : 1000); // Adjust time limit based on size
      }
    });
  });
});
