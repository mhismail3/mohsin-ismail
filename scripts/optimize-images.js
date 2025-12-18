/**
 * Image Optimization Script
 *
 * Pre-renders optimized image variants at build time for maximum performance.
 * Implements Rauch's "Predict behavior" principle by preparing assets ahead of time.
 *
 * This script:
 * 1. Finds all images in public/posts, public/projects, public/about
 * 2. Generates WebP versions (70-80% smaller than PNG/JPEG)
 * 3. Creates responsive sizes (thumbnail, medium, large)
 * 4. Generates blur placeholders (LQIP) as base64 data URIs
 * 5. Outputs a manifest for the frontend to consume
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const OPTIMIZED_DIR = path.join(PUBLIC_DIR, 'optimized');
const MANIFEST_PATH = path.join(ROOT_DIR, 'src', 'data', 'image-manifest.json');

// Image size configurations
const SIZES = {
  thumbnail: { width: 400, suffix: '-400w' },
  medium: { width: 800, suffix: '-800w' },
  large: { width: 1200, suffix: '-1200w' },
  xlarge: { width: 1600, suffix: '-1600w' },
};

// Blur placeholder dimensions (tiny for base64 efficiency)
const BLUR_SIZE = 20;

// Quality settings
const WEBP_QUALITY = 82;
const JPEG_QUALITY = 85;

// Directories to scan for images
const IMAGE_DIRS = ['posts', 'projects', 'about'];

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Skip GIFs (they're animated) and already-optimized directories
const SKIP_PATTERNS = ['.gif', '/optimized/'];

/**
 * Get all image files from specified directories
 */
function getAllImages() {
  const images = [];

  for (const dir of IMAGE_DIRS) {
    const fullPath = path.join(PUBLIC_DIR, dir);
    if (!fs.existsSync(fullPath)) continue;

    const walkDir = (currentPath, relativePath = '') => {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(currentPath, item.name);
        const itemRelative = path.join(relativePath, item.name);

        if (item.isDirectory()) {
          // Skip the optimized directory
          if (item.name === 'optimized') continue;
          walkDir(itemPath, itemRelative);
        } else if (item.isFile()) {
          const ext = path.extname(item.name).toLowerCase();

          // Check if it's a supported image
          if (IMAGE_EXTENSIONS.includes(ext)) {
            // Skip if it matches any skip pattern
            const shouldSkip = SKIP_PATTERNS.some(pattern =>
              itemPath.includes(pattern) || item.name.includes(pattern)
            );

            if (!shouldSkip) {
              images.push({
                absolutePath: itemPath,
                relativePath: path.join(dir, itemRelative),
                directory: dir,
                filename: item.name,
                extension: ext,
              });
            }
          }
        }
      }
    };

    walkDir(fullPath);
  }

  return images;
}

/**
 * Generate blur placeholder as base64 data URI
 */
