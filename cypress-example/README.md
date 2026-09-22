# Cypress Example - QA Shadow Report Demo

This is a fully functional example project demonstrating how to integrate `qa-shadow-report` with Cypress for automated test reporting to Google Sheets or CSV.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) Google Service Account credentials for Sheets reporting

## Quick Start

### 1. Install Dependencies

From this `cypress-example` directory:

```bash
npm install
```

This installs Cypress, mochawesome reporters, and links to the local `qa-shadow-report` package via `file:..`.

**Alternative installation methods:**
- **Using npm link** (from repository root): `npm link && cd cypress-example && npm install && npm link qa-shadow-report`
- **Using published package**: Change `"qa-shadow-report": "file:.."` to `"qa-shadow-report": "^2.1.8"` in package.json

### 2. Run Tests (CSV Mode - No Setup Required)

Run tests and generate a CSV report (no Google credentials needed):

```bash
npm test
```

This will:
1. Delete previous test results
2. Run all Cypress tests headlessly
3. Merge individual test results into `cypress/results/output.json`
4. Generate a CSV report in the `downloads/` folder

### 3. Google Sheets Reporting (Optional)

To enable Google Sheets reporting:

1. **Set up Google Service Account credentials** following the [node-google-spreadsheet authentication guide](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication)

2. **Create your config file:**
   ```bash
   cp shadowReportConfig.js.example shadowReportConfig.js
   ```

3. **Edit `shadowReportConfig.js`:**
   - Add your Google Spreadsheet URL
   - Set the path to your credentials file (default: `./googleCredentials.json`)
   - Adjust team names, test types, and categories as needed

4. **Place your credentials:**
   Save your Google service account JSON file as `googleCredentials.json` in this directory (it's gitignored)

5. **Share your Google Sheet:**
   Give your service account email address (found in the credentials file) Editor access to your spreadsheet

6. **Run tests and generate report:**
   ```bash
   npm test
   ```

## Test Structure

This example includes realistic test scenarios demonstrating the annotation conventions used by `qa-shadow-report`:

### Test Organization

```
cypress/e2e/
├── api/          # API tests (type inferred from folder)
│   └── todos.cy.js
└── ui/           # UI tests (type inferred from folder)
    ├── homepage.cy.js
    └── navigation.cy.js
```

### Annotation Examples

The test suite demonstrates various annotation patterns:

- **Team ownership:** `[billing]`, `[platform]`, `[unicorns]`, `[robots]`
- **Test categories:** `[smoke]`, `[regression]`, `[sanity]`, `[functional]`, `[performance]`, `[accessibility]`
- **Manual case IDs:** `[C1001]`, `[DEV-345]`, `[TC-2001]`, `[#356]`
- **Test types:** Inferred from folder structure (`api/` or `ui/`)

Example test title:
```javascript
it('should fetch all todos [C2001][smoke]', () => {
  // Test implementation
});
```

This produces a report row with:
- Team: robots (from describe block)
- Type: api (from folder structure)
- Category: smoke (from test title)
- Manual Case: C2001

## Scripts

- `npm test` - Run full test suite and generate reports
- `npm run cypress:open` - Open Cypress Test Runner for interactive testing
- `npm run cypress:run` - Run tests headlessly with mochawesome reporter
- `npm run report:merge` - Merge individual test results into single JSON
- `npm run report:generate` - Generate qa-shadow-report (requires merged JSON)

## Configuration Files

- **`cypress.config.js`** - Cypress configuration
- **`shadowReportConfig.js.example`** - Template for qa-shadow-report configuration
- **`shadowReportConfig.js`** - Your local config (gitignored, copy from .example)
- **`package.json`** - Dependencies and scripts

## Reports Generated

### CSV Report (Default)
- Location: `downloads/`
- Contains: Daily test results with all metrics hardcoded
- No credentials required

### Google Sheets Report (With Setup)
- **Daily Report:** Detailed test results with pass/fail status, execution time, errors
- **Weekly Summary:** (Optional) Aggregate statistics for the previous 7 days
- **Monthly Summary:** (Optional) Historical trends from previous month's daily reports

## Customization

### Adding New Teams
Edit `shadowReportConfig.js` and add team names to the `teamNames` array, then use them in test describe blocks:

```javascript
describe('[myteam] Feature Tests', () => {
  // tests
});
```

### Adding New Categories
Edit `shadowReportConfig.js` and add categories to the `testCategories` array, then use them in test titles:

```javascript
it('should do something [mycategory]', () => {
  // test
});
```

### Organizing by Test Type
Create folders under `cypress/e2e/` named after your test types (e.g., `integration/`, `performance/`):

```
cypress/e2e/
├── api/
├── ui/
├── integration/
└── performance/
```

The test type is automatically inferred from the folder name.

## Troubleshooting

**Tests fail with "baseUrl" error:**
- The example uses Cypress's demo site at `https://example.cypress.io`
- Check your internet connection or update `baseUrl` in `cypress.config.js`

**Report generation fails:**
- Ensure `cypress/results/output.json` exists after running tests
- Check that mochawesome-merge successfully combined results

**Google Sheets authentication errors:**
- Verify your service account email has Editor access to the sheet
- Check that `googleKeyFilePath` in `shadowReportConfig.js` points to valid credentials
- Ensure `googleSpreadsheetUrl` is correct

**CSV not generated:**
- Add `--csv` flag: `npx qa-shadow-report cypress --csv`
- Or update scripts in package.json to include the flag

## Learn More

- [qa-shadow-report Documentation](https://github.com/petermsouzajr/qa-shadow-report)
- [Cypress Documentation](https://docs.cypress.io)
- [Google Service Account Setup](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication)
