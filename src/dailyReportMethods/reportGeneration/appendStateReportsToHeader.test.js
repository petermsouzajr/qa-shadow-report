import { appendStateReportsToHeader } from './appendStateReportsToHeader.js';
import {
  PAYLOAD_TEST_DATA,
  TEST_OBJECTS,
} from '../../../__tests__/data/testData';

describe('appendStateReportsToHeader', () => {
  // Test Data Setup
  const createHeaderPayload = (rows) => rows.map((row) => [...row]);
  const createDefaultHeaderMetrics = (metrics) => [...metrics];

  // Basic Functionality Tests
  describe('Basic Functionality', () => {
    it('should append state reports to the header payload correctly for Playwright', () => {
      const headerPayload = createHeaderPayload([
        ['Header1', 'Header2'],
        ['Header3', 'Header4'],
      ]);
      const defaultHeaderMetrics = createDefaultHeaderMetrics([
        'metric1',
        'metric2',
      ]);
      const playwright = true;

      appendStateReportsToHeader(
        headerPayload,
        defaultHeaderMetrics,
        playwright
      );

      expect(headerPayload).toEqual([
        [
          'Header1',
          'Header2',
          '',
          '',
          '',
          '',
          '',
          '# metric1',
          'tric1 formula base',
        ],
        [
          'Header3',
          'Header4',
          '',
          '',
          '',
          '',
          '',
          '# metric2',
          'tric2 formula base',
        ],
      ]);
    });

    it('should append state reports to the header payload correctly for Cypress', () => {
      const headerPayload = createHeaderPayload([
        ['Header1', 'Header2'],
        ['Header3', 'Header4'],
      ]);
      const defaultHeaderMetrics = createDefaultHeaderMetrics([
        'metric1',
        'metric2',
      ]);
      const playwright = false;

      appendStateReportsToHeader(
        headerPayload,
        defaultHeaderMetrics,
        playwright
      );

      expect(headerPayload).toEqual([
        [
          'Header1',
          'Header2',
          '',
          '',
          '',
          '',
          '',
          '# metric1',
          'tric1 formula base',
        ],
        [
          'Header3',
          'Header4',
          '',
          '',
          '',
          '',
          '',
          '# metric2',
          'tric2 formula base',
        ],
      ]);
    });

    it('should initialize empty header payload with default metrics structure', () => {
      const headerPayload = [];
      const defaultHeaderMetrics = createDefaultHeaderMetrics([
        'metric1',
        'metric2',
      ]);
      const playwright = true;

      appendStateReportsToHeader(
        headerPayload,
        defaultHeaderMetrics,
        playwright
      );

      expect(headerPayload).toHaveLength(2);
      expect(headerPayload[0]).toHaveLength(9); // Initial length + appended reports
      expect(headerPayload[1]).toHaveLength(9);
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle empty default header metrics', () => {
      const headerPayload = createHeaderPayload([['Header1', 'Header2']]);
      const defaultHeaderMetrics = createDefaultHeaderMetrics([]);
      const playwright = true;

      appendStateReportsToHeader(
        headerPayload,
        defaultHeaderMetrics,
        playwright
      );

      expect(headerPayload).toEqual([['Header1', 'Header2']]);
    });

    it('should handle single metric in default header metrics', () => {
      const headerPayload = createHeaderPayload([['Header1', 'Header2']]);
      const defaultHeaderMetrics = createDefaultHeaderMetrics(['metric1']);
      const playwright = true;

      appendStateReportsToHeader(
        headerPayload,
        defaultHeaderMetrics,
        playwright
      );

      expect(headerPayload).toHaveLength(1);
      expect(headerPayload[0]).toHaveLength(9); // Initial length + appended reports
    });

    it('should handle header payload with different row lengths', () => {
      const headerPayload = createHeaderPayload([
        ['Header1', 'Header2'],
        ['Header3', 'Header4', 'Header5'],
      ]);
      const defaultHeaderMetrics = createDefaultHeaderMetrics([
        'metric1',
        'metric2',
      ]);
      const playwright = true;

      appendStateReportsToHeader(
        headerPayload,
        defaultHeaderMetrics,
        playwright
      );

      expect(headerPayload[0]).toHaveLength(9); // Initial length + appended reports
      expect(headerPayload[1]).toHaveLength(9); // Initial length + appended reports
    });
  });

  // Input Validation
  describe('Input Validation', () => {
    it('should throw an error if headerPayload is not an array', () => {
      expect(() => appendStateReportsToHeader(null, ['metric1'], true)).toThrow(
        'Invalid headerPayload: Expected an array.'
      );
      expect(() =>
        appendStateReportsToHeader(undefined, ['metric1'], true)
      ).toThrow('Invalid headerPayload: Expected an array.');
      expect(() =>
        appendStateReportsToHeader('not an array', ['metric1'], true)
      ).toThrow('Invalid headerPayload: Expected an array.');
    });

    it('should throw an error if defaultHeaderMetrics is not an array', () => {
      expect(() => appendStateReportsToHeader([[]], null, true)).toThrow(
        'Invalid defaultHeaderMetrics: Expected an array.'
      );
      expect(() => appendStateReportsToHeader([[]], undefined, true)).toThrow(
        'Invalid defaultHeaderMetrics: Expected an array.'
      );
      expect(() =>
        appendStateReportsToHeader([[]], 'not an array', true)
      ).toThrow('Invalid defaultHeaderMetrics: Expected an array.');
    });

    it('should throw an error if playwright is not a boolean', () => {
      expect(() => appendStateReportsToHeader([[]], ['metric1'], null)).toThrow(
        'Invalid playwright value: Expected a boolean.'
      );
      expect(() =>
        appendStateReportsToHeader([[]], ['metric1'], undefined)
      ).toThrow('Invalid playwright value: Expected a boolean.');
      expect(() =>
        appendStateReportsToHeader([[]], ['metric1'], 'not a boolean')
      ).toThrow('Invalid playwright value: Expected a boolean.');
    });
  });

  // Error Handling
  describe('Error Handling', () => {
    it('should handle new report at index not being defined or not an array', () => {
      const headerPayload = [null];
      const defaultHeaderMetrics = createDefaultHeaderMetrics([
        'metric1',
        'metric2',
      ]);
      const playwright = true;

      expect(() =>
        appendStateReportsToHeader(
          headerPayload,
          defaultHeaderMetrics,
          playwright
        )
      ).toThrow("Cannot read properties of null (reading 'length')");
    });

    it('should handle header payload at index not being an array', () => {
      const headerPayload = [null];
      const defaultHeaderMetrics = createDefaultHeaderMetrics([
        'metric1',
        'metric2',
      ]);
      const playwright = true;

      expect(() =>
        appendStateReportsToHeader(
          headerPayload,
          defaultHeaderMetrics,
          playwright
        )
      ).toThrow("Cannot read properties of null (reading 'length')");
    });

    it('should handle malformed header payload structure', () => {
      const headerPayload = null;
      const defaultHeaderMetrics = createDefaultHeaderMetrics(['metric1']);
      const playwright = true;

      expect(() =>
        appendStateReportsToHeader(
          headerPayload,
          defaultHeaderMetrics,
          playwright
        )
      ).toThrow('Invalid headerPayload: Expected an array.');
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should handle large header payloads efficiently', () => {
      const headerPayload = createHeaderPayload(
        Array(100)
          .fill(null)
          .map((_, i) =>
            Array(5)
              .fill(null)
              .map((_, j) => `Header${i}${j}`)
          )
      );
      const defaultHeaderMetrics = createDefaultHeaderMetrics(
        Array(100)
          .fill(null)
          .map((_, i) => `metric${i}`)
      );
      const playwright = true;

      const startTime = performance.now();
      appendStateReportsToHeader(
        headerPayload,
        defaultHeaderMetrics,
        playwright
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
