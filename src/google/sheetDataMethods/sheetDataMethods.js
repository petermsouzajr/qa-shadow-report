import { sheets } from '../auth.js';
import { GOOGLE_SHEET_ID } from '../../../constants.js';

/**
 * Gets the top-level spreadsheet data.
 * @async
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @returns {Promise<Object>} The spreadsheet data.
 */
export const getTopLevelSpreadsheetData = async (
  spreadsheetId = GOOGLE_SHEET_ID()
) => {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get spreadsheet data: ${error.message}`);
  }
};

/**
 * Gets values from a specific tab by title.
 * @async
 * @param {string} tabTitle - The title of the tab.
 * @param {Object} sheetsInstance - The sheets API instance.
 * @returns {Promise<Array<Array<string>>>} The tab values.
 */
export const getTabValuesByTitle = async (
  tabTitle,
  sheetsInstance = sheets
) => {
  if (!sheetsInstance) {
    throw new Error('Invalid sheets instance');
  }

  try {
    const response = await sheetsInstance.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID(),
      range: tabTitle,
    });
    return response.data.values || [];
  } catch (error) {
    throw new Error(`Failed to get tab values: ${error.message}`);
  }
};

/**
 * Gets the ID of a tab from its title.
 * @async
 * @param {string} tabTitle - The title of the tab.
 * @returns {Promise<number>} The tab ID.
 */
export const getTabIdFromTitle = async (tabTitle) => {
  try {
    const spreadsheetData = await getTopLevelSpreadsheetData();
    const sheet = spreadsheetData.sheets.find(
      (s) => s.properties.title === tabTitle
    );
    return sheet ? sheet.properties.sheetId : null;
  } catch (error) {
    throw new Error(`Failed to get tab ID: ${error.message}`);
  }
};

/**
 * Gets the ID of a weekly tab from its title.
 * @async
 * @param {string} tabTitle - The title of the weekly tab.
 * @returns {Promise<number>} The tab ID.
 */
export const getTabIdFromWeeklyTitle = async (tabTitle) => {
  try {
    const spreadsheetData = await getTopLevelSpreadsheetData();
    const sheet = spreadsheetData.sheets.find(
      (s) => s.properties.title === tabTitle
    );
    return sheet ? sheet.properties.sheetId : null;
  } catch (error) {
    throw new Error(`Failed to get weekly tab ID: ${error.message}`);
  }
};

/**
 * Gets existing tab titles within a specified range.
 * @async
 * @param {string} startDate - The start date in YYYY-MM-DD format.
 * @param {string} endDate - The end date in YYYY-MM-DD format.
 * @returns {Promise<string[]>} Array of tab titles within the range.
 */
export const getExistingTabTitlesInRange = async (startDate, endDate) => {
  try {
    const spreadsheetData = await getTopLevelSpreadsheetData();
    const sheets = spreadsheetData.sheets || [];
    return sheets
      .map((sheet) => sheet.properties.title)
      .filter((title) => {
        const date = title.split(' ')[0]; // Assuming title format is "YYYY-MM-DD ..."
        return date >= startDate && date <= endDate;
      });
  } catch (error) {
    throw new Error(`Failed to get tab titles in range: ${error.message}`);
  }
};
