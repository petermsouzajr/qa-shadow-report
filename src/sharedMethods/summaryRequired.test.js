jest.mock('./dateFormatting.js', () => ({
  ...jest.requireActual('./dateFormatting.js'),
  getDayIndex: jest.fn((type) => {
    return type === 'Monday' ? 1 : 0;
  }),
  getFormattedMonth: jest.fn((type) => {
    const month = type === 'lastMonth' ? 'Feb' : 'Mar';

    return month;
  }),
  getFormattedYear: jest.fn((type) => {
    const year = type === 'lastYear' ? 2023 : 2024;

    return year;
  }),
  getPreviousMonthsYear: jest.fn((currentMonth) => {
    return currentMonth === 'Jan' ? '2023' : '2024';
  }),
}));

jest.mock('../google/sheetDataMethods/createTabNames.js', () => ({
  createSummaryTitle: jest.fn(() => {
    const title = 'Monthly summary Feb 2024';
    return title;
  }),
  createWeeklySummaryTitle: jest.fn(),
}));

jest.mock('./summaryHandler.js', () => ({
  ...jest.requireActual('./summaryHandler.js'),
  createWeeklySummaryTitle: jest.fn(() => {
    const title = 'Weekly_2024_02_12';
    return title;
  }),
}));

jest.mock('../../constants.js', () => {
  const originalModule = jest.requireActual('../../constants.js');
  return {
    ...originalModule,
    WEEK_START: jest.fn(() => {
      return 'Monday';
    }),
  };
});

jest.mock('../google/googleSheetIntegration/getSheetData.js', () => ({
  getTopLevelSpreadsheetData: jest.fn().mockResolvedValue({ sheets: [] }),
}));

jest.mock('../google/sheetDataMethods/getSheetInfo.js', () => ({
  getExistingTabTitlesInRange: jest
    .fn()
    .mockImplementation(async (mockTabs) => {
      return mockTabs;
    }),
}));

import { jest } from '@jest/globals';
import {
  isSummaryRequired,
  isWeeklySummaryRequired,
} from './summaryRequired.js';
import * as dateFormatting from './dateFormatting.js';
import * as createTabNames from '../google/sheetDataMethods/createTabNames.js';
import * as summaryHandler from './summaryHandler.js';
import { WEEK_START } from '../../constants.js';
import { createWeeklySummaryTitle } from './summaryHandler.js';

