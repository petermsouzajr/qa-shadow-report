import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { XMLParser } from 'fast-xml-parser';
import yaml from 'js-yaml';

/**
 * Maestro support.
 *
 * Maestro writes three things QASR can read:
 *  1. A JUnit report (`--format junit --output report.xml`): one <testcase> per flow,
 *     with the flow file path, status, failure message, `properties:` and `tags:`.
 *  2. Per-flow step logs (`--test-output-dir <dir>`): `<dir>/<session>/<flow name>/commands.json`
 *     (Maestro 2.x) or `<dir>/<session>/commands-(<flow name>).json` (Maestro 1.x).
 *     Each entry is `{ command: { <commandType>: { label, optional, ... } }, metadata: { status, duration, depth, error } }`
 *     and only lists steps that actually ran.
 *  3. The flow YAML files themselves, which list every labeled step, including the ones that never ran.
 *
 * Step mode: each top-level step with a `label:` becomes one report row.
 * Flow mode: a flow with no labels (or no step log) becomes a single row.
 *
 * The output matches the Cypress (mochawesome) shape, so the rest of the
 * report pipeline does not need to know which framework ran.
 */

export const NOT_RUN_STATE = 'not run';
export const UNLABELED_FAILURE_TITLE = 'unlabeled step failed';
const WARNED_PREFIX = 'optional check failed (non-blocking)';

const FLOW_TAG_PROPERTIES = ['team', 'category', 'caseId'];

const toPosix = (p) => p.split(path.sep).join('/');

const asArray = (value) =>
  value === undefined || value === null
    ? []
    : Array.isArray(value)
      ? value
      : [value];

/**
 * Parses a Maestro JUnit XML report into a flat list of flows.
 * @param {string} xml - The XML report contents.
 * @returns {Array<Object>} Flows with name, file, status, time (seconds), failure, properties.
 */
export const parseMaestroJUnit = (xml) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    textNodeName: '#text',
    parseAttributeValue: false,
    parseTagValue: false,
    isArray: (name) => ['testsuite', 'testcase', 'property'].includes(name),
  });
  const parsed = parser.parse(xml);
  const suites = asArray(parsed?.testsuites?.testsuite || parsed?.testsuite);

  return suites.flatMap((suite) =>
    asArray(suite.testcase).map((testcase) => {
      const properties = {};
      asArray(testcase.properties?.property).forEach((prop) => {
        if (prop && prop.name) properties[prop.name] = prop.value ?? '';
      });
      const failureNode = testcase.failure;
      let failure = null;
      if (failureNode !== undefined) {
        failure =
          typeof failureNode === 'string'
            ? failureNode
            : failureNode['#text'] || failureNode.message || 'failed';
      }
      return {
        name: testcase.name || testcase.id || '',
        file: testcase.file || '',
        status: testcase.status || (failure !== null ? 'ERROR' : 'SUCCESS'),
        time: Number.parseFloat(testcase.time) || 0,
        failure,
        properties,
        device: suite.device || '',
      };
    })
  );
};

/**
 * Returns the label and optional flag of a YAML step, if it has one.
 * Steps look like `- launchApp` or `- assertVisible: { text: 'x', label: '...' }`.
 * @param {*} step - One step from the flow YAML.
 * @returns {{label: string, optional: boolean}|null} The label info, or null.
 */
const labelFromYamlStep = (step) => {
  if (!step || typeof step !== 'object' || Array.isArray(step)) return null;
  const [commandName] = Object.keys(step);
  const body = step[commandName];
  if (body && typeof body === 'object' && typeof body.label === 'string') {
    return { label: body.label, optional: body.optional === true };
  }
  return null;
};

/**
 * Reads the top-level labeled steps of a flow YAML file, in order.
 * Labels inside `runFlow` sub-flows are ignored on purpose: sub-flows are shared
 * setup (like `beforeEach`), so their labels would repeat in every flow that uses them.
 * Label the `runFlow` step itself to get a row for it.
 * @param {string} flowPath - Absolute path to the flow YAML.
 * @returns {Array<string>} Labels in order.
 */
export const readFlowLabels = (flowPath) => {
  const documents = yaml.loadAll(fs.readFileSync(flowPath, 'utf8'));
  const steps = [...documents].reverse().find((doc) => Array.isArray(doc));
  if (!steps) return [];
  return steps
    .map(labelFromYamlStep)
    .filter(Boolean)
    .map((info) => info.label);
};

/**
 * Pulls the command body from a commands.json entry (`{ command: { tapOnElement: {...} } }`).
 * @param {Object} entry - A commands.json entry.
 * @returns {Object} The command body (may be empty).
 */
