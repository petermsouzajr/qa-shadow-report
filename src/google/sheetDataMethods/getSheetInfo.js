import {
  getFormattedMonth,
  getPreviousMonthsYear,
  getTodaysFormattedDate,
} from '../../sharedMethods/dateFormatting.js';
import { getTopLevelSpreadsheetData } from '../googleSheetIntegration/getSheetData.js';
import { dataObjects } from '../../index.js';
import { createSummaryTitle } from './createTabNames.js';
import { FOOTER_ROW, HEADER_INDICATORS } from '../../../constants.js';

/**
 * Find a sheet data object in the array that matches a specific title.
 * @param {Array} sheetValuesArray - Array of sheet data objects.
 * @param {string} sheetTitle - The title of the sheet to find.
 * @returns {Object|undefined} The sheet data object or undefined if not found.
 */
export const findTabTitleDataInArray = (sheetValuesArray, sheetTitle) => {
  return sheetValuesArray.find((sheet) => {
    const url = decodeURIComponent(sheet.config.url);
    return url.includes(`/${sheetTitle}`);
  });
};

/**
 * Fetches existing tab titles in range based on the given criteria.
 * @param {string} when - Time frame filter criteria.
 * @returns {Promise<Array>} An array of titles that match the given criteria.
 */
export const getExistingTabTitlesInRange = async (when = '') => {
  const currentMonth = getFormattedMonth();
  const lastMonth = getFormattedMonth('lastMonth').toLowerCase();
  const previousMonthYear = getPreviousMonthsYear(currentMonth);

  try {
    const metaData =
      Object.keys(dataObjects.topLevelSpreadsheetData).length === 0
        ? await getTopLevelSpreadsheetData()
        : dataObjects.topLevelSpreadsheetData;
    const titles = metaData.data.sheets.map((sheet) => sheet.properties.title);

    return when !== 'lastMonth'
      ? titles
      : titles.filter(
        (title) =>
          title.toLowerCase().includes(lastMonth) &&
            title.includes(previousMonthYear) &&
            /^([A-Z][a-z]{2} \d{1,2}, \d{4})$/.test(title)
      );
  } catch (error) {
    console.error('Error fetching sheet titles in range:', error);
    throw new Error('Unable to fetch sheet titles in range.');
  }
};

/**
 * Gets the ID of the tab by its title.
 * @param {string} tabTitle - The title of the tab.
 * @returns {Promise<number|null>} The ID of the tab or null if not found.
 */
export const getTabIdFromTitle = async (tabTitle) => {
  // Determine the appropriate sheet list based on the tab title
  let sheetList;
  if (tabTitle.includes(createSummaryTitle())) {
    sheetList = dataObjects.summaryTabData;
  } else if (tabTitle.includes(getTodaysFormattedDate())) {
    sheetList = dataObjects.todaysReportData;
  } else {
    sheetList = dataObjects.topLevelSpreadsheetData;
  }

  // Verify if sheet list is loaded
  if (!sheetList || Object.keys(sheetList).length === 0) {
    console.error('Sheet list data is not available');
    return null;
  }

  try {
    // If it's summary or today's report, retrieve the ID directly
    if (
      tabTitle.includes(createSummaryTitle()) ||
      tabTitle.includes(getTodaysFormattedDate())
    ) {
      return sheetList.data.replies[0].addSheet.properties.sheetId;
    }

    // For other cases, find the sheet in the list
    const sheet = sheetList.data.sheets.find(
      (sheet) => sheet.properties.title === tabTitle
    );
    return sheet ? sheet.properties.sheetId : null;
  } catch (error) {
    console.error('Error fetching tab ID from title:', error);
    throw new Error('Unable to fetch tab ID from title.');
  }
};

/**
 * Finds the index of the column whose header matches any of the default metrics.
 * @param {string} sheetId - The ID of the sheet/tab to look into.
 * @param {Array<string>} defaultHeaderMetrics - An array of metric names to match against.
 * @returns {Promise<number|null>} The index of the matching column or null if no match is found.
 */
export const findMatchingColumnByTabId = async (
  sheetId,
  defaultHeaderMetrics
) => {
  try {
    const metaData = dataObjects.lastMonthSheetValues[0].find((item) => {
      return item.data.range.startsWith(`'${sheetId}'`);
    });
    const headers = metaData.data.values[0];

    const matchingIndex = headers.findIndex((header) =>
      defaultHeaderMetrics.some((metric) => header.trim().includes(metric))
    );

    return matchingIndex !== -1 ? matchingIndex : null;
  } catch (error) {
    console.error('Error finding matching column by tab ID:', error);
    throw error;
  }
};

/**
 * Retrieves header and footer data of a tab by its title.
 * @param {string} sheetTitle - The title of the tab.
 * @returns {Promise<Object>} An object containing header row, footer row, and header values.
 */
export const getHeaderAndFooterDataByTabTitle = async (sheetTitle) => {
  try {
    let headerRow = 0;
    let footerRow = 0;
    let headerValues = [];

    // Find the right sheet data
    const metaData = dataObjects.lastMonthSheetValues[0].find((item) => {
      return item.data.range.startsWith(`'${sheetTitle}'`);
    });

    if (!metaData) {
      console.error(`No data found for sheet title: ${sheetTitle}`);
      return null;
    }

    const rows = metaData.data.values;

    rows.forEach((row, index) => {
      if (row.includes(FOOTER_ROW)) footerRow = index + 1; // Assuming FOOTER_ROW marks the end row
      if (HEADER_INDICATORS.every((indicator) => row.includes(indicator))) {
        headerRow = index + 1;
        headerValues = row;
      }
    });

    return { headerRow, footerRow, headerValues };
  } catch (error) {
    console.error('Error retrieving header and footer data:', error);
    throw new Error('Unable to retrieve header and footer data.');
  }
};
