import { jest } from '@jest/globals';

// Mock dependencies
const mockFindHeaderRowIndex = jest.fn();
const mockBatchUpdateMasterSheet = jest.fn().mockResolvedValue({});
const mockSolidBlackWidthOne = {
  style: 'SOLID',
  width: 1,
  color: { red: 0, green: 0, blue: 0, alpha: 1 },
};
const mockSolidBlackWidthTwo = {
  style: 'SOLID',
  width: 2,
  color: { red: 0, green: 0, blue: 0, alpha: 1 },
};
const mockSheetId = 0;

jest.mock('../monthlySummaryMethods/summaryGenerationHelpers.js', () => ({
  findHeaderRowIndex: mockFindHeaderRowIndex,
}));

jest.mock('../google/googleSheetIntegration/writeToSheet.js', () => ({
  batchUpdateMasterSheet: mockBatchUpdateMasterSheet,
}));

jest.mock('./summaryStyles.js', () => ({
  solidBlackWidthOne: mockSolidBlackWidthOne,
  solidBlackWidthTwo: mockSolidBlackWidthTwo,
}));

import {
  sendGridStyle,
  createConditionalFormattingPayload,
  freezeRowsInSheet,
  buildColorStylesPayload,
  buildRowHeightPayload,
  BuildTextStyles,
  setTextWrappingToClip,
  createTextAlignmentPayload,
  setColumnWidths,
} from './styles.js';