const commandBody = (entry) => {
  const command = entry?.command || {};
  const key = Object.keys(command)[0];
  return (key && command[key]) || {};
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Recursively lists files under a directory.
 * @param {string} dir - Directory to walk.
 * @returns {Array<string>} Absolute file paths.
 */
const walk = (dir) => {
  if (!dir || !fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
};

/**
 * Finds the newest commands JSON for a flow inside the Maestro output directory.
 * Supports `<flow>/commands.json` (2.x, incl. `-shard-N` and `-2` suffixes)
 * and `commands-(<flow>).json` / `commands-shard-N-(<flow>).json` (1.x).
 * @param {Array<string>} files - All files under the output directory.
 * @param {string} flowName - The flow name from the JUnit report.
 * @returns {string|null} The path, or null when not found.
 */
export const findCommandsFile = (files, flowName) => {
  const clean = escapeRegExp(flowName.replace(/\//g, '_'));
  const dirPattern = new RegExp(`^${clean}(-shard-\\d+)?(-\\d+)?$`);
  const filePattern = new RegExp(`^commands(-shard-\\d+)?-\\(${clean}\\)\\.json$`);

  const matches = files.filter((file) => {
    const base = path.basename(file);
    if (base === 'commands.json') {
      return dirPattern.test(path.basename(path.dirname(file)));
    }
    return filePattern.test(base);
  });
  if (matches.length === 0) return null;
  return matches
    .map((file) => {
      let mtime = 0;
      try {
        mtime = fs.statSync(file).mtimeMs;
      } catch {
        // Unreadable file: rank it last.
      }
      return { file, mtime };
    })
    .sort((a, b) => b.mtime - a.mtime || b.file.localeCompare(a.file))[0].file;
};

/**
 * Locates the flow YAML for a JUnit testcase `file` attribute.
 * @param {string} file - The `file` attribute (cwd-relative or absolute).
 * @param {Array<string>} baseDirs - Directories to resolve relative paths against.
 * @param {string} [flowsDir] - Optional fallback directory to search by file name.
 * @returns {string|null} Absolute path, or null.
 */
export const resolveFlowFile = (file, baseDirs, flowsDir) => {
  if (!file) return null;
  if (path.isAbsolute(file)) {
    if (fs.existsSync(file)) return file;
  } else {
    for (const base of baseDirs) {
      const candidate = path.resolve(base, file);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  if (flowsDir) {
    const wanted = toPosix(file);
    const candidates = walk(flowsDir).filter(
      (f) => path.basename(f) === path.basename(file)
    );
    const best =
      candidates.find((f) => toPosix(f).endsWith(wanted)) || candidates[0];
    if (best) return best;
  }
  return null;
};

/**
 * Builds a Cypress-style test object.
 * @param {Object} fields - Test fields.
 * @param {string} fields.fullTitle - Title including [tags].
 * @param {string} fields.state - passed | failed | skipped | not run.
 * @param {number} fields.duration - Duration in milliseconds.
 * @param {string} fields.error - Error message ('' when none).
 * @returns {Object} A test object.
 */
const buildTest = ({ fullTitle, state, duration, error }) => ({
  title: fullTitle,
  fullTitle,
  timedOut: false,
  duration: Math.round(duration || 0),
  state,
  speed: null,
  pass: state === 'passed',
  fail: state === 'failed',
  pending: state === 'skipped',
  context: null,
  code: '',
  err: error ? { message: error } : {},
  uuid: '',
  parentUUID: '',
  isHook: false,
  skipped: state === 'skipped' || state === NOT_RUN_STATE,
});

/**
 * Builds a title with flow-level tags from Maestro `properties:` and `tags:`.
 * Tags that are already in the name are not repeated.
 * @param {string} baseName - The test name.
 * @param {Object} properties - JUnit properties (team, category, caseId, tags).
 * @returns {string} e.g. `[Profile][smoke][C2210] edit avatar`.
 */
export const buildFlowTitle = (baseName, properties = {}) => {
  const tags = [];
  FLOW_TAG_PROPERTIES.forEach((key) => {
    if (properties[key]) {
      String(properties[key])
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => tags.push(t));
    }
  });
  if (properties.tags) {
    String(properties.tags)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => tags.push(t));
  }
  const unique = [...new Set(tags)].filter(
    (t) => !baseName.includes(`[${t}]`) && /^[\w#-]+$/.test(t)
  );
  const prefix = unique.map((t) => `[${t}]`).join('');
  return prefix ? `${prefix} ${baseName}` : baseName;
};

/**
 * Makes sure a label still has a test name once [tags] are stripped.
 * @param {string} label - The step label.
 * @param {string} flowName - The flow name, used when the label is tags only.
 * @returns {string} A usable full title.
 */
const titleFromLabel = (label, flowName) =>
  label.replace(/\[[^\]]+\]/g, '').trim() ? label : `${label} ${flowName}`;

/**
 * Returns the [tags] every label in a flow shares (team, category...), minus case IDs,
 * so a row for an unlabeled failure still lands under the right team.
 * @param {Array<string>} labels - The flow's step labels.
 * @returns {string} The shared tags, e.g. "[Onboarding][smoke] ", or "".
 */
const sharedLabelTags = (labels) => {
  const tagSets = labels.map(
    (label) => (label.match(/\[[^\]]+\]/g) || [])
  );
  if (tagSets.length === 0) return '';
  const shared = tagSets[0].filter(
    (tag) =>
      !/^\[[a-zA-Z#-]+[0-9][^\]]*\]$/.test(tag) &&
      tagSets.every((set) => set.includes(tag))
  );
  return shared.length ? `${shared.join('')} ` : '';
};

const flowState = (flow) => {
  if (flow.failure !== null && flow.failure !== undefined) return 'failed';
  if (['SUCCESS', 'WARNING'].includes(flow.status)) return 'passed';
  if (flow.status === 'ERROR') return 'failed';
  return 'skipped';
};

/**
 * Builds the tests for one flow in flow mode (one row).
 * @param {Object} flow - Parsed JUnit flow.
 * @returns {Array<Object>} One test.
 */
const flowModeTests = (flow) => [
  buildTest({
    fullTitle: buildFlowTitle(flow.name, flow.properties),
    state: flowState(flow),
    duration: flow.time * 1000,
    error: flow.failure || '',
  }),
];

/**
 * Builds the tests for one flow in step mode (one row per top-level labeled step).
 * @param {Object} flow - Parsed JUnit flow.
 * @param {Array<Object>} commands - Entries from the flow's commands JSON.
 * @param {Array<string>|null} yamlLabels - Labels from the YAML, or null when the YAML is unavailable.
 * @returns {Array<Object>} Tests (empty when the flow has no labels).
 */
export const stepModeTests = (flow, commands, yamlLabels) => {
  const topLevel = commands.filter((entry) => !entry?.metadata?.depth);
  const executedByLabel = new Map();
  topLevel.forEach((entry) => {
    const label = commandBody(entry).label;
    if (typeof label === 'string') {
      if (!executedByLabel.has(label)) executedByLabel.set(label, []);
      executedByLabel.get(label).push(entry);
    }
  });

  const labels = yamlLabels || topLevel
    .map((entry) => commandBody(entry).label)
    .filter((label) => typeof label === 'string');
  if (labels.length === 0) return [];

  const seen = new Map();
  const rows = labels.map((label) => {
    const occurrence = seen.get(label) || 0;
    seen.set(label, occurrence + 1);
    const entry = (executedByLabel.get(label) || [])[occurrence];
    return { label, entry };
  });

  const blockingFailure = rows.find(
    ({ entry }) => entry?.metadata?.status === 'FAILED'
  );
  const flowFailed = flowState(flow) === 'failed';
  const unlabeledFailure = flowFailed && !blockingFailure;

  let blocker = '';
  if (blockingFailure) {
    const caseId = blockingFailure.label.match(/\[[a-zA-Z#-]+[0-9][^\]]*\]/);
    blocker = caseId
      ? caseId[0].replace(/[[\]]/g, '')
      : blockingFailure.label.replace(/\[[^\]]+\]/g, '').trim();
  } else if (unlabeledFailure) {
    blocker = 'unlabeled step';
  }

  const tests = rows.map(({ label, entry }) => {
    const fullTitle = titleFromLabel(label, flow.name);
    if (!entry) {
      return buildTest({
        fullTitle,
        state: NOT_RUN_STATE,
        duration: 0,
        error: blocker ? `blocked by ${blocker}` : '',
      });
    }
    const { status, duration, error } = entry.metadata || {};
    const message = error?.message || '';
    switch (status) {
    case 'COMPLETED':
      return buildTest({ fullTitle, state: 'passed', duration, error: '' });
    case 'FAILED':
      return buildTest({
        fullTitle,
        state: 'failed',
        duration,
        error: message || flow.failure || 'failed',
      });
    case 'WARNED':
      return buildTest({
        fullTitle,
        state: 'failed',
        duration,
        error: message ? `${WARNED_PREFIX}: ${message}` : WARNED_PREFIX,
      });
    case 'SKIPPED':
      return buildTest({ fullTitle, state: 'skipped', duration, error: '' });
    default:
      return buildTest({
        fullTitle,
        state: NOT_RUN_STATE,
        duration,
        error: blocker ? `blocked by ${blocker}` : '',
      });
    }
  });

  if (unlabeledFailure) {
    const failedEntry = topLevel.find(
      (entry) => entry?.metadata?.status === 'FAILED'
    );
    tests.push(
      buildTest({
        fullTitle: buildFlowTitle(
          `${sharedLabelTags(labels)}${UNLABELED_FAILURE_TITLE} in ${flow.name}`.trim(),
          flow.properties
        ),
        state: 'failed',
        duration: failedEntry?.metadata?.duration || 0,
        error:
          flow.failure || failedEntry?.metadata?.error?.message || 'failed',
      })
    );
  }

  return tests;
};

/**
 * Transforms Maestro results into the Cypress-like structure the report builder uses.
 *
 * @param {Object} options - Input locations.
 * @param {string} options.reportPath - Path to the Maestro JUnit XML report.
 * @param {string} [options.outputDir] - The `--test-output-dir` folder holding commands JSON files.
 * @param {string} [options.flowsDir] - Optional folder to search for flow YAML files.
 * @param {string} [options.projectRoot] - Folder Maestro ran from (relative `file` paths resolve here).
 * @returns {Array<Object>} One result per flow, each with a `tests` array.
 */
export const transformMaestroToFriendlyFormat = ({
  reportPath,
  outputDir,
  flowsDir,
  projectRoot = process.cwd(),
} = {}) => {
  if (!reportPath || !fs.existsSync(reportPath)) {
    throw new Error(`Maestro JUnit report not found at path: ${reportPath}`);
  }
  const flows = parseMaestroJUnit(fs.readFileSync(reportPath, 'utf8'));
  const outputFiles = walk(outputDir);
  const baseDirs = [
    projectRoot,
    path.dirname(path.resolve(reportPath)),
    path.dirname(path.dirname(path.resolve(reportPath))),
  ];

  if (outputDir && outputFiles.length === 0) {
    console.warn(
      chalk.yellow(
        `No Maestro step logs found in ${outputDir}. Run maestro test with --test-output-dir to get one row per labeled step. Falling back to one row per flow.`
      )
    );
  }

  return flows.map((flow) => {
    const flowPath = resolveFlowFile(flow.file, baseDirs, flowsDir);
    // Maestro writes `file` relative to the folder it ran in; keep that path when it
    // still points at the flow, so Area/Type match the maestro/<type>/<area> layout.
    const ranRelative =
      flowPath &&
      flow.file &&
      !path.isAbsolute(flow.file) &&
      toPosix(flowPath).endsWith(toPosix(path.normalize(flow.file)));
    const relativeFile = ranRelative
      ? toPosix(path.normalize(flow.file))
      : flowPath
        ? toPosix(path.relative(projectRoot, flowPath))
        : toPosix(flow.file || `${flow.name}.yaml`);

    let tests = [];
    const commandsFile =
      outputFiles.length > 0 ? findCommandsFile(outputFiles, flow.name) : null;

    if (commandsFile) {
      let commands = [];
      try {
        commands = JSON.parse(fs.readFileSync(commandsFile, 'utf8'));
      } catch (error) {
        console.warn(
          chalk.yellow(`Could not read ${commandsFile}: ${error.message}`)
        );
      }
      let yamlLabels = null;
      if (flowPath) {
        try {
          yamlLabels = readFlowLabels(flowPath);
        } catch (error) {
          console.warn(
            chalk.yellow(
              `Could not parse flow ${flowPath}: ${error.message}. "not run" rows will be missing for this flow.`
            )
          );
        }
      } else {
        console.warn(
          chalk.yellow(
            `Flow file for "${flow.name}" not found (${flow.file}). Set maestroFlowsDir to report "not run" steps.`
          )
        );
      }
      tests = stepModeTests(flow, Array.isArray(commands) ? commands : [], yamlLabels);
    } else if (outputFiles.length > 0) {
      console.warn(
        chalk.yellow(
          `No step log found for Maestro flow "${flow.name}". Reporting it as one row.`
        )
      );
    }

    if (tests.length === 0) {
      tests = flowModeTests(flow);
    }

    return {
      uuid: '',
      title: flow.name,
      fullFile: relativeFile,
      file: relativeFile,
      beforeHooks: [],
      afterHooks: [],
      tests,
      suites: [],
      passes: [],
      failures: [],
      pending: [],
      skipped: [],
      duration: Math.round(flow.time * 1000),
      root: true,
      rootEmpty: false,
      _timeout: 2000,
    };
  });
};
