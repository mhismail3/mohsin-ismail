import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const inputPath = join(projectRoot, 'src/assets/mohsin.png');
const outputDir = join(projectRoot, 'public');

// Favicon sizes to generate
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateFavicon() {
  console.log('Generating circular favicons with black outline...');

  // Load the source image and get metadata
  const sourceImage = sharp(inputPath);
  const metadata = await sourceImage.metadata();
  
  // We'll work at a high resolution for quality, then resize
  const workSize = 512;
  const borderWidth = Math.round(workSize * 0.06); // 6% border thickness
  const innerRadius = (workSize / 2) - borderWidth;
  
  // Create circular mask SVG
  const circleMask = Buffer.from(`
    <svg width="${workSize}" height="${workSize}">
      <circle cx="${workSize / 2}" cy="${workSize / 2}" r="${innerRadius}" fill="white"/>
    </svg>
  `);
  
  // Create the black ring (border) SVG
  const borderRing = Buffer.from(`
    <svg width="${workSize}" height="${workSize}">
      <circle 
        cx="${workSize / 2}" 
        cy="${workSize / 2}" 
        r="${(workSize / 2) - (borderWidth / 2)}" 
        fill="none" 
        stroke="#000000" 
        stroke-width="${borderWidth}"
      />
    </svg>
  `);

  // Process: resize source to square, apply circular mask, add border
  // First, resize and crop to square, focusing on the face (center-top area)
  const croppedImage = await sharp(inputPath)
    .resize(workSize, workSize, {
      fit: 'cover',
      position: 'top' // Focus on the top where the face is
    })
    .composite([
      {
        input: circleMask,
        blend: 'dest-in'
      }
    ])
    .png()
    .toBuffer();

  // Now composite the border on top
  const finalImage = await sharp(croppedImage)
    .composite([
      {
        input: borderRing,
        blend: 'over'
      }
    ])
    .png()
    .toBuffer();

  // Generate each size
  for (const { name, size } of sizes) {
    const outputPath = join(outputDir, name);
    await sharp(finalImage)
      .resize(size, size, { fit: 'contain' })
      .png()
      .toFile(outputPath);
    console.log(`  ✓ Generated ${name} (${size}x${size})`);
  }

  // Also create a favicon.ico (using 32x32 PNG as base)
  // Note: Sharp doesn't support ICO, so we'll use the 32x32 PNG as the main favicon
  // Most modern browsers support PNG favicons
  const favicon32Path = join(outputDir, 'favicon.png');
  await sharp(finalImage)
    .resize(32, 32, { fit: 'contain' })
    .png()
    .toFile(favicon32Path);
  console.log('  ✓ Generated favicon.png (32x32)');

  // Create SVG favicon for sharp rendering at any size
  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${workSize} ${workSize}">
  <defs>
    <clipPath id="circleClip">
      <circle cx="${workSize / 2}" cy="${workSize / 2}" r="${innerRadius}"/>
    </clipPath>
  </defs>
  <image 
    href="data:image/png;base64,${(await sharp(inputPath).resize(workSize, workSize, { fit: 'cover', position: 'top' }).png().toBuffer()).toString('base64')}"
    width="${workSize}" 
    height="${workSize}" 
    clip-path="url(#circleClip)"
    preserveAspectRatio="xMidYMid slice"
  />
  <circle 
    cx="${workSize / 2}" 
    cy="${workSize / 2}" 
    r="${(workSize / 2) - (borderWidth / 2)}" 
    fill="none" 
    stroke="#000000" 
    stroke-width="${borderWidth}"
  />
</svg>`;

  const svgPath = join(outputDir, 'favicon.svg');
  await sharp(Buffer.from(svgFavicon))
    .resize(512, 512)
    .png()
    .toBuffer()
    .catch(() => null); // SVG creation might fail, that's ok
  
  // Write the SVG directly
  const { writeFile } = await import('fs/promises');
  await writeFile(svgPath, svgFavicon);
  console.log('  ✓ Generated favicon.svg (scalable)');

  console.log('\n✅ All favicons generated successfully!');
  console.log('\nMake sure your index.html includes these link tags in <head>:');
  console.log(`
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  `);
}

generateFavicon().catch(console.error);

