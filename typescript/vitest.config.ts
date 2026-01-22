import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			'@radiustechsystems/sdk': resolve(__dirname, './src'),
		},
	},
	test: {
		fileParallelism: false, // Run test files sequentially to avoid nonce conflicts on shared Anvil account
		disableConsoleIntercept: true,
		environment: 'node',
		globals: true,
		hookTimeout: 30000,
		testTimeout: 30000,
		setupFiles: [resolve(__dirname, './test/setup.ts')],
		include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'test/**/*.test.ts', 'test/**/*.test.tsx'],
	},
});
