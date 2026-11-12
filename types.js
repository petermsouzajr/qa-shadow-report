/**
 * @fileoverview Type definitions for qa-shadow-report configuration
 */

/**
 * Configuration object for qa-shadow-report
 *
 * @typedef {Object} ShadowReportConfig
 *
 * @property {string[]} [teamNames] - Array of team identifiers representing different teams
 * within your organization. These appear in the "team" column when tests include team names
 * in square brackets (e.g., `[Windsor]`).
 *
 * @property {string[]} [testTypes] - Array of test type identifiers (e.g., 'api', 'ui', 'unit').
 * Used to categorize tests by type. Include test types in your test file paths or test names.
 * Defaults to: ['api', 'ui', 'unit', 'integration', 'endToEnd', 'performance', 'security',
 * 'database', 'accessibility', 'web', 'mobile']
 *
 * @property {string[]} [testCategories] - Array of test category identifiers (e.g., 'smoke',
 * 'regression', 'sanity'). Add categories in square brackets in test names (e.g., `[smoke]`).
 * Defaults to: ['smoke', 'regression', 'sanity', 'exploratory', 'functional', 'load',
 * 'stress', 'usability', 'compatibility', 'alpha', 'beta']
 *
 * @property {string} googleSpreadsheetUrl - The URL of your Google Sheet where reports will be
 * written, or the spreadsheet ID. Can be a direct value or reference an environment variable
 * using the format 'process.env.VARIABLE_NAME'.
 * Example: 'https://docs.google.com/spreadsheets/d/1Y8tQWmo3oSB3zIlr1mySs/edit'
 *
 * @property {string} googleKeyFilePath - Path to your Google service account credentials JSON
 * file. Required for authenticating with Google Sheets API. Can be a direct file path or
 * reference an environment variable using the format 'process.env.VARIABLE_NAME'.
 * Example: './googleCredentials.json'
 *
 * @property {string} [testData] - Path to your test results JSON file (Cypress and Playwright; not used for Maestro). For Cypress, this is
 * typically the merged mochawesome output. For Playwright, this is the JSON reporter output.
 * Example: './cypress/results/output.json' or './test-results/output.json'
 *
 * @property {string} [maestroReport] - Maestro only. Path to the JUnit report from
 * `maestro test --format junit --output <path>`. Default: './maestro-results/report.xml'
 *
 * @property {string} [maestroOutputDir] - Maestro only. Folder passed to
 * `--test-output-dir`, holding the per-step logs. Default: the folder of `maestroReport`.
 *
 * @property {string} [maestroFlowsDir] - Maestro only. Folder to search for flow YAML files
 * if they are not at the path in the report.
 *
 * @property {string} [csvDownloadsPath] - Directory path where generated CSV files will be saved.
 * Used when the `--csv` flag is provided.
 * Example: './downloads'
 *
 * @property {string} [weeklySummaryStartDay] - The day of the week when your weekly summary
 * period begins (e.g., 'Monday', 'Sunday'). When set, weekly summaries will be generated
 * automatically. Omit to disable weekly summaries.
 *
 * @property {boolean} [weeklySummaryEnabled] - Explicitly enable or disable weekly summary
 * generation. When not set, the presence of `weeklySummaryStartDay` determines whether
 * weekly summaries are enabled.
 *
 * @property {string[]} [columns] - Custom column order for reports. If not specified, uses
 * default columns: ['area', 'spec', 'test name', 'type', 'category', 'team', 'priority',
 * 'status', 'state', 'manual case', 'error', 'speed']
 *
 * @example
 * // shadowReportConfig.js
 * export default {
 *   teamNames: ['unicorns', 'robots'],
 *   testTypes: ['api', 'ui'],
 *   testCategories: ['smoke', 'sanity'],
 *   googleSpreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1Y8tQWmo3oSB3zIlr1mySs/edit',
 *   googleKeyFilePath: './googleCredentials.json',
 *   testData: './cypress/results/output.json',
 *   csvDownloadsPath: './downloads',
 *   weeklySummaryStartDay: 'Monday',
 * };
 */

export {};
