import { jest } from '@jest/globals';
import { printHelp } from './printHelp.js';

describe('printHelp', () => {
  let log;

  beforeEach(() => {
    log = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    log.mockRestore();
  });

  it('prints the complete help message in one call', () => {
    printHelp();

    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(expect.any(String));

    const output = log.mock.calls[0][0].replace(/\u001b\[[0-9;]*m/g, '');
    expect(output).toContain('qa-shadow-report - Test reporting for Cypress & Playwright');
    expect(output).toMatch(/USAGE:[\s\S]*FRAMEWORK:[\s\S]*COMMANDS:[\s\S]*OPTIONS:[\s\S]*SETUP:[\s\S]*EXAMPLES:[\s\S]*DOCUMENTATION:[\s\S]*CONFIGURATION:/);
  });

  it('documents framework aliases, commands, and options', () => {
    printHelp();
    const output = log.mock.calls[0][0].replace(/\u001b\[[0-9;]*m/g, '');

    for (const entry of ['cypress', 'cy', 'playwright', 'pw', 'todays-report', 'weekly-summary', 'monthly-summary', '--csv', '--duplicate', '--help']) {
      expect(output).toContain(entry);
    }
    expect(output).toContain('Summaries not supported in CSV format');
  });

  it('shows setup, examples, documentation, and configuration requirements', () => {
    printHelp();
    const output = log.mock.calls[0][0].replace(/\u001b\[[0-9;]*m/g, '');

    for (const entry of [
      'qasr-setup',
      'qa-shadow-report cypress --csv',
      'qa-shadow-report playwright todays-report --duplicate',
      'qasr pw --csv',
      'https://github.com/petermsouzajr/qa-shadow-report#readme',
      'shadowReportConfig.js',
      'testData',
      'googleSpreadsheetUrl',
      'googleKeyFilePath',
    ]) {
      expect(output).toContain(entry);
    }
  });
});
