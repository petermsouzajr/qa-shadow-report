import fs from 'fs';
import { google } from 'googleapis';
import { GOOGLE_SHEET_ID, GOOGLE_KEYFILE_PATH } from '../../constants.js';

let auth;
let sheets;
let spreadsheetId;

const csvOnly = process.argv.includes('--csv');
const keyFilePath = GOOGLE_KEYFILE_PATH();
const keyFileExists = Boolean(keyFilePath) && fs.existsSync(keyFilePath);

const getClient = async () => {
  try {
    const client = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: client });
  } catch (error) {
    console.error('Error obtaining Google API client:', error);
  }
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
    console.error(
      'Could not load the default credentials. Please ensure the Google credentials file exists and is properly configured.'
    );
    console.error(error);
    auth = null;
  }
}

export { auth, sheets, spreadsheetId };
