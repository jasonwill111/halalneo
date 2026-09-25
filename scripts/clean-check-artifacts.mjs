import { rmSync } from 'node:fs';

for (const directory of [
	'.svelte-kit/output',
	'.svelte-kit/cloudflare',
	'.svelte-kit/cloudflare-tmp'
]) {
	rmSync(directory, { recursive: true, force: true });
}
