import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = join(rootDir, 'node_modules', 'cesium', 'Build', 'Cesium');
const targetDir = join(rootDir, 'public', 'cesium');

if (!existsSync(sourceDir)) {
  throw new Error('Cesium build assets were not found. Run npm install first.');
}

mkdirSync(dirname(targetDir), { recursive: true });
rmSync(targetDir, { recursive: true, force: true });
cpSync(sourceDir, targetDir, { recursive: true });
