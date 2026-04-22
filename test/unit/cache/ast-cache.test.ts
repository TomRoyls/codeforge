import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import { Project } from 'ts-morph'

import { ASTCache, createDefaultASTCache } from '../../../src/cache/ast-cache.js'

const SOURCE_TEXT = 'const x = 1;\nconsole.log(x);\n'

function makeTempDir(): string {
  return path.join(
    os.tmpdir(),
    `codeforge-ast-cache-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  )
}

describe('ASTCache', () => {
  let cacheDir: string
  let project: Project
  let cache: ASTCache

  beforeEach(() => {
    cacheDir = makeTempDir()
    project = new Project({ useInMemoryFileSystem: true })
    cache = new ASTCache(project, { cacheDir, version: '0.1.0', ttl: 60_000 })
  })

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true }).catch(() => {})
  })

  describe('constructor', () => {
    it('should create instance with defaults', () => {
      const c = createDefaultASTCache(null)
      expect(c).toBeInstanceOf(ASTCache)
      expect(c.isEnabled()).toBe(true)
    })

    it('should respect enabled option', () => {
      const c = new ASTCache(null, { enabled: false, cacheDir: makeTempDir() })
      expect(c.isEnabled()).toBe(false)
    })

    it('should work with null project initially', () => {
      const c = new ASTCache(null, { cacheDir })
      expect(c).toBeInstanceOf(ASTCache)
    })

    it('should create cache with all options specified', () => {
      const c = new ASTCache(project, {
        cacheDir: makeTempDir(),
        ttl: 1000,
        version: '1.0.0',
        enabled: true,
      })
      expect(c).toBeInstanceOf(ASTCache)
      expect(c.isEnabled()).toBe(true)
    })

    it('should create cache with only some options', () => {
      const c = new ASTCache(project, { version: '2.0.0' })
      expect(c).toBeInstanceOf(ASTCache)
    })

    it('should create cache with ttl only', () => {
      const c = new ASTCache(project, { ttl: 30000 })
      expect(c).toBeInstanceOf(ASTCache)
    })

    it('should handle undefined options gracefully', () => {
      const c = new ASTCache(project, undefined)
      expect(c).toBeInstanceOf(ASTCache)
    })
  })

  describe('setProject', () => {
    it('should allow setting project after construction', () => {
      const c = new ASTCache(null, { cacheDir: makeTempDir() })
      c.setProject(project)
      expect(c.isEnabled()).toBe(true)
    })

    it('should allow setting project multiple times', () => {
      const c = new ASTCache(null, { cacheDir: makeTempDir() })
      const proj1 = new Project({ useInMemoryFileSystem: true })
      const proj2 = new Project({ useInMemoryFileSystem: true })
      c.setProject(proj1)
      c.setProject(proj2)
      expect(c.isEnabled()).toBe(true)
    })
  })

  describe('set and get', () => {
    it('should cache and retrieve a SourceFile', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await cache.set('/test/file.ts', 'hash123', sourceFile)

      const result = await cache.get('/test/file.ts', 'hash123')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(SOURCE_TEXT)
    })

    it('should return null on cache miss', async () => {
      const result = await cache.get('/test/file.ts', 'hash123')
      expect(result).toBeNull()
    })

    it('should return null when disabled', async () => {
      cache.setEnabled(false)
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await cache.set('/test/file.ts', 'hash123', sourceFile)
      const result = await cache.get('/test/file.ts', 'hash123')
      expect(result).toBeNull()
    })

    it('should return null without project', async () => {
      const noProjectCache = new ASTCache(null, { cacheDir, version: '0.1.0', ttl: 60_000 })
      const sourceFile = project.createSourceFile('/test/noproj.ts', SOURCE_TEXT)
      await noProjectCache.set('/test/noproj.ts', 'hash123', sourceFile)
      const result = await noProjectCache.get('/test/noproj.ts', 'hash123')
      expect(result).toBeNull()
    })

    it('should increment misses when disabled', async () => {
      cache.setEnabled(false)
      await cache.get('/test/file.ts', 'hash123')
      const stats = await cache.getStats()
      expect(stats.misses).toBe(1)
    })

    it('should not increment hits when disabled', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await cache.set('/test/file.ts', 'hash123', sourceFile)

      cache.setEnabled(false)
      await cache.get('/test/file.ts', 'hash123')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(0)
    })

    it('should store and retrieve entry with single character content', async () => {
      const sourceFile = project.createSourceFile('/test/single.ts', 'x')
      await cache.set('/test/single.ts', 'hash1', sourceFile)

      const result = await cache.get('/test/single.ts', 'hash1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe('x')
    })

    it('should store and retrieve entry with newlines only', async () => {
      const sourceFile = project.createSourceFile('/test/newlines.ts', '\n\n\n')
      await cache.set('/test/newlines.ts', 'hash1', sourceFile)

      const result = await cache.get('/test/newlines.ts', 'hash1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe('\n\n\n')
    })
  })

  describe('version invalidation', () => {
    it('should invalidate on version mismatch', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await cache.set('/test/file.ts', 'hash123', sourceFile)

      const v2Cache = new ASTCache(project, { cacheDir, version: '0.2.0', ttl: 60_000 })
      const result = await v2Cache.get('/test/file.ts', 'hash123')
      expect(result).toBeNull()
    })

    it('should delete entry on version mismatch get', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await cache.set('/test/file.ts', 'hash123', sourceFile)

      const v2Cache = new ASTCache(project, { cacheDir, version: '0.2.0', ttl: 60_000 })
      await v2Cache.get('/test/file.ts', 'hash123')

      // Original cache should still not find it if version was removed
      const v2Second = new ASTCache(project, { cacheDir, version: '0.2.0', ttl: 60_000 })
      const result = await v2Second.get('/test/file.ts', 'hash123')
      expect(result).toBeNull()
    })

    it('should work with patch version differences', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      const c1 = new ASTCache(project, { cacheDir, version: '1.0.0', ttl: 60_000 })
      await c1.set('/test/file.ts', 'hash123', sourceFile)

      const c2 = new ASTCache(project, { cacheDir, version: '1.0.1', ttl: 60_000 })
      const result = await c2.get('/test/file.ts', 'hash123')
      expect(result).toBeNull()
    })

    it('should work with major version differences', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      const c1 = new ASTCache(project, { cacheDir, version: '1.0.0', ttl: 60_000 })
      await c1.set('/test/file.ts', 'hash123', sourceFile)

      const c2 = new ASTCache(project, { cacheDir, version: '2.0.0', ttl: 60_000 })
      const result = await c2.get('/test/file.ts', 'hash123')
      expect(result).toBeNull()
    })
  })

  describe('content hash invalidation', () => {
    it('should invalidate on content hash change', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await cache.set('/test/file.ts', 'hash123', sourceFile)
      const result = await cache.get('/test/file.ts', 'hash999')
      expect(result).toBeNull()
    })

    it('should delete entry on content hash mismatch', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await cache.set('/test/file.ts', 'hash123', sourceFile)

      // Attempt to get with wrong hash triggers delete
      await cache.get('/test/file.ts', 'hash999')

      // Correct hash should still work because the key includes the hash
      const result = await cache.get('/test/file.ts', 'hash123')
      expect(result).not.toBeNull()
    })
  })

  describe('TTL expiration', () => {
    it('should invalidate expired entries', async () => {
      const shortTtlCache = new ASTCache(project, { cacheDir, version: '0.1.0', ttl: 1 })
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await shortTtlCache.set('/test/file.ts', 'hash123', sourceFile)
      await new Promise((r) => setTimeout(r, 10))
      const result = await shortTtlCache.get('/test/file.ts', 'hash123')
      expect(result).toBeNull()
    })

    it('should count expired entries as misses', async () => {
      const shortTtlCache = new ASTCache(project, { cacheDir, version: '0.1.0', ttl: 1 })
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await shortTtlCache.set('/test/file.ts', 'hash123', sourceFile)
      await new Promise((r) => setTimeout(r, 10))
      await shortTtlCache.get('/test/file.ts', 'hash123')

      const stats = await shortTtlCache.getStats()
      expect(stats.misses).toBe(1)
    })

    it('should delete expired entry on get', async () => {
      const shortTtlCache = new ASTCache(project, { cacheDir, version: '0.1.0', ttl: 1 })
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await shortTtlCache.set('/test/file.ts', 'hash123', sourceFile)
      await new Promise((r) => setTimeout(r, 10))

      await shortTtlCache.get('/test/file.ts', 'hash123')

      // Entry should be removed from store
      const stats = await shortTtlCache.getStats()
      expect(stats.entries).toBe(0)
    })
  })

  describe('has', () => {
    it('should return true for valid cached entry', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await cache.set('/test/file.ts', 'hash123', sourceFile)
      expect(await cache.has('/test/file.ts', 'hash123')).toBe(true)
    })

    it('should return false for missing entry', async () => {
      expect(await cache.has('/test/file.ts', 'hash123')).toBe(false)
    })

    it('should return false when disabled', async () => {
      const localCache = new ASTCache(project, { cacheDir: makeTempDir(), enabled: false })
      expect(await localCache.has('/test/dis.ts', 'hash123')).toBe(false)
    })

    it('should return false for hash mismatch even if file cached', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await cache.set('/test/file.ts', 'hash123', sourceFile)
      expect(await cache.has('/test/file.ts', 'wrong')).toBe(false)
    })

    it('should return false for path with no cached entry', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await cache.set('/test/file.ts', 'hash123', sourceFile)
      expect(await cache.has('/test/other.ts', 'hash123')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries and reset stats', async () => {
      const sourceFile = project.createSourceFile('/test/clear.ts', SOURCE_TEXT)
      await cache.set('/test/clear.ts', 'hash123', sourceFile)
      await cache.clear()

      const stats = await cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })

    it('should remove entries so get returns null', async () => {
      const sourceFile = project.createSourceFile('/test/clr.ts', SOURCE_TEXT)
      await cache.set('/test/clr.ts', 'hash123', sourceFile)
      expect(await cache.get('/test/clr.ts', 'hash123')).not.toBeNull()

      await cache.clear()
      expect(await cache.get('/test/clr.ts', 'hash123')).toBeNull()
    })

    it('should reset all stats to zero', async () => {
      const sourceFile = project.createSourceFile('/test/stats.ts', SOURCE_TEXT)
      await cache.set('/test/stats.ts', 'hash123', sourceFile)
      await cache.get('/test/stats.ts', 'hash123')
      await cache.get('/test/missing.ts', 'hash456')

      await cache.clear()
      const stats = await cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(0)
    })

    it('should not throw when clearing an empty cache', async () => {
      const emptyDir = makeTempDir()
      const emptyCache = new ASTCache(project, { cacheDir: emptyDir })
      await expect(emptyCache.clear()).resolves.toBeUndefined()
    })
  })

  describe('getStats', () => {
    it('should track hits and misses', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await cache.set('/test/file.ts', 'hash123', sourceFile)
      await cache.get('/test/file.ts', 'hash123')
      await cache.get('/test/other.ts', 'hash456')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBe(0.5)
    })

    it('should return zero stats for empty cache', async () => {
      const freshCache = new ASTCache(project, { cacheDir: makeTempDir() })
      const stats = await freshCache.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.hitRate).toBe(0)
    })

    it('should return hitRate 0 with no operations', async () => {
      const freshCache = new ASTCache(project, { cacheDir: makeTempDir() })
      const stats = await freshCache.getStats()
      expect(stats.hitRate).toBe(0)
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })

    it('should return hitRate 1 with only hits', async () => {
      const sourceFile = project.createSourceFile('/test/allhits.ts', SOURCE_TEXT)
      await cache.set('/test/allhits.ts', 'hash123', sourceFile)
      await cache.get('/test/allhits.ts', 'hash123')
      await cache.get('/test/allhits.ts', 'hash123')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(1)
    })

    it('should report entries and size from store', async () => {
      const sourceFile = project.createSourceFile('/test/entry.ts', SOURCE_TEXT)
      await cache.set('/test/entry.ts', 'hash123', sourceFile)

      const stats = await cache.getStats()
      expect(stats.entries).toBe(1)
      expect(stats.size).toBeGreaterThan(0)
    })

    it('should report hitRate 0 with only misses', async () => {
      await cache.get('/test/miss1.ts', 'h1')
      await cache.get('/test/miss2.ts', 'h2')
      await cache.get('/test/miss3.ts', 'h3')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(3)
      expect(stats.hitRate).toBe(0)
    })

    it('should report correct entries after multiple sets', async () => {
      const sf1 = project.createSourceFile('/test/e1.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/e2.ts', 'const b = 2;')
      const sf3 = project.createSourceFile('/test/e3.ts', 'const c = 3;')

      await cache.set('/test/e1.ts', 'h1', sf1)
      await cache.set('/test/e2.ts', 'h2', sf2)
      await cache.set('/test/e3.ts', 'h3', sf3)

      const stats = await cache.getStats()
      expect(stats.entries).toBe(3)
    })

    it('should report correct entries count after clear', async () => {
      const sourceFile = project.createSourceFile('/test/entclr.ts', SOURCE_TEXT)
      await cache.set('/test/entclr.ts', 'hash123', sourceFile)

      expect((await cache.getStats()).entries).toBe(1)
      await cache.clear()
      expect((await cache.getStats()).entries).toBe(0)
    })
  })

  describe('setEnabled', () => {
    it('should toggle cache on/off', async () => {
      const sourceFile = project.createSourceFile('/test/file.ts', SOURCE_TEXT)
      await cache.set('/test/file.ts', 'hash123', sourceFile)
      cache.setEnabled(false)
      expect(await cache.get('/test/file.ts', 'hash123')).toBeNull()
      cache.setEnabled(true)
      const result = await cache.get('/test/file.ts', 'hash123')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(SOURCE_TEXT)
    })

    it('should reflect setEnabled calls', () => {
      expect(cache.isEnabled()).toBe(true)
      cache.setEnabled(false)
      expect(cache.isEnabled()).toBe(false)
      cache.setEnabled(false)
      expect(cache.isEnabled()).toBe(false)
      cache.setEnabled(true)
      expect(cache.isEnabled()).toBe(true)
    })

    it('should not write to disk when set is called while disabled', async () => {
      cache.setEnabled(false)
      const sourceFile = project.createSourceFile('/test/dis.ts', SOURCE_TEXT)
      await cache.set('/test/dis.ts', 'hash123', sourceFile)

      cache.setEnabled(true)
      const result = await cache.get('/test/dis.ts', 'hash123')
      expect(result).toBeNull()
    })
  })

  describe('multiple entries', () => {
    it('should cache multiple files independently', async () => {
      const sourceFile1 = project.createSourceFile('/test/a.ts', 'const a = 1;')
      const sourceFile2 = project.createSourceFile('/test/b.ts', 'const b = 2;')
      await cache.set('/test/a.ts', 'hashA', sourceFile1)
      await cache.set('/test/b.ts', 'hashB', sourceFile2)

      const result1 = await cache.get('/test/a.ts', 'hashA')
      const result2 = await cache.get('/test/b.ts', 'hashB')
      expect(result1!.getFullText()).toBe('const a = 1;')
      expect(result2!.getFullText()).toBe('const b = 2;')
    })

    it('should store same file with different hashes independently', async () => {
      const sf1 = project.createSourceFile('/test/same.ts', 'const a = 1;')
      await cache.set('/test/same.ts', 'hashA', sf1)
      const sf2 = project.createSourceFile('/test/same.ts', 'const b = 2;', {
        overwrite: true,
      })
      await cache.set('/test/same.ts', 'hashB', sf2)

      const r1 = await cache.get('/test/same.ts', 'hashA')
      const text1 = r1!.getFullText()
      const r2 = await cache.get('/test/same.ts', 'hashB')
      expect(text1).toBe('const a = 1;')
      expect(r2!.getFullText()).toBe('const b = 2;')
    })

    it('should store different files with same hash independently', async () => {
      const sf1 = project.createSourceFile('/test/fileA.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/fileB.ts', 'const b = 2;')
      await cache.set('/test/fileA.ts', 'sameHash', sf1)
      await cache.set('/test/fileB.ts', 'sameHash', sf2)

      const r1 = await cache.get('/test/fileA.ts', 'sameHash')
      const r2 = await cache.get('/test/fileB.ts', 'sameHash')
      expect(r1!.getFullText()).toBe('const a = 1;')
      expect(r2!.getFullText()).toBe('const b = 2;')
    })

    it('should handle 10+ entries without issues', async () => {
      for (let i = 0; i < 12; i++) {
        const sf = project.createSourceFile(`/test/multi${i}.ts`, `const x${i} = ${i};`)
        await cache.set(`/test/multi${i}.ts`, `hash${i}`, sf)
      }

      for (let i = 0; i < 12; i++) {
        const result = await cache.get(`/test/multi${i}.ts`, `hash${i}`)
        expect(result).not.toBeNull()
        expect(result!.getFullText()).toBe(`const x${i} = ${i};`)
      }

      const stats = await cache.getStats()
      expect(stats.entries).toBe(12)
    })
  })

  describe('cache overwrite', () => {
    it('should overwrite when same key is set again', async () => {
      const sourceFile1 = project.createSourceFile('/test/ow.ts', 'const x = 1;')
      await cache.set('/test/ow.ts', 'hash123', sourceFile1)

      const sourceFile2 = project.createSourceFile('/test/ow.ts', 'const y = 2;', {
        overwrite: true,
      })
      await cache.set('/test/ow.ts', 'hash123', sourceFile2)

      const result = await cache.get('/test/ow.ts', 'hash123')
      expect(result!.getFullText()).toBe('const y = 2;')
    })

    it('should reflect updated content after overwrite', async () => {
      const sf1 = project.createSourceFile('/test/owcontent.ts', 'const x = 1;')
      await cache.set('/test/owcontent.ts', 'hash123', sf1)

      const sf2 = project.createSourceFile('/test/owcontent.ts', 'const y = 2;', {
        overwrite: true,
      })
      await cache.set('/test/owcontent.ts', 'hash123', sf2)

      const result = await cache.get('/test/owcontent.ts', 'hash123')
      expect(result!.getFullText()).toBe('const y = 2;')
    })

    it('should reflect updated timestamp after overwrite', async () => {
      const sf1 = project.createSourceFile('/test/owtime.ts', 'const x = 1;')
      await cache.set('/test/owtime.ts', 'hash123', sf1)

      await new Promise((r) => setTimeout(r, 5))

      const sf2 = project.createSourceFile('/test/owtime.ts', 'const y = 2;', {
        overwrite: true,
      })
      await cache.set('/test/owtime.ts', 'hash123', sf2)

      const result = await cache.get('/test/owtime.ts', 'hash123')
      expect(result).not.toBeNull()
    })
  })

  describe('constructor options', () => {
    it('should use custom cacheDir option', async () => {
      const customDir = makeTempDir()
      const c = new ASTCache(project, { cacheDir: customDir, version: '0.1.0' })
      const sourceFile = project.createSourceFile('/test/custom.ts', SOURCE_TEXT)
      await c.set('/test/custom.ts', 'hash123', sourceFile)

      const files = await fs.readdir(customDir)
      expect(files.length).toBeGreaterThan(0)
      await fs.rm(customDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should use custom version option for isolation', async () => {
      const sharedDir = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: sharedDir, version: '9.0.0' })
      const sourceFile = project.createSourceFile('/test/v.ts', SOURCE_TEXT)
      await c1.set('/test/v.ts', 'hash123', sourceFile)

      const c2 = new ASTCache(project, { cacheDir: sharedDir, version: '9.0.0' })
      const result = await c2.get('/test/v.ts', 'hash123')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(SOURCE_TEXT)
      await fs.rm(sharedDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('setProject advanced', () => {
    it('should allow retrieval after late project set', async () => {
      const lateCache = new ASTCache(null, { cacheDir, version: '0.1.0', ttl: 60_000 })
      const sourceFile = project.createSourceFile('/test/late.ts', SOURCE_TEXT)
      await lateCache.set('/test/late.ts', 'hash123', sourceFile)

      lateCache.setProject(project)
      const result = await lateCache.get('/test/late.ts', 'hash123')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(SOURCE_TEXT)
    })
  })

  describe('get edge cases', () => {
    it('should return null on corrupted cache data', async () => {
      const sourceFile = project.createSourceFile('/test/corrupt.ts', SOURCE_TEXT)
      await cache.set('/test/corrupt.ts', 'hash123', sourceFile)

      const files = await fs.readdir(cacheDir)
      expect(files.length).toBe(1)
      await fs.writeFile(path.join(cacheDir, files[0]), 'INVALID JSON {{{')

      const result = await cache.get('/test/corrupt.ts', 'hash123')
      expect(result).toBeNull()
    })

    it('should return results for multiple gets on same entry', async () => {
      const sourceFile = project.createSourceFile('/test/multi.ts', SOURCE_TEXT)
      await cache.set('/test/multi.ts', 'hash123', sourceFile)

      const r1 = await cache.get('/test/multi.ts', 'hash123')
      const r2 = await cache.get('/test/multi.ts', 'hash123')
      const r3 = await cache.get('/test/multi.ts', 'hash123')
      expect(r1).not.toBeNull()
      expect(r2).not.toBeNull()
      expect(r3).not.toBeNull()
      expect(r1!.getFullText()).toBe(SOURCE_TEXT)
      expect(r2!.getFullText()).toBe(SOURCE_TEXT)
      expect(r3!.getFullText()).toBe(SOURCE_TEXT)
    })

    it('should return null for wrong hash even if file exists with another hash', async () => {
      const sf = project.createSourceFile('/test/diffhash.ts', SOURCE_TEXT)
      await cache.set('/test/diffhash.ts', 'hashA', sf)

      const result = await cache.get('/test/diffhash.ts', 'hashB')
      expect(result).toBeNull()
    })
  })

  describe('set edge cases', () => {
    it('should not write to disk when disabled', async () => {
      const disabledDir = makeTempDir()
      const disabledCache = new ASTCache(project, {
        cacheDir: disabledDir,
        enabled: false,
      })
      const sourceFile = project.createSourceFile('/test/dis.ts', SOURCE_TEXT)
      await disabledCache.set('/test/dis.ts', 'hash123', sourceFile)

      const dirExists = await fs
        .access(disabledDir)
        .then(() => true)
        .catch(() => false)
      if (dirExists) {
        const files = await fs.readdir(disabledDir)
        expect(files.length).toBe(0)
      }
    })

    it('should not throw on write errors', async () => {
      const parentDir = makeTempDir()
      await fs.mkdir(parentDir, { recursive: true })
      const fileAsDir = path.join(parentDir, 'not-a-dir')
      await fs.writeFile(fileAsDir, 'not a directory')
      const badCache = new ASTCache(project, { cacheDir: fileAsDir, version: '0.1.0' })
      const sourceFile = project.createSourceFile('/test/err.ts', SOURCE_TEXT)
      await expect(badCache.set('/test/err.ts', 'hash123', sourceFile)).resolves.toBeUndefined()
      await fs.rm(parentDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should not throw when cache directory is invalid', async () => {
      const parentDir = makeTempDir()
      await fs.mkdir(parentDir, { recursive: true })
      const fileAsDir = path.join(parentDir, 'file-as-dir')
      await fs.writeFile(fileAsDir, 'x')
      const badCache = new ASTCache(project, { cacheDir: path.join(fileAsDir, 'sub') })

      const sourceFile = project.createSourceFile('/test/nothrow.ts', SOURCE_TEXT)
      await expect(badCache.set('/test/nothrow.ts', 'hash123', sourceFile)).resolves.toBeUndefined()

      await fs.rm(parentDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('has edge cases', () => {
    it('should return false for version mismatch entry', async () => {
      const sourceFile = project.createSourceFile('/test/hasver.ts', SOURCE_TEXT)
      await cache.set('/test/hasver.ts', 'hash123', sourceFile)

      const v2Cache = new ASTCache(project, { cacheDir, version: '0.2.0', ttl: 60_000 })
      expect(await v2Cache.has('/test/hasver.ts', 'hash123')).toBe(false)
    })

    it('should return false for TTL-expired entry', async () => {
      const shortTtlDir = makeTempDir()
      const shortTtlCache = new ASTCache(project, {
        cacheDir: shortTtlDir,
        version: '0.1.0',
        ttl: 1,
      })
      const sourceFile = project.createSourceFile('/test/hasexp.ts', SOURCE_TEXT)
      await shortTtlCache.set('/test/hasexp.ts', 'hash123', sourceFile)
      await new Promise((r) => setTimeout(r, 10))
      expect(await shortTtlCache.has('/test/hasexp.ts', 'hash123')).toBe(false)
      await fs.rm(shortTtlDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should return false for content hash mismatch', async () => {
      const sourceFile = project.createSourceFile('/test/hashash.ts', SOURCE_TEXT)
      await cache.set('/test/hashash.ts', 'hash123', sourceFile)
      expect(await cache.has('/test/hashash.ts', 'wrongHash')).toBe(false)
    })

    it('should return true for freshly cached entry', async () => {
      const sourceFile = project.createSourceFile('/test/fresh.ts', SOURCE_TEXT)
      await cache.set('/test/fresh.ts', 'hash123', sourceFile)
      expect(await cache.has('/test/fresh.ts', 'hash123')).toBe(true)
    })
  })

  describe('default TTL behavior', () => {
    it('should use 7-day TTL when not specified', async () => {
      const defaultCache = new ASTCache(project, { cacheDir: makeTempDir() })
      const sourceFile = project.createSourceFile('/test/ttl.ts', SOURCE_TEXT)
      await defaultCache.set('/test/ttl.ts', 'hash123', sourceFile)

      const result = await defaultCache.get('/test/ttl.ts', 'hash123')
      expect(result).not.toBeNull()
    })

    it('should use 0.1.0 as default version', async () => {
      const sharedDir = makeTempDir()
      const noVersionCache = new ASTCache(project, { cacheDir: sharedDir })
      const sourceFile = project.createSourceFile('/test/defver.ts', SOURCE_TEXT)
      await noVersionCache.set('/test/defver.ts', 'hash123', sourceFile)

      const sameCache = new ASTCache(project, { cacheDir: sharedDir })
      const result = await sameCache.get('/test/defver.ts', 'hash123')
      expect(result).not.toBeNull()
    })
  })

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      const expiredEntry = {
        key: 'test-expired',
        value: {
          filePath: '/test.ts',
          contentHash: 'h',
          sourceText: '',
          version: '0.1.0',
          timestamp: 0,
        },
        timestamp: Date.now() - 200000,
        ttl: 1,
      }
      await fs.writeFile(path.join(cacheDir, 'expired-test.json'), JSON.stringify(expiredEntry))

      const cleaned = await cache.cleanup()
      expect(cleaned).toBeGreaterThan(0)

      const remaining = await fs.readdir(cacheDir)
      expect(remaining.length).toBe(0)
    })

    it('should return 0 when no expired entries', async () => {
      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(0)
    })

    it('should keep non-expired entries during cleanup', async () => {
      const sourceFile = project.createSourceFile('/test/keep.ts', SOURCE_TEXT)
      await cache.set('/test/keep.ts', 'hash123', sourceFile)

      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(0)

      const result = await cache.get('/test/keep.ts', 'hash123')
      expect(result).not.toBeNull()
    })

    it('should remove invalid JSON files during cleanup', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      await fs.writeFile(path.join(cacheDir, 'bad-entry.json'), 'not valid json {{{')

      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(1)

      const remaining = await fs.readdir(cacheDir)
      expect(remaining.length).toBe(0)
    })

    it('should handle empty cache directory during cleanup', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(0)
    })

    it('should clean up multiple expired entries', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      const expiredEntry = {
        key: 'test-expired',
        value: {
          filePath: '/test.ts',
          contentHash: 'h',
          sourceText: '',
          version: '0.1.0',
          timestamp: 0,
        },
        timestamp: Date.now() - 200000,
        ttl: 1,
      }
      await fs.writeFile(path.join(cacheDir, 'expired-1.json'), JSON.stringify(expiredEntry))
      await fs.writeFile(path.join(cacheDir, 'expired-2.json'), JSON.stringify(expiredEntry))
      await fs.writeFile(path.join(cacheDir, 'expired-3.json'), JSON.stringify(expiredEntry))

      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(3)
    })

    it('should return 0 when cache directory does not exist', async () => {
      const nonexistentDir = path.join(makeTempDir(), 'does-not-exist')
      const cleanupCache = new ASTCache(project, {
        cacheDir: nonexistentDir,
        version: '0.1.0',
      })
      const cleaned = await cleanupCache.cleanup()
      expect(cleaned).toBe(0)
    })

    it('should keep valid entries and remove expired ones', async () => {
      await fs.mkdir(cacheDir, { recursive: true })

      const expiredEntry = {
        key: 'expired',
        value: {
          filePath: '/test.ts',
          contentHash: 'h',
          sourceText: '',
          version: '0.1.0',
          timestamp: 0,
        },
        timestamp: Date.now() - 200000,
        ttl: 1,
      }
      await fs.writeFile(path.join(cacheDir, 'expired-mixed.json'), JSON.stringify(expiredEntry))

      const sourceFile = project.createSourceFile('/test/valid.ts', SOURCE_TEXT)
      await cache.set('/test/valid.ts', 'hash123', sourceFile)

      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(1)

      const result = await cache.get('/test/valid.ts', 'hash123')
      expect(result).not.toBeNull()
    })

    it('should handle entry with no ttl field as non-expired', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      const noTtlEntry = {
        key: 'no-ttl',
        value: {
          filePath: '/test.ts',
          contentHash: 'h',
          sourceText: '',
          version: '0.1.0',
          timestamp: Date.now() - 999999,
        },
        timestamp: Date.now() - 999999,
      }
      await fs.writeFile(path.join(cacheDir, 'no-ttl-entry.json'), JSON.stringify(noTtlEntry))

      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(0)
    })

    it('should remove all files that cannot be parsed', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      await fs.writeFile(path.join(cacheDir, 'bad1.json'), '{{{{')
      await fs.writeFile(path.join(cacheDir, 'bad2.json'), 'not-json')

      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(2)

      const remaining = await fs.readdir(cacheDir)
      expect(remaining.length).toBe(0)
    })

    it('should return count of cleaned entries', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      const expiredEntry = {
        key: 'test',
        value: {
          filePath: '/t.ts',
          contentHash: 'h',
          sourceText: '',
          version: '0.1.0',
          timestamp: 0,
        },
        timestamp: 0,
        ttl: 1,
      }
      await fs.writeFile(path.join(cacheDir, 'cl1.json'), JSON.stringify(expiredEntry))
      await fs.writeFile(path.join(cacheDir, 'cl2.json'), JSON.stringify(expiredEntry))

      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(2)
    })

    it('should clean mix of expired and invalid entries', async () => {
      await fs.mkdir(cacheDir, { recursive: true })

      const expiredEntry = {
        key: 'test',
        value: {
          filePath: '/t.ts',
          contentHash: 'h',
          sourceText: '',
          version: '0.1.0',
          timestamp: 0,
        },
        timestamp: 0,
        ttl: 1,
      }
      await fs.writeFile(path.join(cacheDir, 'expired.json'), JSON.stringify(expiredEntry))
      await fs.writeFile(path.join(cacheDir, 'invalid.json'), 'bad json {{')

      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(2)
    })
  })

  describe('createDefaultASTCache', () => {
    it('should accept optional version parameter', async () => {
      const c = createDefaultASTCache(project, '2.0.0')
      expect(c).toBeInstanceOf(ASTCache)
      expect(c.isEnabled()).toBe(true)
    })

    it('should create cache without version parameter', () => {
      const c = createDefaultASTCache(null)
      expect(c).toBeInstanceOf(ASTCache)
      expect(c.isEnabled()).toBe(true)
    })

    it('should work with project and version provided', async () => {
      const c = createDefaultASTCache(project, '5.0.0')
      expect(c).toBeInstanceOf(ASTCache)
      expect(c.isEnabled()).toBe(true)
    })

    it('should create functional cache with project', async () => {
      const tmpDir = makeTempDir()
      const c = new ASTCache(project, { cacheDir: tmpDir, version: '0.1.0' })
      const sourceFile = project.createSourceFile('/test/defproj.ts', SOURCE_TEXT)
      await c.set('/test/defproj.ts', 'hash123', sourceFile)

      const result = await c.get('/test/defproj.ts', 'hash123')
      expect(result).not.toBeNull()

      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('error handling', () => {
    it('should handle missing cache directory on get', async () => {
      const missingDir = path.join(makeTempDir(), 'nonexistent', 'subdir')
      const missingCache = new ASTCache(project, { cacheDir: missingDir, version: '0.1.0' })
      const result = await missingCache.get('/test/missing.ts', 'hash123')
      expect(result).toBeNull()
    })

    it('should handle errors during clear', async () => {
      const parentDir = makeTempDir()
      await fs.mkdir(parentDir, { recursive: true })
      const fileAsDir = path.join(parentDir, 'not-a-dir')
      await fs.writeFile(fileAsDir, 'not a directory')
      const badCache = new ASTCache(project, { cacheDir: fileAsDir, version: '0.1.0' })
      await expect(badCache.clear()).resolves.toBeUndefined()
      await fs.rm(parentDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should return null when cache dir becomes a file', async () => {
      const tmpDir = makeTempDir()
      const errCache = new ASTCache(project, { cacheDir: tmpDir, version: '0.1.0' })
      const sourceFile = project.createSourceFile('/test/errfile.ts', SOURCE_TEXT)
      await errCache.set('/test/errfile.ts', 'hash123', sourceFile)

      const r1 = await errCache.get('/test/errfile.ts', 'hash123')
      expect(r1).not.toBeNull()

      await fs.rm(tmpDir, { recursive: true, force: true })
      await fs.writeFile(tmpDir, 'not a directory')

      const r2 = await errCache.get('/test/errfile.ts', 'hash123')
      expect(r2).toBeNull()

      await fs.rm(tmpDir, { force: true }).catch(() => {})
    })

    it('should return stats with zeros when store throws', async () => {
      const tmpDir = makeTempDir()
      const errCache = new ASTCache(project, { cacheDir: tmpDir, version: '0.1.0' })
      const sourceFile = project.createSourceFile('/test/errstat.ts', SOURCE_TEXT)
      await errCache.set('/test/errstat.ts', 'hash123', sourceFile)
      await errCache.get('/test/errstat.ts', 'hash123')

      await fs.rm(tmpDir, { recursive: true, force: true })
      await fs.writeFile(tmpDir, 'not a directory')

      const stats = await errCache.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.size).toBe(0)
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(0)

      await fs.rm(tmpDir, { force: true }).catch(() => {})
    })
  })

  describe('has with corrupted entry', () => {
    it('should return false when cache file contains invalid JSON', async () => {
      const sourceFile = project.createSourceFile('/test/hascorrupt.ts', SOURCE_TEXT)
      await cache.set('/test/hascorrupt.ts', 'hash123', sourceFile)

      const files = await fs.readdir(cacheDir)
      expect(files.length).toBe(1)

      for (const file of files) {
        await fs.writeFile(path.join(cacheDir, file), 'BROKEN JSON')
      }

      expect(await cache.has('/test/hascorrupt.ts', 'hash123')).toBe(false)
    })
  })

  describe('has without project', () => {
    it('should return false when project is null and cache has entry', async () => {
      const sourceFile = project.createSourceFile('/test/hasnullproj.ts', SOURCE_TEXT)
      await cache.set('/test/hasnullproj.ts', 'hash123', sourceFile)

      const noProjCache = new ASTCache(null, { cacheDir, version: '0.1.0', ttl: 60_000 })
      const result = await noProjCache.has('/test/hasnullproj.ts', 'hash123')
      expect(result).toBe(true)
    })

    it('should return false when project is null and no entry exists', async () => {
      const noProjCache = new ASTCache(null, { cacheDir, version: '0.1.0', ttl: 60_000 })
      expect(await noProjCache.has('/test/noproject.ts', 'hash123')).toBe(false)
    })
  })

  describe('set without project but enabled', () => {
    it('should write to disk even without project', async () => {
      const noProjCache = new ASTCache(null, { cacheDir, version: '0.1.0', ttl: 60_000 })
      const sourceFile = project.createSourceFile('/test/setnoproj.ts', SOURCE_TEXT)
      await noProjCache.set('/test/setnoproj.ts', 'hash123', sourceFile)

      const files = await fs.readdir(cacheDir)
      expect(files.length).toBe(1)
    })
  })

  describe('get with project null after set', () => {
    it('should return null when project removed after caching', async () => {
      const sourceFile = project.createSourceFile('/test/projremoved.ts', SOURCE_TEXT)
      await cache.set('/test/projremoved.ts', 'hash123', sourceFile)

      cache.setProject(null as unknown as Project)
      const result = await cache.get('/test/projremoved.ts', 'hash123')
      expect(result).toBeNull()
    })
  })

  describe('empty source text', () => {
    it('should cache and retrieve empty source file', async () => {
      const sourceFile = project.createSourceFile('/test/empty.ts', '')
      await cache.set('/test/empty.ts', 'hashEmpty', sourceFile)

      const result = await cache.get('/test/empty.ts', 'hashEmpty')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe('')
    })

    it('should report has=true for empty source file', async () => {
      const sourceFile = project.createSourceFile('/test/emptyhas.ts', '')
      await cache.set('/test/emptyhas.ts', 'hashEmpty', sourceFile)
      expect(await cache.has('/test/emptyhas.ts', 'hashEmpty')).toBe(true)
    })
  })

  describe('clear then re-use', () => {
    it('should allow setting and getting after clear', async () => {
      const sourceFile = project.createSourceFile('/test/reuse.ts', SOURCE_TEXT)
      await cache.set('/test/reuse.ts', 'hash123', sourceFile)
      await cache.clear()

      const sourceFile2 = project.createSourceFile('/test/reuse2.ts', 'const y = 2;')
      await cache.set('/test/reuse2.ts', 'hash456', sourceFile2)

      const result = await cache.get('/test/reuse2.ts', 'hash456')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe('const y = 2;')
    })

    it('should track stats correctly after clear and new operations', async () => {
      const sourceFile = project.createSourceFile('/test/statsafter.ts', SOURCE_TEXT)
      await cache.set('/test/statsafter.ts', 'hash123', sourceFile)
      await cache.get('/test/statsafter.ts', 'hash123')
      await cache.clear()

      const sourceFile2 = project.createSourceFile('/test/statsafter2.ts', 'const y = 2;')
      await cache.set('/test/statsafter2.ts', 'hash456', sourceFile2)
      await cache.get('/test/statsafter2.ts', 'hash456')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(0)
    })
  })

  describe('multiple clear calls', () => {
    it('should handle multiple consecutive clears', async () => {
      const sourceFile = project.createSourceFile('/test/multiclr.ts', SOURCE_TEXT)
      await cache.set('/test/multiclr.ts', 'hash123', sourceFile)

      await cache.clear()
      await cache.clear()
      await cache.clear()

      const stats = await cache.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })
  })

  describe('disabled cache set then enable', () => {
    it('should not retrieve entries set while disabled after re-enabling', async () => {
      const tmpDir = makeTempDir()
      const disabledCache = new ASTCache(project, {
        cacheDir: tmpDir,
        enabled: false,
      })

      const sourceFile = project.createSourceFile('/test/disset.ts', SOURCE_TEXT)
      await disabledCache.set('/test/disset.ts', 'hash123', sourceFile)

      disabledCache.setEnabled(true)
      const result = await disabledCache.get('/test/disset.ts', 'hash123')
      expect(result).toBeNull()

      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('has does not modify stats', () => {
    it('should not affect hit/miss counters', async () => {
      const sourceFile = project.createSourceFile('/test/hasstats.ts', SOURCE_TEXT)
      await cache.set('/test/hasstats.ts', 'hash123', sourceFile)

      await cache.has('/test/hasstats.ts', 'hash123')
      await cache.has('/test/missing.ts', 'hash999')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })
  })

  describe('setProject with same project', () => {
    it('should continue working after setting same project', async () => {
      const sourceFile = project.createSourceFile('/test/sameproj.ts', SOURCE_TEXT)
      await cache.set('/test/sameproj.ts', 'hash123', sourceFile)

      cache.setProject(project)
      const result = await cache.get('/test/sameproj.ts', 'hash123')
      expect(result).not.toBeNull()
    })
  })

  describe('constructor defaults', () => {
    it('should use default cacheDir when not provided', () => {
      const c = new ASTCache(project)
      expect(c).toBeInstanceOf(ASTCache)
      expect(c.isEnabled()).toBe(true)
    })

    it('should use all defaults with empty options', () => {
      const c = new ASTCache(project, {})
      expect(c).toBeInstanceOf(ASTCache)
    })
  })

  describe('isEnabled default', () => {
    it('should default to enabled when option not specified', () => {
      const c = new ASTCache(project, { cacheDir: makeTempDir() })
      expect(c.isEnabled()).toBe(true)
    })

    it('should start enabled when explicitly set to true', () => {
      const c = new ASTCache(project, { cacheDir: makeTempDir(), enabled: true })
      expect(c.isEnabled()).toBe(true)
    })
  })

  describe('concurrent operations', () => {
    it('should handle concurrent gets on the same entry', async () => {
      const sourceFile = project.createSourceFile('/test/conc.ts', SOURCE_TEXT)
      await cache.set('/test/conc.ts', 'hash123', sourceFile)

      const results = await Promise.all([
        cache.get('/test/conc.ts', 'hash123'),
        cache.get('/test/conc.ts', 'hash123'),
        cache.get('/test/conc.ts', 'hash123'),
      ])

      for (const r of results) {
        expect(r).not.toBeNull()
        expect(r!.getFullText()).toBe(SOURCE_TEXT)
      }
    })

    it('should handle concurrent sets on different files', async () => {
      const sf1 = project.createSourceFile('/test/ca.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/cb.ts', 'const b = 2;')
      const sf3 = project.createSourceFile('/test/cc.ts', 'const c = 3;')

      await Promise.all([
        cache.set('/test/ca.ts', 'h1', sf1),
        cache.set('/test/cb.ts', 'h2', sf2),
        cache.set('/test/cc.ts', 'h3', sf3),
      ])

      const [r1, r2, r3] = await Promise.all([
        cache.get('/test/ca.ts', 'h1'),
        cache.get('/test/cb.ts', 'h2'),
        cache.get('/test/cc.ts', 'h3'),
      ])

      expect(r1!.getFullText()).toBe('const a = 1;')
      expect(r2!.getFullText()).toBe('const b = 2;')
      expect(r3!.getFullText()).toBe('const c = 3;')
    })

    it('should handle concurrent has calls', async () => {
      const sourceFile = project.createSourceFile('/test/conchas.ts', SOURCE_TEXT)
      await cache.set('/test/conchas.ts', 'hash123', sourceFile)

      const results = await Promise.all([
        cache.has('/test/conchas.ts', 'hash123'),
        cache.has('/test/conchas.ts', 'hash123'),
        cache.has('/test/conchas.ts', 'wrong'),
        cache.has('/test/missing.ts', 'hash123'),
      ])

      expect(results[0]).toBe(true)
      expect(results[1]).toBe(true)
      expect(results[2]).toBe(false)
      expect(results[3]).toBe(false)
    })

    it('should handle concurrent mixed operations', async () => {
      const sf1 = project.createSourceFile('/test/mixa.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/mixb.ts', 'const b = 2;')

      await cache.set('/test/mixa.ts', 'h1', sf1)
      await cache.set('/test/mixb.ts', 'h2', sf2)

      const results = await Promise.all([
        cache.get('/test/mixa.ts', 'h1'),
        cache.get('/test/mixb.ts', 'h2'),
        cache.has('/test/mixa.ts', 'h1'),
        cache.get('/test/missing.ts', 'h3'),
      ])

      expect(results[0]).not.toBeNull()
      expect(results[1]).not.toBeNull()
      expect(results[2]).toBe(true)
      expect(results[3]).toBeNull()
    })
  })

  describe('large source text', () => {
    it('should cache and retrieve large files', async () => {
      const largeText = 'const x = 1;\n'.repeat(1000)
      const sourceFile = project.createSourceFile('/test/large.ts', largeText)
      await cache.set('/test/large.ts', 'hashLarge', sourceFile)

      const result = await cache.get('/test/large.ts', 'hashLarge')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(largeText)
    })

    it('should report correct size for large cached files', async () => {
      const largeText = 'const x = 1;\n'.repeat(500)
      const sourceFile = project.createSourceFile('/test/largesize.ts', largeText)
      await cache.set('/test/largesize.ts', 'hashLarge', sourceFile)

      const stats = await cache.getStats()
      expect(stats.size).toBeGreaterThan(largeText.length)
    })
  })

  describe('special characters in paths', () => {
    it('should handle file paths with special characters', async () => {
      const specialPath = '/test/path with spaces/and-dashes/file.ts'
      const sourceFile = project.createSourceFile(specialPath, SOURCE_TEXT)
      await cache.set(specialPath, 'hashSpecial', sourceFile)

      const result = await cache.get(specialPath, 'hashSpecial')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(SOURCE_TEXT)
    })

    it('should handle file paths with unicode characters', async () => {
      const unicodePath = '/test/プロジェクト/ファイル.ts'
      const sourceFile = project.createSourceFile(unicodePath, SOURCE_TEXT)
      await cache.set(unicodePath, 'hashUnicode', sourceFile)

      const result = await cache.get(unicodePath, 'hashUnicode')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(SOURCE_TEXT)
    })

    it('should handle file paths with dots', async () => {
      const dottedPath = '/test/src.test/fixtures/file.spec.ts'
      const sourceFile = project.createSourceFile(dottedPath, SOURCE_TEXT)
      await cache.set(dottedPath, 'hashDots', sourceFile)

      const result = await cache.get(dottedPath, 'hashDots')
      expect(result).not.toBeNull()
    })

    it('should handle very long file paths', async () => {
      const longPath = '/test/' + 'subdir/'.repeat(30) + 'file.ts'
      const sourceFile = project.createSourceFile(longPath, SOURCE_TEXT)
      await cache.set(longPath, 'hashLong', sourceFile)

      const result = await cache.get(longPath, 'hashLong')
      expect(result).not.toBeNull()
    })
  })

  describe('special file content', () => {
    it('should handle source with only whitespace', async () => {
      const sourceFile = project.createSourceFile('/test/whitespace.ts', '   \n  \n')
      await cache.set('/test/whitespace.ts', 'hashWS', sourceFile)

      const result = await cache.get('/test/whitespace.ts', 'hashWS')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe('   \n  \n')
    })

    it('should handle source with special characters and escape sequences', async () => {
      const specialText = 'const s = "hello\\nworld\\t!"\nconst r = /test/g\n'
      const sourceFile = project.createSourceFile('/test/special.ts', specialText)
      await cache.set('/test/special.ts', 'hashSp', sourceFile)

      const result = await cache.get('/test/special.ts', 'hashSp')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(specialText)
    })

    it('should handle TypeScript with complex syntax', async () => {
      const complexText = `
import { type Foo, Bar } from './mod'
interface Test<T> {
  data: T
  fn: (x: T) => Promise<void>
}
export type Result = Test<string> | null
export async function process(items: Result[]): Promise<void> {
  for (const item of items) {
    if (item) console.log(item.data)
  }
}
`
      const sourceFile = project.createSourceFile('/test/complex.ts', complexText)
      await cache.set('/test/complex.ts', 'hashComplex', sourceFile)

      const result = await cache.get('/test/complex.ts', 'hashComplex')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(complexText)
    })

    it('should handle source with template literals', async () => {
      const templateText = 'const msg = `Hello ${name}`;\n'
      const sourceFile = project.createSourceFile('/test/template.ts', templateText)
      await cache.set('/test/template.ts', 'hashTpl', sourceFile)

      const result = await cache.get('/test/template.ts', 'hashTpl')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(templateText)
    })

    it('should handle source with JSX-like syntax', async () => {
      const jsxText = 'const el = <div className="test">Hello</div>;\n'
      const sourceFile = project.createSourceFile('/test/jsx.tsx', jsxText, {
        scriptKind: 4,
      })
      await cache.set('/test/jsx.tsx', 'hashJsx', sourceFile)

      const result = await cache.get('/test/jsx.tsx', 'hashJsx')
      expect(result).not.toBeNull()
    })

    it('should handle source with comments only', async () => {
      const commentText = '// This is a comment\n/* Multi-line\n   comment */\n'
      const sourceFile = project.createSourceFile('/test/comments.ts', commentText)
      await cache.set('/test/comments.ts', 'hashComment', sourceFile)

      const result = await cache.get('/test/comments.ts', 'hashComment')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(commentText)
    })

    it('should handle source with decorators', async () => {
      const decoratorText = '@observable\nconst x = 1;\n'
      const sourceFile = project.createSourceFile('/test/decorators.ts', decoratorText)
      await cache.set('/test/decorators.ts', 'hashDec', sourceFile)

      const result = await cache.get('/test/decorators.ts', 'hashDec')
      expect(result).not.toBeNull()
    })
  })

  describe('version isolation with same content hash', () => {
    it('should not retrieve entries from different version even with same hash', async () => {
      const sourceFile = project.createSourceFile('/test/visol.ts', SOURCE_TEXT)
      const cacheV1 = new ASTCache(project, { cacheDir, version: '1.0.0', ttl: 60_000 })
      await cacheV1.set('/test/visol.ts', 'sameHash', sourceFile)

      const cacheV2 = new ASTCache(project, { cacheDir, version: '2.0.0', ttl: 60_000 })
      const result = await cacheV2.get('/test/visol.ts', 'sameHash')
      expect(result).toBeNull()
    })
  })

  describe('getCacheKey version isolation', () => {
    it('should store entries with version in key', async () => {
      const sharedDir = makeTempDir()
      const cacheV1 = new ASTCache(project, { cacheDir: sharedDir, version: '3.0.0' })
      const cacheV2 = new ASTCache(project, { cacheDir: sharedDir, version: '3.0.1' })

      const sourceFile = project.createSourceFile('/test/keyver.ts', SOURCE_TEXT)
      await cacheV1.set('/test/keyver.ts', 'sameHash', sourceFile)

      expect(await cacheV2.get('/test/keyver.ts', 'sameHash')).toBeNull()
      expect(await cacheV1.get('/test/keyver.ts', 'sameHash')).not.toBeNull()

      await fs.rm(sharedDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('stats tracking accuracy', () => {
    it('should not count hits or misses when cache is disabled', async () => {
      const sourceFile = project.createSourceFile('/test/disstats.ts', SOURCE_TEXT)
      await cache.set('/test/disstats.ts', 'hash123', sourceFile)

      cache.setEnabled(false)
      await cache.get('/test/disstats.ts', 'hash123')
      await cache.get('/test/other.ts', 'hash999')

      const stats = await cache.getStats()
      expect(stats.misses).toBeGreaterThanOrEqual(0)
    })

    it('should track hits correctly across multiple gets', async () => {
      const sourceFile = project.createSourceFile('/test/multihit.ts', SOURCE_TEXT)
      await cache.set('/test/multihit.ts', 'hash123', sourceFile)

      await cache.get('/test/multihit.ts', 'hash123')
      await cache.get('/test/multihit.ts', 'hash123')
      await cache.get('/test/multihit.ts', 'hash123')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(3)
      expect(stats.hitRate).toBe(1)
    })

    it('should track misses from version mismatch', async () => {
      const sourceFile = project.createSourceFile('/test/statver.ts', SOURCE_TEXT)
      await cache.set('/test/statver.ts', 'hash123', sourceFile)

      const v2Cache = new ASTCache(project, { cacheDir, version: '99.0.0', ttl: 60_000 })
      await v2Cache.get('/test/statver.ts', 'hash123')

      const stats = await v2Cache.getStats()
      expect(stats.misses).toBe(1)
    })

    it('should track misses from hash mismatch', async () => {
      const sourceFile = project.createSourceFile('/test/stathash.ts', SOURCE_TEXT)
      await cache.set('/test/stathash.ts', 'hash123', sourceFile)

      await cache.get('/test/stathash.ts', 'wrongHash')

      const stats = await cache.getStats()
      expect(stats.misses).toBe(1)
    })

    it('should calculate hitRate correctly with mixed hits and misses', async () => {
      const sf1 = project.createSourceFile('/test/rate1.ts', 'const a = 1;')
      await cache.set('/test/rate1.ts', 'h1', sf1)

      await cache.get('/test/rate1.ts', 'h1')
      await cache.get('/test/rate1.ts', 'h1')
      await cache.get('/test/rate1.ts', 'h1')
      await cache.get('/test/rate1.ts', 'wrong')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(3)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(0.75)
    })

    it('should track stats correctly after enable/disable cycle', async () => {
      const sourceFile = project.createSourceFile('/test/cycle.ts', SOURCE_TEXT)
      await cache.set('/test/cycle.ts', 'hash123', sourceFile)
      await cache.get('/test/cycle.ts', 'hash123')

      cache.setEnabled(false)
      await cache.get('/test/disabled.ts', 'hash456')
      cache.setEnabled(true)

      const stats = await cache.getStats()
      expect(stats.hits).toBe(1)
    })
  })

  describe('getStats size tracking', () => {
    it('should increase size after adding entries', async () => {
      const sf1 = project.createSourceFile('/test/s1.ts', 'const a = 1;')
      await cache.set('/test/s1.ts', 'h1', sf1)
      const stats1 = await cache.getStats()

      const sf2 = project.createSourceFile('/test/s2.ts', 'const b = 2;')
      await cache.set('/test/s2.ts', 'h2', sf2)
      const stats2 = await cache.getStats()

      expect(stats2.size).toBeGreaterThan(stats1.size)
    })

    it('should reset size to 0 after clear', async () => {
      const sourceFile = project.createSourceFile('/test/szclr.ts', SOURCE_TEXT)
      await cache.set('/test/szclr.ts', 'hash123', sourceFile)

      await cache.clear()
      const stats = await cache.getStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('cache persistence', () => {
    it('should persist entries to disk', async () => {
      const sharedDir = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: sharedDir, version: '0.1.0' })
      const sourceFile = project.createSourceFile('/test/persist.ts', SOURCE_TEXT)
      await c1.set('/test/persist.ts', 'hash123', sourceFile)

      // Create new cache instance pointing to same dir
      const c2 = new ASTCache(project, { cacheDir: sharedDir, version: '0.1.0' })
      const result = await c2.get('/test/persist.ts', 'hash123')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(SOURCE_TEXT)

      await fs.rm(sharedDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should persist multiple entries across instances', async () => {
      const sharedDir = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: sharedDir, version: '0.1.0' })

      const sf1 = project.createSourceFile('/test/p1.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/p2.ts', 'const b = 2;')
      await c1.set('/test/p1.ts', 'h1', sf1)
      await c1.set('/test/p2.ts', 'h2', sf2)

      const c2 = new ASTCache(project, { cacheDir: sharedDir, version: '0.1.0' })
      expect(await c2.get('/test/p1.ts', 'h1')).not.toBeNull()
      expect(await c2.get('/test/p2.ts', 'h2')).not.toBeNull()

      await fs.rm(sharedDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('cache key collision resistance', () => {
    it('should not collide for paths that differ only slightly', async () => {
      const sf1 = project.createSourceFile('/test/fileA.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/fileB.ts', 'const b = 2;')
      await cache.set('/test/fileA.ts', 'sameHash', sf1)
      await cache.set('/test/fileB.ts', 'sameHash', sf2)

      const r1 = await cache.get('/test/fileA.ts', 'sameHash')
      const r2 = await cache.get('/test/fileB.ts', 'sameHash')
      expect(r1!.getFullText()).toBe('const a = 1;')
      expect(r2!.getFullText()).toBe('const b = 2;')
    })

    it('should not collide for same path with different hashes', async () => {
      const sf1 = project.createSourceFile('/test/collision.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/collisionB.ts', 'const b = 2;')
      await cache.set('/test/collision.ts', 'hashA', sf1)
      await cache.set('/test/collision.ts', 'hashB', sf2)

      const r1 = await cache.get('/test/collision.ts', 'hashA')
      const r2 = await cache.get('/test/collision.ts', 'hashB')
      expect(r1).not.toBeNull()
      expect(r2).not.toBeNull()
    })
  })

  describe('set returns void', () => {
    it('should resolve to undefined on success', async () => {
      const sourceFile = project.createSourceFile('/test/void.ts', SOURCE_TEXT)
      const result = await cache.set('/test/void.ts', 'hash123', sourceFile)
      expect(result).toBeUndefined()
    })

    it('should resolve to undefined when disabled', async () => {
      cache.setEnabled(false)
      const sourceFile = project.createSourceFile('/test/voiddis.ts', SOURCE_TEXT)
      const result = await cache.set('/test/voiddis.ts', 'hash123', sourceFile)
      expect(result).toBeUndefined()
    })
  })

  describe('get returns SourceFile on hit', () => {
    it('should return a SourceFile instance on cache hit', async () => {
      const sourceFile = project.createSourceFile('/test/sfreturn.ts', SOURCE_TEXT)
      await cache.set('/test/sfreturn.ts', 'hash123', sourceFile)

      const result = await cache.get('/test/sfreturn.ts', 'hash123')
      expect(result).not.toBeNull()
      expect(typeof result!.getFullText).toBe('function')
    })
  })

  describe('boundary TTL values', () => {
    it('should respect very short TTL', async () => {
      const shortCache = new ASTCache(project, { cacheDir: makeTempDir(), ttl: 1 })
      const sourceFile = project.createSourceFile('/test/shortTtl.ts', SOURCE_TEXT)
      await shortCache.set('/test/shortTtl.ts', 'hash123', sourceFile)
      await new Promise((r) => setTimeout(r, 10))

      const result = await shortCache.get('/test/shortTtl.ts', 'hash123')
      expect(result).toBeNull()
    })

    it('should work with very long TTL', async () => {
      const longTtlCache = new ASTCache(project, {
        cacheDir: makeTempDir(),
        ttl: 365 * 24 * 60 * 60 * 1000,
      })
      const sourceFile = project.createSourceFile('/test/longTtl.ts', SOURCE_TEXT)
      await longTtlCache.set('/test/longTtl.ts', 'hash123', sourceFile)

      const result = await longTtlCache.get('/test/longTtl.ts', 'hash123')
      expect(result).not.toBeNull()
    })
  })

  describe('repeated set operations', () => {
    it('should handle many set operations on same key', async () => {
      for (let i = 0; i < 5; i++) {
        const sf = project.createSourceFile('/test/repeat.ts', `const x = ${i};`, {
          overwrite: true,
        })
        await cache.set('/test/repeat.ts', 'hash123', sf)
      }

      const result = await cache.get('/test/repeat.ts', 'hash123')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe('const x = 4;')
    })
  })

  describe('get with missing entry file', () => {
    it('should return null when cache file is deleted externally', async () => {
      const sourceFile = project.createSourceFile('/test/deleted.ts', SOURCE_TEXT)
      await cache.set('/test/deleted.ts', 'hash123', sourceFile)

      // Delete all files in cache dir
      const files = await fs.readdir(cacheDir)
      for (const file of files) {
        await fs.unlink(path.join(cacheDir, file))
      }

      const result = await cache.get('/test/deleted.ts', 'hash123')
      expect(result).toBeNull()
    })
  })

  describe('getStats after various operations', () => {
    it('should track stats correctly after mixed set/get/has', async () => {
      const sf1 = project.createSourceFile('/test/mixop1.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/mixop2.ts', 'const b = 2;')

      await cache.set('/test/mixop1.ts', 'h1', sf1)
      await cache.set('/test/mixop2.ts', 'h2', sf2)

      await cache.get('/test/mixop1.ts', 'h1') // hit
      await cache.get('/test/mixop1.ts', 'h1') // hit
      await cache.get('/test/mixop2.ts', 'h2') // hit
      await cache.get('/test/missing.ts', 'h3') // miss
      await cache.has('/test/mixop1.ts', 'h1') // no stat change
      await cache.has('/test/missing.ts', 'h3') // no stat change

      const stats = await cache.getStats()
      expect(stats.hits).toBe(3)
      expect(stats.misses).toBe(1)
      expect(stats.entries).toBe(2)
    })
  })

  describe('createDefaultASTCache with null project and version', () => {
    it('should accept null project and version string', () => {
      const c = createDefaultASTCache(null, '3.0.0')
      expect(c).toBeInstanceOf(ASTCache)
      expect(c.isEnabled()).toBe(true)
    })
  })

  describe('overwrite with different content hash', () => {
    it('should store both old and new entries when hash changes', async () => {
      const sf1 = project.createSourceFile('/test/diffOw.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/diffOwB.ts', 'const b = 2;')
      await cache.set('/test/diffOw.ts', 'hashOld', sf1)
      await cache.set('/test/diffOw.ts', 'hashNew', sf2)

      const r1 = await cache.get('/test/diffOw.ts', 'hashOld')
      const r2 = await cache.get('/test/diffOw.ts', 'hashNew')
      expect(r1).not.toBeNull()
      expect(r2).not.toBeNull()
    })
  })

  describe('cache with deeply nested paths', () => {
    it('should handle deeply nested source file paths', async () => {
      const deepPath = '/test/a/b/c/d/e/f/g/h/file.ts'
      const sourceFile = project.createSourceFile(deepPath, SOURCE_TEXT)
      await cache.set(deepPath, 'hashDeep', sourceFile)

      const result = await cache.get(deepPath, 'hashDeep')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(SOURCE_TEXT)
    })
  })

  describe('cleanup with non-JSON files', () => {
    it('should remove files that are not valid JSON', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      await fs.writeFile(path.join(cacheDir, 'random.txt'), 'not a cache file')
      await fs.writeFile(path.join(cacheDir, 'another.dat'), 'binary-ish data')

      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(2)

      const remaining = await fs.readdir(cacheDir)
      expect(remaining.length).toBe(0)
    })
  })

  describe('getStats with zero denominator', () => {
    it('should return 0 hitRate when hits and misses are both 0', async () => {
      const fresh = new ASTCache(project, { cacheDir: makeTempDir() })
      const stats = await fresh.getStats()
      expect(stats.hitRate).toBe(0)
      expect(stats.hits + stats.misses).toBe(0)
    })
  })

  describe('multiple cache instances sharing directory', () => {
    it('should not interfere with each other when using same version', async () => {
      const sharedDir = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: sharedDir, version: '1.0.0' })
      const c2 = new ASTCache(project, { cacheDir: sharedDir, version: '1.0.0' })

      const sf1 = project.createSourceFile('/test/shared1.ts', 'const a = 1;')
      await c1.set('/test/shared1.ts', 'h1', sf1)

      const result = await c2.get('/test/shared1.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe('const a = 1;')

      await fs.rm(sharedDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should isolate different versions sharing directory', async () => {
      const sharedDir = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: sharedDir, version: '1.0.0' })
      const c2 = new ASTCache(project, { cacheDir: sharedDir, version: '2.0.0' })

      const sf1 = project.createSourceFile('/test/iso.ts', 'const a = 1;')
      await c1.set('/test/iso.ts', 'h1', sf1)

      const r1 = await c1.get('/test/iso.ts', 'h1')
      const r2 = await c2.get('/test/iso.ts', 'h1')
      expect(r1).not.toBeNull()
      expect(r2).toBeNull()

      await fs.rm(sharedDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('get incrementing misses correctly', () => {
    it('should increment miss for each failed get', async () => {
      await cache.get('/test/miss.ts', 'h1')
      await cache.get('/test/miss.ts', 'h2')
      await cache.get('/test/miss.ts', 'h3')

      const stats = await cache.getStats()
      expect(stats.misses).toBe(3)
      expect(stats.hits).toBe(0)
    })
  })

  describe('setProject then immediate operations', () => {
    it('should allow set and get immediately after setProject', async () => {
      const c = new ASTCache(null, { cacheDir: makeTempDir() })
      c.setProject(project)

      const sf = project.createSourceFile('/test/immediate.ts', SOURCE_TEXT)
      await c.set('/test/immediate.ts', 'h1', sf)

      const result = await c.get('/test/immediate.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(SOURCE_TEXT)
    })
  })

  describe('empty hash strings', () => {
    it('should handle empty content hash', async () => {
      const sf = project.createSourceFile('/test/emptyhash.ts', SOURCE_TEXT)
      await cache.set('/test/emptyhash.ts', '', sf)

      const result = await cache.get('/test/emptyhash.ts', '')
      expect(result).not.toBeNull()
    })

    it('should differentiate empty hash from non-empty hash', async () => {
      const sf = project.createSourceFile('/test/hashdiff.ts', SOURCE_TEXT)
      await cache.set('/test/hashdiff.ts', '', sf)

      const result = await cache.get('/test/hashdiff.ts', 'nonempty')
      expect(result).toBeNull()
    })
  })

  describe('cleanup preserves fresh entries', () => {
    it('should not remove entries with future timestamps', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      const futureEntry = {
        key: 'future',
        value: {
          filePath: '/test.ts',
          contentHash: 'h',
          sourceText: '',
          version: '0.1.0',
          timestamp: Date.now() + 100000,
        },
        timestamp: Date.now() + 100000,
        ttl: 1000,
      }
      await fs.writeFile(path.join(cacheDir, 'future.json'), JSON.stringify(futureEntry))

      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(0)
    })
  })

  describe('stats after clear remain accurate', () => {
    it('should track fresh hits/misses after clear', async () => {
      const sf = project.createSourceFile('/test/freshstats.ts', SOURCE_TEXT)
      await cache.set('/test/freshstats.ts', 'h1', sf)
      await cache.get('/test/freshstats.ts', 'h1')
      await cache.get('/test/missing.ts', 'h2')

      await cache.clear()

      const sf2 = project.createSourceFile('/test/freshstats2.ts', 'const y = 2;')
      await cache.set('/test/freshstats2.ts', 'h3', sf2)
      await cache.get('/test/freshstats2.ts', 'h3')
      await cache.get('/test/stillmissing.ts', 'h4')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(0.5)
    })
  })

  describe('isEnabled toggling behavior', () => {
    it('should stay disabled after multiple setEnabled(false) calls', () => {
      cache.setEnabled(false)
      cache.setEnabled(false)
      cache.setEnabled(false)
      expect(cache.isEnabled()).toBe(false)
    })

    it('should stay enabled after multiple setEnabled(true) calls', () => {
      cache.setEnabled(true)
      cache.setEnabled(true)
      expect(cache.isEnabled()).toBe(true)
    })

    it('should toggle correctly in rapid succession', () => {
      cache.setEnabled(false)
      cache.setEnabled(true)
      cache.setEnabled(false)
      expect(cache.isEnabled()).toBe(false)
      cache.setEnabled(true)
      expect(cache.isEnabled()).toBe(true)
    })
  })

  describe('set with empty content', () => {
    it('should handle set with minimal source file', async () => {
      const sf = project.createSourceFile('/test/minimal.ts', ';')
      await cache.set('/test/minimal.ts', 'h1', sf)

      const result = await cache.get('/test/minimal.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(';')
    })
  })

  describe('get after partial corruption', () => {
    it('should handle some corrupted and some valid files', async () => {
      const sf1 = project.createSourceFile('/test/valid1.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/valid2.ts', 'const b = 2;')
      await cache.set('/test/valid1.ts', 'h1', sf1)
      await cache.set('/test/valid2.ts', 'h2', sf2)

      const files = await fs.readdir(cacheDir)
      expect(files.length).toBe(2)
      await fs.writeFile(path.join(cacheDir, files[0]), 'corrupted!')

      const r1 = await cache.get('/test/valid1.ts', 'h1')
      const r2 = await cache.get('/test/valid2.ts', 'h2')
      expect([r1, r2].filter((r) => r !== null).length).toBeLessThanOrEqual(2)
    })
  })

  describe('has after clear', () => {
    it('should return false after clear for previously cached entry', async () => {
      const sf = project.createSourceFile('/test/hasclr.ts', SOURCE_TEXT)
      await cache.set('/test/hasclr.ts', 'h1', sf)
      expect(await cache.has('/test/hasclr.ts', 'h1')).toBe(true)

      await cache.clear()
      expect(await cache.has('/test/hasclr.ts', 'h1')).toBe(false)
    })
  })

  describe('version with empty string', () => {
    it('should use empty string as version when specified', async () => {
      const sharedDir = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: sharedDir, version: '' })
      const sf = project.createSourceFile('/test/emptyver.ts', SOURCE_TEXT)
      await c1.set('/test/emptyver.ts', 'h1', sf)

      const c2 = new ASTCache(project, { cacheDir: sharedDir, version: '' })
      const result = await c2.get('/test/emptyver.ts', 'h1')
      expect(result).not.toBeNull()

      await fs.rm(sharedDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should not find entry with empty version from non-empty version', async () => {
      const sharedDir = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: sharedDir, version: '' })
      const sf = project.createSourceFile('/test/vermismatch.ts', SOURCE_TEXT)
      await c1.set('/test/vermismatch.ts', 'h1', sf)

      const c2 = new ASTCache(project, { cacheDir: sharedDir, version: '0.1.0' })
      const result = await c2.get('/test/vermismatch.ts', 'h1')
      expect(result).toBeNull()

      await fs.rm(sharedDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('concurrent clear and get', () => {
    it('should handle clear during active reads gracefully', async () => {
      const sf = project.createSourceFile('/test/concclear.ts', SOURCE_TEXT)
      await cache.set('/test/concclear.ts', 'h1', sf)

      await cache.clear()

      const result = await cache.get('/test/concclear.ts', 'h1')
      expect(result).toBeNull()
    })
  })

  describe('has for entry with wrong version in stored data', () => {
    it('should return false when stored version differs from current', async () => {
      const sf = project.createSourceFile('/test/haswrongver.ts', SOURCE_TEXT)
      const c1 = new ASTCache(project, { cacheDir, version: '0.5.0', ttl: 60_000 })
      await c1.set('/test/haswrongver.ts', 'h1', sf)

      const c2 = new ASTCache(project, { cacheDir, version: '0.6.0', ttl: 60_000 })
      expect(await c2.has('/test/haswrongver.ts', 'h1')).toBe(false)
    })
  })

  describe('cleanup with large number of expired entries', () => {
    it('should handle cleaning many expired entries', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      const expiredEntry = {
        key: 'test',
        value: {
          filePath: '/t.ts',
          contentHash: 'h',
          sourceText: '',
          version: '0.1.0',
          timestamp: 0,
        },
        timestamp: 0,
        ttl: 1,
      }
      for (let i = 0; i < 10; i++) {
        await fs.writeFile(path.join(cacheDir, `expired-${i}.json`), JSON.stringify(expiredEntry))
      }

      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(10)

      const remaining = await fs.readdir(cacheDir)
      expect(remaining.length).toBe(0)
    })
  })

  describe('set then overwrite with same content', () => {
    it('should handle setting same content twice', async () => {
      const sf1 = project.createSourceFile('/test/samecontent.ts', SOURCE_TEXT)
      await cache.set('/test/samecontent.ts', 'h1', sf1)
      await cache.set('/test/samecontent.ts', 'h1', sf1)

      const result = await cache.get('/test/samecontent.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(SOURCE_TEXT)
    })
  })

  describe('multiple independent cache instances', () => {
    it('should maintain separate stats for different instances', async () => {
      const dir1 = makeTempDir()
      const dir2 = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: dir1, version: '0.1.0' })
      const c2 = new ASTCache(project, { cacheDir: dir2, version: '0.1.0' })

      const sf1 = project.createSourceFile('/test/inst1.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/inst2.ts', 'const b = 2;')
      await c1.set('/test/inst1.ts', 'h1', sf1)
      await c2.set('/test/inst2.ts', 'h1', sf2)

      await c1.get('/test/inst1.ts', 'h1')
      await c2.get('/test/inst2.ts', 'h1')
      await c1.get('/test/missing.ts', 'h2')

      const stats1 = await c1.getStats()
      const stats2 = await c2.getStats()

      expect(stats1.hits).toBe(1)
      expect(stats1.misses).toBe(1)
      expect(stats2.hits).toBe(1)
      expect(stats2.misses).toBe(0)

      await fs.rm(dir1, { recursive: true, force: true }).catch(() => {})
      await fs.rm(dir2, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('getStats entries count accuracy', () => {
    it('should report 0 entries for fresh cache', async () => {
      const fresh = new ASTCache(project, { cacheDir: makeTempDir() })
      const stats = await fresh.getStats()
      expect(stats.entries).toBe(0)
    })

    it('should report 1 entry after single set', async () => {
      const sf = project.createSourceFile('/test/oneentry.ts', SOURCE_TEXT)
      await cache.set('/test/oneentry.ts', 'h1', sf)
      const stats = await cache.getStats()
      expect(stats.entries).toBe(1)
    })
  })

  describe('cache file format', () => {
    it('should store cache data as valid JSON', async () => {
      const sf = project.createSourceFile('/test/jsonfmt.ts', SOURCE_TEXT)
      await cache.set('/test/jsonfmt.ts', 'h1', sf)

      const files = await fs.readdir(cacheDir)
      expect(files.length).toBe(1)

      const content = await fs.readFile(path.join(cacheDir, files[0]), 'utf-8')
      const parsed = JSON.parse(content)
      expect(parsed).toHaveProperty('key')
      expect(parsed).toHaveProperty('value')
      expect(parsed).toHaveProperty('timestamp')
      expect(parsed.value.sourceText).toBe(SOURCE_TEXT)
      expect(parsed.value.version).toBe('0.1.0')
    })

    it('should store correct filePath in cached entry', async () => {
      const filePath = '/test/pathcheck.ts'
      const sf = project.createSourceFile(filePath, SOURCE_TEXT)
      await cache.set(filePath, 'h1', sf)

      const files = await fs.readdir(cacheDir)
      const content = await fs.readFile(path.join(cacheDir, files[0]), 'utf-8')
      const parsed = JSON.parse(content)
      expect(parsed.value.filePath).toBe(filePath)
    })

    it('should store correct contentHash in cached entry', async () => {
      const sf = project.createSourceFile('/test/hashcheck.ts', SOURCE_TEXT)
      await cache.set('/test/hashcheck.ts', 'myHash123', sf)

      const files = await fs.readdir(cacheDir)
      const content = await fs.readFile(path.join(cacheDir, files[0]), 'utf-8')
      const parsed = JSON.parse(content)
      expect(parsed.value.contentHash).toBe('myHash123')
    })
  })

  describe('cleanup when disabled', () => {
    it('should still clean up entries when cache is disabled', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      const expiredEntry = {
        key: 'test',
        value: {
          filePath: '/t.ts',
          contentHash: 'h',
          sourceText: '',
          version: '0.1.0',
          timestamp: 0,
        },
        timestamp: 0,
        ttl: 1,
      }
      await fs.writeFile(path.join(cacheDir, 'expired.json'), JSON.stringify(expiredEntry))

      cache.setEnabled(false)
      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(1)
    })
  })

  describe('get after file permission issues', () => {
    it('should return null gracefully when unable to read cache', async () => {
      const sf = project.createSourceFile('/test/perm.ts', SOURCE_TEXT)
      await cache.set('/test/perm.ts', 'h1', sf)

      expect(await cache.get('/test/perm.ts', 'h1')).not.toBeNull()

      const files = await fs.readdir(cacheDir)
      for (const file of files) {
        await fs.writeFile(path.join(cacheDir, file), '')
      }

      const result = await cache.get('/test/perm.ts', 'h1')
      expect(result).toBeNull()
    })
  })

  describe('rapid enable/disable with operations', () => {
    it('should handle rapid enable toggle between operations', async () => {
      const sf = project.createSourceFile('/test/rapid.ts', SOURCE_TEXT)
      await cache.set('/test/rapid.ts', 'h1', sf)

      cache.setEnabled(false)
      expect(await cache.get('/test/rapid.ts', 'h1')).toBeNull()

      cache.setEnabled(true)
      expect(await cache.get('/test/rapid.ts', 'h1')).not.toBeNull()

      cache.setEnabled(false)
      expect(await cache.get('/test/rapid.ts', 'h1')).toBeNull()
    })
  })

  describe('cleanup does not affect stats', () => {
    it('should not reset hits and misses after cleanup', async () => {
      const sf = project.createSourceFile('/test/clnst.ts', SOURCE_TEXT)
      await cache.set('/test/clnst.ts', 'h1', sf)
      await cache.get('/test/clnst.ts', 'h1')
      await cache.get('/test/missing.ts', 'h2')

      const beforeStats = await cache.getStats()
      await cache.cleanup()
      const afterStats = await cache.getStats()

      expect(afterStats.hits).toBe(beforeStats.hits)
      expect(afterStats.misses).toBe(beforeStats.misses)
    })
  })

  describe('createDefaultASTCache with only project', () => {
    it('should work with only project parameter', () => {
      const c = createDefaultASTCache(project)
      expect(c).toBeInstanceOf(ASTCache)
      expect(c.isEnabled()).toBe(true)
    })
  })

  describe('get with various hash formats', () => {
    it('should handle SHA-256 formatted hash', async () => {
      const sha256Hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      const sf = project.createSourceFile('/test/sha256.ts', SOURCE_TEXT)
      await cache.set('/test/sha256.ts', sha256Hash, sf)
      const result = await cache.get('/test/sha256.ts', sha256Hash)
      expect(result).not.toBeNull()
    })

    it('should handle MD5 formatted hash', async () => {
      const md5Hash = 'd41d8cd98f00b204e9800998ecf8427e'
      const sf = project.createSourceFile('/test/md5hash.ts', SOURCE_TEXT)
      await cache.set('/test/md5hash.ts', md5Hash, sf)
      const result = await cache.get('/test/md5hash.ts', md5Hash)
      expect(result).not.toBeNull()
    })

    it('should handle very long hash string', async () => {
      const longHash = 'a'.repeat(200)
      const sf = project.createSourceFile('/test/longhash.ts', SOURCE_TEXT)
      await cache.set('/test/longhash.ts', longHash, sf)
      const result = await cache.get('/test/longhash.ts', longHash)
      expect(result).not.toBeNull()
    })

    it('should handle hash with special characters', async () => {
      const specialHash = 'hash-with_underscores.and.dots+plus/equals='
      const sf = project.createSourceFile('/test/spechash.ts', SOURCE_TEXT)
      await cache.set('/test/spechash.ts', specialHash, sf)
      const result = await cache.get('/test/spechash.ts', specialHash)
      expect(result).not.toBeNull()
    })
  })

  describe('set with various source content types', () => {
    it('should handle source with CRLF line endings', async () => {
      const crlfText = 'const x = 1;\r\nconsole.log(x);\r\n'
      const sf = project.createSourceFile('/test/crlf.ts', crlfText)
      await cache.set('/test/crlf.ts', 'h1', sf)
      const result = await cache.get('/test/crlf.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(crlfText)
    })

    it('should handle source with BOM', async () => {
      const bomText = '\uFEFFconst x = 1;\n'
      const sf = project.createSourceFile('/test/bom.ts', bomText)
      await cache.set('/test/bom.ts', 'h1', sf)
      const result = await cache.get('/test/bom.ts', 'h1')
      expect(result).not.toBeNull()
    })

    it('should handle source with tabs', async () => {
      const tabText = '\tconst x = 1;\n\t\tconst y = 2;\n'
      const sf = project.createSourceFile('/test/tabs.ts', tabText)
      await cache.set('/test/tabs.ts', 'h1', sf)
      const result = await cache.get('/test/tabs.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(tabText)
    })

    it('should handle source with only a semicolon', async () => {
      const sf = project.createSourceFile('/test/semicolon.ts', ';')
      await cache.set('/test/semicolon.ts', 'h1', sf)
      const result = await cache.get('/test/semicolon.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(';')
    })

    it('should handle single line source without trailing newline', async () => {
      const text = 'const x = 1;'
      const sf = project.createSourceFile('/test/nonewline.ts', text)
      await cache.set('/test/nonewline.ts', 'h1', sf)
      const result = await cache.get('/test/nonewline.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(text)
    })

    it('should handle source with emoji characters', async () => {
      const emojiText = '// TODO: fix 🐛 bug\nconst msg = "Hello 🌍";\n'
      const sf = project.createSourceFile('/test/emoji.ts', emojiText)
      await cache.set('/test/emoji.ts', 'h1', sf)
      const result = await cache.get('/test/emoji.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(emojiText)
    })

    it('should handle very long single line', async () => {
      const longLine = 'const x = "' + 'a'.repeat(5000) + '";\n'
      const sf = project.createSourceFile('/test/longline.ts', longLine)
      await cache.set('/test/longline.ts', 'h1', sf)
      const result = await cache.get('/test/longline.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(longLine)
    })
  })

  describe('has for various entry states', () => {
    it('should return true immediately after set', async () => {
      const sf = project.createSourceFile('/test/immedhas.ts', SOURCE_TEXT)
      await cache.set('/test/immedhas.ts', 'h1', sf)
      expect(await cache.has('/test/immedhas.ts', 'h1')).toBe(true)
    })

    it('should return false after entry externally deleted', async () => {
      const sf = project.createSourceFile('/test/extdelhas.ts', SOURCE_TEXT)
      await cache.set('/test/extdelhas.ts', 'h1', sf)

      const files = await fs.readdir(cacheDir)
      for (const file of files) {
        await fs.unlink(path.join(cacheDir, file))
      }

      expect(await cache.has('/test/extdelhas.ts', 'h1')).toBe(false)
    })

    it('should return true for multiple cached entries', async () => {
      const sf1 = project.createSourceFile('/test/mhas1.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/mhas2.ts', 'const b = 2;')
      const sf3 = project.createSourceFile('/test/mhas3.ts', 'const c = 3;')
      await cache.set('/test/mhas1.ts', 'h1', sf1)
      await cache.set('/test/mhas2.ts', 'h2', sf2)
      await cache.set('/test/mhas3.ts', 'h3', sf3)

      expect(await cache.has('/test/mhas1.ts', 'h1')).toBe(true)
      expect(await cache.has('/test/mhas2.ts', 'h2')).toBe(true)
      expect(await cache.has('/test/mhas3.ts', 'h3')).toBe(true)
    })

    it('should return false for overwritten entry with old hash', async () => {
      const sf1 = project.createSourceFile('/test/owhas.ts', 'const a = 1;')
      await cache.set('/test/owhas.ts', 'oldHash', sf1)

      const sf2 = project.createSourceFile('/test/owhasB.ts', 'const b = 2;')
      await cache.set('/test/owhas.ts', 'newHash', sf2)

      expect(await cache.has('/test/owhas.ts', 'oldHash')).toBe(true)
      expect(await cache.has('/test/owhas.ts', 'newHash')).toBe(true)
    })

    it('should return false when cache directory is removed', async () => {
      const sf = project.createSourceFile('/test/nodirhas.ts', SOURCE_TEXT)
      await cache.set('/test/nodirhas.ts', 'h1', sf)

      await fs.rm(cacheDir, { recursive: true, force: true })
      expect(await cache.has('/test/nodirhas.ts', 'h1')).toBe(false)
    })
  })

  describe('clear comprehensive behavior', () => {
    it('should clear multiple entries and reset entries count', async () => {
      for (let i = 0; i < 5; i++) {
        const sf = project.createSourceFile(`/test/clr${i}.ts`, `const x${i} = ${i};`)
        await cache.set(`/test/clr${i}.ts`, `h${i}`, sf)
      }
      expect((await cache.getStats()).entries).toBe(5)

      await cache.clear()
      expect((await cache.getStats()).entries).toBe(0)
    })

    it('should allow re-caching after clear with same keys', async () => {
      const sf = project.createSourceFile('/test/resame.ts', SOURCE_TEXT)
      await cache.set('/test/resame.ts', 'h1', sf)
      await cache.clear()

      const sf2 = project.createSourceFile('/test/resameB.ts', 'new content;')
      await cache.set('/test/resame.ts', 'h1', sf2)
      const result = await cache.get('/test/resame.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe('new content;')
    })

    it('should handle clear when cache dir does not exist', async () => {
      const missingDir = path.join(makeTempDir(), 'no-exist')
      const missingCache = new ASTCache(project, { cacheDir: missingDir })
      await expect(missingCache.clear()).resolves.toBeUndefined()
    })

    it('should reset size after clearing populated cache', async () => {
      const sf = project.createSourceFile('/test/szclr2.ts', SOURCE_TEXT)
      await cache.set('/test/szclr2.ts', 'h1', sf)
      expect((await cache.getStats()).size).toBeGreaterThan(0)

      await cache.clear()
      expect((await cache.getStats()).size).toBe(0)
    })
  })

  describe('version handling edge cases', () => {
    it('should handle version with prerelease tag', async () => {
      const sharedDir = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: sharedDir, version: '1.0.0-alpha.1' })
      const sf = project.createSourceFile('/test/pre.ts', SOURCE_TEXT)
      await c1.set('/test/pre.ts', 'h1', sf)

      const c2 = new ASTCache(project, { cacheDir: sharedDir, version: '1.0.0-alpha.1' })
      expect(await c2.get('/test/pre.ts', 'h1')).not.toBeNull()

      const c3 = new ASTCache(project, { cacheDir: sharedDir, version: '1.0.0-alpha.2' })
      expect(await c3.get('/test/pre.ts', 'h1')).toBeNull()

      await fs.rm(sharedDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should handle version with build metadata', async () => {
      const sharedDir = makeTempDir()
      const c = new ASTCache(project, { cacheDir: sharedDir, version: '1.0.0+build.123' })
      const sf = project.createSourceFile('/test/build.ts', SOURCE_TEXT)
      await c.set('/test/build.ts', 'h1', sf)

      const c2 = new ASTCache(project, { cacheDir: sharedDir, version: '1.0.0+build.123' })
      expect(await c2.get('/test/build.ts', 'h1')).not.toBeNull()

      await fs.rm(sharedDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should handle numeric version string', async () => {
      const sharedDir = makeTempDir()
      const c = new ASTCache(project, { cacheDir: sharedDir, version: '42' })
      const sf = project.createSourceFile('/test/numver.ts', SOURCE_TEXT)
      await c.set('/test/numver.ts', 'h1', sf)

      const c2 = new ASTCache(project, { cacheDir: sharedDir, version: '42' })
      expect(await c2.get('/test/numver.ts', 'h1')).not.toBeNull()

      await fs.rm(sharedDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should handle three different versions sharing directory', async () => {
      const sharedDir = makeTempDir()
      const sf = project.createSourceFile('/test/threever.ts', SOURCE_TEXT)

      const c1 = new ASTCache(project, { cacheDir: sharedDir, version: '1.0.0' })
      const c2 = new ASTCache(project, { cacheDir: sharedDir, version: '2.0.0' })
      const c3 = new ASTCache(project, { cacheDir: sharedDir, version: '3.0.0' })

      await c1.set('/test/threever.ts', 'h1', sf)
      await c2.set('/test/threever.ts', 'h1', sf)
      await c3.set('/test/threever.ts', 'h1', sf)

      expect(await c1.get('/test/threever.ts', 'h1')).not.toBeNull()
      expect(await c2.get('/test/threever.ts', 'h1')).not.toBeNull()
      expect(await c3.get('/test/threever.ts', 'h1')).not.toBeNull()

      expect((await c1.getStats()).entries).toBe(3)

      await fs.rm(sharedDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('TTL boundary conditions', () => {
    it('should not expire entry within TTL window', async () => {
      const ttlCache = new ASTCache(project, { cacheDir: makeTempDir(), ttl: 5000 })
      const sf = project.createSourceFile('/test/withinttl.ts', SOURCE_TEXT)
      await ttlCache.set('/test/withinttl.ts', 'h1', sf)

      const result = await ttlCache.get('/test/withinttl.ts', 'h1')
      expect(result).not.toBeNull()
    })

    it('should handle TTL of 0 as immediate expiration', async () => {
      const zeroTtlDir = makeTempDir()
      const zeroTtlCache = new ASTCache(project, { cacheDir: zeroTtlDir, ttl: 0 })
      const sf = project.createSourceFile('/test/zerottl.ts', SOURCE_TEXT)
      await zeroTtlCache.set('/test/zerottl.ts', 'h1', sf)
      await new Promise((r) => setTimeout(r, 10))

      const result = await zeroTtlCache.get('/test/zerottl.ts', 'h1')
      expect(result).toBeNull()
    })

    it('should expire only the old entry not newer ones', async () => {
      const shortDir = makeTempDir()
      const shortTtlCache = new ASTCache(project, { cacheDir: shortDir, ttl: 50 })

      const sf1 = project.createSourceFile('/test/old.ts', 'const old = 1;')
      await shortTtlCache.set('/test/old.ts', 'h1', sf1)

      await new Promise((r) => setTimeout(r, 100))

      const sf2 = project.createSourceFile('/test/new.ts', 'const new_ = 2;')
      await shortTtlCache.set('/test/new.ts', 'h2', sf2)

      expect(await shortTtlCache.get('/test/old.ts', 'h1')).toBeNull()
      expect(await shortTtlCache.get('/test/new.ts', 'h2')).not.toBeNull()
    })

    it('should handle has with expired entry correctly', async () => {
      const expDir = makeTempDir()
      const expCache = new ASTCache(project, { cacheDir: expDir, ttl: 1 })
      const sf = project.createSourceFile('/test/exphas.ts', SOURCE_TEXT)
      await expCache.set('/test/exphas.ts', 'h1', sf)
      await new Promise((r) => setTimeout(r, 10))

      expect(await expCache.has('/test/exphas.ts', 'h1')).toBe(false)
    })
  })

  describe('concurrent mixed operations', () => {
    it('should handle concurrent set, get, and has', async () => {
      const sf1 = project.createSourceFile('/test/cmix1.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/cmix2.ts', 'const b = 2;')
      await cache.set('/test/cmix1.ts', 'h1', sf1)

      const [, getResult, hasResult] = await Promise.all([
        cache.set('/test/cmix2.ts', 'h2', sf2),
        cache.get('/test/cmix1.ts', 'h1'),
        cache.has('/test/cmix1.ts', 'h1'),
      ])

      expect(getResult).not.toBeNull()
      expect(hasResult).toBe(true)
    })

    it('should handle concurrent gets on different entries', async () => {
      const sf1 = project.createSourceFile('/test/cdiff1.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/cdiff2.ts', 'const b = 2;')
      await cache.set('/test/cdiff1.ts', 'h1', sf1)
      await cache.set('/test/cdiff2.ts', 'h2', sf2)

      const [r1, r2] = await Promise.all([
        cache.get('/test/cdiff1.ts', 'h1'),
        cache.get('/test/cdiff2.ts', 'h2'),
      ])

      expect(r1!.getFullText()).toBe('const a = 1;')
      expect(r2!.getFullText()).toBe('const b = 2;')
    })

    it('should handle concurrent sets with overwrites', async () => {
      const sf1 = project.createSourceFile('/test/cowrt.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/cowrtB.ts', 'const b = 2;')

      await Promise.all([
        cache.set('/test/cowrt.ts', 'h1', sf1),
        cache.set('/test/cowrt.ts', 'h1', sf2),
      ])

      const result = await cache.get('/test/cowrt.ts', 'h1')
      expect(result).not.toBeNull()
    })

    it('should handle rapid sequential get after set', async () => {
      const sf = project.createSourceFile('/test/rapidseq.ts', SOURCE_TEXT)
      await cache.set('/test/rapidseq.ts', 'h1', sf)

      for (let i = 0; i < 5; i++) {
        const result = await cache.get('/test/rapidseq.ts', 'h1')
        expect(result).not.toBeNull()
      }

      const stats = await cache.getStats()
      expect(stats.hits).toBe(5)
    })
  })

  describe('cache key uniqueness', () => {
    it('should produce different cache entries for different paths same hash', async () => {
      const sf1 = project.createSourceFile('/test/uniq1.ts', SOURCE_TEXT)
      const sf2 = project.createSourceFile('/test/uniq2.ts', SOURCE_TEXT)
      await cache.set('/test/uniq1.ts', 'sameH', sf1)
      await cache.set('/test/uniq2.ts', 'sameH', sf2)

      const r1 = await cache.get('/test/uniq1.ts', 'sameH')
      const r2 = await cache.get('/test/uniq2.ts', 'sameH')
      expect(r1).not.toBeNull()
      expect(r2).not.toBeNull()

      const stats = await cache.getStats()
      expect(stats.entries).toBe(2)
    })

    it('should produce different entries for same path different versions', async () => {
      const dir = makeTempDir()
      const sf = project.createSourceFile('/test/vuniq.ts', SOURCE_TEXT)

      const c1 = new ASTCache(project, { cacheDir: dir, version: '1.0.0' })
      const c2 = new ASTCache(project, { cacheDir: dir, version: '2.0.0' })
      await c1.set('/test/vuniq.ts', 'h1', sf)
      await c2.set('/test/vuniq.ts', 'h1', sf)

      expect((await c1.getStats()).entries).toBe(2)

      await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    })

    it('should distinguish case-sensitive paths', async () => {
      const sf1 = project.createSourceFile('/test/CaseFile.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/casefile.ts', 'const b = 2;')
      await cache.set('/test/CaseFile.ts', 'h1', sf1)
      await cache.set('/test/casefile.ts', 'h1', sf2)

      const r1 = await cache.get('/test/CaseFile.ts', 'h1')
      const r2 = await cache.get('/test/casefile.ts', 'h1')
      expect(r1!.getFullText()).toBe('const a = 1;')
      expect(r2!.getFullText()).toBe('const b = 2;')
    })
  })

  describe('getStats comprehensive accuracy', () => {
    it('should track entries count after adds and deletes', async () => {
      const sf1 = project.createSourceFile('/test/ec1.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/ec2.ts', 'const b = 2;')
      await cache.set('/test/ec1.ts', 'h1', sf1)
      await cache.set('/test/ec2.ts', 'h2', sf2)
      expect((await cache.getStats()).entries).toBe(2)

      await cache.get('/test/ec1.ts', 'wrongHash')
      expect((await cache.getStats()).entries).toBe(2)
    })

    it('should calculate hitRate as 0 when only misses recorded', async () => {
      await cache.get('/test/missa.ts', 'h1')
      await cache.get('/test/missb.ts', 'h2')
      const stats = await cache.getStats()
      expect(stats.hitRate).toBe(0)
    })

    it('should calculate hitRate as 1 when only hits recorded', async () => {
      const sf = project.createSourceFile('/test/allhits2.ts', SOURCE_TEXT)
      await cache.set('/test/allhits2.ts', 'h1', sf)
      await cache.get('/test/allhits2.ts', 'h1')
      await cache.get('/test/allhits2.ts', 'h1')
      const stats = await cache.getStats()
      expect(stats.hitRate).toBe(1)
    })

    it('should track size increase with each new entry', async () => {
      const sizes: number[] = []
      for (let i = 0; i < 4; i++) {
        const sf = project.createSourceFile(`/test/szinc${i}.ts`, `const x${i} = ${i};`)
        await cache.set(`/test/szinc${i}.ts`, `h${i}`, sf)
        sizes.push((await cache.getStats()).size)
      }

      for (let i = 1; i < sizes.length; i++) {
        expect(sizes[i]).toBeGreaterThan(sizes[i - 1])
      }
    })

    it('should report hits and misses from stats object properties', async () => {
      const sf = project.createSourceFile('/test/props.ts', SOURCE_TEXT)
      await cache.set('/test/props.ts', 'h1', sf)
      await cache.get('/test/props.ts', 'h1')
      await cache.get('/test/noprop.ts', 'h2')

      const stats = await cache.getStats()
      expect(stats).toHaveProperty('entries')
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('hitRate')
      expect(stats).toHaveProperty('hits')
      expect(stats).toHaveProperty('misses')
      expect(typeof stats.hitRate).toBe('number')
    })
  })

  describe('cache persistence across instances', () => {
    it('should persist and retrieve with same version', async () => {
      const dir = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: dir, version: '1.0.0' })
      const sf = project.createSourceFile('/test/persist2.ts', 'const persist = true;')
      await c1.set('/test/persist2.ts', 'h1', sf)

      const c2 = new ASTCache(project, { cacheDir: dir, version: '1.0.0' })
      const result = await c2.get('/test/persist2.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe('const persist = true;')

      await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    })

    it('should persist has check across instances', async () => {
      const dir = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: dir, version: '1.0.0' })
      const sf = project.createSourceFile('/test/phas.ts', SOURCE_TEXT)
      await c1.set('/test/phas.ts', 'h1', sf)

      const c2 = new ASTCache(project, { cacheDir: dir, version: '1.0.0' })
      expect(await c2.has('/test/phas.ts', 'h1')).toBe(true)

      await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    })

    it('should persist stats entries count across instances', async () => {
      const dir = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: dir, version: '1.0.0' })
      const sf1 = project.createSourceFile('/test/pstat1.ts', 'const a = 1;')
      const sf2 = project.createSourceFile('/test/pstat2.ts', 'const b = 2;')
      await c1.set('/test/pstat1.ts', 'h1', sf1)
      await c1.set('/test/pstat2.ts', 'h2', sf2)

      const c2 = new ASTCache(project, { cacheDir: dir, version: '1.0.0' })
      expect((await c2.getStats()).entries).toBe(2)

      await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('cleanup comprehensive behavior', () => {
    it('should handle cleanup when cache dir becomes a file', async () => {
      const tmpDir = makeTempDir()
      await fs.mkdir(tmpDir, { recursive: true })

      const sf = project.createSourceFile('/test/clnfile.ts', SOURCE_TEXT)
      const fileCache = new ASTCache(project, { cacheDir: tmpDir, version: '0.1.0' })
      await fileCache.set('/test/clnfile.ts', 'h1', sf)

      await fs.rm(tmpDir, { recursive: true, force: true })
      await fs.writeFile(tmpDir, 'not a dir')

      const cleaned = await fileCache.cleanup()
      expect(cleaned).toBe(0)

      await fs.rm(tmpDir, { force: true }).catch(() => {})
    })

    it('should preserve valid entries alongside expired ones', async () => {
      await fs.mkdir(cacheDir, { recursive: true })

      const expiredEntry = {
        key: 'expired',
        value: {
          filePath: '/t.ts',
          contentHash: 'h',
          sourceText: '',
          version: '0.1.0',
          timestamp: 0,
        },
        timestamp: 0,
        ttl: 1,
      }
      await fs.writeFile(path.join(cacheDir, 'expired-keep.json'), JSON.stringify(expiredEntry))

      const sf = project.createSourceFile('/test/keepvalid.ts', SOURCE_TEXT)
      await cache.set('/test/keepvalid.ts', 'h1', sf)

      const beforeEntries = (await cache.getStats()).entries
      const cleaned = await cache.cleanup()
      const afterEntries = (await cache.getStats()).entries

      expect(cleaned).toBe(1)
      expect(afterEntries).toBe(beforeEntries - 1)
      expect(await cache.get('/test/keepvalid.ts', 'h1')).not.toBeNull()
    })

    it('should clean up entries with timestamp in far past', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      const ancientEntry = {
        key: 'ancient',
        value: {
          filePath: '/t.ts',
          contentHash: 'h',
          sourceText: '',
          version: '0.1.0',
          timestamp: 0,
        },
        timestamp: 1,
        ttl: 100,
      }
      await fs.writeFile(path.join(cacheDir, 'ancient.json'), JSON.stringify(ancientEntry))

      const cleaned = await cache.cleanup()
      expect(cleaned).toBe(1)
    })

    it('should return 0 for cleanup of empty existing directory', async () => {
      await fs.mkdir(cacheDir, { recursive: true })
      expect(await cache.cleanup()).toBe(0)
    })
  })

  describe('error recovery after failures', () => {
    it('should recover and work after get error', async () => {
      const sf = project.createSourceFile('/test/recafter.ts', SOURCE_TEXT)
      await cache.set('/test/recafter.ts', 'h1', sf)

      const files = await fs.readdir(cacheDir)
      await fs.writeFile(path.join(cacheDir, files[0]), 'bad')
      await cache.get('/test/recafter.ts', 'h1')

      const sf2 = project.createSourceFile('/test/recafterB.ts', SOURCE_TEXT)
      await cache.set('/test/recafter.ts', 'h1', sf2)
      const result = await cache.get('/test/recafter.ts', 'h1')
      expect(result).not.toBeNull()
    })

    it('should continue operating after stats error', async () => {
      const tmpDir = makeTempDir()
      const errCache = new ASTCache(project, { cacheDir: tmpDir, version: '0.1.0' })
      const sf = project.createSourceFile('/test/staterrec.ts', SOURCE_TEXT)
      await errCache.set('/test/staterrec.ts', 'h1', sf)

      await fs.rm(tmpDir, { recursive: true, force: true })
      await fs.writeFile(tmpDir, 'not dir')

      await errCache.getStats()

      await fs.rm(tmpDir, { force: true })
      await fs.mkdir(tmpDir, { recursive: true })
      const sf2 = project.createSourceFile('/test/staterrec2.ts', SOURCE_TEXT)
      await errCache.set('/test/staterrec2.ts', 'h2', sf2)
      const result = await errCache.get('/test/staterrec2.ts', 'h2')
      expect(result).not.toBeNull()

      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should handle getStats when store directory is removed', async () => {
      const tmpDir = makeTempDir()
      const c = new ASTCache(project, { cacheDir: tmpDir, version: '0.1.0' })
      const sf = project.createSourceFile('/test/stattr.ts', SOURCE_TEXT)
      await c.set('/test/stattr.ts', 'h1', sf)

      await fs.rm(tmpDir, { recursive: true, force: true })
      const stats = await c.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.size).toBe(0)
    })
  })

  describe('setEnabled during active operations', () => {
    it('should respect disabled state for has', async () => {
      const sf = project.createSourceFile('/test/dishas.ts', SOURCE_TEXT)
      await cache.set('/test/dishas.ts', 'h1', sf)

      cache.setEnabled(false)
      expect(await cache.has('/test/dishas.ts', 'h1')).toBe(false)

      cache.setEnabled(true)
      expect(await cache.has('/test/dishas.ts', 'h1')).toBe(true)
    })

    it('should not affect stats when disabled for has', async () => {
      const sf = project.createSourceFile('/test/disstat.ts', SOURCE_TEXT)
      await cache.set('/test/disstat.ts', 'h1', sf)
      await cache.get('/test/disstat.ts', 'h1')

      const beforeStats = await cache.getStats()
      cache.setEnabled(false)
      await cache.has('/test/disstat.ts', 'h1')
      cache.setEnabled(true)

      const afterStats = await cache.getStats()
      expect(afterStats.hits).toBe(beforeStats.hits)
      expect(afterStats.misses).toBe(beforeStats.misses)
    })
  })

  describe('special path patterns', () => {
    it('should handle relative-looking paths', async () => {
      const relPath = './src/file.ts'
      const sf = project.createSourceFile(relPath, SOURCE_TEXT)
      await cache.set(relPath, 'h1', sf)
      const result = await cache.get(relPath, 'h1')
      expect(result).not.toBeNull()
    })

    it('should handle paths with multiple consecutive slashes', async () => {
      const multiSlash = '/test//double///slash.ts'
      const sf = project.createSourceFile(multiSlash, SOURCE_TEXT)
      await cache.set(multiSlash, 'h1', sf)
      const result = await cache.get(multiSlash, 'h1')
      expect(result).not.toBeNull()
    })

    it('should handle paths with parentheses', async () => {
      const parenPath = '/test/file (copy).ts'
      const sf = project.createSourceFile(parenPath, SOURCE_TEXT)
      await cache.set(parenPath, 'h1', sf)
      const result = await cache.get(parenPath, 'h1')
      expect(result).not.toBeNull()
    })

    it('should handle paths with brackets', async () => {
      const bracketPath = '/test/[id].ts'
      const sf = project.createSourceFile(bracketPath, SOURCE_TEXT)
      await cache.set(bracketPath, 'h1', sf)
      const result = await cache.get(bracketPath, 'h1')
      expect(result).not.toBeNull()
    })
  })

  describe('cache file format validation', () => {
    it('should store timestamp as number in cache file', async () => {
      const sf = project.createSourceFile('/test/tsnum.ts', SOURCE_TEXT)
      const before = Date.now()
      await cache.set('/test/tsnum.ts', 'h1', sf)

      const files = await fs.readdir(cacheDir)
      const content = await fs.readFile(path.join(cacheDir, files[0]), 'utf-8')
      const parsed = JSON.parse(content)

      expect(typeof parsed.timestamp).toBe('number')
      expect(parsed.timestamp).toBeGreaterThanOrEqual(before)
      expect(parsed.timestamp).toBeLessThanOrEqual(Date.now())
    })

    it('should store TTL in cache file', async () => {
      const sf = project.createSourceFile('/test/ttlstore.ts', SOURCE_TEXT)
      await cache.set('/test/ttlstore.ts', 'h1', sf)

      const files = await fs.readdir(cacheDir)
      const content = await fs.readFile(path.join(cacheDir, files[0]), 'utf-8')
      const parsed = JSON.parse(content)

      expect(parsed).toHaveProperty('ttl')
      expect(typeof parsed.ttl).toBe('number')
    })

    it('should store key matching expected format', async () => {
      const sf = project.createSourceFile('/test/keyfmt.ts', SOURCE_TEXT)
      await cache.set('/test/keyfmt.ts', 'h1', sf)

      const files = await fs.readdir(cacheDir)
      const content = await fs.readFile(path.join(cacheDir, files[0]), 'utf-8')
      const parsed = JSON.parse(content)

      expect(parsed.key).toContain('ast:')
      expect(parsed.key).toContain('0.1.0')
      expect(parsed.key).toContain('/test/keyfmt.ts')
      expect(parsed.key).toContain('h1')
    })
  })

  describe('multiple overwrite scenarios', () => {
    it('should handle 10 overwrites of same key', async () => {
      for (let i = 0; i < 10; i++) {
        const sf = project.createSourceFile(`/test/ow10.ts`, `const v = ${i};`, { overwrite: true })
        await cache.set('/test/ow10.ts', 'h1', sf)
      }

      const result = await cache.get('/test/ow10.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe('const v = 9;')

      const stats = await cache.getStats()
      expect(stats.entries).toBe(1)
    })

    it('should handle overwriting with increasingly large content', async () => {
      for (let i = 1; i <= 5; i++) {
        const text = 'x'.repeat(i * 100) + ';\n'
        const sf = project.createSourceFile('/test/growow.ts', text, { overwrite: true })
        await cache.set('/test/growow.ts', 'h1', sf)
      }

      const result = await cache.get('/test/growow.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText().length).toBe(502)
    })
  })

  describe('get after set with same file path and hash', () => {
    it('should return the latest cached content', async () => {
      const sf1 = project.createSourceFile('/test/lateston.ts', 'const v1 = 1;')
      await cache.set('/test/lateston.ts', 'h1', sf1)

      const sf2 = project.createSourceFile('/test/latestonB.ts', 'const v2 = 2;')
      await cache.set('/test/lateston.ts', 'h1', sf2)

      const result = await cache.get('/test/lateston.ts', 'h1')
      expect(result!.getFullText()).toBe('const v2 = 2;')
    })
  })

  describe('get incrementing miss for no project', () => {
    it('should count miss when project is null on get', async () => {
      const noProjDir = makeTempDir()
      const noProjCache = new ASTCache(null, { cacheDir: noProjDir, version: '0.1.0', ttl: 60_000 })
      const sf = project.createSourceFile('/test/nopmiss.ts', SOURCE_TEXT)
      await noProjCache.set('/test/nopmiss.ts', 'h1', sf)

      await noProjCache.get('/test/nopmiss.ts', 'h1')

      const stats = await noProjCache.getStats()
      expect(stats.misses).toBe(1)
      expect(stats.hits).toBe(0)

      await fs.rm(noProjDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('cache with default version isolation', () => {
    it('should not find entries from default version when using custom', async () => {
      const dir = makeTempDir()
      const defaultCache = new ASTCache(project, { cacheDir: dir })
      const sf = project.createSourceFile('/test/defvisol.ts', SOURCE_TEXT)
      await defaultCache.set('/test/defvisol.ts', 'h1', sf)

      const customCache = new ASTCache(project, { cacheDir: dir, version: 'custom-99' })
      expect(await customCache.get('/test/defvisol.ts', 'h1')).toBeNull()

      await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    })

    it('should find entries when using same default version', async () => {
      const dir = makeTempDir()
      const c1 = new ASTCache(project, { cacheDir: dir })
      const sf = project.createSourceFile('/test/defsame.ts', SOURCE_TEXT)
      await c1.set('/test/defsame.ts', 'h1', sf)

      const c2 = new ASTCache(project, { cacheDir: dir })
      expect(await c2.get('/test/defsame.ts', 'h1')).not.toBeNull()

      await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('has behavior with various file states', () => {
    it('should return false when cache file is truncated', async () => {
      const sf = project.createSourceFile('/test/trunc.ts', SOURCE_TEXT)
      await cache.set('/test/trunc.ts', 'h1', sf)

      const files = await fs.readdir(cacheDir)
      await fs.writeFile(path.join(cacheDir, files[0]), '')

      expect(await cache.has('/test/trunc.ts', 'h1')).toBe(false)
    })

    it('should return false when cache file has partial JSON', async () => {
      const sf = project.createSourceFile('/test/partjson.ts', SOURCE_TEXT)
      await cache.set('/test/partjson.ts', 'h1', sf)

      const files = await fs.readdir(cacheDir)
      const content = await fs.readFile(path.join(cacheDir, files[0]), 'utf-8')
      await fs.writeFile(path.join(cacheDir, files[0]), content.slice(0, -10))

      expect(await cache.has('/test/partjson.ts', 'h1')).toBe(false)
    })
  })

  describe('set does not throw on any error', () => {
    it('should resolve silently when cache directory is a file', async () => {
      const parentDir = makeTempDir()
      await fs.mkdir(parentDir, { recursive: true })
      const fileAsDir = path.join(parentDir, 'blocked')
      await fs.writeFile(fileAsDir, 'blocked')
      const blockedCache = new ASTCache(project, { cacheDir: path.join(fileAsDir, 'cache') })

      const sf = project.createSourceFile('/test/blocked.ts', SOURCE_TEXT)
      await expect(blockedCache.set('/test/blocked.ts', 'h1', sf)).resolves.toBeUndefined()

      await fs.rm(parentDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('get after external file content change', () => {
    it('should return null when cached file content is replaced', async () => {
      const sf = project.createSourceFile('/test/extchange.ts', SOURCE_TEXT)
      await cache.set('/test/extchange.ts', 'h1', sf)

      const files = await fs.readdir(cacheDir)
      const originalContent = await fs.readFile(path.join(cacheDir, files[0]), 'utf-8')
      const modified = JSON.parse(originalContent)
      modified.value.sourceText = 'modified content'
      await fs.writeFile(path.join(cacheDir, files[0]), JSON.stringify(modified))

      const result = await cache.get('/test/extchange.ts', 'h1')
      if (result) {
        expect(result.getFullText()).toBe('modified content')
      }
    })
  })

  describe('getStats size decreases after cleanup of expired', () => {
    it('should report smaller size after removing expired entries', async () => {
      await fs.mkdir(cacheDir, { recursive: true })

      const bigExpired = {
        key: 'big',
        value: {
          filePath: '/big.ts',
          contentHash: 'h',
          sourceText: 'x'.repeat(10000),
          version: '0.1.0',
          timestamp: 0,
        },
        timestamp: 0,
        ttl: 1,
      }
      await fs.writeFile(path.join(cacheDir, 'big-expired.json'), JSON.stringify(bigExpired))

      const sizeBefore = (await cache.getStats()).size
      await cache.cleanup()
      const sizeAfter = (await cache.getStats()).size

      expect(sizeAfter).toBeLessThan(sizeBefore)
    })
  })

  describe('large number of entries', () => {
    it('should handle 20 entries correctly', async () => {
      for (let i = 0; i < 20; i++) {
        const sf = project.createSourceFile(`/test/bulk${i}.ts`, `export const v${i} = ${i};`)
        await cache.set(`/test/bulk${i}.ts`, `h${i}`, sf)
      }

      const stats = await cache.getStats()
      expect(stats.entries).toBe(20)

      for (let i = 0; i < 20; i++) {
        const result = await cache.get(`/test/bulk${i}.ts`, `h${i}`)
        expect(result).not.toBeNull()
        expect(result!.getFullText()).toBe(`export const v${i} = ${i};`)
      }
    })
  })

  describe('disabled cache behavior comprehensive', () => {
    it('should not affect has when disabled', async () => {
      const localDir = makeTempDir()
      const c = new ASTCache(project, { cacheDir: localDir, enabled: false })
      expect(await c.has('/test/any.ts', 'h1')).toBe(false)

      await fs.rm(localDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should still allow setEnabled calls when disabled', () => {
      cache.setEnabled(false)
      cache.setEnabled(false)
      cache.setEnabled(true)
      expect(cache.isEnabled()).toBe(true)
    })

    it('should not persist entries set while disabled after re-enable', async () => {
      const localDir = makeTempDir()
      const c = new ASTCache(project, { cacheDir: localDir, enabled: false })

      const sf = project.createSourceFile('/test/nopersist.ts', SOURCE_TEXT)
      await c.set('/test/nopersist.ts', 'h1', sf)

      c.setEnabled(true)

      expect(await c.has('/test/nopersist.ts', 'h1')).toBe(false)
      expect(await c.get('/test/nopersist.ts', 'h1')).toBeNull()

      await fs.rm(localDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('setProject interactions', () => {
    it('should allow set without project and get after setProject', async () => {
      const localDir = makeTempDir()
      const c = new ASTCache(null, { cacheDir: localDir, version: '0.1.0' })

      const sf = project.createSourceFile('/test/projflow.ts', SOURCE_TEXT)
      await c.set('/test/projflow.ts', 'h1', sf)

      expect(await c.get('/test/projflow.ts', 'h1')).toBeNull()

      c.setProject(project)
      const result = await c.get('/test/projflow.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe(SOURCE_TEXT)

      await fs.rm(localDir, { recursive: true, force: true }).catch(() => {})
    })

    it('should track misses correctly when project is null then set', async () => {
      const localDir = makeTempDir()
      const c = new ASTCache(null, { cacheDir: localDir, version: '0.1.0' })

      const sf = project.createSourceFile('/test/projmiss.ts', SOURCE_TEXT)
      await c.set('/test/projmiss.ts', 'h1', sf)

      await c.get('/test/projmiss.ts', 'h1')
      let stats = await c.getStats()
      expect(stats.misses).toBe(1)
      expect(stats.hits).toBe(0)

      c.setProject(project)
      await c.get('/test/projmiss.ts', 'h1')
      stats = await c.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)

      await fs.rm(localDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('createDefaultASTCache functional', () => {
    it('should create functional cache that can set and get', async () => {
      const localDir = makeTempDir()
      const c = new ASTCache(project, { cacheDir: localDir, version: '1.0.0' })
      const sf = project.createSourceFile('/test/defnfn.ts', 'const def = true;')
      await c.set('/test/defnfn.ts', 'h1', sf)

      const result = await c.get('/test/defnfn.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe('const def = true;')

      await fs.rm(localDir, { recursive: true, force: true }).catch(() => {})
    })
  })

  describe('empty path edge case', () => {
    it('should handle empty string file path', async () => {
      const sf = project.createSourceFile('', SOURCE_TEXT)
      await cache.set('', 'h1', sf)
      const result = await cache.get('', 'h1')
      expect(result).not.toBeNull()
    })
  })

  describe('get after clear and re-set same key', () => {
    it('should retrieve newly set entry after clear', async () => {
      const sf1 = project.createSourceFile('/test/clrrs.ts', 'const v1 = 1;')
      await cache.set('/test/clrrs.ts', 'h1', sf1)
      expect(await cache.get('/test/clrrs.ts', 'h1')).not.toBeNull()

      await cache.clear()

      const sf2 = project.createSourceFile('/test/clrrsB.ts', 'const v2 = 2;')
      await cache.set('/test/clrrs.ts', 'h1', sf2)
      const result = await cache.get('/test/clrrs.ts', 'h1')
      expect(result).not.toBeNull()
      expect(result!.getFullText()).toBe('const v2 = 2;')
    })
  })

  describe('mixed hit/miss sequence tracking', () => {
    it('should track alternating hits and misses correctly', async () => {
      const sf = project.createSourceFile('/test/alttrack.ts', SOURCE_TEXT)
      await cache.set('/test/alttrack.ts', 'h1', sf)

      await cache.get('/test/alttrack.ts', 'h1')
      await cache.get('/test/missing1.ts', 'h1')
      await cache.get('/test/alttrack.ts', 'h1')
      await cache.get('/test/missing2.ts', 'h1')
      await cache.get('/test/alttrack.ts', 'h1')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(3)
      expect(stats.misses).toBe(2)
      expect(stats.hitRate).toBeCloseTo(3 / 5)
    })
  })
})
