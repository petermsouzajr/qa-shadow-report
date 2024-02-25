import { google } from 'googleapis';
import { GOOGLE_SHEET_ID } from '../../constants.js';

const keyFilePath = 'googleCredentials.json';

export const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

let client;
async function getClient() {
  client = await auth.getClient();
}
getClient();

export const sheets = google.sheets({ version: 'v4', auth: client });

export const spreadsheetId = GOOGLE_SHEET_ID();
