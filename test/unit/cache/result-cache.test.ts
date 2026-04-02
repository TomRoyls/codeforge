import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { tmpdir, mkdtemp, rmSync } from 'fs'
import path from 'node:path'
import type { CachedResultEntry, from '../../../src/cache/result-cache.js'

import { ResultCache, from '../../../src/cache/result-cache.js'

import { logger } from '../../../src/utils/logger.js'
import { hashContent } from '../../../src/cache/index.js'
import type { RuleViolation } from '../../../src/ast/visitor.js'

const tempDir = path.join(tmpdir(), 'codeforge-cache-test')
const cacheFile = path.join(tempDir, 'test-entry.json')
const cacheFile2 = path.join(tempDir, 'test-entry-2.json')

const testEntry: CachedResultEntry = {
  filePath: '/test/file.ts',
  fileHash: 'abc123',
  configHash: 'def456',
  violations: [
    {
      ruleId: 'test-rule',
      severity: 'warning',
      message: 'Test violation',
      filePath: '/test/file.ts',
      range: { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } },
    ],
  ],
  timestamp: Date.now(),
}

beforeEach(() => {
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true })
  }
})

afterEach(() => {
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true })
  }
})

describe('ResultCache', () => {
  let cache: ResultCache

  beforeEach(() => {
    cache = new ResultCache({ cacheDir: tempDir })
  })

  afterEach(() => {
    vi.useFakeTimers().clearAllMocks()
  cache.clear()
    if (existsSync(cacheFile)) {
      rmSync(cacheFile)
    }
  })

  describe('get', () => {
    test('returns cached violations on cache hit', async () => {
      await cache.set(
        cacheFile,
        testEntry.filePath,
        testEntry.fileHash,
        testEntry.configHash,
        testEntry.violations,
      )

      const result = await cache.get(
        cacheFile,
        testEntry.filePath,
        testEntry.fileHash,
        testEntry.configHash,
      )

      expect(result).toEqual(testEntry.violations)
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining(`Result cache SET for ${testEntry.filePath}`),
      )
    })

    test('returns null on cache miss', async () => {
      const result = await cache.get(
        cacheFile,
        testEntry.filePath,
        'wrong-hash',
        testEntry.configHash,
      )

      expect(result).toBeNull()
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining(`Result cache MISS for ${testEntry.filePath}`),
      )
    })

    test('returns null when version mismatch', async () => {
      const oldEntry: CachedResultEntry = {
        ...testEntry,
        timestamp: Date.now() - 86400000,
      }
      await cache.set(cacheFile, testEntry.filePath, testEntry.fileHash, testEntry.configHash, testEntry.violations)

      const result = await cache.get(
        cacheFile,
        testEntry.filePath,
        testEntry.fileHash,
        testEntry.configHash,
      )

      expect(result).toBeNull()
    })

    test('returns null when config hash mismatch', async () => {
      const differentConfigEntry: CachedResultEntry = {
        ...testEntry,
        configHash: 'different-config-hash',
        timestamp: Date.now(),
      }
      await cache.set(cacheFile, testEntry.filePath, testEntry.fileHash, testEntry.configHash, testEntry.violations)

      const result = await cache.get(
        cacheFile,
        testEntry.filePath,
        testEntry.fileHash,
        differentConfigEntry.configHash,
      )

      expect(result).toBeNull()
    })

    test('returns null when TTL expired', async () => {
      const expiredEntry: CachedResultEntry = {
        ...testEntry,
        timestamp: Date.now() - 86400000,
      }
      await cache.set(cacheFile, testEntry.filePath, testEntry.fileHash, testEntry.configHash, testEntry.violations)

      vi.useFakeTimers().setSystemTime(Date.now() + 86400000)

      const result = await cache.get(
        cacheFile,
        testEntry.filePath,
        testEntry.fileHash,
        testEntry.configHash,
      )

      expect(result).toBeNull()
    })

    test('returns false when disabled', async () => {
      cache.setEnabled(false)

      const result = await cache.get(
        cacheFile,
        testEntry.filePath,
        testEntry.fileHash,
        testEntry.configHash,
      )

      expect(result).toBeNull()
    })

    test('has returns true when entry exists and async () => {
      await cache.set(
        cacheFile,
        testEntry.filePath,
        testEntry.fileHash,
        testEntry.configHash,
        testEntry.violations,
      )

      const result = await cache.has(
        cacheFile,
        testEntry.filePath,
        testEntry.fileHash,
        testEntry.configHash,
      )

      expect(result).toBe(true)
    })

    test('has returns false when entry does not exist', async () => {
      const result = await cache.has(
        cacheFile,
        testEntry.filePath,
        'wrong-hash',
        testEntry.configHash,
      )

      expect(result).toBe(false)
    })

    test('invalidateFile removes entries for specific file', async () => {
      await cache.set(
        cacheFile,
        testEntry.filePath,
        testEntry.fileHash,
        testEntry.configHash,
        testEntry.violations,
      )
      await cache.set(
        cacheFile,
        '/test/other-file.ts',
        testEntry.fileHash,
        testEntry.configHash,
        testEntry.violations,
      )

      const deleted = await cache.invalidateFile(testEntry.filePath)

      expect(deleted).toBe(1)
      expect(await cache.has(cacheFile, testEntry.filePath, testEntry.fileHash, testEntry.configHash)).toBe(false)
      expect(
        await cache.has(cacheFile, '/test/other-file.ts', testEntry.fileHash, testEntry.configHash),
      ).resolves(true)
    })

    test('clear removes all entries', async () => {
      await cache.set(
        cacheFile,
        testEntry.filePath,
        testEntry.fileHash,
        testEntry.configHash,
        testEntry.violations,
      )

      cache.clear()

      expect(cache.getStats()).toEqual({
        entries: 0,
        hitRate: 0,
        hits: 0,
        misses: 0,
        size: 0,
      })
    })

    test('getStats returns correct statistics after operations', async () => {
      await cache.set(
        cacheFile,
        testEntry.filePath,
        testEntry.fileHash,
        testEntry.configHash,
        testEntry.violations,
      )
      await cache.get(cacheFile, testEntry.filePath, testEntry.fileHash, testEntry.configHash)

      )
      await cache.set(
        cacheFile,
        testEntry.filePath,
        testEntry.fileHash,
        testEntry.configHash,
        testEntry.violations,
      )

      const stats = cache.getStats()

      expect(stats).toEqual({
        entries: 1,
        hitRate: 0.6666666666666667,
        hits: 2,
        misses: 1,
        size: 1,
      })
    })

    test('hashConfig generates consistent hash for rule configuration', () => {
      const rules = ['rule1', 'rule2', 'rule3']
      const ruleConfig = { someOption: true }

      const hash = cache.hashConfig(rules, ruleConfig)

      expect(hash).toBe('d4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4')
    })
  })
})
