import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    disableConsoleIntercept: true,
    environment: 'node',
    globals: true,
    hookTimeout: 30000,
    testTimeout: 30000,
    setupFiles: [resolve(__dirname, './packages/core/test/setup.ts')],
  },
});
