import {
  COLUMNS_AVAILABLE,
  DEFAULT_HEADER_METRICS,
  FOOTER_ROW,
} from '../../../constants.js';
import { findHeaderRowIndex } from '../../monthlySummaryMethods/summaryGenerationHelpers.js';
import { appendStateReportsToHeader } from './appendStateReportsToHeader.js';
import { constructHeaderReport } from './constructHeaderReport.js';
import { initializeDailyPayload } from '../initialization/initializeDailyPayload.js';
import { processTestSuites } from '../processing/processTestSuites.js';
import { sortPayload } from '../processing/sortDailyReportRows.js';

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

    let fullDailyPayload = initializeDailyPayload();
    const payloadEntries = await processTestSuites(dataSet, playwright);
    fullDailyPayload.bodyPayload = payloadEntries;

    sortPayload(fullDailyPayload);
    fullDailyPayload.bodyPayload = fullDailyPayload.bodyPayload.map(
      Object.values
    );
    fullDailyPayload.headerPayload = await constructHeaderReport(
      fullDailyPayload.bodyPayload
    );
    appendStateReportsToHeader(
      fullDailyPayload.headerPayload,
      DEFAULT_HEADER_METRICS,
      playwright
    );
    fullDailyPayload.headerPayload.push(columnsAvailable);

    const headerRowIndex = findHeaderRowIndex(fullDailyPayload.headerPayload);
    const headerRow = fullDailyPayload.headerPayload[headerRowIndex - 1];
    const statusTargetIndex = headerRow.indexOf('state');
    let footerArray = new Array(statusTargetIndex).fill('').concat(FOOTER_ROW);

    fullDailyPayload.footerPayload.push(footerArray);

    return fullDailyPayload;
  } catch (error) {
    console.error('Error building daily payload:', error);
    throw error;
  }
};
