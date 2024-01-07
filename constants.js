import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Since __dirname is not available in ES modules, we need to derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the search from the parent directory of the current __dirname
const parentDir = dirname(dirname(__dirname));

// Function to find the config file
function findConfigFile(startPath, baseFileName) {
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
}

// Function to get config path from arguments
function getConfigPathFromArgs() {
  const args = process.argv;
  const configIndex = args.findIndex((arg) => arg === '--config') + 1;
  return configIndex > 0 ? args[configIndex] : null;
}

const defaultConfigPath = path.join(__dirname, 'shadowReportConfig.js');

// Main logic to determine config path
const configPath =
  getConfigPathFromArgs() ||
  findConfigFile(parentDir, 'shadowReportConfig') ||
  defaultConfigPath;

if (!configPath) {
  console.error(
    'Please specify the path to the shadowReportConfig.js file or ensure it exists in the project root.'
  );
  process.exit(1);
}

const shadowConfig = await import(configPath);
const shadowConfigDetails = shadowConfig.default;

// Define the formula keys for daily report header metrics.
export const FORMULA_KEYS = [
  'formula tests passed',
  'formula base',
  'formula skipped/pending',
  'formula total',
];

export const GOOGLE_SHEET_ID = () => {
  const sheetId =
    shadowConfigDetails && shadowConfigDetails.googleSpreadsheetId
      ? shadowConfigDetails.googleSpreadsheetId
      : '6d567d67576fgd76dfg76dghfg';
  return sheetId;
};

export const TEST_DATA = () => {
  const testData =
    shadowConfigDetails && shadowConfigDetails.testData
      ? shadowConfigDetails.testData
      : 'output2.json';
  return testData;
};

// Define the formula template for daily report header metrics.
export const FORMULA_TEMPLATES = [
  '=COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "passed")&" of "&COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*")&"  -  "&"("&ROUND(COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "passed")/(COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*")) * 100)&"%)"',
  '=COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "*{type}*")&" ("&ROUND(COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "*{type}*")/{bodyRowCount} * 100)&"%)"',
  '=COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*passed*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*failed*")&" ("&ROUND(COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*passed*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*failed*")/{bodyRowCount} * 100)&"%)"',
  '=ROWS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows})',
];

export const COLUMNS_AVAILABLE = () => {
  const columns =
    shadowConfigDetails && shadowConfigDetails.columns
      ? shadowConfigDetails.columns
      : [
        'area',
        'spec',
        'test name',
        'type',
        'category',
        'team',
        'priority',
        'status',
        'state',
        'testrail id',
        'error',
        'speed',
      ];
  return columns;
};

export const TEST_TARGETS_AVAILABLE = () => {
  const targets =
    shadowConfigDetails && shadowConfigDetails.testTargets
      ? shadowConfigDetails.testTargets
      : [
        'api',
        'ui',
        'unit',
        'integration',
        'endToEnd',
        'performance',
        'security',
        'database',
        'accessibility',
        'mobile',
      ];
  return targets;
};

export const TEST_PURPOSES_AVAILABLE = () => {
  const purposes =
    shadowConfigDetails && shadowConfigDetails.testPurposes
      ? shadowConfigDetails.testPurposes
      : [
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
  return purposes;
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
  const teams =
    shadowConfigDetails && shadowConfigDetails.teamNames
      ? shadowConfigDetails.teamNames
      : ['oregano', 'spoofer', 'juniper', 'occaecati', 'wilkins', 'canonicus'];
  return teams;
};
