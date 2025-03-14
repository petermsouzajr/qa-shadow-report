import { jest } from '@jest/globals';

const mockGetFormattedMonth = jest.fn();
const mockGetPreviousMonthsYear = jest.fn();

jest.unstable_mockModule('../../sharedMethods/dateFormatting.js', () => ({
  getFormattedMonth: mockGetFormattedMonth,
  getPreviousMonthsYear: mockGetPreviousMonthsYear,
}));

const { createSummaryTitle } = await import('./createTabNames.js');

describe('Google Sheets Tab Name Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should generate a summary title based on the previous month and year', () => {
      const expectedMonth = 'Feb';
      const expectedYear = '2023';

      mockGetFormattedMonth
        .mockReturnValueOnce(expectedMonth)
        .mockReturnValueOnce('Mar');
      mockGetPreviousMonthsYear.mockReturnValue(expectedYear);

      const title = createSummaryTitle();

      expect(title).toBe(`Monthly summary ${expectedMonth} ${expectedYear}`);
      expect(mockGetFormattedMonth).toHaveBeenCalledWith('lastMonth');
      expect(mockGetPreviousMonthsYear).toHaveBeenCalledWith('Mar');
    });

    it('should handle different months correctly', () => {
      const lastMonth = 'Dec';
      const year = '2022';

      mockGetFormattedMonth
        .mockReturnValueOnce(lastMonth)
        .mockReturnValueOnce('Jan');
      mockGetPreviousMonthsYear.mockReturnValue(year);

      const title = createSummaryTitle();

      expect(title).toBe(`Monthly summary ${lastMonth} ${year}`);
    });
  });

  describe('Error Handling', () => {
    it('should throw an error if date formatting fails', () => {
      mockGetFormattedMonth.mockReturnValueOnce(null);
      mockGetPreviousMonthsYear.mockReturnValue('2023');

      expect(() => createSummaryTitle()).toThrow(
        'Could not generate summary title due to date formatting error.'
      );
    });

    it('should throw an error if getFormattedMonth returns undefined', () => {
      mockGetFormattedMonth.mockReturnValueOnce(undefined);
      mockGetPreviousMonthsYear.mockReturnValue('2023');

      expect(() => createSummaryTitle()).toThrow(
        'Could not generate summary title due to date formatting error.'
      );
    });

    it('should throw an error if getPreviousMonthsYear returns undefined', () => {
      mockGetFormattedMonth
        .mockReturnValueOnce('Jan')
        .mockReturnValueOnce('Feb');
      mockGetPreviousMonthsYear.mockReturnValue(undefined);

      expect(() => createSummaryTitle()).toThrow(
        'Could not generate summary title due to date formatting error.'
      );
    });

    it('should handle date formatting exceptions', () => {
      const mockError = new Error(
        'Could not generate summary title due to date formatting error.'
      );
      mockGetFormattedMonth.mockImplementation(() => {
        throw mockError;
      });

      expect(() => createSummaryTitle()).toThrow(mockError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string returns', () => {
      mockGetFormattedMonth.mockReturnValueOnce('');
      mockGetPreviousMonthsYear.mockReturnValue('2023');

      const error = new Error(
        'Could not generate summary title due to date formatting error.'
      );
      expect(() => createSummaryTitle()).toThrow(error);
    });

    it('should handle invalid year values', () => {
      mockGetFormattedMonth
        .mockReturnValueOnce('Jan')
        .mockReturnValueOnce('Feb');
      mockGetPreviousMonthsYear.mockReturnValue('invalid');

      const title = createSummaryTitle();
      expect(title).toBe('Monthly summary Jan invalid');
    });

    it('should handle special characters in month names', () => {
      const specialMonth = 'Jan@#$%^&*()';
      mockGetFormattedMonth
        .mockReturnValueOnce(specialMonth)
        .mockReturnValueOnce('Feb');
      mockGetPreviousMonthsYear.mockReturnValue('2023');

      const title = createSummaryTitle();
      expect(title).toBe(`Monthly summary ${specialMonth} 2023`);
    });
  });

  describe('Performance', () => {
    it('should generate titles efficiently', () => {
      const iterations = 1000;
      mockGetFormattedMonth.mockReturnValue('Jan');
      mockGetPreviousMonthsYear.mockReturnValue('2023');

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        createSummaryTitle();
      }
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(1000); // Should complete 1000 iterations in less than 1 second
    });
  });
});
