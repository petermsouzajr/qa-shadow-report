import { jest } from '@jest/globals';

describe('projectPaths [sanity]', () => {
  beforeEach(() => {
    jest.unmock('fs');
    jest.unmock('path');
    jest.resetModules();
  });

  it('resolves dirname from import.meta.url without a leading slash drive quirk', async () => {
    const path = await import('path');
    const { getModulePaths } = await import('./projectPaths.js');
    const { filename, dirname } = getModulePaths(import.meta.url);
    expect(path.isAbsolute(filename)).toBe(true);
    expect(path.isAbsolute(dirname)).toBe(true);
    // On Windows, fileURLToPath must not leave a leading "/" before the drive letter
    if (process.platform === 'win32') {
      expect(filename).toMatch(/^[A-Za-z]:\\/);
    }
  });

  it('finds a project root containing package.json outside node_modules', async () => {
    const fs = await import('fs');
    const os = await import('os');
    const path = await import('path');
    const { findProjectRoot } = await import('./projectPaths.js');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qasr-root-'));
    const nested = path.join(dir, 'src', 'utils');
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), '{}');
    const insideModules = path.join(dir, 'node_modules', 'pkg');
    fs.mkdirSync(insideModules, { recursive: true });
    fs.writeFileSync(path.join(insideModules, 'package.json'), '{}');
    try {
      expect(findProjectRoot(nested)).toBe(dir);
      expect(findProjectRoot(insideModules)).toBe(dir);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
