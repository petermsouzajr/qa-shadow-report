#!/usr/bin/env node
import { main } from './src/index.js';
import { handleDailyReport } from './src/sharedMethods/dailyReportHandler.js';
import { handleSummary } from './src/sharedMethods/summaryHandler.js';

/**
 * Processes command line arguments to determine the report type and output format.
 * Supports commands for daily and monthly reports with an optional CSV format.
 *
 * @param {string[]} args - The array of command line arguments.
 */
const args = process.argv.slice(2);
const command = args[0];
const isCSV = args.includes('--csv'); // Check if '--csv' is one of the arguments
// const isCSV = true;

switch (command) {
  case 'todays-report':
    /**
     * Handle daily report generation.
     * @param {string|undefined} format - Specifies the output format ('csv' or undefined).
     */
    await handleDailyReport(isCSV ? 'csv' : undefined);
    break;
  case 'monthly-summary':
    /**
     * Handle monthly summary generation.
     * @param {string|undefined} format - Specifies the output format ('csv' or undefined).
     */
    await handleSummary(isCSV ? 'csv' : undefined);
    break;
  default:
    /**
     * Execute the main function of the package.
     * @param {string|undefined} format - Specifies the output format ('csv' or undefined).
     */
    await main(isCSV ? 'csv' : undefined);
    break;
}
