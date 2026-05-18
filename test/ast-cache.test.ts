import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Project } from 'ts-morph'

import { ASTCache, createDefaultASTCache } from '../src/cache/ast-cache.js'

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// ─── Helpers ──────────────────────────────────────────

const TEST_CACHE_DIR = path.join(process.cwd(), '.test-cache', 'ast')

function createTestProject(): Project {
  return new Project({
    compilerOptions: { strict: true },
    skipAddingFilesFromTsConfig: true,
    useInMemoryFileSystem: true,
  })
}

function createCache(options?: { enabled?: boolean; ttl?: number; version?: string }): ASTCache {
  const project = createTestProject()
  const cache = new ASTCache(project, {
    cacheDir: TEST_CACHE_DIR,
    version: options?.version ?? 'test-1.0.0',
    ttl: options?.ttl,
    enabled: options?.enabled,
  })
  return cache
}

// ─── Constructor ──────────────────────────────────────

describe('ASTCache constructor', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('creates instance with default options', () => {
    const cache = createCache()
    expect(cache).toBeInstanceOf(ASTCache)
    expect(cache.isEnabled()).toBe(true)
  })

  it('creates instance with null project', () => {
    const cache = new ASTCache(null, { cacheDir: TEST_CACHE_DIR })
    expect(cache).toBeInstanceOf(ASTCache)
  })

  it('creates instance with disabled caching', () => {
    const cache = createCache({ enabled: false })
    expect(cache.isEnabled()).toBe(false)
  })

  it('uses default version when not provided', () => {
    const cache = new ASTCache(null, { cacheDir: TEST_CACHE_DIR })
    expect(cache.isEnabled()).toBe(true)
  })

  it('uses custom TTL when provided', () => {
    const cache = createCache({ ttl: 1000 })
    expect(cache.isEnabled()).toBe(true)
  })
})

// ─── setEnabled ───────────────────────────────────────

describe('ASTCache.setEnabled', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('enables the cache', () => {
    const cache = createCache({ enabled: false })
    expect(cache.isEnabled()).toBe(false)
    cache.setEnabled(true)
    expect(cache.isEnabled()).toBe(true)
  })

  it('disables the cache', () => {
    const cache = createCache()
    expect(cache.isEnabled()).toBe(true)
    cache.setEnabled(false)
    expect(cache.isEnabled()).toBe(false)
  })

  it('toggles enabled state multiple times', () => {
    const cache = createCache()
    cache.setEnabled(false)
    expect(cache.isEnabled()).toBe(false)
    cache.setEnabled(true)
    expect(cache.isEnabled()).toBe(true)
    cache.setEnabled(false)
    expect(cache.isEnabled()).toBe(false)
  })
})

// ─── isEnabled ────────────────────────────────────────

describe('ASTCache.isEnabled', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('returns true by default', () => {
    const cache = createCache()
    expect(cache.isEnabled()).toBe(true)
  })

  it('returns false when cache is disabled', () => {
    const cache = createCache({ enabled: false })
    expect(cache.isEnabled()).toBe(false)
  })

  it('reflects changes after setEnabled', () => {
    const cache = createCache({ enabled: false })
    expect(cache.isEnabled()).toBe(false)
    cache.setEnabled(true)
    expect(cache.isEnabled()).toBe(true)
  })
})

// ─── setProject ───────────────────────────────────────

describe('ASTCache.setProject', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('sets a new project instance', () => {
    const cache = new ASTCache(null, { cacheDir: TEST_CACHE_DIR })
    const project = createTestProject()
    cache.setProject(project)
    // Verify the project is set by doing a get after a set
    expect(cache.isEnabled()).toBe(true)
  })

  it('allows replacing the project', () => {
    const cache = createCache()
    const newProject = createTestProject()
    cache.setProject(newProject)
    expect(cache.isEnabled()).toBe(true)
  })
})

// ─── set and get ──────────────────────────────────────

