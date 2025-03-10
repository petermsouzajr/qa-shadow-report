import { batchUpdateMasterSheet } from '../google/googleSheetIntegration/writeToSheet.js';
import { findHeaderRowIndex } from '../monthlySummaryMethods/summaryGenerationHelpers.js';
import { solidBlackWidthOne, solidBlackWidthTwo } from './summaryStyles.js';

/**
 * Creates a grid style for a specific tab with defined borders.
 * This function generates an object that defines border styles for a grid in a Google Sheet.
 * It uses the payload from daily data and headers to determine the range and apply appropriate borders.
 *
 * @async
 * @param {number} destinationTabId - The ID of the target tab where the grid will be styled.
 * @param {Object} fullDailyPayload - An object containing daily payload data with body and header information.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the border styles and the range to apply them.
 * @throws {Error} - Throws an error if the operation fails.
 */
const createGridStyle = async (destinationTabId, fullDailyPayload) => {
  const summaryHeaderRowStart = 0;
  const summaryHeaderColumnStart = 0;
  const headerRowIndex = findHeaderRowIndex(fullDailyPayload.bodyPayload);
  const endColumn = fullDailyPayload.bodyPayload[headerRowIndex].length;

  /**
   * Fetch the header and footer data for the given tab title.
   */

  const payload = {
    updateBorders: {
      range: {
        sheetId: destinationTabId,
        startRowIndex: summaryHeaderRowStart,
        endRowIndex:
          fullDailyPayload.bodyPayload.length +
          fullDailyPayload.headerPayload.length +
          1,
        startColumnIndex: summaryHeaderColumnStart,
        endColumnIndex: endColumn,
      },
      top: solidBlackWidthTwo,
      bottom: solidBlackWidthTwo,
      left: solidBlackWidthOne,
      right: solidBlackWidthOne,
      innerHorizontal: solidBlackWidthTwo,
      innerVertical: solidBlackWidthOne,
    },
  };

  return payload;
};

/**
 * Adds the created grid style payload to the summary payload and sends the request to update the sheet.
 * The function first generates the grid style using `createGridStyle`, then it adds this style to the
 * summary payload's grid styles array. Finally, it sends a batch update request to the Google Sheets API
 * to apply the grid style to the specified sheet/tab.
 *
 * @async
 * @param {number} destinationTabId - The ID of the target tab where the grid will be styled.
 * @param {Object} fullDailyPayload - An object containing daily payload data including the summary grid styles.
 * @returns {Promise<void>} - A promise that resolves when the grid style has been successfully sent to the sheet.
 * @throws {Error} - Throws an error if there is an issue with applying the grid style to the sheet.
 */
export const sendGridStyle = async (destinationTabId, fullDailyPayload) => {
  const gridStyle = await createGridStyle(destinationTabId, fullDailyPayload);
  fullDailyPayload.summaryGridStyles.push(gridStyle);

  const requestBody = {
    requests: fullDailyPayload.summaryGridStyles, // This should be an array of requests
  };

  try {
    await batchUpdateMasterSheet(requestBody);
  } catch (error) {
    console.error('sendGridStyle: An error occurred:', error);
  }
};

/**
 * Creates a payload for a batch update to apply conditional formatting based on the state.
 * The function defines conditional formatting rules for the 'state' column in a sheet.
 * It uses a custom formula to apply a background color to cells matching a specific state.
 *
 * @param {number} sheetId - The ID of the sheet to apply formatting to.
 * @param {Object} fullDailyPayload - An object containing the daily payload data with body and header information.
 * @param {string} state - The state to check in the conditional formatting ('failed' or 'passed').
 * @returns {Object} - The request payload for the batch update containing conditional format rules.
 * @example
 * const formattingPayload = createConditionalFormattingPayload(sheetId, fullDailyPayload, 'failed');
 */
export const createConditionalFormattingPayload = (
  sheetId,
  fullDailyPayload,
  state
) => {
  const headerRowIndex = findHeaderRowIndex(fullDailyPayload.headerPayload);
  const headerRow = fullDailyPayload.headerPayload[headerRowIndex - 1];
  const targetIndex = headerRow.indexOf('state');
  const endRow =
    fullDailyPayload.bodyPayload.length + fullDailyPayload.headerPayload.length;
  const failedFormula = '=IF(I6:I107="failed",true)';
  const passedFormula = '=IF(I6:I107="passed",true)';
  const failedColor = { red: 1, green: 0.49803922, blue: 0.49803922 };
  const passedColor = { red: 0.49803922, green: 1, blue: 0.49803922 };
  let formula = passedFormula;
  let color = passedColor;
  if (state === 'failed') {
    formula = failedFormula;
    color = failedColor;
  }

  const conditionalFormatRule = {
    addConditionalFormatRule: {
      rule: {
        ranges: [
          {
            sheetId: sheetId,
            startRowIndex: headerRowIndex,
            endRowIndex: endRow,
            startColumnIndex: targetIndex,
            endColumnIndex: targetIndex + 1,
          },
        ],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: formula }],
          },
          format: {
            backgroundColor: color,
          },
        },
      },
    },
  };

  return { requests: [conditionalFormatRule] };
};

