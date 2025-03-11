import { getTabIdFromTitle } from '../google/sheetDataMethods/getSheetInfo.js';
import {
  getHeaderIndicatorsLength,
  initializeReportColumnMetrics,
} from '../sharedMethods/summaryHandler.js';
import {
  fetchLastMonthTabValues,
  findLongestHeaderWithinSeries,
  initializeReportPayload,
  processSourceTabTitles,
} from './summaryGenerationHelpers.js';

/**
 * Constructs a payload for copying data between tabs based on specified source and destination titles.
 *
 * @param {string[]} sourceTabTitles - Array of titles of the source tabs to be processed.
 * @param {string} destinationTabTitle - Title of the destination tab where the data will be pasted.
 * @returns {Promise<object>} A promise resolving to the constructed payload.
 * @throws {Error} If there is an issue fetching tab details or processing source tab titles.
 */
export const constructPayloadForCopyPaste = async (
  sourceTabTitles,
  destinationTabTitle
) => {
  try {
    const headerIndicatorsLength = getHeaderIndicatorsLength();
    const sortedTitles = sourceTabTitles.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA - dateB;
    });
    const lastMonthTabValues = await fetchLastMonthTabValues(sortedTitles);
    const summaryPayload = initializeReportPayload();
    let columnMetrics = initializeReportColumnMetrics(headerIndicatorsLength);
    const destinationTabId = await getTabIdFromTitle(destinationTabTitle);

    columnMetrics.longestHeaderEnd = await findLongestHeaderWithinSeries(
      sortedTitles,
      lastMonthTabValues,
      columnMetrics
    );

    await processSourceTabTitles(
      sortedTitles,
      destinationTabId,
      summaryPayload,
      columnMetrics,
      destinationTabTitle,
      headerIndicatorsLength
    );
    return summaryPayload;
  } catch (error) {
    console.error('Error building copy-paste payload:', error);
    throw new Error('Error building copy-paste payload.');
  }
};