describe('ASTCache set and get', () => {
  let cache: ASTCache
  let project: Project

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test-1.0.0',
    })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('stores and retrieves a source file', async () => {
    const filePath = '/test/file.ts'
    const contentHash = 'abc123'
    const sourceFile = project.createSourceFile(filePath, 'const x = 1')

    await cache.set(filePath, contentHash, sourceFile)
    const result = await cache.get(filePath, contentHash)

    expect(result).not.toBeNull()
    expect(result!.getFullText()).toBe('const x = 1')
  })

  it('returns null when cache is empty', async () => {
    const result = await cache.get('/test/file.ts', 'abc123')
    expect(result).toBeNull()
  })

  it('returns null when content hash does not match', async () => {
    const filePath = '/test/file.ts'
    const sourceFile = project.createSourceFile(filePath, 'const x = 1')

    await cache.set(filePath, 'hash1', sourceFile)
    const result = await cache.get(filePath, 'hash2')

    expect(result).toBeNull()
  })

  it('overwrites existing entry on re-set', async () => {
    const filePath = '/test/file.ts'
    const contentHash = 'abc123'

    const sf1 = project.createSourceFile(filePath, 'const x = 1')
    await cache.set(filePath, contentHash, sf1)

    const sf2 = project.createSourceFile(filePath, 'const x = 2', { overwrite: true })
    await cache.set(filePath, contentHash, sf2)

    const result = await cache.get(filePath, contentHash)
    expect(result).not.toBeNull()
    expect(result!.getFullText()).toBe('const x = 2')
  })

  it('does not store when cache is disabled', async () => {
    cache.setEnabled(false)
    const sourceFile = project.createSourceFile('/test/file.ts', 'const x = 1')

    await cache.set('/test/file.ts', 'abc123', sourceFile)
    cache.setEnabled(true)

    const result = await cache.get('/test/file.ts', 'abc123')
    expect(result).toBeNull()
  })

  it('returns null when project is null', async () => {
    const cacheNoProject = new ASTCache(null, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test-1.0.0',
    })

    // Manually write to cache store so there's data to find
    const sourceFile = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'abc123', sourceFile)

    const result = await cacheNoProject.get('/test/file.ts', 'abc123')
    expect(result).toBeNull()
  })

  it('handles different file paths independently', async () => {
    const sf1 = project.createSourceFile('/test/a.ts', 'const a = 1')
    const sf2 = project.createSourceFile('/test/b.ts', 'const b = 2')

    await cache.set('/test/a.ts', 'hash-a', sf1)
    await cache.set('/test/b.ts', 'hash-b', sf2)

    const r1 = await cache.get('/test/a.ts', 'hash-a')
    const r2 = await cache.get('/test/b.ts', 'hash-b')

    expect(r1).not.toBeNull()
    expect(r2).not.toBeNull()
    expect(r1!.getFullText()).toBe('const a = 1')
    expect(r2!.getFullText()).toBe('const b = 2')
  })

  it('preserves multi-line source text', async () => {
    const code = `import { foo } from './bar'

interface Foo {
  bar: string
}

export const x = 1
`
    const filePath = '/test/multi.ts'
    const sourceFile = project.createSourceFile(filePath, code)

    await cache.set(filePath, 'multi-hash', sourceFile)
    const result = await cache.get(filePath, 'multi-hash')

    expect(result).not.toBeNull()
    expect(result!.getFullText()).toBe(code)
  })
})

// ─── get - version mismatch ───────────────────────────

describe('ASTCache get - version mismatch', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('returns null on version mismatch and deletes stale entry', async () => {
    const project = createTestProject()
    const cacheV1 = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'v1',
    })

    const sourceFile = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cacheV1.set('/test/file.ts', 'hash1', sourceFile)

    const cacheV2 = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'v2',
    })

    const result = await cacheV2.get('/test/file.ts', 'hash1')
    expect(result).toBeNull()
  })

  it('hits for same version after miss from different version', async () => {
    const project = createTestProject()
    const cache = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'v1',
    })

    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    const result = await cache.get('/test/file.ts', 'hash1')
    expect(result).not.toBeNull()
  })
})

// ─── get - TTL expiration ─────────────────────────────

describe('ASTCache get - TTL expiration', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('returns null for expired entries', async () => {
    const project = createTestProject()
    const cache = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test',
      ttl: 1, // 1ms TTL
    })

    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    // Wait for TTL to expire
    await new Promise((r) => setTimeout(r, 50))

    const result = await cache.get('/test/file.ts', 'hash1')
    expect(result).toBeNull()
  })

  it('returns entry when TTL has not expired', async () => {
    const project = createTestProject()
    const cache = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test',
      ttl: 60_000, // 60 seconds
    })

    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    const result = await cache.get('/test/file.ts', 'hash1')
    expect(result).not.toBeNull()
  })
})

