import { copyPasteNormal } from './copyPaste.js';

describe('Google Sheets Copy-Paste Operations', () => {
  // Test Data Setup
  const createSourceParams = (overrides = {}) => ({
    sourcePageId: 1,
    startRow: 0,
    endRow: 10,
    startCol: 0,
    endCol: 5,
    ...overrides,
  });

  const createDestinationParams = (overrides = {}) => ({
    destinationTabId: 2,
    startRow: 5,
    endRow: 15,
    startCol: 3,
    endCol: 8,
    ...overrides,
  });

  // Basic Functionality Tests
  describe('Basic Functionality', () => {
    it('should return a valid copy-paste configuration', () => {
      const sourceParams = createSourceParams();
      const destinationParams = createDestinationParams();

      const result = copyPasteNormal(sourceParams, destinationParams);

      expect(result).toEqual({
        copyPaste: {
          source: {
            sheetId: 1,
            startRowIndex: 0,
            endRowIndex: 10,
            startColumnIndex: 0,
            endColumnIndex: 5,
          },
          destination: {
            sheetId: 2,
            startRowIndex: 5,
            endRowIndex: 15,
            startColumnIndex: 3,
            endColumnIndex: 8,
          },
          pasteType: 'PASTE_NORMAL',
        },
      });
    });

    it('should handle zero-based indices correctly', () => {
      const sourceParams = createSourceParams({
        startRow: 0,
        endRow: 0,
        startCol: 0,
        endCol: 0,
      });
      const destinationParams = createDestinationParams({
        startRow: 0,
        endRow: 0,
        startCol: 0,
        endCol: 0,
      });

      const result = copyPasteNormal(sourceParams, destinationParams);

      expect(result.copyPaste.source).toEqual({
        sheetId: 1,
        startRowIndex: 0,
        endRowIndex: 0,
        startColumnIndex: 0,
        endColumnIndex: 0,
      });
      expect(result.copyPaste.destination).toEqual({
        sheetId: 2,
        startRowIndex: 0,
        endRowIndex: 0,
        startColumnIndex: 0,
        endColumnIndex: 0,
      });
    });

    it('should handle large indices correctly', () => {
      const sourceParams = createSourceParams({
        startRow: 1000,
        endRow: 2000,
        startCol: 100,
        endCol: 200,
      });
      const destinationParams = createDestinationParams({
        startRow: 2000,
        endRow: 3000,
        startCol: 200,
        endCol: 300,
      });

      const result = copyPasteNormal(sourceParams, destinationParams);

      expect(result.copyPaste.source).toEqual({
        sheetId: 1,
        startRowIndex: 1000,
        endRowIndex: 2000,
        startColumnIndex: 100,
        endColumnIndex: 200,
      });
      expect(result.copyPaste.destination).toEqual({
        sheetId: 2,
        startRowIndex: 2000,
        endRowIndex: 3000,
        startColumnIndex: 200,
        endColumnIndex: 300,
      });
    });
  });

  // Input Validation Tests
  describe('Input Validation', () => {
    it('should throw an error if sourcePageId is missing', () => {
      const sourceParams = createSourceParams({ sourcePageId: undefined });
      const destinationParams = createDestinationParams();

      expect(() => copyPasteNormal(sourceParams, destinationParams)).toThrow(
        'Invalid source parameters: sourcePageId, startRow, endRow, startCol, and endCol must all be numbers.'
      );
    });

    it('should throw an error if destinationTabId is missing', () => {
      const sourceParams = createSourceParams();
      const destinationParams = createDestinationParams({
        destinationTabId: undefined,
      });

      expect(() => copyPasteNormal(sourceParams, destinationParams)).toThrow(
        'Invalid destination parameters: destinationTabId, startRow, endRow, startCol, and endCol must all be numbers.'
      );
    });

    it('should throw an error if any source parameter is not a number', () => {
      const sourceParams = createSourceParams({ sourcePageId: '1' });
      const destinationParams = createDestinationParams();

      expect(() => copyPasteNormal(sourceParams, destinationParams)).toThrow(
        'Invalid source parameters: sourcePageId, startRow, endRow, startCol, and endCol must all be numbers.'
      );
    });

    it('should throw an error if any destination parameter is not a number', () => {
      const sourceParams = createSourceParams();
      const destinationParams = createDestinationParams({ startCol: '3' });

      expect(() => copyPasteNormal(sourceParams, destinationParams)).toThrow(
        'Invalid destination parameters: destinationTabId, startRow, endRow, startCol, and endCol must all be numbers.'
      );
    });

    it('should throw an error if no parameters are provided', () => {
      expect(() => copyPasteNormal()).toThrow(
        'Invalid source parameters: sourcePageId, startRow, endRow, startCol, and endCol must all be numbers.'
      );
    });

    it('should throw an error if source parameters object is empty', () => {
      const destinationParams = createDestinationParams();

      expect(() => copyPasteNormal({}, destinationParams)).toThrow(
        'Invalid source parameters: sourcePageId, startRow, endRow, startCol, and endCol must all be numbers.'
      );
    });

    it('should throw an error if destination parameters object is empty', () => {
      const sourceParams = createSourceParams();

      expect(() => copyPasteNormal(sourceParams, {})).toThrow(
        'Invalid destination parameters: destinationTabId, startRow, endRow, startCol, and endCol must all be numbers.'
      );
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('should handle negative indices', () => {
      const sourceParams = createSourceParams({
        startRow: -1,
        endRow: -1,
        startCol: -1,
        endCol: -1,
      });
      const destinationParams = createDestinationParams({
        startRow: -1,
        endRow: -1,
        startCol: -1,
        endCol: -1,
      });

      const result = copyPasteNormal(sourceParams, destinationParams);

      expect(result.copyPaste.source).toEqual({
        sheetId: 1,
        startRowIndex: -1,
        endRowIndex: -1,
        startColumnIndex: -1,
        endColumnIndex: -1,
      });
      expect(result.copyPaste.destination).toEqual({
        sheetId: 2,
        startRowIndex: -1,
        endRowIndex: -1,
        startColumnIndex: -1,
        endColumnIndex: -1,
      });
    });

    it('should handle decimal indices', () => {
      const sourceParams = createSourceParams({
        startRow: 1.5,
        endRow: 2.5,
        startCol: 1.5,
        endCol: 2.5,
      });
      const destinationParams = createDestinationParams({
        startRow: 1.5,
        endRow: 2.5,
        startCol: 1.5,
        endCol: 2.5,
      });

      const result = copyPasteNormal(sourceParams, destinationParams);

      expect(result.copyPaste.source).toEqual({
        sheetId: 1,
        startRowIndex: 1.5,
        endRowIndex: 2.5,
        startColumnIndex: 1.5,
        endColumnIndex: 2.5,
      });
      expect(result.copyPaste.destination).toEqual({
        sheetId: 2,
        startRowIndex: 1.5,
        endRowIndex: 2.5,
        startColumnIndex: 1.5,
        endColumnIndex: 2.5,
      });
    });

    it('should handle NaN values', () => {
      const sourceParams = createSourceParams({
        startRow: NaN,
        endRow: NaN,
        startCol: NaN,
        endCol: NaN,
      });
      const destinationParams = createDestinationParams({
        startRow: NaN,
        endRow: NaN,
        startCol: NaN,
        endCol: NaN,
      });

      const result = copyPasteNormal(sourceParams, destinationParams);

      expect(result.copyPaste.source).toEqual({
        sheetId: 1,
        startRowIndex: NaN,
        endRowIndex: NaN,
        startColumnIndex: NaN,
        endColumnIndex: NaN,
      });
      expect(result.copyPaste.destination).toEqual({
        sheetId: 2,
        startRowIndex: NaN,
        endRowIndex: NaN,
        startColumnIndex: NaN,
        endColumnIndex: NaN,
      });
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should generate configurations efficiently', () => {
      const startTime = performance.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        copyPasteNormal(
          createSourceParams({ sourcePageId: i }),
          createDestinationParams({ destinationTabId: i })
        );
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
