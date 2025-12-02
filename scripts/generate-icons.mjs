/**
 * Generate favicon and Apple Touch Icon from source image
 * Run with: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_IMAGE = join(__dirname, '../src/assets/mohsin.png');
const OUTPUT_DIR = join(__dirname, '../public');

// Icon configurations
const ICONS = [
  { name: 'apple-touch-icon.png', size: 180 },        // iOS Safari favorites/home screen
  { name: 'apple-touch-icon-152x152.png', size: 152 }, // iPad
  { name: 'apple-touch-icon-120x120.png', size: 120 }, // iPhone
  { name: 'favicon-32x32.png', size: 32 },             // Browser tab
  { name: 'favicon-16x16.png', size: 16 },             // Browser tab (small)
  { name: 'icon-192x192.png', size: 192 },             // Android/PWA
  { name: 'icon-512x512.png', size: 512 },             // PWA splash
];

async function generateIcons() {
  console.log('🎨 Generating icons from:', SOURCE_IMAGE);
  
  if (!existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found:', SOURCE_IMAGE);
    process.exit(1);
  }

  // Load the source image
  const image = sharp(SOURCE_IMAGE);
  const metadata = await image.metadata();
  
  console.log(`📐 Source image: ${metadata.width}x${metadata.height}`);
  
  // Generate each icon
  for (const icon of ICONS) {
    const outputPath = join(OUTPUT_DIR, icon.name);
    
    await sharp(SOURCE_IMAGE)
      .resize(icon.size, icon.size, {
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 90 })
      .toFile(outputPath);
    
    console.log(`✅ Generated: ${icon.name} (${icon.size}x${icon.size})`);
  }
  
  console.log('\n🎉 All icons generated successfully!');
  console.log('\nNext steps:');
  console.log('1. The icons are in the public/ folder');
  console.log('2. index.html has been updated with the proper link tags');
  console.log('3. Deploy your site and clear Safari cache to see the new icon');
}

generateIcons().catch(console.error);