/**
 * Constructs a request payload for freezing rows in a Google Sheet up to a specified row index.
 * This payload can then be used with the Google Sheets API to update the sheet properties.
 *
 * @param {number} sheetId - The ID of the individual sheet within the spreadsheet where rows are to be frozen.
 * @param {number} freezeTillRow - The number of top rows to freeze. Rows above this index will be frozen.
 * @returns {Promise<Object>} A batch update request payload containing the sheet properties update for freezing rows.
 * @example
 * const freezeRowsPayload = freezeRowsInSheet(12345, 2);
 * // The above call creates a payload to freeze the first two rows of the sheet with ID 12345.
 */
export const freezeRowsInSheet = async (sheetId, freezeTillRow) => {
  const requests = [
    {
      updateSheetProperties: {
        properties: {
          sheetId: sheetId,
          gridProperties: {
            frozenRowCount: freezeTillRow,
          },
        },
        fields: 'gridProperties.frozenRowCount',
      },
    },
  ];

  return { requests };
};

/**
 * Creates a request object for the Google Sheets API to repeat a cell's formatting
 * across a specified range. This function is typically used for applying a uniform
 * background color to a range of cells within a sheet.
 *
 * @param {number} sheetId - The ID of the sheet where the cells will be formatted.
 * @param {number} startRowIndex - The index of the first row of the range to format.
 * @param {number} endRowIndex - The index of the row after the last row of the range to format.
 * @param {number} columnLength - The number of columns to format, starting from the first column.
 * @param {Object} backgroundColor - An object representing the color to set as the cell background.
 * @returns {Object} A request object ready to be used in a batchUpdate to apply the formatting.
 *
 * @example
 * // Define a light grey color
 * const lightGrey = { red: 0.9, green: 0.9, blue: 0.9 };
 *
 * // Create a repeatCell request for rows 1 to 3 inclusive, assuming the sheet has 5 columns
 * const repeatCellRequest = createRepeatCellRequest(sheetId, 0, 3, 5, lightGrey);
 *
 * // The returned request can be included in the requests array for batchUpdate
 */
const createRepeatCellRequest = (
  sheetId,
  startRowIndex,
  endRowIndex,
  columnLength,
  backgroundColor
) => ({
  repeatCell: {
    range: {
      sheetId,
      startRowIndex,
      endRowIndex,
      startColumnIndex: 0,
      endColumnIndex: columnLength,
    },
    cell: {
      userEnteredFormat: { backgroundColor },
    },
    fields: 'userEnteredFormat.backgroundColor',
  },
});

/**
 * Constructs a payload to apply background colors to the header and footer rows
 * and all rows above the header of a Google Sheet. It assumes a specific number of columns
 * based on the header row length.
 *
 * @param {number} sheetId - The ID of the sheet to be updated.
 * @param {Object} fullDailyPayload - The data object containing the header and body payload,
 *                                    used to determine row indices and column lengths.
 * @returns {Object} A payload object for the batch update request to format the sheet cells.
 * @example
 * const colorStylesPayload = buildColorStylesPayload(12345, fullDailyPayload);
 * // This call creates a payload to apply background colors to the header and
 * // all preceding rows in the sheet with ID 12345.
 */
export const buildColorStylesPayload = (sheetId, fullDailyPayload) => {
  // Define colors
  const lightGrey = { red: 0.9, green: 0.9, blue: 0.9 }; // Light grey color (e.g., #D9D9D9)
  const darkGrey = { red: 0.75, green: 0.75, blue: 0.75 }; // Dark grey color (e.g., #A9A9A9)

  const headerRowIndex = findHeaderRowIndex(fullDailyPayload.headerPayload);
  const headerRow = fullDailyPayload.headerPayload[headerRowIndex - 1];
  const footerRowIndex =
    fullDailyPayload.bodyPayload.length + fullDailyPayload.headerPayload.length;
  const requests = [
    // Apply light grey color to all cells above the header row
    createRepeatCellRequest(
      sheetId,
      0,
      headerRowIndex,
      headerRow.length,
      lightGrey
    ),
    // Apply dark grey color to the header row
    createRepeatCellRequest(
      sheetId,
      headerRowIndex - 1,
      headerRowIndex,
      headerRow.length,
      darkGrey
    ),
    // Apply dark grey color to the header row
    createRepeatCellRequest(
      sheetId,
      footerRowIndex,
      footerRowIndex + 1,
      headerRow.length,
      darkGrey
    ),
  ];

  return { requests };
};

