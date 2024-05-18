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
    // Fetch existing sheet titles
    const existingTabTitles = await getExistingTabTitlesInRange();

    // Define today's title using an auxiliary function
    const todaysTitle = getTodaysFormattedDate();

    // Check if a sheet for today already exists
    return existingTabTitles.includes(todaysTitle);
  } catch (error) {
    console.error("Error checking if today's report exists:", error);
    // Depending on how you want to handle errors, you might want to rethrow the error or resolve to a default value
    throw error; // or return false; if you want to assume no report exists if an error occurs
  }
};
