// Utility functions imports
import { formatDuration } from '../sharedMethods/dateFormatting.js';
import { numberToLetter } from '../sharedMethods/dataHandler.js';

// Data extraction and reporting imports
import * as dataExtraction from './extraction/dataExtractionUtilities.js';
import * as reportGeneration from './reportGenerationHelpers.js';

// Shared methods imports
import { enforceMaxLength } from '../sharedMethods/cellMaxLength.js';
import { sortPayload } from './processing/sortDailyReportRows.js';
import { findHeaderRowIndex } from '../monthlySummaryMethods/summaryGenerationHelpers.js';

// Configuration and constants imports
import * as constants from '../../constants.js';
import { getKeysPattern } from './reportGenerationHelpers.js';
import { initializeDailyPayload } from './initialization/initializeDailyPayload.js';
import { processTestSuites } from './processing/processTestSuites.js';

/**
 * Constructs a single report payload entry based on the test result and details.
 * @param {Object} result - The test result data.
 * @param {Object} test - The detailed test information.
 * @param {Boolean} playwright - A boolean indicating if the test is in playwright format.
 * @returns {Promise<Object>} A promise that resolves to the constructed payload entry.
 */
export const constructReportPayloadEntry = async (result, test, playwright) => {
  const typesAvailable = constants.TEST_TYPES_AVAILABLE();
  const categoriesAvailable = constants.TEST_CATEGORIES_AVAILABLE();
  const allTeamNames = constants.ALL_TEAM_NAMES();

  try {
    const area = playwright
      ? test.projectName
      : await dataExtraction.extractAreaFromFullFile(
          result.fullFile,
          typesAvailable
        );

    const spec = await dataExtraction.extractSpecFromFullFile(result.fullFile);
    const type = await dataExtraction.extractTypeFromFullFile(
      result.fullFile,
      typesAvailable
    );
    const speed = await formatDuration(test.duration);
    const manualTestId =
      await dataExtraction.extractManualTestCaseIdFromTest(test);
    const teamName = await dataExtraction.extractTeamNameFromTest(
      test,
      allTeamNames
    );
    const category = await dataExtraction.extractCategoryFromTest(
      test,
      categoriesAvailable
    );
    const testName = await dataExtraction.extractTestNameFromFullTitle(
      test.fullTitle
    );

    const errorMessage = playwright ? test.err : test.err?.message;

    let payloadEntry = {
      area,
      spec,
      testName,
      type,
      category,
      team: teamName,
      priority: '',
      status: '',
      state: test.state,
      manualTestId,
      error: errorMessage || '',
      speed,
    };

    // Enforce a maximum length for each cell in the payload entry
    Object.keys(payloadEntry).forEach((key) => {
      payloadEntry[key] = enforceMaxLength(payloadEntry[key], 500);
    });

    return payloadEntry;
  } catch (error) {
    console.error('Error constructing report payload entry:', error);
    throw error;
  }
};

/**
 * Asynchronously appends state reports to the header payload based on metrics.
 * @param {Array<Array<string>>} headerPayload - The header payload to which the state reports are appended.
 * @param {Array<string>} defaultHeaderMetrics - An array of metric names to generate reports for.
 * @param {Boolean} playwright - A boolean indicating if the test is in playwright format.
 * @throws {Error} Throws error if report generation fails.
 */
export const appendStateReportsToHeader = (
  headerPayload,
  defaultHeaderMetrics,
  playwright
) => {
  const columnsAvailable = constants.COLUMNS_AVAILABLE(playwright);

  try {
    // If headerPayload is empty, initialize it with defaultHeaderMetrics structure
    if (headerPayload.length === 0 && defaultHeaderMetrics.length > 0) {
      // Create a new array with the length of defaultHeaderMetrics and fill it with empty strings
      headerPayload.push(new Array(defaultHeaderMetrics.length).fill(''));
    }

    // Ensure headerPayload has the same length as defaultHeaderMetrics
    while (headerPayload.length < defaultHeaderMetrics.length) {
      // If headerPayload is shorter, add empty sub-arrays to match the length
      headerPayload.push(new Array(headerPayload[0].length).fill(''));
    }

    for (let i = 0; i < defaultHeaderMetrics.length; i++) {
      const newReport = reportGeneration.generateStateReports(
        defaultHeaderMetrics,
        i
      );

      if (!Array.isArray(newReport) || !newReport[i]) {
        throw new Error(
          `New report at index ${i} is not defined or not an array.`
        );
      }

      // Ensure the header payload at index i is an array to push to
      if (!Array.isArray(headerPayload[i])) {
        throw new Error(
          `Header payload at index ${i} is undefined or not an array.`
        );
      }

      while (headerPayload[i].length < columnsAvailable.indexOf('state') - 1) {
        // If headerPayload is shorter, add empty sub-arrays to match the length
        headerPayload[i].push('');
      }
      // headerPayload[i].push(''); // Append an empty string for spacing if needed
      headerPayload[i].push(...newReport[i]); // Append the new report for the metric at index i
    }
  } catch (error) {
    console.error('Error appending state reports to header:', error);
    throw error;
  }
};

