import { jest } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { validateConfig, validateAndReportConfig } from './configValidator.js';

const configPath = path.join(os.tmpdir(), 'qasr-validator-tests', 'shadowReportConfig.js');
const validConfig = () => ({
  googleSpreadsheetUrl: 'sheet_ID-123',
  googleKeyFilePath: 'process.env.GOOGLE_KEY_FILE',
  testData: './results.json',
});
const validate = (config, options) => validateConfig(config, configPath, options);

describe('validateConfig', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    process.argv = ['node', 'cli.js'];
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('accepts valid Sheets configuration and supported URL or environment references', () => {
    expect(validate(validConfig())).toEqual({ valid: true, errors: [] });
    expect(validate({ ...validConfig(), googleSpreadsheetUrl: 'https://docs.google.com/spreadsheets/d/sheet_ID-123/edit' }).valid).toBe(true);
    expect(validate({ ...validConfig(), googleSpreadsheetUrl: 'process.env.SHEET_ID' }).valid).toBe(true);
  });

  it('reports missing required Google fields and test data', () => {
    const result = validate({});
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(3);
    for (const field of ['googleSpreadsheetUrl', 'googleKeyFilePath', 'testData']) {
      expect(result.errors.some((error) => error.includes(`Missing required field: ${field}`))).toBe(true);
    }
  });

  it.each([
    ['googleSpreadsheetUrl', 42, 'Invalid value for'],
    ['googleSpreadsheetUrl', 'bad URL!', 'Invalid format for'],
    ['googleKeyFilePath', 42, 'Invalid value for'],
    ['testData', 42, 'Invalid value for'],
  ])('rejects invalid %s', (field, value, message) => {
    const result = validate({ ...validConfig(), [field]: value });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain(`${message} ${field}`);
  });

  it.each([['--csv'], ['--help']])('skips Google validation for %s', (flag) => {
    process.argv.push(flag);
    expect(validate({ testData: './results.json' })).toEqual({ valid: true, errors: [] });
    expect(validate({}).errors).toHaveLength(1);
    expect(validate({}).errors[0]).toContain('testData');
  });

  it('skips Google validation through options while still validating other fields', () => {
    expect(validate({ testData: './results.json' }, { skipGoogle: true }).valid).toBe(true);
    expect(validate({ testData: '' }, { skipGoogle: true }).errors[0]).toContain('testData');
  });

  it('checks credential paths relative to the config file', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'qasr-validator-'));
    const localConfigPath = path.join(directory, 'shadowReportConfig.js');
    try {
      fs.writeFileSync(path.join(directory, 'credentials.json'), '{}');
      expect(validateConfig({ ...validConfig(), googleKeyFilePath: './credentials.json' }, localConfigPath).valid).toBe(true);

      const missing = validateConfig({ ...validConfig(), googleKeyFilePath: './missing.json' }, localConfigPath);
      expect(missing.valid).toBe(false);
      expect(missing.errors).toHaveLength(1);
      expect(missing.errors[0]).toContain(path.join(directory, 'missing.json'));
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it.each(['teamNames', 'testTypes', 'testCategories', 'columns'])('requires %s to be an array when provided', (field) => {
    expect(validate({ ...validConfig(), [field]: 'wrong' }).errors[0]).toContain(`Invalid value for ${field}`);
    expect(validate({ ...validConfig(), [field]: [] }).valid).toBe(true);
  });

  it('validates optional path, weekday, and boolean fields', () => {
    const result = validate({
      ...validConfig(), csvDownloadsPath: ' ', weeklySummaryStartDay: 'Funday', weeklySummaryEnabled: 'true',
    });
    expect(result.errors).toHaveLength(3);
    expect(result.errors[0]).toContain('csvDownloadsPath');
    expect(result.errors[1]).toContain('Invalid day name for weeklySummaryStartDay');
    expect(result.errors[2]).toContain('weeklySummaryEnabled');
    expect(validate({ ...validConfig(), weeklySummaryStartDay: 1 }).errors[0]).toContain('weeklySummaryStartDay');
    expect(validate({ ...validConfig(), csvDownloadsPath: './downloads', weeklySummaryStartDay: 'Monday', weeklySummaryEnabled: false }).valid).toBe(true);
  });
});

describe('validateAndReportConfig', () => {
  let error;
  let exit;

  beforeEach(() => {
    error = jest.spyOn(console, 'error').mockImplementation(() => {});
    exit = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true without logging or exiting for valid config', () => {
    expect(validateAndReportConfig(validConfig(), configPath)).toBe(true);
    expect(error).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });

  it('reports numbered errors and the config path without exiting by default', () => {
    expect(validateAndReportConfig({}, configPath)).toBe(false);
    const output = error.mock.calls.map(([message]) => message).join('');
    expect(output).toContain('Configuration validation failed');
    expect(output).toContain('1. Missing required field: googleSpreadsheetUrl');
    expect(output).toContain('2. Missing required field: googleKeyFilePath');
    expect(output).toContain('3. Missing required field: testData');
    expect(output).toContain(`Config file: ${configPath}`);
    expect(exit).not.toHaveBeenCalled();
  });

  it('exits with status 1 and setup guidance when requested', () => {
    expect(validateAndReportConfig({}, configPath, true)).toBe(false);
    expect(exit).toHaveBeenCalledWith(1);
    expect(error.mock.calls.map(([message]) => message).join('')).toContain('npx qasr-setup');
  });
});
