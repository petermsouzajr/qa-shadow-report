import { sheets, auth, spreadsheetId, initializationError } from '../auth.js';
import { requireSheetsClient, withErrorContext } from '../../utils/errors.js';

/**
 * Appends values to a specified sheet within the spreadsheet.
 *
 * @param {string} sheetTitle - Title of the sheet where data will be appended.
 * @param {Array<Array<string|number>>} values - 2D array of values to append.
 * @param sheetsInstance
 */
export const writeToSheet = async (sheetTitle, values, sheetsInstance) => {
  const sheetsAPI = requireSheetsClient(sheetsInstance || sheets, initializationError);
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
    throw withErrorContext(`Failed to write to sheet "${sheetTitle}".`, error);
  }
};

/**
 * Sends a batch update request to the spreadsheet with the given payload.
 *
 * @param {Object} payload - The data and instructions for the batch update.
 * @param sheetsInstance
 */
export const batchUpdateMasterSheet = async (payload, sheetsInstance) => {
  const sheetsAPI = requireSheetsClient(sheetsInstance || sheets, initializationError);
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
    throw withErrorContext('Failed to apply spreadsheet batch update.', error);
  }
};
