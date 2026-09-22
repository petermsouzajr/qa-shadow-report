#!/usr/bin/env node

// Help must run before config and Google clients load.
if (process.argv.includes('--help')) {
  const { printHelp } = await import('./src/printHelp.js');
  printHelp();
  process.exit(0);
}

await import('./src/cliMain.js');
