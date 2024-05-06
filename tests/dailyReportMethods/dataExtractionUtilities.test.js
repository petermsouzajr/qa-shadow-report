import {
  TEST_CATEGORIES_AVAILABLE,
  TEST_TYPES_AVAILABLE,
} from '../../constants';
import {
  extractAreaFromFullFile,
  extractCategoryFromTest,
  extractSpecFromFullFile,
  extractTeamNameFromTest,
  extractTestNameFromFullTitle,
  extractManualTestCaseIdFromTest,
  extractTypeFromFullFile,
} from '../../src/dailyReportMethods/dataExtractionUtilities';

describe('Extraction Functions', () => {
  const typesAvailable = TEST_TYPES_AVAILABLE();
  describe('extractAreaFromFullFile', () => {
    it('should correctly extract the area from a full file path', async () => {
      const fullPath = 'cypress/e2e/cart/shopping.spec.ts';
      const result = await extractAreaFromFullFile(fullPath, typesAvailable);
      expect(result).toEqual('cart');
    });

    // Add more test cases (valid, edge cases, and invalid inputs)
  });

  describe('extractCategoryFromTest', () => {
    it('should correctly extract the category from a test title', () => {
      const test = { fullTitle: '[functional] Add items to cart - [C12345]' };
      const categoriesAvailable = TEST_CATEGORIES_AVAILABLE();
      const result = extractCategoryFromTest(test, categoriesAvailable);
      expect(result).toEqual('functional');
    });

    // Add more test cases
  });

  describe('extractSpecFromFullFile', () => {
    it('should correctly extract the spec name from a full file path', () => {
      const fullFilePath = 'cypress/e2e/cart/shopping.spec.ts';
      const result = extractSpecFromFullFile(fullFilePath);
      expect(result).toEqual('shopping');
    });

    // Add more test cases
  });

  describe('extractTeamNameFromTest', () => {
    it('should correctly extract the team name from a test title', () => {
      const test = { fullTitle: '[TeamAlpha] Test description' };
      const result = extractTeamNameFromTest(test);
      expect(result).toEqual('TeamAlpha');
    });

    // Add more test cases
  });

  describe('extractTestNameFromFullTitle', () => {
    it('should correctly extract the test name from a full title', () => {
      const fullTitle = 'Test description, [functional]';
      const result = extractTestNameFromFullTitle(fullTitle);
      expect(result).toEqual('Test description');
    });

    // Add more test cases
  });

  describe('extractManualTestCaseIdFromTest', () => {
    it('should correctly extract the Manual Test Case ID from a test title', () => {
      const test = { title: 'Test description [C12345]' };
      const result = extractManualTestCaseIdFromTest(test);
      expect(result).toEqual('C12345');
    });

    // Add more test cases
  });

  describe('extractTypeFromFullFile', () => {
    it('should correctly extract the type from a full file path', () => {
      const fullFile = `cypress/e2e/${typesAvailable[1]}/shopping.spec.ts`;
      const result = extractTypeFromFullFile(fullFile, typesAvailable);
      expect(result).toEqual(typesAvailable[1]); // Assuming 'e2e' is in TEST_TYPES_AVAILABLE
    });

    // Add more test cases
  });
});
