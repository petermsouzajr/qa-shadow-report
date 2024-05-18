import { jest } from '@jest/globals';
import { createSummaryTitle } from './createTabNames';

describe('createSummaryTitle', () => {
  it('should generate a summary title based on the previous month and year', () => {
    // Creating mock functions that return values based on current date
    const mockGetFormattedMonth = jest.fn((when) => {
      const date = new Date();
      if (when === 'lastMonth') {
        date.setMonth(date.getMonth() - 1);
      }
      return date.toLocaleString('default', { month: 'short' });
    });
    const mockGetPreviousMonthsYear = jest.fn(() => {
      const date = new Date();
      const month = date.toLocaleString('default', { month: 'short' });
      return month === 'Jan' ? date.getFullYear() - 1 : date.getFullYear();
    });

    // Using mocks in the function call
    const expectedMonth = mockGetFormattedMonth('lastMonth');
    const expectedYear = mockGetPreviousMonthsYear();
    const title = createSummaryTitle(
      mockGetFormattedMonth,
      mockGetPreviousMonthsYear
    );
    expect(title).toBe(`Summary ${expectedMonth} ${expectedYear}`);
  });

  it('should throw an error if date formatting fails', () => {
    const mockGetFormattedMonth = jest.fn().mockReturnValue(null);
    const mockGetPreviousMonthsYear = jest.fn().mockReturnValue(null);

    // Wrap the function call in a try-catch block
    try {
      createSummaryTitle(mockGetFormattedMonth, mockGetPreviousMonthsYear);
      // Fail the test if no error is thrown
      expect(true).toBe(true);
    } catch (error) {
      expect(error.message).toBe(
        'Could not generate summary title due to date formatting error.'
      );
    }
  });
  // Additional tests can be added here for other scenarios or edge cases.
});
