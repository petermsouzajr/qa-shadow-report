import {
  getFormattedMonth,
  getPreviousMonthsYear,
} from '../../sharedMethods/dateFormatting.js';

/**
 * Retrieves sheet titles that match the last month and its corresponding year from existing sheet titles.
 *
 * @param {string[]} existingTabTitles - Array of existing sheet titles.
 * @returns {string[]} - Array of sheet titles that match the criteria.
 */
export const getLastMonthTabTitles = (existingTabTitles) => {
  const lastMonth = getFormattedMonth('lastMonth');
  const currentMonth = getFormattedMonth();
  const lastMonthsYear = getPreviousMonthsYear(currentMonth);

  return existingTabTitles.filter(
    (existingTabTitle) =>
      existingTabTitle.toLowerCase().includes(lastMonth.toLowerCase()) &&
      existingTabTitle.includes(lastMonthsYear) &&
      /^([A-Z][a-z]{2} \d{1,2}, \d{4})$/.test(existingTabTitle)
  );
};
