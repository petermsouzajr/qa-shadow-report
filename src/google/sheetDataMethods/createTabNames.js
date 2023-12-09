import {
  getFormattedMonth,
  getPreviousMonthsYear,
} from '../../sharedMethods/dateFormatting.js';

/**
 * Creates a title for a summary report based on the previous month and year.
 * @returns {string} The title for the summary report.
 */
export const createSummaryTitle = (
  getFormattedMonthFn,
  getPreviousMonthsYearFn
) => {
  try {
    const lastMonth = getFormattedMonth('lastMonth');
    const currentMonth = getFormattedMonth();
    const previousMonthsYear = getPreviousMonthsYear(currentMonth);

    if (!lastMonth || !previousMonthsYear) {
      throw new Error(
        'Could not generate summary title due to date formatting error.'
      );
    }

    return `Summary ${lastMonth} ${previousMonthsYear}`;
  } catch (error) {
    console.error('Error in createSummaryTitle:', error);
    throw error;
  }
};
