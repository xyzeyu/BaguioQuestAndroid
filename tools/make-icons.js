// tools/make-icons.js
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

(async () => {
  const src = path.resolve(__dirname, "../assets/images/icon.png");
  const outDir = path.resolve(__dirname, "../public/icons");
  fs.mkdirSync(outDir, { recursive: true });

  // 192x192
  await sharp(src).resize(192, 192).toFile(path.join(outDir, "icon-192.png"));
  // 512x512
  await sharp(src).resize(512, 512).toFile(path.join(outDir, "icon-512.png"));
  // maskable 512x512
  await sharp(src).resize(512, 512).toFile(path.join(outDir, "maskable-512.png"));

  console.log("✅ Generated icons in /public/icons");
})();
