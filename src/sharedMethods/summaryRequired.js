import { createSummaryTitle } from '../google/sheetDataMethods/createTabNames.js';
import { getExistingTabTitlesInRange } from '../google/sheetDataMethods/getSheetInfo.js';
import {
  getDayIndex,
  getFormattedMonth,
  getFormattedYear,
} from './dateFormatting.js';
import { createWeeklySummaryTitle } from '../sharedMethods/summaryHandler.js';
import { WEEK_START } from '../../constants.js';

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
    const existingTabTitles = await getExistingTabTitlesInRange();

    return isWeeklySummaryNeeded(existingTabTitles);
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
    if (tabTitles.length === 0) {
      return false;
    }

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(
      now.getDate() - ((now.getDay() + 7 - getDayIndex(WEEK_START())) % 7)
    );
    startDate.setHours(0, 0, 0, 0);

    const daysSinceStart = Math.floor(
      (now - startDate) / (1000 * 60 * 60 * 24)
    );
    const isEndOfWeek = daysSinceStart === 6; // 6 days after start (0-based: Mon=0, Sun=6)

    if (!isEndOfWeek) {
      return false;
    }
    const expectedSummaryTitle = createWeeklySummaryTitle();
    const summaryExists = tabTitles.some(
      (title) => title.startsWith('Weekly') && title === expectedSummaryTitle
    );
    return !summaryExists;
  } catch (error) {
    console.error('Error in isSummaryNeeded:', error);
    return false;
  }
};
