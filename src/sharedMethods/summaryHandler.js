import {
  getExistingTabTitlesInRange,
  getExistingTabTitlesInWeeklyRange,
  getTabIdFromTitle,
  getTabIdFromWeeklyTitle,
} from '../google/sheetDataMethods/getSheetInfo.js';
import { auth, sheets, spreadsheetId } from '../google/auth.js';
import { addColumnsAndRowsToTabId } from '../google/sheetDataMethods/processSheetData.js';
import { createSummaryTitle } from '../google/sheetDataMethods/createTabNames.js';
import { constructPayloadForCopyPaste } from '../monthlySummaryMethods/buildSummary.js';
import { constructWeeklyPayloadForCopyPaste } from '../weeklySummaryMethods/buildSummary.js';
import { getLastMonthTabTitles } from '../google/sheetDataMethods/getLastMonthTabTitles.js';
import {
  createNewTab,
  createNewWeeklyTab,
} from '../google/googleSheetIntegration/createNewTab.js';
import { HEADER_INDICATORS } from '../../constants.js';
import {
  getCurrentTime,
  getDayIndex,
  getFormattedMonth,
  getPreviousMonthsYear,
} from './dateFormatting.js';
import {
  isSummaryRequired,
  isWeeklySummaryRequired,
} from './summaryRequired.js';
import chalk from 'chalk';
import { WEEK_START, DAYS, SHORT_DAYS, MONTHS } from '../../constants.js';

export const getHeaderIndicatorsLength = () => {
  return HEADER_INDICATORS.length;
};

/**
 * Initializes column metrics object to manage column positions and header lengths during report construction.
 *
 * @param headerIndicatorsLength
 * @returns {object} - An object containing metrics for next available column, default header metrics for destination column,
 * longest header end position, and end position for default header metrics destination column.
 */
export const initializeReportColumnMetrics = (headerIndicatorsLength) => {
  return {
    nextAvailableColumn: 0,
    defaultHeaderMetricsDestinationColumn: 0,
    longestHeaderEnd: 0,
    defaultHeaderMetricsDestinationColumnEnd: headerIndicatorsLength,
  };
};

/**
 * Send the summary data (payload) to a specified destination sheet tab.
 *
 * @param {Object} payload - The data to be written to the destination sheet.
 * @returns {Promise<void>}
 */
const sendSummaryBody = async (payload) => {
  try {
    await sheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId,
      resource: {
        requests: [payload],
      },
    });
  } catch (error) {
    console.error(`Error writing to project: ${spreadsheetId}`, error);
    throw new Error('Failed to send summary body.');
  }
};

/**
 * Add required number of columns and rows to the specified sheet tab.
 *
 * @param {string[]} lastMonthSheetTitles - Titles from last month's sheet to calculate the number of columns.
 * @param {string[]} headerIndicators - Headers to calculate the number of columns.
 * @param {Object[]} payload - Data objects containing information about where data should be pasted in the sheet.
 * @param {string} destinationTabTitle - The title of the destination tab in the sheet.
 * @returns {Promise<void>}
 */
const addColumnsAndRows = async (
  lastMonthSheetTitles,
  headerIndicators,
  payload,
  destinationTabTitle
) => {
  try {
    const numberOfColumnsNeeded =
      lastMonthSheetTitles.length * headerIndicators.length;
    const numberOfRowsNeeded = Math.max(
      ...payload.map((item) => item.copyPaste.destination.endRowIndex)
    );

    let destinationTabId;
    destinationTabId = await getTabIdFromTitle(destinationTabTitle);
    if (!destinationTabId) {
      destinationTabId = await getTabIdFromWeeklyTitle(destinationTabTitle);
    }
    await addColumnsAndRowsToTabId(
      destinationTabId,
      numberOfColumnsNeeded,
      numberOfRowsNeeded
    );
  } catch (error) {
    console.error('Error in adding columns and rows:', error);
    throw new Error('Unable to add columns and rows to the sheet.');
  }
};

/**
 * Send headers to a Google Sheets spreadsheet using Google Sheets API.
 *
 * @param {Array<Object>} payload - An array of objects containing data for batch updating values in the sheet.
 * @returns {Promise<void>}
 */
