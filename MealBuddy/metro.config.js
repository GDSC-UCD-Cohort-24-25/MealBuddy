const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// ✅ This adds support for `.cjs` modules (sometimes needed for older Node packages)
defaultConfig.resolver.sourceExts.push('cjs');

// ✅ This disables unstable package export resolution (fixes compatibility issues)
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
