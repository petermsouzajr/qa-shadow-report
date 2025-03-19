/**
 * @constant {string} GOOGLE_SHEET_ID - The ID of the Google Sheet.
 */
export const GOOGLE_SHEET_ID = () => {
  const url = global.shadowConfigDetails?.googleSpreadsheetUrl;
  if (!url) return '';
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : url;
};

/**
 * @constant {string} GOOGLE_KEYFILE_PATH - The path to the Google credentials file.
 */
export const GOOGLE_KEYFILE_PATH = () => {
  return global.shadowConfigDetails?.googleKeyFilePath || '';
};

/**
 * @constant {Array<string>} TEST_TYPES_AVAILABLE - Available test types.
 */
export const TEST_TYPES_AVAILABLE = () => {
  return (
    global.shadowConfigDetails?.testTypes || ['unit', 'integration', 'e2e']
  );
};

/**
 * @constant {Array<string>} TEST_CATEGORIES_AVAILABLE - Available test categories.
 */
export const TEST_CATEGORIES_AVAILABLE = () => {
  return (
    global.shadowConfigDetails?.testCategories || [
      'smoke',
      'regression',
      'performance',
    ]
  );
};

/**
 * @constant {string} WEEK_START - The day of the week to start weekly summaries.
 */
export const WEEK_START = () => {
  return global.shadowConfigDetails?.weeklySummaryStartDay || 'Monday';
};

/**
 * @constant {boolean} WEEKLY_SUMMARY_ENABLED - Whether weekly summaries are enabled.
 */
export const WEEKLY_SUMMARY_ENABLED = () => {
  return global.shadowConfigDetails?.weeklySummaryEnabled ?? true;
};

/**
 * @constant {Array<string>} ALL_TEAM_NAMES - All available team names.
 */
export const ALL_TEAM_NAMES = () => {
  return global.shadowConfigDetails?.teamNames || ['team1', 'team2'];
};

/**
 * @constant {string} CSV_DOWNLOADS_PATH - The path to the CSV downloads directory.
 */
export const CSV_DOWNLOADS_PATH = () => {
  return global.shadowConfigDetails?.csvDownloadsPath || './cypress/downloads';
};

/**
 * @constant {Object} DAYS - Mapping of day names to their indices.
 */
export const DAYS = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};
