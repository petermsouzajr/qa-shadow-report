import fs from 'fs';
import { execSync } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configFileName = 'shadowReportConfig.js';
const projectRootPath = path.join(__dirname, '..', '..');
const configFilePath = path.join(projectRootPath, configFileName);
const packages = ['mochawesome', 'mochawesome-merge'];
const setupLink =
  'https://www.npmjs.com/package/qa-shadow-report#sheets-setup-guide';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Check if running in a git repository directory
if (fs.existsSync(path.join(__dirname, '..', '.git'))) {
  console.log(
    chalk.yellow(
      'Detected development environment, skipping post-install script.'
    )
  );
  rl.close();
  process.exit(0);
}

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
          chalk.yellow(
            `Exiting setup. Check the setup guide information on dependencies ${setupLink}}`
          )
        );
        rl.close();
        process.exit(0);
      }
    }
  );
};

const createConfigFile = () => {
  if (fs.existsSync(configFilePath)) {
    console.info(
      chalk.yellow(`Config file '${configFileName}' already exists.`)
    );
    return;
  } else {
    const defaultConfigContent = `
    // Sample Configuration File: Adjust values below to match your project's setup
    
    module.exports = {
      teamNames: [
        // Uncomment the relevant teams or add your own:
        //'oregano',
        //'wilkins',
        //'canonicus',
      ],
      testTypes: [
        // Uncomment the relevant test types or add your own:
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
      testCategories: [
        // Uncomment the relevant test categories or add your own:
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
      // Replace with the actual Google Spreadsheet ID:
      googleSpreadsheetId: 'your-google-spreadsheet-id',
    
      // Path to your Google credentials file:
      googleKeyFilePath: 'googleCredentials.json',
    
      // Path to your test data results:
      testData: './path-to-test-results/output.json',
    };
    `;
    fs.writeFileSync(configFilePath, defaultConfigContent, {
      encoding: 'utf-8',
    });
    console.info(
      chalk.green(
        `Config file created at: ${configFileName} in ${projectRootPath}`
      )
    );
  }
};

const installPackages = (manager) => {
  console.info(
    chalk.green(`Installing packages with ${manager}: ${packages.join(', ')}`)
  );
  execSync(`${manager} add --dev ${packages.join(' ')}`, { stdio: 'inherit' });
  console.log(chalk.green('Packages installed successfully.'));
};

const handlePostInstallTasks = (framework) => {
  promptUser(
    'A config file is required for qa-shadow-report would you like us to create one now? [y/n]: ',
    ['y', 'n'],
    (create) => {
      if (create === 'y') {
        createConfigFile();
      } else {
        console.info(
          chalk.yellow(
            `Skipping configuration file creation. Check the setup guide information on dependencies ${setupLink}}`
          )
        );
      }
      if (framework === 'pw') {
        console.info(
          chalk.yellow(
            "Please ensure 'playwright.config.js' is updated to use the JSON reporter, reporter: [['json', { outputFile: 'test-results/output.json' }]];"
          )
        );
      }
      rl.close();
    }
  );

  if (framework === 'cy') {
    promptUser(
      `Would you like to install 'mochawesome' for Cypress test reporting with Yarn or NPM? [yarn/npm]: `,
      ['yarn', 'npm'],
      (installer) => {
        if (['yarn', 'npm'].includes(installer)) {
          installPackages(installer);
        } else {
          console.info(
            chalk.yellow(
              `Skipping dependency installation. Check the setup guide information on dependencies ${setupLink}}`
            )
          );
          rl.close();
        }
      }
    );
  }
};

const startSetup = () => {
  promptUser(
    'Are you using Playwright (pw) or Cypress (cy)? [pw/cy]: ',
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
  startSetup();
} catch (error) {
  console.error(
    chalk.red('An error occurred during the post-installation script:'),
    error
  );
  process.exit(1);
}
