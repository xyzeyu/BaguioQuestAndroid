// web-router-ctx.js
// ABSOLUTE POSIX PATH to your /app folder (use forward slashes)
const APP_DIR = 'C:/Users/roche/BaguioQuest/app';

export const ctx = require.context(
  APP_DIR,
  true,
  // pick up .js/.jsx/.ts/.tsx files; adjust if you need platform-specific endings
  /\.[tj]sx?$/
);
