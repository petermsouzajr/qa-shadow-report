const { defineConfig } = require('cypress');
const cyShadowReport = require('cy-shadow-report');
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here

      const shadowConfig = {
        teamNames: ['oregano'],
        testTargets: ['mobile'],
        testPurposes: ['functional'],
        columns: ['test name', 'type', 'category', 'team', 'status', 'state'],
        googleSpreadsheetId: process.env.googleSheetId,
        googleKeyFilePath: 'googleCredentials.json',
        testData: 'cypress/results/output.json',
      };
      cyShadowReport.setConfig(shadowConfig);
    },
  },
});
