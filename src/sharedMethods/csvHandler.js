import fs from 'fs';
import path from 'path';
import { getCurrentTime, getTodaysFormattedDate } from './dateFormatting.js';

/**
 * Converts a 2D array into a CSV string format.
 * @param {Array<Array<string>>} data - The 2D array to be converted into CSV format.
 * @returns {string} The CSV string.
 */
const arrayToCSV = (data) => {
  return data
    .map((row) =>
      row
        .map(String)
        .map((v) => v.replace(/"/g, '""')) // Using replace with a global regex
        .map((v) => `"${v}"`)
        .join(',')
    )
    .join('\n');
};

/**
 * Saves CSV data to a file in the Cypress downloads directory.
 * @param {Array<Array<string>>} my2DArray - The 2D array to convert to CSV and save.
 */
export const saveCSV = (my2DArray, duplicate) => {
  const csvData = arrayToCSV(my2DArray);
  const downloadsPath = path.join('cypress', 'downloads');
  const todaysTitle = getTodaysFormattedDate();
  const time = getCurrentTime();
  let filePath = path.join(downloadsPath, `${todaysTitle}.csv`);

  if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath);
  }

  if (fs.existsSync(filePath) && !duplicate) {
    console.error(
      'CSV file already exists. Use --duplicate flag to allow creating a duplicate file "cy-shadow-report --csv --duplicate".'
    );
    return;
  } else if (fs.existsSync(filePath) && duplicate) {
    filePath = path.join(downloadsPath, `${todaysTitle}_${time}.csv`);
  }

  fs.writeFileSync(filePath, csvData, 'utf8');
  console.log(`CSV file has been saved successfully to ${filePath}`);
};
