import { handleSummary } from './sharedMethods/summaryHandler.js';
import { handleDailyReport } from './sharedMethods/dailyReportHandler.js';
import { isSummaryRequired } from './sharedMethods/summaryRequired.js';
import { getFormattedMonth } from './sharedMethods/dateFormatting.js';

let topLevelSpreadsheetData = {};
let summaryTabData = {};
let todaysReportData = {};
let lastMonthSheetValues = [];

export const dataObjects = {
  topLevelSpreadsheetData,
  summaryTabData,
  todaysReportData,
  lastMonthSheetValues,
};

/**
 * Manages the generation of reports based on specified options.
 * - Directly generates a daily report in CSV format if the `csv` option is true.
 * - If the `csv` option is false, it proceeds to check for the need to generate daily or summary reports based on additional conditions.
 * - Utilizes the `duplicate` option to determine whether to allow the creation of duplicate reports.
 * - Provides logging for informational messages when conditions prevent the creation of summaries or reports.
 *
 * @async
 * @function main
 * @param {Object} options - Configuration options for generating reports.
 * @param {boolean} options.csv - Determines if the output should be in CSV format.
 * @param {boolean} options.duplicate - Allows the creation of duplicate reports if true.
 * @returns {Promise<void>} A promise that resolves when the report generation process completes or throws an error if it fails.
 */
export const main = async ({ csv, duplicate }) => {
  try {
    if (csv) {
      handleDailyReport({ csv, duplicate });
      return;
    }
    const summaryRequired = await isSummaryRequired({ csv });
    const lastMonth = getFormattedMonth('lastMonth');
    const noSummaryMessage = `No ${lastMonth} summary required If you would like to create a duplicate,
    use the Monthly Summary command directly, with the optional flag "--duplicate", e.g. "cy-shadow-report monthly-summary --duplicate".`;

    if (summaryRequired) {
      await handleSummary({ csv, duplicate });
    } else {
      console.info(noSummaryMessage);
    }
    await handleSummary({ csv, duplicate });
    await handleDailyReport({ csv, duplicate });
  } catch (error) {
    console.error(
      'An error occurred during the report and summary handling: ',
      error
    );
  }
};
