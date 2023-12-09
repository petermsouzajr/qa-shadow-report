let packageConfig = {};

export const setConfig = (config) => {
  packageConfig = config;
};

// Export packageConfig if needed elsewhere
export { packageConfig };

// Define the formula keys for daily report header metrics.
export const FORMULA_KEYS = [
  'formula tests passed',
  'formula base',
  'formula skipped/pending',
  'formula total',
];

export const GOOGLE_SHEET_ID = () => {
  return packageConfig && packageConfig.googleSpreadsheetId
    ? packageConfig.googleSpreadsheetId
    : '6d567d67576fgd76dfg76dghfg';
};

export const TEST_DATA = () => {
  return packageConfig && packageConfig.testData
    ? packageConfig.testData
    : 'output.json';
};

// Define the formula template for daily report header metrics.
export const FORMULA_TEMPLATES = [
  `=COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "passed")&" of "&COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*")&"  -  "&"("&ROUND(COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "passed")/(COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*")) * 100)&"%)"`,
  `=COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "*{type}*")&" ("&ROUND(COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "*{type}*")/{bodyRowCount} * 100)&"%)"`,
  `=COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*passed*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*failed*")&" ("&ROUND(COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*passed*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*failed*")/{bodyRowCount} * 100)&"%)"`,
  `=ROWS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows})`,
];

export const COLUMNS_AVAILABLE = () => {
  return packageConfig && packageConfig.columns
    ? packageConfig.columns
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
};

export const TEST_TARGETS_AVAILABLE = () => {
  return packageConfig && packageConfig.testTargets
    ? packageConfig.testTargets
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
};

export const TEST_PURPOSES_AVAILABLE = () => {
  return packageConfig && packageConfig.testPurposes
    ? packageConfig.testPurposes
    : [
        'smoke',
        'regression',
        'sanity',
        'exploratory',
        'functional',
        'load',
        'stress',
        'usability',
        'compitibility',
        'alpha',
        'beta',
      ];
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
  return packageConfig && packageConfig.teamNames
    ? packageConfig.teamNames
    : ['oregano', 'spoofer', 'juniper', 'occaecati', 'wilkins', 'canonicus'];
};