const sendSummaryHeaders = async (payload) => {
  try {
    await sheets.spreadsheets.values.batchUpdate({
      auth,
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: payload,
      },
    });
  } catch (error) {
    console.error('An error occurred while sending summary headers:', error);
    throw new Error('Failed to send summary headers.');
  }
};

/**
 * Apply styling to the header of a Google Sheets spreadsheet using a batch update request.
 *
 * @param {Object} payload - The request payload, specifically containing mergeCells request for defining the range and type of cells to be merged.
 * @returns {Promise<void>}
 */
const summaryHeaderStyling = async (payload) => {
  try {
    await sheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId,
      requestBody: {
        requests: [payload],
      },
    });
  } catch (error) {
    console.error('An error occurred while applying header styling:', error);
    throw new Error('Failed to apply summary header styling.');
  }
};

/**
 * Handles the creation and population of a monthly summary report.
 *
 * @param {Object} options - Configuration options for generating reports.
 * @param {boolean} options.csv - If true, outputs in CSV format.
 * @param {boolean} options.duplicate - If true, allows creating a duplicate report for the day.
 * @param {boolean} options.cypress - If true, parses test result JSON in cypress format.
 * @param {boolean} options.playwright - If true, parses test result JSON in playwright format.
 */
export const handleSummary = async ({
  csv,
  duplicate,
  cypress,
  playwright,
}) => {
  try {
    const summaryRequired = await isSummaryRequired({ csv });

    const lastMonth = getFormattedMonth('lastMonth');
    const noSummaryMessage = chalk.yellow(
      `No ${lastMonth} summary required. If you would like to create a duplicate, use the Monthly Summary command directly, with the optional flag ${chalk.green('--duplicate')}, e.g. ${chalk.green('qa-shadow-report monthly-summary --duplicate')}.`
    );

    if (csv) {
      console.warn(
        chalk.yellow('CSV format is not supported for summary reports')
      );
      return;
    }

    if (!summaryRequired && !duplicate) {
      console.info(noSummaryMessage);
      return;
    }

    const existingSheetTitles = await getExistingTabTitlesInRange();
    const lastMonthSheetTitles =
      await getLastMonthTabTitles(existingSheetTitles);
    const summaryTitle = createSummaryTitle();
    const currentTime = getCurrentTime();

    const summaryPageTitle = duplicate
      ? `${summaryTitle}_${currentTime}`
      : summaryTitle;

    await createNewTab(summaryPageTitle);
    const fullSummaryPayload = await constructPayloadForCopyPaste(
      lastMonthSheetTitles,
      summaryPageTitle
    );

    await addColumnsAndRows(
      lastMonthSheetTitles,
      HEADER_INDICATORS,
      fullSummaryPayload.bodyPayload,
      summaryPageTitle
    );
    await sendSummaryHeaders(fullSummaryPayload.headerPayload);
    await sendSummaryBody(fullSummaryPayload.bodyPayload);
    await summaryHeaderStyling(fullSummaryPayload.summaryHeaderStylePayload);
    console.info(
      chalk.green(
        `Monthly Summary created for ${getFormattedMonth('lastMonth')} ${getPreviousMonthsYear(getFormattedMonth())}.`
      )
    );
  } catch (error) {
    console.error('An error occurred in handleSummary:', error);
    throw new Error('Failed to handle summary.');
  }
};

/**
 * Formats a day name for display (e.g., "Monday" to "Mon").
 *
 * @param {string} dayName - Day name to format.
 * @returns {string} Formatted day name.
 */
function getFormattedDay(dayName) {
  return SHORT_DAYS[dayName] || dayName;
}

/**
 * Calculates the weekly date range starting from the most recent WEEK_START.
 *
 * @returns {{ startDate: Date, endDate: Date }} The start and end dates of the week.
 */
