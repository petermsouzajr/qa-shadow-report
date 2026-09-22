import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

/**
 * Validates the shadowReportConfig object with clear error messages.
 *
 * @param {import('./types.js').ShadowReportConfig} config - The configuration object to validate
 * @param {string} configPath - Path to the config file (for error messages)
 * @param {{skipGoogle?: boolean}} [options] - skipGoogle skips spreadsheet and credentials checks
 * @returns {{valid: boolean, errors: string[]}} Validation result with any error messages
 */
export function validateConfig(config, configPath, options = {}) {
  const errors = [];
  const skipGoogle = options.skipGoogle || process.argv.includes('--csv') || process.argv.includes('--help');

  // Helper to check if value is a non-empty string
  const isNonEmptyString = (val) => typeof val === 'string' && val.trim().length > 0;

  // Google fields are required for Sheets, not for CSV.
  if (!skipGoogle && !config.googleSpreadsheetUrl) {
    errors.push(
      `${chalk.red('Missing required field:')} ${chalk.yellow('googleSpreadsheetUrl')}\n` +
      '  Expected: A Google Sheets URL or spreadsheet ID\n' +
      '  Example: \'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit\''
    );
  } else if (!skipGoogle && !isNonEmptyString(config.googleSpreadsheetUrl)) {
    errors.push(
      `${chalk.red('Invalid value for')} ${chalk.yellow('googleSpreadsheetUrl')}\n` +
      '  Expected: A non-empty string\n' +
      `  Received: ${typeof config.googleSpreadsheetUrl}`
    );
  } else if (!skipGoogle) {
    const isEnvVar = /^process\.env\.\w+$/.test(config.googleSpreadsheetUrl);
    if (!isEnvVar) {
      const hasSheetId = config.googleSpreadsheetUrl.includes('/d/') ||
                        /^[a-zA-Z0-9_-]+$/.test(config.googleSpreadsheetUrl);
      if (!hasSheetId) {
        errors.push(
          `${chalk.red('Invalid format for')} ${chalk.yellow('googleSpreadsheetUrl')}\n` +
          '  Expected: A valid Google Sheets URL or spreadsheet ID\n' +
          `  Received: '${config.googleSpreadsheetUrl}'`
        );
      }
    }
  }

  if (!skipGoogle && !config.googleKeyFilePath) {
    errors.push(
      `${chalk.red('Missing required field:')} ${chalk.yellow('googleKeyFilePath')}\n` +
      '  Expected: Path to your Google service account credentials JSON file\n' +
      '  Example: \'./googleCredentials.json\'\n' +
      '  See: https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication'
    );
  } else if (!skipGoogle && !isNonEmptyString(config.googleKeyFilePath)) {
    errors.push(
      `${chalk.red('Invalid value for')} ${chalk.yellow('googleKeyFilePath')}\n` +
      '  Expected: A non-empty string (file path)\n' +
      `  Received: ${typeof config.googleKeyFilePath}`
    );
  } else if (!skipGoogle) {
    // Check if file exists (unless it's an env var reference)
    const isEnvVar = /^process\.env\.\w+$/.test(config.googleKeyFilePath);
    if (!isEnvVar && config.googleKeyFilePath) {
      const configDir = path.dirname(configPath);
      const keyFilePath = path.resolve(configDir, config.googleKeyFilePath);
      if (!fs.existsSync(keyFilePath)) {
        errors.push(
          `${chalk.red('Google credentials file not found:')}\n` +
          `  Path: ${chalk.yellow(config.googleKeyFilePath)}\n` +
          `  Resolved to: ${chalk.yellow(keyFilePath)}\n` +
          '  Please ensure the file exists or update the path in your config.'
        );
      }
    }
  }

  // Check testData (required)
  if (!config.testData) {
    errors.push(
      `${chalk.red('Missing required field:')} ${chalk.yellow('testData')}\n` +
      '  Expected: Path to your test results JSON file\n' +
      '  Example: \'./cypress/results/output.json\' or \'./test-results/output.json\''
    );
  } else if (!isNonEmptyString(config.testData)) {
    errors.push(
      `${chalk.red('Invalid value for')} ${chalk.yellow('testData')}\n` +
      '  Expected: A non-empty string (file path)\n' +
      `  Received: ${typeof config.testData}`
    );
  }

  // Validate optional array fields
  if (config.teamNames !== undefined && !Array.isArray(config.teamNames)) {
    errors.push(
      `${chalk.red('Invalid value for')} ${chalk.yellow('teamNames')}\n` +
      '  Expected: An array of team name strings\n' +
      '  Example: [\'unicorns\', \'robots\', \'dragons\']'
    );
  }

  if (config.testTypes !== undefined && !Array.isArray(config.testTypes)) {
    errors.push(
      `${chalk.red('Invalid value for')} ${chalk.yellow('testTypes')}\n` +
      '  Expected: An array of test type strings\n' +
      '  Example: [\'api\', \'ui\', \'unit\', \'integration\']'
    );
  }

  if (config.testCategories !== undefined && !Array.isArray(config.testCategories)) {
    errors.push(
      `${chalk.red('Invalid value for')} ${chalk.yellow('testCategories')}\n` +
      '  Expected: An array of test category strings\n' +
      '  Example: [\'smoke\', \'regression\', \'sanity\']'
    );
  }

  if (config.columns !== undefined && !Array.isArray(config.columns)) {
    errors.push(
      `${chalk.red('Invalid value for')} ${chalk.yellow('columns')}\n` +
      '  Expected: An array of column name strings\n' +
      '  Example: [\'area\', \'spec\', \'test name\', \'type\', \'state\']'
    );
  }

  // Validate optional string fields
  if (config.csvDownloadsPath !== undefined && !isNonEmptyString(config.csvDownloadsPath)) {
    errors.push(
      `${chalk.red('Invalid value for')} ${chalk.yellow('csvDownloadsPath')}\n` +
      '  Expected: A non-empty string (directory path)\n' +
      '  Example: \'./downloads\''
    );
  }

  if (config.weeklySummaryStartDay !== undefined) {
    if (!isNonEmptyString(config.weeklySummaryStartDay)) {
      errors.push(
        `${chalk.red('Invalid value for')} ${chalk.yellow('weeklySummaryStartDay')}\n` +
        '  Expected: A day of the week (string)\n' +
        '  Example: \'Monday\', \'Sunday\', etc.'
      );
    } else {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (!validDays.includes(config.weeklySummaryStartDay)) {
        errors.push(
          `${chalk.red('Invalid day name for')} ${chalk.yellow('weeklySummaryStartDay')}\n` +
          `  Expected one of: ${validDays.join(', ')}\n` +
          `  Received: '${config.weeklySummaryStartDay}'`
        );
      }
    }
  }

  if (config.weeklySummaryEnabled !== undefined && typeof config.weeklySummaryEnabled !== 'boolean') {
    errors.push(
      `${chalk.red('Invalid value for')} ${chalk.yellow('weeklySummaryEnabled')}\n` +
      '  Expected: A boolean (true or false)\n' +
      `  Received: ${typeof config.weeklySummaryEnabled}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates config and logs errors, optionally exiting the process on validation failure.
 *
 * @param {import('./types.js').ShadowReportConfig} config - The configuration object to validate
 * @param {string} configPath - Path to the config file
 * @param {boolean} [exitOnError=false] - Whether to exit the process if validation fails
 * @returns {boolean} True if validation passed, false otherwise
 */
export function validateAndReportConfig(config, configPath, exitOnError = false) {
  const result = validateConfig(config, configPath);

  if (!result.valid) {
    console.error(
      chalk.red.bold('\n❌ Configuration validation failed:\n')
    );
    result.errors.forEach((error, index) => {
      console.error(`\n${index + 1}. ${error}\n`);
    });
    console.error(
      chalk.yellow(`Config file: ${configPath}\n`)
    );

    if (exitOnError) {
      console.error(
        chalk.yellow(
          'Please fix the configuration errors above and try again.\n' +
          'For setup help, run: ' + chalk.green('npx qasr-setup')
        )
      );
      process.exit(1);
    }

    return false;
  }

  return true;
}
