import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ASTCache, createDefaultASTCache } from '../../src/cache/ast-cache.js'

import { hashContent } from '../../src/cache/index.js'

// Use ts-morph with in-memory file system for get() tests
let tsMorphProject: typeof import('ts-morph')
async function getProject() {
  if (!tsMorphProject) {
    tsMorphProject = await import('ts-morph')
  }
  return new tsMorphProject.Project({ useInMemoryFileSystem: true })
}

// ─── Helpers ───

let tmpDir: string

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), 'ast-cache-test-'))
})

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true })
})

function mockSourceFile(text: string) {
  return { getFullText: vi.fn().mockReturnValue(text) } as unknown as import('ts-morph').SourceFile
}

// ─── Constructor ───

describe('ASTCache constructor', () => {
  it('uses defaults when no options provided', async () => {
    const project = await getProject()
    const cache = new ASTCache(project)
    expect(cache.isEnabled()).toBe(true)
  })

  it('accepts custom options', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, {
      cacheDir: tmpDir,
      enabled: false,
      ttl: 1000,
      version: '2.0.0',
    })
    expect(cache.isEnabled()).toBe(false)
  })

  it('can be created disabled', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, { enabled: false })
    expect(cache.isEnabled()).toBe(false)
  })

  it('accepts null project', () => {
    const cache = new ASTCache(null, { cacheDir: tmpDir })
    expect(cache.isEnabled()).toBe(true)
  })
})

// ─── isEnabled / setEnabled ───

describe('ASTCache isEnabled / setEnabled', () => {
  it('toggles enabled state', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, { cacheDir: tmpDir })
    expect(cache.isEnabled()).toBe(true)
    cache.setEnabled(false)
    expect(cache.isEnabled()).toBe(false)
    cache.setEnabled(true)
    expect(cache.isEnabled()).toBe(true)
  })
})

// ─── set ───

describe('ASTCache set', () => {
  it('stores an entry with sourceText', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, { cacheDir: tmpDir })
    const contentHash = hashContent('const x = 1')
    const sf = mockSourceFile('const x = 1')

    await cache.set('/src/file.ts', contentHash, sf)

    // Verify via has()
    expect(await cache.has('/src/file.ts', contentHash)).toBe(true)
  })

  it('does nothing when disabled', async () => {
    const cache = new ASTCache(null, { cacheDir: tmpDir, enabled: false })
    const contentHash = hashContent('const x = 1')
    const sf = mockSourceFile('const x = 1')

    await cache.set('/src/file.ts', contentHash, sf)
    expect(await cache.has('/src/file.ts', contentHash)).toBe(false)
  })
})

// ─── get ───

describe('ASTCache get', () => {
  it('returns null on cache miss (no entry)', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, { cacheDir: tmpDir })
    const result = await cache.get('/src/file.ts', hashContent('missing'))
    expect(result).toBeNull()
  })

  it('returns SourceFile on cache hit with project', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, { cacheDir: tmpDir })
    const content = 'const x = 1;'
    const contentHash = hashContent(content)
    const sf = mockSourceFile(content)

    await cache.set('/src/file.ts', contentHash, sf)
    const result = await cache.get('/src/file.ts', contentHash)

    expect(result).not.toBeNull()
    expect(result!.getFullText()).toBe(content)
  })

  it('returns null on version mismatch', async () => {
    const project = await getProject()
    const cacheV1 = new ASTCache(project, { cacheDir: tmpDir, version: '1.0.0' })
    const cacheV2 = new ASTCache(project, { cacheDir: tmpDir, version: '2.0.0' })
    const contentHash = hashContent('const x = 1')
    const sf = mockSourceFile('const x = 1')

    await cacheV1.set('/src/file.ts', contentHash, sf)
    const result = await cacheV2.get('/src/file.ts', contentHash)

    expect(result).toBeNull()
  })

  it('returns null on contentHash mismatch', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, { cacheDir: tmpDir })
    const hash1 = hashContent('content v1')
    const hash2 = hashContent('content v2')
    const sf = mockSourceFile('content v1')

    await cache.set('/src/file.ts', hash1, sf)
    const result = await cache.get('/src/file.ts', hash2)

    expect(result).toBeNull()
  })

  it('returns null when TTL has expired', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, { cacheDir: tmpDir, ttl: 1 })
    const contentHash = hashContent('const x = 1')
    const sf = mockSourceFile('const x = 1')

    await cache.set('/src/file.ts', contentHash, sf)
    await new Promise((resolve) => setTimeout(resolve, 50))

    const result = await cache.get('/src/file.ts', contentHash)
    expect(result).toBeNull()
  })

  it('returns null when no project is set', async () => {
    const cacheWithProject = new ASTCache(await getProject(), { cacheDir: tmpDir })
    const contentHash = hashContent('const x = 1')
    const sf = mockSourceFile('const x = 1')

    await cacheWithProject.set('/src/file.ts', contentHash, sf)

    // Create new cache without project but same cacheDir
    const cacheNoProject = new ASTCache(null, { cacheDir: tmpDir })
    const result = await cacheNoProject.get('/src/file.ts', contentHash)

    expect(result).toBeNull()
  })
})