/**
 * Builds a payload for a batch update to set the row heights for a specified range in a Google Sheet.
 * The function determines the range based on the provided data structure.
 *
 * @param {number} sheetId - The ID of the Google Sheet to update.
 * @param {Object} fullDailyPayload - An object containing the daily payload data which includes
 *                                    header and body information to calculate row indices.
 * @returns {Object} A payload object structured for the Google Sheets API batchUpdate method,
 *                   which includes the request for updating row heights.
 */
export const buildRowHeightPayload = (sheetId, fullDailyPayload) => {
  const pixelSize = 27; // The desired height in pixels for the rows.
  // Calculate the starting and ending indices for the rows to adjust.
  const headerRowIndex = findHeaderRowIndex(fullDailyPayload.headerPayload);
  const totalRows =
    fullDailyPayload.bodyPayload.length + fullDailyPayload.headerPayload.length;

  // Create a request to update the row heights starting from the row after the header and
  // including all the body rows.
  const requests = [
    {
      updateDimensionProperties: {
        range: {
          sheetId: sheetId,
          dimension: 'ROWS',
          startIndex: headerRowIndex,
          endIndex: headerRowIndex + totalRows,
        },
        properties: {
          pixelSize: pixelSize, // Set each row to the specified height.
        },
        fields: 'pixelSize', // Specify that only the pixelSize property should be updated.
      },
    },
  ];

  return { requests }; // Return the constructed payload.
};

export const BuildTextStyles = async (sheetId, fullDailyPayload) => {
  const headerRowIndex = findHeaderRowIndex(fullDailyPayload.headerPayload);
  const headerRow = fullDailyPayload.headerPayload[headerRowIndex - 1];
  const footerRowIndex =
    fullDailyPayload.bodyPayload.length + fullDailyPayload.headerPayload.length;
  // Define the format for the header row
  const headerAndFooterRowFormat = {
    userEnteredFormat: {
      textFormat: { bold: true, fontSize: 12 },
    },
  };

  // Define the format for other rows
  const otherRowFormat = {
    userEnteredFormat: {
      textFormat: { bold: true, fontSize: 10 },
    },
  };

  const requests = [
    {
      // Apply bold and fontSize 12 to header row
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: headerRowIndex - 1, // Zero-based index; if headerRowIndex is 1, then it's correct
          endRowIndex: headerRowIndex, // This applies the format to only the header row
          endColumnIndex: headerRow.length, // The length of columns in the header
        },
        cell: headerAndFooterRowFormat,
        fields: 'userEnteredFormat.textFormat',
      },
    },
    {
      // Apply bold and fontSize 12 to header row
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: footerRowIndex, // Zero-based index; if headerRowIndex is 1, then it's correct
          endRowIndex: footerRowIndex + 1, // This applies the format to only the header row
          endColumnIndex: headerRow.length, // The length of columns in the header
        },
        cell: headerAndFooterRowFormat,
        fields: 'userEnteredFormat.textFormat',
      },
    },
    {
      // Apply bold and fontSize 10 to other rows
      repeatCell: {
        range: {
          sheetId: sheetId,
          endRowIndex: headerRowIndex - 1, // Until the end of the data
          endColumnIndex: headerRow.length, // Assuming the body has the same length as the header
        },
        cell: otherRowFormat,
        fields: 'userEnteredFormat.textFormat',
      },
    },
  ];

  return { requests };
};

export const setTextWrappingToClip = async (sheetId, fullDailyPayload) => {
  const headerRowIndex = findHeaderRowIndex(fullDailyPayload.headerPayload);
  const headerRow = fullDailyPayload.headerPayload[headerRowIndex - 1];

  const requests = [
    {
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: headerRowIndex,
          endRowIndex:
            fullDailyPayload.bodyPayload.length +
            fullDailyPayload.headerPayload.length,
          endColumnIndex: headerRow.length, // Replace with the actual number of columns
        },
        cell: {
          userEnteredFormat: {
            wrapStrategy: 'CLIP',
          },
        },
        fields: 'userEnteredFormat.wrapStrategy',
      },
    },
  ];

  return { requests };
};