/**
 * Asynchronously extracts, arranges, and manipulates data set into structured format.
 * @param {Object} dataSet The raw data set to manipulate.
 * @param {Boolean} playwright - A boolean indicating if the test is in playwright format.
 * @returns {Promise<Object>} A promise resolving with structured data object.
 */
export const buildDailyPayload = async (dataSet, playwright) => {
  try {
    const columnsAvailable = constants.COLUMNS_AVAILABLE(playwright);

    // Initialize the structure for daily payload
    let fullDailyPayload = initializeDailyPayload();

    // Process test suites to construct payload entries
    const payloadEntries = await processTestSuites(dataSet, playwright);
    fullDailyPayload.bodyPayload = payloadEntries;

    // Sort the structured data
    sortPayload(fullDailyPayload);

    // Map object values to body payload
    fullDailyPayload.bodyPayload = fullDailyPayload.bodyPayload.map(
      Object.values
    );

    // Construct and assign report headers
    fullDailyPayload.headerPayload = await constructHeaderReport(
      fullDailyPayload.bodyPayload
    );

    // Append state reports to the header payload
    appendStateReportsToHeader(
      fullDailyPayload.headerPayload,
      constants.DEFAULT_HEADER_METRICS,
      playwright
    );

    // Append available columns and save to configuration
    fullDailyPayload.headerPayload.push(columnsAvailable);

    // appends the end row to the footer payload
    const headerRowIndex = findHeaderRowIndex(fullDailyPayload.headerPayload);
    const headerRow = fullDailyPayload.headerPayload[headerRowIndex - 1];
    const statusTargetIndex = headerRow.indexOf('state');
    let footerArray = new Array(statusTargetIndex)
      .fill('')
      .concat(constants.FOOTER_ROW);

    fullDailyPayload.footerPayload.push(footerArray);

    return fullDailyPayload;
  } catch (error) {
    console.error('Error building daily payload:', error);
    throw error; // Rethrow to allow further error handling from the caller
  }
};

/**
 * Asynchronously constructs a header report from the given payload.
 * @param {Array<Array<string>>} payload - The payload data to construct the report from.
 * @returns {Promise<Array<Array<string>>>} A promise that resolves with the constructed report as a 2D string array.
 * @throws {Error} Throws an error if report generation fails.
 */
export const constructHeaderReport = async (payload) => {
  const typesAvailable = constants.TEST_TYPES_AVAILABLE();
  const categoriesAvailable = constants.TEST_CATEGORIES_AVAILABLE();
  const teamNames = constants.ALL_TEAM_NAMES();

  try {
    // Define the structure for the types to be reported
    const typeArrays = [
      { types: typesAvailable, index: 3 },
      { types: categoriesAvailable, index: 4 },
      { types: teamNames, index: 5 },
    ];

    // Initialize an array to store all report entries
    const allReportEntries = [];

    // Loop through each type structure to generate report entries
    for (const typeData of typeArrays) {
      const reportEntry = await reportGeneration.generateReport(
        typeData.types,
        payload,
        typeData.index,
        typeData.index === 5 // Some additional condition based on index
      );
      allReportEntries.push(reportEntry);
    }

    // Calculate the maximum number of types across all categories
    const maxTypes = Math.max(...typeArrays.map((t) => t.types.length));

    // Generate placeholders for the report
    const placeholders = reportGeneration.generatePlaceholders(maxTypes);

    // Combine all report entries and placeholders into one report
    return combineReports(allReportEntries, placeholders);
  } catch (error) {
    console.error('Error constructing header report:', error);
    throw new Error('Failed to construct header report');
  }
};

