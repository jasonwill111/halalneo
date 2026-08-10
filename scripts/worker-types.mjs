import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

execSync('wrangler types', { stdio: 'inherit' });

const file = 'worker-configuration.d.ts';
const content = readFileSync(file, 'utf8').replace(/mainModule: typeof import\([^)]*\);/, '');
writeFileSync(file, content);
