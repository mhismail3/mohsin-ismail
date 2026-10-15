/**
 * Prerender script for generating static HTML pages with dynamic Open Graph meta tags.
 * 
 * This script runs AFTER vite build and:
 * 1. Reads all posts and projects from the public folder
 * 2. Parses their frontmatter to extract title, date, tags, etc.
 * 3. Generates individual HTML files in dist/ for each route with proper OG tags
 * 4. These HTML files include the correct meta tags that social media crawlers can read
 * 
 * The app uses BrowserRouter, so each route gets a real dist/{route}/index.html.
 * Twitter/X and other crawlers will see the proper meta tags before any JS executes.
 * Also writes sitemap.xml and robots.txt. Content loading is shared with
 * scripts/validate-content.mjs via scripts/content.mjs (excluded posts are skipped).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { publishedPosts, loadProjects, postTitle } from './content.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const MANIFEST_PATH = path.join(ROOT_DIR, 'src', 'data', 'image-manifest.json');

// Load image manifest for optimized image URLs
let imageManifest = {};
try {
  if (fs.existsSync(MANIFEST_PATH)) {
    imageManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  }
} catch {
  console.log('  Note: Image manifest not found, using original images for OG tags');
}

// Site configuration
const SITE_URL = 'https://mhismail.com';
const SITE_NAME = 'Mohsin Ismail';
const DEFAULT_DESCRIPTION = 'Software engineer, designer, and builder. Exploring ideas through code and creativity.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const TWITTER_HANDLE = '@mohsin__ismail';

/**
 * Strip markdown formatting from text to create clean descriptions
 */
function stripMarkdown(text = '') {
  return text
    .replace(/```[\s\S]*?```/g, ' ')           // Remove code blocks
    .replace(/`([^`]*)`/g, '$1')               // Inline code → just the code text
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')      // Remove images entirely
    .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1')   // Links → just the link text
    .replace(/[#>*_~\-]/g, ' ')                // Remove markdown syntax chars
    .replace(/\s+/g, ' ')                      // Collapse whitespace
    .trim();
}

/**
 * Create excerpt from content (first ~160 chars for meta description)
 */
function createExcerpt(content, maxLength = 160) {
  const cleaned = stripMarkdown(content);
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength - 3).trim() + '...';
}

/**
 * Posts with a public URL (skips `exclude: true`; drafts/ is never built).
 * Throws on bad frontmatter so the build fails loudly instead of dropping a page.
 */
function getAllPosts() {
  return publishedPosts().map((post) => ({
    slug: post.slug,
    title: postTitle(post, createExcerpt),
    date: post.data.date,
    tags: post.data.tags || [],
    excerpt: createExcerpt(post.content),
    // Check for gallery images to use as OG image
    image: getPostImage(post.slug),
  }));
}

/**
 * Get all projects from public/projects/[slug]/project.md (slug matches the app: frontmatter slug or folder)
 */
function getAllProjects() {
  return loadProjects().map((project) => ({
    slug: project.slug,
    title: project.data.title || project.folder,
    date: project.data.date,
    summary: project.data.summary || createExcerpt(project.content),
    tags: project.data.tags || [],
    // Use cover image if available
    image: getProjectCover(project.slug, project.data.cover),
  }));
}

/**
 * Get optimized image URL from manifest (prefers largest size for OG images)
 * Falls back to original if no optimized version exists
 */
function getOptimizedImageUrl(originalPath) {
  const manifestKey = originalPath.startsWith('/') ? originalPath : `/${originalPath}`;
  const optimizedData = imageManifest[manifestKey];

  if (optimizedData?.srcset) {
    // Get the largest available size for OG images (social media needs high res)
    const sizes = Object.entries(optimizedData.srcset);
    if (sizes.length > 0) {
      // Sort by width descending and get largest
      const sorted = sizes.sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
      return `${SITE_URL}${sorted[0][1]}`;
    }
  }

  // Fallback to original
  return `${SITE_URL}${originalPath}`;
}

/**
 * Find an image to use for a post's OG image
 * Prioritizes: gallery-1.ext > any image in folder > default
 * Returns optimized version if available
 */
function getPostImage(slug) {
  const postDir = path.join(PUBLIC_DIR, 'posts', slug);
  if (!fs.existsSync(postDir)) return DEFAULT_IMAGE;

  const files = fs.readdirSync(postDir);

  // Look for gallery-1 first
  const gallery1 = files.find(f => f.startsWith('gallery-1'));
  if (gallery1) {
    const originalPath = `/posts/${slug}/${gallery1}`;
    return getOptimizedImageUrl(originalPath);
  }

  // Look for any image file
  const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  const anyImage = files.find(f => {
    const ext = path.extname(f).toLowerCase();
    return imageExts.includes(ext) && f !== 'post.md';
  });
  if (anyImage) {
    const originalPath = `/posts/${slug}/${anyImage}`;
    return getOptimizedImageUrl(originalPath);
  }

  return DEFAULT_IMAGE;
}

/**
 * Get project cover image
 * Returns optimized version if available
 */
function getProjectCover(slug, coverFileName) {
  if (coverFileName) {
    const originalPath = `/projects/${slug}/${coverFileName}`;
    return getOptimizedImageUrl(originalPath);
  }

  const projectDir = path.join(PUBLIC_DIR, 'projects', slug);
  if (!fs.existsSync(projectDir)) return DEFAULT_IMAGE;

  const files = fs.readdirSync(projectDir);
  const cover = files.find(f => f.startsWith('cover.'));
  if (cover) {
    const originalPath = `/projects/${slug}/${cover}`;
    return getOptimizedImageUrl(originalPath);
  }

  return DEFAULT_IMAGE;
}

/**
 * Read the base index.html from dist
 */
function getBaseHtml() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('dist/index.html not found. Run vite build first.');
  }
  return fs.readFileSync(indexPath, 'utf-8');
}

/**
 * Generate HTML with custom meta tags for a specific page
 */
function generatePageHtml(baseHtml, options) {
  const {
    title = SITE_NAME,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url = SITE_URL,
    type = 'article',
    publishedTime = null,
  } = options;

  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  
  // Build meta tags
  const metaTags = `
    <!-- Dynamic OG Tags (generated at build time) -->
    <meta name="title" content="${escapeHtml(fullTitle)}" />
    <meta name="description" content="${escapeHtml(description)}" />
    
    <!-- Open Graph / Facebook / iMessage -->
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    ${publishedTime ? `<meta property="article:published_time" content="${escapeHtml(String(publishedTime))}" />` : ''}
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${escapeHtml(url)}" />
    <meta property="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta property="twitter:description" content="${escapeHtml(description)}" />
    <meta property="twitter:image" content="${escapeHtml(image)}" />
    <meta property="twitter:site" content="${TWITTER_HANDLE}" />
    <meta property="twitter:creator" content="${TWITTER_HANDLE}" />
