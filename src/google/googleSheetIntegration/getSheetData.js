import { dataObjects } from '../../index.js';
import { sheets, auth, spreadsheetId, initializationError } from '../auth.js';
import { requireSheetsClient, withErrorContext } from '../../utils/errors.js';

/**
 * Retrieves the top-level data from the spreadsheet.
 * @param sheetsInstance
 * @param authParam
 * @param spreadsheetIdParam
 * @param dataObjectsRef
 * @returns {Promise<Object>} A promise that resolves with the top-level spreadsheet data.
 */
export const getTopLevelSpreadsheetData = async (
  sheetsInstance,
  authParam,
  spreadsheetIdParam,
  dataObjectsRef = dataObjects
) => {
  try {
    const sheetsAPI = requireSheetsClient(sheetsInstance || sheets, initializationError);
    const authToUse = authParam || auth;
    const spreadsheetIdToUse = spreadsheetIdParam || spreadsheetId;

    const data = await sheetsAPI.spreadsheets.get({
      auth: authToUse,
      spreadsheetId: spreadsheetIdToUse,
    });
    dataObjectsRef.topLevelSpreadsheetData = data;
    return data;
  } catch (error) {
    throw withErrorContext('Failed to fetch top-level spreadsheet data.', error);
  }
};

/**
 * Retrieves the values from a specific tab by its title.
 * @param {string} tabTitle - The title of the tab to get values from.
 * @param sheetsInstance
 * @param authParam
 * @param spreadsheetIdParam
 * @returns {Promise<Object>} A promise that resolves with the values from the specified tab.
 */
export const getTabValuesByTitle = async (
  tabTitle,
  sheetsInstance,
  authParam,
  spreadsheetIdParam
) => {
  try {
    const sheetsAPI = requireSheetsClient(
      sheetsInstance && typeof sheetsInstance.spreadsheets === 'object'
        ? sheetsInstance
        : sheets,
      initializationError
    );

    const authToUse = typeof authParam === 'string' ? auth : authParam;
    const spreadsheetIdToUse = spreadsheetIdParam || spreadsheetId;
    const data = await sheetsAPI.spreadsheets.values.get({
      auth: authToUse,
      spreadsheetId: spreadsheetIdToUse,
      range: tabTitle,
    });
    return data;
  } catch (error) {
    throw withErrorContext(`Failed to fetch values for tab: ${tabTitle}.`, error);
  }
};
