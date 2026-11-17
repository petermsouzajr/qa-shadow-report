/**
 * Adds operation context to an error while preserving the original failure.
 * @param {string} message - Contextual operation message.
 * @param {unknown} cause - Original failure.
 * @returns {Error} Contextual error with the original error as its cause.
 */
export const withErrorContext = (message, cause) => {
  if (cause instanceof Error && cause.message === message) return cause;
  return new Error(message, { cause });
};

/**
 * Returns a Sheets client or raises the deferred authentication failure.
 * @param {Object|undefined} sheetsInstance - Optional injected client.
 * @param {Error|undefined} initializationError - Deferred auth failure.
 * @returns {Object} Sheets client.
 */
export const requireSheetsClient = (sheetsInstance, initializationError) => {
  if (sheetsInstance) return sheetsInstance;
  throw withErrorContext(
    'Google Sheets is not configured. Please verify the credentials and spreadsheet configuration.',
    initializationError
  );
};

