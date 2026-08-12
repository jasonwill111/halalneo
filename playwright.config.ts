import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'npm run build && npm run preview', port: 4174, timeout: 180000 },
	testMatch: '**/*.e2e.{ts,js}'
});
