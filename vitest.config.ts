import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Count every source file, not only the ones the tests import.
      include: ['src/**/*.ts'],
      exclude: ['node_modules/', 'dist/', '**/*.test.ts'],
      // Measured line coverage, rounded down (58.7 % on 2026-10-08).
      thresholds: { lines: 58 },
    },
  },
});
