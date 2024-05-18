/**
 * Initializes an object to store structured daily payload data.
 * @returns {object} An object with empty arrays for payload segments.
 */
export const initializeDailyPayload = () => ({
  bodyPayload: [],
  headerPayload: [],
  summaryHeaderStylePayload: [],
  summaryGridStyles: [],
  footerPayload: [],
});