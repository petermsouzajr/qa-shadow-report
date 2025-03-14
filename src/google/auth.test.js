import { jest } from '@jest/globals';

// Mock the googleapis module
jest.unstable_mockModule('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn(() => ({
        getClient: jest.fn().mockResolvedValue({ id: 'dummy-client' }),
      })),
    },
    sheets: jest.fn(() => ({
      spreadsheets: {
        values: {
          get: jest.fn(),
        },
      },
    })),
  },
}));

// Mock the constants module
jest.unstable_mockModule('../../constants.js', () => ({
  GOOGLE_SHEET_ID: jest.fn(() => 'dummy-spreadsheet-id'),
  GOOGLE_KEYFILE_PATH: jest.fn(() => 'dummy-key-file-path'),
}));

describe('Google Sheets Authentication', () => {
  let mockConsoleError;

  beforeEach(() => {
    // Mock console.error
    mockConsoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Reset modules before each test
    jest.resetModules();
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  describe('Initialization', () => {
    test('should initialize Google Sheets API client successfully', async () => {
      // Mock the modules
      await jest.unstable_mockModule('googleapis', () => ({
        google: {
          auth: {
            GoogleAuth: jest.fn(() => ({
              getClient: jest.fn().mockResolvedValue({ id: 'dummy-client' }),
            })),
          },
          sheets: jest.fn(() => ({
            spreadsheets: {
              values: {
                get: jest.fn(),
              },
            },
          })),
        },
      }));

      await jest.unstable_mockModule('../../constants.js', () => ({
        GOOGLE_SHEET_ID: jest.fn(() => 'dummy-spreadsheet-id'),
        GOOGLE_KEYFILE_PATH: jest.fn(() => 'dummy-key-file-path'),
      }));

      // Import the module
      const { auth, sheets, spreadsheetId } = await import('./auth.js');

      expect(auth).toBeDefined();
      expect(sheets).toBeDefined();
      expect(spreadsheetId).toBe('dummy-spreadsheet-id');
    });

    test('should handle missing key file path', async () => {
      // Mock the modules
      await jest.unstable_mockModule('googleapis', () => ({
        google: {
          auth: {
            GoogleAuth: jest.fn(() => ({
              getClient: jest.fn().mockResolvedValue({ id: 'dummy-client' }),
            })),
          },
          sheets: jest.fn(() => ({
            spreadsheets: {
              values: {
                get: jest.fn(),
              },
            },
          })),
        },
      }));

      await jest.unstable_mockModule('../../constants.js', () => ({
        GOOGLE_SHEET_ID: jest.fn(() => 'dummy-spreadsheet-id'),
        GOOGLE_KEYFILE_PATH: jest.fn(() => ''),
      }));

      // Import the module
      const { auth, sheets, spreadsheetId } = await import('./auth.js');

      expect(auth).toBeUndefined();
      expect(sheets).toBeUndefined();
      expect(spreadsheetId).toBeUndefined();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    test('should handle missing spreadsheet ID', async () => {
      // Mock the modules
      await jest.unstable_mockModule('googleapis', () => ({
        google: {
          auth: {
            GoogleAuth: jest.fn(() => ({
              getClient: jest.fn().mockResolvedValue({ id: 'dummy-client' }),
            })),
          },
          sheets: jest.fn(() => ({
            spreadsheets: {
              values: {
                get: jest.fn(),
              },
            },
          })),
        },
      }));

      await jest.unstable_mockModule('../../constants.js', () => ({
        GOOGLE_SHEET_ID: jest.fn(() => ''),
        GOOGLE_KEYFILE_PATH: jest.fn(() => 'dummy-key-file-path'),
      }));

      // Import the module
      const { auth, sheets, spreadsheetId } = await import('./auth.js');

      expect(auth).toBeDefined();
      expect(sheets).toBeDefined();
      expect(spreadsheetId).toBe('');
    });
  });

  describe('Error Handling', () => {
    test('should handle Google API client initialization failure', async () => {
      // Mock the modules
      await jest.unstable_mockModule('googleapis', () => ({
        google: {
          auth: {
            GoogleAuth: jest.fn(() => ({
              getClient: jest
                .fn()
                .mockRejectedValue(new Error('API Client Error')),
            })),
          },
          sheets: jest.fn(),
        },
      }));

      await jest.unstable_mockModule('../../constants.js', () => ({
        GOOGLE_SHEET_ID: jest.fn(() => 'dummy-spreadsheet-id'),
        GOOGLE_KEYFILE_PATH: jest.fn(() => 'dummy-key-file-path'),
      }));

      // Import the module
      const { auth, sheets, spreadsheetId } = await import('./auth.js');

      expect(auth).toBeDefined();
      expect(sheets).toBeUndefined();
      expect(spreadsheetId).toBe('dummy-spreadsheet-id');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error obtaining Google API client:',
        expect.any(Error)
      );
    });

    test('should handle GoogleAuth initialization failure', async () => {
      // Mock the modules
      await jest.unstable_mockModule('googleapis', () => ({
        google: {
          auth: {
            GoogleAuth: jest.fn(() => {
              throw new Error('Initialization Error');
            }),
          },
          sheets: jest.fn(),
        },
      }));

      await jest.unstable_mockModule('../../constants.js', () => ({
        GOOGLE_SHEET_ID: jest.fn(() => 'dummy-spreadsheet-id'),
        GOOGLE_KEYFILE_PATH: jest.fn(() => 'dummy-key-file-path'),
      }));

      // Import the module
      const { auth, sheets, spreadsheetId } = await import('./auth.js');

      expect(auth).toBeNull();
      expect(sheets).toBeUndefined();
      expect(spreadsheetId).toBe('dummy-spreadsheet-id');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Could not load the default credentials. Please ensure the Google credentials file exists and is properly configured.'
      );
      expect(mockConsoleError).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should handle sheets API initialization failure', async () => {
      // Mock the modules
      await jest.unstable_mockModule('googleapis', () => ({
        google: {
          auth: {
            GoogleAuth: jest.fn(() => ({
              getClient: jest.fn().mockResolvedValue({ id: 'dummy-client' }),
            })),
          },
          sheets: jest.fn(() => {
            throw new Error('Sheets API Error');
          }),
        },
      }));

      await jest.unstable_mockModule('../../constants.js', () => ({
        GOOGLE_SHEET_ID: jest.fn(() => 'dummy-spreadsheet-id'),
        GOOGLE_KEYFILE_PATH: jest.fn(() => 'dummy-key-file-path'),
      }));

      // Import the module
      const { auth, sheets, spreadsheetId } = await import('./auth.js');

      expect(auth).toBeDefined();
      expect(sheets).toBeUndefined();
      expect(spreadsheetId).toBe('dummy-spreadsheet-id');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error obtaining Google API client:',
        expect.any(Error)
      );
    });
  });

  describe('Performance', () => {
    test('should initialize within acceptable time', async () => {
      // Mock the modules
      await jest.unstable_mockModule('googleapis', () => ({
        google: {
          auth: {
            GoogleAuth: jest.fn(() => ({
              getClient: jest.fn().mockResolvedValue({ id: 'dummy-client' }),
            })),
          },
          sheets: jest.fn(() => ({
            spreadsheets: {
              values: {
                get: jest.fn(),
              },
            },
          })),
        },
      }));

      await jest.unstable_mockModule('../../constants.js', () => ({
        GOOGLE_SHEET_ID: jest.fn(() => 'dummy-spreadsheet-id'),
        GOOGLE_KEYFILE_PATH: jest.fn(() => 'dummy-key-file-path'),
      }));

      const startTime = performance.now();
      await import('./auth.js');
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
