import chalk from 'chalk';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Since __dirname is not available in ES modules, we need to derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the search from the parent directory of the current __dirname
const parentDir = dirname(dirname(__dirname));

// Function to find the config file
const findConfigFile = (startPath, baseFileName) => {
  const extensions = ['.js', '.ts']; // Array of possible extensions
  let currentDir = startPath;
  while (currentDir !== path.parse(currentDir).root) {
    for (const ext of extensions) {
      const fileNameWithExt = baseFileName + ext;
      const filePath = path.join(currentDir, fileNameWithExt);

      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }
    currentDir = path.dirname(currentDir);
  }
  return null;
};

// Function to get config path from arguments
const getConfigPathFromArgs = () => {
  const args = process.argv;
  const configIndex = args.findIndex((arg) => arg === '--config') + 1;
  return configIndex > 0 ? args[configIndex] : null;
};

const defaultConfigPath = path.join(__dirname, 'shadowReportConfig.js');
const absoluteDefaultConfigPath = pathToFileURL(defaultConfigPath).href;

// Main logic to determine config path
const configPath =
  getConfigPathFromArgs() ||
  findConfigFile(parentDir, 'shadowReportConfig') ||
  absoluteDefaultConfigPath;

  let shadowConfigDetails = {};

  try {
    if (fs.existsSync(configPath)) {
      const shadowConfig = await import(configPath);
      shadowConfigDetails = shadowConfig.default;
    } else {
      // console.info(chalk.yellow('No configuration file found. Using defaults.'));
    }
  } catch (error) {
    console.error(chalk.red(`Error loading configuration file at path: ${configPath}`));
    console.error(chalk.red(error));
  
}

// Define the formula keys for daily report header metrics.
export const FORMULA_KEYS = [
  'formula tests passed',
  'formula base',
  'formula skipped/pending',
  'formula total',
];

export const GOOGLE_SHEET_ID = () => {
  let sheetId
    if (shadowConfigDetails && shadowConfigDetails.googleSpreadsheetId) {
       shadowConfigDetails.googleSpreadsheetId
    } else {
      sheetId = false
    }
  return sheetId;
};

export const GOOGLE_KEYFILE_PATH = () => {
  let keyFilePath
    if (shadowConfigDetails && shadowConfigDetails.googleKeyFilePath) {
       keyFilePath = shadowConfigDetails.googleKeyFilePath
    } else {
      keyFilePath = false
    }
  return keyFilePath;
};

export const TEST_DATA = (cypress) => {
  const testData =
    shadowConfigDetails && shadowConfigDetails.testData
      ? shadowConfigDetails.testData
      : cypress
      ? 'output2.json'
      : 'output3.json';
  return testData;
};

// Define the formula template for daily report header metrics.
export const FORMULA_TEMPLATES = [
  '=COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "passed")&" of "&COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*")&"  -  "&"("&ROUND(COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "passed")/(COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*")) * 100)&"%)"',
  '=COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "*{type}*")&" ("&ROUND(COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "*{type}*")/{bodyRowCount} * 100)&"%)"',
  '=COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*passed*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*failed*")&" ("&ROUND(COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*passed*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*failed*")/{bodyRowCount} * 100)&"%)"',
  '=ROWS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows})',
];

const cache = {};

function getCachedOrCompute(key, computeFunction) {
  if (cache[key]) {
    return cache[key];
  }
  const data = computeFunction();
  cache[key] = data;
  return data;
}

/**
 * Gets the available columns for test reports, adjusted for Playwright if specified.
 * @param {boolean} playwright - Flag indicating whether to include 'browser' column for Playwright.
 * @returns {Array} An array of column names.
 */
export const COLUMNS_AVAILABLE = (playwright) => {
  return getCachedOrCompute(
    `columns-${playwright ? 'playwright' : 'default'}`,
    () => {
      let baseColumns = [
        'area',
        'spec',
        'test name',
        'type',
        'category',
        'team',
        'priority',
        'status',
        'state',
        'manual case',
        'error',
        'speed',
      ];

      if (playwright) {
        baseColumns = ['browser', ...baseColumns];
      }

      if (shadowConfigDetails && Array.isArray(shadowConfigDetails.columns)) {
        // console.info(chalk.green('Using custom columns list.'));
        return shadowConfigDetails.columns;
      } else {
        // console.info(chalk.blue('Using default columns list.'));
        return baseColumns;
      }
    }
  );
};

export const TEST_TYPES_AVAILABLE = () => {
  return getCachedOrCompute('testTypes', () => {
    const hasCustomTypes =
      shadowConfigDetails &&
      Array.isArray(shadowConfigDetails.testTypes) &&
      shadowConfigDetails.testTypes.length > 0;
    if (hasCustomTypes) {
      console.info(chalk.green('Using custom test types list.'));
      return shadowConfigDetails.testTypes;
    } else {
      console.info(chalk.blue('Using default test types list.'));
      return [
        'api',
        'ui',
        'unit',
        'integration',
        'endToEnd',
        'performance',
        'security',
        'database',
        'accessibility',
        'web',
        'mobile',
      ];
    }
  });
};

export const TEST_CATEGORIES_AVAILABLE = () => {
  return getCachedOrCompute('testCategories', () => {
    const hasCustomCategories =
      shadowConfigDetails &&
      Array.isArray(shadowConfigDetails.testCategories) &&
      shadowConfigDetails.testCategories.length > 0;
    if (hasCustomCategories) {
      console.info(chalk.green('Using custom test category list.'));
      return shadowConfigDetails.testCategories;
    } else {
      console.info(chalk.blue('Using default test category list.'));
      return [
        'smoke',
        'regression',
        'sanity',
        'exploratory',
        'functional',
        'load',
        'stress',
        'usability',
        'compatibility',
        'alpha',
        'beta',
      ];
    }
  });
};

export const DEFAULT_HEADER_METRICS = [
  '# passed tests',
  '# failed tests',
  '# skipped/pending tests',
  '# total tests',
];

export const HEADER_INDICATORS = ['test name', 'state'];

export const FOOTER_ROW = '- END -';

export const ALL_TEAM_NAMES = () => {
  return getCachedOrCompute('teamNames', () => {
    const hasCustomTeams =
      shadowConfigDetails &&
      Array.isArray(shadowConfigDetails.teamNames) &&
      shadowConfigDetails.teamNames.length > 0;
    if (hasCustomTeams) {
      console.info(chalk.green('Using custom team names list.'));
      return shadowConfigDetails.teamNames;
    } else {
      console.info(chalk.blue('Using default team names list.'));
      return [
        'raptors',
        'kimchi',
        'protus',
        'danza',
        'sloth',
        'winter',
        'oregano',
        'spoofer',
        'juniper',
        'occaecati',
        'wilkins',
        'canonicus',
      ];
    }
  });
};
