import * as constants from '../../constants.js';
import { numberToLetter } from '../sharedMethods/dataHandler.js';

/**
 * Generates placeholder entries for report construction.
 *
 * @param {number} count - Number of placeholders needed. Must be a non-negative integer.
 * @returns {string[][]} - A 2D array containing placeholders.
 * @throws {TypeError} If the count is not a number or a negative number.
 */
export const generatePlaceholders = (count) => {
  if (typeof count !== 'number' || count < 0 || !Number.isInteger(count)) {
    throw new TypeError('The count must be a non-negative integer.');
  }

  return new Array(count).fill(['', '']);
};

/**
 * Creates and returns a report entry consisting of a title and a formula.
 *
 * @param {string} title - The title for the report entry.
 * @param {string} formula - The formula for the report entry.
 * @returns {Array<string>} - An array consisting of the title and formula.
 * @throws {TypeError} If either title or formula is not a string.
 */
export const generateReportEntry = (title, formula) => {
  if (typeof title !== 'string') {
    throw new TypeError('Title must be a string.');
  }
  if (typeof formula !== 'string') {
    throw new TypeError('Formula must be a string.');
  }

  return [title, formula];
};

/**
 * Iterates through metrics headers and generates a report entry for each.
 * Adjustments might be required for compatibility with Excel/Google Sheets formulas.
 *
 * @param {Array<string>} defaultHeaderMetrics - The array of header metric strings.
 * @param {number} index - The index of the type within the defaultHeaderMetrics array.
 * @returns {Array<Array<string>>} - An array of report entry arrays.
 * @throws {TypeError} If headerMetrics is not an array or type is not a string.
 * @throws {RangeError} If the type is not found within headerMetrics.
 */
export const generateStateReports = (defaultHeaderMetrics, index) => {
  if (!Array.isArray(defaultHeaderMetrics)) {
    throw new TypeError('headerMetrics must be an array of strings.');
  }
  const type = defaultHeaderMetrics[index].slice(2).replace(' tests', '');
  if (typeof type !== 'string') {
    throw new TypeError('Type must be a string.');
  }
  const reports = defaultHeaderMetrics.map((metric) => {
    const adjustedMetric = metric.replace('# ', '');
    let formula;

    switch (type) {
    case 'skipped/pending':
      formula = `${adjustedMetric} formula skipped/pending`;
      break;
    case 'total':
      formula = `${adjustedMetric} formula total`;
      break;
    default:
      formula = `${type} formula base`;
    }

    return [`# ${adjustedMetric}`, formula];
  });

  // Check if the type is valid (assuming valid types are represented in defaultHeaderMetrics)
  const isValidType = defaultHeaderMetrics.some((metric) =>
    metric.includes(type)
  );
  if (!isValidType) {
    throw new RangeError(`Type '${type}' is not represented in headerMetrics.`);
  }

  return reports;
};

/**
 * Generates a report entry that contains metrics about passed tests for a team.
 *
 * @param {string} type - The type of test or team name.
 * @returns {Array<string>} - A report entry array.
 * @throws {TypeError} If the type is not a string or is empty.
 */
export const generateTeamReport = (type) => {
  if (typeof type !== 'string' || type.trim() === '') {
    throw new TypeError('Type must be a non-empty string.');
  }

  const title = `# ${type} tests passed`;
  const formula = `${type} formula tests passed`;

  return generateReportEntry(title, formula);
};

/**
 * Generates two report entries that contain metrics about total and passed tests.
 *
 * @param {string} type - The type of test.
 * @returns {Array<Array<string>>} - An array of report entry arrays.
 * @throws {TypeError} If the type is not a string or is empty.
 */
export const generateTypeReport = (type) => {
  if (typeof type !== 'string' || type.trim() === '') {
    throw new TypeError('Type must be a non-empty string.');
  }

  const passedTestsTitle = `# ${type} tests passed`;
  const passedTestsFormula = `${type} formula tests passed`;
  const passedTests = generateReportEntry(passedTestsTitle, passedTestsFormula);

  return [passedTests];
};

/**
 * Asynchronously generates and returns a report from the payload based on types.
 *
 * @param {string[]} types - An array of type strings to generate the report.
 * @param {any[]} payload - The data payload to generate the report from.
 * @param {number} searchIndex - Index at which to search for types in the payload.
 * @param {boolean} [isTeam=false] - Flag to indicate if the current report is for a team.
 * @returns {Promise<string[][]>} - A report in the form of a 2D string array.
 * @throws {Error} If inputs do not meet required conditions.
 */
export const generateReport = (types, payload, searchIndex, isTeam = false) => {
  if (!Array.isArray(types)) {
    throw new Error('Types must be an array of strings.');
  }
  if (!Array.isArray(payload)) {
    throw new Error('Payload must be an array.');
  }
  if (typeof searchIndex !== 'number' || searchIndex < 0) {
    throw new Error('SearchIndex must be a positive integer.');
  }

  const report = [];

  for (const type of types) {
    const typeOccurrences = payload.filter(
      (item) => item[searchIndex] && item[searchIndex].includes(type)
    ).length;

    if (typeOccurrences > 0) {
      const reportEntries = isTeam
        ? [generateTeamReport(type)]
        : generateTypeReport(type);

      report.push(...reportEntries);
    }
  }

  return Promise.resolve(report);
};

