# Changelog

## 2.1.8

### Fixed
- Windows-safe ESM path resolution via `fileURLToPath` (fixes "Could not determine the project root path" when `import.meta.url.pathname` is used on Win32).
- Shared `findProjectRoot` / `getModulePaths` helpers used by `constants.js` and `qasr-setup`.
- Removed checked-in `.DS_Store` file from `src/google/` (already in `.gitignore`).
- README typos: "defualt" → "default", "Tpye" → "Type", "shdowReportConfig" → "shadowReportConfig", "duplicte" → "duplicate", "dupliactes" → "duplicates".

### Changed
- **Tooling Modernization:**
  - Migrated from ESLint 8 with `.eslintrc.cjs` to ESLint 9 flat config (`eslint.config.js`).
  - Simplified Jest configuration: removed Babel setup and `--experimental-vm-modules` flag (native ESM on Node 18+).
  - Moved `prettier` from `dependencies` to `devDependencies` (no longer installed by consumers).
  - Removed `.babelrc` and Babel-related dev dependencies (`@babel/core`, `@babel/preset-env`, `babel-jest`).
  - Removed obsolete ESLint plugins (`eslint-plugin-import`, `eslint-plugin-n`, `eslint-plugin-promise`).
- **Developer Experience:**
  - Added comprehensive JSDoc type definitions in `types.js` for `shadowReportConfig`.
  - Added startup config validation with clear, actionable error messages (`src/utils/configValidator.js`).
  - Significantly improved CLI `--help` output with better formatting, examples, and framework/flag descriptions.
- Single constants source of truth: root `constants.js`; `src/constants.js` re-exports for backward-compatible import paths.
- Config getters honor `globalThis.shadowConfigDetails` when set (tests) while still loading file config for CLI.
- `package.json`: `engines.node >= 18`, explicit `files` whitelist for npm pack, `prepublishOnly` runs test + lint.
- GitHub Actions CI: lint + test on Node 18 and 20 for PRs and `main`.
