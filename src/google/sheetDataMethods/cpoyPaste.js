/**
 * Generates a copy-paste configuration for spreadsheet operations.
 * This function constructs the necessary parameters for a standard copy-paste operation
 * between a source and a destination within a spreadsheet.
 *
 * @param {Object} sourceParams - Parameters for the source tab, including:
 *  - {number} sourcePageId - The ID of the source tab.
 *  - {number} startRow - Starting row index for the source.
 *  - {number} endRow - Ending row index for the source.
 *  - {number} startCol - Starting column index for the source.
 *  - {number} endCol - Ending column index for the source.
 * @param {Object} destinationParams - Parameters for the destination tab, including:
 *  - {number} destinationTabId - The ID of the destination tab.
 *  - {number} startRow - Starting row index for the destination.
 *  - {number} endRow - Ending row index for the destination.
 *  - {number} startCol - Starting column index for the destination.
 *  - {number} endCol - Ending column index for the destination.
 * @returns {Object} - A structured object representing the copy-paste configuration.
 * @throws {Error} Throws an error if the input parameters are not correctly structured.
 */
export const copyPasteNormal = (
  {
    sourcePageId,
    startRow: srcStartRow,
    endRow: srcEndRow,
    startCol: srcStartCol,
    endCol: srcEndCol,
  },
  {
    destinationTabId,
    startRow: destStartRow,
    endRow: destEndRow,
    startCol: destStartCol,
    endCol: destEndCol,
  }
) => {
  try {
    if (!sourcePageId || !destinationTabId) {
      throw new Error(
        'Both sourcePageId and destinationTabId must be provided.'
      );
    }

    return {
      copyPaste: {
        source: {
          sheetId: sourcePageId,
          startRowIndex: srcStartRow,
          endRowIndex: srcEndRow,
          startColumnIndex: srcStartCol,
          endColumnIndex: srcEndCol,
        },
        destination: {
          sheetId: destinationTabId,
          startRowIndex: destStartRow,
          endRowIndex: destEndRow,
          startColumnIndex: destStartCol,
          endColumnIndex: destEndCol,
        },
        pasteType: 'PASTE_NORMAL',
      },
    };
  } catch (error) {
    console.error('Failed to create copy-paste configuration:', error);
    throw error;
  }
};
