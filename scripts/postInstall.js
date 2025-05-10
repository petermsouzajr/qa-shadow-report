#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { isProjectConfigured } from './configuredStatus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the directory name of the current script
const configFileName = 'shadowReportConfig.js';

/**
 * Finds the root directory of the project by looking for package.json.
 * @param {string} startPath - The path to start searching from.
 * @returns {string|null} The path to the project root or null if not found.
 */
const findProjectRoot = (startPath) => {
  let currentDir = startPath;

  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const nodeModulesPath = path.join(currentDir, 'node_modules');

      // Check if the current directory is inside a node_modules directory
      if (!currentDir.includes(path.sep + 'node_modules' + path.sep)) {
        return currentDir;
      }
    }

    currentDir = path.dirname(currentDir);
  }

  return null;
};

const projectRootPath = findProjectRoot(__dirname);

if (!projectRootPath) {
  console.error('Error: Could not determine the project root path.');
  process.exit(1);
}

const configFilePath = path.join(projectRootPath, configFileName);
const isConfiguredFilePath = path.join(__dirname, 'configuredStatus.js');
const isConfigured = isProjectConfigured();
const packages = ['mochawesome', 'mochawesome-merge'];
const setupLink =
  'https://www.npmjs.com/package/qa-shadow-report#sheets-setup-guide';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const promptUser = (message, options, callback) => {
  rl.question(chalk.blue(message), (answer) => {
    answer = answer.trim().toLowerCase();
    if (options.includes(answer)) {
      callback(answer);
    } else {
      confirmExit();
    }
  });
};

const confirmExit = () => {
  rl.question(
    chalk.yellow('Would you like to exit setup? [y/n]: '),
    (answer) => {
      if (answer === 'n') {
        startSetup();
      } else {
        console.info(
          chalk.green('Exiting setup.'),
          chalk.yellow(
            ` Check the setup guide information on dependencies ${setupLink}`
          )
        );
        updateIsConfiguredFile(true);
        rl.close();
        process.exit(0);
      }
    }
  );
};

/**
 * Creates the configuration file with default values.
 * @param {string} configPath - Path to the configuration file.
 * @param {Object} config - Configuration object.
 */

const createConfigFile = () => {
  console.info(
    chalk.blue('Checking if config file exists at path:'),
    chalk.green(` '${configFilePath}'`)
  );
  if (fs.existsSync(configFilePath)) {
    console.info(
      chalk.yellow('Config file'),
      chalk.green(` '${configFileName}'`),
      chalk.yellow(' already exists.')
    );
    return;
  } else {
    const defaultConfigContent = `
    // Sample Configuration File: Adjust values below to match your project's setup
    
    // TypeScript type definition (will be ignored in JavaScript)
    /** @type {{
      teamNames?: string[];
      testTypes?: string[];
      testCategories?: string[];
      googleSpreadsheetUrl?: string;
      googleKeyFilePath?: string;
      testData?: string;
      csvDownloadsPath?: string;
      weeklySummaryStartDay?: string;
    }} */
    
    // Support both CommonJS and ES Modules
    const config = {
        // Uncomment the relevant teams or add your own in the Describe block or It block:
        //  describe('[oregano] Unit test our math functions', () => {
        //    context('math', () => {
        //      it('can add numbers [C2452][smoke]', () => {
      teamNames: [
        //'oregano',
        //'wilkins',
        //'canonicus',
      ],
        // (default list) Uncomment the relevant test types or add your own by modifying your folder structure [framework]/ui/1-getting-started/todo.cy.js:
      testTypes: [
        // 'api',
        // 'ui',
        // 'unit',
        // 'integration',
        // 'endToEnd',
        // 'performance',
        // 'security',
        // 'database',
        // 'accessibility',
        // 'mobile',
      ],
        // (default list) Uncomment the relevant test categories or add your own in the Describe block or It block:
        //  describe('[oregano] Unit test our math functions', () => {
        //    context('math', () => {
        //      it('can add numbers [C2452][smoke]', () => {        
      testCategories: [
        // 'smoke',
        // 'regression',
        // 'sanity',
        // 'exploratory',
        // 'functional',
        // 'load',
        // 'stress',
        // 'usability',
        // 'compatibility',
        // 'alpha',
        // 'beta',
      ],
      // Google Spreadsheet URL: Replace with either the spreadsheet URL or an environment variable.
      // googleSpreadsheetUrl: 'your-google-spreadsheet-url' OR googleSpreadsheetUrl: process.env.GOOGLE_SHEET_URL,

      // Path to Google credentials file (service account JSON file): Replace with the file path or use an environment variable.
      // googleKeyFilePath: './googleCredentials.json' OR googleKeyFilePath: process.env.GOOGLE_KEY_FILE_PATH,

      // Path to test data results file in the format generated by your test runner. Replace with the path or use an environment variable.
      // testData: './path-to-test-results/output.json' OR testData: process.env.TEST_DATA,

      // Directory for saving CSV downloads (optional). Uncomment and replace with your preferred path or use an environment variable.
      // csvDownloadsPath: './downloads' OR csvDownloadsPath: process.env.CSV_DOWNLOADS_PATH,

     // Weekly summary settings (optional). To activate, set weekly summary sart date, summary will includes the start date and the following 7 days.
     // weeklySummaryStartDay: 'Monday' OR process.env.WEEKLY_SUMMARY_START_DAY
    };

    // Support both CommonJS and ES Modules
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = config;
    } else {
      export default config;
    }
    `;
    fs.writeFileSync(configFilePath, defaultConfigContent, {
      encoding: 'utf-8',
    });
    console.info(
      chalk.blue(`Config file created at: `),
      chalk.green(`${projectRootPath}/${configFileName}`)
    );
    console.info(
      chalk.yellow(`Please update the `),
      chalk.green(`testData `),
      chalk.yellow(`sourcepath in `),
      chalk.green(`${configFileName} `),
      chalk.yellow(`to match your project's setup.`)
    );
  }
};

