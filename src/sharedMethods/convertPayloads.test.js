import { jest } from '@jest/globals';
import { transformPlaywrightToFriendlyFormat } from './convertPayloads.js';

describe('Payload Conversion', () => {
  describe('transformPlaywrightToFriendlyFormat', () => {
    it('should transform a basic Playwright report correctly', () => {
      const mockPlaywrightReport = [
        {
          title: 'Test Suite',
          file: 'test.spec.js',
          suites: [
            {
              title: 'Feature',
              file: 'test.spec.js',
              specs: [
                {
                  title: 'Test Case',
                  tests: [
                    {
                      id: 'test1',
                      status: 'expected',
                      projectName: 'chromium',
                      results: [{ duration: 100 }],
                      annotations: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = transformPlaywrightToFriendlyFormat(mockPlaywrightReport);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        title: 'Test Suite',
        file: 'test.spec.js',
        suites: expect.arrayContaining([
          expect.objectContaining({
            title: 'Feature',
            file: 'test.spec.js',
            tests: expect.arrayContaining([
              expect.objectContaining({
                title: 'Test Case',
                state: 'passed',
                pass: true,
                fail: false,
                pending: false,
                duration: 100,
                projectName: 'chromium',
              }),
            ]),
          }),
        ]),
      });
    });

    it('should handle failed tests correctly', () => {
      const mockPlaywrightReport = [
        {
          title: 'Test Suite',
          file: 'test.spec.js',
          suites: [
            {
              title: 'Feature',
              file: 'test.spec.js',
              specs: [
                {
                  title: 'Failed Test',
                  tests: [
                    {
                      id: 'test1',
                      status: 'unexpected',
                      projectName: 'chromium',
                      results: [
                        { duration: 100, error: { message: 'Test failed' } },
                      ],
                      annotations: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = transformPlaywrightToFriendlyFormat(mockPlaywrightReport);

      expect(result[0].suites[0].tests[0]).toMatchObject({
        title: 'Failed Test',
        state: 'failed',
        pass: false,
        fail: true,
        pending: false,
        err: 'Test failed',
      });
    });

    it('should handle skipped tests correctly', () => {
      const mockPlaywrightReport = [
        {
          title: 'Test Suite',
          file: 'test.spec.js',
          suites: [
            {
              title: 'Feature',
              file: 'test.spec.js',
              specs: [
                {
                  title: 'Skipped Test',
                  tests: [
                    {
                      id: 'test1',
                      status: 'skipped',
                      projectName: 'chromium',
                      results: [{ duration: 0 }],
                      annotations: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = transformPlaywrightToFriendlyFormat(mockPlaywrightReport);

      expect(result[0].suites[0].tests[0]).toMatchObject({
        title: 'Skipped Test',
        state: 'skipped',
        pass: false,
        fail: false,
        pending: true,
        skipped: true,
      });
    });

    it('should handle tests with timeouts correctly', () => {
      const mockPlaywrightReport = [
        {
          title: 'Test Suite',
          file: 'test.spec.js',
          suites: [
            {
              title: 'Feature',
              file: 'test.spec.js',
              specs: [
                {
                  title: 'Timeout Test',
                  tests: [
                    {
                      id: 'test1',
                      status: 'unexpected',
                      projectName: 'chromium',
                      results: [
                        { duration: 100, error: { message: 'Test timed out' } },
                      ],
                      annotations: [{ name: 'timeout' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = transformPlaywrightToFriendlyFormat(mockPlaywrightReport);

      expect(result[0].suites[0].tests[0]).toMatchObject({
        title: 'Timeout Test',
        timedOut: true,
      });
    });

    it('should calculate suite durations correctly', () => {
      const mockPlaywrightReport = [
        {
          title: 'Test Suite',
          file: 'test.spec.js',
          suites: [
            {
              title: 'Feature',
              file: 'test.spec.js',
              specs: [
                {
                  title: 'Test Case 1',
                  tests: [
                    {
                      id: 'test1',
                      status: 'expected',
                      projectName: 'chromium',
                      results: [{ duration: 100 }, { duration: 200 }],
                      annotations: [],
                    },
                  ],
                },
                {
                  title: 'Test Case 2',
                  tests: [
                    {
                      id: 'test2',
                      status: 'expected',
                      projectName: 'chromium',
                      results: [{ duration: 300 }],
                      annotations: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = transformPlaywrightToFriendlyFormat(mockPlaywrightReport);

      expect(result[0].suites[0].duration).toBe(600); // 100 + 200 + 300
    });

    it('should handle empty reports', () => {
      const result = transformPlaywrightToFriendlyFormat([]);
      expect(result).toEqual([]);
    });

    it.skip('should handle reports with missing properties', () => {
      const mockPlaywrightReport = [
        {
          title: 'Test Suite',
          suites: [], // Missing file property
        },
      ];

      const result = transformPlaywrightToFriendlyFormat(mockPlaywrightReport);

      expect(result[0]).toMatchObject({
        title: 'Test Suite',
        file: '',
        suites: [],
      });
    });

    it('should handle multiple error messages in test results', () => {
      const mockPlaywrightReport = [
        {
          title: 'Test Suite',
          file: 'test.spec.js',
          suites: [
            {
              title: 'Feature',
              file: 'test.spec.js',
              specs: [
                {
                  title: 'Failed Test',
                  tests: [
                    {
                      id: 'test1',
                      status: 'unexpected',
                      projectName: 'chromium',
                      results: [
                        { duration: 100, error: { message: 'Error 1' } },
                        { duration: 200, error: { message: 'Error 2' } },
                      ],
                      annotations: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = transformPlaywrightToFriendlyFormat(mockPlaywrightReport);

      expect(result[0].suites[0].tests[0]).toMatchObject({
        err: 'Error 1', // Should take the first error message
      });
    });
  });
});
