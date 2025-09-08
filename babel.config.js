// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel', // required for expo-router v5
      // 'nativewind/babel', // ← keep disabled for now; we'll re-enable later
    ],
  };
};