import {
  extractAreaFromFullFile,
  extractCategoryFromTest,
  extractSpecFromFullFile,
  extractTeamNameFromTest,
  extractTestNameFromFullTitle,
  extractManualTestCaseIdFromTest,
  extractTypeFromFullFile,
} from './dataExtractionUtilities';

// Test data
const TEST_PATHS = {
  unit: 'src/unit/cart/test.spec.js',
  cypress: 'src/e2e/cart/shopping.cy.js',
  cyTest: 'src/e2e/someTest.cy.js',
  integration: 'src/integration/anotherTest.test.js',
  noExtension: 'src/test/invalid.js',
  nested: 'src/test/nested/dir/testFile.spec.js',
  dotFile: 'src/test/.spec.js',
  complexName: 'src/test/complex.name.spec.js',
};

const TEST_TYPES = {
  valid: ['unit', 'e2e', 'integration'],
  empty: [],
};

const TEST_CATEGORIES = {
  valid: ['functional', 'performance', 'regression'],
  invalid: ['invalid'],
};

const TEST_TEAMS = {
  valid: ['TeamA', 'TeamB', 'TeamC'],
};

const TEST_OBJECTS = {
  valid: {
    fullTitle: '[functional] Shopping Cart Test [TeamA]',
    fullFile: 'src/unit/cart/shopping.spec.js',
  },
  invalidCategory: {
    fullTitle: '[invalid] Test Case',
    fullFile: 'src/test/test.spec.js',
  },
  multipleCategories: {
    fullTitle: '[performance] [regression] Test Case [TeamA] [TeamB]',
    fullFile: 'src/test/test.spec.js',
  },
  noCategory: {
    fullTitle: 'Test Case',
    fullFile: 'src/test/test.spec.js',
  },
};

const INVALID_TEST_DATA = {
  nonString: 123,
  nullValue: null,
  missingProperty: {},
  nonArray: 'not an array',
};

const BOUNDARY_TEST_DATA = {
  maxLengthPath: 'a'.repeat(1000),
};

