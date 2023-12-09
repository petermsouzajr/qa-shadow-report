import {
  TEST_PURPOSES_AVAILABLE,
  TEST_TARGETS_AVAILABLE,
} from '../../constants';
import {
  extractAreaFromFullFile,
  extractCategoryFromTest,
  extractSpecFromFullFile,
  extractTeamNameFromTest,
  extractTestNameFromFullTitle,
  extracttestrailIdFromTest,
  extractTypeFromFullFile,
} from '../../src/dailyReportMethods/dataExtractionUtilities';

describe('Extraction Functions', () => {
  const targetsAvailable = TEST_TARGETS_AVAILABLE();
  describe('extractAreaFromFullFile', () => {
    it('should correctly extract the area from a full file path', async () => {
      const fullPath = 'cypress/e2e/cart/shopping.spec.ts';
      const result = await extractAreaFromFullFile(fullPath, targetsAvailable);
      expect(result).toEqual('cart');
    });

    // Add more test cases (valid, edge cases, and invalid inputs)
  });

  describe('extractCategoryFromTest', () => {
    it('should correctly extract the category from a test title', () => {
      const test = { fullTitle: '[functional] Add items to cart - [C12345]' };
      const purposesAvailable = TEST_PURPOSES_AVAILABLE();
      const result = extractCategoryFromTest(test, purposesAvailable);
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

  describe('extracttestrailIdFromTest', () => {
    it('should correctly extract the TestRail ID from a test title', () => {
      const test = { title: 'Test description [C12345]' };
      const result = extracttestrailIdFromTest(test);
      expect(result).toEqual('C12345');
    });

    // Add more test cases
  });

  describe('extractTypeFromFullFile', () => {
    it('should correctly extract the type from a full file path', () => {
      const fullFile = `cypress/e2e/${targetsAvailable[1]}/shopping.spec.ts`;
      const result = extractTypeFromFullFile(fullFile, targetsAvailable);
      expect(result).toEqual(targetsAvailable[1]); // Assuming 'e2e' is in TEST_TARGETS_AVAILABLE
    });

    // Add more test cases
  });
});
