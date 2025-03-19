/**
 * Transforms a Playwright test report into a format similar to a Cypress test report.
 * @param {Object[]} playwrightReports - The original test reports from Playwright.
 * @returns {Object[]} A list of transformed reports with a structure similar to Cypress.
 */
export const transformPlaywrightToFriendlyFormat = (playwrightReports) => {
  return playwrightReports.map((report) => {
    const suites = report.suites || [];

    return {
      uuid: '',
      title: report.title || '',
      fullFile: report.file,
      file: report.file,
      beforeHooks: [],
      afterHooks: [],
      tests: [],
      suites: suites.map((suite) => ({
        uuid: '',
        title: suite.title,
        fullFile: suite.file,
        file: suite.file,
        beforeHooks: [],
        afterHooks: [],
        tests: suite.specs.flatMap((spec) =>
          spec.tests.map((test) => {
            const state =
              test.status === 'expected'
                ? 'passed'
                : test.status === 'unexpected'
                  ? 'failed'
                  : test.status;

            const errorMessages = test.results
              .filter((result) => result.error)
              .map((result) => result.error.message);

            return {
              title: spec.title,
              fullTitle: `${suite.title} ${spec.title}`,
              timedOut: test.annotations.some(
                (annotation) => annotation.name === 'timeout'
              ),
              duration: test.results.reduce(
                (acc, curr) => acc + curr.duration,
                0
              ),
              state: state,
              pass: state === 'passed',
              fail: state === 'failed',
              pending: state === 'skipped',
              context: null,
              code: '',
              err: errorMessages[0] || '',
              uuid: '',
              parentUUID: '',
              isHook: false,
              skipped: test.status === 'skipped',
              projectName: test.projectName,
            };
          })
        ),
        suites: [],
        passes: suite.specs
          .flatMap((spec) => spec.tests)
          .filter(
            (test) => test.status === 'passed' || test.status === 'expected'
          )
          .map((test) => test.id),
        failures: suite.specs
          .flatMap((spec) => spec.tests)
          .filter((test) => test.status === 'failed')
          .map((test) => test.id),
        pending: suite.specs
          .flatMap((spec) => spec.tests)
          .filter((test) => test.status === 'skipped')
          .map((test) => test.id),
        skipped: [],
        duration: suite.specs.reduce(
          (acc, spec) =>
            acc +
            spec.tests.reduce(
              (testAcc, test) =>
                testAcc +
                test.results.reduce(
                  (resultAcc, result) => resultAcc + result.duration,
                  0
                ),
              0
            ),
          0
        ),
        root: false,
        rootEmpty: false,
        _timeout: 2000,
      })),
      passes: [],
      failures: [],
      pending: [],
      skipped: [],
      duration: suites.reduce((acc, suite) => acc + suite.duration, 0),
      root: true,
      rootEmpty: true,
      _timeout: 2000,
    };
  });
};