async function generateBlurPlaceholder(imagePath) {
  try {
    const buffer = await sharp(imagePath)
      .resize(BLUR_SIZE, BLUR_SIZE, { fit: 'inside' })
      .blur(2)
      .webp({ quality: 20 })
      .toBuffer();

    return `data:image/webp;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error(`  Warning: Could not generate blur for ${imagePath}:`, error.message);
    return null;
  }
}

/**
 * Get image dimensions
 */
async function getImageDimensions(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    return { width: metadata.width, height: metadata.height };
  } catch {
    return { width: 0, height: 0 };
  }
}

/**
 * Generate optimized versions of an image
 */
async function optimizeImage(image, manifest) {
  const { absolutePath, relativePath, filename, extension } = image;
  const baseName = filename.replace(extension, '');

  // Get original dimensions
  const dimensions = await getImageDimensions(absolutePath);

  // Create output directory structure
  const relativeDir = path.dirname(relativePath);
  const outputDir = path.join(OPTIMIZED_DIR, relativeDir);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Initialize manifest entry
  const manifestKey = `/${relativePath}`;
  manifest[manifestKey] = {
    original: `/${relativePath}`,
    width: dimensions.width,
    height: dimensions.height,
    srcset: {},
    webp: {},
    blur: null,
  };

  // Generate blur placeholder
  const blur = await generateBlurPlaceholder(absolutePath);
  manifest[manifestKey].blur = blur;

  // Generate optimized sizes
  for (const [sizeName, config] of Object.entries(SIZES)) {
    // Skip if original is smaller than target size
    if (dimensions.width && dimensions.width < config.width) {
      continue;
    }

    try {
      // Generate WebP version
      const webpFilename = `${baseName}${config.suffix}.webp`;
      const webpPath = path.join(outputDir, webpFilename);
      const webpRelative = `/optimized/${relativeDir}/${webpFilename}`;

      await sharp(absolutePath)
        .resize(config.width, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: WEBP_QUALITY })
        .toFile(webpPath);

      manifest[manifestKey].webp[config.width] = webpRelative;

      // Generate fallback JPEG/PNG version
      const fallbackExt = extension === '.png' ? '.png' : '.jpg';
      const fallbackFilename = `${baseName}${config.suffix}${fallbackExt}`;
      const fallbackPath = path.join(outputDir, fallbackFilename);
      const fallbackRelative = `/optimized/${relativeDir}/${fallbackFilename}`;

      if (fallbackExt === '.png') {
        await sharp(absolutePath)
          .resize(config.width, null, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .png({ quality: JPEG_QUALITY })
          .toFile(fallbackPath);
      } else {
        await sharp(absolutePath)
          .resize(config.width, null, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: JPEG_QUALITY })
          .toFile(fallbackPath);
      }

      manifest[manifestKey].srcset[config.width] = fallbackRelative;

    } catch (error) {
      console.error(`  Warning: Could not generate ${sizeName} for ${filename}:`, error.message);
    }
  }

  return manifest[manifestKey];
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Calculate total size of a directory recursively
 */
function getDirSize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;

  let total = 0;
  const walk = (dir) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        walk(fullPath);
      } else {
        total += fs.statSync(fullPath).size;
      }
    }
  };
  walk(dirPath);
  return total;
}

/**
 * Main optimization function
 */
async function optimize() {
  console.log('\n🖼️  Starting image optimization...\n');

  // Clean up existing optimized directory
  if (fs.existsSync(OPTIMIZED_DIR)) {
    console.log('  Cleaning existing optimized directory...');
    fs.rmSync(OPTIMIZED_DIR, { recursive: true });
  }
  fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });

  // Get all images
  const images = getAllImages();
  console.log(`  Found ${images.length} images to optimize\n`);

  if (images.length === 0) {
    console.log('  No images found. Skipping optimization.\n');
    return;
  }

  // Calculate original size
  let originalSize = 0;
  for (const img of images) {
    originalSize += fs.statSync(img.absolutePath).size;
  }

  // Initialize manifest
  const manifest = {};

  // Process each image
  let processed = 0;
  for (const image of images) {
    process.stdout.write(`  Processing [${processed + 1}/${images.length}] ${image.filename}...`);

    try {
      await optimizeImage(image, manifest);
      process.stdout.write(' ✓\n');
    } catch (error) {
      process.stdout.write(` ✗ (${error.message})\n`);
    }

    processed++;
  }

  // Write manifest
  console.log('\n  Writing image manifest...');
  const manifestDir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  // Calculate optimized size
  const optimizedSize = getDirSize(OPTIMIZED_DIR);
  const savings = originalSize - optimizedSize;
  const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

  console.log('\n✅ Image optimization complete!\n');
  console.log('  Statistics:');
  console.log(`    Original size:  ${formatBytes(originalSize)}`);
  console.log(`    Optimized size: ${formatBytes(optimizedSize)}`);
  console.log(`    Savings:        ${formatBytes(savings)} (${savingsPercent}%)`);
  console.log(`    Images processed: ${processed}`);
  console.log(`    Manifest: ${MANIFEST_PATH}\n`);
}

// Run optimization
optimize().catch((err) => {
  console.error('Image optimization failed:', err);
  process.exit(1);
});
