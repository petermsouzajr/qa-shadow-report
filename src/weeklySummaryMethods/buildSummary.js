import { getTabIdFromWeeklyTitle } from '../google/sheetDataMethods/getSheetInfo.js';
import {
  findLongestHeaderWithinWeeklySeries,
  processWeeklySourceTabTitles,
  fetchLastWeekTabValues,
  initializeWeeklyReportPayload,
} from '../weeklySummaryMethods/summaryGenerationHelpers.js';
import { WEEK_START } from '../../constants.js';
import { getDayIndex } from '../sharedMethods/dateFormatting.js';
import {
  getHeaderIndicatorsLength,
  initializeReportColumnMetrics,
} from '../sharedMethods/summaryHandler.js';

/**
 * Constructs a payload for copying weekly test result data between tabs based on specified source and destination titles.
 *
 * @param {string[]} sourceTabTitles - Array of titles of the source tabs to be processed (expected to be date-based, e.g., "2025-03-01").
 * @param {string} destinationTabTitle - Title of the destination tab where the weekly summary will be pasted.
 * @returns {Promise<object>} A promise resolving to the constructed payload.
 * @throws {Error} If there is an issue fetching tab details or processing source tab titles.
 */
export const constructWeeklyPayloadForCopyPaste = async (
  sourceTabTitles,
  destinationTabTitle
) => {
  try {
    // Calculate header indicators' length for reference.
    const headerIndicatorsLength = getHeaderIndicatorsLength();

    // Filter sourceTabTitles to include only those within the current week
    const now = new Date();

    // Calculate the start of the current week
    const startDate = new Date(now);
    startDate.setDate(
      now.getDate() - ((now.getDay() + 7 - getDayIndex(WEEK_START())) % 7)
    );
    startDate.setHours(0, 0, 0, 0);

    // Calculate the end of the current week
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const sortedTitles = sourceTabTitles.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    const weeklyTabTitles = sortedTitles.filter((title) => {
      const tabDate = new Date(title);
      return tabDate >= startDate && tabDate <= endDate;
    });
    const lastWeekTabValues = await fetchLastWeekTabValues(weeklyTabTitles);
    // Fetch values for the weekly tabs (replace with actual fetch logic if needed)
    // const tabValues = await fetchTabValues(weeklyTabTitles);

    // Initialize the payload and column metrics for processing
    const summaryPayload = initializeWeeklyReportPayload();
    let columnMetrics = initializeReportColumnMetrics(headerIndicatorsLength);

    // Fetch the destination tab's ID based on its title
    const destinationTabId = await getTabIdFromWeeklyTitle(destinationTabTitle);

    // Find the longest header within the relevant series
    columnMetrics.longestHeaderEnd = await findLongestHeaderWithinWeeklySeries(
      weeklyTabTitles,
      lastWeekTabValues,
      columnMetrics
    );

    // Process the fetched data from source tabs and prepare the payload
    await processWeeklySourceTabTitles(
      weeklyTabTitles,
      destinationTabId,
      summaryPayload,
      columnMetrics,
      destinationTabTitle,
      headerIndicatorsLength
    );

    // Add metadata for the weekly report
    summaryPayload.metadata = {
      ...summaryPayload.metadata,
      summaryType: 'weekly',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    return summaryPayload;
  } catch (error) {
    console.error('Error building weekly copy-paste payload:', error);
    throw new Error('Error building weekly copy-paste payload.');
  }
};
