# Playwright Example - QA Shadow Report Demo

This is a fully functional example project demonstrating how to integrate `qa-shadow-report` with Playwright for automated test reporting to Google Sheets or CSV.

## Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) Google Service Account credentials for Sheets reporting

## Quick Start

### 1. Install Dependencies

From this `playwright-example` directory:

```bash
npm install
```

This installs Playwright, the Playwright test runner, and links to the local `qa-shadow-report` package via `file:..`.

**Note:** Playwright will automatically download the necessary browser binaries during installation.

**Alternative installation methods:**
- **Using npm link** (from repository root): `npm link && cd playwright-example && npm install && npm link qa-shadow-report`
- **Using published package**: Change `"qa-shadow-report": "file:.."` to `"qa-shadow-report": "^2.1.8"` in package.json

### 2. Run Tests (CSV Mode - No Setup Required)

Run tests and generate a CSV report (no Google credentials needed):

```bash
npm test
```

This will:
1. Delete previous test results
2. Run all Playwright tests
3. Generate a JSON report at `test-results/output.json`
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
tests/
├── api/          # API tests (type inferred from folder)
│   └── jsonplaceholder.spec.js
└── ui/           # UI tests (type inferred from folder)
    ├── todo-app.spec.js
    └── editing.spec.js
```

### Annotation Examples

The test suite demonstrates various annotation patterns:

- **Team ownership:** `[billing]`, `[platform]`, `[unicorns]`, `[robots]`
- **Test categories:** `[smoke]`, `[regression]`, `[sanity]`, `[functional]`, `[usability]`, `[accessibility]`
- **Manual case IDs:** `[C3001]`, `[DEV-456]`, `[TC-4001]`, `[#501]`
- **Test types:** Inferred from folder structure (`api/` or `ui/`)

Example test title:
```javascript
test('should fetch all posts [C4001][smoke]', async ({ request }) => {
  // Test implementation
});
```

This produces a report row with:
- Team: robots (from test.describe block)
- Type: api (from folder structure)
- Category: smoke (from test title)
- Manual Case: C4001

## Scripts

- `npm test` - Run full test suite and generate reports
- `npm run playwright:ui` - Open Playwright UI mode for interactive testing
- `npm run playwright:debug` - Run tests in debug mode with inspector
- `npm run playwright:run` - Run tests headlessly with JSON reporter
- `npm run report:generate` - Generate qa-shadow-report (requires test results JSON)

## Configuration Files

- **`playwright.config.mjs`** - Playwright configuration
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

## Test Targets

### UI Tests
- Uses Playwright's demo TodoMVC application
- Tests basic CRUD operations, filtering, bulk actions
- Demonstrates accessibility and usability testing

### API Tests
- Uses JSONPlaceholder public API
- Tests REST endpoints for posts and users
- No authentication required

## Customization

### Adding New Teams
Edit `shadowReportConfig.js` and add team names to the `teamNames` array, then use them in test describe blocks:

```javascript
test.describe('[myteam] Feature Tests', () => {
  // tests
});
```

### Adding New Categories
Edit `shadowReportConfig.js` and add categories to the `testCategories` array, then use them in test titles:

```javascript
test('should do something [mycategory]', async ({ page }) => {
  // test
});
```

### Organizing by Test Type
Create folders under `tests/` named after your test types (e.g., `integration/`, `performance/`):

```
tests/
├── api/
├── ui/
├── integration/
└── performance/
```

The test type is automatically inferred from the folder name.

### Running Specific Tests
```bash
# Run only UI tests
npx playwright test tests/ui

# Run only API tests
npx playwright test tests/api

# Run a specific file
npx playwright test tests/ui/todo-app.spec.js

# Run tests matching a pattern
npx playwright test -g "should fetch"
```

## Troubleshooting

**Tests fail with network errors:**
- Check your internet connection
- The UI tests use `https://demo.playwright.dev/todomvc`
- The API tests use `https://jsonplaceholder.typicode.com`
- Update `baseURL` in `playwright.config.mjs` if needed

**Browser not found errors:**
- Run `npx playwright install` to download browser binaries
- Or run `npx playwright install chromium` for just Chromium

**Report generation fails:**
- Ensure `test-results/output.json` exists after running tests
- Check that the JSON reporter is configured in `playwright.config.mjs`
- Verify the `testData` path in `shadowReportConfig.js` matches the output file

**Google Sheets authentication errors:**
- Verify your service account email has Editor access to the sheet
- Check that `googleKeyFilePath` in `shadowReportConfig.js` points to valid credentials
- Ensure `googleSpreadsheetUrl` is correct

**CSV not generated:**
- Add `--csv` flag: `npx qa-shadow-report playwright --csv`
- Or update scripts in package.json to include the flag

## Learn More

- [qa-shadow-report Documentation](https://github.com/petermsouzajr/qa-shadow-report)
- [Playwright Documentation](https://playwright.dev)
- [Google Service Account Setup](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication)
