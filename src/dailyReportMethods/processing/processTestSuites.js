import { constructReportPayloadEntry } from '../buildReport.js';

/**
 * Asynchronously processes test suites to extract payload entries.
 * @param {Array} results - The array of result objects containing test suites.
 * @param {Boolean} playwright - A boolean indicating if the test is in playwright format.
 * @returns {Promise<Array>} - A promise that resolves to an array of constructed payload entries.
 */
export const processTestSuites = async (results, playwright) => {
  const processSuite = async (suites, resultData) => {
    let payloads = [];
    for (const suite of suites) {
      if (suite.tests && suite.tests.length > 0) {
        const suitePayloads = await Promise.all(
          suite.tests.map((test) =>
            constructReportPayloadEntry(resultData, test, playwright)
          )
        );
        payloads.push(...suitePayloads);
      }
      if (suite.suites && suite.suites.length > 0) {
        const nestedPayloads = await processSuite(suite.suites, resultData);
        payloads.push(...nestedPayloads);
      }
    }
    return payloads;
  };

  try {
    const payloadEntriesPromises = results.map(async (result) => {
      // If there are tests at the result level, process them
      if (result.tests && result.tests.length > 0) {
        return Promise.all(
          result.tests.map((test) =>
            constructReportPayloadEntry(result, test, playwright)
          )
        );
      }
      // Otherwise, process the suites
      return processSuite(result.suites, result);
    });

    const nestedPayloadEntries = await Promise.all(payloadEntriesPromises);
    return nestedPayloadEntries.flat(Infinity);
  } catch (error) {
    console.error('Error processing test suites:', error);
    throw error;
  }
};
