// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

/**
 * Clean, supported Metro config.
 * - No TerminalReporter / private metro imports
 * - Adds alias "@" -> project root so "@/..." imports work in Metro
 */
const config = getDefaultConfig(projectRoot);

// Use resolver.alias (supported in Metro 0.80+) to map "@"
config.resolver.alias = {
  '@': path.resolve(projectRoot),
};

module.exports = config;
