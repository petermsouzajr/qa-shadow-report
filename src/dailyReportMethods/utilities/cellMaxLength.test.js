import { enforceMaxLength } from './cellMaxLength';

describe('enforceMaxLength', () => {
  // Test Data Setup
  const createTestParams = (str, maxLength) => ({
    str,
    maxLength,
  });

  // Basic Functionality Tests
  describe('Basic Functionality', () => {
    it('should truncate a string to the specified maxLength', () => {
      const params = createTestParams('hello world', 5);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('hello');
    });

    it('should not truncate if string is shorter than maxLength', () => {
      const params = createTestParams('hello', 10);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('hello');
    });

    it('should handle empty strings', () => {
      const params = createTestParams('', 5);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('');
    });

    it('should handle whitespace strings', () => {
      const params = createTestParams('   ', 5);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('   ');
    });
  });

  // Null/Undefined Handling Tests
  describe('Null/Undefined Handling', () => {
    it('should return an empty string if input is null', () => {
      const params = createTestParams(null, 5);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('');
    });

    it('should return an empty string if input is undefined', () => {
      const params = createTestParams(undefined, 5);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('');
    });
  });

  // Number Handling Tests
  describe('Number Handling', () => {
    it('should convert a number to a string and truncate it', () => {
      const params = createTestParams(123456, 3);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('123');
    });

    it('should handle zero', () => {
      const params = createTestParams(0, 5);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('0');
    });

    it('should handle negative numbers', () => {
      const params = createTestParams(-123456, 4);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('-123');
    });

    it('should handle decimal numbers', () => {
      const params = createTestParams(123.456, 5);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('123.4');
    });
  });

  // Input Validation Tests
  describe('Input Validation', () => {
    it('should throw an error if maxLength is negative', () => {
      expect(() => enforceMaxLength('test', -1)).toThrow(
        'maxLength must be a positive integer'
      );
    });

    it('should throw an error if maxLength is not an integer', () => {
      expect(() => enforceMaxLength('test', 1.5)).toThrow(
        'maxLength must be a positive integer'
      );
    });

    it('should handle non-string and non-number inputs', () => {
      const invalidInputs = [
        { value: true, expected: '' },
        { value: {}, expected: '' },
        { value: [], expected: '' },
        { value: () => {}, expected: '' },
        { value: Symbol('test'), expected: '' },
        { value: Object.create(null), expected: '' },
      ];

      invalidInputs.forEach(({ value, expected }) => {
        expect(enforceMaxLength(value, 5)).toBe(expected);
      });
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle very long strings', () => {
      const longString = 'A'.repeat(1000);
      const params = createTestParams(longString, 5);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('AAAAA');
    });

    it('should handle strings with special characters', () => {
      const specialChars = '!@#$%^&*()_+';
      const params = createTestParams(specialChars, 5);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('!@#$%');
    });

    it('should handle strings with Unicode characters', () => {
      const input = 'Hello 🌍 World';
      const maxLength = 7;
      const result = enforceMaxLength(input, maxLength);
      expect(result).toBe('Hello 🌍'.substring(0, maxLength));
    });

    it('should handle strings with emojis', () => {
      const input = '😀😃😄😁😆';
      const maxLength = 3;
      const result = enforceMaxLength(input, maxLength);
      expect(result).toBe(input.substring(0, maxLength));
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should handle errors gracefully and return an empty string', () => {
      const params = createTestParams(
        Object.create(null), // Object with no prototype, toString() will fail
        2
      );
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('');
    });

    it('should handle invalid string operations', () => {
      const params = createTestParams(Symbol('test'), 2);
      expect(enforceMaxLength(params.str, params.maxLength)).toBe('');
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should handle large strings efficiently', () => {
      const iterations = 1000;
      const longString = 'A'.repeat(10000);
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        enforceMaxLength(longString, 100);
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / iterations;
      expect(averageTime).toBeLessThan(1); // Should take less than 1ms per operation
    });
  });
});
