/**
 * Truncates a string or number to the specified maximum length.
 * @param {string|number|null|undefined} str - The string, number, or nullish value to be truncated.
 * @param {number} maxLength - The maximum length to enforce.
 * @returns {string} - The truncated string or an empty string if the input is nullish.
 */
export const enforceMaxLength = (str, maxLength) => {
  if (str == null) {
    return '';
  }

  try {
    // Convert the input to a string if it's a number
    const result = typeof str === 'number' ? str.toString() : str;
    // Return the truncated string
    return result.substring(0, maxLength);
  } catch (error) {
    return '';
  }
};