describe('Summary Required', () => {
  let consoleErrorSpy;
  let realDate;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    jest.clearAllMocks();
    realDate = global.Date;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
    global.Date = realDate;
  });

  describe('isSummaryRequired', () => {
    beforeEach(() => {
      // Mock Date for all monthly summary tests
      global.Date = class extends Date {
        constructor() {
          super('2024-03-01T12:00:00.000Z');
        }

        getMonth() {
          return 2; // March (0-based)
        }

        getFullYear() {
          return 2024;
        }
      };
    });

    it('should return false when CSV option is true', async () => {
      const mockTabs = ['Feb 1, 2024', 'Feb 2, 2024'];
      const result = await isSummaryRequired(mockTabs, true);
      expect(result).toBe(false);
    });

    it('should return true when summary is needed', async () => {
      const mockTabs = ['Feb 1, 2024', 'Feb 2, 2024', 'Feb 3, 2024'];

      const result = await isSummaryRequired(mockTabs, false);
      expect(result).toBe(true);
    });

    it('should return false when summary already exists', async () => {
      const summaryTitle = 'Monthly summary Feb 2024';
      const mockTabs = ['Feb 1, 2024', 'Feb 2, 2024', summaryTitle];

      const result = await isSummaryRequired(mockTabs, false);
      expect(result).toBe(false);
    });

    it('should return false when no sheets from last month exist', async () => {
      const mockTabs = ['Mar 1, 2024', 'Mar 2, 2024'];

      const result = await isSummaryRequired(mockTabs, false);
      expect(result).toBe(false);
    });
  });

  describe('isWeeklySummaryRequired', () => {
    it('should return false when CSV option is true', async () => {
      const mockTabs = ['Feb 12, 2024', 'Feb 13, 2024'];
      const result = await isWeeklySummaryRequired(mockTabs, true);
      expect(result).toBe(false);
    });

    it.skip('should return true when weekly summary is needed and it is end of week', async () => {
      // Mock date to be Sunday (end of week)
      const mockDate = new Date('2024-02-18T12:00:00.000Z'); // Sunday
      global.Date = class extends Date {
        constructor() {
          super('2024-02-18T12:00:00.000Z');
        }

        getDay() {
          return 0; // Sunday
        }

        getDate() {
          return 18;
        }

        setDate(date) {
          return mockDate.setDate(date);
        }

        setHours(h, m, s, ms) {
          return mockDate.setHours(h, m, s, ms);
        }

        valueOf() {
          return mockDate.valueOf();
        }

        toISOString() {
          return mockDate.toISOString();
        }
      };

      // Mock tabs without weekly summary
      const mockTabs = ['Feb 12, 2024', 'Feb 13, 2024'];

      // Run test
      const result = await isWeeklySummaryRequired(
        mockTabs,
        false,
        new Date('2024-02-18T12:00:00.000Z')
      );
      expect(result).toBe(true);
    });

    it('should return false when weekly summary already exists', async () => {
      // Mock Date to return Sunday (0)
      const mockDate = new Date('2024-02-18T12:00:00.000Z');
      global.Date = class extends Date {
        constructor() {
          super('2024-02-18T12:00:00.000Z');
        }

        getDay() {
          return 0; // Sunday
        }

        getDate() {
          return 18;
        }

        setDate(date) {
          return mockDate.setDate(date);
        }

        setHours(h, m, s, ms) {
          return mockDate.setHours(h, m, s, ms);
        }

        valueOf() {
          return mockDate.valueOf();
        }
      };

      const weeklyTitle = 'Weekly_2024_02_12';

      const mockTabs = ['Feb 12, 2024', 'Feb 13, 2024', weeklyTitle];

      const result = await isWeeklySummaryRequired(mockTabs, false);
      console.log('Result:', result);
      expect(result).toBe(false);
    });

    it('should return false when not at end of week', async () => {
      console.log('Test: should return false when not at end of week');
      console.log('Mock date: 2024-02-14T12:00:00.000Z');

      // Mock Date to return Wednesday (3)
      const mockDate = new Date('2024-02-14T12:00:00.000Z');
      global.Date = class extends Date {
        constructor() {
          super('2024-02-14T12:00:00.000Z');
        }

        getDay() {
          return 3; // Wednesday
        }

        getDate() {
          return 14;
        }

        setDate(date) {
          return mockDate.setDate(date);
        }

        setHours(h, m, s, ms) {
          return mockDate.setHours(h, m, s, ms);
        }

        valueOf() {
          return mockDate.valueOf();
        }
      };

      const mockTabs = ['Feb 12, 2024', 'Feb 13, 2024', 'Feb 14, 2024'];
      console.log('Mock tabs:', mockTabs);

      const result = await isWeeklySummaryRequired(mockTabs, false);
      console.log('Result:', result);
      expect(result).toBe(false);
    });

    it('should return false when no sheets exist', async () => {
      console.log('Test: should return false when no sheets exist');
      console.log('Mock date: 2024-02-18T12:00:00.000Z');

      // Mock Date to return Sunday (0)
      const mockDate = new Date('2024-02-18T12:00:00.000Z');
      global.Date = class extends Date {
        constructor() {
          super('2024-02-18T12:00:00.000Z');
        }

        getDay() {
          return 0; // Sunday
        }

        getDate() {
          return 18;
        }

        setDate(date) {
          return mockDate.setDate(date);
        }

        setHours(h, m, s, ms) {
          return mockDate.setHours(h, m, s, ms);
        }

        valueOf() {
          return mockDate.valueOf();
        }
      };

      const mockTabs = [];
      console.log('Mock tabs:', mockTabs);

      const result = await isWeeklySummaryRequired(mockTabs, false);
      console.log('Result:', result);
      expect(result).toBe(false);
    });
  });
});
