#!/usr/bin/env node
const { main } = require('./src/index.js');
const {
  handleDailyReport,
} = require('./src/sharedMethods/dailyReportHandler.js');
const { handleSummary } = require('./src/sharedMethods/summaryHandler.js');

// Retrieve the third argument from command line
const command = process.argv[2];

switch (command) {
  case 'todays-report':
    // Execute another function
    handleDailyReport();
    break;
  case 'monthly-summary':
    // Execute another function
    handleSummary();
    break;
  default:
    // Execute the main function of your package
    main();
    break;
}
