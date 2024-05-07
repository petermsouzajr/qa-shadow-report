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

const promptUser = (message, callback) => {
  rl.question(chalk.blue(message), (answer) => {
    callback(answer.trim().toLowerCase());
  });
};

const checkForPackage = (packageName) => {
  const packageJsonPath = path.join(projectRootPath, 'package.json');
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return (
      packageName in packageJson.dependencies ||
      packageName in packageJson.devDependencies
    );
  } catch (error) {
    console.error(chalk.red(`Error reading package.json: ${error}`));
    return false;
  }
};

const isPlaywrightInstalled = checkForPackage('playwright');

const getPackageManager = () => {
  const hasYarnLock = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
  const hasPackageLock = fs.existsSync(
    path.join(process.cwd(), 'package-lock.json')
  );

  if (hasYarnLock) {
    return 'yarn';
  } else if (hasPackageLock) {
    return 'npm';
  } else {
    console.error(
      chalk.red(
        'No package manager lock file found. Please ensure you are in a Node.js project.'
      )
    );
    process.exit(1);
  }
};

const installPackages = (manager) => {
  const command = manager === 'yarn' ? 'yarn add' : 'npm install';
  console.info(
    chalk.green(`Installing packages with ${manager}: ${packages.join(', ')}`)
  );
  execSync(`${command} --save-dev ${packages.join(' ')}`, { stdio: 'inherit' });
  inquireConfigFileCreation();
};

const handleExit = () => {
  console.info(
    chalk.yellow(
      'Installation aborted. Check the setup guide information on dependencies https://www.npmjs.com/package/qa-shadow-report#sheets-setup-guide.'
    )
  );
  rl.close();
};

const handleInvalidInput = (options) => {
  console.error(
    chalk.red(`Invalid input. Please enter ${options}, or "EXIT".`)
  );
};

const createConfigFile = () => {
  if (fs.existsSync(configFilePath)) {
    console.info(
      chalk.yellow(`Config file '${configFileName}' already exists.`)
    );
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
        `Created config file: ${configFileName} in ${projectRootPath}`
      )
    );
  }
};

const handlePlaywrightConfirmation = () => {
  promptUser(
    'It looks like you are using Playwright, is that correct? (Yes/No): ',
    (answer) => {
      if (answer === 'no') {
        handleCypressConfirmation();
      } else if (answer === 'yes') {
        console.info(
          chalk.yellow(
            "Please ensure 'playwright.config.js' is updated to use the JSON reporter, reporter: [['json', { outputFile: 'test-results/output.json' }]];"
          )
        );
        inquireConfigFileCreation();
      } else if (answer === 'exit') {
        handleExit();
      } else {
        handleInvalidInput('Yes/No');
        handlePlaywrightConfirmation();
      }
    }
  );
};

const handleCypressConfirmation = () => {
  promptUser(
    `It looks like you are using Cypress, is that correct? (Yes/No): `,
    (pkgAnswer) => {
      if (pkgAnswer === 'yes') {
        confirmPackageManager();
      } else if (pkgAnswer === 'no') {
        handlePlaywrightConfirmation();
      } else if (pkgAnswer === 'exit') {
        handleExit();
      } else {
        handleInvalidInput('Yes/No');
        handleCypressConfirmation();
      }
    }
  );
};

const askForPackageManager = () => {
  promptUser(
    'Please type "YARN", "NPM" to install packages, or "EXIT" to exit package creation step.',
    (packageManager) => {
      if (packageManager === 'yarn' || packageManager === 'npm') {
        installPackages(packageManager);
      } else if (packageManager === 'exit') {
        handleExit();
      } else {
        handleInvalidInput('Yarn/Npm');
        askForPackageManager();
      }
    }
  );
};

const switchManager = (currentManager) => {
  const newManager = currentManager === 'yarn' ? 'npm' : 'yarn';
  promptUser(
    `Would you like to install the required packages ${packages.join(
      ', '
    )} for qa-shadow-report and Cypress with ${newManager}? (Yes/No): `,
    (installAnswer) => {
      if (installAnswer === 'yes') {
        installPackages(newManager);
      } else if (installAnswer === 'no') {
        askForPackageManager();
      } else if (installAnswer === 'exit') {
        handleExit();
      } else {
        handleInvalidInput('Yes/No');
        switchManager(currentManager);
      }
    }
  );
};

const confirmPackageManager = () => {
  const manager = getPackageManager();
  promptUser(
    `Would you like to install the required packages ${packages.join(
      ', '
    )} for qa-shadow-report and Cypress with ${manager}? (Yes/No): `,
    (installAnswer) => {
      if (installAnswer === 'yes') {
        installPackages(manager);
      } else if (installAnswer === 'no') {
        switchManager(manager);
      } else if (installAnswer === 'exit') {
        handleExit();
      } else {
        handleInvalidInput('Yes/No');
        confirmPackageManager();
      }
    }
  );
};

const inquireConfigFileCreation = () => {
  promptUser(
    'A configuration file is required for qa-shadow-report. Would you like us to create that now? (Yes/No): ',
    (cfgAnswer) => {
      if (cfgAnswer === 'yes') {
        createConfigFile();
      } else if (cfgAnswer === 'no' || cfgAnswer === 'exit') {
        handleExit();
      } else {
        handleInvalidInput('Yes/No');
        inquireConfigFileCreation();
      }
    }
  );
};

// Entry point to check if Playwright or Cypress is installed
const checkInstallation = () => {
  if (isPlaywrightInstalled) {
    handlePlaywrightConfirmation();
  } else {
    handleCypressConfirmation();
  }
};

// Error handling for the installation checking process
try {
  checkInstallation();
} catch (error) {
  console.error(
    chalk.red('An error occurred during the post-installation script:'),
    error
  );
  process.exit(1); // Exit with an error code to indicate failure
}
