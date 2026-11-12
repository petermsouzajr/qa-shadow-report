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
import { WEEKLY_SUMMARY_ENABLED } from '../constants.js';

/**
 * Creates the mutable state used during one report-generation run.
 * @returns {Object} A new report context.
 */
export const createReportContext = () => ({
  topLevelSpreadsheetData: {},
  summaryTabData: {},
  weeklySummaryTabData: {},
  todaysReportData: {},
  lastMonthSheetValues: [],
  lastWeekSheetValues: [],
});

// Compatibility context for modules that still use the legacy export.
export const dataObjects = createReportContext();

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
  const reportContext = createReportContext();
  try {
    if (csv) {
      await handleDailyReport(
        { csv, duplicate, cypress, playwright },
        reportContext
      );
      return;
    }

    const monthlySummaryRequired = await isSummaryRequired(
      { csv },
      reportContext,
    );
    const weeklySummaryRequired = await isWeeklySummaryRequired(
      { csv },
      reportContext,
    );

    if (monthlySummaryRequired) {
      await handleSummary(
        { csv, duplicate, cypress, playwright },
        reportContext,
      );
      // } else {
      //   console.info(noSummaryMessage);
    }

    const todaysReportExists = await doesTodaysReportExist(reportContext);
    if (todaysReportExists && !duplicate) {
      // console.info(noReportMessage);
    } else {
      await handleDailyReport(
        { csv, duplicate, cypress, playwright },
        reportContext,
      );
    }

    if (WEEKLY_SUMMARY_ENABLED() && weeklySummaryRequired) {
      await handleWeeklySummary(
        { csv, duplicate, cypress, playwright },
        reportContext,
      );
      // } else {
      //   console.info(chalk.yellow(noWeeklySummaryMessage));
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
};
