import { google } from 'googleapis';
import { GOOGLE_SHEET_ID, GOOGLE_KEYFILE_PATH } from '../../constants.js';

const keyFilePath = GOOGLE_KEYFILE_PATH();

let auth, client, sheets, spreadsheetId;

if (keyFilePath) {
  try {
    spreadsheetId = GOOGLE_SHEET_ID();
    auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    async function getClient() {
      try {
        client = await auth.getClient();
        sheets = google.sheets({ version: 'v4', auth: client });
      } catch (error) {
        console.error('Error obtaining Google API client:', error);
        client = null; // Set client to null if there's an error
      }
    }

    await getClient();
  } catch (error) {
    console.error(
      'Could not load the default credentials. Please ensure the Google credentials file exists and is properly configured.'
    );
    console.error(error);
    auth = null; // Set auth to null if there's an error
  }
}

export { auth, sheets, spreadsheetId };
