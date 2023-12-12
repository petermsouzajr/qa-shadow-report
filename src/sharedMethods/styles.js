import { batchUpdateMasterSheet } from '../google/googleSheetIntegration/writeToSheet.js';
import { findHeaderRowIndex } from '../monthlySummaryMethods/summaryGenerationHelpers.js';
import {
  solidBlackWidthOne,
  solidBlackWidthTwo,
} from '../monthlySummaryMethods/summaryStyles.js';

/**
 * Creates a grid style for a specific tab with defined borders.
 *
 * @param {number} tabId - The ID of the target tab.
 * @param {number} startColumn - The starting column index.
 * @param {number} endColumn - The ending column index.
 * @returns {Object} - An object containing the border styles and range to apply them.
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
 * Adds the created grid style payload to the summary payload.
 *
 * The grid style is used to apply visual styling to the data grid for clarity
 * and aesthetics. This can include border styles, colors, and other formatting.
 *
 * @param {number} tabId - The unique ID of the sheet/tab.
 * @param {number} startColumn - The starting column index for the style.
 * @param {number} endColumn - The ending column index for the style.
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
 * Creates a payload for a batch update to apply conditional formatting.
 *
 * @param {number} sheetId - The ID of the sheet to apply formatting to.
 * @param {number} startRow - The starting row index for the formatting range.
 * @param {number} endRow - The ending row index for the formatting range.
 * @param {number} startColumn - The starting column index for the formatting range.
 * @param {number} endColumn - The ending column index for the formatting range.
 * @param {string} formula - The custom formula to evaluate for formatting.
 * @param {Object} color - The background color to apply if the condition is true.
 * @returns {Object} The request payload for the batch update.
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
  const failedFormula = `=IF(I6:I107="failed",true)`;
  const passedFormula = `=IF(I6:I107="passed",true)`;
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
 * Freezes rows in a Google Sheet up to a specified row index.
 * @param {number} sheetId - The ID of the sheet to update.
 * @param {number} freezeTillRow - The number of rows to freeze.
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @param {Object} auth - The authentication object for the Google Sheets API.
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
 * Builds a payload for applying background colors to the first few rows of a Google Sheet.
 * @param {number} sheetId - The ID of the sheet to update.
 * @param {number} headerRowIndex - The index of the header row, to apply the dark grey color.
 * @returns {Object} The payload for the batch update.
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
    {
      // Apply light grey color to all cells above the header row
      repeatCell: {
        range: {
          sheetId: sheetId,
          endRowIndex: headerRowIndex, // Apply to all rows up to the header row
          endColumnIndex: headerRow.length, // Assuming there are 12 columns as per your image
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: lightGrey,
          },
        },
        fields: 'userEnteredFormat.backgroundColor',
      },
    },
    {
      // Apply dark grey color to the header row
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: headerRowIndex - 1,
          endRowIndex: headerRowIndex, // Apply only to the header row
          startColumnIndex: 0,
          endColumnIndex: headerRow.length, // Assuming there are 12 columns as per your image
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: darkGrey,
          },
        },
        fields: 'userEnteredFormat.backgroundColor',
      },
    },
    {
      // Apply dark grey color to the header row
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: footerRowIndex,
          endRowIndex: footerRowIndex + 1, // Apply only to the header row
          startColumnIndex: 0,
          endColumnIndex: headerRow.length, // Assuming there are 12 columns as per your image
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: darkGrey,
          },
        },
        fields: 'userEnteredFormat.backgroundColor',
      },
    },
  ];

  return { requests };
};

/**
 * Builds a payload for setting the row heights in a Google Sheet.
 * @param {number} sheetId - The ID of the sheet to update.
 * @param {number} startRowIndex - The starting index of the rows to adjust.
 * @param {number} endRowIndex - The ending index of the rows to adjust (exclusive).
 * @param {number} pixelSize - The height of the rows in pixels.
 * @returns {Object} The payload for the batch update.
 */
export const buildRowHeightPayload = (sheetId, fullDailyPayload) => {
  const pixelSize = 27;
  const headerRowIndex = findHeaderRowIndex(fullDailyPayload.headerPayload);

  const requests = [
    {
      updateDimensionProperties: {
        range: {
          sheetId: sheetId,
          dimension: 'ROWS',
          startIndex: headerRowIndex - 1,
          endIndex:
            fullDailyPayload.bodyPayload.length +
            fullDailyPayload.headerPayload.length,
        },
        properties: {
          pixelSize: pixelSize,
        },
        fields: 'pixelSize',
      },
    },
  ];

  return { requests };
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
      // startIndex: testNameTargetIndex,
      endIndex: typeTargetIndex + 1,
      width: 120,
    }, // Column B
    {
      // startIndex: testNameTargetIndex,
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