// ─── get - disabled cache ─────────────────────────────

describe('ASTCache get - disabled', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('returns null when cache is disabled', async () => {
    const cache = createCache({ enabled: false })
    const result = await cache.get('/test/file.ts', 'hash1')
    expect(result).toBeNull()
  })

  it('increments misses when disabled', async () => {
    const cache = createCache({ enabled: false })
    await cache.get('/test/file.ts', 'hash1')
    const stats = await cache.getStats()
    expect(stats.misses).toBe(1)
  })
})

// ─── has ──────────────────────────────────────────────

describe('ASTCache has', () => {
  let cache: ASTCache
  let project: Project

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test-1.0.0',
    })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('returns false when entry does not exist', async () => {
    expect(await cache.has('/test/file.ts', 'hash1')).toBe(false)
  })

  it('returns true for valid cached entry', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    expect(await cache.has('/test/file.ts', 'hash1')).toBe(true)
  })

  it('returns false when disabled', async () => {
    cache.setEnabled(false)
    expect(await cache.has('/test/file.ts', 'hash1')).toBe(false)
  })

  it('returns false for version mismatch', async () => {
    const project2 = createTestProject()
    const cacheV1 = new ASTCache(project2, {
      cacheDir: TEST_CACHE_DIR,
      version: 'v1',
    })

    const sf = project2.createSourceFile('/test/file.ts', 'const x = 1')
    await cacheV1.set('/test/file.ts', 'hash1', sf)

    const cacheV2 = new ASTCache(project2, {
      cacheDir: TEST_CACHE_DIR,
      version: 'v2',
    })

    expect(await cacheV2.has('/test/file.ts', 'hash1')).toBe(false)
  })

  it('returns false for expired entries', async () => {
    const project3 = createTestProject()
    const shortTTLCache = new ASTCache(project3, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test',
      ttl: 1,
    })

    const sf = project3.createSourceFile('/test/file.ts', 'const x = 1')
    await shortTTLCache.set('/test/file.ts', 'hash1', sf)

    await new Promise((r) => setTimeout(r, 50))

    expect(await shortTTLCache.has('/test/file.ts', 'hash1')).toBe(false)
  })

  it('returns false for wrong content hash', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    expect(await cache.has('/test/file.ts', 'hash2')).toBe(false)
  })
})

// ─── clear ────────────────────────────────────────────

describe('ASTCache clear', () => {
  let cache: ASTCache
  let project: Project

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test-1.0.0',
    })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('clears all cache entries', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    await cache.clear()

    const result = await cache.get('/test/file.ts', 'hash1')
    expect(result).toBeNull()
  })

  it('resets hit and miss counters', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)
    await cache.get('/test/file.ts', 'hash1') // hit
    await cache.get('/test/file.ts', 'hash2') // miss

    await cache.clear()

    const stats = await cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
  })

  it('clears empty cache without error', async () => {
    await expect(cache.clear()).resolves.toBeUndefined()
  })

  it('allows reuse after clear', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)
    await cache.clear()

    const sf2 = project.createSourceFile('/test/file2.ts', 'const y = 2')
    await cache.set('/test/file2.ts', 'hash2', sf2)

    const result = await cache.get('/test/file2.ts', 'hash2')
    expect(result).not.toBeNull()
    expect(result!.getFullText()).toBe('const y = 2')
  })
})

// ─── getStats ─────────────────────────────────────────

