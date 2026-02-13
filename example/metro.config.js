const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the package source
config.watchFolders = [workspaceRoot];

// Peer dependencies that must come from the example's node_modules
const peerDeps = ['react', 'react-native', '@shopify/flash-list', 'libphonenumber-js'];

// Custom resolver to redirect peer dependencies
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Check if this is a peer dependency being resolved from the parent package
  if (peerDeps.some(dep => moduleName === dep || moduleName.startsWith(dep + '/'))) {
    // Force resolution from example's node_modules
    const exampleModulePath = path.resolve(projectRoot, 'node_modules', moduleName);
    return context.resolveRequest(
      { ...context, originModulePath: path.join(projectRoot, 'index.js') },
      moduleName,
      platform
    );
  }

  // Default resolution
  return context.resolveRequest(context, moduleName, platform);
};

// Let Metro know where to find the package source
config.resolver.extraNodeModules = {
  'expo-intl-phone-number': workspaceRoot,
};

// Only use example's node_modules for resolution
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

module.exports = config;
