import { sheets, auth, spreadsheetId } from '../auth.js';

/**
 * Appends values to a specified sheet within the spreadsheet.
 *
 * @param {string} sheetTitle - Title of the sheet where data will be appended.
 * @param {Array<Array<string|number>>} values - 2D array of values to append.
 */
export const writeToSheet = async (sheetTitle, values, sheetsInstance) => {
  const sheetsAPI = sheetsInstance || sheets;
  const authToUse = sheetsInstance ? sheetsInstance.auth : auth;
  const spreadsheetIdToUse =
    sheetsInstance && sheetsInstance.spreadsheetId
      ? sheetsInstance.spreadsheetId
      : spreadsheetId;
  try {
    await sheetsAPI.spreadsheets.values.append({
      auth: authToUse,
      spreadsheetId: spreadsheetIdToUse,
      range: sheetTitle,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
  } catch (error) {
    console.error(`Error writing to sheet "${sheetTitle}":`, error);
    throw error;
  }
};

/**
 * Sends a batch update request to the spreadsheet with the given payload.
 *
 * @param {Object} payload - The data and instructions for the batch update.
 */
export const batchUpdateMasterSheet = async (payload, sheetsInstance) => {
  const sheetsAPI = sheetsInstance || sheets;
  const authToUse =
    sheetsInstance && sheetsInstance.auth ? sheetsInstance.auth : auth;
  const spreadsheetIdToUse =
    sheetsInstance && sheetsInstance.spreadsheetId
      ? sheetsInstance.spreadsheetId
      : spreadsheetId;

  try {
    await sheetsAPI.spreadsheets.batchUpdate({
      auth: authToUse,
      spreadsheetId: spreadsheetIdToUse,
      resource: payload,
    });
  } catch (error) {
    console.error('Error applying batch update:', error);
    throw error;
  }
};