function getWeeklyDateRange() {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(
    now.getDate() - ((now.getDay() + 7 - getDayIndex(WEEK_START())) % 7)
  );
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

/**
 * Creates a weekly-specific summary title (e.g., "Weekly Summary Monday Jul 5-12 2025").
 *
 * @returns {string} Formatted weekly summary title.
 */
export function createWeeklySummaryTitle() {
  const { startDate, endDate } = getWeeklyDateRange();
  const dayNames = Object.keys(DAYS);
  return `Weekly Summary ${dayNames[startDate.getDay()]} ${MONTHS[startDate.getMonth()]} ${startDate.getDate()}-${endDate.getDate()} ${startDate.getFullYear()}`;
}

/**
 * Creates a formatted string for the weekly range (e.g., "Mon Jul 3-9").
 *
 * @returns {string} Formatted weekly range.
 */
function getFormattedWeekRange() {
  const { startDate, endDate } = getWeeklyDateRange();
  const dayNames = Object.keys(DAYS);
  return `${getFormattedDay(dayNames[startDate.getDay()])} ${MONTHS[startDate.getMonth()]} ${startDate.getDate()}-${endDate.getDate()}`;
}

/**
 * Handles the creation and population of a weekly summary report.
 *
 * @param {Object} options - Configuration options for generating reports.
 * @param {boolean} options.csv - If true, outputs in CSV format.
 * @param {boolean} options.duplicate - If true, allows creating a duplicate report for the week.
 * @param {boolean} options.cypress - If true, parses test result JSON in Cypress format.
 * @param {boolean} options.playwright - If true, parses test result JSON in Playwright format.
 */
export const handleWeeklySummary = async ({
  csv,
  duplicate,
  cypress,
  playwright,
}) => {
  try {
    if (csv) {
      console.warn(
        chalk.yellow('CSV format is not supported for weekly summary reports')
      );
      return;
    }
    const summaryRequired = await isWeeklySummaryRequired({ csv });

    if (!summaryRequired && !duplicate) {
      const weekRange = getFormattedWeekRange();
      console.info(
        chalk.yellow(
          `No summary required for week ${weekRange}. If you would like to create a duplicate, use the Weekly Summary command with the ${chalk.green('--duplicate')} flag, e.g., ${chalk.green('qa-shadow-report weekly-summary --duplicate')}.`
        )
      );
      return;
    }
    const existingSheetTitles = await getExistingTabTitlesInWeeklyRange();
    const currentTime = getCurrentTime();
    const summaryTitle = createWeeklySummaryTitle();
    const summaryPageTitle = duplicate
      ? `${summaryTitle}_${currentTime}`
      : summaryTitle;
    await createNewWeeklyTab(summaryPageTitle);
    const { startDate, endDate } = getWeeklyDateRange();
    const weeklySheetTitles = existingSheetTitles.filter((title) => {
      const tabDate = new Date(title);
      return tabDate >= startDate && tabDate <= endDate;
    });
    const fullSummaryPayload = await constructWeeklyPayloadForCopyPaste(
      weeklySheetTitles,
      summaryPageTitle
    );

    const updatedWeeklySheetTitles = weeklySheetTitles.map((title) => {
      const tabDate = new Date(title);
      const dayName = tabDate.toLocaleString('en-US', { weekday: 'short' });
      return `${dayName} ${title}`;
    });

    fullSummaryPayload.headerPayload = fullSummaryPayload.headerPayload.map(
      (header) => {
        return {
          ...header,
          values: header.values.map((row) =>
            row.map((value) => {
              const matchingTitle = weeklySheetTitles.find(
                (title) => value === title
              );
              if (matchingTitle) {
                const tabDate = new Date(matchingTitle);
                const dayName = tabDate.toLocaleString('en-US', {
                  weekday: 'short',
                });
                return `${dayName} ${value}`;
              }
              return value;
            })
          ),
        };
      }
    );

    await addColumnsAndRows(
      updatedWeeklySheetTitles,
      HEADER_INDICATORS,
      fullSummaryPayload.bodyPayload,
      summaryPageTitle
    );
    await sendSummaryHeaders(fullSummaryPayload.headerPayload);
    await sendSummaryBody(fullSummaryPayload.bodyPayload);
    await summaryHeaderStyling(fullSummaryPayload.summaryHeaderStylePayload);
    console.info(
      chalk.green(`Weekly Summary created for ${getFormattedWeekRange()}.`)
    );
  } catch (error) {
    console.error('An error occurred in handleWeeklySummary:', error);
    throw new Error('Failed to handle weekly summary.');
  }
};
