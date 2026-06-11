import { resolve } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  clearGitCache,
  getChangedFiles,
  getDefaultBranch,
  getGitCacheStats,
  getGitRoot,
  getStagedFiles,
  isGitRepository,
} from '../../src/utils/git-helpers.js'

describe('git-helpers cache', () => {
  beforeEach(() => {
    clearGitCache()
  })

  afterEach(() => {
    clearGitCache()
  })

  it('clearGitCache empties the cache', () => {
    isGitRepository(process.cwd())
    expect(getGitCacheStats().size).toBeGreaterThan(0)
    clearGitCache()
    expect(getGitCacheStats().size).toBe(0)
    expect(getGitCacheStats().keys).toEqual([])
  })

  it('getGitCacheStats returns ttlMs of 5000', () => {
    const stats = getGitCacheStats()
    expect(stats.ttlMs).toBe(5000)
  })

  it('getGitCacheStats returns size 0 after clear', () => {
    clearGitCache()
    expect(getGitCacheStats().size).toBe(0)
  })

  it('getGitCacheStats returns keys array', () => {
    clearGitCache()
    const stats = getGitCacheStats()
    expect(Array.isArray(stats.keys)).toBe(true)
  })

  it('cache populates after isGitRepository call', () => {
    clearGitCache()
    isGitRepository(process.cwd())
    const stats = getGitCacheStats()
    expect(stats.size).toBeGreaterThan(0)
  })

  it('multiple calls add separate cache entries', () => {
    clearGitCache()
    isGitRepository(process.cwd())
    getDefaultBranch(process.cwd())
    expect(getGitCacheStats().size).toBeGreaterThanOrEqual(2)
  })

  it('cache entries have correct key prefixes', () => {
    clearGitCache()
    isGitRepository(process.cwd())
    getStagedFiles(process.cwd())
    getGitRoot(process.cwd())
    const keys = getGitCacheStats().keys
    expect(keys.some((k) => k.startsWith('isGitRepository:'))).toBe(true)
    expect(keys.some((k) => k.startsWith('getStagedFiles:'))).toBe(true)
    expect(keys.some((k) => k.startsWith('getGitRoot:'))).toBe(true)
  })

  it('clearGitCache on empty cache is safe', () => {
    clearGitCache()
    clearGitCache()
    expect(getGitCacheStats().size).toBe(0)
  })
})

describe('isGitRepository', () => {
  beforeEach(() => {
    clearGitCache()
  })

  afterEach(() => {
    clearGitCache()
  })

  it('returns true for the current repo', () => {
    expect(isGitRepository(process.cwd())).toBe(true)
  })

  it('returns true for resolved path of the current repo', () => {
    expect(isGitRepository(resolve('.'))).toBe(true)
  })

  it('returns false for /tmp', () => {
    expect(isGitRepository('/tmp')).toBe(false)
  })

  it('returns false for non-existent directory', () => {
    expect(isGitRepository('/nonexistent/path/that/does/not/exist')).toBe(false)
  })

  it('caches the result', () => {
    clearGitCache()
    isGitRepository(process.cwd())
    const keys = getGitCacheStats().keys
    expect(keys.some((k) => k.startsWith('isGitRepository:'))).toBe(true)
  })

  it('returns boolean', () => {
    const result = isGitRepository(process.cwd())
    expect(typeof result).toBe('boolean')
  })

  it('returns same value on repeated calls', () => {
    const first = isGitRepository(process.cwd())
    const second = isGitRepository(process.cwd())
    expect(first).toBe(second)
  })

  it('returns false for root directory', () => {
    expect(isGitRepository('/')).toBe(false)
  })
})

describe('getStagedFiles', () => {
  beforeEach(() => {
    clearGitCache()
  })

  afterEach(() => {
    clearGitCache()
  })

  it('returns an array', () => {
    const result = getStagedFiles(process.cwd())
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns empty array for /tmp', () => {
    expect(getStagedFiles('/tmp')).toEqual([])
  })

  it('caches the result with correct key prefix', () => {
    clearGitCache()
    getStagedFiles(process.cwd())
    const keys = getGitCacheStats().keys
    expect(keys.some((k) => k.startsWith('getStagedFiles:'))).toBe(true)
  })

  it('returns same result on second call (from cache)', () => {
    clearGitCache()
    const first = getStagedFiles(process.cwd())
    const second = getStagedFiles(process.cwd())
    expect(first).toEqual(second)
  })

  it('returns empty array for non-existent directory', () => {
    expect(getStagedFiles('/nonexistent/path')).toEqual([])
  })

  it('array elements are strings', () => {
    const result = getStagedFiles(process.cwd())
    for (const file of result) {
      expect(typeof file).toBe('string')
    }
  })
})

