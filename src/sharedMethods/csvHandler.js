import fs from 'fs';
import path from 'path';
import { getCurrentTime, getTodaysFormattedDate } from './dateFormatting.js';
import { CSV_DOWNLOADS_PATH } from '../../constants.js';
import chalk from 'chalk';

/**
 * Converts a 2D array into a CSV string format.
 * @param {Array<Array<string>>} data - The 2D array to be converted into CSV format.
 * @returns {string} The CSV string.
 */
const arrayToCSV = (data) => {
  if (!Array.isArray(data) || !data.every((row) => Array.isArray(row))) {
    throw new Error('arrayToCSV expects a 2D array');
  }
  return data
    .map((row) =>
      row
        .map(String)
        .map((v) => v.replace(/"/g, '""'))
        .map((v) => `"${v}"`)
        .join(',')
    )
    .join('\n');
};

/**
 * Saves CSV data to a file in the Cypress downloads directory.
 * @param {Array<Array<string>>} reportPayload - The 2D array to convert to CSV and save.
 * @param {boolean} duplicate - If true, allows creating a duplicate report for the day.
 */
export const saveCSV = (reportPayload, duplicate) => {
  const csvData = arrayToCSV(reportPayload);
  const downloadsPath = CSV_DOWNLOADS_PATH();
  const todaysTitle = getTodaysFormattedDate();
  const time = getCurrentTime();
  let filePath = path.join(downloadsPath, `${todaysTitle}.csv`);

  if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath);
  }

  if (fs.existsSync(filePath) && !duplicate) {
    console.info(
      chalk.yellow('CSV file already exists. Use'),
      chalk.green('--duplicate'),
      chalk.yellow('flag to allow creating a duplicate file'),
      chalk.green('qa-shadow-report --csv --duplicate')
    );
    return;
  } else if (fs.existsSync(filePath) && duplicate) {
    filePath = path.join(downloadsPath, `${todaysTitle}_${time}.csv`);
  }

  fs.writeFileSync(filePath, csvData, 'utf8');
  console.info(
    chalk.green(`CSV file has been saved successfully to ${filePath}`)
  );
};

/**
 * Calculates daily summary metrics from test data, dynamically aggregating by unique TYPE, CATEGORY, TEAM values,
 * and aligns them in multiple rows. Ensures overall metrics are in columns 8-9. Handles empty/blank values efficiently.
 * @param {Array<Array<string>>} testData - Array of test data arrays (each with 12 elements).
 * @returns {string[][]} A 2D array representing the calculated header rows for CSV, aligned by columns.
 */
export const calculateDailySummaryMetrics = (testData) => {
  // Initialize counters
  const counters = {
    total: testData.length,
    passed: 0,
    failed: 0,
    skippedPending: 0,
    byType: {},
    byCategory: {},
    byTeam: {},
  };

  // Helper to update counters for a given key and map
  const updateCounter = (key, map, status) => {
    if (!key) return; // Skip empty/blank keys
    if (!map[key]) map[key] = { passed: 0, total: 0 };
    map[key].total++;
    if (status.toLowerCase() === 'passed') map[key].passed++;
  };

  // Process each test entry
  testData.forEach((row, index) => {
    const type = row[3] || '';
    const category = row[4] || '';
    const team = row[5] || '';
    const status = row[8] || '';

    // Update overall counters
    if (status.toLowerCase() === 'passed') counters.passed++;
    if (status.toLowerCase() === 'failed') counters.failed++;
    if (status.toLowerCase() !== 'passed' && status.toLowerCase() !== 'failed')
      counters.skippedPending++;

    // Aggregate by TYPE, CATEGORY, TEAM
    updateCounter(type, counters.byType, status);
    updateCounter(category, counters.byCategory, status);
    updateCounter(team, counters.byTeam, status);
  });

  // Calculate percentages
  const calculatePercentage = (passed, total) =>
    total > 0 ? Math.round((passed / total) * 100) : 0;

  // Helper to generate metric value
  const generateMetricValue = (passed, total) =>
    `${passed} of ${total} - (${calculatePercentage(passed, total)}%)`;

  // Get metrics for each category
  const typeMetrics = Object.entries(counters.byType).map(
    ([key, { passed, total }]) => [
      `# ${key} tests passed`,
      generateMetricValue(passed, total),
    ]
  );
  const categoryMetrics = Object.entries(counters.byCategory).map(
    ([key, { passed, total }]) => [
      `# ${key} tests passed`,
      generateMetricValue(passed, total),
    ]
  );
  const teamMetrics = Object.entries(counters.byTeam).map(
    ([key, { passed, total }]) => [
      `# ${key} tests passed`,
      generateMetricValue(passed, total),
    ]
  );
  const overallMetrics = [
    `# passed tests`,
    `${counters.passed} (${calculatePercentage(counters.passed, counters.total)}%)`,
    `# failed tests`,
    `${counters.failed} (${calculatePercentage(counters.failed, counters.total)}%)`,
    `# skipped/pending tests`,
    `${counters.skippedPending} (${calculatePercentage(counters.skippedPending, counters.total)}%)`,
    `# total tests`,
    `${counters.total}`,
  ];

  // Determine the number of rows (at least 4 for overall metrics)
  const maxUniqueMetrics = Math.max(
    typeMetrics.length,
    categoryMetrics.length,
    teamMetrics.length
  );
  const minRows = 4; // Ensure at least 4 rows for overall metrics
  const maxRows = Math.max(maxUniqueMetrics, minRows);

  // Build the 2D header with dynamically determined rows
  const headerRows = [
    // Initial empty row
    Array(12).fill(''),
  ];

  for (let i = 0; i < maxRows; i++) {
    const row = [];
    // Columns 1-2: TYPE metric (if available)
    row.push(typeMetrics[i]?.[0] || '', typeMetrics[i]?.[1] || '');
    // Columns 3-4: CATEGORY metric (if available)
    row.push(categoryMetrics[i]?.[0] || '', categoryMetrics[i]?.[1] || '');
    // Columns 5-6: TEAM metric (if available)
    row.push(teamMetrics[i]?.[0] || '', teamMetrics[i]?.[1] || '');
    // Column 7: Placeholder
    row.push('');
    // Columns 8-9: Overall metrics (fixed to first 4 rows)
    if (i === 0) {
      row.push(overallMetrics[0] || '', overallMetrics[1] || '');
    } else if (i === 1) {
      row.push(overallMetrics[2] || '', overallMetrics[3] || '');
    } else if (i === 2) {
      row.push(overallMetrics[4] || '', overallMetrics[5] || '');
    } else if (i === 3) {
      row.push(overallMetrics[6] || '', overallMetrics[7] || '');
    } else {
      row.push('', '');
    }
    // Columns 10-12: Placeholders
    row.push('', '', '');

    headerRows.push(row);
  }

  // Add final empty row
  headerRows.push(Array(12).fill(''));

  return headerRows;
};
