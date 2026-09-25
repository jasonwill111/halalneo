/**
 * Brand asset generation (design plan §3.4) — ONE-TIME/build-time, outputs to
 * /static/brand (deliberately NOT R2: §5.12 forbids pointless Class B usage).
 *
 *   favicon.svg            vector favicon (rounded, mark geometry)
 *   favicon-32.png         raster favicon fallback
 *   apple-touch-icon.png   180px, opaque background
 *   icon-192.png 512.png   manifest icons (content inside 80% maskable safe zone)
 *   icon-192.svg 512.svg   vector manifest icons (replaces legacy "HN" gradient)
 *   og-default.png         1200×630 default social card (green + girih + star + wordmark)
 *
 * Star geometry is parsed from site/mark.svelte so it stays the single source.
 * Colors are converted from the layout.css oklch tokens at runtime.
 *
 * Usage: node scripts/gen-brand-assets.mjs   (requires playwright chromium for OG)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'static', 'brand');

// ─── tokens (must equal src/routes/layout.css) ─────────────────────
function oklchToHex(L, C, H) {
	const h = (H * Math.PI) / 180;
	const a = C * Math.cos(h);
	const b = C * Math.sin(h);
	const l_ = L + 0.396337779437019 * a + 0.215803757310103 * b;
	const m_ = L - 0.105561345815658 * a - 0.063854172817261 * b;
	const s_ = L - 0.089484177529818 * a - 1.291485548019409 * b;
	const l = l_ ** 3,
		m = m_ ** 3,
		s = s_ ** 3;
	const lin = [
		4.0767416 * l - 3.3077115 * m + 0.2309664 * s,
		-1.268438 * l + 2.6097574 * m - 0.3413193 * s,
		-0.004196 * l - 0.7034186 * m + 1.7076147 * s
	];
	return (
		'#' +
		lin
			.map((x) => {
				const v = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.max(x, 0) ** (1 / 2.4) - 0.055;
				return Math.round(Math.min(1, Math.max(0, v)) * 255)
					.toString(16)
					.padStart(2, '0');
			})
			.join('')
	);
}
const PRIMARY = oklchToHex(0.4, 0.15, 158); // --primary light
const ON_PRIMARY = oklchToHex(0.985, 0.004, 88); // --primary-foreground light

// ─── geometry from mark.svelte (single source) ─────────────────────
const markSrc = readFileSync(join(ROOT, 'src', 'lib', 'components', 'site', 'mark.svelte'), 'utf8');
const grab = (name) => {
	const m = markSrc.match(new RegExp(`const ${name} =\\s*\\n?\\s*'([^']+)'`));
	if (!m) throw new Error(`could not parse ${name} from mark.svelte`);
	return m[1];
};
const SQUARE_A = grab('SQUARE_A');
const SQUARE_B = grab('SQUARE_B');
const SOLID_STAR = grab('SOLID_STAR');

// ─── icon SVG (512 grid) ───────────────────────────────────────────
function iconSvg(solidScale, rounded) {
	const off = (512 - solidScale * 64) / 2;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs>
	<pattern id="girih" width="96" height="96" patternUnits="userSpaceOnUse">
		<g transform="scale(1.5)" fill="none" stroke="${ON_PRIMARY}" stroke-width="2" opacity="0.07">
			<path d="${SQUARE_A}"/><path d="${SQUARE_B}"/>
		</g>
	</pattern>
</defs>
<rect width="512" height="512"${rounded ? ' rx="112"' : ''} fill="${PRIMARY}"/>
${rounded ? '' : `<rect width="512" height="512" fill="url(#girih)"/>`}
<g transform="translate(${off} ${off}) scale(${solidScale})">
	<path d="${SOLID_STAR}" fill="${ON_PRIMARY}"/>
</g>
</svg>`;
}

mkdirSync(OUT, { recursive: true });
const write = (name, data) => {
	writeFileSync(join(OUT, name), data);
	console.log('wrote', name);
};

// maskable safe zone: 80% of 512 = 409 → star spans ~409px
const ICON_512 = iconSvg(512 / 64 - 1.6, false); // star ≈ 410px, pattern behind
write('icon-512.svg', ICON_512);
write('icon-192.svg', ICON_512);
// favicon: rounded tile, slightly smaller star, no texture (16px legibility)
write('favicon.svg', iconSvg(5.6, true));

for (const [name, size] of [
	['favicon-32.png', 32],
	['apple-touch-icon.png', 180],
	['icon-192.png', 192],
	['icon-512.png', 512]
]) {
	const png = await sharp(Buffer.from(ICON_512)).resize(size, size).png().toBuffer();
	write(name, png);
}

// ─── OG 1200×630 via headless Chromium (real Space Grotesk) ────────
const fontB64 = readFileSync(
	join(ROOT, 'static', 'fonts', 'space-grotesk', 'space-grotesk-latin.woff2')
).toString('base64');
const girihUri = encodeURIComponent(
	`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><g transform="scale(1.5)" fill="none" stroke="white" stroke-width="2" opacity="0.06"><path d="${SQUARE_A}"/><path d="${SQUARE_B}"/></g></svg>`
);
const starUri = encodeURIComponent(
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="white" stroke-width="2"><path d="${SQUARE_A}"/><path d="${SQUARE_B}"/></svg>`
);
const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family:'SG'; src:url(data:font/woff2;base64,${fontB64}) format('woff2'); font-weight:400 700; }
* { margin:0; box-sizing:border-box; }
body { width:1200px; height:630px; overflow:hidden; background:${PRIMARY}; font-family:'SG',sans-serif; color:${ON_PRIMARY};
  background-image:url("data:image/svg+xml,${girihUri}"); position:relative; }
.bigstar { position:absolute; right:-90px; top:50%; transform:translateY(-50%) rotate(0deg); width:620px; height:620px;
  background:url("data:image/svg+xml,${starUri}") no-repeat; opacity:0.14; }
.solid { position:absolute; left:96px; top:150px; width:72px; height:72px; opacity:0.95; }
.word { position:absolute; left:190px; top:140px; font-size:88px; font-weight:700; letter-spacing:-0.03em; }
.sub { position:absolute; left:98px; top:290px; font-size:31px; font-weight:400; opacity:0.88; letter-spacing:0.005em; }
.rule { position:absolute; left:98px; top:262px; width:120px; height:4px; background:${ON_PRIMARY}; opacity:0.5; border-radius:2px; }
.foot { position:absolute; left:98px; bottom:56px; font-size:22px; letter-spacing:0.18em; text-transform:uppercase; opacity:0.65; }
</style></head><body>
<div class="bigstar"></div>
<svg class="solid" viewBox="0 0 64 64"><path fill="${ON_PRIMARY}" d="${SOLID_STAR}"/></svg>
<div class="word">HalalNeo</div>
<div class="rule"></div>
<div class="sub">Halal trade intelligence for buyers and suppliers.</div>
<div class="foot">Certify &middot; Source &middot; Verify</div>
</body></html>`;

const { chromium } = await import('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(ogHtml, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const shot = await page.screenshot({ type: 'png' });
await browser.close();
write('og-default.png', await sharp(shot).resize(1200, 630).png({ quality: 85 }).toBuffer());

console.log('brand assets done →', OUT);