`;

  // Replace existing meta tags in <head>
  // We'll remove the static OG tags and insert our dynamic ones
  let html = baseHtml;

  // Remove existing meta tags that we'll replace
  html = html.replace(/<!-- Primary Meta Tags -->[\s\S]*?<!-- Twitter -->[\s\S]*?<meta property="twitter:image"[^>]*>/g, '');
  
  // Alternative approach: replace specific tags
  html = html.replace(/<meta name="title" content="[^"]*"\s*\/?>/g, '');
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/g, '');
  html = html.replace(/<meta property="og:[^"]*" content="[^"]*"\s*\/?>/g, '');
  html = html.replace(/<meta property="twitter:[^"]*" content="[^"]*"\s*\/?>/g, '');
  
  // Update the <title> tag
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`);

  // Insert our meta tags right after the <title> tag
  html = html.replace(/<\/title>/, `</title>${metaTags}`);

  // Clean up any empty lines that might have been left
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n');

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Write an HTML file to the dist folder
 */
function writeHtmlFile(relativePath, content) {
  const fullPath = path.join(DIST_DIR, relativePath);
  const dir = path.dirname(fullPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`  ✓ Generated: ${relativePath}`);
}

/**
 * Generate 404.html with SPA redirect script for GitHub Pages.
 * When someone visits /posts/my-post directly, GitHub Pages serves 404.html.
 * This script redirects to the main page with the path preserved in the URL,
 * allowing React Router to handle the routing client-side.
 * 
 * This technique is from: https://github.com/rafgraph/spa-github-pages
 */
