import { jest } from '@jest/globals';

// Mock the module before importing
jest.unstable_mockModule('./reportGenerationHelpers.js', () => ({
  buildFormulas: jest.fn(
    (
      type,
      headerRowIndex,
      totalNumberOfRows,
      bodyRowCount,
      subjectColumn,
      stateColumn
    ) => ({
      type,
      headerRowIndex,
      totalNumberOfRows,
      bodyRowCount,
      subjectColumn,
      stateColumn,
      formulas: {
        passed: `COUNTIF(${subjectColumn}${headerRowIndex + 1}:${subjectColumn}${totalNumberOfRows}, "passed")`,
        failed: `COUNTIF(${subjectColumn}${headerRowIndex + 1}:${subjectColumn}${totalNumberOfRows}, "failed")`,
        total: `COUNTA(${subjectColumn}${headerRowIndex + 1}:${subjectColumn}${totalNumberOfRows})`,
      },
    })
  ),
}));

// Import modules after mocking
const { getFormulas } = await import('./getFormulas.js');
const helpers = await import('./reportGenerationHelpers.js');

describe('getFormulas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Data Setup
  const createTestParams = (
    type,
    headerRowIndex,
    totalRows,
    bodyRows,
    subjectCol,
    stateCol
  ) => ({
    type,
    headerRowIndex,
    totalNumberOfRows: totalRows,
    bodyRowCount: bodyRows,
    subjectColumn: subjectCol,
    stateColumn: stateCol,
  });

  // Basic Functionality Tests
  describe('Basic Functionality', () => {
    it('should return the formulas object correctly for valid inputs', () => {
      const params = createTestParams('unit', 1, 10, 8, 'A', 'B');
      const result = getFormulas(
        params.type,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.subjectColumn,
        params.stateColumn
      );

      expect(result).toBeDefined();
      expect(result.type).toBe(params.type);
      expect(result.headerRowIndex).toBe(params.headerRowIndex);
      expect(result.totalNumberOfRows).toBe(params.totalNumberOfRows);
      expect(result.bodyRowCount).toBe(params.bodyRowCount);
      expect(result.subjectColumn).toBe(params.subjectColumn);
      expect(result.stateColumn).toBe(params.stateColumn);
      expect(result.formulas).toBeDefined();
      expect(result.formulas.passed).toBeDefined();
      expect(result.formulas.failed).toBeDefined();
      expect(result.formulas.total).toBeDefined();
    });

    it('should handle different column combinations', () => {
      const params = createTestParams('integration', 1, 10, 8, 'C', 'D');
      const result = getFormulas(
        params.type,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.subjectColumn,
        params.stateColumn
      );

      expect(result).toBeDefined();
      expect(result.subjectColumn).toBe('C');
      expect(result.stateColumn).toBe('D');
      expect(result.formulas.passed).toContain('C2:C10');
    });

    it('should handle different row counts', () => {
      const params = createTestParams('e2e', 1, 20, 15, 'A', 'B');
      const result = getFormulas(
        params.type,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.subjectColumn,
        params.stateColumn
      );

      expect(result).toBeDefined();
      expect(result.totalNumberOfRows).toBe(20);
      expect(result.bodyRowCount).toBe(15);
      expect(result.formulas.passed).toContain('A2:A20');
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle minimum row counts', () => {
      const params = createTestParams('unit', 1, 2, 1, 'A', 'B');
      const result = getFormulas(
        params.type,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.subjectColumn,
        params.stateColumn
      );

      expect(result).toBeDefined();
      expect(result.totalNumberOfRows).toBe(2);
      expect(result.bodyRowCount).toBe(1);
      expect(result.formulas.passed).toContain('A2:A2');
    });

    it('should handle maximum row counts', () => {
      const params = createTestParams('integration', 1, 1000, 998, 'A', 'B');
      const result = getFormulas(
        params.type,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.subjectColumn,
        params.stateColumn
      );

      expect(result).toBeDefined();
      expect(result.totalNumberOfRows).toBe(1000);
      expect(result.bodyRowCount).toBe(998);
      expect(result.formulas.passed).toContain('A2:A1000');
    });

    it('should handle different header row positions', () => {
      const params = createTestParams('e2e', 5, 10, 5, 'A', 'B');
      const result = getFormulas(
        params.type,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.subjectColumn,
        params.stateColumn
      );

      expect(result).toBeDefined();
      expect(result.headerRowIndex).toBe(5);
      expect(result.formulas.passed).toContain('A6:A10');
    });
  });

  // Input Validation
  describe('Input Validation', () => {
    it('should throw an error if type is not a string', () => {
      const params = createTestParams(123, 1, 10, 8, 'A', 'B');
      expect(() =>
        getFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow(
        'Invalid input: Ensure all parameters are of the correct type.'
      );
    });

    it('should throw an error if headerRowIndex is not a number', () => {
      const params = createTestParams('unit', '1', 10, 8, 'A', 'B');
      expect(() =>
        getFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow(
        'Invalid input: Ensure all parameters are of the correct type.'
      );
    });

    it('should throw an error if totalNumberOfRows is not a number', () => {
      const params = createTestParams('unit', 1, '10', 8, 'A', 'B');
      expect(() =>
        getFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow(
        'Invalid input: Ensure all parameters are of the correct type.'
      );
    });

    it('should throw an error if bodyRowCount is not a number', () => {
      const params = createTestParams('unit', 1, 10, '8', 'A', 'B');
      expect(() =>
        getFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow(
        'Invalid input: Ensure all parameters are of the correct type.'
      );
    });

    it('should throw an error if subjectColumn is not a string', () => {
      const params = createTestParams('unit', 1, 10, 8, 123, 'B');
      expect(() =>
        getFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow(
        'Invalid input: Ensure all parameters are of the correct type.'
      );
    });

    it('should throw an error if stateColumn is not a string', () => {
      const params = createTestParams('unit', 1, 10, 8, 'A', 123);
      expect(() =>
        getFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow(
        'Invalid input: Ensure all parameters are of the correct type.'
      );
    });
  });

  // Error Handling
  describe('Error Handling', () => {
    it('should handle errors during formula generation', () => {
      // Mock buildFormulas to throw an error
      helpers.buildFormulas.mockImplementationOnce(() => {
        throw new Error('Formula generation error');
      });

      const params = createTestParams('unit', 1, 10, 8, 'A', 'B');
      expect(() =>
        getFormulas(
          params.type,
          params.headerRowIndex,
          params.totalNumberOfRows,
          params.bodyRowCount,
          params.subjectColumn,
          params.stateColumn
        )
      ).toThrow('Failed to generate formulas');
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should generate formulas efficiently for large datasets', () => {
      const params = createTestParams('unit', 1, 1000, 998, 'A', 'B');
      const startTime = performance.now();

      const result = getFormulas(
        params.type,
        params.headerRowIndex,
        params.totalNumberOfRows,
        params.bodyRowCount,
        params.subjectColumn,
        params.stateColumn
      );

      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
