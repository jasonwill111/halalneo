import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const serverUrl = 'https://halalneo.com';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const screenshotsDir = join(__dirname, 'screenshots');

// Ensure screenshots directory exists
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

const pages = [
  { name: 'homepage', path: '/' },
  { name: 'products', path: '/products' },
  { name: 'productdetail', path: '/product/rendang-braising-paste' },
  { name: 'blogdetail', path: '/blog/halal-certification-in-2026-what-buyers-need-to-know' },
  { name: 'knowledgebase', path: '/knowledge-base/halal-certification/halal-certification-landscape' },
  { name: 'admin', path: '/admin' },
  { name: 'verify', path: '/verify' },
];

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'desktop', width: 1280, height: 800 },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    for (const pageConfig of pages) {
      for (const viewport of viewports) {
        try {
          // Set viewport
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          
          // Navigate to page
          const url = `${serverUrl}${pageConfig.path}`;
          console.log(`Navigating to ${url} (${viewport.name})`);
          
          await page.goto(url);
          
          // Wait a bit for content to load
          await page.waitForTimeout(1000);
          
          // Take screenshot
          const screenshotPath = join(screenshotsDir, `${pageConfig.name}_${viewport.name}.png`);
          await page.screenshot({ path: screenshotPath });
          console.log(`✅ Screenshot saved: ${screenshotPath}`);
        } catch (err) {
          console.error(`❌ Error capturing ${pageConfig.name} ${viewport.name}:`, err.message);
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log('\n🎉 Screenshot capture completed!');
})();