describe('Google Sheets Style Construction', () => {
  const mockFullDailyPayload = {
    bodyPayload: [
      ['test name', 'spec', 'type', 'team', 'category', 'status', 'state'],
      ['Test 1', 'Spec 1', 'Type 1', 'Team 1', 'Cat 1', 'Status 1', 'passed'],
      ['Test 2', 'Spec 2', 'Type 2', 'Team 2', 'Cat 2', 'Status 2', 'failed'],
    ],
    headerPayload: [
      ['test name', 'spec', 'type', 'team', 'category', 'status', 'state'],
    ],
    summaryGridStyles: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindHeaderRowIndex.mockReturnValue(1);
    mockFullDailyPayload.summaryGridStyles = [];
  });

  describe.skip('sendGridStyle', () => {
    it('should create grid style and add it to summaryGridStyles array', async () => {
      // Mock successful API call
      mockBatchUpdateMasterSheet.mockResolvedValueOnce({});

      await sendGridStyle(mockSheetId, mockFullDailyPayload);

      // Verify a grid style was added to summaryGridStyles
      expect(mockFullDailyPayload.summaryGridStyles).toHaveLength(1);

      // Verify the grid style has the correct structure
      const addedStyle = mockFullDailyPayload.summaryGridStyles[0];
      expect(addedStyle.updateBorders).toBeDefined();
      expect(addedStyle.updateBorders.range).toEqual({
        sheetId: mockSheetId,
        startRowIndex: 0,
        endRowIndex:
          mockFullDailyPayload.bodyPayload.length +
          mockFullDailyPayload.headerPayload.length +
          1,
        startColumnIndex: 0,
        endColumnIndex: mockFullDailyPayload.bodyPayload[0].length,
      });

      // Verify border styles are set correctly
      expect(addedStyle.updateBorders.top).toBe(mockSolidBlackWidthTwo);
      expect(addedStyle.updateBorders.bottom).toBe(mockSolidBlackWidthTwo);
      expect(addedStyle.updateBorders.left).toBe(mockSolidBlackWidthOne);
      expect(addedStyle.updateBorders.right).toBe(mockSolidBlackWidthOne);
      expect(addedStyle.updateBorders.innerHorizontal).toBe(
        mockSolidBlackWidthTwo
      );
      expect(addedStyle.updateBorders.innerVertical).toBe(
        mockSolidBlackWidthOne
      );

      // Verify batchUpdateMasterSheet was called with correct payload
      expect(mockBatchUpdateMasterSheet).toHaveBeenCalledWith({
        requests: mockFullDailyPayload.summaryGridStyles,
      });
    });

    it('should throw error if header row index cannot be found', async () => {
      mockFindHeaderRowIndex.mockImplementationOnce(() => {
        throw new Error('Failed to find header row');
      });

      await expect(
        sendGridStyle(mockSheetId, mockFullDailyPayload)
      ).rejects.toThrow('Failed to find header row');

      // Verify summaryGridStyles wasn't modified
      expect(mockFullDailyPayload.summaryGridStyles).toHaveLength(0);
      // Verify batchUpdateMasterSheet was not called
      expect(mockBatchUpdateMasterSheet).not.toHaveBeenCalled();
    });

    it('should throw error if destinationTabId is invalid', async () => {
      await expect(
        sendGridStyle(undefined, mockFullDailyPayload)
      ).rejects.toThrow('Invalid destinationTabId: must be a number');

      expect(mockFullDailyPayload.summaryGridStyles).toHaveLength(0);
      expect(mockBatchUpdateMasterSheet).not.toHaveBeenCalled();
    });

    it('should throw error if fullDailyPayload is missing required data', async () => {
      const invalidPayload = { summaryGridStyles: [] };

      await expect(sendGridStyle(mockSheetId, invalidPayload)).rejects.toThrow(
        'Invalid fullDailyPayload: missing required data'
      );

      expect(invalidPayload.summaryGridStyles).toHaveLength(0);
      expect(mockBatchUpdateMasterSheet).not.toHaveBeenCalled();
    });

    it('should throw error if summaryGridStyles is not an array', async () => {
      const invalidPayload = {
        ...mockFullDailyPayload,
        summaryGridStyles: 'not an array',
      };

      await expect(sendGridStyle(mockSheetId, invalidPayload)).rejects.toThrow(
        'Invalid fullDailyPayload: summaryGridStyles must be an array'
      );

      expect(mockBatchUpdateMasterSheet).not.toHaveBeenCalled();
    });
  });

  describe('createConditionalFormattingPayload', () => {
    it('should create payload for passed state', () => {
      const result = createConditionalFormattingPayload(
        mockSheetId,
        mockFullDailyPayload,
        'passed'
      );

      expect(result.requests).toHaveLength(1);
      const rule = result.requests[0].addConditionalFormatRule.rule;
      expect(rule.booleanRule.condition.type).toBe('CUSTOM_FORMULA');
      expect(rule.booleanRule.format.backgroundColor).toEqual({
        red: 0.49803922,
        green: 1,
        blue: 0.49803922,
      });
    });

    it('should create payload for failed state', () => {
      const result = createConditionalFormattingPayload(
        mockSheetId,
        mockFullDailyPayload,
        'failed'
      );

      expect(result.requests).toHaveLength(1);
      const rule = result.requests[0].addConditionalFormatRule.rule;
      expect(rule.booleanRule.condition.type).toBe('CUSTOM_FORMULA');
      expect(rule.booleanRule.format.backgroundColor).toEqual({
        red: 1,
        green: 0.49803922,
        blue: 0.49803922,
      });
    });
  });

  describe('freezeRowsInSheet', () => {
    it('should create payload for freezing rows', async () => {
      const result = await freezeRowsInSheet(mockSheetId, 2);

      expect(result.requests).toHaveLength(1);
      const request = result.requests[0];
      expect(
        request.updateSheetProperties.properties.gridProperties.frozenRowCount
      ).toBe(2);
    });
  });

  describe('buildColorStylesPayload', () => {
    it('should create payload with light and dark grey colors', () => {
      const result = buildColorStylesPayload(mockSheetId, mockFullDailyPayload);

      expect(result.requests).toHaveLength(3);
      // Check for light grey above header
      expect(
        result.requests[0].repeatCell.cell.userEnteredFormat.backgroundColor
      ).toEqual({
        red: 0.9,
        green: 0.9,
        blue: 0.9,
      });
      // Check for dark grey in header
      expect(
        result.requests[1].repeatCell.cell.userEnteredFormat.backgroundColor
      ).toEqual({
        red: 0.75,
        green: 0.75,
        blue: 0.75,
      });
    });
  });

  describe('buildRowHeightPayload', () => {
    it('should create payload with correct pixel size', () => {
      const result = buildRowHeightPayload(mockSheetId, mockFullDailyPayload);

      expect(result.requests).toHaveLength(1);
      expect(
        result.requests[0].updateDimensionProperties.properties.pixelSize
      ).toBe(27);
    });
  });

  describe('setTextWrappingToClip', () => {
    it('should create payload with CLIP wrap strategy', async () => {
      const result = await setTextWrappingToClip(
        mockSheetId,
        mockFullDailyPayload
      );

      expect(result.requests).toHaveLength(1);
      expect(
        result.requests[0].repeatCell.cell.userEnteredFormat.wrapStrategy
      ).toBe('CLIP');
    });
  });

  describe('createTextAlignmentPayload', () => {
    it('should create payload with correct alignments', async () => {
      const result = await createTextAlignmentPayload(
        mockSheetId,
        mockFullDailyPayload
      );

      expect(result.requests.length).toBeGreaterThan(0);
      // Check header alignment is CENTER
      const headerAlignment =
        result.requests[4].repeatCell.cell.userEnteredFormat
          .horizontalAlignment;
      expect(headerAlignment).toBe('CENTER');
    });
  });

  describe('setColumnWidths', () => {
    it('should create payload with specified column widths', async () => {
      const result = await setColumnWidths(mockSheetId, mockFullDailyPayload);

      expect(result.requests.length).toBeGreaterThan(0);
      // Check test name column width
      expect(
        result.requests[0].updateDimensionProperties.properties.pixelSize
      ).toBe(180);
    });
  });
});
