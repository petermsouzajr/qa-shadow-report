#!/usr/bin/env node
import { main } from './src/index.js';
import { handleDailyReport } from './src/sharedMethods/dailyReportHandler.js';
import { handleSummary } from './src/sharedMethods/summaryHandler.js';

/**
 * Main execution function for the command-line interface.
 * Processes command line arguments to determine the desired operation and configuration.
 * Supports generating daily and monthly reports with optional CSV output and duplication.
 */
async function run() {
  const args = process.argv.slice(2);
  const command = args[0]; // The command to execute
  const isCSV = args.includes('--csv'); // Checks if the CSV output is requested
  const allowDuplicate = args.includes('--duplicate'); // Checks if duplication is permitted

  try {
    switch (command) {
    case 'todays-report':
      /**
         * Handles the generation of the daily report.
         * @param {Object} options - Contains options specifying output format and duplication permission.
         * @property {boolean} options.csv - If true, outputs in CSV format.
         * @property {boolean} options.duplicate - If true, allows creating a duplicate report for the day.
         */
      await handleDailyReport({ csv: isCSV, duplicate: allowDuplicate });
      break;
    case 'monthly-summary':
      /**
         * Handles the generation of the monthly summary.
         * @param {Object} options - Contains options specifying output format and duplication permission.
         * @property {boolean} options.csv - If true, outputs in CSV format.
         * @property {boolean} options.duplicate - If true, allows creating a duplicate summary for the month.
         */
      await handleSummary({ csv: isCSV, duplicate: allowDuplicate });
      break;
    default:
      /**
         * Handles the of default command.
         * @param {Object} options - Contains options specifying output format and duplication permission.
         * @property {boolean} options.csv - If true, outputs in CSV format.
         * @property {boolean} options.duplicate - If true, allows creating a duplicate summary for the month.
         */
      await main({ csv: isCSV, duplicate: allowDuplicate });
      break;
    }
  } catch (error) {
    // Logs any errors that occur during the execution of the commands
    console.error('Error executing command:', error);
  }
}

run(); // Initiates the command processing
