import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/unit/commands/suggest-rules-patterns.test.ts'],
    pool: 'vmThreads',
  },
})
