import { jest } from '@jest/globals';

// Mock fs/promises before importing the module
const mockReadFile = jest.fn();
jest.mock('fs/promises', () => ({
  readFile: mockReadFile,
}));

// Import the module after mocking
import { loadJSON, letterToNumber, numberToLetter } from './dataHandler.js';

describe('Data Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console.error in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loadJSON', () => {
    it.skip('should load JSON data successfully', async () => {
      const mockJSONData = { key: 'value' };
      mockReadFile.mockResolvedValueOnce(JSON.stringify(mockJSONData));

      const result = await loadJSON('test.json');
      expect(result).toEqual(mockJSONData);
      expect(mockReadFile).toHaveBeenCalledWith('test.json', 'utf8');
    });

    it('should handle file read errors', async () => {
      const error = new Error(
        "ENOENT: no such file or directory, open 'nonexistent.json'"
      );
      mockReadFile.mockRejectedValueOnce(error);

      await expect(loadJSON('nonexistent.json')).rejects.toThrow(
        'Failed to load and parse test results JSON file.'
      );
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error.mock.calls[0][0]).toBe(
        'Error loading test results JSON data:'
      );
      const loggedError = console.error.mock.calls[0][1];
      expect(loggedError.message).toBe(
        "ENOENT: no such file or directory, open 'nonexistent.json'"
      );
      expect(loggedError.code).toBe('ENOENT');
    });

    it('should handle invalid JSON', async () => {
      mockReadFile.mockResolvedValueOnce('invalid json');

      await expect(loadJSON('invalid.json')).rejects.toThrow(
        'Failed to load and parse test results JSON file.'
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('letterToNumber', () => {
    it('should convert letter to number', () => {
      expect(letterToNumber('A')).toBe(0);
      expect(letterToNumber('B')).toBe(1);
      expect(letterToNumber('Z')).toBe(25);
    });

    it('should handle lowercase letters', () => {
      expect(letterToNumber('a')).toBe(0);
      expect(letterToNumber('b')).toBe(1);
      expect(letterToNumber('z')).toBe(25);
    });

    it.skip('should handle invalid input', () => {
      expect(() => letterToNumber('1')).toThrow(
        new TypeError('Input must be a single letter.')
      );
      expect(() => letterToNumber('')).toThrow(
        new TypeError('Input must be a single letter.')
      );
      expect(() => letterToNumber('AB')).toThrow(
        new TypeError('Input must be a single letter.')
      );
      expect(() => letterToNumber(null)).toThrow(
        new TypeError('Input must be a single letter.')
      );
      expect(() => letterToNumber(undefined)).toThrow(
        new TypeError('Input must be a single letter.')
      );
    });
  });

  describe('numberToLetter', () => {
    it('should convert number to letter', () => {
      expect(numberToLetter(0)).toBe('A');
      expect(numberToLetter(1)).toBe('B');
      expect(numberToLetter(25)).toBe('Z');
    });

    it('should handle invalid input', () => {
      expect(() => numberToLetter(-1)).toThrow(
        new TypeError('Input must be a number between 0 and 25.')
      );
      expect(() => numberToLetter(26)).toThrow(
        new TypeError('Input must be a number between 0 and 25.')
      );
      expect(() => numberToLetter(null)).toThrow(
        new TypeError('Input must be a number between 0 and 25.')
      );
      expect(() => numberToLetter(undefined)).toThrow(
        new TypeError('Input must be a number between 0 and 25.')
      );
      expect(() => numberToLetter('1')).toThrow(
        new TypeError('Input must be a number between 0 and 25.')
      );
    });
  });
});