// ─── has ───

describe('ASTCache has', () => {
  it('returns true for valid cached entry', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, { cacheDir: tmpDir })
    const contentHash = hashContent('const x = 1')
    const sf = mockSourceFile('const x = 1')

    await cache.set('/src/file.ts', contentHash, sf)
    expect(await cache.has('/src/file.ts', contentHash)).toBe(true)
  })

  it('returns false when disabled', async () => {
    const cache = new ASTCache(null, { cacheDir: tmpDir, enabled: false })
    expect(await cache.has('/src/file.ts', 'hash')).toBe(false)
  })

  it('returns false for missing entry', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, { cacheDir: tmpDir })
    expect(await cache.has('/src/missing.ts', 'hash')).toBe(false)
  })
})

// ─── clear ───

describe('ASTCache clear', () => {
  it('clears entries and resets stats', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, { cacheDir: tmpDir })
    const contentHash = hashContent('const x = 1')
    const sf = mockSourceFile('const x = 1')

    await cache.set('/src/file.ts', contentHash, sf)
    await cache.get('/src/file.ts', contentHash)

    await cache.clear()

    const stats = await cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
    expect(stats.entries).toBe(0)
  })
})

// ─── getStats ───

describe('ASTCache getStats', () => {
  it('tracks hits and misses', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, { cacheDir: tmpDir })
    const contentHash = hashContent('const x = 1')

    // Miss
    await cache.get('/src/file.ts', contentHash)
    let stats = await cache.getStats()
    expect(stats.misses).toBe(1)
    expect(stats.hits).toBe(0)
    expect(stats.hitRate).toBe(0)

    // Set and hit
    const sf = mockSourceFile('const x = 1')
    await cache.set('/src/file.ts', contentHash, sf)
    await cache.get('/src/file.ts', contentHash)
    stats = await cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBe(0.5)
  })
})

// ─── cleanup ───

describe('ASTCache cleanup', () => {
  it('removes expired entries', async () => {
    const project = await getProject()
    const cache = new ASTCache(project, { cacheDir: tmpDir, ttl: 1 })
    const contentHash = hashContent('const x = 1')
    const sf = mockSourceFile('const x = 1')

    await cache.set('/src/old.ts', contentHash, sf)
    await new Promise((resolve) => setTimeout(resolve, 50))

    const cleaned = await cache.cleanup()
    expect(cleaned).toBeGreaterThanOrEqual(1)
  })
})

// ─── setProject ───

describe('ASTCache setProject', () => {
  it('sets project after construction', async () => {
    const cache = new ASTCache(null, { cacheDir: tmpDir })
    const content = 'const y = 2;'
    const contentHash = hashContent(content)
    const sf = mockSourceFile(content)

    // Set entry while no project
    await cache.set('/src/file.ts', contentHash, sf)

    // Get without project → miss
    const resultBefore = await cache.get('/src/file.ts', contentHash)
    expect(resultBefore).toBeNull()

    // Set project and get again
    const project = await getProject()
    cache.setProject(project)

    const resultAfter = await cache.get('/src/file.ts', contentHash)
    expect(resultAfter).not.toBeNull()
    expect(resultAfter!.getFullText()).toBe(content)
  })
})

// ─── createDefaultASTCache ───

describe('createDefaultASTCache', () => {
  it('creates an ASTCache instance', async () => {
    const project = await getProject()
    const cache = createDefaultASTCache(project)
    expect(cache).toBeInstanceOf(ASTCache)
  })

  it('passes version to the cache', async () => {
    const project = await getProject()
    const cache = createDefaultASTCache(project, '3.0.0')
    expect(cache).toBeInstanceOf(ASTCache)
    expect(cache.isEnabled()).toBe(true)
  })

  it('accepts null project', () => {
    const cache = createDefaultASTCache(null)
    expect(cache).toBeInstanceOf(ASTCache)
  })
})
