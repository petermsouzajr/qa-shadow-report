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
 * Determines whether a summary is required based on the current day and
 * whether a new collection is needed.
 *
 * @param {Object} options - Configuration options for generating reports.
 * @param {boolean} options.csv - If true, outputs in CSV format.
 * @param dataObjectsRef
 * @returns {Promise<boolean>} True if a summary is required, false otherwise.
 */
export const isSummaryRequired = async (options = {}, dataObjectsRef) => {
  if (options.csv) return false;
  try {
    const lastMonth = getFormattedMonth('lastMonth');
    // console.log('[DEBUG] SUT lastMonth:', lastMonth);

    const currentMonth = getFormattedMonth();
    // console.log('[DEBUG] SUT currentMonth:', currentMonth);

    let yearForSummary = getFormattedYear();
    if (currentMonth === 'Jan' && lastMonth === 'Dec') {
      yearForSummary = getFormattedYear('lastYear');
    }
    // console.log('[DEBUG] SUT yearForSummary:', yearForSummary);

    const targetSummaryTitle = createSummaryTitle(
      lastMonth,
      yearForSummary.toString()
    );
    // console.log('[DEBUG] SUT targetSummaryTitle:', targetSummaryTitle);

    const existingTabTitles = await getExistingTabTitlesInRange(
      '',
      dataObjectsRef
    );
    // console.log('[DEBUG] SUT existingTabTitles raw:', existingTabTitles);

    if (!existingTabTitles) {
      // console.error('Error: existingTabTitles is undefined');
      return false;
    }

    const summaryExists = existingTabTitles.some(
      (title) =>
        title.trim().toLowerCase() === targetSummaryTitle.trim().toLowerCase()
    );
    // console.log('[DEBUG] SUT summaryExists:', summaryExists);

    if (summaryExists) {
      return false;
    }

    const searchPatternMonth = lastMonth;
    const searchPatternYear = yearForSummary.toString();
    // console.log('[DEBUG] SUT searchPatternMonth:', searchPatternMonth);
    // console.log('[DEBUG] SUT searchPatternYear:', searchPatternYear);

    const sheetsFromLastMonthExist = existingTabTitles.some((title) => {
      const titleIncludesMonth = title.includes(searchPatternMonth);
      const titleIncludesYear = title.includes(searchPatternYear);
      return titleIncludesMonth && titleIncludesYear;
    });
    // console.log(
    //   '[DEBUG] SUT sheetsFromLastMonthExist:',
    //   sheetsFromLastMonthExist
    // );

    return sheetsFromLastMonthExist;
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
 * @param dataObjectsRef
 * @returns {Promise<boolean>} True if a weekly summary is required, false otherwise.
 */
export const isWeeklySummaryRequired = async ({ csv }, dataObjectsRef) => {
  if (csv) {
    return false;
  }
  try {
    const existingTabTitles = await getExistingTabTitlesInRange(
      '',
      dataObjectsRef
    );

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
    const weekStartName = WEEK_START() || 'Monday';
    const startDate = new Date(now);
    startDate.setDate(
      now.getDate() - ((now.getDay() + 7 - getDayIndex(weekStartName)) % 7)
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
    // console.log('[SUT DEBUG] isWeeklySummaryNeeded - expectedSummaryTitle:', expectedSummaryTitle);
    // console.log('[SUT DEBUG] isWeeklySummaryNeeded - tabTitles:', JSON.stringify(tabTitles));

    const summaryExists = tabTitles.some((title) => {
      const starts = title.startsWith('Weekly');
      const matches = title === expectedSummaryTitle;
      // console.log(`[SUT DEBUG] Checking title: "${title}", startsWeekly: ${starts}, matchesExpected: ${matches}`);
      return starts && matches;
    });
    // console.log('[SUT DEBUG] isWeeklySummaryNeeded - summaryExists:', summaryExists);
    return !summaryExists;
  } catch (error) {
    console.error('Error in isWeeklySummaryNeeded:', error);
    return false;
  }
};
