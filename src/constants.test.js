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

describe('Constants (canonical root via src re-export)', () => {
  beforeEach(() => {
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
    global.shadowConfigDetails = {};
  });

  describe('GOOGLE_SHEET_ID', () => {
    it('should extract sheet ID from URL', () => {
      expect(GOOGLE_SHEET_ID()).toBe('abc123');
    });

    it('should handle direct sheet ID', () => {
      global.shadowConfigDetails.googleSpreadsheetUrl = 'abc123';
      expect(GOOGLE_SHEET_ID()).toBe('abc123');
    });

    it('should handle missing configuration', () => {
      delete global.shadowConfigDetails.googleSpreadsheetUrl;
      expect(GOOGLE_SHEET_ID()).toBe('');
    });
  });

  describe('GOOGLE_KEYFILE_PATH', () => {
    it('should return key file path', () => {
      expect(GOOGLE_KEYFILE_PATH()).toBe('/path/to/key.json');
    });

    it('should handle missing configuration', () => {
      delete global.shadowConfigDetails.googleKeyFilePath;
      expect(GOOGLE_KEYFILE_PATH()).toBe('');
    });
  });

  describe('TEST_TYPES_AVAILABLE', () => {
    it('should return custom test types', () => {
      expect(TEST_TYPES_AVAILABLE()).toEqual(['type1', 'type2', 'type3']);
    });

    it('should return default test types when not configured', () => {
      delete global.shadowConfigDetails.testTypes;
      const result = TEST_TYPES_AVAILABLE();
      expect(result).toEqual(
        expect.arrayContaining(['unit', 'integration', 'api', 'ui'])
      );
    });
  });

  describe('TEST_CATEGORIES_AVAILABLE', () => {
    it('should return custom test categories', () => {
      expect(TEST_CATEGORIES_AVAILABLE()).toEqual([
        'category1',
        'category2',
        'category3',
      ]);
    });

    it('should return default test categories when not configured', () => {
      delete global.shadowConfigDetails.testCategories;
      const result = TEST_CATEGORIES_AVAILABLE();
      expect(result).toEqual(expect.arrayContaining(['smoke', 'regression']));
    });
  });

  describe('WEEK_START', () => {
    it('should return configured week start', () => {
      expect(WEEK_START()).toBe('Monday');
    });
  });

  describe('WEEKLY_SUMMARY_ENABLED', () => {
    it('should return true when enabled', () => {
      expect(WEEKLY_SUMMARY_ENABLED()).toBe(true);
    });

    it('should return false when disabled', () => {
      global.shadowConfigDetails.weeklySummaryEnabled = false;
      expect(WEEKLY_SUMMARY_ENABLED()).toBe(false);
    });
  });

  describe('ALL_TEAM_NAMES', () => {
    it('should return configured team names', () => {
      expect(ALL_TEAM_NAMES()).toEqual(['team1', 'team2', 'team3']);
    });

    it('should return built-in default team names when not configured', () => {
      delete global.shadowConfigDetails.teamNames;
      const result = ALL_TEAM_NAMES();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('raptors');
    });
  });
});
