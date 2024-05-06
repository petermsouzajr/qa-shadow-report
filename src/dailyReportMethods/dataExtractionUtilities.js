import { TEST_CATEGORIES_AVAILABLE } from '../../constants.js';

/**
 * Asynchronously extracts the area from a full file path string, excluding any segments
 * that are listed in the array of available test target types.
 *
 * @param {string} fullFile The full file path from which to extract the area.
 * @param {Array<string>} testTypesAvailable The array of available test target types to exclude from the area.
 * @returns {Promise<string>} A promise that resolves to the extracted area as a string.
 * @throws {Error} If the input parameters are not valid.
 */
export const extractAreaFromFullFile = async (fullFile, testTypesAvailable) => {
  if (typeof fullFile !== 'string') {
    throw new Error('The "fullFile" argument must be a string.');
  }

  if (!Array.isArray(testTypesAvailable)) {
    throw new Error(
      'The "testTypesAvailable" argument must be an array of strings.'
    );
  }

  const area = fullFile
    .split('/')
    .slice(2, -1) // Assumes the area is between the second and the last segment of the path
    .filter((segment) => !testTypesAvailable.includes(segment))
    .join('/');

  return area; // The function only returns the area, spec and type were not defined in the original snippet
};

/**
 * Extracts the category from the test title based on available purpose types.
 *
 * @param {Object} test - An object with title and fullTitle properties representing the test.
 * @param {Array<string>} testCategoriesAvailable - An array of strings representing available test purpose types.
 * @returns {string} - The extracted category.
 * @throws {TypeError} If the input test is not an object or if the required properties are missing.
 * @throws {TypeError} If the testCategoriesAvailable is not an array.
 */
export const extractCategoryFromTest = (test, testCategoriesAvailable) => {
  if (typeof test !== 'object' || test === null || !test.fullTitle) {
    throw new TypeError(
      'The "test" argument must be an object with a "fullTitle" property.'
    );
  }

  if (!Array.isArray(testCategoriesAvailable)) {
    throw new TypeError(
      'The "testCategoriesAvailable" argument must be an array of strings.'
    );
  }

  const categoryMatches = test.fullTitle.match(/\[(\w+)\]/g);
  let category = '';

  if (categoryMatches) {
    for (let match of categoryMatches) {
      const extractedCategory = match.replace(/[[\]]/g, '');
      if (testCategoriesAvailable.includes(extractedCategory)) {
        category = extractedCategory;
        break; // Stop at the first matching category
      }
    }
  }

  return category;
};

/**
 * Extracts the spec name from a full file path, assuming the file name ends with '.spec.ts'.
 *
 * @param {string} fullFilePath The full file path from which to extract the spec name.
 * @returns {string} The extracted spec name without the '.spec.ts' extension.
 * @throws {TypeError} If the fullFilePath is not a string or if the format is unexpected.
 */
export const extractSpecFromFullFile = (fullFilePath) => {
  if (typeof fullFilePath !== 'string') {
    throw new TypeError('The "fullFilePath" must be a string.');
  }
  const segments = fullFilePath.split('/');
  const fileName = segments.pop();
  const regex = /\.(spec|cy|test)\.(ts|js|jsx|tsx)$/;
  const spec = fileName.replace(regex, '');
  return spec;
};

/**
 * Extracts the team name from the test object's full title.
 * Assumes the team name is encapsulated in square brackets []
 * and does not start with 'C' followed by digits.
 *
 * @param {Object} test The test object containing the fullTitle property.
 * @returns {string} The extracted team name.
 * @throws {TypeError} If the input test object does not have a fullTitle property or it's not a string.
 */
export const extractTeamNameFromTest = (test) => {
  if (!test || typeof test.fullTitle !== 'string') {
    throw new TypeError(
      'The "test" object must have a "fullTitle" property of type string.'
    );
  }

  const testCategories = TEST_CATEGORIES_AVAILABLE();
  // Convert the array to a regex string
  const testCategoriesRegex = testCategories.join('|');

  // This regex matches any string within brackets that doesn't start with 'C' followed by numbers
  const teamNameMatch = test.fullTitle.match(
    new RegExp(`\\[((?!${testCategoriesRegex}|C\\d+).+?)\\]`)
  );
  return teamNameMatch ? teamNameMatch[1].trim() : '';
};

/**
 * Extracts the test name from a full title path string by removing bracketed segments and trailing commas.
 *
 * @param {string} fullTitle - The full title path from which to extract the test name.
 * @returns {string} - The extracted test name.
 * @throws {TypeError} If the fullTitle is not a string.
 */
export const extractTestNameFromFullTitle = (fullTitle = '') => {
  if (typeof fullTitle !== 'string') {
    throw new TypeError('The "fullTitle" argument must be a string.');
  }

  // Remove bracketed content and trailing commas, then trim any whitespace
  const testName = fullTitle
    .replace(/\[[^\]]+\]/g, '')
    .trim()
    .replace(/(,\s*)+$/, '')
    .trim();

  return testName;
};

/**
 * Extracts the Test Case ID from a test's title.
 *
 * @param {Object} test - The test object containing the title property with a Test Case ID.
 * @returns {string|null} - The extracted Test Case ID or null if not present.
 * @throws {TypeError} If the input 'test' is not an object with a string 'title' property.
 */
export const extractManualTestCaseIdFromTest = (test) => {
  if (!test || typeof test.title !== 'string') {
    throw new TypeError(
      'The "test" argument must be an object with a "title" property of type string.'
    );
  }

  const manualTestIdMatch = test.title.match(/\[[a-zA-Z#-]+[0-9][^\]]*\]/);
  return manualTestIdMatch ? manualTestIdMatch[0].replace(/[[\]]/g, '') : null;
};

/**
 * Extracts the test target type (type) from a full file path string if available.
 *
 * @param {string} fullFile - The full file path.
 * @param {Array<string>} testTypesAvailable - Available test target types.
 * @returns {string} - The extracted type or an empty string if not found.
 * @throws {TypeError} If the provided arguments are not of expected types.
 */
export const extractTypeFromFullFile = (fullFile, testTypesAvailable) => {
  if (typeof fullFile !== 'string') {
    throw new TypeError('The "fullFile" argument must be a string.');
  }

  if (!Array.isArray(testTypesAvailable)) {
    throw new TypeError(
      'The "testTypesAvailable" argument must be an array of strings.'
    );
  }

  const type =
    testTypesAvailable.find((targetType) =>
      fullFile.includes(`${targetType}/`)
    ) || '';

  return type;
};
