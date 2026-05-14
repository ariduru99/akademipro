/**
 * Bozuk .next / webpack önbelleği 500 hatalarına yol açar.
 * Çalıştır: npm run clean
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const targets = [
  path.join(root, ".next"),
  path.join(root, ".turbo"),
  path.join(root, "node_modules", ".cache"),
];

for (const dir of targets) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("[clean-next] silindi:", path.relative(root, dir) || ".");
  } catch (e) {
    console.warn("[clean-next] atlandı:", dir, e.message);
  }
}
