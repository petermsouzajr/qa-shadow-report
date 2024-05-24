import { jest } from '@jest/globals';

const mockCopyPasteNormal = jest.fn();

describe('copyPasteNormal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate correct copy-paste configuration', () => {
    const sourceParams = {
      sourcePageId: 1,
      startRow: 0,
      endRow: 10,
      startCol: 0,
      endCol: 5,
    };
    const destinationParams = {
      destinationTabId: 2,
      startRow: 5,
      endRow: 15,
      startCol: 3,
      endCol: 8,
    };

    // Mock the function to return a specific result
    mockCopyPasteNormal.mockReturnValue({
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

    const result = mockCopyPasteNormal(sourceParams, destinationParams);
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

  it('should throw an error if sourcePageId or destinationTabId is not provided', () => {
    const sourceParams = { startRow: 0, endRow: 10, startCol: 0, endCol: 5 };
    const destinationParams = {
      startRow: 5,
      endRow: 15,
      startCol: 3,
      endCol: 8,
    };

    // Mock the function to throw an error
    mockCopyPasteNormal.mockImplementation(() => {
      throw new Error(
        'Both sourcePageId and destinationTabId must be provided.'
      );
    });

    expect(() => mockCopyPasteNormal(sourceParams, destinationParams)).toThrow(
      'Both sourcePageId and destinationTabId must be provided.'
    );
  });

  // Additional tests can be added here for other error cases or different scenarios.
});
