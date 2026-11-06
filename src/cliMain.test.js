import { jest } from '@jest/globals';

const originalArgv = process.argv;
const originalCI = process.env.CI;

const loadCli = async ({ args = [], configured = true, keyFile = 'key.json', sheetId = 'sheet-id', ci = undefined, dailyError, spawnError = false } = {}) => {
  jest.resetModules();
  process.argv = ['node', 'cli.js', ...args];
  if (ci === undefined) delete process.env.CI;
  else process.env.CI = ci;

  const exit = jest.spyOn(process, 'exit').mockImplementation(() => {});
  const child = { handlers: {} };
  const spawn = jest.fn(() => ({
    on: jest.fn((event, callback) => {
      child.handlers[event] = callback;
      return child;
    }),
  }));
  const daily = dailyError
    ? jest.fn().mockRejectedValue(new Error(dailyError))
    : jest.fn().mockResolvedValue(undefined);
  const monthly = jest.fn().mockResolvedValue(undefined);
  const weekly = jest.fn().mockResolvedValue(undefined);
  const main = jest.fn().mockResolvedValue(undefined);

  jest.unstable_mockModule('../scripts/configuredStatus.js', () => ({
    isProjectConfigured: jest.fn(() => configured),
  }));
  jest.unstable_mockModule('./index.js', () => ({ main }));
  jest.unstable_mockModule('./sharedMethods/dailyReportHandler.js', () => ({
    handleDailyReport: daily,
  }));
  jest.unstable_mockModule('./sharedMethods/summaryHandler.js', () => ({
    handleSummary: monthly,
    handleWeeklySummary: weekly,
  }));
  jest.unstable_mockModule('../constants.js', () => ({
    GOOGLE_KEYFILE_PATH: jest.fn(() => keyFile),
    GOOGLE_SHEET_ID: jest.fn(() => sheetId),
  }));
  jest.unstable_mockModule('child_process', () => ({ spawn }));

  await import('./cliMain.js');
  await new Promise((resolve) => setImmediate(resolve));
  if (spawnError) child.handlers.error?.(new Error('spawn failed'));
  return { exit, spawn, daily, monthly, weekly, main };
};

afterEach(() => {
  process.argv = originalArgv;
  if (originalCI === undefined) delete process.env.CI;
  else process.env.CI = originalCI;
  jest.restoreAllMocks();
});

describe('cliMain boundaries', () => {
  it('dispatches todays-report and normalizes framework aliases', async () => {
    const { daily } = await loadCli({ args: ['todays-report', 'cy'] });

    expect(daily).toHaveBeenCalledWith({
      csv: false,
      duplicate: false,
      cypress: true,
      playwright: false,
    });
  });

  it.each([
    ['monthly-summary', 'playwright', 'monthly'],
    ['weekly-summary', 'pw', 'weekly'],
  ])('dispatches %s to the correct handler', async (command, framework, handler) => {
    const result = await loadCli({ args: [command, framework, '--duplicate'] });
    expect(result[handler]).toHaveBeenCalledWith({
      csv: false,
      duplicate: true,
      cypress: false,
      playwright: true,
    });
  });

  it('dispatches an unknown command to the default main flow', async () => {
    const { main } = await loadCli({ args: ['cypress'] });
    expect(main).toHaveBeenCalledWith({
      csv: false,
      duplicate: false,
      cypress: true,
      playwright: false,
    });
  });

  it('forces CSV when Google configuration is missing outside CI', async () => {
    const { main, spawn } = await loadCli({ args: ['cypress'], keyFile: '', sheetId: false });
    expect(main).toHaveBeenCalledWith(expect.objectContaining({ csv: true }));
    expect(spawn).not.toHaveBeenCalled();
  });

  it('exits in CI when Google configuration is missing', async () => {
    const { exit } = await loadCli({ args: ['cypress'], keyFile: '', sheetId: false, ci: 'true' });
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('starts post-install when the project is not configured', async () => {
    const { spawn } = await loadCli({ args: ['cypress'], configured: false });
    expect(spawn).toHaveBeenCalledWith(
      'node',
      [expect.stringMatching(/scripts\/postInstall\.js$/)],
      { stdio: 'inherit' }
    );
  });

  it('exits when the post-install process fails to start', async () => {
    const { exit } = await loadCli({ args: ['cypress'], configured: false, spawnError: true });
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('exits when no framework is provided', async () => {
    const { exit } = await loadCli({ args: [] });
    expect(exit).toHaveBeenCalledWith(1);
  });

  it.each([
    ['monthly-summary', false],
    ['weekly-summary', true],
  ])('rejects CSV output for %s', async (command, duplicate) => {
    const { exit, monthly, weekly, main } = await loadCli({
      args: [command, 'cypress', '--csv', ...(duplicate ? ['--duplicate'] : [])],
    });
    expect(exit).toHaveBeenCalledWith(1);
    expect(monthly).not.toHaveBeenCalled();
    expect(weekly).not.toHaveBeenCalled();
    expect(main).not.toHaveBeenCalled();
  });

  it('handles a report-handler rejection without throwing from the CLI', async () => {
    const { daily } = await loadCli({ args: ['todays-report', 'cypress'], dailyError: 'handler failed' });
    expect(daily).toHaveBeenCalled();
  });
});
