import { createSummaryTitle } from '../google/sheetDataMethods/createTabNames.js';
import { getExistingTabTitlesInRange } from '../google/sheetDataMethods/getSheetInfo.js';
import {
  getCurrentDay,
  getFormattedMonth,
  getFormattedYear,
} from './dateFormatting.js';

/**
 * Determines whether a summary sheet title for the provided sheet tab titles
 * already exists within the provided tab titles.
 *
 * @param {string[]} tabTitles - Array of existing tab titles.
 * @returns {boolean} - True if a matching summary title is found, false otherwise.
 */
const isSummaryTabExists = (tabTitles) => {
  const summaryTitle = createSummaryTitle();
  return tabTitles.some((title) => title === summaryTitle);
};

/**
 * Checks if a new collection is needed based on the current and last month,
 * and based on the current and last year, considering January as a special case.
 *
 * @param {string[]} tabTitles - Array of existing tab titles.
 * @returns {boolean} - True if a new collection is needed, false otherwise.
 */
const isSummaryNeeded = (tabTitles) => {
  const currentYear = getFormattedYear();
  const lastYear = getFormattedYear('lastYear');
  const currentMonth = getFormattedMonth();
  let yearToCheck = currentYear;

  // If it's January, check for last year's summary.
  if (currentMonth === 'Jan') {
    yearToCheck = lastYear;
  }

  // Check for the absence of a summary sheet for the last month.
  return !isSummaryTabExists(tabTitles);
};

/**
 * Determines whether a summary is required based on the current day and
 * whether a new collection is needed.
 *
 * @returns {boolean} - True if a summary is required, false otherwise.
 */
export const isSummaryRequired = async () => {
  const existingTabTitles = await getExistingTabTitlesInRange();

  return await isSummaryNeeded(existingTabTitles);
};
