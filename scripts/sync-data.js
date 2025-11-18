/**
 * Ensure JSON datasets from public/data are also available under src/data
 * so they can be imported during bundling (required for Capacitor builds).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'public', 'data');
const TARGET_DIR = path.join(ROOT, 'src', 'data');
const FILES = ['water-sources.json', 'water-analyses.json'];

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(file) {
  const sourcePath = path.join(SOURCE_DIR, file);
  const targetPath = path.join(TARGET_DIR, file);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source file: ${sourcePath}`);
  }

  fs.copyFileSync(sourcePath, targetPath);
  const sizeKb = (fs.statSync(targetPath).size / 1024).toFixed(1);
  console.log(`   • Copied ${file} (${sizeKb} KB)`);
}

function main() {
  console.log('🔄 Syncing JSON datasets into src/data ...');
  ensureDirExists(TARGET_DIR);
  FILES.forEach(copyFile);
  console.log('✅ JSON datasets are ready for direct imports.');
}

try {
  main();
} catch (error) {
  console.error('❌ Failed to sync JSON datasets:', error);
  process.exit(1);
}
