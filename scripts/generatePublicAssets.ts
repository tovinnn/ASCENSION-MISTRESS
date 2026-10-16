import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ASCENSION_SCENES } from '../src/data/ascensionVisuals.ts';
import { getSceneSvgArtwork } from '../src/utils/imageStore.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const publicDir = path.join(projectRoot, 'public');
const imagesDir = path.join(publicDir, 'images');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

console.log('Writing public image assets for all 10 ASCENSION scenes...');

ASCENSION_SCENES.forEach((scene) => {
  const svg = getSceneSvgArtwork(scene);
  const baseName = scene.originalFilename.replace(/\.(webp|jpeg|jpg)$/, '');

  // 1. Write SVG file
  fs.writeFileSync(path.join(imagesDir, `${baseName}.svg`), svg, 'utf-8');
  fs.writeFileSync(path.join(publicDir, `${baseName}.svg`), svg, 'utf-8');

  // 2. Also write matching filename as SVG-based image response
  fs.writeFileSync(path.join(imagesDir, scene.originalFilename), svg, 'utf-8');
  fs.writeFileSync(path.join(publicDir, scene.originalFilename), svg, 'utf-8');

  console.log(`✓ Wrote ${scene.originalFilename} and ${baseName}.svg`);
});

console.log('All 10 ASCENSION visual assets successfully written to /public and /public/images!');
