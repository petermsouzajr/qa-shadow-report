/**
 * Creates a test result object with the given properties
 * @param {Object} props - Properties to override defaults
 * @returns {Object} Test result object
 */
export function createTestResult(props = {}) {
  return {
    title: 'Test Title',
    fullTitle: 'Test Full Title',
    state: 'passed',
    duration: 100,
    ...props,
  };
}

/**
 * Creates a test suite object with the given properties
 * @param {Object} props - Properties to override defaults
 * @returns {Object} Test suite object
 */
export function createTestSuite(props = {}) {
  const { tests = [], suites = [], ...rest } = props;
  return {
    title: 'Test Suite',
    fullTitle: 'Test Suite Full Title',
    tests: Array.isArray(tests) ? tests : [],
    suites: Array.isArray(suites) ? suites : [],
    ...rest,
  };
}

/**
 * Creates a test data set with the given results
 * @param {Array} results - Array of test results
 * @returns {Object} Test data set object
 */
export function createTestDataSet(results = []) {
  return {
    results: Array.isArray(results) ? results : [],
  };
}
