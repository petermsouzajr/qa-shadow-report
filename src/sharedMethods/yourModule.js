/**
 * Sends the summary body to the sheet.
 * @param {Array<Array<string>>} body - The summary body data.
 * @returns {Object} The summary body payload.
 */
export const sendSummaryBody = (body) => {
  return {
    values: body,
  };
};

/**
 * Adds columns and rows to the sheet.
 * @param {number} columns - The number of columns to add.
 * @param {number} rows - The number of rows to add.
 * @returns {Array<Object>} The column and row update requests.
 */
export const addColumnsAndRows = (columns, rows) => {
  const requests = [];

  if (columns > 0) {
    requests.push({
      insertDimension: {
        range: {
          sheetId: 0,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: columns,
        },
      },
    });
  }

  if (rows > 0) {
    requests.push({
      insertDimension: {
        range: {
          sheetId: 0,
          dimension: 'ROWS',
          startIndex: 0,
          endIndex: rows,
        },
      },
    });
  }

  return requests;
};

/**
 * Sends the summary headers to the sheet.
 * @param {Array<Array<string>>} headers - The summary headers.
 * @returns {Object} The summary headers payload.
 */
export const sendSummaryHeaders = (headers) => {
  return {
    values: headers,
  };
};

/**
 * Applies styling to the summary header.
 * @param {Object} range - The range to style.
 * @returns {Object} The header styling payload.
 */
export const summaryHeaderStyling = (range) => {
  return {
    requests: [
      {
        repeatCell: {
          range,
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 },
              textFormat: {
                bold: true,
              },
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)',
        },
      },
    ],
  };
};
