/**
 * @fileoverview Canonical constants live in the package root `constants.js`.
 * This module re-exports them so older `src/constants` import paths keep working.
 *
 * Application code may import either:
 * - `../../constants.js` (preferred in existing src tree)
 * - `../constants.js` / `./constants.js` under src (this file)
 */
export {
  GOOGLE_SHEET_ID,
  GOOGLE_KEYFILE_PATH,
  TEST_TYPES_AVAILABLE,
  TEST_CATEGORIES_AVAILABLE,
  WEEK_START,
  WEEKLY_SUMMARY_ENABLED,
  ALL_TEAM_NAMES,
  CSV_DOWNLOADS_PATH,
  DAYS,
  SHORT_DAYS,
  MONTHS,
  FORMULA_KEYS,
  FORMULA_TEMPLATES,
  HEADER_INDICATORS,
  DEFAULT_HEADER_METRICS,
  COLUMNS_AVAILABLE,
  TEST_DATA,
} from '../constants.js';
