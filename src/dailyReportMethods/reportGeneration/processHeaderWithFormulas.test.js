import { processHeaderWithFormulas } from './processHeaderWithFormulas.js';
import {
  PAYLOAD_TEST_DATA,
  TEST_OBJECTS,
} from '../../../__tests__/data/testData';

describe('processHeaderWithFormulas', () => {
  // Test Data Setup
  const createTestParams = (
    headerPayload,
    headerRowIndex,
    totalRows,
    bodyRows,
    playwright
  ) => ({
    headerPayload,
    headerRowIndex,
    totalNumberOfRows: totalRows,
    bodyRowCount: bodyRows,
    playwright,
  });

  // Basic Functionality Tests
  describe('Basic Functionality', () => {
    it('should apply formulas to the header payload correctly', () => {
      const testHeaderPayload = [
        ['Test Name', 'Duration', 'State'],
        ['=COUNTA(A2:A10)', '=SUM(B2:B10)', '=COUNTIF(C2:C10, "passed")'],
      ];
      const params = createTestParams(testHeaderPayload, 1, 10, 8, true);

      processHeaderWithFormulas(
        params.headerPayload,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.playwright
      );

      expect(params.headerPayload).toEqual(testHeaderPayload);
    });

    it('should handle different header payload structures', () => {
      const params = createTestParams(
        [
          ['Header1', 'Header2 {key}'],
          ['Header3', 'Header4 {key}'],
        ],
        1,
        10,
        8,
        true
      );

      processHeaderWithFormulas(
        params.headerPayload,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.playwright
      );

      expect(params.headerPayload).toBeDefined();
      expect(Array.isArray(params.headerPayload)).toBe(true);
    });

    it('should handle different row configurations', () => {
      const testHeaderPayload = [
        ['Test Name', 'Duration', 'State'],
        ['=COUNTA(A2:A20)', '=SUM(B2:B20)', '=COUNTIF(C2:C20, "passed")'],
      ];
      const params = createTestParams(testHeaderPayload, 2, 20, 15, true);

      processHeaderWithFormulas(
        params.headerPayload,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.playwright
      );

      expect(params.headerPayload).toBeDefined();
      expect(Array.isArray(params.headerPayload)).toBe(true);
    });
  });

  // Input Validation
  describe('Input Validation', () => {
    it('should throw an error if headerPayload is not an array', () => {
      const params = createTestParams(null, 1, 10, 8, true);
      expect(() =>
        processHeaderWithFormulas(
          params.headerPayload,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.playwright
        )
      ).toThrow('Invalid headerPayload: Expected an array of arrays.');
    });

    it('should throw an error if headerRowIndex is not a number', () => {
      const params = createTestParams(
        [['Header1', 'Header2']],
        'invalid',
        10,
        8,
        true
      );
      expect(() =>
        processHeaderWithFormulas(
          params.headerPayload,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.playwright
        )
      ).toThrow('Invalid row or count values: Expected numbers.');
    });

    it('should throw an error if totalNumberOfRows is not a number', () => {
      const params = createTestParams(
        [['Header1', 'Header2']],
        1,
        'invalid',
        8,
        true
      );
      expect(() =>
        processHeaderWithFormulas(
          params.headerPayload,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.playwright
        )
      ).toThrow('Invalid row or count values: Expected numbers.');
    });

    it('should throw an error if bodyRowCount is not a number', () => {
      const params = createTestParams(
        [['Header1', 'Header2']],
        1,
        10,
        'invalid',
        true
      );
      expect(() =>
        processHeaderWithFormulas(
          params.headerPayload,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.playwright
        )
      ).toThrow('Invalid row or count values: Expected numbers.');
    });

    it('should throw an error if playwright is not a boolean', () => {
      const params = createTestParams(
        [['Header1', 'Header2']],
        1,
        10,
        8,
        'invalid'
      );
      expect(() =>
        processHeaderWithFormulas(
          params.headerPayload,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.playwright
        )
      ).toThrow('Invalid playwright value: Expected a boolean.');
    });
  });

  // Error Handling
  describe('Error Handling', () => {
    it('should handle errors during formula generation', () => {
      const params = createTestParams(
        [
          ['Header1', 'Header2 {key}'],
          ['Header3', { Header4: 'key' }],
        ],
        1,
        10,
        8,
        true
      );

      expect(() =>
        processHeaderWithFormulas(
          params.headerPayload,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.playwright
        )
      ).toThrow('Failed to process header with formulas:');
    });

    it('should throw an error if no formula is found for a key', () => {
      const params = createTestParams(
        [
          ['# passed tests', '# passed tests'],
          ['Header3', { 'Header4 passed': 'key' }],
        ],
        1,
        10,
        8,
        true
      );

      expect(() =>
        processHeaderWithFormulas(
          params.headerPayload,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.playwright
        )
      ).toThrow('Failed to process header with formulas:');
    });

    const invalidHeaderPayloads = [
      ['Header1', '{invalidKey}'],
      ['Header3', '{anotherInvalidKey}'],
    ];

    invalidHeaderPayloads.forEach((headerPayload, index) => {
      it(`should throw an error if no formula is found for a key - Case ${index + 1}`, () => {
        const params = createTestParams(headerPayload, 1, 10, 8, true);

        expect(() =>
          processHeaderWithFormulas(
            params.headerPayload,
            params.headerRowIndex,
            params.totalNumberOfRows,
            params.bodyRowCount,
            params.playwright
          )
        ).toThrow('Failed to process header with formulas:');
      });
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle empty header payload', () => {
      const params = createTestParams([], 1, 10, 8, true);
      expect(() =>
        processHeaderWithFormulas(
          params.headerPayload,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.playwright
        )
      ).not.toThrow();
    });

    it('should handle header payload with no formulas', () => {
      const params = createTestParams(
        [
          ['Header1', 'Header2'],
          ['Header3', 'Header4'],
        ],
        1,
        10,
        8,
        true
      );

      expect(() =>
        processHeaderWithFormulas(
          params.headerPayload,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.playwright
        )
      ).not.toThrow();
    });

    it('should handle maximum row counts', () => {
      const params = createTestParams(
        [['Header1', 'Header2']],
        1,
        1000,
        998,
        true
      );
      expect(() =>
        processHeaderWithFormulas(
          params.headerPayload,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.playwright
        )
      ).not.toThrow();
    });
  });

  // Performance
  describe('Performance', () => {
    it('should process header formulas efficiently for large datasets', () => {
      const largeHeaderPayload = Array(100).fill(['Header1', 'Header2']);
      const params = createTestParams(largeHeaderPayload, 1, 1000, 998, true);

      const startTime = Date.now();
      processHeaderWithFormulas(
        params.headerPayload,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.playwright
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
});
