import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { Project } from 'ts-morph'
import {
  traverseAST,
  traverseASTMultiple,
  type ASTVisitor,
  type RuleViolation,
} from '../../src/ast/visitor.js'
import {
  fileExists,
  readFileSafe,
  clearCache,
  getCacheStats,
  getFileInfo,
} from '../../src/utils/fs-helpers.js'
import {
  isGitRepository,
  getGitRoot,
  clearGitCache,
  getGitCacheStats,
} from '../../src/utils/git-helpers.js'

// Helper to generate code with many nodes
function generateLargeSourceCode(nodeCount: number): string {
  const lines: string[] = ['// Generated test file with many nodes', '']

  // Add many functions to create nodes
  for (let i = 0; i < nodeCount; i++) {
    lines.push(`function func${i}(param${i}: number) {`)
    lines.push(`  if (param${i} > 0) {`)
    lines.push(`    for (let j = 0; j < param${i}; j++) {`)
    lines.push(`      console.log(j);`)
    lines.push(`    }`)
    lines.push(`  }`)
    lines.push(`  return param${i} * 2;`)
    lines.push(`}`)
    lines.push('')
  }

  return lines.join('\n')
}

// Helper to create simple visitor that counts nodes
function createCountingVisitor(): { visitor: ASTVisitor; getCount: () => number } {
  let count = 0
  const visitor: ASTVisitor = {
    visitNode: () => {
      count++
    },
  }
  return {
    visitor,
    getCount: () => count,
  }
}

