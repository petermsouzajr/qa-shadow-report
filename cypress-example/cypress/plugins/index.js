const myNpmPackage = require('your-npm-package-name');

module.exports = (on, config) => {
  // Pass the custom configuration to your npm package
  myNpmPackage.setConfig(config.env.myPackageConfig);

  // ... other plugin code ...
};
