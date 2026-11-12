import { jest } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformMaestroToFriendlyFormat } from './convertMaestro.js';
import { buildDailyPayload } from '../dailyReportMethods/reportGeneration/buildDailyPayload.js';
import { calculateDailySummaryMetrics } from './csvHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Real Maestro 2.12.0 output (web platform, headless Chrome); see __tests__/data/maestro.
const FIXTURE_ROOT = path.resolve(__dirname, '../../__tests__/data/maestro');

describe('Maestro report end to end', () => {
  let logSpy;
  let warnSpy;
  let previousConfig;

  beforeAll(() => {
    previousConfig = globalThis.shadowConfigDetails;
    globalThis.shadowConfigDetails = {
      teamNames: ['Checkout', 'Profile', 'Onboarding'],
      testTypes: ['mobile'],
      testCategories: ['smoke', 'regression'],
    };
  });
  afterAll(() => {
    globalThis.shadowConfigDetails = previousConfig;
  });
  beforeEach(() => {
    logSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  const buildFromFixtures = async () => {
    const testPayload = transformMaestroToFriendlyFormat({
      reportPath: path.join(FIXTURE_ROOT, 'maestro-results/report.xml'),
      outputDir: path.join(FIXTURE_ROOT, 'maestro-results'),
      flowsDir: null,
      projectRoot: FIXTURE_ROOT,
    });
    return buildDailyPayload(testPayload, false);
  };

  it('builds one row per labeled step with area, spec, type, team, category and case', async () => {
    const { bodyPayload } = await buildFromFixtures();
    const byCase = Object.fromEntries(bodyPayload.map((row) => [row[9] || row[2], row]));

    expect(bodyPayload).toHaveLength(12);
    expect(byCase.C1043.slice(0, 6)).toEqual([
      'checkout',
      'saved-card',
      'completes payment with saved card',
      'mobile',
      'smoke',
      'Checkout',
    ]);
    expect(byCase.C1043[8]).toBe('failed');
    expect(byCase.C1044[8]).toBe('not run');
    expect(byCase.C1044[10]).toBe('blocked by C1043');
    expect(byCase.C1051[8]).toBe('failed');
    expect(byCase.C1051[10]).toBe('optional check failed (non-blocking)');
    expect(byCase.C2210.slice(0, 6)).toEqual([
      'profile',
      'edit-avatar',
      'edit avatar',
      'mobile',
      'smoke',
      'Profile',
    ]);
    const unlabeled = byCase['unlabeled step failed in sign up new user'];
    expect(unlabeled[5]).toBe('Onboarding');
    expect(unlabeled[8]).toBe('failed');
    expect(unlabeled[10]).toBe('Element not found: Text matching regex: Accept terms');
  });

  it('adds a "# not run tests" header metric after failed', async () => {
    const { headerPayload } = await buildFromFixtures();
    const metrics = headerPayload.map((row) => row[7]).filter(Boolean);
    expect(metrics).toEqual([
      '# passed tests',
      '# failed tests',
      '# not run tests',
      '# skipped/pending tests',
      '# total tests',
      'status',
    ]);
    expect(headerPayload[2][8]).toBe('not run formula base');
  });

  it('counts not run separately in the CSV summary', async () => {
    const { bodyPayload } = await buildFromFixtures();
    const summary = calculateDailySummaryMetrics(bodyPayload);
    const overall = summary.map((row) => [row[7], row[8]]).filter(([k]) => k);
    expect(overall).toEqual([
      ['# passed tests', '7 (58%)'],
      ['# failed tests', '3 (25%)'],
      ['# not run tests', '2 (17%)'],
      ['# skipped/pending tests', '0 (0%)'],
      ['# total tests', '12'],
    ]);
  });

  it('keeps the CSV summary unchanged when there are no not run rows', () => {
    const summary = calculateDailySummaryMetrics([
      ['a', 's', 't', 'ui', 'smoke', 'team', '', '', 'passed', '', '', ''],
      ['a', 's', 't2', 'ui', 'smoke', 'team', '', '', 'pending', '', '', ''],
    ]);
    const overall = summary.map((row) => row[7]).filter(Boolean);
    expect(overall).toEqual([
      '# passed tests',
      '# failed tests',
      '# skipped/pending tests',
      '# total tests',
    ]);
  });
});
