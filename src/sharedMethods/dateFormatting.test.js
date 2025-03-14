import { jest } from '@jest/globals';
import {
  getCurrentDay,
  getFormattedMonth,
  getFormattedYear,
  getCurrentTime,
  getPreviousMonthsYear,
  getTodaysFormattedDate,
  formatDuration,
  getDayIndex,
} from './dateFormatting.js';
import { DAYS } from '../../constants.js';

describe('Date Formatting', () => {
  const mockDate = new Date('2024-03-20T15:30:45.123Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getCurrentDay', () => {
    it('should return current day', () => {
      const result = getCurrentDay();
      expect(result).toBe(20);
    });
  });

  describe('getFormattedMonth', () => {
    it('should return formatted month', () => {
      const result = getFormattedMonth();
      expect(result).toBe('Mar');
    });

    it('should handle January', () => {
      jest.setSystemTime(new Date('2024-01-20T15:30:45.123Z'));
      const result = getFormattedMonth();
      expect(result).toBe('Jan');
    });

    it('should handle December', () => {
      jest.setSystemTime(new Date('2024-12-20T15:30:45.123Z'));
      const result = getFormattedMonth();
      expect(result).toBe('Dec');
    });
  });

  describe('getFormattedYear', () => {
    it('should return formatted year', () => {
      const result = getFormattedYear();
      expect(result).toBe(2024);
    });
  });

  describe('getCurrentTime', () => {
    it('should return current time', () => {
      const result = getCurrentTime();
      expect(result).toBe('083045');
    });
  });

  describe('getPreviousMonthsYear', () => {
    it("should return previous month's year", () => {
      const result = getPreviousMonthsYear('Mar');
      expect(result).toBe('2024');
    });

    it('should handle January', () => {
      const result = getPreviousMonthsYear('Jan');
      expect(result).toBe('2023');
    });
  });

  describe('getTodaysFormattedDate', () => {
    it("should return today's formatted date", () => {
      const result = getTodaysFormattedDate();
      expect(result).toBe('Mar 20, 2024');
    });
  });

  describe('formatDuration', () => {
    it('should format duration in minutes:seconds:milliseconds format', () => {
      expect(formatDuration(125000)).toBe("'2:5:0");
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe("'0:0:0");
    });

    it('should handle large durations', () => {
      expect(formatDuration(3661000)).toBe("'61:1:0");
    });

    it('should handle milliseconds correctly', () => {
      expect(formatDuration(1001)).toBe("'0:1:1");
    });
  });

  describe('getDayIndex', () => {
    it('should return day index for Monday', () => {
      const result = getDayIndex('Monday');
      expect(result).toBe(1);
    });

    it('should return day index for Sunday', () => {
      const result = getDayIndex('Sunday');
      expect(result).toBe(0);
    });

    it('should handle case-insensitive day names', () => {
      const result = getDayIndex('MONDAY');
      expect(result).toBe(0);
    });
  });
});