const installPackages = (manager) => {
  try {
    if (manager === 'npm') {
      console.info(
        chalk.green(`Installing packages with npm: ${packages.join(', ')}`)
      );
      execSync(`npm install --save-dev ${packages.join(' ')}`, {
        stdio: 'inherit',
      });
    } else if (manager === 'yarn') {
      console.info(
        chalk.green(`Installing packages with yarn: ${packages.join(', ')}`)
      );
      execSync(`yarn add --dev ${packages.join(' ')}`, { stdio: 'inherit' });
    }
    console.info(chalk.green('Packages installed successfully.'));
  } catch (error) {
    console.error(chalk.red('Failed to install packages:'), error);
  }
};

const handlePostInstallTasks = (framework) => {
  promptUser(
    `A config file is required for qa-shadow-report would you like us to create one now at path ${chalk.green(
      configFilePath
    )}? ${chalk.green('[y/n]')}: `,
    ['y', 'n'],
    (create) => {
      if (create === 'y') {
        createConfigFile();
        proceedWithFrameworkSpecificInstructions(framework);
      } else {
        console.info(
          chalk.green('Skipping config file creation.'),
          chalk.yellow(
            ` Check the setup guide information on dependencies ${setupLink}`
          )
        );
        proceedWithFrameworkSpecificInstructions(framework);
      }
    }
  );
};

const proceedWithFrameworkSpecificInstructions = (framework) => {
  if (framework === 'pw') {
    console.info(
      chalk.yellow('Please ensure'),
      chalk.green("'playwright.config.js'"),
      chalk.yellow(' is updated to use the JSON reporter,'),
      chalk.green(
        " reporter: [['json', { outputFile: 'test-results/output.json' }]]"
      )
    );
    finalizeSetup();
  } else if (framework === 'cy') {
    promptUser(
      `Would you like to install ${chalk.green(
        packages.join(', ')
      )} for Cypress test reporting with Yarn or NPM, or skip this step (skip)? ${chalk.green(
        '[yarn/npm/skip]'
      )}: `,
      ['yarn', 'npm', 'skip'],
      (installer) => {
        if (['yarn', 'npm'].includes(installer)) {
          installPackages(installer);
        } else {
          console.info(
            chalk.green('Skipping dependency installation.'),
            chalk.yellow(
              ` Check the setup guide information on dependencies ${setupLink}`
            )
          );
        }
        finalizeSetup();
      }
    );
  }
};

const updateIsConfiguredFile = (isConfigured) => {
  try {
    const content = fs.readFileSync(isConfiguredFilePath, 'utf8');
    const searchValue = isConfigured ? 'return false;' : 'return true;';
    const replaceValue = isConfigured ? 'return true;' : 'return false;';
    const updatedContent = content.replace(searchValue, replaceValue);
    fs.writeFileSync(isConfiguredFilePath, updatedContent, 'utf8');
  } catch (err) {
    console.error(
      chalk.red('Failed to update the configuredStatus file:', err)
    );
  }
};

const finalizeSetup = () => {
  console.info(chalk.green('qa-shadow-report setup complete!'));
  updateIsConfiguredFile(true);
  rl.close();
};

const confirmReconfigure = () => {
  if (isConfigured) {
    promptUser(
      `You already ran configuration, would you like to continue with configuration? ${chalk.green(
        '[y/n]'
      )}: `,
      ['y', 'n'],
      (answer) => {
        if (answer === 'y') {
          updateIsConfiguredFile(false);
          startSetup();
        } else {
          confirmExit();
        }
      }
    );
  } else {
    startSetup();
  }
};

const startSetup = () => {
  promptUser(
    `Are you using Playwright (pw) or Cypress (cy)? ${chalk.green(
      '[pw/cy]'
    )}: `,
    ['pw', 'cy'],
    (framework) => {
      if (['pw', 'cy'].includes(framework)) {
        handlePostInstallTasks(framework);
      } else {
        confirmExit();
      }
    }
  );
};

try {
  confirmReconfigure();
} catch (error) {
  console.error(
    chalk.red(
      `An error occurred during the post-installation script. Check the setup guide information on dependencies ${setupLink}`
    ),
    error
  );
  process.exit(1);
}

// Export functions for testing
export {
  findProjectRoot,
  createConfigFile,
  installPackages,
  handlePostInstallTasks,
  proceedWithFrameworkSpecificInstructions,
  startSetup,
};
