import { getExistingTabTitlesInRange } from '../google/sheetDataMethods/getSheetInfo.js';
import { getTodaysFormattedDate } from './dateFormatting.js';

/**
 * Asynchronously checks whether a report for today already exists.
 * It fetches all existing sheet titles and checks for a title that matches today's date.
 *
 * @async
 * @returns {Promise<boolean>} Resolves to true if today's report exists, otherwise false.
 */
export const doesTodaysReportExist = async () => {
  try {
    const existingTabTitles = await getExistingTabTitlesInRange();
    const todaysTitle = getTodaysFormattedDate();

    return existingTabTitles.includes(todaysTitle);
  } catch (error) {
    console.error("Error checking if today's report exists:", error);
    throw error;
  }
};
