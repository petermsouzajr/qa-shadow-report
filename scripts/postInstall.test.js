import { jest } from '@jest/globals';

// Mock modules before imports
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  dirname: jest.fn((p) => p.split('/').slice(0, -1).join('/')),
  parse: jest.fn(() => ({ root: '/' })),
  sep: '/',
}));

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('chalk', () => ({
  blue: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  green: jest.fn((text) => text),
  red: jest.fn((text) => text),
}));

jest.mock('./configuredStatus.js', () => ({
  isProjectConfigured: jest.fn().mockReturnValue(false),
}));

// Mock readline with proper event handling
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn((_, callback) => callback('y')),
    close: jest.fn(),
    on: jest.fn(),
  })),
}));

// Imports after mocks
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import {
  findProjectRoot,
  createConfigFile,
  installPackages,
  handlePostInstallTasks,
  proceedWithFrameworkSpecificInstructions,
  startSetup,
} from './postInstall.js';

describe('Post Install Script', () => {
  const mockProjectRoot = '/mock/project/root';
  const mockPackageJsonPath = '/mock/project/root/package.json';
  const mockNodeModulesPath = '/mock/project/root/node_modules';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findProjectRoot', () => {
    it.skip('should find project root with package.json', () => {
      fs.existsSync.mockImplementation((path) => path === mockPackageJsonPath);
      const result = findProjectRoot(mockProjectRoot);
      expect(result).toBe(mockProjectRoot);
    });

    it.skip('should return null when package.json is not found', () => {
      fs.existsSync.mockImplementation(() => false);
      const result = findProjectRoot(mockProjectRoot);
      expect(result).toBeNull();
    });

    it.skip('should skip node_modules directories', () => {
      fs.existsSync.mockImplementation((path) => {
        return path === mockPackageJsonPath || path.includes('node_modules');
      });
      const nodeModulesPath = `${mockProjectRoot}/node_modules/some-package`;
      const result = findProjectRoot(nodeModulesPath);
      expect(result).toBe(mockProjectRoot);
    });
  });

  describe('createConfigFile', () => {
    it.skip('should create config file if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      createConfigFile();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it.skip('should not create config file if it exists', () => {
      fs.existsSync.mockReturnValue(true);
      createConfigFile();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('installPackages', () => {
    it.skip('should handle npm installation', () => {
      installPackages('npm');
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('npm install')
      );
    });

    it.skip('should handle yarn installation', () => {
      installPackages('yarn');
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('yarn add')
      );
    });

    it.skip('should handle installation errors gracefully', () => {
      execSync.mockImplementation(() => {
        throw new Error('Installation failed');
      });

      expect(() => installPackages('npm')).not.toThrow();
    });
  });

  describe('handlePostInstallTasks', () => {
    it.skip('should handle cypress framework setup', () => {
      const mockRL = readline.createInterface();
      handlePostInstallTasks('cy');
      expect(mockRL.question).toHaveBeenCalled();
    });

    it.skip('should handle playwright framework setup', () => {
      const mockRL = readline.createInterface();
      handlePostInstallTasks('pw');
      expect(mockRL.question).toHaveBeenCalled();
    });

    it.skip('should handle user declining config creation', () => {
      const mockRL = readline.createInterface();
      mockRL.question.mockImplementationOnce((_, callback) => callback('n'));
      handlePostInstallTasks('cy');
      expect(mockRL.question).toHaveBeenCalled();
    });
  });

  describe('proceedWithFrameworkSpecificInstructions', () => {
    it.skip('should handle cypress framework instructions', () => {
      const mockRL = readline.createInterface();
      proceedWithFrameworkSpecificInstructions('cy');
      expect(mockRL.question).toHaveBeenCalled();
    });

    it.skip('should handle playwright framework instructions', () => {
      const mockRL = readline.createInterface();
      proceedWithFrameworkSpecificInstructions('pw');
      expect(mockRL.question).toHaveBeenCalled();
    });

    it.skip('should handle unknown framework gracefully', () => {
      const mockRL = readline.createInterface();
      proceedWithFrameworkSpecificInstructions('unknown');
      expect(mockRL.question).toHaveBeenCalled();
    });
  });

  describe('startSetup', () => {
    it.skip('should start setup process', () => {
      const mockRL = readline.createInterface();
      startSetup();
      expect(mockRL.question).toHaveBeenCalled();
    });

    it.skip('should handle setup cancellation', () => {
      const mockRL = readline.createInterface();
      mockRL.question.mockImplementationOnce((_, callback) => callback('n'));
      startSetup();
      expect(mockRL.question).toHaveBeenCalled();
    });
  });
});
