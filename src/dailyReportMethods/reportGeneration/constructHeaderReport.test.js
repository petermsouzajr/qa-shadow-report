import { jest } from '@jest/globals';

// Mock the dependencies
const mockGenerateReport = jest.fn();
const mockGeneratePlaceholders = jest.fn();
const mockCombineReports = jest.fn();
const mockTestTypesAvailable = jest.fn();
const mockTestCategoriesAvailable = jest.fn();
const mockAllTeamNames = jest.fn();

// Mock console.error
const originalConsoleError = console.error;
console.error = jest.fn();

jest.unstable_mockModule('./reportGenerationHelpers.js', () => ({
  generateReport: mockGenerateReport,
  generatePlaceholders: mockGeneratePlaceholders,
}));

jest.unstable_mockModule('./combineReports.js', () => ({
  combineReports: mockCombineReports,
}));

jest.unstable_mockModule('../../../constants.js', () => ({
  TEST_TYPES_AVAILABLE: mockTestTypesAvailable,
  TEST_CATEGORIES_AVAILABLE: mockTestCategoriesAvailable,
  ALL_TEAM_NAMES: mockAllTeamNames,
}));

describe('constructHeaderReport', () => {
  let constructHeaderReport;

  beforeAll(async () => {
    const module = await import('./constructHeaderReport.js');
    constructHeaderReport = module.constructHeaderReport;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    console.error.mockClear();
    mockTestTypesAvailable.mockReturnValue(['unit', 'integration']);
    mockTestCategoriesAvailable.mockReturnValue(['smoke', 'regression']);
    mockAllTeamNames.mockReturnValue(['team1', 'team2']);
    mockGenerateReport.mockResolvedValue([['Report Entry'], ['']]);
    mockGeneratePlaceholders.mockReturnValue(['', '']);
    mockCombineReports.mockReturnValue([['Combined Report'], ['']]);
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // Basic Functionality Tests
  describe('Basic Functionality', () => {
    it('should construct the header report correctly with valid data', async () => {
      const payload = [['area1', 'spec1', 'test1', 'unit', 'smoke', 'team1']];

      const result = await constructHeaderReport(payload);

      expect(mockGenerateReport).toHaveBeenCalledTimes(3);
      expect(mockGenerateReport).toHaveBeenCalledWith(
        ['unit', 'integration'],
        payload,
        3,
        false
      );
      expect(mockGenerateReport).toHaveBeenCalledWith(
        ['smoke', 'regression'],
        payload,
        4,
        false
      );
      expect(mockGenerateReport).toHaveBeenCalledWith(
        ['team1', 'team2'],
        payload,
        5,
        true
      );
      expect(mockGeneratePlaceholders).toHaveBeenCalledWith(2); // max length of available types
      expect(mockCombineReports).toHaveBeenCalledWith(
        [
          [['Report Entry'], ['']],
          [['Report Entry'], ['']],
          [['Report Entry'], ['']],
        ],
        ['', '']
      );
      expect(result).toEqual([['Combined Report'], ['']]);
    });

    it('should handle empty payload', async () => {
      const result = await constructHeaderReport([]);

      expect(mockGenerateReport).toHaveBeenCalledTimes(3);
      expect(mockGeneratePlaceholders).toHaveBeenCalledWith(2);
      expect(mockCombineReports).toHaveBeenCalledTimes(1);
      expect(result).toEqual([['Combined Report'], ['']]);
    });

    it('should handle different lengths of type arrays', async () => {
      mockTestTypesAvailable.mockReturnValue(['unit', 'integration', 'e2e']);
      mockTestCategoriesAvailable.mockReturnValue(['smoke']);
      mockAllTeamNames.mockReturnValue(['team1', 'team2']);

      await constructHeaderReport([]);

      expect(mockGeneratePlaceholders).toHaveBeenCalledWith(3); // max length is now 3
    });
  });

  // Input Validation Tests
  describe('Input Validation', () => {
    it('should throw an error if payload is not an array', async () => {
      const invalidInputs = [null, undefined, 'not an array', 123, {}];

      for (const input of invalidInputs) {
        await expect(constructHeaderReport(input)).rejects.toThrow(
          'Invalid payload: Expected an array.'
        );
      }
    });

    it('should throw an error if types arrays are not arrays', async () => {
      const testCases = [
        { mock: mockTestTypesAvailable, value: 'not an array', index: 3 },
        { mock: mockTestCategoriesAvailable, value: 123, index: 4 },
        { mock: mockAllTeamNames, value: {}, index: 5 },
      ];

      for (const { mock, value, index } of testCases) {
        // Reset all mocks to valid arrays first
        mockTestTypesAvailable.mockReturnValue(['unit', 'integration']);
        mockTestCategoriesAvailable.mockReturnValue(['smoke', 'regression']);
        mockAllTeamNames.mockReturnValue(['team1', 'team2']);

        // Then set the specific mock to invalid value
        mock.mockReturnValue(value);

        const payload = [['area1', 'spec1', 'test1', 'unit', 'smoke', 'team1']];

        await expect(constructHeaderReport(payload)).rejects.toThrow(
          'Failed to construct header report'
        );
        expect(console.error).toHaveBeenCalledWith(
          'Error constructing header report:',
          expect.any(Error)
        );
        expect(console.error.mock.calls[0][1].message).toBe(
          `Invalid types: Expected an array at index ${index}.`
        );

        console.error.mockClear();
      }
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should handle errors during report generation', async () => {
      const errorMessage = 'Failed to generate report';
      mockGenerateReport.mockRejectedValueOnce(new Error(errorMessage));

      const payload = [['area1', 'spec1', 'test1', 'unit', 'smoke', 'team1']];
      await expect(constructHeaderReport(payload)).rejects.toThrow(
        'Failed to construct header report'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Error constructing header report:',
        expect.any(Error)
      );
      expect(console.error.mock.calls[0][1].message).toBe(errorMessage);
    });

    it('should handle errors during combining reports', async () => {
      const errorMessage = 'Failed to combine reports';
      mockCombineReports.mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      const payload = [['area1', 'spec1', 'test1', 'unit', 'smoke', 'team1']];
      await expect(constructHeaderReport(payload)).rejects.toThrow(
        'Failed to construct header report'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Error constructing header report:',
        expect.any(Error)
      );
      expect(console.error.mock.calls[0][1].message).toBe(errorMessage);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should handle payloads of varying sizes efficiently', async () => {
      const testSizes = [10, 100, 1000];
      const baseEntry = ['area', 'spec', 'test', 'unit', 'smoke', 'team1'];

      for (const size of testSizes) {
        const payload = Array(size).fill(baseEntry);

        const startTime = performance.now();
        await constructHeaderReport(payload);
        const endTime = performance.now();

        const timeLimit = size <= 100 ? 100 : 1000; // Adjust time limit based on payload size
        expect(endTime - startTime).toBeLessThan(timeLimit);
      }
    });
  });
});
