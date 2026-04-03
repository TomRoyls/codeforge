import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['json', 'lcov'],
      reportsDirectory: './coverage',
      exclude: ['src/**/*.d.ts', 'src/index.ts'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    slowTestThreshold: 300,
    pool: 'threads',
    isolate: true,
    maxWorkers: 4,
  },
})
