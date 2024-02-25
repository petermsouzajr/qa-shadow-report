import { batchUpdateMasterSheet } from '../googleSheetIntegration/writeToSheet.js';

/**
 * Adds the specified number of columns and rows to a sheet tab.
 * @param {number} tabId - The ID of the sheet tab to modify.
 * @param {number} columnQuantity - The number of columns to add.
 * @param {number} rowQuantity - The number of rows to add.
 * @returns {Promise<void>} A promise that resolves once the operation is complete.
 */
export const addColumnsAndRowsToTabId = async (
  tabId,
  columnQuantity = 0,
  rowQuantity = 0
) => {
  const payload = {
    requests: [
      columnQuantity > 0
        ? {
            insertDimension: {
              range: {
                sheetId: tabId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: columnQuantity,
              },
              inheritFromBefore: false,
            },
          }
        : null,
      rowQuantity > 0
        ? {
            insertDimension: {
              range: {
                sheetId: tabId,
                dimension: 'ROWS',
                startIndex: 0,
                endIndex: rowQuantity,
              },
              inheritFromBefore: false,
            },
          }
        : null,
    ].filter((request) => request !== null), // Filter out any null if no columns/rows need to be added
  };

  try {
    if (payload.requests.length > 0) {
      await batchUpdateMasterSheet(payload);
    } else {
    }
  } catch (error) {
    console.error('Error adding columns and rows to tab ID:', error);
    throw error;
  }
};