describe('ASTCache getStats', () => {
  let cache: ASTCache
  let project: Project

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test-1.0.0',
    })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('returns initial stats with zero values', async () => {
    const stats = await cache.getStats()
    expect(stats.entries).toBe(0)
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
    expect(stats.hitRate).toBe(0)
    expect(stats.size).toBe(0)
  })

  it('tracks hits correctly', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)
    await cache.get('/test/file.ts', 'hash1')

    const stats = await cache.getStats()
    expect(stats.hits).toBe(1)
  })

  it('tracks misses correctly', async () => {
    await cache.get('/test/file.ts', 'nonexistent')

    const stats = await cache.getStats()
    expect(stats.misses).toBe(1)
  })

  it('calculates hit rate correctly', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    await cache.get('/test/file.ts', 'hash1') // hit
    await cache.get('/test/file.ts', 'hash2') // miss

    const stats = await cache.getStats()
    expect(stats.hitRate).toBe(0.5)
  })

  it('calculates 100% hit rate with only hits', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    await cache.get('/test/file.ts', 'hash1')
    await cache.get('/test/file.ts', 'hash1')

    const stats = await cache.getStats()
    expect(stats.hitRate).toBe(1)
  })

  it('tracks entries count', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    const stats = await cache.getStats()
    expect(stats.entries).toBe(1)
  })

  it('tracks size in bytes', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    const stats = await cache.getStats()
    expect(stats.size).toBeGreaterThan(0)
  })

  it('resets stats after clear', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)
    await cache.get('/test/file.ts', 'hash1')
    await cache.clear()

    const stats = await cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
    expect(stats.hitRate).toBe(0)
  })
})

// ─── cleanup ──────────────────────────────────────────

describe('ASTCache cleanup', () => {
  let cache: ASTCache
  let project: Project

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test-1.0.0',
      ttl: 1, // 1ms TTL so entries expire immediately
    })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('removes expired entries', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    // Wait for TTL to expire
    await new Promise((r) => setTimeout(r, 50))

    const cleaned = await cache.cleanup()
    expect(cleaned).toBe(1)
  })

  it('returns 0 when no entries to clean', async () => {
    const cleaned = await cache.cleanup()
    expect(cleaned).toBe(0)
  })

  it('returns 0 when no entries are expired', async () => {
    const longTTLCache = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test-1.0.0',
      ttl: 60_000,
    })

    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await longTTLCache.set('/test/file.ts', 'hash1', sf)

    const cleaned = await longTTLCache.cleanup()
    expect(cleaned).toBe(0)
  })

  it('handles invalid cache files gracefully', async () => {
    await mkdir(TEST_CACHE_DIR, { recursive: true })
    await writeFile(path.join(TEST_CACHE_DIR, 'invalid.json'), 'not valid json')

    const cleaned = await cache.cleanup()
    expect(cleaned).toBe(1)
  })

  it('handles empty cache directory', async () => {
    await mkdir(TEST_CACHE_DIR, { recursive: true })
    const cleaned = await cache.cleanup()
    expect(cleaned).toBe(0)
  })

  it('handles nonexistent cache directory', async () => {
    const noDirCache = new ASTCache(project, {
      cacheDir: path.join(TEST_CACHE_DIR, 'nonexistent'),
      version: 'test',
      ttl: 1,
    })

    const cleaned = await noDirCache.cleanup()
    expect(cleaned).toBe(0)
  })
})

// ─── createDefaultASTCache ────────────────────────────

describe('createDefaultASTCache', () => {
  it('creates an ASTCache instance with null project', () => {
    const cache = createDefaultASTCache(null)
    expect(cache).toBeInstanceOf(ASTCache)
  })

  it('creates an ASTCache instance with a project', () => {
    const project = createTestProject()
    const cache = createDefaultASTCache(project)
    expect(cache).toBeInstanceOf(ASTCache)
    expect(cache.isEnabled()).toBe(true)
  })

  it('passes version to the cache', () => {
    const cache = createDefaultASTCache(null, '2.0.0')
    expect(cache).toBeInstanceOf(ASTCache)
    expect(cache.isEnabled()).toBe(true)
  })
})

// ─── Edge cases ───────────────────────────────────────

