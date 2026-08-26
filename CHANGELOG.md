# Changelog

## 2.1.8

### Fixed
- Windows-safe ESM path resolution via `fileURLToPath` (fixes “Could not determine the project root path” when `import.meta.url.pathname` is used on Win32).
- Shared `findProjectRoot` / `getModulePaths` helpers used by `constants.js` and `qasr-setup`.

### Changed
- Single constants source of truth: root `constants.js`; `src/constants.js` re-exports for backward-compatible import paths.
- Config getters honor `globalThis.shadowConfigDetails` when set (tests) while still loading file config for CLI.
- `package.json`: `engines.node >= 18`, explicit `files` whitelist for npm pack, `prepublishOnly` runs test + lint.
- GitHub Actions CI: lint + test on Node 18 and 20 for PRs and `main`.
