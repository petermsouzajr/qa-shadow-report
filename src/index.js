import {
  handleSummary,
  handleWeeklySummary,
} from './sharedMethods/summaryHandler.js';
import { handleDailyReport } from './sharedMethods/dailyReportHandler.js';
import { doesTodaysReportExist } from './sharedMethods/dailyReportRequired.js';
import {
  isSummaryRequired,
  isWeeklySummaryRequired,
} from './sharedMethods/summaryRequired.js';
import chalk from 'chalk';
import { getFormattedMonth } from './sharedMethods/dateFormatting.js';
import { WEEKLY_SUMMARY_ENABLED } from '../constants.js';

let topLevelSpreadsheetData = {};
let summaryTabData = {};
let todaysReportData = {};
let lastMonthSheetValues = [];
let lastWeekSheetValues = [];
let weeklySummaryTabData = {};

export const dataObjects = {
  topLevelSpreadsheetData,
  summaryTabData,
  weeklySummaryTabData,
  todaysReportData,
  lastMonthSheetValues,
  lastWeekSheetValues,
};

/**
 * @constant {string} lastMonth - Formatted string representing the current month.
 * @constant {string} duplicateInstruction - Formatted string informing the usage of the 'duplicate' flag.
 * @constant {string} noSummaryMessage - Message indicating no summary is required.
 * @constant {string} noReportMessage - Message indicating today's report already exists.
 */
const lastMonth = getFormattedMonth('lastMonth');
const dailyduplicateInstruction = ` e.g. ${chalk.green(
  'qa-shadow-report --duplicate'
)}`;
const summaryDuplicateInstruction = ` ${chalk.green(
  'qa-shadow-report monthly-summary --duplicate'
)}`;
const weeklySummaryDuplicateInstruction = ` ${chalk.green(
  'qa-shadow-report weekly-summary --duplicate'
)}`;
const duplicateInstruction = ` If you would like to create a duplicate, use the optional flag ${chalk.green(
  '--duplicate'
)} in your reporting command,`;
const noSummaryMessage = chalk.yellow(
  `No ${lastMonth} summary required${duplicateInstruction}${summaryDuplicateInstruction}.`
);
const noWeeklySummaryMessage = chalk.yellow(
  `No weekly summary required${duplicateInstruction}${weeklySummaryDuplicateInstruction}.`
);
const noReportMessage = chalk.yellow(
  `Today\`s report already exists${duplicateInstruction}${dailyduplicateInstruction}.`
);
/**
 * Handles report and summary tasks based on pre-existing conditions.
 * - If the CSV option is selected, handles daily report creation immediately.
 * - Otherwise, checks if a summary or today's report is needed and processes accordingly.
 * - Logs informational messages if conditions for creating summaries or reports are not met.
 *
 * @async
 * @function main
 * @param {Object} options - Configuration options for generating reports.
 * @param {boolean} options.csv - If true, outputs in CSV format.
 * @param {boolean} options.duplicate - If true, allows creating a duplicate report for the day.
 * @param {boolean} options.cypress - If true, parses test result JSON in cypress format.
 * @param {boolean} options.playwright - If true, parses test result JSON in playwright format.
 * @returns {Promise<void>} A promise that resolves when the operation completes.
 */
export const main = async ({ csv, duplicate, cypress, playwright }) => {
  try {
    if (csv) {
      handleDailyReport({ csv, duplicate, cypress, playwright });
      return;
    }

    const monthlySummaryRequired = await isSummaryRequired({ csv });
    const weeklySummaryRequired = await isWeeklySummaryRequired({ csv });

    if (monthlySummaryRequired) {
      await handleSummary({ csv, duplicate, cypress, playwright });
      // } else {
      //   console.info(noSummaryMessage);
    }

    const todaysReportExists = await doesTodaysReportExist();
    if (todaysReportExists && !duplicate) {
      // console.info(noReportMessage);
    } else {
      await handleDailyReport({ csv, duplicate, cypress, playwright });
    }

    if (WEEKLY_SUMMARY_ENABLED() && weeklySummaryRequired) {
      await handleWeeklySummary({ csv, duplicate, cypress, playwright });
      // } else {
      //   console.info(chalk.yellow(noWeeklySummaryMessage));
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
};
