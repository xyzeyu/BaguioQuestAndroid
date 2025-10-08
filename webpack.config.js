// webpack.config.js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async (env = {}, argv = {}) => {
  // Ensure Expo sees the right context
  const exEnv = {
    // force web + correct root so Expo sets proper entry (no "./src" fallback)
    platform: 'web',
    projectRoot: __dirname,
    mode: argv.mode || process.env.NODE_ENV || 'production',
    ...env,
  };

  const config = await createExpoWebpackConfigAsync(exEnv, argv);

  // Alias expo-router ctx to a local shim to point at your /app folder
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    // cover both import patterns used by expo-router
    'expo-router/_ctx': path.resolve(__dirname, 'web-router-ctx.js'),
    'expo-router/_ctx.web.js': path.resolve(__dirname, 'web-router-ctx.js'),
  };

  // Be explicit: keep whatever entry Expo set (don’t let webpack default to "./src")
  if (!config.entry || Object.keys(config.entry).length === 0) {
    throw new Error('Expo entry was not set — aborting to avoid ./src fallback.');
  }

  return config;
};
