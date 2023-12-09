# Cypress + Sheets = Enhanced Reporting and Organization

Our package bridges Cypress test runs with Google Sheets or Microsoft Excel, streamlining test result integration and boosting team collaboration. It not only provides immediate insights into automation project health but also fosters a paradigm shift in organizational methods, promoting clearer coordination and efficiency.

## Setup Guide

#### Prerequisites

Before you begin, ensure you have:

- Mochawesome and Mochawesome Merge: Install these for Cypress test report generation: `npm install --save-dev mochawesome mochawesome-merge`

- Google Spreadsheet ID: Find this in your sheet's URL and store it in an environment variable.

- Service Account Credentials for Google Sheets: Follow the detailed guide on [node-google-spreadsheet](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication?id=authentication-methods)
  to set up and safely store your credentials, updating `cypress.config.*` with the path to these credentials. Use `.gitignore` to secure your credentials within your project.

#### Recommended package.json Scripts

To ensure tests and reports are processed correctly, configure your package.json scripts as follows:

```
  "scripts": {
    "cypress:prerun": "rm -rf cypress/results",
    "cypress:run": "npm run cypress:prerun && cypress run --headless --reporter mochawesome --reporter-options reportDir=cypress/results,overwrite=false,html=false,json=true",
    "postcypress:run": "npm run report:merge",
    "report:merge": "mochawesome-merge cypress/results/*.json > cypress/results/output.json && npm run report:generate",
    "report:generate": "cy-shadow-report",
    "test": "npm run cypress:run"
  },
```

Adjust these scripts as needed for your project's requirements.

#### Cypress Configuration

Incorporate `cy-shadow-report` configuration into your `cypress.config.*` file:

```
const { defineConfig } = require('cypress');
const cyShadowReport = require('cy-shadow-report');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {

      const shadowConfig = {
        teamNames: [],
        testTargets: [],
        testPurposes: [],
        columns: [],
        googleSpreadsheetId: process.env.googleSheetId,
        googleKeyFilePath: 'googleCredentials.json',
        testData: 'cypress/results/output.json',
      };
      cyShadowReport.setConfig(shadowConfig);
    },
  },
});

```

### Minimum Configuration

Include the following in your `cypress.config.*` file for basic functionality:

- `googleSpreadsheetId`: This is the Sheet ID for your Google Sheets project.
- `googleKeyFilePath`: The file path to your Google service account credentials.

```
const shadowConfig = {
        teamNames: [],
        testTargets: [],
        testPurposes: [],
        columns: [],
        googleSpreadsheetId: process.env.googleSheetId,
        googleKeyFilePath: 'googleCredentials.json',
        testData: 'cypress/results/output.json',
      };
```

### Enhanced Configuration

#### Column: Team Name

If you have team names or labels indicating ownership of a test or code feature, you need to specify them to ensure visibility on the report sheet. Add them to your `cypress.config.*` file:

```
const shadowConfig = {
  teamNames: ['oregano', 'juniper', 'windsor'],
  googleSpreadsheetId: process.env.googleSheetId,
  googleKeyFilePath: 'googleCredentials.json',
  testData: 'cypress/results/output.json',
},
```

The Team Name column aggregates and displays data based on the team names you define. Include the team name within square brackets in the describe block string to identify the team responsible for the feature code. For instance, `[Windsor]` is used as the team name in this example:

```
describe('[Windsor] Unit test our math functions', () => {
  context('math', () => {
    it('can add numbers [C2452][smoke]', () => {
      expect(add(1, 2)).to.eq(3)
    })

    it('can subtract numbers [C24534][smoke]', () => {
      expect(subtract(5, 12)).to.eq(-7)
    })

    it('can divide numbers [C2460]', () => {
      expect(divide(27, 9)).to.eq(3)
    })

    it('can multiply numbers [C2461]', () => {
      expect(multiply(5, 4)).to.eq(20)
    })
  })
})
```

