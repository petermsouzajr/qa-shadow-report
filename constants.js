import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';

dotenv.config();
// Since __dirname is not available in ES modules, we need to derive it
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Function to find the project root directory
const findProjectRoot = (startPath) => {
  let currentDir = startPath;

  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      // Check if the current directory is inside a node_modules directory
      if (!currentDir.includes(path.sep + 'node_modules')) {
        return currentDir;
      }
    }

    currentDir = path.dirname(currentDir);
  }

  return null;
};

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

// Determine the project root path
const projectRootPath = findProjectRoot(__dirname);

if (!projectRootPath) {
  console.error('Error: Could not determine the project root path.');
  process.exit(1);
}

const defaultConfigPath = path.join(__dirname, 'shadowReportConfig.js');
const absoluteDefaultConfigPath = pathToFileURL(defaultConfigPath).href;

// Main logic to determine config path
const configPath =
  getConfigPathFromArgs() ||
  findConfigFile(projectRootPath, 'shadowReportConfig') ||
  absoluteDefaultConfigPath;

let shadowConfigDetails = {};

try {
  if (fs.existsSync(configPath)) {
    const shadowConfig = await import(pathToFileURL(configPath).href);
    shadowConfigDetails = shadowConfig.default || {};
  }
} catch (error) {
  console.error(
    chalk.red(`Error loading configuration file at path: ${configPath}`)
  );
  console.error(chalk.red(error.message));
}

// Define the formula keys for daily report header metrics.
export const FORMULA_KEYS = [
  'formula tests passed',
  'formula base',
  'formula skipped/pending',
  'formula total',
];

export const GOOGLE_SHEET_ID = () => {
  let sheetId = '';

  if (
    shadowConfigDetails &&
    typeof shadowConfigDetails.googleSpreadsheetUrl === 'string'
  ) {
    const envVarMatch = shadowConfigDetails.googleSpreadsheetUrl.match(
      /^process\.env\.(\w+)$/
    );

    if (envVarMatch) {
      const envVarName = envVarMatch[1]; // Extract the environment variable name (e.g., 'SHEET_ID')

      // Check if the environment variable exists in process.env
      if (process.env[envVarName]) {
        sheetId = process.env[envVarName].split('/d/')[1].split('/')[0] || ''; // Set the value from process.env
      }
    } else {
      sheetId = shadowConfigDetails.googleSpreadsheetUrl
        .split('/d/')[1]
        .split('/')[0]; // Use the raw config value if it's not an environment variable
    }
  }

  return sheetId;
};

export const GOOGLE_KEYFILE_PATH = () => {
  let keyFilePath = '';

  if (
    shadowConfigDetails &&
    typeof shadowConfigDetails.googleKeyFilePath === 'string'
  ) {
    const envVarMatch = shadowConfigDetails.googleKeyFilePath.match(
      /^process\.env\.(\w+)$/
    );

    if (envVarMatch) {
      const envVarName = envVarMatch[1]; // Extract the environment variable name (e.g., 'GOOGLE_KEY_FILE_PATH')

      // Check if the environment variable exists in process.env
      if (process.env[envVarName]) {
        keyFilePath = process.env[envVarName] || ''; // Set the value from process.env
      }
    } else {
      keyFilePath = shadowConfigDetails.googleKeyFilePath; // Use the raw config value if it's not an environment variable
    }
  }

  return keyFilePath;
};

export const TEST_DATA = (cypress) => {
  const shadowConfigFile = shadowConfigDetails && shadowConfigDetails.testData;
  const cypressFile = 'cypressTestResults.json';
  const playwrightFile = 'playwrightTestResults.json';

  const testData = shadowConfigFile
    ? shadowConfigFile
    : cypress
      ? cypressFile
      : playwrightFile;

  const testDataPath = path.resolve(projectRootPath, testData);

  const cypressExists = fs.existsSync(path.resolve(__dirname, cypressFile));
  const playwrightExists = fs.existsSync(
    path.resolve(__dirname, playwrightFile)
  );

  if (!fs.existsSync(configPath)) {
    console.error(
      chalk.yellow(
        `Configuration file not found. ` + `run ${chalk.green('qasr-setup')}.`
      )
    );
    process.exit(1);
  }

  if (!cypressExists && !playwrightExists && !shadowConfigFile) {
    console.log(
      chalk.yellow(
        `It looks like you have added a config file ${chalk.green(configPath)} but haven't added a filepath to your results, please add a path to your JSON test results (usually compiled from mochawesome).`
      )
    );
    process.exit(1);
  }

  if (!fs.existsSync(testDataPath)) {
    console.error(
      chalk.yellow(
        `Test results file ${chalk.green(`testData:"${testData}`)}" not found at path: ${chalk.green(testDataPath)}. ` +
          `Please ensure the file is present.`
      )
    );
    process.exit(1);
  }

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
        baseColumns.shift();
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

const detectFramework = () => {
  const projectRoot = process.cwd();
  const files = fs.readdirSync(projectRoot);

  const cypressRegex = /cypress\./i;
  const playwrightRegex = /playwright\./i;
  const webdriverioRegex = /wdio\./i;

  for (const file of files) {
    if (cypressRegex.test(file)) {
      return 'cypress';
    }
    if (playwrightRegex.test(file)) {
      return 'playwright';
    }
    if (webdriverioRegex.test(file)) {
      return 'webdriverio';
    }
  }

  return ''; // Fallback if no framework is detected
};

export const CSV_DOWNLOADS_PATH = () => {
  const projectRoot = findProjectRoot(process.cwd());
  const framework = detectFramework();

  let downloadsPath =
    shadowConfigDetails &&
    typeof shadowConfigDetails.csvDownloadsPath === 'string'
      ? path.resolve(projectRoot, shadowConfigDetails.csvDownloadsPath) // Use the user-specified path
      : path.join(projectRoot, framework, 'downloads'); // Fallback to system default

  return getCachedOrCompute('csvDownloadsPath', () => {
    const hasCustomTypes =
      shadowConfigDetails &&
      Array.isArray(shadowConfigDetails.csvDownloadsPath) &&
      shadowConfigDetails.csvDownloadsPath.length > 0;

    if (hasCustomTypes) {
      downloadsPath = shadowConfigDetails.csvDownloadsPath;
      console.info(
        chalk.green(
          `downloading CSV to custom downloads folder path ${downloadsPath}.`
        )
      );
      return shadowConfigDetails.csvDownloadsPath;
    } else {
      console.info(chalk.blue('Using default downloads folder.'));
    }
    return downloadsPath;
  });
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
