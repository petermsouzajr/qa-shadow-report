import { getFormattedMonth } from './sharedMethods/dateFormatting.js';
import { handleSummary } from './sharedMethods/summaryHandler.js';
import { handleDailyReport } from './sharedMethods/dailyReportHandler.js';
import { doesTodaysReportExist } from './sharedMethods/dailyReportRequired.js';
import { isSummaryRequired } from './sharedMethods/summaryRequired.js';

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
 * @constant {string} lastMonth - Formatted string representing the current month.
 * @constant {string} noSummaryMessage - Message indicating no summary is required.
 * @constant {string} noReportMessage - Message indicating today's report already exists.
 */
const lastMonth = getFormattedMonth('lastMonth');
const noSummaryMessage = `No ${lastMonth} summary required`;
const noReportMessage = 'Today\'s report already exists';
/**
 * Handles report and summary tasks based on pre-existing conditions.
 *
 * Procedure:
 * 1. Verify if a summary is required, and handle accordingly, logging info if not.
 * 2. Verify if today's report is required, and handle accordingly, logging info if it exists.
 *
 * @async
 * @function
 */
export const main = async () => {
  try {
    if (await isSummaryRequired()) {
      await handleSummary();
    } else {
      console.info(noSummaryMessage);
    }

    if (await doesTodaysReportExist()) {
      console.info(noReportMessage);
    } else {
      await handleDailyReport();
    }
  } catch (error) {
    console.error(
      'An error occurred during the report and summary handling: ',
      error
    );
  }
};
