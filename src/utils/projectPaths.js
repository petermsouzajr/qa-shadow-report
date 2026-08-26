import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Resolve ESM module directory in a cross-platform way (Windows-safe).
 * Prefer this over `new URL(import.meta.url).pathname`, which breaks on Win32.
 *
 * @param {string | URL} importMetaUrl - Typically `import.meta.url`
 * @returns {{ filename: string, dirname: string }}
 */
export function getModulePaths(importMetaUrl) {
  const filename = fileURLToPath(importMetaUrl);
  return { filename, dirname: path.dirname(filename) };
}

/**
 * Walk upward from startPath until a package.json outside node_modules is found.
 * When this package is installed under node_modules, that yields the consumer project root.
 *
 * @param {string} startPath
 * @returns {string|null}
 */
export function findProjectRoot(startPath) {
  let currentDir = startPath;

  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      // Skip package.json files that live inside node_modules
      if (!currentDir.includes(`${path.sep}node_modules`)) {
        return currentDir;
      }
    }

    currentDir = path.dirname(currentDir);
  }

  return null;
}