This configuration allows for a more organized and comprehensive report, showcasing test ownership and facilitating team-specific analysis. If you do not specify Team Names, there will be no metrics reported regarding Teams.

### Column: Test Target

The Test Target column compiles and categorizes data based on predefined categories. To ensure visibility on the report sheet. Add them to your `cypress.config.*` file. If you do not specify a list of Test Targets, the reporting software will use the default list, and will only compile metrics based on the default list of: `["api", "ui", "unit", "integration", "endToEnd", "performance", "security", "database", "accessibility", "mobile"]`.

```
const shadowConfig = {
      teamNames: ['oregano'],
      testTargets: [
        'api',
        'ui',
        'unit',
        'integration',
        'endToEnd',
        'performance',
        'security',
        'database',
        'accessibility',
        'mobile',
      ],
      googleSpreadsheetId: process.env.googleSheetId,
      googleKeyFilePath: 'googleCredentials.json',
      testData: 'cypress/results/output.json',
},
```

To incorporate a Test Target into your Cypress report, it's essential, and highly recommended, to integrate the Target Type into your Cypress file structure. This practice enhances organizational clarity within your team. For instance, in this example, 'api' is added after the e2e directory:

`cypress/e2e/api/1-getting-started/todo.cy.js`

Similarly, you can structure your files for other types, such as UI or Performance:

`cypress/e2e/ui/1-getting-started/todo.cy.js`
`cypress/e2e/performance/1-getting-started/todo.cy.js`

This method of file organization facilitates easy identification and categorization of tests based on their target type, thereby streamlining the reporting and analysis process.

### Column: Test Purpose

The Test Purpose column compiles data to represent the specific purpose of each test, based on predefined categories. To ensure visibility on the report sheet. Add them to your `cypress.config.*` file. If you do not specify a list of Test Purposes, the reporting software will use the default list, and will only compile metrics based on the default list of: `["smoke", "regression", "sanity", "exploratory", "functional", "load", "stress", "usability", "compatibility", "alpha", "beta"]`.

```
    const shadowConfig = {
      teamNames: ['oregano'],
      testTargets: ['mobile'],
      testPurposes: [
        'smoke',
        'regression',
        'sanity',
        'exploratory',
        'functional',
        'load',
        'stress',
        'usability',
        'compitibility',
        'alpha',
        'beta',
      ],
      googleSpreadsheetId: process.env.googleSheetId,
      googleKeyFilePath: 'googleCredentials.json',
      testData: 'cypress/results/output.json',
    },
```

To indicate the purpose of a test within your Cypress suite, add the Test Purpose in square brackets at the end of the string in the `it` block. This annotation specifies the intended coverage of the test. For example, in this snippet, `[smoke]` and `[usability]` are used to denote Test Purposes:

```
describe('[Windsor] Unit test our math functions', () => {
  context('math', () => {
    it('can add numbers [C2452][smoke]', () => {
      expect(add(1, 2)).to.eq(3)
    })

    it('can subtract numbers [C24534][smoke]', () => {
      expect(subtract(5, 12)).to.eq(-7)
    })

    it('can divide numbers [C2460] [usability]', () => {
      expect(divide(27, 9)).to.eq(3)
    })

    it('can multiply numbers [C2461]', () => {
      expect(multiply(5, 4)).to.eq(20)
    })
  })
})
```

This approach not only categorizes your tests effectively but also adds clarity to the specific objectives they aim to achieve, thereby enhancing the insightfulness of your test reporting.

### Column: Testrail Id

The TestRail ID column is designed to extract data from the test report output and align it with the associated TestRail ID in the TestRail ID column. Within the it block string in your Cypress tests, include the TestRail ID in square brackets at the end of the string. This notation specifies the TestRail ID linked to each particular test. For instance, `[C2452]` and `[C24534]` are examples of TestRail IDs used in this context:

