import {
  COLUMNS_AVAILABLE,
  DEFAULT_HEADER_METRICS,
  FOOTER_ROW,
  NOT_RUN_HEADER_METRIC,
} from '../../../constants.js';
import { findHeaderRowIndex } from '../../monthlySummaryMethods/summaryGenerationHelpers.js';
import { appendStateReportsToHeader } from './appendStateReportsToHeader.js';
import { constructHeaderReport } from './constructHeaderReport.js';
import { initializeDailyPayload } from '../initialization/initializeDailyPayload.js';
import { processTestSuites } from '../processing/processTestSuites.js';
import { sortPayload } from '../processing/sortDailyReportRows.js';

/**
 * Adds the "# not run tests" metric right after "# failed tests".
 * @param {Array<string>} metrics - The default header metrics.
 * @returns {Array<string>} A new metrics array.
 */
export const withNotRunMetric = (metrics) => {
  const result = [...metrics];
  const failedIndex = result.indexOf('# failed tests');
  result.splice(failedIndex === -1 ? result.length : failedIndex + 1, 0, NOT_RUN_HEADER_METRIC);
  return result;
};

/**
 * Asynchronously extracts, arranges, and manipulates data set into structured format.
 * @param {Object} dataSet - The raw data set to manipulate.
 * @param {Boolean} playwright - A boolean indicating if the test is in playwright format.
 * @returns {Promise<Object>} A promise resolving with structured data object.
 */
export const buildDailyPayload = async (dataSet, playwright) => {
  try {
    if (typeof dataSet !== 'object' || dataSet === null) {
      throw new Error('Invalid dataSet: Expected an object.');
    }
    if (typeof playwright !== 'boolean') {
      throw new Error('Invalid playwright flag: Expected a boolean.');
    }

    const columnsAvailable = COLUMNS_AVAILABLE(playwright);
    if (!Array.isArray(columnsAvailable)) {
      throw new Error('Invalid columnsAvailable: Expected an array.');
    }

    const fullDailyPayload = initializeDailyPayload();
    const payloadEntries = await processTestSuites(dataSet, playwright);
    fullDailyPayload.bodyPayload = payloadEntries;

    sortPayload(fullDailyPayload);
    // Maestro steps that never ran (blocked by an earlier failure) get their own
    // header count. Cypress/Playwright reports never have them, so their layout is unchanged.
    const headerMetrics = fullDailyPayload.bodyPayload.some(
      (entry) => entry && entry.state === 'not run'
    )
      ? withNotRunMetric(DEFAULT_HEADER_METRICS)
      : DEFAULT_HEADER_METRICS;
    fullDailyPayload.bodyPayload = fullDailyPayload.bodyPayload.map(
      Object.values
    );
    fullDailyPayload.headerPayload = await constructHeaderReport(
      fullDailyPayload.bodyPayload
    );
    appendStateReportsToHeader(
      fullDailyPayload.headerPayload,
      headerMetrics,
      playwright
    );
    fullDailyPayload.headerPayload.push(columnsAvailable);

    const headerRowIndex = findHeaderRowIndex(fullDailyPayload.headerPayload);
    const headerRow = fullDailyPayload.headerPayload[headerRowIndex - 1];
    const statusTargetIndex = headerRow.indexOf('state');
    const footerArray = new Array(statusTargetIndex).fill('').concat(FOOTER_ROW);

    fullDailyPayload.footerPayload.push(footerArray);

    return fullDailyPayload;
  } catch (error) {
    console.error('Error building daily payload:', error);
    throw error;
  }
};
