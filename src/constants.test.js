import { jest } from '@jest/globals';
import {
  GOOGLE_SHEET_ID,
  GOOGLE_KEYFILE_PATH,
  TEST_TYPES_AVAILABLE,
  TEST_CATEGORIES_AVAILABLE,
  WEEK_START,
  WEEKLY_SUMMARY_ENABLED,
  ALL_TEAM_NAMES,
} from './constants.js';

describe('Constants', () => {
  beforeEach(() => {
    jest.resetModules();
    global.shadowConfigDetails = {
      googleSpreadsheetUrl:
        'https://docs.google.com/spreadsheets/d/abc123/edit#gid=0',
      googleKeyFilePath: '/path/to/key.json',
      testTypes: ['type1', 'type2', 'type3'],
      testCategories: ['category1', 'category2', 'category3'],
      weeklySummaryStartDay: 'Monday',
      weeklySummaryEnabled: true,
      teamNames: ['team1', 'team2', 'team3'],
    };
  });

  afterEach(() => {
    jest.resetModules();
    global.shadowConfigDetails = {};
  });

  describe('GOOGLE_SHEET_ID', () => {
    it('should extract sheet ID from URL', () => {
      const result = GOOGLE_SHEET_ID();
      expect(result).toBe('abc123');
    });

    it('should handle direct sheet ID', () => {
      global.shadowConfigDetails.googleSpreadsheetUrl = 'abc123';
      const result = GOOGLE_SHEET_ID();
      expect(result).toBe('abc123');
    });

    it('should handle missing configuration', () => {
      delete global.shadowConfigDetails.googleSpreadsheetUrl;
      const result = GOOGLE_SHEET_ID();
      expect(result).toBe('');
    });
  });

  describe('GOOGLE_KEYFILE_PATH', () => {
    it('should return key file path', () => {
      const result = GOOGLE_KEYFILE_PATH();
      expect(result).toBe('/path/to/key.json');
    });

    it('should handle missing configuration', () => {
      delete global.shadowConfigDetails.googleKeyFilePath;
      const result = GOOGLE_KEYFILE_PATH();
      expect(result).toBe('');
    });
  });

  describe('TEST_TYPES_AVAILABLE', () => {
    it('should return custom test types', () => {
      const result = TEST_TYPES_AVAILABLE();
      expect(result).toEqual(['type1', 'type2', 'type3']);
    });

    it('should return default test types when not configured', () => {
      delete global.shadowConfigDetails.testTypes;
      const result = TEST_TYPES_AVAILABLE();
      expect(result).toEqual(['unit', 'integration', 'e2e']);
    });
  });

  describe('TEST_CATEGORIES_AVAILABLE', () => {
    it('should return custom test categories', () => {
      const result = TEST_CATEGORIES_AVAILABLE();
      expect(result).toEqual(['category1', 'category2', 'category3']);
    });

    it('should return default test categories when not configured', () => {
      delete global.shadowConfigDetails.testCategories;
      const result = TEST_CATEGORIES_AVAILABLE();
      expect(result).toEqual(['smoke', 'regression', 'performance']);
    });
  });

  describe('WEEK_START', () => {
    it('should return configured week start', () => {
      const result = WEEK_START();
      expect(result).toBe('Monday');
    });

    it('should return default week start when not configured', () => {
      const result = WEEK_START();
      expect(result).toBe('Monday');
    });
  });

  describe('WEEKLY_SUMMARY_ENABLED', () => {
    it('should return true when enabled', () => {
      const result = WEEKLY_SUMMARY_ENABLED();
      expect(result).toBe(true);
    });

    it('should return false when disabled', () => {
      global.shadowConfigDetails.weeklySummaryEnabled = false;
      const result = WEEKLY_SUMMARY_ENABLED();
      expect(result).toBe(false);
    });

    it('should return default value when not configured', () => {
      const result = WEEKLY_SUMMARY_ENABLED();
      expect(result).toBe(true);
    });
  });

  describe('ALL_TEAM_NAMES', () => {
    it('should return configured team names', () => {
      const result = ALL_TEAM_NAMES();
      expect(result).toEqual(['team1', 'team2', 'team3']);
    });

    it('should return default team names when not configured', () => {
      delete global.shadowConfigDetails.teamNames;
      const result = ALL_TEAM_NAMES();
      expect(result).toEqual(['team1', 'team2']);
    });
  });
});
