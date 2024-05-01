import { createNewTab } from '../google/googleSheetIntegration/createNewTab.js';
import {
  batchUpdateMasterSheet,
  writeToSheet,
} from '../google/googleSheetIntegration/writeToSheet.js';
import {
  buildDailyPayload,
  processHeaderWithFormulas,
} from '../dailyReportMethods/buildReport.js';
import { loadJSON } from '../sharedMethods/dataHandler.js';
import { getCurrentTime, getTodaysFormattedDate } from './dateFormatting.js';
import { createMergeQueries } from '../dailyReportMethods/reportGenerationHelpers.js';
import { getTabIdFromTitle } from '../google/sheetDataMethods/getSheetInfo.js';
import {
  BuildTextStyles,
  buildColorStylesPayload,
  buildRowHeightPayload,
  createConditionalFormattingPayload,
  freezeRowsInSheet,
  sendGridStyle,
  setColumnWidths,
  createTextAlignmentPayload,
  setTextWrappingToClip,
} from './styles.js';
import { TEST_DATA } from '../../constants.js';
import { saveCSV } from './csvHandler.js';
import { doesTodaysReportExist } from './dailyReportRequired.js';

/**
 * Handles the creation and population of a daily report. This function is responsible for
 * generating either a standard or a CSV formatted report based on the provided options.
 * It involves building the payload, possibly creating a new tab, and writing the header and body
 * to the sheet. The function also handles duplicate reports if requested.
 *
 * @async
 * @function handleDailyReport
 * @param {Object} options - Configuration options for generating reports.
 * @param {boolean} options.csv - Specifies if the output should be in CSV format. When true, outputs a CSV file.
 * @param {boolean} options.duplicate - Allows the creation of a duplicate report for the current day if true.
 *                                      When false, it checks if today's report already exists and skips creation.
 * @returns {Promise<void>} A promise that resolves when the report generation process completes or an error occurs.
 */
export const handleDailyReport = async ({ csv, duplicate }) => {
  try {
    const todaysDate = getTodaysFormattedDate();
    const currentTime = getCurrentTime();
    const todaysTitle = duplicate ? `${todaysDate}_${currentTime}` : todaysDate;
    const noReportMessage = `Today\`s report already exists If you would like to create a duplicate, 
    use the optional flag "--duplicate" in your reporting command, e.g. "cy-shadow-report --duplicate".`;
    const jsonFilePath = TEST_DATA();

    const dataSet = await loadJSON(jsonFilePath);
    const fullDailyPayload = await buildDailyPayload(dataSet);
    const todaysReportExists = await doesTodaysReportExist();

    if (todaysReportExists && !duplicate) {
      console.info(noReportMessage);
      return;
    }

    if (csv) {
      const reportPayload = [
        // Gets the last element of the headerPayload array, which is the column titles
        fullDailyPayload.headerPayload[
          fullDailyPayload.headerPayload.length - 1
        ],
        ...fullDailyPayload.bodyPayload,
      ];
      saveCSV(reportPayload, duplicate);
    } else {
      await createNewTab(todaysTitle);
      const destinationTabId = await getTabIdFromTitle(todaysTitle);
      const headerRowIndex = fullDailyPayload.headerPayload.length + 1;
      const bodyRowCount = fullDailyPayload.bodyPayload.length;
      const totalNumberOfRows = headerRowIndex + bodyRowCount - 1;

      await processHeaderWithFormulas(
        fullDailyPayload.headerPayload,
        headerRowIndex,
        totalNumberOfRows,
        bodyRowCount
      );

      const rowMergePayload = createMergeQueries(
        fullDailyPayload.bodyPayload,
        headerRowIndex - 1,
        destinationTabId
      );

      const failedPayload = createConditionalFormattingPayload(
        destinationTabId,
        fullDailyPayload,
        'failed'
      );
      const passedPayload = createConditionalFormattingPayload(
        destinationTabId,
        fullDailyPayload,
        'passed'
      );

      const combinedPayload = {
        requests: [...failedPayload.requests, ...passedPayload.requests],
      };

      const frozenRowPayload = await freezeRowsInSheet(
        destinationTabId,
        headerRowIndex - 1
      );

      const colorStylesPayload = await buildColorStylesPayload(
        destinationTabId,
        fullDailyPayload
      );

      const rowHeightPayload = await buildRowHeightPayload(
        destinationTabId,
        fullDailyPayload
      );

      const textStyle = await BuildTextStyles(
        destinationTabId,
        fullDailyPayload
      );
      const wrapStrategyPayload = await setTextWrappingToClip(
        destinationTabId,
        fullDailyPayload
      );

      const textAlignmentPayload = await createTextAlignmentPayload(
        destinationTabId,
        fullDailyPayload
      );

      const columnWidthPayload = await setColumnWidths(
        destinationTabId,
        fullDailyPayload
      );

      await writeToSheet(todaysTitle, fullDailyPayload.headerPayload);
      await writeToSheet(todaysTitle, fullDailyPayload.bodyPayload);
      await writeToSheet(todaysTitle, fullDailyPayload.footerPayload);
      await sendGridStyle(destinationTabId, fullDailyPayload);
      await batchUpdateMasterSheet(combinedPayload);
      await batchUpdateMasterSheet(frozenRowPayload);
      await batchUpdateMasterSheet(colorStylesPayload);
      await batchUpdateMasterSheet(rowHeightPayload);
      await batchUpdateMasterSheet(textStyle);
      await batchUpdateMasterSheet(wrapStrategyPayload);
      await batchUpdateMasterSheet(textAlignmentPayload);
      await batchUpdateMasterSheet(columnWidthPayload);

      await batchUpdateMasterSheet(rowMergePayload);
    }
  } catch (error) {
    console.error('Error in handleDailyReport:', error);
    throw error; // Depending on the context you might want to handle the error differently
  }
};
