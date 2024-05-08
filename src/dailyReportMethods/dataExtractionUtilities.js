import { ALL_TEAM_NAMES } from '../../constants.js';

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

  return area; // The function only returns the area
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
 * Helper function to escape special characters in regular expression strings.
 * @param {string} string The input string to escape.
 * @returns {string} The escaped string.
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Extracts the team name from the test object's full title.
 * Assumes the team name is encapsulated in square brackets [].
 * The word must be an exact match from the list of team names, case insensitive.
 *
 * @param {Object} test The test object containing the fullTitle property.
 * @param {Array<string>} allTeamNames - An array of strings representing available team names.
 * @returns {string} The extracted team name, or an empty string if no valid name found.
 * @throws {TypeError} If the input test object does not have a fullTitle property or it's not a string.
 */
export const extractTeamNameFromTest = (test, allTeamNames) => {
  if (!test || typeof test.fullTitle !== 'string') {
    throw new TypeError(
      'The "test" object must have a "fullTitle" property of type string.'
    );
  }

  // Create a regex pattern that matches any of the team names enclosed in brackets, case insensitive
  const teamNamesPattern = `\\[(${allTeamNames
    .map((name) => escapeRegExp(name))
    .join('|')})\\]`;
  const teamNameRegex = new RegExp(teamNamesPattern, 'i');

  const teamNameMatch = test.fullTitle.match(teamNameRegex);
  return teamNameMatch ? teamNameMatch[1] : '';
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
