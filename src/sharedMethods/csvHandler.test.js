import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Mock Setup
jest.mock('fs');
jest.mock('path');
jest.mock('./dateFormatting.js', () => ({
  getCurrentTime: jest.fn().mockReturnValue('10:00:00'),
  getTodaysFormattedDate: jest.fn().mockReturnValue('2024-03-20'),
}));

// Mock CSV_DOWNLOADS_PATH to return a consistent path
const MOCK_DOWNLOADS_PATH = '/mock/downloads';
jest.mock('../../constants.js', () => ({
  CSV_DOWNLOADS_PATH: jest.fn(() => MOCK_DOWNLOADS_PATH),
}));

// Mock chalk to prevent console output during tests
jest.mock('chalk', () => ({
  yellow: (text) => text,
  green: (text) => text,
}));

// Import after mocks are set up
import { saveCSV, calculateDailySummaryMetrics } from './csvHandler.js';
import { getCurrentTime, getTodaysFormattedDate } from './dateFormatting.js';
import { CSV_DOWNLOADS_PATH } from '../../constants.js';

describe('CSV Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock implementations
    path.join = jest.fn().mockImplementation((...args) => {
      // Join paths with forward slashes and ensure the mock path is used
      return args.filter(Boolean).join('/').replace(/\/+/g, '/');
    });
    fs.existsSync = jest.fn().mockReturnValue(false);
    fs.mkdirSync = jest.fn().mockImplementation(() => {});
    fs.writeFileSync = jest.fn().mockImplementation(() => {});
    // Mock console.info to prevent output during tests
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveCSV', () => {
    const mockReportPayload = [
      ['Header1', 'Header2'],
      ['Value1', 'Value2'],
    ];

    it.skip('should save CSV file successfully', () => {
      saveCSV(mockReportPayload, false);

      expect(fs.existsSync).toHaveBeenCalledWith(MOCK_DOWNLOADS_PATH);
      expect(fs.mkdirSync).toHaveBeenCalledWith(MOCK_DOWNLOADS_PATH);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${MOCK_DOWNLOADS_PATH}/2024-03-20.csv`,
        expect.stringContaining('"Header1","Header2"\n"Value1","Value2"'),
        'utf8'
      );
    });

    it.skip('should handle existing file with duplicate flag', () => {
      fs.existsSync.mockReturnValue(true);
      saveCSV(mockReportPayload, true);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${MOCK_DOWNLOADS_PATH}/2024-03-20_10:00:00.csv`,
        expect.stringContaining('"Header1","Header2"\n"Value1","Value2"'),
        'utf8'
      );
    });

    it('should not overwrite existing file without duplicate flag', () => {
      fs.existsSync.mockReturnValue(true);
      saveCSV(mockReportPayload, false);

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it.skip('should handle special characters in data', () => {
      const specialData = [
        ['Header"1', 'Header,2'],
        ['Value"1', 'Value,2'],
      ];

      saveCSV(specialData, false);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${MOCK_DOWNLOADS_PATH}/2024-03-20.csv`,
        expect.stringContaining('"Header""1","Header,2"\n"Value""1","Value,2"'),
        'utf8'
      );
    });
  });

  describe('calculateDailySummaryMetrics', () => {
    it('should calculate metrics for basic test data', () => {
      const testData = [
        [
          '',
          '',
          '',
          'E2E',
          'Regression',
          'Team1',
          '',
          '',
          'passed',
          '',
          '',
          '',
        ],
        [
          '',
          '',
          '',
          'E2E',
          'Regression',
          'Team1',
          '',
          '',
          'failed',
          '',
          '',
          '',
        ],
        ['', '', '', 'Unit', 'Unit', 'Team2', '', '', 'passed', '', '', ''],
        ['', '', '', 'Unit', 'Unit', 'Team2', '', '', 'skipped', '', '', ''],
      ];

      const result = calculateDailySummaryMetrics(testData);

      // Verify overall metrics
      expect(result[1][7]).toBe('# passed tests');
      expect(result[1][8]).toBe('2 (50%)');
      expect(result[2][7]).toBe('# failed tests');
      expect(result[2][8]).toBe('1 (25%)');
      expect(result[3][7]).toBe('# skipped/pending tests');
      expect(result[3][8]).toBe('1 (25%)');
      expect(result[4][7]).toBe('# total tests');
      expect(result[4][8]).toBe('4');

      // Verify type metrics
      expect(result[1][0]).toBe('# E2E tests passed');
      expect(result[1][1]).toBe('1 of 2 - (50%)');
      expect(result[2][0]).toBe('# Unit tests passed');
      expect(result[2][1]).toBe('1 of 2 - (50%)');

      // Verify category metrics
      expect(result[1][2]).toBe('# Regression tests passed');
      expect(result[1][3]).toBe('1 of 2 - (50%)');
      expect(result[2][2]).toBe('# Unit tests passed');
      expect(result[2][3]).toBe('1 of 2 - (50%)');

      // Verify team metrics
      expect(result[1][4]).toBe('# Team1 tests passed');
      expect(result[1][5]).toBe('1 of 2 - (50%)');
      expect(result[2][4]).toBe('# Team2 tests passed');
      expect(result[2][5]).toBe('1 of 2 - (50%)');
    });

    it('should handle empty test data', () => {
      const result = calculateDailySummaryMetrics([]);

      expect(result[1][7]).toBe('# passed tests');
      expect(result[1][8]).toBe('0 (0%)');
      expect(result[2][7]).toBe('# failed tests');
      expect(result[2][8]).toBe('0 (0%)');
      expect(result[3][7]).toBe('# skipped/pending tests');
      expect(result[3][8]).toBe('0 (0%)');
      expect(result[4][7]).toBe('# total tests');
      expect(result[4][8]).toBe('0');
    });

    it('should handle missing or empty values', () => {
      const testData = [
        ['', '', '', '', '', '', '', '', 'passed', '', '', ''],
        ['', '', '', '', '', '', '', '', 'failed', '', '', ''],
      ];

      const result = calculateDailySummaryMetrics(testData);

      // Verify overall metrics still work
      expect(result[1][7]).toBe('# passed tests');
      expect(result[1][8]).toBe('1 (50%)');
      expect(result[2][7]).toBe('# failed tests');
      expect(result[2][8]).toBe('1 (50%)');

      // Verify empty categories are handled
      expect(result[1][0]).toBe('');
      expect(result[1][1]).toBe('');
      expect(result[1][2]).toBe('');
      expect(result[1][3]).toBe('');
      expect(result[1][4]).toBe('');
      expect(result[1][5]).toBe('');
    });

    it('should handle mixed case status values', () => {
      const testData = [
        [
          '',
          '',
          '',
          'E2E',
          'Regression',
          'Team1',
          '',
          '',
          'PASSED',
          '',
          '',
          '',
        ],
        [
          '',
          '',
          '',
          'E2E',
          'Regression',
          'Team1',
          '',
          '',
          'Failed',
          '',
          '',
          '',
        ],
        ['', '', '', 'Unit', 'Unit', 'Team2', '', '', 'SKIPPED', '', '', ''],
      ];

      const result = calculateDailySummaryMetrics(testData);

      expect(result[1][7]).toBe('# passed tests');
      expect(result[1][8]).toBe('1 (33%)');
      expect(result[2][7]).toBe('# failed tests');
      expect(result[2][8]).toBe('1 (33%)');
      expect(result[3][7]).toBe('# skipped/pending tests');
      expect(result[3][8]).toBe('1 (33%)');
    });

    it('should maintain correct column alignment', () => {
      const testData = [
        [
          '',
          '',
          '',
          'E2E',
          'Regression',
          'Team1',
          '',
          '',
          'passed',
          '',
          '',
          '',
        ],
        ['', '', '', 'Unit', 'Unit', 'Team2', '', '', 'passed', '', '', ''],
      ];

      const result = calculateDailySummaryMetrics(testData);

      // Verify column alignment
      expect(result[0].length).toBe(12); // Empty row
      expect(result[1].length).toBe(12); // First metrics row
      expect(result[2].length).toBe(12); // Second metrics row
      expect(result[3].length).toBe(12); // Third metrics row
      expect(result[4].length).toBe(12); // Fourth metrics row
      expect(result[5].length).toBe(12); // Final empty row
    });
  });
});
