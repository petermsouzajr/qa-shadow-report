import path from 'path';
import { getModulePaths, findProjectRoot } from './projectPaths.js';

describe('projectPaths [sanity]', () => {
  it('resolves dirname from import.meta.url without a leading slash drive quirk', () => {
    const { filename, dirname } = getModulePaths(import.meta.url);
    expect(path.isAbsolute(filename)).toBe(true);
    expect(path.isAbsolute(dirname)).toBe(true);
    // On Windows, fileURLToPath must not leave a leading "/" before the drive letter
    if (process.platform === 'win32') {
      expect(filename).toMatch(/^[A-Za-z]:\\/);
    }
  });

  it('finds a project root containing package.json outside node_modules', () => {
    const { dirname } = getModulePaths(import.meta.url);
    const root = findProjectRoot(dirname);
    expect(root).toBeTruthy();
    expect(root).toContain('qa-shadow-report');
  });
});
