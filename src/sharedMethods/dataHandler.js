import { readFile } from 'fs/promises';

/**
 * Asynchronously loads and parses a JSON file from the specified path.
 *
 * @async
 * @param {string} path - The path to the JSON file.
 * @returns {Promise<object>} - A promise that resolves with the parsed JSON data.
 */
export const loadJSON = async (path) => {
  try {
    const data = await readFile(path, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading test results JSON data:', error);
    throw new Error('Failed to load and parse test results JSON file.');
  }
};

/**
 * Converts a letter to its corresponding number based on ASCII values (A=0, B=1, ...).
 *
 * @param {string} letter - The letter to convert.
 * @returns {number} - The corresponding number.
 */
export const letterToNumber = (letter) => {
  if (typeof letter !== 'string' || letter.length !== 1) {
    throw new TypeError('Input must be a single letter.');
  }
  return letter.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
};

/**
 * Converts a number to its corresponding letter based on ASCII values (0=A, 1=B, ...).
 *
 * @param {number} number - The number to convert.
 * @returns {string} - The corresponding letter.
 */
export const numberToLetter = (number) => {
  if (typeof number !== 'number' || number < 0 || number > 25) {
    throw new TypeError('Input must be a number between 0 and 25.');
  }
  return String.fromCharCode(number + 'A'.charCodeAt(0));
};
