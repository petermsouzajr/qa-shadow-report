import { google } from 'googleapis';
import { GOOGLE_SHEET_ID } from '../../constants.js';

// const keyFilePath = '../googleCredentials.json';
const keyFilePath = 'googleCredentials.json';

export const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

const client = await auth.getClient();

export const sheets = google.sheets({ version: 'v4', auth: client });

export const spreadsheetId = GOOGLE_SHEET_ID();