describe('getChangedFiles', () => {
  beforeEach(() => {
    clearGitCache()
  })

  afterEach(() => {
    clearGitCache()
  })

  it('returns an array', () => {
    const result = getChangedFiles('HEAD~1', process.cwd())
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns empty array for /tmp', () => {
    expect(getChangedFiles('HEAD~1', '/tmp')).toEqual([])
  })

  it('caches the result', () => {
    clearGitCache()
    getChangedFiles('HEAD~1', process.cwd())
    const keys = getGitCacheStats().keys
    expect(keys.some((k) => k.startsWith('getChangedFiles:'))).toBe(true)
  })

  it('includes base ref in cache key', () => {
    clearGitCache()
    getChangedFiles('main', process.cwd())
    const keys = getGitCacheStats().keys
    const changedKey = keys.find((k) => k.startsWith('getChangedFiles:'))
    expect(changedKey).toContain('main')
  })

  it('different base refs create different cache keys', () => {
    clearGitCache()
    getChangedFiles('HEAD~1', process.cwd())
    getChangedFiles('HEAD~5', process.cwd())
    const keys = getGitCacheStats().keys
    const changedKeys = keys.filter((k) => k.startsWith('getChangedFiles:'))
    expect(changedKeys.length).toBe(2)
  })

  it('returns empty array for non-existent directory', () => {
    expect(getChangedFiles('HEAD~1', '/nonexistent/path')).toEqual([])
  })

  it('array elements are strings', () => {
    const result = getChangedFiles('HEAD~1', process.cwd())
    for (const file of result) {
      expect(typeof file).toBe('string')
    }
  })
})

describe('getDefaultBranch', () => {
  beforeEach(() => {
    clearGitCache()
  })

  afterEach(() => {
    clearGitCache()
  })

  it('returns a non-empty string for current repo', () => {
    const branch = getDefaultBranch(process.cwd())
    expect(typeof branch).toBe('string')
    expect(branch.length).toBeGreaterThan(0)
  })

  it('returns "main" for /tmp (fallback)', () => {
    expect(getDefaultBranch('/tmp')).toBe('main')
  })

  it('caches the result', () => {
    clearGitCache()
    getDefaultBranch(process.cwd())
    const keys = getGitCacheStats().keys
    expect(keys.some((k) => k.startsWith('getDefaultBranch:'))).toBe(true)
  })

  it('returns "main" for non-existent directory', () => {
    expect(getDefaultBranch('/nonexistent/path')).toBe('main')
  })

  it('returns same result on repeated calls', () => {
    const first = getDefaultBranch(process.cwd())
    const second = getDefaultBranch(process.cwd())
    expect(first).toBe(second)
  })

  it('returns a string type', () => {
    expect(typeof getDefaultBranch(process.cwd())).toBe('string')
  })
})

describe('getGitRoot', () => {
  beforeEach(() => {
    clearGitCache()
  })

  afterEach(() => {
    clearGitCache()
  })

  it('returns a string for the current repo', () => {
    const root = getGitRoot(process.cwd())
    expect(typeof root).toBe('string')
    expect(root!.length).toBeGreaterThan(0)
  })

  it('returns null for /tmp', () => {
    expect(getGitRoot('/tmp')).toBeNull()
  })

  it('returns null for non-existent directory', () => {
    expect(getGitRoot('/nonexistent/path')).toBeNull()
  })

  it('caches the result', () => {
    clearGitCache()
    getGitRoot(process.cwd())
    const keys = getGitCacheStats().keys
    expect(keys.some((k) => k.startsWith('getGitRoot:'))).toBe(true)
  })

  it('returns absolute path', () => {
    const root = getGitRoot(process.cwd())
    expect(root).toBeTruthy()
    expect(root!.startsWith('/')).toBe(true)
  })

  it('returns same root for process.cwd() and resolve(".")', () => {
    const root1 = getGitRoot(process.cwd())
    clearGitCache()
    const root2 = getGitRoot(resolve('.'))
    expect(root1).toBe(root2)
  })

  it('returns null for root directory', () => {
    expect(getGitRoot('/')).toBeNull()
  })
})
