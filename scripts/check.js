import fs from 'node:fs';
import path from 'node:path';

// Try different path patterns
const candidates = [
  path.join('src', 'routes', 'blog', '[slug]', '+page.ts'),
  path.join('src', 'routes', 'blog', '[slug]', '+page.server.ts'),
  path.join('src', 'routes', 'blog', '[slug]', '+layout.ts'),
  path.join('src', 'routes', 'blog', '[slug]', '+layout.server.ts'),
];

for (const p of candidates) {
  try {
    const c = fs.readFileSync(p, 'utf8');
    console.log(`=== ${p} ===`);
    console.log(c.slice(0, 4000));
    console.log('---');
    break;
  } catch {
    console.log(`${p}: not found`);
  }
}
