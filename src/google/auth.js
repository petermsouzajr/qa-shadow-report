import fs from 'fs';
import { google } from 'googleapis';
import { GOOGLE_SHEET_ID, GOOGLE_KEYFILE_PATH } from '../../constants.js';

const initializeAuth = async () => {
  let auth;
  let sheets;
  let spreadsheetId;
  let initializationError;
  const csvOnly = process.argv.includes('--csv');
  const keyFilePath = GOOGLE_KEYFILE_PATH();
  const keyFileExists = Boolean(keyFilePath) && fs.existsSync(keyFilePath);

  const getClient = async () => {
    const client = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: client });
  };

  // CSV reports do not need Google. A missing key file must not crash --help or --csv.
  if (!csvOnly && keyFileExists) {
    try {
      spreadsheetId = GOOGLE_SHEET_ID();
      auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
      });

      await getClient();
    } catch (error) {
      // Keep module loading safe for CSV/help flows; Google operations report
      // the configuration failure when they are actually requested.
      auth = undefined;
      sheets = undefined;
      spreadsheetId = undefined;
      initializationError = error;
    }
  }

  return { auth, sheets, spreadsheetId, initializationError };
};

const authContext = await initializeAuth();

/**
 * Returns the initialized Google integration dependencies.
 * @returns {{auth: Object|undefined, sheets: Object|undefined, spreadsheetId: string|undefined, initializationError: Error|undefined}}
 */
export const getAuthContext = () => authContext;

// Retain the existing named exports for downstream consumers.
export const { auth, sheets, spreadsheetId, initializationError } = authContext;
