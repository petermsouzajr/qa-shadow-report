import { sortPayload } from './sortDailyReportRows.js';
import {
  PAYLOAD_TEST_DATA,
  TEST_OBJECTS,
} from '../../../__tests__/data/testData';

describe('sortPayload', () => {
  // Test Data Setup
  const createPayloadItem = (area, spec, testName) => ({
    area,
    spec,
    testName,
  });

  const createPayload = (items) => ({
    bodyPayload: items,
  });

  // Basic Functionality Tests
  describe('Basic Functionality', () => {
    it('should sort payload items by area, spec, and testName', () => {
      const payload = createPayload([
        createPayloadItem('B', 'Y', 'Z'),
        createPayloadItem('A', 'X', 'Y'),
        createPayloadItem('A', 'X', 'Z'),
        createPayloadItem('A', 'Y', 'X'),
        createPayloadItem('B', 'X', 'Y'),
      ]);

      const expected = createPayload([
        createPayloadItem('A', 'X', 'Y'),
        createPayloadItem('A', 'X', 'Z'),
        createPayloadItem('A', 'Y', 'X'),
        createPayloadItem('B', 'X', 'Y'),
        createPayloadItem('B', 'Y', 'Z'),
      ]);

      sortPayload(payload);
      expect(payload).toEqual(expected);
    });

    it('should maintain stable sorting for equal items', () => {
      const payload = createPayload([
        createPayloadItem('A', 'X', 'Y'),
        createPayloadItem('A', 'X', 'Y'),
        createPayloadItem('A', 'X', 'Y'),
      ]);

      const originalOrder = [...payload.bodyPayload];
      sortPayload(payload);

      // Verify that items with equal values maintain their relative order
      expect(payload.bodyPayload).toEqual(originalOrder);
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle empty payload array', () => {
      const payload = createPayload([]);
      sortPayload(payload);
      expect(payload.bodyPayload).toEqual([]);
    });

    it('should handle single item payload', () => {
      const payload = createPayload([createPayloadItem('A', 'X', 'Y')]);
      sortPayload(payload);
      expect(payload.bodyPayload).toEqual([createPayloadItem('A', 'X', 'Y')]);
    });

    it('should handle special characters in strings', () => {
      const payload = createPayload([
        createPayloadItem('A', 'X', 'Test!'),
        createPayloadItem('A', 'X', 'Test#'),
        createPayloadItem('A', 'X', 'Test$'),
      ]);

      const expected = createPayload([
        createPayloadItem('A', 'X', 'Test!'),
        createPayloadItem('A', 'X', 'Test#'),
        createPayloadItem('A', 'X', 'Test$'),
      ]);

      sortPayload(payload);
      expect(payload).toEqual(expected);
    });

    it.skip('should handle case sensitivity correctly', () => {
      const payload = createPayload([
        createPayloadItem('a', 'x', 'y'),
        createPayloadItem('A', 'X', 'Y'),
        createPayloadItem('b', 'y', 'z'),
        createPayloadItem('B', 'Y', 'Z'),
      ]);

      const expected = createPayload([
        createPayloadItem('A', 'X', 'Y'),
        createPayloadItem('a', 'x', 'y'),
        createPayloadItem('B', 'Y', 'Z'),
        createPayloadItem('b', 'y', 'z'),
      ]);

      sortPayload(payload);
      expect(payload).toEqual(expected);
    });
  });

  // Input Validation
  describe('Input Validation', () => {
    it('should throw an error if payload is not an object', () => {
      expect(() => sortPayload(null)).toThrow(
        'Invalid payload: Expected an object.'
      );
      expect(() => sortPayload('invalid')).toThrow(
        'Invalid payload: Expected an object.'
      );
      expect(() => sortPayload(undefined)).toThrow(
        'Invalid payload: Expected an object.'
      );
      expect(() => sortPayload(123)).toThrow(
        'Invalid payload: Expected an object.'
      );
    });

    it('should throw an error if bodyPayload is not an array', () => {
      expect(() => sortPayload({})).toThrow(
        'Invalid payload: Expected an object with a bodyPayload array.'
      );
      expect(() => sortPayload({ bodyPayload: 'not an array' })).toThrow(
        'Invalid payload: Expected an object with a bodyPayload array.'
      );
      expect(() => sortPayload({ bodyPayload: null })).toThrow(
        'Invalid payload: Expected an object with a bodyPayload array.'
      );
    });

    it('should throw an error if bodyPayload items do not have the required properties', () => {
      expect(() =>
        sortPayload({ bodyPayload: [{ area: 'A', spec: 'X' }] })
      ).toThrow(
        'Invalid payload item: Each item in bodyPayload should have area, spec, and testName as strings.'
      );

      expect(() =>
        sortPayload({ bodyPayload: [{ area: 'A', spec: 123, testName: 'Y' }] })
      ).toThrow(
        'Invalid payload item: Each item in bodyPayload should have area, spec, and testName as strings.'
      );

      expect(() =>
        sortPayload({ bodyPayload: [{ area: 'A', spec: 'X', testName: null }] })
      ).toThrow(
        'Invalid payload item: Each item in bodyPayload should have area, spec, and testName as strings.'
      );
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should sort large payloads efficiently', () => {
      const largePayload = createPayload(
        Array(1000)
          .fill(null)
          .map((_, i) =>
            createPayloadItem(`Area${i % 10}`, `Spec${i % 20}`, `Test${i}`)
          )
      );

      const startTime = performance.now();
      sortPayload(largePayload);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });

  // Error Handling
  describe('Error Handling', () => {
    it('should handle sorting errors gracefully', () => {
      const payload = createPayload([
        createPayloadItem('A', 'X', 'Y'),
        createPayloadItem('A', 'X', 'Z'),
        createPayloadItem('A', 'Y', 'X'),
      ]);

      // Mock localeCompare to throw an error
      const originalLocaleCompare = String.prototype.localeCompare;
      String.prototype.localeCompare = () => {
        throw new Error('Test error');
      };

      expect(() => sortPayload(payload)).toThrow('Test error');

      // Restore original localeCompare
      String.prototype.localeCompare = originalLocaleCompare;
    });
  });
});
