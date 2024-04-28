import { dataObjects } from '../../index.js';
import { sheets, auth, spreadsheetId } from '../auth.js';

/**
 * Retrieves the top-level data from the spreadsheet.
 * @returns {Promise<Object>} A promise that resolves with the top-level spreadsheet data.
 */
export const getTopLevelSpreadsheetData = async (
  sheetsInstance,
  authParam,
  spreadsheetIdParam,
  dataObjectsRef = dataObjects
) => {
  try {
    const sheetsAPI = sheetsInstance || sheets;
    const authToUse = authParam || auth;
    const spreadsheetIdToUse = spreadsheetIdParam || spreadsheetId;

    const data = await sheetsAPI.spreadsheets.get({
      auth: authToUse,
      spreadsheetId: spreadsheetIdToUse,
    });
    dataObjectsRef.topLevelSpreadsheetData = data;
    return data;
  } catch (error) {
    console.error('Failed to fetch top-level spreadsheet data:', error);
    throw new Error('Error fetching top-level spreadsheet data.');
  }
};

/**
 * Retrieves the values from a specific tab by its title.
 * @param {string} tabTitle - The title of the tab to get values from.
 * @returns {Promise<Object>} A promise that resolves with the values from the specified tab.
 */
export const getTabValuesByTitle = async (
  tabTitle,
  sheetsInstance,
  authParam,
  spreadsheetIdParam
) => {
  try {
    const sheetsAPI =
      sheetsInstance && typeof sheetsInstance.spreadsheets === 'object'
        ? sheetsInstance
        : sheets;

    const authToUse = typeof authParam === 'string' ? auth : authParam;
    const spreadsheetIdToUse = spreadsheetIdParam || spreadsheetId;
    const data = await sheetsAPI.spreadsheets.values.get({
      auth: authToUse,
      spreadsheetId: spreadsheetIdToUse,
      range: tabTitle,
    });
    return data;
  } catch (error) {
    console.error(`Failed to fetch values for tab: ${tabTitle}:`, error);
    throw new Error(`Error fetching values for tab: ${tabTitle}`);
  }
};