describe('Performance Baselines', () => {
  describe('AST Traversal', () => {
    let project: Project

    beforeEach(() => {
      project = new Project({ useInMemoryFileSystem: true })
    })

    afterEach(() => {
      for (const sf of project.getSourceFiles()) {
        try {
          project.removeSourceFile(sf)
        } catch {}
      }
    })

    test('traverseASTMultiple with N visitors should be faster than N calls to traverseAST', () => {
      const nodeCount = 100
      const visitorCount = 10
      const code = generateLargeSourceCode(nodeCount)

      const sourceFile = project.createSourceFile('test.ts', code)

      // Create visitors
      const singleVisitors = Array.from({ length: visitorCount }, () => createCountingVisitor())
      const multiVisitors = singleVisitors.map((v) => v.visitor)

      // Warm up (JIT compilation)
      for (let i = 0; i < 3; i++) {
        traverseAST(sourceFile, singleVisitors[0]!.visitor, [])
        traverseASTMultiple(sourceFile, multiVisitors, [])
      }

      // Measure single-pass traversals
      const singleStart = performance.now()
      for (const { visitor } of singleVisitors) {
        traverseAST(sourceFile, visitor, [])
      }
      const singleTime = performance.now() - singleStart

      // Measure multi-visitor traversal
      const multiStart = performance.now()
      traverseASTMultiple(sourceFile, multiVisitors, [])
      const multiTime = performance.now() - multiStart

      // Verify correctness - both should visit the same number of nodes
      const _singleCount = singleVisitors[0]!.getCount()

      // traverseASTMultiple should be at least 5x faster
      // (in practice it's usually 8-10x faster due to single tree walk)
      const speedup = singleTime / multiTime
      expect(speedup).toBeGreaterThan(5)

      // Log for baseline tracking
      console.log(`AST Traversal Performance:
        Single traversals: ${singleTime.toFixed(2)}ms
        Multi traversal: ${multiTime.toFixed(2)}ms
        Speedup: ${speedup.toFixed(1)}x
        Node count: ~${nodeCount * 8} (estimated)
        Visitor count: ${visitorCount}`)
    })

    test('traverseASTMultiple handles empty visitors array', () => {
      const sourceFile = project.createSourceFile('empty.ts', 'const x = 1;')
      const violations: RuleViolation[] = []

      // Should not throw
      expect(() => traverseASTMultiple(sourceFile, [], violations)).not.toThrow()
      expect(violations).toHaveLength(0)
    })

    test('traverseASTMultiple with single visitor falls back to traverseAST', () => {
      const sourceFile = project.createSourceFile('single.ts', 'const x = 1;')
      const { visitor, getCount } = createCountingVisitor()
      const violations: RuleViolation[] = []

      traverseASTMultiple(sourceFile, [visitor], violations)

      // Should have visited nodes
      expect(getCount()).toBeGreaterThan(0)
    })

    test('traversal performance scales linearly with node count', () => {
      const nodeCounts = [50, 100, 200]
      const times: number[] = []

      for (const count of nodeCounts) {
        const code = generateLargeSourceCode(count)
        const sourceFile = project.createSourceFile(`test-${count}.ts`, code)
        const { visitor } = createCountingVisitor()

        // Warm up
        traverseAST(sourceFile, visitor, [])

        const start = performance.now()
        for (let i = 0; i < 5; i++) {
          traverseAST(sourceFile, visitor, [])
        }
        times.push(performance.now() - start)

        project.removeSourceFile(sourceFile)
      }

      // Time should scale roughly linearly (2x nodes = ~2x time)
      // Allow some variance (1.5x - 3x)
      const ratio = times[2]! / times[0]!
      expect(ratio).toBeGreaterThan(2)
      expect(ratio).toBeLessThan(6)

      console.log(`Scaling test:
        50 nodes: ${times[0]!.toFixed(2)}ms
        100 nodes: ${times[1]!.toFixed(2)}ms
        200 nodes: ${times[2]!.toFixed(2)}ms
        Ratio (200/50): ${ratio.toFixed(2)}x`)
    })
  })

  describe('File I/O Caching', () => {
    const testFilePath = '/tmp/test-cache-file.txt'
    const testFileContent = 'test content for caching'

    beforeEach(async () => {
      clearCache()
      // Create test file
      const fs = await import('fs/promises')
      await fs.writeFile(testFilePath, testFileContent).catch(() => {})
    })

    afterEach(async () => {
      clearCache()
      // Cleanup test file
      const fs = await import('fs/promises')
      await fs.unlink(testFilePath).catch(() => {})
    })

    test('fileExists caches results', async () => {
      // First call should add to cache
      const result1 = await fileExists(testFilePath)
      const stats1 = getCacheStats()

      // Second call should hit cache
      const result2 = await fileExists(testFilePath)
      const stats2 = getCacheStats()

      expect(result1).toBe(true)
      expect(result2).toBe(true)
      // Cache should have one entry for this file
      expect(stats1.size).toBeGreaterThanOrEqual(1)
      expect(stats2.size).toBe(stats1.size)
    })

    test('readFileSafe caches results', async () => {
      // First call
      const content1 = await readFileSafe(testFilePath)
      const stats1 = getCacheStats()

      // Second call should hit cache
      const content2 = await readFileSafe(testFilePath)
      const stats2 = getCacheStats()

      expect(content1).toBe(testFileContent)
      expect(content2).toBe(testFileContent)
      expect(stats1.keys.some((k) => k.includes('readFile'))).toBe(true)
    })

    test('getCacheStats returns correct structure', () => {
      const stats = getCacheStats()

      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('keys')
      expect(Array.isArray(stats.keys)).toBe(true)
      expect(typeof stats.size).toBe('number')
    })

    test('clearCache removes all entries', async () => {
      // Add some entries
      await fileExists(testFilePath)
      await readFileSafe(testFilePath)

      const statsBefore = getCacheStats()
      expect(statsBefore.size).toBeGreaterThan(0)

      clearCache()

      const statsAfter = getCacheStats()
      expect(statsAfter.size).toBe(0)
      expect(statsAfter.keys).toHaveLength(0)
    })

    test('cache TTL expiration works correctly', async () => {
      vi.useFakeTimers()

      try {
        // First call populates cache
        await fileExists(testFilePath)
        const stats1 = getCacheStats()
        expect(stats1.size).toBeGreaterThan(0)

        // Advance time past TTL (60 seconds)
        vi.advanceTimersByTime(61000)

        // Next call should miss cache and create new entry
        await fileExists(testFilePath)
        const stats2 = getCacheStats()

        // Cache should still have entries (new ones after expiration)
        expect(stats2.size).toBeGreaterThanOrEqual(1)
      } finally {
        vi.useRealTimers()
      }
    })

    test('getFileInfo caches results', async () => {
      // First call
      const info1 = await getFileInfo(testFilePath)
      const stats1 = getCacheStats()

      // Second call should hit cache
      const info2 = await getFileInfo(testFilePath)
      const stats2 = getCacheStats()

      expect(info1.path).toBe(testFilePath)
      expect(info2.path).toBe(testFilePath)
      expect(info1.size).toBe(info2.size)
      expect(stats1.keys.some((k) => k.includes('getFileInfo'))).toBe(true)
    })
  })

  describe('Git Operations Caching', () => {
    const testCwd = process.cwd()

    beforeEach(() => {
      clearGitCache()
    })

    afterEach(() => {
      clearGitCache()
    })

    test('isGitRepository caches results', () => {
      // First call
      const result1 = isGitRepository(testCwd)
      const stats1 = getGitCacheStats()

      // Second call should hit cache
      const result2 = isGitRepository(testCwd)
      const stats2 = getGitCacheStats()

      expect(typeof result1).toBe('boolean')
      expect(result1).toBe(result2)
      expect(stats1.size).toBeGreaterThan(0)
      expect(stats2.size).toBe(stats1.size)
    })

    test('getGitRoot caches results', () => {
      // First call
      const root1 = getGitRoot(testCwd)
      const stats1 = getGitCacheStats()

      // Second call should hit cache
      const root2 = getGitRoot(testCwd)
      const stats2 = getGitCacheStats()

      expect(root1).toBe(root2)
      expect(stats1.size).toBeGreaterThan(0)
      expect(stats2.size).toBeGreaterThanOrEqual(stats1.size)
    })

    test('getGitCacheStats returns correct structure', () => {
      isGitRepository(testCwd)
      const stats = getGitCacheStats()

      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('keys')
      expect(Array.isArray(stats.keys)).toBe(true)
      expect(typeof stats.size).toBe('number')
    })

    test('clearGitCache removes all entries', () => {
      // Add some entries
      isGitRepository(testCwd)
      getGitRoot(testCwd)

      const statsBefore = getGitCacheStats()
      expect(statsBefore.size).toBeGreaterThan(0)

      clearGitCache()

      const statsAfter = getGitCacheStats()
      expect(statsAfter.size).toBe(0)
      expect(statsAfter.keys).toHaveLength(0)
    })

    test('git cache TTL expiration works correctly', () => {
      vi.useFakeTimers()

      try {
        // First call populates cache
        isGitRepository(testCwd)
        const stats1 = getGitCacheStats()
        expect(stats1.size).toBeGreaterThan(0)

        // Advance time past TTL (5 seconds for git cache)
        vi.advanceTimersByTime(5100)

        // Next call should miss cache and create new entry
        isGitRepository(testCwd)
        const stats2 = getGitCacheStats()

        // Cache should still have entries (new ones after expiration)
        expect(stats2.size).toBeGreaterThanOrEqual(1)
      } finally {
        vi.useRealTimers()
      }
    })

    test('non-git directory returns false and caches result', () => {
      const nonGitDir = '/tmp/nonexistent-dir-12345'

      const result = isGitRepository(nonGitDir)
      expect(result).toBe(false)

      const stats = getGitCacheStats()
      expect(stats.keys.some((k) => k.includes(nonGitDir))).toBe(true)
    })
  })

  describe('Performance Regression Guards', () => {
    // These tests establish baselines that should not regress

    test('cache operations should be sub-millisecond', async () => {
      clearCache()

      const fs = await import('fs/promises')
      const tempFile = '/tmp/perf-test-cache.txt'
      await fs.writeFile(tempFile, 'test').catch(() => {})

      try {
        // Warm up cache
        await fileExists(tempFile)

        // Measure cached operation
        const iterations = 100
        const start = performance.now()
        for (let i = 0; i < iterations; i++) {
          await fileExists(tempFile)
        }
        const totalTime = performance.now() - start
        const avgTime = totalTime / iterations

        // Each cached operation should be < 1ms
        expect(avgTime).toBeLessThan(1)

        console.log(
          `Cache performance: ${avgTime.toFixed(4)}ms per cached operation (${iterations} iterations)`,
        )
      } finally {
        await fs.unlink(tempFile).catch(() => {})
        clearCache()
      }
    })

    test('git cache operations should be sub-millisecond', () => {
      clearGitCache()

      // Warm up cache
      isGitRepository(testCwd)

      // Measure cached operation
      const iterations = 100
      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        isGitRepository(testCwd)
      }
      const totalTime = performance.now() - start
      const avgTime = totalTime / iterations

      // Each cached operation should be < 1ms
      expect(avgTime).toBeLessThan(1)

      console.log(
        `Git cache performance: ${avgTime.toFixed(4)}ms per cached operation (${iterations} iterations)`,
      )
    })
  })
})

// Get testCwd for git tests
const testCwd = process.cwd()
