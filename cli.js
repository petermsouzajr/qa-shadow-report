#!/usr/bin/env node
import chalk from 'chalk';
import { isProjectConfigured } from './scripts/configuredStatus.js';
import { main } from './src/index.js';
import { handleDailyReport } from './src/sharedMethods/dailyReportHandler.js';
import {
  handleSummary,
  handleWeeklySummary,
} from './src/sharedMethods/summaryHandler.js';
import { spawn } from 'child_process';
import { GOOGLE_KEYFILE_PATH, GOOGLE_SHEET_ID } from './constants.js';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Resolves the path to the postInstall.js script.
 * @returns {string} The resolved path to the postInstall.js script.
 */
const resolvePostInstallScript = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const postInstallPath = path.join(__dirname, 'scripts', 'postInstall.js');
    return postInstallPath;
  } catch (error) {
    console.error('Error: Unable to resolve the path to postInstall.js.');
    console.error(error);
    process.exit(1);
  }
};

/**
 * Main execution function for the command-line interface.
 * Processes command line arguments to determine the desired operation and configuration.
 * Supports generating daily and monthly reports with optional CSV output and duplication.
 */
async function run() {
  const args = process.argv.slice(2);
  const commands = args.filter((arg) =>
    ['todays-report', 'monthly-summary', 'weekly-summary'].includes(arg)
  );

  const command = commands[0] || ''; // Select the first command if multiple, though typically there should only be one
  const isCSV = args.includes('--csv'); // Checks if the CSV output is requested
  const isDuplicate = args.includes('--duplicate'); // Checks if duplication is requested
  const frameworkArg = args.find((arg) =>
    ['cypress', 'playwright', 'cy', 'pw'].includes(arg)
  );
  const isConfigured = isProjectConfigured();
  const framework = frameworkArg || ''; // Ensure the framework is correctly specified
  const isCypress = framework === 'cypress' || framework === 'cy';
  const isPlaywright = framework === 'playwright' || framework === 'pw';
  const unsupportedCsvForSummary =
    isCSV &&
    (command.includes('monthly-summary') || command.includes('weekly-summary'));
  const unsupportedDuplicateCsvForSummary =
    isCSV &&
    isDuplicate &&
    (command.includes('monthly-summary') || command.includes('weekly-summary'));
  const optionsPayload = {
    csv: isCSV,
    duplicate: isDuplicate,
    cypress: isCypress,
    playwright: isPlaywright,
  };

  if (args.includes('--help')) {
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

  ${chalk.dim('# Generate Cypress report in CSV format:')}
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
  Required fields: googleSpreadsheetUrl, googleKeyFilePath, testData
    `);
    process.exit(0);
  }

  if ((!GOOGLE_KEYFILE_PATH() || GOOGLE_SHEET_ID() === false) && !isCSV) {
    if (process.env.CI) {
      console.info(chalk.yellow('CI environment detected.'));
      process.exit(1); // Exit with failure in CI mode if the config is missing
    } else {
      // If the Google Sheets configuration is missing, default to CSV
      console.info(
        chalk.yellow(
          'You haven\'t set up a Google Sheets config yet. Use the command'
        ),
        chalk.green('qasr-setup'),
        chalk.yellow(
          'to create a config file. We can create a CSV report instead.'
        )
      );
      optionsPayload.csv = true;
    }
  }
  if (!isConfigured && !process.env.CI) {
    const postInstallScriptPath = resolvePostInstallScript();

    // Execute the postInstall.js script
    const child = spawn('node', [postInstallScriptPath], {
      stdio: 'inherit', // inherit stdio to allow interactive input/output
    });

    child.on('close', (code) => {
      process.exit(code);
    });

    // Ensure the parent script does not continue
    child.on('error', (err) => {
      console.info('Failed to start postInstall.js:', err);
      process.exit(1);
    });
  } else if (!framework) {
    console.info(
      chalk.yellow('Sheet not created. Please specify a framework:'),
      chalk.green('cypress'),
      chalk.yellow('or'),
      chalk.green('playwright')
    );
    process.exit(1);
  } else if (unsupportedCsvForSummary || unsupportedDuplicateCsvForSummary) {
    console.info(
      chalk.yellow(
        'Error: CSV output for summaries with or without duplication is not supported.'
      )
    );
    process.exit(1);
  } else {
    try {
      switch (command) {
      case 'todays-report':
        await handleDailyReport({ ...optionsPayload });
        break;
      case 'monthly-summary':
        await handleSummary({ ...optionsPayload });
        break;
      case 'weekly-summary':
        await handleWeeklySummary({ ...optionsPayload });
        break;
      default:
        await main({ ...optionsPayload });
        break;
      }
    } catch (error) {
      console.error('Error executing command:', error);
    }
  }
}

run();
