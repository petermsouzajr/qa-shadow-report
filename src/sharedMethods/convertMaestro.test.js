import { jest } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  NOT_RUN_STATE,
  buildFlowTitle,
  findCommandsFile,
  parseMaestroJUnit,
  readFlowLabels,
  stepModeTests,
  transformMaestroToFriendlyFormat,
} from './convertMaestro.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Fixtures come from a real Maestro 2.12.0 run (web platform, headless Chrome).
const FIXTURE_ROOT = path.resolve(__dirname, '../../__tests__/data/maestro');
const REPORT = path.join(FIXTURE_ROOT, 'maestro-results/report.xml');
const OUTPUT_DIR = path.join(FIXTURE_ROOT, 'maestro-results');

const transformFixtures = (overrides = {}) =>
  transformMaestroToFriendlyFormat({
    reportPath: REPORT,
    outputDir: OUTPUT_DIR,
    flowsDir: null,
    projectRoot: FIXTURE_ROOT,
    ...overrides,
  });

const flowByName = (results, name) => results.find((r) => r.title === name);
const rows = (flow) =>
  flow.tests.map((t) => ({
    title: t.fullTitle,
    state: t.state,
    error: t.err.message || '',
  }));

describe('convertMaestro', () => {
  let warnSpy;
  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('parseMaestroJUnit', () => {
    it('reads flows, status, properties and failure text from a real report', () => {
      const flows = parseMaestroJUnit(fs.readFileSync(REPORT, 'utf8'));
      expect(flows).toHaveLength(5);
      const savedCard = flows.find((f) => f.name === 'checkout with saved card');
      expect(savedCard.file).toBe('maestro/mobile/checkout/saved-card.yaml');
      expect(savedCard.status).toBe('ERROR');
      expect(savedCard.failure).toBe('Assertion is false: "Payment complete" is visible');
      const avatar = flows.find((f) => f.name === 'edit avatar');
      expect(avatar.properties).toMatchObject({
        team: 'Profile',
        caseId: 'C2210',
        tags: 'smoke',
      });
      expect(avatar.failure).toBeNull();
    });

    it('returns an empty list for a report with no test cases', () => {
      expect(parseMaestroJUnit('<testsuites></testsuites>')).toEqual([]);
    });
  });

  describe('readFlowLabels', () => {
    it('reads top-level step labels in order', () => {
      expect(
        readFlowLabels(path.join(FIXTURE_ROOT, 'maestro/mobile/checkout/saved-card.yaml'))
      ).toEqual([
        '[Checkout][smoke][C1042] shows the saved card',
        '[Checkout][smoke][C1043] completes payment with saved card',
        '[Checkout][regression][C1044] sends a receipt',
      ]);
    });

    it('does not read labels inside a runFlow subflow', () => {
      const labels = readFlowLabels(
        path.join(FIXTURE_ROOT, 'maestro/mobile/checkout/reorder.yaml')
      );
      expect(labels.some((l) => l.includes('C9999'))).toBe(false);
      expect(labels.some((l) => l.includes('C1060'))).toBe(true);
    });
  });

  describe('findCommandsFile', () => {
    it('finds the Maestro 2.x per-flow folder layout', () => {
      const file = findCommandsFile(
        ['/out/2026-10-31_150447/edit avatar/commands.json'],
        'edit avatar'
      );
      expect(file).toBe('/out/2026-10-31_150447/edit avatar/commands.json');
    });

    it('finds the Maestro 1.x commands-(flow).json layout', () => {
      const file = findCommandsFile(
        ['/out/run/commands-(edit avatar).json'],
        'edit avatar'
      );
      expect(file).toBe('/out/run/commands-(edit avatar).json');
    });

    it('returns null when no step log matches', () => {
      expect(findCommandsFile(['/out/run/commands-(other).json'], 'edit avatar')).toBeNull();
    });
  });

  describe('buildFlowTitle', () => {
    it('prefixes flow properties as [tags] without duplicates', () => {
      expect(
        buildFlowTitle('edit avatar', { team: 'Profile', caseId: 'C2210', tags: 'smoke' })
      ).toBe('[Profile][C2210][smoke] edit avatar');
      expect(buildFlowTitle('[Profile] edit avatar', { team: 'Profile' })).toBe(
        '[Profile] edit avatar'
      );
      expect(buildFlowTitle('plain flow')).toBe('plain flow');
    });
  });

  describe('transformMaestroToFriendlyFormat (real fixtures)', () => {
    it('returns one Cypress-shaped result per flow with paths relative to the project', () => {
      const results = transformFixtures();
      expect(results).toHaveLength(5);
      const savedCard = flowByName(results, 'checkout with saved card');
      expect(savedCard.fullFile).toBe('maestro/mobile/checkout/saved-card.yaml');
      expect(savedCard.suites).toEqual([]);
      savedCard.tests.forEach((t) => {
        expect(t.title).toBe(t.fullTitle);
        expect(typeof t.duration).toBe('number');
      });
    });

    it('reports every labeled step as passed when the flow passes', () => {
      const reorder = flowByName(transformFixtures(), 'reorder last purchase');
      expect(rows(reorder)).toEqual([
        { title: '[Checkout][smoke][C1060] opens the cart', state: 'passed', error: '' },
        { title: '[Checkout][regression][C1061] shows last purchase', state: 'passed', error: '' },
      ]);
    });

    it('marks steps after a mid-flow failure as not run, blocked by the failed case', () => {
      const savedCard = flowByName(transformFixtures(), 'checkout with saved card');
      expect(rows(savedCard)).toEqual([
        { title: '[Checkout][smoke][C1042] shows the saved card', state: 'passed', error: '' },
        {
          title: '[Checkout][smoke][C1043] completes payment with saved card',
          state: 'failed',
          error: 'Assertion is false: "Payment complete" is visible',
        },
        {
          title: '[Checkout][regression][C1044] sends a receipt',
          state: NOT_RUN_STATE,
          error: 'blocked by C1043',
        },
      ]);
    });

    it('reports a failed optional step as failed (non-blocking) and keeps going', () => {
      const promo = flowByName(transformFixtures(), 'apply promo code');
      expect(rows(promo)).toEqual([
        { title: '[Checkout][regression][C1050] applies a promo code', state: 'passed', error: '' },
        {
          title: '[Checkout][regression][C1051] shows free shipping banner',
          state: 'failed',
          error: 'optional check failed (non-blocking)',
        },
        { title: '[Checkout][smoke][C1052] keeps the cart items', state: 'passed', error: '' },
      ]);
    });

    it('reports a flow with no labels as one row tagged from its properties', () => {
      const avatar = flowByName(transformFixtures(), 'edit avatar');
      expect(rows(avatar)).toEqual([
        { title: '[Profile][C2210][smoke] edit avatar', state: 'passed', error: '' },
      ]);
    });

    it('adds a row for a failed unlabeled step and blocks the labeled steps after it', () => {
      const signUp = flowByName(transformFixtures(), 'sign up new user');
      expect(rows(signUp)).toEqual([
        { title: '[Onboarding][smoke][C3001] shows the sign up form', state: 'passed', error: '' },
        {
          title: '[Onboarding][smoke][C3002] lands on the welcome screen',
          state: NOT_RUN_STATE,
          error: 'blocked by unlabeled step',
        },
        {
          title: '[Onboarding][smoke] unlabeled step failed in sign up new user',
          state: 'failed',
          error: 'Element not found: Text matching regex: Accept terms',
        },
      ]);
    });

    it('uses a label on the runFlow step and ignores labels inside the subflow', () => {
      const reorder = flowByName(transformFixtures(), 'reorder last purchase');
      const titles = reorder.tests.map((t) => t.fullTitle);
      expect(titles).toContain('[Checkout][smoke][C1060] opens the cart');
      expect(titles.some((t) => t.includes('C9999'))).toBe(false);
    });

    it('throws a clear error when the JUnit report is missing', () => {
      expect(() =>
        transformFixtures({ reportPath: path.join(FIXTURE_ROOT, 'nope.xml') })
      ).toThrow('Maestro JUnit report not found');
    });
  });

  describe('fallbacks', () => {
    let tmpRoot;
    beforeEach(() => {
      tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'qasr-maestro-'));
      fs.cpSync(FIXTURE_ROOT, tmpRoot, { recursive: true });
    });
    afterEach(() => {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    });

    const transformTmp = (overrides = {}) =>
      transformMaestroToFriendlyFormat({
        reportPath: path.join(tmpRoot, 'maestro-results/report.xml'),
        outputDir: path.join(tmpRoot, 'maestro-results'),
        flowsDir: null,
        projectRoot: tmpRoot,
        ...overrides,
      });

    it('falls back to one row per flow and warns when a step log is missing', () => {
      fs.rmSync(
        path.join(tmpRoot, 'maestro-results/2026-10-31_150447/checkout with saved card'),
        { recursive: true }
      );
      const savedCard = flowByName(transformTmp(), 'checkout with saved card');
      expect(rows(savedCard)).toEqual([
        {
          title: 'checkout with saved card',
          state: 'failed',
          error: 'Assertion is false: "Payment complete" is visible',
        },
      ]);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No step log found for Maestro flow "checkout with saved card"')
      );
    });

    it('falls back to one row per flow when there are no step logs at all', () => {
      const results = transformTmp({ outputDir: path.join(tmpRoot, 'empty') });
      results.forEach((flow) => expect(flow.tests).toHaveLength(1));
    });

    it('finds moved flow files through maestroFlowsDir', () => {
      fs.renameSync(path.join(tmpRoot, 'maestro'), path.join(tmpRoot, 'flows'));
      const savedCard = flowByName(
        transformTmp({ flowsDir: path.join(tmpRoot, 'flows') }),
        'checkout with saved card'
      );
      expect(savedCard.fullFile).toBe('flows/mobile/checkout/saved-card.yaml');
      expect(savedCard.tests.map((t) => t.state)).toEqual(['passed', 'failed', NOT_RUN_STATE]);
    });

    it('warns and skips not-run rows when the flow file cannot be found', () => {
      fs.rmSync(path.join(tmpRoot, 'maestro'), { recursive: true });
      const savedCard = flowByName(transformTmp(), 'checkout with saved card');
      expect(savedCard.tests.map((t) => t.state)).toEqual(['passed', 'failed']);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Set maestroFlowsDir')
      );
    });
  });

  describe('stepModeTests', () => {
    const flow = { name: 'f', properties: {}, status: 'SUCCESS', failure: null };
    it('maps SKIPPED to skipped and tags-only labels get the flow name', () => {
      const tests = stepModeTests(
        flow,
        [
          {
            command: { tapOnElement: { label: '[C1] ' } },
            metadata: { status: 'SKIPPED', duration: 5, depth: 0 },
          },
        ],
        ['[C1] ']
      );
      expect(tests[0].state).toBe('skipped');
      expect(tests[0].fullTitle).toBe('[C1]  f');
    });

    it('returns no rows when there are no labels', () => {
      expect(stepModeTests(flow, [], [])).toEqual([]);
    });
  });
});
