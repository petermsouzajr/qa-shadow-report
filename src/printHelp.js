import chalk from 'chalk';

/** Print CLI help. Must not import config or Google clients. */
export function printHelp() {
  console.log(`
${chalk.bold.cyan('qa-shadow-report')} - Test reporting for Cypress & Playwright

${chalk.bold('USAGE:')}
  ${chalk.green('qa-shadow-report')} ${chalk.yellow('<framework>')} ${chalk.gray('[command] [options]')}
  ${chalk.green('qasr')} ${chalk.yellow('<framework>')} ${chalk.gray('[command] [options]')}           ${chalk.dim('(shortcut)')}

${chalk.bold('FRAMEWORK:')} ${chalk.dim('(required)')}
  ${chalk.yellow('cypress')}, ${chalk.yellow('cy')}    Generate reports for Cypress test results
  ${chalk.yellow('playwright')}, ${chalk.yellow('pw')} Generate reports for Playwright test results

${chalk.bold('COMMANDS:')} ${chalk.dim('(optional - default: generate all applicable reports)')}
  ${chalk.gray('todays-report')}      Generate only today's daily report
  ${chalk.gray('weekly-summary')}     Generate only the weekly summary (if enabled)
  ${chalk.gray('monthly-summary')}    Generate only the monthly summary

${chalk.bold('OPTIONS:')}
  ${chalk.gray('--csv')}              Output report in CSV format instead of Google Sheets
                       ${chalk.dim('(Note: Summaries not supported in CSV format)')}
  ${chalk.gray('--duplicate')}        Allow creating duplicate reports for the same day
  ${chalk.gray('--help')}             Show this help message

${chalk.bold('SETUP:')}
  ${chalk.green('qasr-setup')}         Run interactive configuration wizard

${chalk.bold('EXAMPLES:')}
  ${chalk.dim('# Generate all reports for Cypress (daily + summaries if configured):')}
  ${chalk.green('qa-shadow-report cypress')}

  ${chalk.dim('# Generate today\'s Playwright report only:')}
  ${chalk.green('qa-shadow-report playwright todays-report')}

  ${chalk.dim('# Generate Cypress report in CSV format (no Google account):')}
  ${chalk.green('qa-shadow-report cypress --csv')}

  ${chalk.dim('# Create duplicate daily report (useful for multiple test runs per day):')}
  ${chalk.green('qa-shadow-report playwright todays-report --duplicate')}

  ${chalk.dim('# Shorthand commands:')}
  ${chalk.green('qasr cy')}              ${chalk.dim('(same as: qa-shadow-report cypress)')}
  ${chalk.green('qasr pw --csv')}        ${chalk.dim('(same as: qa-shadow-report playwright --csv)')}

${chalk.bold('DOCUMENTATION:')}
  ${chalk.cyan('https://github.com/petermsouzajr/qa-shadow-report#readme')}

${chalk.bold('CONFIGURATION:')}
  Create ${chalk.yellow('shadowReportConfig.js')} in your project root, or run ${chalk.green('qasr-setup')}
  Required for every report: testData
  Required for Google Sheets only: googleSpreadsheetUrl, googleKeyFilePath
  `);
}