```
describe('[Windsor] Unit test our math functions', () => {
  context('math', () => {
    it('can add numbers [C2452][smoke]', () => {
      expect(add(1, 2)).to.eq(3)
    })

    it('can subtract numbers [C24534][smoke]', () => {
      expect(subtract(5, 12)).to.eq(-7)
    })

    it('can divide numbers [C2460] [usability]', () => {
      expect(divide(27, 9)).to.eq(3)
    })

    it('can multiply numbers [C2461]', () => {
      expect(multiply(5, 4)).to.eq(20)
    })
  })
})
```

This method ensures that each test is accurately linked to its corresponding TestRail ID, facilitating a more detailed and organized approach to test tracking, reporting, and auditing.

### Customizing Report Columns

The columns themselves can be customized, based on what data you want to report or not report. To ensure visibility on the report sheet. Add them to your `cypress.config.*` file. If you do not specify a list of columns you want on your report, the reporting software will use the default list, and will only compile metrics based on the default list of: `['area', 'spec', 'test', 'name', 'type', 'category', 'team', 'priority', 'status', 'state', 'testrail id', 'error', 'speed'].

```
    const shadowConfig = {
      teamNames: ['oregano'],
      testTargets: ['mobile'],
      testPurposes: ['functional'],
      columns: [
        'area',
        'spec',
        'test name',
        'type',
        'category',
        'team',
        'priority',
        'status',
        'state',
        'testrail id',
        'error',
        'speed',
      ],
      googleSpreadsheetId: process.env.googleSheetId,
      googleKeyFilePath: 'googleCredentials.json',
      testData: 'cypress/results/output.json',
    },
```

This approach not only categorizes your tests effectively but also adds clarity to the specific objectives they aim to achieve, thereby enhancing the insightfulness of your test reporting. To reiterate, if you do not have specific values for `testTarget`, `testPurpose`, and `column`, they will fall back to default values mentined in this document

#### 'The Works'

When specifying your Team Names, Test Targets, Test Purposes, and even Columns, your `cypress.config.*` can look like this:

```
    const shadowConfig = {
      teamNames: [
        'oregano',
        'spoofer',
        'juniper',
        'occaecati',
        'wilkins',
        'canonicus',
      ],
      testTargets: [
        'api',
        'ui',
        'unit',
        'integration',
        'endToEnd',
        'performance',
        'security',
        'database',
        'accessibility',
        'mobile',
      ],
      testPurposes: [
        'smoke',
        'regression',
        'sanity',
        'exploratory',
        'functional',
        'load',
        'stress',
        'usability',
        'compitibility',
        'alpha',
        'beta',
      ],
      columns: [
        'area',
        'spec',
        'test name',
        'type',
        'category',
        'team',
        'priority',
        'status',
        'state',
        'testrail id',
        'error',
        'speed',
      ],
      googleSpreadsheetId: process.env.googleSheetId,
      googleKeyFilePath: 'googleCredentials.json',
      testData: 'cypress/results/output.json',
    },
```

### Header Metrics Panel

The Header Metrics Panel is designed to automatically generate key statistics from the test output JSON file. This feature enables a quick and comprehensive overview of test results.

## Generating a Report

#### To generate a report using `cy-shadow-report`:

- to run the daily report only:

  - there must be Json data present from cypress test output.
  - there must be no tab named with the current date title.

  - run `cy-shadow-report todays-report`

- to run the monthly summary report only:

  - there must be daily reports present from previous month.
  - there must be no tab named with the last months summary title.

  - run `cy-shadow-report monthly-summary`

- to run the standard global functionality, run the command: `cy-shadow-report`

  - This command will process the test data and present a detailed report, enhancing your test analysis and decision-making process.

  - The report will fail if JSON test data is not present.

  - The Daily Report will not run if the current day's report already exists (based on tab title). The current day's tab title can be modified to run a new report for the same day.

  - The Monthly Summary will not generate if a monthly summary already exists for the previous month (based on tab title). The previous month's summary tab title can be modified to run a new summary for the previous month.

## Copyright

© 2024 Peter Souza. All rights reserved. Users are granted the freedom to use this code according to their needs and preferences.
