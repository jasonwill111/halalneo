import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const file = 'worker-configuration.d.ts';

if (process.platform === 'win32' && existsSync(file)) {
	process.exit(0);
}

execSync('wrangler types', { stdio: 'inherit' });

const content = readFileSync(file, 'utf8').replace(/mainModule: typeof import\([^)]*\);/, '');
writeFileSync(file, content);