function generate404Html() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting... | ${SITE_NAME}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${DEFAULT_DESCRIPTION}">
  
  <!-- Open Graph / Facebook / iMessage -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${SITE_URL}/" />
  <meta property="og:title" content="${SITE_NAME}" />
  <meta property="og:description" content="${DEFAULT_DESCRIPTION}" />
  <meta property="og:image" content="${DEFAULT_IMAGE}" />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="${SITE_URL}/" />
  <meta property="twitter:title" content="${SITE_NAME}" />
  <meta property="twitter:description" content="${DEFAULT_DESCRIPTION}" />
  <meta property="twitter:image" content="${DEFAULT_IMAGE}" />
  
  <script>
    // Single Page Apps for GitHub Pages
    // https://github.com/rafgraph/spa-github-pages
    // This script takes the current URL and converts the path and query
    // string into just a query string, and then redirects the browser
    // to the new URL with only a query string and hash fragment.
    // The index.html file will then restore the path from the query string.
    (function(l) {
      if (l.search[1] === '/' ) {
        var decoded = l.search.slice(1).split('&').map(function(s) { 
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    }(window.location))
    
    // Redirect to home with path preserved for React Router
    var pathSegmentsToKeep = 0;
    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
      l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>`;
}

/**
 * Main function to prerender all pages
 */
async function prerender() {
  console.log('\n🚀 Starting OG meta tag prerendering...\n');

  // Get base HTML
  const baseHtml = getBaseHtml();

  // Get all content
  const posts = getAllPosts();
  const projects = getAllProjects();

  console.log(`Found ${posts.length} posts and ${projects.length} projects\n`);

  // Generate HTML for each post
  console.log('📝 Generating post pages...');
  for (const post of posts) {
    const html = generatePageHtml(baseHtml, {
      title: post.title,
      description: post.excerpt,
      image: post.image,
      url: `${SITE_URL}/posts/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
    });

    // Write to posts/[slug]/index.html for cleaner URLs
    writeHtmlFile(`posts/${post.slug}/index.html`, html);
  }

  // Generate HTML for each project
  console.log('\n💼 Generating project pages...');
  for (const project of projects) {
    const html = generatePageHtml(baseHtml, {
      title: project.title,
      description: project.summary,
      image: project.image,
      url: `${SITE_URL}/portfolio/${project.slug}`,
      type: 'article',
    });

    writeHtmlFile(`portfolio/${project.slug}/index.html`, html);
  }

  // Generate HTML for static pages
  console.log('\n📄 Generating static pages...');

  // Blog page
  const blogHtml = generatePageHtml(baseHtml, {
    title: 'Blog',
    description: 'Thoughts on software engineering, design, and building things.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  });
  writeHtmlFile('blog/index.html', blogHtml);

  // About page
  const aboutHtml = generatePageHtml(baseHtml, {
    title: 'About',
    description: 'Software engineer at Amazon, perfectionist, and AI enthusiast. Building things with code and creativity.',
    url: `${SITE_URL}/about`,
    type: 'website',
  });
  writeHtmlFile('about/index.html', aboutHtml);

  // Portfolio page
  const portfolioHtml = generatePageHtml(baseHtml, {
    title: 'Portfolio',
    description: 'Selected projects and experiments in software development.',
    url: `${SITE_URL}/portfolio`,
    type: 'website',
  });
  writeHtmlFile('portfolio/index.html', portfolioHtml);

  // Create 404.html with SPA redirect script for GitHub Pages
  // This allows BrowserRouter to work on GitHub Pages
  console.log('\n📋 Creating 404.html with SPA redirect...');
  const notFoundHtml = generate404Html();
  writeHtmlFile('404.html', notFoundHtml);

  // sitemap.xml + robots.txt from the same route list
  const isoDate = (d) => { const t = new Date(d); return Number.isNaN(t.getTime()) ? null : t.toISOString().slice(0, 10); };
  const urls = [
    { loc: `${SITE_URL}/` },
    { loc: `${SITE_URL}/blog` },
    { loc: `${SITE_URL}/portfolio` },
    { loc: `${SITE_URL}/about` },
    ...posts.map((p) => ({ loc: `${SITE_URL}/posts/${p.slug}`, lastmod: isoDate(p.date) })),
    ...projects.map((p) => ({ loc: `${SITE_URL}/portfolio/${p.slug}`, lastmod: isoDate(p.date) })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${escapeHtml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
    .join('\n')}\n</urlset>\n`;
  writeHtmlFile('sitemap.xml', sitemap);
  writeHtmlFile('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  console.log('\n✅ Prerendering complete!\n');
  console.log(`Generated pages for:`);
  console.log(`  - ${posts.length} blog posts`);
  console.log(`  - ${projects.length} portfolio projects`);
  console.log(`  - 4 static pages (blog, about, portfolio, 404)`);
  console.log('');
}

// Run the prerender
prerender().catch(err => {
  console.error('Prerendering failed:', err);
  process.exit(1);
});

