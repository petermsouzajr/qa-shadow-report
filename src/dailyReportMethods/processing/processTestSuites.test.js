import { processTestSuites } from './processTestSuites.js';
import {
  PAYLOAD_TEST_DATA,
  TEST_OBJECTS,
} from '../../../__tests__/data/testData';

describe('processTestSuites', () => {
  // Test Data Setup
  const createTestSuite = (
    tests = [],
    suites = [],
    fullFile = 'test/path/to/file.spec.js'
  ) => ({
    tests,
    suites,
    fullFile,
  });

  const createTestResult = (
    title,
    state,
    duration = 100,
    error = null,
    projectName = ''
  ) => ({
    title,
    fullTitle: title,
    state,
    duration,
    error,
    projectName,
  });

  // Basic Functionality Tests
  describe('Basic Functionality', () => {
    it('should process Cypress test suites correctly', async () => {
      const testSuite = createTestSuite([
        createTestResult('Test 1', 'passed'),
        createTestResult('Test 2', 'failed', 200, 'Test failed'),
      ]);

      const results = [testSuite];
      const payloadEntries = await processTestSuites(results, false);

      expect(payloadEntries).toHaveLength(2);
      expect(payloadEntries[0].state).toBe('passed');
      expect(payloadEntries[1].state).toBe('failed');
    });

    it('should process Playwright test suites correctly', async () => {
      const testSuite = createTestSuite(
        [
          createTestResult('Test 1', 'passed', 100, null, 'TestProject'),
          createTestResult(
            'Test 2',
            'failed',
            200,
            'Test failed',
            'TestProject'
          ),
        ],
        [],
        'test/path/to/file.spec.js'
      );

      const results = [testSuite];
      const payloadEntries = await processTestSuites(results, true);

      expect(payloadEntries).toHaveLength(2);
      expect(payloadEntries[0].area).toBe('TestProject');
      expect(payloadEntries[1].area).toBe('TestProject');
    });
  });

  // Nested Suite Tests
  describe('Nested Suites', () => {
    it('should process deeply nested test suites', async () => {
      const nestedTest = createTestResult('Nested Test 1', 'passed');
      nestedTest.fullTitle = 'Nested Suite Nested Test 1';

      const parentTest = createTestResult('Parent Test 1', 'passed');
      parentTest.fullTitle = 'Parent Suite Parent Test 1';

      const nestedSuite = createTestSuite(
        [nestedTest],
        [],
        'test/path/to/nested.spec.js'
      );
      const parentSuite = createTestSuite(
        [parentTest],
        [nestedSuite],
        'test/path/to/parent.spec.js'
      );
      const rootSuite = createTestSuite(
        [],
        [parentSuite],
        'test/path/to/root.spec.js'
      );

      const results = [rootSuite];
      const payloadEntries = await processTestSuites(results, false);

      expect(payloadEntries).toHaveLength(2);
      expect(payloadEntries[0].testName).toBe('Parent Suite Parent Test 1');
      expect(payloadEntries[1].testName).toBe('Nested Suite Nested Test 1');
    });

    it('should handle multiple levels of nesting', async () => {
      const level3Test = createTestResult('Level 3 Test', 'passed');
      level3Test.fullTitle = 'Level 3 Suite Level 3 Test';

      const level2Test = createTestResult('Level 2 Test', 'passed');
      level2Test.fullTitle = 'Level 2 Suite Level 2 Test';

      const level1Test = createTestResult('Level 1 Test', 'passed');
      level1Test.fullTitle = 'Level 1 Suite Level 1 Test';

      const level3Suite = createTestSuite(
        [level3Test],
        [],
        'test/path/to/level3.spec.js'
      );
      const level2Suite = createTestSuite(
        [level2Test],
        [level3Suite],
        'test/path/to/level2.spec.js'
      );
      const level1Suite = createTestSuite(
        [level1Test],
        [level2Suite],
        'test/path/to/level1.spec.js'
      );
      const rootSuite = createTestSuite(
        [],
        [level1Suite],
        'test/path/to/root.spec.js'
      );

      const results = [rootSuite];
      const payloadEntries = await processTestSuites(results, false);

      expect(payloadEntries).toHaveLength(3);
      expect(payloadEntries.map((entry) => entry.testName)).toEqual([
        'Level 1 Suite Level 1 Test',
        'Level 2 Suite Level 2 Test',
        'Level 3 Suite Level 3 Test',
      ]);
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle empty test suites', async () => {
      const emptySuite = createTestSuite([]);
      const results = [emptySuite];
      const payloadEntries = await processTestSuites(results, false);
      expect(payloadEntries).toHaveLength(0);
    });

    it('should handle suites with no tests', async () => {
      const nestedSuite = createTestSuite([createTestResult('Test', 'passed')]);
      const suiteWithNoTests = createTestSuite(
        [],
        [nestedSuite],
        'test/path/to/parent.spec.js'
      );
      const results = [suiteWithNoTests];
      const payloadEntries = await processTestSuites(results, false);
      expect(payloadEntries).toHaveLength(1);
    });

    it('should handle mixed test states', async () => {
      const mixedSuite = createTestSuite([
        createTestResult('Test 1', 'passed'),
        createTestResult('Test 2', 'failed', 200, 'Error'),
        createTestResult('Test 3', 'pending'),
        createTestResult('Test 4', 'skipped'),
      ]);

      const results = [mixedSuite];
      const payloadEntries = await processTestSuites(results, false);

      expect(payloadEntries).toHaveLength(4);
      expect(payloadEntries.map((entry) => entry.state)).toEqual([
        'passed',
        'failed',
        'pending',
        'skipped',
      ]);
    });

    it('should handle missing test properties', async () => {
      const incompleteTest = {
        title: 'Incomplete Test',
        fullTitle: 'Incomplete Test',
        // missing state and other properties
      };

      const suite = createTestSuite([incompleteTest]);
      const results = [suite];
      const payloadEntries = await processTestSuites(results, false);

      expect(payloadEntries).toHaveLength(1);
      expect(payloadEntries[0]).toEqual({
        area: 'to',
        category: '',
        error: '',
        manualTestId: '',
        priority: '',
        spec: 'file',
        speed: "'NaN:NaN:NaN",
        state: '',
        status: '',
        team: '',
        testName: 'Incomplete Test',
        type: '',
      });
    });
  });

  // Error Handling
  describe('Error Handling', () => {
    it('should handle malformed test data', async () => {
      const malformedSuite = {
        tests: null,
        suites: undefined,
        fullFile: 'test/path/to/file.spec.js',
      };

      const results = [malformedSuite];
      await expect(processTestSuites(results, false)).rejects.toThrow();
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should process large test suites efficiently', async () => {
      const largeSuite = createTestSuite(
        Array(100)
          .fill(null)
          .map((_, i) => createTestResult(`Test ${i}`, 'passed'))
      );

      const results = [largeSuite];
      const startTime = performance.now();
      await processTestSuites(results, false);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
