import { createSummaryTitle } from '../google/sheetDataMethods/createTabNames.js';
import { getExistingTabTitlesInRange } from '../google/sheetDataMethods/getSheetInfo.js';
import {
  getDayIndex,
  getFormattedMonth,
  getFormattedYear,
} from './dateFormatting.js';
import { createWeeklySummaryTitle } from '../sharedMethods/summaryHandler.js';
import { DAYS, WEEK_START } from '../../constants.js';

/**
 * Determines whether a summary sheet title for the provided sheet tab titles
 * already exists within the provided tab titles.
 *
 * @param {string[]} tabTitles - Array of existing tab titles.
 * @returns {boolean} - True if a matching summary title is found, false otherwise.
 */
const isSummaryTabExists = (tabTitles) => {
  try {
    const summaryTitle = createSummaryTitle();
    return tabTitles.some((title) => title === summaryTitle);
  } catch (error) {
    console.error('Error in isSummaryTabExists:', error);
    return false;
  }
};

/**
 * Checks if there are any sheet tabs from the previous month.
 *
 * @param {string[]} tabTitles - Array of existing tab titles.
 * @returns {boolean} - True if there are tabs from the previous month, false otherwise.
 */
const hasSheetsFromLastMonth = (tabTitles) => {
  try {
    const currentMonth = getFormattedMonth();
    const lastMonth = getFormattedMonth('lastMonth');
    const currentYear = getFormattedYear();
    const lastYear = getFormattedYear('lastYear');
    let yearToCheck = currentYear;
    if (currentMonth === 'Jan') {
      yearToCheck = lastYear;
    }
    const monthYearPattern = new RegExp(
      `${lastMonth}\\s*(\\d*,)?\\s*${yearToCheck}`,
      'i'
    );

    return tabTitles.some((title) => monthYearPattern.test(title));
  } catch (error) {
    console.error('Error in hasSheetsFromLastMonth:', error);
    return false;
  }
};

/**
 * Checks if a new collection is needed based on the current and last month,
 * and based on the current and last year, considering January as a special case.
 *
 * @param {string[]} tabTitles - Array of existing tab titles.
 * @returns {boolean} - True if a new collection is needed, false otherwise.
 */
const isSummaryNeeded = (tabTitles) => {
  try {
    return hasSheetsFromLastMonth(tabTitles) && !isSummaryTabExists(tabTitles);
  } catch (error) {
    console.error('Error in isSummaryNeeded:', error);
    return false;
  }
};

/**
 * Determines whether a summary is required based on the current day and
 * whether a new collection is needed.
 *
 * @param {Object} options - Configuration options for generating reports.
 * @param {boolean} options.csv - If true, outputs in CSV format.
 * @returns {Promise<boolean>} True if a summary is required, false otherwise.
 */
export const isSummaryRequired = async ({ csv }) => {
  if (csv) {
    return false;
  }
  try {
    const existingTabTitles = await getExistingTabTitlesInRange();
    return isSummaryNeeded(existingTabTitles);
  } catch (error) {
    console.error('Error in isSummaryRequired:', error);
    return false;
  }
};

/**
 * Determines whether a weekly summary is required based on the current week and
 * whether a new collection is needed.
 *
 * @param {Object} options - Configuration options for generating reports.
 * @param {boolean} options.csv - If true, outputs in CSV format.
 * @returns {Promise<boolean>} True if a weekly summary is required, false otherwise.
 */
export const isWeeklySummaryRequired = async ({ csv }) => {
  if (csv) {
    return false;
  }
  try {
    const now = new Date();

    // Calculate the start of the current week
    const startDate = new Date(now);
    startDate.setDate(
      now.getDate() - ((now.getDay() + 7 - getDayIndex(WEEK_START())) % 7)
    );
    startDate.setHours(0, 0, 0, 0);

    // Calculate the end of the current week
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const existingTabTitles = await getExistingTabTitlesInRange();
    // Filter titles to check only those within the current week
    const weeklyTabTitles = existingTabTitles.filter((title) => {
      const tabDate = new Date(title);
      return tabDate >= startDate && tabDate <= endDate;
    });

    return isWeeklySummaryNeeded(weeklyTabTitles);
  } catch (error) {
    console.error('Error in isWeeklySummaryRequired:', error);
    return false;
  }
};

/**
 * Checks if a new weekly summary is needed based on two conditions:
 * 1. If there are any sheets within the last week range
 * 2. If a weekly summary tab already exists for the current week
 *
 * @param {string[]} tabTitles - Array of existing tab titles.
 * @returns {boolean} - True if a new weekly summary is needed, false otherwise.
 */
const isWeeklySummaryNeeded = (tabTitles) => {
  try {
    // If there are no sheets in the given range, no summary is needed
    if (tabTitles.length === 0) {
      return false;
    }

    // Define the expected weekly summary tab format (e.g., "Summary-YYYY-MM-DD")
    const now = new Date();
    const startDate = new Date(now);
    // Adjust to the start of the week (assuming WEEK_START is defined elsewhere)
    startDate.setDate(
      now.getDate() - ((now.getDay() + 7 - getDayIndex(WEEK_START())) % 7)
    );
    startDate.setHours(0, 0, 0, 0);

    // Format the expected summary tab title
    const expectedSummaryTitle = createWeeklySummaryTitle();

    // Check if a summary tab already exists for this week
    const summaryExists = tabTitles.some(
      (title) => title.startsWith('Weekly') && title === expectedSummaryTitle
    );

    // A summary is needed if:
    // 1. There are sheets in the range (already checked above with length > 0)
    // 2. No summary exists for this week
    return !summaryExists;
  } catch (error) {
    console.error('Error in isSummaryNeeded:', error);
    return false;
  }
};
