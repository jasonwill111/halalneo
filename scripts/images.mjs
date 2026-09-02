/**
 * Image pipeline: Download from picsum/loremflickr → Upload to R2
 * Uses free, no-API-key sources. All downloaded as WebP-ready JPEGs.
 * 
 * Usage:
 *   node scripts/images.mjs download   # Download all images
 *   node scripts/images.mjs upload     # Upload to R2
 *   node scripts/images.mjs all        # Download + Upload
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TMP = join(ROOT, 'tmp', 'images');
const URLS_FILE = join(ROOT, 'tmp', 'image-urls.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function getDateKey() { return new Date().toISOString().slice(0, 10).replace(/-/g, ''); }
function generateR2Key(id, ext = 'webp') { return `media/${getDateKey()}/${id}.${ext}`; }

// ─── Image Manifest ───────────────────────────────────────────────
// picsum.photos: random high-quality photos (seed-based for consistency)
// loremflickr.com: keyword-based random images
// We download JPEG then will re-serve from R2 as WebP via Cloudflare Images

const IMAGES = {
  hero: [
    { id: 'hero-1', src: 'https://picsum.photos/seed/halaltrade1/1200/630', w: 1200, h: 630 },
    { id: 'hero-2', src: 'https://picsum.photos/seed/halalmarket2/1200/630', w: 1200, h: 630 },
    { id: 'hero-3', src: 'https://picsum.photos/seed/halalsupply3/1200/630', w: 1200, h: 630 },
  ],

  products: [
    { id: 'rendang',    src: 'https://loremflickr.com/800/800/spice,paste,indonesian', w: 800, h: 800 },
    { id: 'sambal',     src: 'https://loremflickr.com/800/800/chili,sauce,hot', w: 800, h: 800 },
    { id: 'mango',      src: 'https://loremflickr.com/800/800/mango,juice,tropical', w: 800, h: 800 },
    { id: 'guava',      src: 'https://loremflickr.com/800/800/guava,fruit,fresh', w: 800, h: 800 },
    { id: 'biscuit',    src: 'https://loremflickr.com/800/800/cookies,biscuit,baked', w: 800, h: 800 },
    { id: 'cake',       src: 'https://loremflickr.com/800/800/cake,pastry, sponge', w: 800, h: 800 },
    { id: 'beef',       src: 'https://loremflickr.com/800/800/beef,steak,meat', w: 800, h: 800 },
    { id: 'chicken',    src: 'https://loremflickr.com/800/800/chicken,poultry,food', w: 800, h: 800 },
    { id: 'bulgur',     src: 'https://loremflickr.com/800/800/grain,wheat,whole', w: 800, h: 800 },
    { id: 'lentils',    src: 'https://loremflickr.com/800/800/lentils,legume,pulse', w: 800, h: 800 },
    { id: 'capsule',    src: 'https://loremflickr.com/800/800/supplement,vitamin,capsule', w: 800, h: 800 },
    { id: 'protein',    src: 'https://loremflickr.com/800/800/protein,powder,nutrition', w: 800, h: 800 },
  ],

  categories: [
    { id: 'cat-food-beverages',  src: 'https://picsum.photos/seed/catfood1/400/400', w: 400, h: 400 },
    { id: 'cat-meat-poultry',    src: 'https://picsum.photos/seed/catmeat2/400/400', w: 400, h: 400 },
    { id: 'cat-dairy-eggs',      src: 'https://picsum.photos/seed/catdairy3/400/400', w: 400, h: 400 },
    { id: 'cat-confectionery',   src: 'https://picsum.photos/seed/catcandy4/400/400', w: 400, h: 400 },
    { id: 'cat-beverages',       src: 'https://picsum.photos/seed/catdrink5/400/400', w: 400, h: 400 },
    { id: 'cat-supplements',     src: 'https://picsum.photos/seed/catsupp6/400/400', w: 400, h: 400 },
    { id: 'cat-cosmetics',       src: 'https://picsum.photos/seed/catbeauty7/400/400', w: 400, h: 400 },
  ],

  blog: [
    { id: 'blog-1', src: 'https://picsum.photos/seed/blogcert1/1200/630', w: 1200, h: 630 },
    { id: 'blog-2', src: 'https://picsum.photos/seed/blogmarket2/1200/630', w: 1200, h: 630 },
    { id: 'blog-3', src: 'https://picsum.photos/seed/blogtrade3/1200/630', w: 1200, h: 630 },
  ],

  suppliers: [
    { id: 'sup-nusantara',   src: 'https://picsum.photos/seed/supnf1/1200/400', w: 1200, h: 400 },
    { id: 'sup-santosa',     src: 'https://picsum.photos/seed/supsb2/1200/400', w: 1200, h: 400 },
    { id: 'sup-albarakah',   src: 'https://picsum.photos/seed/supab3/1200/400', w: 1200, h: 400 },
    { id: 'sup-medina',      src: 'https://picsum.photos/seed/supmh4/1200/400', w: 1200, h: 400 },
    { id: 'sup-grainpath',   src: 'https://picsum.photos/seed/supgp5/1200/400', w: 1200, h: 400 },
    { id: 'sup-saffron',     src: 'https://picsum.photos/seed/supsd6/1200/400', w: 1200, h: 400 },
    { id: 'sup-pureharvest', src: 'https://picsum.photos/seed/supph7/1200/400', w: 1200, h: 400 },
  ],
};

// ─── Download ──────────────────────────────────────────────────────
async function downloadImage(id, url, retries = 2) {
  const filename = `${id}.jpg`;
  const filepath = join(TMP, filename);

  if (existsSync(filepath)) {
    console.log(`  ⏭ ${filename} (cached)`);
    return filepath;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'HalalNeo-ImagePipeline/1.0' },
        signal: AbortSignal.timeout(20000),
        redirect: 'follow',
      });
      if (res.status === 429) {
        const wait = (attempt + 1) * 5000;
        console.log(`  ⏳ ${filename} rate-limited, waiting ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(filepath, buf);
      const kb = (buf.length / 1024).toFixed(1);
      console.log(`  ✓ ${filename} (${kb} KB)`);
      return filepath;
    } catch (e) {
      if (attempt < retries) {
        await sleep(2000);
        continue;
      }
      console.error(`  ✗ ${filename}: ${e.message}`);
      return null;
    }
  }
  return null;
}

async function downloadAll() {
  console.log('\n📥 Downloading images (picsum + loremflickr)...');
  if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });

  const all = Object.entries(IMAGES).flatMap(([group, items]) =>
    items.map((item) => ({ ...item, group }))
  );

  let ok = 0, fail = 0;
  for (const img of all) {
    const result = await downloadImage(img.id, img.src);
    result ? ok++ : fail++;
    await sleep(800);
  }

  console.log(`\n📊 Downloaded: ${ok} OK, ${fail} failed (of ${all.length} total)`);
}

// ─── Upload to R2 ──────────────────────────────────────────────────
function uploadToR2() {
  console.log('\n📤 Uploading to R2...');
  const urlMap = existsSync(URLS_FILE) ? JSON.parse(readFileSync(URLS_FILE, 'utf-8')) : {};

  const all = Object.entries(IMAGES).flatMap(([group, items]) =>
    items.map((item) => ({ ...item, group }))
  );

  let ok = 0, fail = 0;
  for (const img of all) {
    const filepath = join(TMP, `${img.id}.jpg`);
    if (!existsSync(filepath)) {
      console.log(`  ⏭ ${img.id}.jpg (not downloaded)`);
      fail++;
      continue;
    }

    const r2Key = generateR2Key(img.id);
    try {
      execSync(
        `wrangler r2 object put halalneo-media/${r2Key} --file="${filepath}" --content-type="image/jpeg" --cc="public, max-age=31536000, immutable" --local`,
        { cwd: ROOT, stdio: 'pipe', timeout: 30000 }
      );
      const url = `/api/media/${r2Key.replace('media/', '')}`;
      urlMap[img.id] = { url, group: img.group, w: img.w, h: img.h, r2Key };
      console.log(`  ✓ ${img.id} → ${r2Key}`);
      ok++;
    } catch (e) {
      const msg = e.stderr?.toString() || e.message;
      console.error(`  ✗ ${img.id}: ${msg.split('\n')[0]}`);
      fail++;
    }
  }

  writeFileSync(URLS_FILE, JSON.stringify(urlMap, null, 2));
  console.log(`\n📊 Uploaded: ${ok} OK, ${fail} failed`);
  console.log(`📄 URL map saved to tmp/image-urls.json`);
}

// ─── Print URLs ────────────────────────────────────────────────────
function printUrls() {
  if (!existsSync(URLS_FILE)) {
    console.log('❌ No URL map found. Run upload first.');
    return;
  }
  const urlMap = JSON.parse(readFileSync(URLS_FILE, 'utf-8'));
  console.log('\n🗺️  Image URL Map:\n');
  for (const [id, info] of Object.entries(urlMap)) {
    console.log(`  ${id.padEnd(22)} → ${info.url}  (${info.group})`);
  }
}

// ─── Main ──────────────────────────────────────────────────────────
const cmd = process.argv[2] || 'all';
switch (cmd) {
  case 'download': await downloadAll(); break;
  case 'upload': uploadToR2(); break;
  case 'urls': printUrls(); break;
  case 'all': await downloadAll(); uploadToR2(); break;
  default: console.log('Usage: node scripts/images.mjs [download|upload|all|urls]');
}