/**
 * Merges multiple reports into a single combined report. Each report consists
 * of pairs of entries, representing test metrics for types. This function merges rows
 * based on their index in respective reports, using placeholder data for missing entries.
 * @param {Array<Array<Array<string>>>} allReportEntries - An array of report entries to be combined.
 * @param {Array<Array<string>>} placeholders - Placeholder data for missing report entries.
 * @returns {Array<Array<string>>} A combined report with merged entries.
 */
export const combineReports = (allReportEntries, placeholders) => {
  if (!Array.isArray(allReportEntries) || !Array.isArray(placeholders)) {
    throw new Error(
      'Invalid input: Expected both allReportEntries and placeholders to be arrays.'
    );
  }

  let combinedReports = [];

  // Determine the maximum count of type entries across all reports
  const maxTypeCount = Math.max(
    ...allReportEntries.map((report) => report.length / 2)
  );

  // Iterate over each type count index
  for (let i = 0; i < maxTypeCount; i++) {
    let combinedRowTests = [];
    let combinedRowPassed = [];

    allReportEntries.forEach((report) => {
      // Push entries or placeholders for tests and passed metrics
      combinedRowTests.push(...(report[2 * i] || placeholders[0]));
      combinedRowPassed.push(...(report[2 * i + 1] || placeholders[1]));
    });

    // Add the combined rows to the main array
    combinedReports.push(combinedRowTests, combinedRowPassed);
  }

  return combinedReports;
};

/**
 * Applies formulas to the header payload based on the provided patterns.
 * @param {Array<Array<string>>} headerPayload - The header payload to apply formulas to.
 * @param {number} headerRowIndex - The index of the header row.
 * @param {number} totalNumberOfRows - The total number of rows including headers and body.
 * @param {number} bodyRowCount - The count of body rows.
 * @param {Boolean} playwright - A boolean indicating if the test is in playwright format.
 */
export const processHeaderWithFormulas = (
  headerPayload,
  headerRowIndex,
  totalNumberOfRows,
  bodyRowCount,
  playwright
) => {
  try {
    const columnsAvailable = constants.COLUMNS_AVAILABLE(playwright);

    const stateColumn = numberToLetter(columnsAvailable.indexOf('state'));
    const regexPattern = reportGeneration.constructHeaderRegex(getKeysPattern);
    headerPayload.forEach((subArray, rowIndex) => {
      subArray.forEach((str, colIndex) => {
        const match = str.match(regexPattern);
        if (match) {
          const subjectColumn = reportGeneration.determineSubjectColumn(
            match[1],
            columnsAvailable,
            numberToLetter
          );
          const formulas = getFormulas(
            match[1],
            headerRowIndex,
            totalNumberOfRows,
            bodyRowCount,
            subjectColumn,
            stateColumn
          );

          const formulaKey = match[2];
          if (formulas && formulaKey in formulas) {
            headerPayload[rowIndex][colIndex] = formulas[formulaKey];
          } else {
            throw new Error(`No formula found for key: ${formulaKey}`);
          }
        }
      });
    });
  } catch (error) {
    console.error('Error processing header with formulas:', error);
    throw error; // Rethrow the error to ensure the caller is aware of it.
  }
};

/**
 * Retrieves the formulas for a given type and subject.
 * @param {string} type - The type for which formulas are built.
 * @param {number} headerRowIndex - The index of the header row.
 * @param {number} totalNumberOfRows - The total number of rows.
 * @param {number} bodyRowCount - The number of body rows.
 * @param {string} subjectColumn - The subject column letter.
 * @param {string} stateColumn - The state column letter.
 * @returns {Object} The formulas object.
 */
const getFormulas = (
  type,
  headerRowIndex,
  totalNumberOfRows,
  bodyRowCount,
  subjectColumn,
  stateColumn
) => {
  return reportGeneration.buildFormulas(
    type,
    headerRowIndex,
    totalNumberOfRows,
    bodyRowCount,
    subjectColumn,
    stateColumn
  );
};