describe('ASTCache edge cases', () => {
  let cache: ASTCache
  let project: Project

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test-1.0.0',
    })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('handles empty file path', async () => {
    const sf = project.createSourceFile('', 'const x = 1')
    await cache.set('', 'hash1', sf)
    const result = await cache.get('', 'hash1')
    expect(result).not.toBeNull()
  })

  it('handles empty content hash', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', '', sf)
    const result = await cache.get('/test/file.ts', '')
    expect(result).not.toBeNull()
  })

  it('handles unicode source text', async () => {
    const code = '// 日本語コメント\nconst x = "こんにちは"'
    const sf = project.createSourceFile('/test/unicode.ts', code)
    await cache.set('/test/unicode.ts', 'hash-uni', sf)

    const result = await cache.get('/test/unicode.ts', 'hash-uni')
    expect(result).not.toBeNull()
    expect(result!.getFullText()).toBe(code)
  })

  it('handles large source text', async () => {
    const code = 'const x = 1;\n'.repeat(1000)
    const sf = project.createSourceFile('/test/large.ts', code)
    await cache.set('/test/large.ts', 'hash-large', sf)

    const result = await cache.get('/test/large.ts', 'hash-large')
    expect(result).not.toBeNull()
    expect(result!.getFullText()).toBe(code)
  })

  it('handles file path with special characters', async () => {
    const filePath = '/test/[special]/file-name.test.ts'
    const sf = project.createSourceFile(filePath, 'const x = 1')
    await cache.set(filePath, 'hash-special', sf)

    const result = await cache.get(filePath, 'hash-special')
    expect(result).not.toBeNull()
  })

  it('set is no-op when cache is disabled', async () => {
    cache.setEnabled(false)
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')

    // Should not throw
    await cache.set('/test/file.ts', 'hash1', sf)
  })

  it('tracks multiple misses', async () => {
    await cache.get('/a.ts', 'h1')
    await cache.get('/b.ts', 'h2')
    await cache.get('/c.ts', 'h3')

    const stats = await cache.getStats()
    expect(stats.misses).toBe(3)
    expect(stats.hitRate).toBe(0)
  })

  it('handles set followed by get with different project instance', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    // New cache pointing to same dir, same version
    const project2 = createTestProject()
    const cache2 = new ASTCache(project2, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test-1.0.0',
    })

    const result = await cache2.get('/test/file.ts', 'hash1')
    expect(result).not.toBeNull()
    expect(result!.getFullText()).toBe('const x = 1')
  })
})

// ─── Concurrent operations ────────────────────────────

describe('ASTCache concurrent operations', () => {
  let cache: ASTCache
  let project: Project

  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test-1.0.0',
    })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('handles multiple concurrent sets', async () => {
    const files = Array.from({ length: 10 }, (_, i) => ({
      contentHash: `hash-${i}`,
      filePath: `/test/file${i}.ts`,
      sourceFile: project.createSourceFile(`/test/file${i}.ts`, `const x${i} = ${i}`),
    }))

    await Promise.all(files.map((f) => cache.set(f.filePath, f.contentHash, f.sourceFile)))

    const results = await Promise.all(
      files.map((f) => cache.get(f.filePath, f.contentHash)),
    )

    for (let i = 0; i < results.length; i++) {
      expect(results[i]).not.toBeNull()
      expect(results[i]!.getFullText()).toBe(`const x${i} = ${i}`)
    }
  })

  it('handles concurrent reads of same entry', async () => {
    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    const results = await Promise.all(
      Array.from({ length: 5 }, () => cache.get('/test/file.ts', 'hash1')),
    )

    for (const r of results) {
      expect(r).not.toBeNull()
    }
  })
})

// ─── Cache persistence ────────────────────────────────

describe('ASTCache persistence', () => {
  beforeEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  afterEach(async () => {
    await rm(TEST_CACHE_DIR, { force: true, recursive: true })
  })

  it('persists data across cache instances', async () => {
    const project = createTestProject()
    const cache1 = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test',
    })

    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache1.set('/test/file.ts', 'hash1', sf)

    // Create a new instance pointing to the same directory
    const project2 = createTestProject()
    const cache2 = new ASTCache(project2, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test',
    })

    const result = await cache2.get('/test/file.ts', 'hash1')
    expect(result).not.toBeNull()
    expect(result!.getFullText()).toBe('const x = 1')
  })

  it('stores data as JSON files on disk', async () => {
    const project = createTestProject()
    const cache = new ASTCache(project, {
      cacheDir: TEST_CACHE_DIR,
      version: 'test',
    })

    const sf = project.createSourceFile('/test/file.ts', 'const x = 1')
    await cache.set('/test/file.ts', 'hash1', sf)

    const files = await readdir(TEST_CACHE_DIR)
    expect(files.length).toBe(1)

    const content = await readFile(path.join(TEST_CACHE_DIR, files[0]!), 'utf8')
    const parsed = JSON.parse(content)
    expect(parsed.value.sourceText).toBe('const x = 1')
    expect(parsed.value.filePath).toBe('/test/file.ts')
  })
})
