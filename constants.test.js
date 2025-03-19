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
  const originalEnv = process.env;
  const mockConfigDetails = {
    googleSpreadsheetUrl: 'https://docs.google.com/spreadsheets/d/abc123/edit',
    googleKeyFilePath: '/path/to/key.json',
    testTypes: ['custom1', 'custom2'],
    testCategories: ['custom1', 'custom2'],
    teamNames: ['team1', 'team2'],
    weeklySummaryStartDay: 'Monday',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    global.shadowConfigDetails = mockConfigDetails;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.shadowConfigDetails = undefined;
  });

  describe.skip('GOOGLE_SHEET_ID', () => {
    it('should extract sheet ID from config URL', () => {
      expect(GOOGLE_SHEET_ID()).toBe('abc123');
    });

    it('should handle environment variable URL', () => {
      process.env.SHEET_ID =
        'https://docs.google.com/spreadsheets/d/xyz789/edit';
      global.shadowConfigDetails.googleSpreadsheetUrl = 'process.env.SHEET_ID';
      expect(GOOGLE_SHEET_ID()).toBe('xyz789');
    });

    it('should return empty string when no URL is configured', () => {
      global.shadowConfigDetails.googleSpreadsheetUrl = undefined;
      expect(GOOGLE_SHEET_ID()).toBe('');
    });
  });

  describe.skip('GOOGLE_KEYFILE_PATH', () => {
    it('should return key file path from config', () => {
      expect(GOOGLE_KEYFILE_PATH()).toBe('/path/to/key.json');
    });

    it('should handle environment variable path', () => {
      process.env.KEY_FILE_PATH = '/env/path/key.json';
      global.shadowConfigDetails.googleKeyFilePath =
        'process.env.KEY_FILE_PATH';
      expect(GOOGLE_KEYFILE_PATH()).toBe('/env/path/key.json');
    });

    it('should return empty string when no path is configured', () => {
      global.shadowConfigDetails.googleKeyFilePath = undefined;
      expect(GOOGLE_KEYFILE_PATH()).toBe('');
    });
  });

  describe('TEST_TYPES_AVAILABLE', () => {
    it.skip('should return custom test types when configured', () => {
      expect(TEST_TYPES_AVAILABLE()).toEqual(['custom1', 'custom2']);
    });

    it('should return default test types when no custom types configured', () => {
      global.shadowConfigDetails.testTypes = undefined;
      const defaultTypes = TEST_TYPES_AVAILABLE();
      expect(defaultTypes).toContain('api');
      expect(defaultTypes).toContain('ui');
      expect(defaultTypes).toContain('unit');
    });
  });

  describe('TEST_CATEGORIES_AVAILABLE', () => {
    it.skip('should return custom categories when configured', () => {
      expect(TEST_CATEGORIES_AVAILABLE()).toEqual(['custom1', 'custom2']);
    });

    it('should return default categories when no custom categories configured', () => {
      global.shadowConfigDetails.testCategories = undefined;
      const defaultCategories = TEST_CATEGORIES_AVAILABLE();
      expect(defaultCategories).toContain('smoke');
      expect(defaultCategories).toContain('regression');
      expect(defaultCategories).toContain('sanity');
    });
  });

  describe('WEEK_START', () => {
    it('should return configured weekly summary start day', () => {
      expect(WEEK_START()).toBe('Monday');
    });

    it.skip('should return undefined when no start day configured', () => {
      global.shadowConfigDetails.weeklySummaryStartDay = undefined;
      expect(WEEK_START()).toBeUndefined();
    });
  });

  describe('WEEKLY_SUMMARY_ENABLED', () => {
    it('should return true when weekly summary is configured', () => {
      expect(WEEKLY_SUMMARY_ENABLED()).toBe(true);
    });

    it.skip('should return false when weekly summary is not configured', () => {
      global.shadowConfigDetails.weeklySummaryStartDay = undefined;
      expect(WEEKLY_SUMMARY_ENABLED()).toBe(false);
    });
  });

  describe('ALL_TEAM_NAMES', () => {
    it.skip('should return custom team names when configured', () => {
      expect(ALL_TEAM_NAMES()).toEqual(['team1', 'team2']);
    });

    it('should return default team names when no custom teams configured', () => {
      global.shadowConfigDetails.teamNames = undefined;
      const defaultTeams = ALL_TEAM_NAMES();
      expect(defaultTeams).toContain('raptors');
      expect(defaultTeams).toContain('kimchi');
      expect(defaultTeams).toContain('protus');
    });
  });
});