export const createTextAlignmentPayload = async (sheetId, fullDailyPayload) => {
  const headerRowIndex = findHeaderRowIndex(fullDailyPayload.headerPayload);
  const headerRow = fullDailyPayload.headerPayload[headerRowIndex - 1];
  const footerRowIndex =
    fullDailyPayload.bodyPayload.length + fullDailyPayload.headerPayload.length;
  const testNameTargetIndex = headerRow.indexOf('test name');
  const specTargetIndex = headerRow.indexOf('spec');
  const typeTargetIndex = headerRow.indexOf('type');
  const teamTargetIndex = headerRow.indexOf('team');
  const stateTargetIndex = headerRow.indexOf('state');

  const requests = [
    {
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: headerRowIndex,
          endRowIndex:
            fullDailyPayload.bodyPayload.length +
            fullDailyPayload.headerPayload.length,
          startColumnIndex: testNameTargetIndex,
          endColumnIndex: testNameTargetIndex + 1, // Replace with the actual number of columns you want to format
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'RIGHT',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: sheetId,
          endRowIndex: headerRowIndex,
          startColumnIndex: specTargetIndex,
          endColumnIndex: specTargetIndex + 1, // Replace with the actual number of columns you want to format
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'LEFT',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: sheetId,
          endRowIndex: headerRowIndex,
          startColumnIndex: typeTargetIndex,
          endColumnIndex: typeTargetIndex + 1, // Replace with the actual number of columns you want to format
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'LEFT',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: sheetId,
          endRowIndex: headerRowIndex,
          startColumnIndex: stateTargetIndex,
          endColumnIndex: stateTargetIndex + 1, // Replace with the actual number of columns you want to format
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: headerRowIndex - 1,
          endRowIndex: headerRowIndex,
          endColumnIndex: headerRow.length, // Replace with the actual number of columns you want to format
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: headerRowIndex,
          endRowIndex:
            fullDailyPayload.bodyPayload.length +
            fullDailyPayload.headerPayload.length,
          startColumnIndex: typeTargetIndex,
          endColumnIndex: typeTargetIndex + 1, // Replace with the actual number of columns you want to format
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: footerRowIndex,
          endRowIndex: footerRowIndex + 1,
          endColumnIndex: headerRow.length, // Replace with the actual number of columns you want to format
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: sheetId,
          endRowIndex: headerRowIndex - 1,
          startColumnIndex: teamTargetIndex,
          endColumnIndex: teamTargetIndex + 1, // Replace with the actual number of columns you want to format
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'LEFT',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    },
    {
      // Vertical alignment to the middle
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: headerRowIndex,
          endRowIndex:
            fullDailyPayload.bodyPayload.length +
            fullDailyPayload.headerPayload.length,
          // startColumnIndex: verticalRange.startColumnIndex,
          endColumnIndex: specTargetIndex + 1,
        },
        cell: {
          userEnteredFormat: {
            verticalAlignment: 'TOP',
          },
        },
        fields: 'userEnteredFormat.verticalAlignment',
      },
    },
  ];

  return { requests };
};

export const setColumnWidths = async (sheetId, fullDailyPayload) => {
  const headerRowIndex = findHeaderRowIndex(fullDailyPayload.headerPayload);
  const headerRow = fullDailyPayload.headerPayload[headerRowIndex - 1];
  const testNameTargetIndex = headerRow.indexOf('test name');
  const categoryTargetIndex = headerRow.indexOf('category');
  const statusTargetIndex = headerRow.indexOf('status');
  const typeTargetIndex = headerRow.indexOf('type');
  const teamTargetIndex = headerRow.indexOf('team');

  const columnWidths = [
    // { startIndex: areaTargetIndex, endIndex: areaTargetIndex + 1, width: 200 }, // Column A
    {
      // startIndex: testNameTargetIndex,
      endIndex: testNameTargetIndex + 1,
      width: 180,
    }, // Column B
    {
      startIndex: categoryTargetIndex,
      endIndex: categoryTargetIndex + 1,
      width: 160,
    }, // Column B
    {
      startIndex: statusTargetIndex,
      endIndex: statusTargetIndex + 1,
      width: 160,
    }, // Column B
    {
      startIndex: typeTargetIndex,
      endIndex: typeTargetIndex + 1,
      width: 120,
    }, // Column B
    {
      startIndex: teamTargetIndex,
      endIndex: teamTargetIndex + 1,
      width: 120,
    }, // Column B
  ];
  const requests = columnWidths.map((columnWidth) => ({
    updateDimensionProperties: {
      range: {
        sheetId: sheetId,
        dimension: 'COLUMNS', // Use 'ROWS' for row heights
        startIndex: columnWidth.startIndex, // Index of the first column to update
        endIndex: columnWidth.endIndex, // Index of the last column to update + 1
      },
      properties: {
        pixelSize: columnWidth.width, // Desired width in pixels
      },
      fields: 'pixelSize',
    },
  }));

  return { requests };
};
