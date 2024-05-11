import {
  getExistingTabTitlesInRange,
  getTabIdFromTitle,
} from '../google/sheetDataMethods/getSheetInfo.js';
import { auth, sheets, spreadsheetId } from '../google/auth.js';
import { addColumnsAndRowsToTabId } from '../google/sheetDataMethods/processSheetData.js';
import { createSummaryTitle } from '../google/sheetDataMethods/createTabNames.js';
import { constructPayloadForCopyPaste } from '../monthlySummaryMethods/buildSummary.js';
import { getLastMonthTabTitles } from '../google/sheetDataMethods/getLastMonthTabTitles.js';
import { createNewTab } from '../google/googleSheetIntegration/createNewTab.js';
import { HEADER_INDICATORS } from '../../constants.js';
import { getCurrentTime, getFormattedMonth } from './dateFormatting.js';
import { isSummaryRequired } from './summaryRequired.js';
import chalk from 'chalk';

/**
 * Send the summary data (payload) to a specified destination sheet tab.
 *
 * This function first calculates the number of columns and rows needed in the
 * destination sheet, potentially adding columns and rows to accommodate the data.
 * It then sends a batch update request to the Google Sheets API to populate the
 * sheet with the provided payload.
 *
 * @async
 * @function
 * @param {Object} payload - The data to be written to the destination sheet.
 *   The object must include specifications for the copy-paste operation,
 *   including the start and end indices for the rows to copy.
 * @returns {Promise<void>} - A promise that resolves when the function has
 *   completed sending the data to the Google Sheets API.
 * @throws Will log an error to the console if there is an issue writing to the sheet.
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
  }
};

/**
 * Add required number of columns and rows to the specified sheet tab.
 *
 * This asynchronous function calculates the necessary number of columns and rows needed
 * in the destination sheet based on specified conditions, and subsequently expands the
 * sheet's size to accommodate the data. It leverages a helper function to interact with
 * the Google Sheets API to modify the sheet dimensions.
 *
 * @async
 * @param {string[]} lastMonthSheetTitles - Titles from last month's sheet to calculate the number of columns.
 * @param {string[]} headerIndicators - Headers to calculate the number of columns.
 * @param {Object[]} payload - Data objects containing information about where data should be pasted in the sheet.
 * @param {string} destinationTabTitle - The title of the destination tab in the sheet.
 * @returns {Promise<void>} A promise that resolves when the sheet dimensions have been updated.
 * @throws {Error} Throws an error if unable to calculate dimensions or update the sheet.
 * @example
 * await addColumnsAndRows(['Title1', 'Title2'], ['Header1', 'Header2'], dataPayload, 'Sheet1');
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

    const destinationTabId = await getTabIdFromTitle(destinationTabTitle);
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
 * This asynchronous function sends a batch update with header values to a specified Google Sheet.
 * The data payload is sent in 'RAW' input format. If the API request fails for any reason,
 * an error is logged to the console, but the function does not throw an error.
 *
 * @async
 * @function sendSummaryHeaders
 * @param {Array<Object>} payload - An array of objects containing data for batch updating values in the sheet.
 * Each object should define a range and associated values. Example:
 * ```js
 * [{
 *   range: 'Sheet1!A1',
 *   values: [['Header1', 'Header2', 'Header3']],
 * }]
 * ```
 * @throws Will log an error to the console if the API request fails.
 * @example
 * const data = [{
 *   range: 'Sheet1!A1',
 *   values: [['Header1', 'Header2', 'Header3']],
 * }];
 * await sendSummaryHeaders(data);
 */
const sendSummaryHeaders = async (payload) => {
  try {
    await sheets.spreadsheets.values.batchUpdate({
      auth: auth,
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: payload, // Using provided payload directly
      },
    });
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

/**
 * Apply styling to the header of a Google Sheets spreadsheet using a batch update request.
 *
 * This function sends a payload in a batch update request to the Google Sheets API to update the styling of the sheet’s header.
 * The `payload` should contain a `mergeCells` request object that defines the range of cells to be merged and the type of merge to be applied.
 * If the API request encounters an error, it is logged to the console but not thrown.
 *
 * @async
 * @function summaryHeaderStyling
 * @param {Object} payload - The request payload, specifically containing mergeCells request for defining the range and type of cells to be merged.
 * @returns {Promise<void>} - A promise that resolves when the API request is complete. Does not resolve with any value. Errors are logged, not thrown.
 * @throws Will log an error to the console if the API request fails.
 * @example
 * const payload = {
 *   "mergeCells": {
 *     "range": {
 *       "sheetId": 0,
 *       "startRowIndex": 0,
 *       "endRowIndex": 1,
 *       "startColumnIndex": 0,
 *       "endColumnIndex": 2
 *     },
 *     "mergeType": "MERGE_ALL"
 *   }
 * };
 * await summaryHeaderStyling(payload);
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
    console.error('An error occurred:', error);
  }
};

/**
 * Handles the creation and population of a monthly summary report.
 * This function coordinates several asynchronous operations to build and populate a summary report based on data from the previous month.
 * It creates a new tab for the summary, constructs the report payload from last month's tab titles,
 * and writes the header and body to the newly created sheet. The format of the output (e.g., CSV or standard visual format)
 * can be specified via the 'format' parameter.
 *
 * @async
 * @function handleDailyReport
 * @param {Object} options - Configuration options for generating reports.
 * @param {boolean} options.csv - If true, outputs in CSV format.
 * @param {boolean} options.duplicate - If true, allows creating a duplicate report for the day.
 * @param {boolean} options.cypress - If true, parses test result JSON in cypress format.
 * @param {boolean} options.playwright - If true, parses test result JSON in playwright format.
 * */
export const handleSummary = async ({
  csv,
  duplicate,
  cypress,
  playwright,
}) => {
  const summaryRequired = await isSummaryRequired({ csv });

  const lastMonth = getFormattedMonth('lastMonth');
  const noSummaryMessage =
    chalk.yellow(`No ${lastMonth} summary required If you would like to create a duplicate,
  use the Monthly Summary command directly, with the optional flag ${chalk.green(
    '--duplicate'
  )}, e.g. ${chalk.green('qa-shadow-report monthly-summary --duplicate')}.`);

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
  const lastMonthSheetTitles = await getLastMonthTabTitles(existingSheetTitles);
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
};
