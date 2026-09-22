import chalk from 'chalk';
import { isProjectConfigured } from '../scripts/configuredStatus.js';
import { main } from './index.js';
import { handleDailyReport } from './sharedMethods/dailyReportHandler.js';
import {
  handleSummary,
  handleWeeklySummary,
} from './sharedMethods/summaryHandler.js';
import { spawn } from 'child_process';
import { GOOGLE_KEYFILE_PATH, GOOGLE_SHEET_ID } from '../constants.js';
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
    const postInstallPath = path.join(__dirname, '../scripts/postInstall.js');
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

  const command = commands[0] || '';
  const isCSV = args.includes('--csv');
  const isDuplicate = args.includes('--duplicate');
  const frameworkArg = args.find((arg) =>
    ['cypress', 'playwright', 'cy', 'pw'].includes(arg)
  );
  const isConfigured = isProjectConfigured();
  const framework = frameworkArg || '';
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

  if ((!GOOGLE_KEYFILE_PATH() || GOOGLE_SHEET_ID() === false) && !isCSV) {
    if (process.env.CI) {
      console.info(chalk.yellow('CI environment detected.'));
      process.exit(1);
    } else {
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

    const child = spawn('node', [postInstallScriptPath], {
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      process.exit(code);
    });

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
