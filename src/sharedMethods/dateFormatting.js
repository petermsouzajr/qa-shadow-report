/**
 * Retrieves the current day of the month.
 * @returns {number} The day of the month.
 */
export const getCurrentDay = () => new Date().getDate();

/**
 * Retrieves a formatted month string, optionally from a relative time context.
 * @param {string} [when=''] Adjusts the month context. Accepts 'lastMonth'.
 * @returns {string} The short name of the month (e.g., 'Jan', 'Feb', etc.).
 */
export const getFormattedMonth = (when = '') => {
  const date = new Date();
  if (when === 'lastMonth') {
    date.setMonth(date.getMonth() - 1);
  }
  return date.toLocaleString('default', { month: 'short' });
};

/**
 * Retrieves a formatted year string, optionally from a relative time context.
 * @param {string} [when=''] Adjusts the year context. Accepts 'lastYear'.
 * @returns {number} The year.
 */
export const getFormattedYear = (when = '') => {
  const date = new Date();
  if (when === 'lastYear') {
    date.setFullYear(date.getFullYear() - 1);
  }
  return date.getFullYear();
};

/**
 * Retrieves the current time in a formatted string (HHmmss).
 * @returns {string} Formatted current time.
 */
export const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}${minutes}${seconds}`;
};

/**
 * Determines the year for the summary of the previous month based on the current month.
 * If the current month is January, it returns the last year, otherwise the current year.
 * @param {string} currentMonth The current month in short form (e.g., "Jan").
 * @returns {string} The year for the previous month's summary.
 */
export const getPreviousMonthsYear = (currentMonth) => {
  const isJanuary = currentMonth === 'Jan';
  return isJanuary ? getFormattedYear('lastYear') : getFormattedYear();
};

/**
 * Retrieves today's date in a formatted string.
 * @returns {string} Today's date formatted as "Month day, Year".
 */
export const getTodaysFormattedDate = () => {
  return `${getFormattedMonth()} ${getCurrentDay()}, ${getFormattedYear()}`;
};

/**
 * Formats duration in milliseconds into a time string.
 * @param {number} durationMillis Duration in milliseconds.
 * @returns {string} Formatted duration string in "minutes:seconds:milliseconds" format.
 */
export const formatDuration = (durationMillis) => {
  const minutes = Math.floor(durationMillis / 60000);
  const seconds = Math.floor((durationMillis % 60000) / 1000);
  const milliseconds = durationMillis % 1000;
  return `${minutes}:${seconds}:${milliseconds}`;
};