/**
 * A function that builds specific formulas based on the input type,
 * header row index, total number of rows, the number of body rows, and column references.
 *
 * @function buildFormulas
 * @param {string} type - Type used in formula placeholders.
 * @param {number} headerRowIndex - Index of the header row.
 * @param {number} totalNumberOfRows - Total number of rows including header.
 * @param {number} bodyRowCount - Count of the body rows, excluding header.
 * @param {string} subjectColumn - Column letter(s) of the subject data.
 * @param {string} stateColumn - Column letter(s) of the state data.
 * @returns {Object} An object containing formulas as key-value pairs.
 * @throws {Error} If arguments do not meet the required conditions.
 */

export const buildFormulas = (
  type,
  headerRowIndex,
  totalNumberOfRows,
  bodyRowCount,
  subjectColumn,
  stateColumn
) => {
  if (typeof type !== 'string') {
    throw new Error('Type must be a string.');
  }
  if (!Number.isInteger(headerRowIndex) || headerRowIndex <= 0) {
    throw new Error('Header row index must be a positive integer.');
  }
  if (
    !Number.isInteger(totalNumberOfRows) ||
    totalNumberOfRows <= headerRowIndex
  ) {
    throw new Error(
      'Total number of rows must be an integer greater than header row index.'
    );
  }
  if (!Number.isInteger(bodyRowCount) || bodyRowCount <= 0) {
    throw new Error('Body row count must be a positive integer.');
  }
  if (typeof subjectColumn !== 'string' || !subjectColumn) {
    throw new Error('Subject column must be a non-empty string.');
  }
  if (typeof stateColumn !== 'string' || !stateColumn) {
    throw new Error('State column must be a non-empty string.');
  }

  // Function to replace placeholders with actual values
  const fillTemplate = (template) =>
    template
      .replace(/{type}/g, type)
      .replace(/{headerRowIndex}/g, headerRowIndex)
      .replace(/{totalNumberOfRows}/g, totalNumberOfRows)
      .replace(/{bodyRowCount}/g, bodyRowCount)
      .replace(/{subjectColumn}/g, subjectColumn)
      .replace(/{stateColumn}/g, stateColumn);

  const templates = constants.FORMULA_TEMPLATES;
  const keys = constants.FORMULA_KEYS;
  // Generate actual formula strings by filling in the templates
  const filledFormulas = templates.map(fillTemplate);

  const combinedObject = keys.reduce((obj, key, index) => {
    obj[key] = filledFormulas[index];
    return obj;
  }, {});
  return combinedObject;
};

/**
 * Helper function to create a regex pattern from an array of formula keys.
 * @returns {RegExp} A RegExp to match formula keys in a string.
 */
export const constructHeaderRegex = () => {
  const keysPattern = getKeysPattern();
  return new RegExp(`(.+) (${keysPattern})$`);
};

/**
 * Determines the column letter based on a descriptive type.
 * @param {string} type - The type of the column to determine.
 * @returns {string} The letter representing the column in a spreadsheet.
 */
export const determineSubjectColumn = (type) => {
  const columnsAvailable = constants.COLUMNS_AVAILABLE();
  const targetsAvailable = constants.TEST_TARGETS_AVAILABLE();
  const purposesAvailable = constants.TEST_PURPOSES_AVAILABLE();
  if (purposesAvailable.includes(type)) {
    return numberToLetter(columnsAvailable.indexOf('category'));
  } else if (targetsAvailable.includes(type)) {
    return numberToLetter(columnsAvailable.indexOf('type'));
  }
  return numberToLetter(columnsAvailable.indexOf('team'));
};

/**
 * Joins formula keys into a regex pattern for matching in strings.
 * @returns {string} A string pattern to use in regex matching.
 */
export const getKeysPattern = () => {
  return constants.FORMULA_KEYS.map((key) => `(${key})`).join('|');
};

/**
 * Creates a payload for batch updating merges in Google Sheets.
 * Assumes that the array is the data of a Google Sheet starting from the first row and first column.
 * @param {Array<Array<string>>} data - The 2D array representing the sheet data.
 * @param {number} headerRowIndex - The index of the header row in the sheet.
 * @param {number} sheetId - The ID of the sheet where merges are to be applied.
 * @returns {Object} An object representing the payload for a batch update request to the Google Sheets API.
 */
export const createMergeQueries = (data, headerRowIndex, sheetId) => {
  // Helper function to create a single merge query object
  const createMergeQuery = (start, end, startColumn, endColumn) => {
    return {
      sheetId,
      startRowIndex: start,
      endRowIndex: end,
      startColumnIndex: startColumn,
      endColumnIndex: endColumn,
    };
  };

  // Processes merges for a single column
  const processColumn = (columnIndex) => {
    const merges = [];
    let startMergeIndex = headerRowIndex;
    for (let i = 0; i < data.length; i++) {
      const isLastRow = i === data.length - 1;
      const isDifferent =
        !isLastRow && data[i][columnIndex] !== data[i + 1][columnIndex];
      if (isLastRow || isDifferent) {
        if (startMergeIndex < headerRowIndex + i) {
          merges.push(
            createMergeQuery(
              startMergeIndex,
              headerRowIndex + i + 1,
              columnIndex,
              columnIndex + 1
            )
          );
        }
        startMergeIndex = headerRowIndex + i + 1;
      }
    }
    return merges;
  };

  // Combine merge queries for both columns
  const merges = [...processColumn(0), ...processColumn(1)];

  // Construct the requestBody for the batch update
  const requestBody = {
    requests: merges.map((merge) => ({
      mergeCells: {
        range: merge,
        mergeType: 'MERGE_ALL',
      },
    })),
  };

  return requestBody;
};
