#!/usr/bin/env node
import { main } from './src/index.js';
import { handleDailyReport } from './src/sharedMethods/dailyReportHandler.js';
import { handleSummary } from './src/sharedMethods/summaryHandler.js';

// Retrieve the third argument from command line
const command = process.argv[2];

switch (command) {
case 'todays-report':
  // Execute another function
  await handleDailyReport();
  break;
case 'monthly-summary':
  // Execute another function
  await handleSummary();
  break;
default:
  // Execute the main function of your package
  await main();
  break;
}
