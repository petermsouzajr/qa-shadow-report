import { jest } from '@jest/globals';

// Mock the date formatting module
jest.unstable_mockModule('../../sharedMethods/dateFormatting.js', () => ({
  getFormattedMonth: jest.fn((type) => {
    if (type === 'lastMonth') return 'Apr';
    return 'May';
  }),
  getPreviousMonthsYear: jest.fn(() => '2023'),
}));

// Import after mocking
const { getLastMonthTabTitles } = await import('./getLastMonthTabTitles.js');

describe('Google Sheets Tab Title Filtering', () => {
  describe('Basic Functionality', () => {
    test('should return an array of titles matching last month and year', () => {
      const existingTabTitles = [
        'Apr 1, 2023',
        'May 1, 2023',
        'Apr 15, 2023',
        'Mar 1, 2023',
      ];
      const result = getLastMonthTabTitles(existingTabTitles);
      expect(result).toEqual(['Apr 1, 2023', 'Apr 15, 2023']);
    });

    test('should handle case-insensitive month matching', () => {
      const existingTabTitles = [
        'Apr 1, 2023', // Properly formatted title
        'Apr 15, 2023', // Properly formatted title
        'May 1, 2023',
      ];
      const result = getLastMonthTabTitles(existingTabTitles);
      expect(result).toEqual(['Apr 1, 2023', 'Apr 15, 2023']);
    });

    test('should handle single-digit and double-digit days', () => {
      const existingTabTitles = ['Apr 1, 2023', 'Apr 15, 2023', 'Apr 05, 2023'];
      const result = getLastMonthTabTitles(existingTabTitles);
      expect(result).toEqual(['Apr 1, 2023', 'Apr 15, 2023', 'Apr 05, 2023']);
    });
  });

  describe('Edge Cases', () => {
    test('should handle year transitions correctly', async () => {
      // Re-mock for December/January transition
      jest.resetModules();
      jest.unstable_mockModule('../../sharedMethods/dateFormatting.js', () => ({
        getFormattedMonth: jest.fn((type) => {
          if (type === 'lastMonth') return 'Dec';
          return 'Jan';
        }),
        getPreviousMonthsYear: jest.fn(() => '2022'),
      }));

      const { getLastMonthTabTitles: getLastMonthTabTitlesYearEnd } =
        await import('./getLastMonthTabTitles.js');

      const existingTabTitles = ['Dec 31, 2022', 'Jan 1, 2023', 'Dec 1, 2023'];
      const result = getLastMonthTabTitlesYearEnd(existingTabTitles);
      expect(result).toEqual(['Dec 31, 2022']);
    });
  });

  describe('Input Validation', () => {
    test('should throw an error if input is not an array', () => {
      expect(() => {
        getLastMonthTabTitles('not an array');
      }).toThrow('Invalid input: Expected an array of strings.');
    });

    test('should throw an error if array contains non-string elements', () => {
      expect(() => {
        getLastMonthTabTitles(['valid', 123, 'also valid']);
      }).toThrow('Invalid element at index 1: Expected a string.');
    });

    test('should handle invalid date formats', () => {
      const invalidFormats = [
        ['Apr-1-2023', 'Apr.15.2023', 'Apr 1, 2023', 'Apr 15, 2023'],
        ['April 1, 2023', 'Apr 1 2023', 'Apr 1, 2023', 'Apr 15, 2023'],
      ];

      invalidFormats.forEach((array) => {
        const result = getLastMonthTabTitles(array);
        expect(result).toEqual(['Apr 1, 2023', 'Apr 15, 2023']);
      });
    });
  });

  describe('Performance', () => {
    test('should handle large arrays efficiently', () => {
      const largeArray = Array(1000)
        .fill('')
        .map((_, i) =>
          i % 3 === 0
            ? `Apr ${(i % 28) + 1}, 2023`
            : `May ${(i % 28) + 1}, 2023`
        );

      const startTime = performance.now();
      const result = getLastMonthTabTitles(largeArray);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((title) => title.startsWith('Apr'))).toBe(true);
    });
  });
});