describe('Extraction Functions', () => {
  describe('extractAreaFromFullFile', () => {
    it('should correctly extract the area from a full file path', async () => {
      const result = await extractAreaFromFullFile(
        TEST_PATHS.unit,
        TEST_TYPES.valid
      );
      expect(result).toEqual('cart');
    });

    it('should throw an error if fullFile is not a string', async () => {
      await expect(
        extractAreaFromFullFile(INVALID_TEST_DATA.nonString, TEST_TYPES.valid)
      ).rejects.toThrow('The "fullFile" argument must be a string.');
    });

    it('should throw an error if testTypesAvailable is not an array', async () => {
      await expect(
        extractAreaFromFullFile(TEST_PATHS.unit, INVALID_TEST_DATA.nonArray)
      ).rejects.toThrow(
        'The "testTypesAvailable" argument must be an array of strings.'
      );
    });

    it('should return an empty string if the area does not match any available types', async () => {
      const result = await extractAreaFromFullFile(
        'path/area',
        TEST_CATEGORIES.invalid
      );
      expect(result).toEqual('');
    });

    it('should handle paths with multiple valid areas correctly', async () => {
      const result = await extractAreaFromFullFile(
        'path/to/valid/area/with/multiple/segments',
        TEST_TYPES.valid
      );
      expect(result).toEqual('valid/area/with/multiple');
    });

    it('should ignore the last segment of the path', async () => {
      const result = await extractAreaFromFullFile(
        'root/level1/level2/area/file.spec.js',
        TEST_TYPES.valid
      );
      expect(result).toEqual('level2/area');
    });

    it('should handle paths with no areas to extract', async () => {
      const result = await extractAreaFromFullFile(
        'root/onlyRootLevel.spec.js',
        TEST_TYPES.valid
      );
      expect(result).toEqual('');
    });

    it('should correctly filter out segments matching test types', async () => {
      const result = await extractAreaFromFullFile(
        'root/unit/integration/area/file.spec.js',
        TEST_TYPES.valid
      );
      expect(result).toEqual('area');
    });

    it('should correctly handle a valid path but an empty testTypesAvailable array', async () => {
      const result = await extractAreaFromFullFile(
        'root/level1/level2/area/file.spec.js',
        TEST_TYPES.empty
      );
      expect(result).toEqual('level2/area');
    });
  });

  describe('extractCategoryFromTest', () => {
    it('should correctly extract the category from a test title', () => {
      const result = extractCategoryFromTest(
        TEST_OBJECTS.valid,
        TEST_CATEGORIES.valid
      );
      expect(result).toEqual('functional');
    });

    it('should return an empty string if no matching category is found', () => {
      const result = extractCategoryFromTest(
        TEST_OBJECTS.invalidCategory,
        TEST_CATEGORIES.valid
      );
      expect(result).toEqual('');
    });

    it('should throw a TypeError if the test argument is not an object', () => {
      expect(() =>
        extractCategoryFromTest(
          INVALID_TEST_DATA.nonString,
          TEST_CATEGORIES.valid
        )
      ).toThrow(
        'The "test" argument must be an object with a "fullTitle" property.'
      );
    });

    it('should throw a TypeError if the test argument is null', () => {
      expect(() =>
        extractCategoryFromTest(
          INVALID_TEST_DATA.nullValue,
          TEST_CATEGORIES.valid
        )
      ).toThrow(
        'The "test" argument must be an object with a "fullTitle" property.'
      );
    });

    it('should throw a TypeError if the test object does not have a fullTitle property', () => {
      expect(() =>
        extractCategoryFromTest(
          INVALID_TEST_DATA.missingProperty,
          TEST_CATEGORIES.valid
        )
      ).toThrow(
        'The "test" argument must be an object with a "fullTitle" property.'
      );
    });

    it('should handle multiple category matches and extract all valid matches', () => {
      const result = extractCategoryFromTest(
        TEST_OBJECTS.multipleCategories,
        TEST_CATEGORIES.valid
      );
      expect(result).toEqual('performance,regression');
    });

    it('should return an empty string if there are no category matches in the test title', () => {
      const result = extractCategoryFromTest(
        TEST_OBJECTS.noCategory,
        TEST_CATEGORIES.valid
      );
      expect(result).toEqual('');
    });
  });

  describe('extractSpecFromFullFile', () => {
    it('should correctly extract the spec name from a full file path', () => {
      const result = extractSpecFromFullFile(TEST_PATHS.cypress);
      expect(result).toEqual('shopping');
    });

    it('should extract the spec name without the .cy extension', () => {
      const result = extractSpecFromFullFile(TEST_PATHS.cyTest);
      expect(result).toEqual('someTest');
    });

    it('should extract the spec name without the .test extension', () => {
      const result = extractSpecFromFullFile(TEST_PATHS.integration);
      expect(result).toEqual('anotherTest');
    });

    it('should throw a TypeError if fullFilePath is not a string', () => {
      expect(() =>
        extractSpecFromFullFile(INVALID_TEST_DATA.nonString)
      ).toThrow('The "fullFilePath" must be a string.');
    });

    it('should throw a TypeError if the file name does not match the expected format', () => {
      expect(() => extractSpecFromFullFile(TEST_PATHS.noExtension)).toThrow(
        'The file name format is unexpected. It should end with .spec.ts, .cy.js, .test.jsx, etc.'
      );
    });

    it('should handle paths with nested directories correctly', () => {
      const result = extractSpecFromFullFile(TEST_PATHS.nested);
      expect(result).toEqual('testFile');
    });

    it('should return an empty string if the file name has no base name', () => {
      const result = extractSpecFromFullFile(TEST_PATHS.dotFile);
      expect(result).toEqual('');
    });

    it('should handle file names with multiple dots correctly', () => {
      const result = extractSpecFromFullFile(TEST_PATHS.complexName);
      expect(result).toEqual('complex.name');
    });
  });

  describe('extractTeamNameFromTest', () => {
    it('should correctly extract the team name from a test title', () => {
      const result = extractTeamNameFromTest(
        { fullTitle: 'Test [TeamA]' },
        TEST_TEAMS.valid
      );
      expect(result).toBe('TeamA');
    });

    it('should return an empty string if no team name is found', () => {
      const result = extractTeamNameFromTest(
        { fullTitle: 'Test without team' },
        TEST_TEAMS.valid
      );
      expect(result).toBe('');
    });

    it('should handle multiple team names and extract the first one', () => {
      const result = extractTeamNameFromTest(
        { fullTitle: 'Test [TeamA] [TeamB]' },
        TEST_TEAMS.valid
      );
      expect(result).toBe('TeamA');
    });

    it('should be case insensitive', () => {
      const result = extractTeamNameFromTest(
        { fullTitle: 'Test [teama]' },
        TEST_TEAMS.valid
      );
      expect(result).toBe('teama');
    });

    it('should throw TypeError if test object does not have fullTitle property', () => {
      expect(() =>
        extractTeamNameFromTest({ title: 'Test' }, TEST_TEAMS.valid)
      ).toThrow(
        'The "test" object must have a "fullTitle" property of type string.'
      );
    });

    it('should throw TypeError if fullTitle is not a string', () => {
      expect(() =>
        extractTeamNameFromTest({ fullTitle: 123 }, TEST_TEAMS.valid)
      ).toThrow(
        'The "test" object must have a "fullTitle" property of type string.'
      );
    });

    it('should throw TypeError if allTeamNames is not an array', () => {
      expect(() =>
        extractTeamNameFromTest({ fullTitle: 'Test' }, 'not an array')
      ).toThrow('The "allTeamNames" must be an array of strings.');
    });
  });

  describe('extractTestNameFromFullTitle', () => {
    it('should correctly extract the test name by removing bracketed content', () => {
      const result = extractTestNameFromFullTitle(
        '[Category] Test Name [Team]'
      );
      expect(result).toBe('Test Name');
    });

    it('should handle multiple bracketed sections', () => {
      const result = extractTestNameFromFullTitle(
        '[Cat1] [Cat2] Test [Team1] [Team2]'
      );
      expect(result).toBe('Test');
    });

    it('should throw TypeError if fullTitle is not a string', () => {
      expect(() => extractTestNameFromFullTitle(123)).toThrow(
        'The "fullTitle" argument must be a string.'
      );
    });

    it('should throw Error if resulting test name is empty', () => {
      expect(() => extractTestNameFromFullTitle('[Team1] [Team2]')).toThrow(
        'The resulting test name is empty after processing.'
      );
    });

    it('should handle empty string input', () => {
      expect(() => extractTestNameFromFullTitle('')).toThrow(
        'The resulting test name is empty after processing.'
      );
    });
  });

  describe('extractManualTestCaseIdFromTest', () => {
    it('should correctly extract the manual test case ID', () => {
      const result = extractManualTestCaseIdFromTest({
        title: 'Test [TC123]',
      });
      expect(result).toBe('TC123');
    });

    it('should handle complex test case IDs', () => {
      const result = extractManualTestCaseIdFromTest({
        title: 'Test [TC-123-ABC]',
      });
      expect(result).toBe('TC-123-ABC');
    });

    it('should return null if no test case ID is found', () => {
      const result = extractManualTestCaseIdFromTest({
        title: 'Test without ID',
      });
      expect(result).toBeNull();
    });

    it('should throw TypeError if test is not an object', () => {
      expect(() => extractManualTestCaseIdFromTest('not an object')).toThrow(
        'The "test" argument must be a non-null object with a "title" property of type string.'
      );
    });

    it('should throw TypeError if test.title is not a string', () => {
      expect(() => extractManualTestCaseIdFromTest({ title: 123 })).toThrow(
        'The "title" property must be a non-empty string.'
      );
    });
  });

  describe('extractTypeFromFullFile', () => {
    it('should correctly extract the test type from a file path', () => {
      const result = extractTypeFromFullFile(
        'src/unit/test.spec.js',
        TEST_TYPES.valid
      );
      expect(result).toBe('unit');
    });

    it('should handle multiple test types in the path', () => {
      const result = extractTypeFromFullFile(
        'src/unit/integration/test.spec.js',
        TEST_TYPES.valid
      );
      expect(result).toBe('unit, integration');
    });

    it('should return empty string if no test type is found', () => {
      const result = extractTypeFromFullFile(
        'src/other/test.spec.js',
        TEST_TYPES.valid
      );
      expect(result).toBe('');
    });

    it('should throw TypeError if fullFile is not a string', () => {
      expect(() => extractTypeFromFullFile(123, TEST_TYPES.valid)).toThrow(
        'The "fullFile" argument must be a string.'
      );
    });

    it('should throw TypeError if testTypesAvailable is not an array', () => {
      expect(() =>
        extractTypeFromFullFile('src/test.spec.js', 'not an array')
      ).toThrow(
        'The "testTypesAvailable" argument must be an array of strings.'
      );
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    it('should correctly extract all data from a complete test result', async () => {
      const area = await extractAreaFromFullFile(
        TEST_OBJECTS.valid.fullFile,
        TEST_TYPES.valid
      );
      const category = extractCategoryFromTest(
        TEST_OBJECTS.valid,
        TEST_CATEGORIES.valid
      );
      const team = extractTeamNameFromTest(
        TEST_OBJECTS.valid,
        TEST_TEAMS.valid
      );
      const spec = extractSpecFromFullFile(TEST_OBJECTS.valid.fullFile);

      expect(area).toBe('cart');
      expect(category).toBe('functional');
      expect(team).toBe('TeamA');
      expect(spec).toBe('shopping');
    });

    it('should handle a complex test result with multiple categories and teams', () => {
      const category = extractCategoryFromTest(
        TEST_OBJECTS.multipleCategories,
        TEST_CATEGORIES.valid
      );
      const team = extractTeamNameFromTest(
        TEST_OBJECTS.multipleCategories,
        TEST_TEAMS.valid
      );

      expect(category).toBe('performance,regression');
      expect(team).toBe('TeamA');
    });
  });

  // Performance Tests
  describe('Performance Tests', () => {
    it('should handle large file paths efficiently', async () => {
      const start = Date.now();
      await extractAreaFromFullFile(
        BOUNDARY_TEST_DATA.maxLengthPath,
        TEST_TYPES.valid
      );
      const end = Date.now();
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle multiple extractions efficiently', async () => {
      const iterations = 1000;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        await extractAreaFromFullFile(TEST_PATHS.unit, TEST_TYPES.valid);
        extractCategoryFromTest(TEST_OBJECTS.valid, TEST_CATEGORIES.valid);
        extractTeamNameFromTest(TEST_OBJECTS.valid, TEST_TEAMS.valid);
        extractSpecFromFullFile(TEST_PATHS.cypress);
      }

      const end = Date.now();
      expect(end - start).toBeLessThan(1000); // Should complete 1000 iterations in less than 1 second
    });
  });
});
