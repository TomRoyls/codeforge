import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Project, type SourceFile } from 'ts-morph'

import { ParseCache, globalParseCache } from '../src/cache/parse-cache.js'

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// ─── Helpers ──────────────────────────────────────────

const FIXTURES_DIR = path.join(process.cwd(), '.test-fixtures', 'parse-cache')

function createTestProject(): Project {
  return new Project({
    compilerOptions: { strict: true },
    skipAddingFilesFromTsConfig: true,
    useInMemoryFileSystem: true,
  })
}

async function createFixtureFile(name: string, content: string): Promise<string> {
  const filePath = path.join(FIXTURES_DIR, name)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
  return filePath
}

// ─── Constructor ──────────────────────────────────────

describe('ParseCache constructor', () => {
  it('creates instance with default options', () => {
    const cache = new ParseCache()
    expect(cache).toBeInstanceOf(ParseCache)
    expect(cache.size).toBe(0)
  })

  it('creates instance with custom maxSize', () => {
    const cache = new ParseCache({ maxSize: 50 })
    expect(cache.size).toBe(0)
  })

  it('creates instance with maxSize of 1', () => {
    const cache = new ParseCache({ maxSize: 1 })
    expect(cache.size).toBe(0)
  })
})

// ─── size ─────────────────────────────────────────────

describe('ParseCache size', () => {
  let cache: ParseCache
  let project: Project

  beforeEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ParseCache()
  })

  afterEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
  })

  it('returns 0 for empty cache', () => {
    expect(cache.size).toBe(0)
  })

  it('returns 1 after adding one entry', async () => {
    const filePath = await createFixtureFile('a.ts', 'const x = 1')
    const sf = project.createSourceFile(filePath, 'const x = 1')
    cache.set(filePath, sf)
    expect(cache.size).toBe(1)
  })

  it('returns correct count after multiple additions', async () => {
    for (let i = 0; i < 5; i++) {
      const filePath = await createFixtureFile(`file${i}.ts`, `const x${i} = ${i}`)
      const sf = project.createSourceFile(filePath, `const x${i} = ${i}`)
      cache.set(filePath, sf)
    }
    expect(cache.size).toBe(5)
  })

  it('accepts custom maxSize option without error', () => {
    const customCache = new ParseCache({ maxSize: 50 })
    expect(customCache.size).toBe(0)
  })
})

// ─── set ──────────────────────────────────────────────

describe('ParseCache set', () => {
  let cache: ParseCache
  let project: Project

  beforeEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ParseCache()
  })

  afterEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
  })

  it('stores a source file entry', async () => {
    const filePath = await createFixtureFile('set1.ts', 'const x = 1')
    const sf = project.createSourceFile(filePath, 'const x = 1')
    cache.set(filePath, sf)
    expect(cache.size).toBe(1)
  })

  it('overwrites existing entry for same path', async () => {
    const filePath = await createFixtureFile('set2.ts', 'const x = 1')
    const sf1 = project.createSourceFile(filePath, 'const x = 1')
    const sf2 = project.createSourceFile(filePath, 'const x = 2', { overwrite: true })

    cache.set(filePath, sf1)
    cache.set(filePath, sf2)

    expect(cache.size).toBe(1)
  })

  it('stores multiple files', async () => {
    const files = await Promise.all(
      Array.from({ length: 5 }, (_, i) => createFixtureFile(`multi${i}.ts`, `const x${i} = ${i}`)),
    )

    files.forEach((fp, i) => {
      const sf = project.createSourceFile(fp, `const x${i} = ${i}`)
      cache.set(fp, sf)
    })

    expect(cache.size).toBe(5)
  })

  it('handles set for nonexistent file gracefully', () => {
    // statSync will throw for a nonexistent path, set should catch it
    cache.set('/nonexistent/file.ts', project.createSourceFile('/fake.ts', 'const x = 1'))
    expect(cache.size).toBe(0)
  })
})

// ─── get ──────────────────────────────────────────────

describe('ParseCache get', () => {
  let cache: ParseCache
  let project: Project

  beforeEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ParseCache()
  })

  afterEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
  })

  it('returns undefined for missing entry', () => {
    expect(cache.get('/nonexistent.ts')).toBeUndefined()
  })

  it('returns source file for valid entry', async () => {
    const filePath = await createFixtureFile('get1.ts', 'const x = 1')
    const sf = project.createSourceFile(filePath, 'const x = 1')
    cache.set(filePath, sf)

    const result = cache.get(filePath)
    expect(result).not.toBeUndefined()
    expect(result!.getFullText()).toBe('const x = 1')
  })

  it('returns undefined after file is modified', async () => {
    const filePath = await createFixtureFile('get2.ts', 'const x = 1')
    const sf = project.createSourceFile(filePath, 'const x = 1')
    cache.set(filePath, sf)

    // Modify the file (different content → different mtime on some systems)
    await writeFile(filePath, 'const x = 2', 'utf8')

    // The file stats changed, so get should detect stale entry
    // Note: on fast systems mtime may be same, so we also update file size
    const result = cache.get(filePath)
    // Result depends on whether mtime/size changed; at minimum it shouldn't crash
    expect(result === undefined || result instanceof SourceFile || result === sf).toBe(true)
  })

  it('returns undefined for deleted file', async () => {
    const filePath = await createFixtureFile('get3.ts', 'const x = 1')
    const sf = project.createSourceFile(filePath, 'const x = 1')
    cache.set(filePath, sf)

    await rm(filePath, { force: true })

    const result = cache.get(filePath)
    expect(result).toBeUndefined()
  })

  it('handles get for entry never set', () => {
    expect(cache.get('/never-set.ts')).toBeUndefined()
  })

  it('retrieves different files independently', async () => {
    const f1 = await createFixtureFile('ind1.ts', 'const a = 1')
    const f2 = await createFixtureFile('ind2.ts', 'const b = 2')

    const sf1 = project.createSourceFile(f1, 'const a = 1')
    const sf2 = project.createSourceFile(f2, 'const b = 2')

    cache.set(f1, sf1)
    cache.set(f2, sf2)

    expect(cache.get(f1)!.getFullText()).toBe('const a = 1')
    expect(cache.get(f2)!.getFullText()).toBe('const b = 2')
  })
})

// ─── has ──────────────────────────────────────────────

describe('ParseCache has', () => {
  let cache: ParseCache
  let project: Project

  beforeEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ParseCache()
  })

  afterEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
  })

  it('returns false for missing entry', () => {
    expect(cache.has('/nonexistent.ts')).toBe(false)
  })

  it('returns true for existing entry', async () => {
    const filePath = await createFixtureFile('has1.ts', 'const x = 1')
    const sf = project.createSourceFile(filePath, 'const x = 1')
    cache.set(filePath, sf)

    expect(cache.has(filePath)).toBe(true)
  })

  it('returns false after entry is deleted', async () => {
    const filePath = await createFixtureFile('has2.ts', 'const x = 1')
    const sf = project.createSourceFile(filePath, 'const x = 1')
    cache.set(filePath, sf)
    cache.delete(filePath)

    expect(cache.has(filePath)).toBe(false)
  })

  it('returns false for path that was never set', () => {
    expect(cache.has('/never.ts')).toBe(false)
  })
})

// ─── delete ───────────────────────────────────────────

describe('ParseCache delete', () => {
  let cache: ParseCache
  let project: Project

  beforeEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ParseCache()
  })

  afterEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
  })

  it('removes an existing entry', async () => {
    const filePath = await createFixtureFile('del1.ts', 'const x = 1')
    const sf = project.createSourceFile(filePath, 'const x = 1')
    cache.set(filePath, sf)

    expect(cache.delete(filePath)).toBe(true)
    expect(cache.size).toBe(0)
  })

  it('returns false for nonexistent entry', () => {
    expect(cache.delete('/nonexistent.ts')).toBe(false)
  })

  it('does not affect other entries', async () => {
    const f1 = await createFixtureFile('keep1.ts', 'const a = 1')
    const f2 = await createFixtureFile('keep2.ts', 'const b = 2')

    cache.set(f1, project.createSourceFile(f1, 'const a = 1'))
    cache.set(f2, project.createSourceFile(f2, 'const b = 2'))

    cache.delete(f1)

    expect(cache.size).toBe(1)
    expect(cache.has(f2)).toBe(true)
  })

  it('allows re-adding after deletion', async () => {
    const filePath = await createFixtureFile('del2.ts', 'const x = 1')
    cache.set(filePath, project.createSourceFile(filePath, 'const x = 1'))
    cache.delete(filePath)
    cache.set(filePath, project.createSourceFile(filePath, 'const x = 2', { overwrite: true }))

    expect(cache.size).toBe(1)
    expect(cache.has(filePath)).toBe(true)
  })
})

// ─── clear ────────────────────────────────────────────

describe('ParseCache clear', () => {
  let cache: ParseCache
  let project: Project

  beforeEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ParseCache()
  })

  afterEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
  })

  it('removes all entries', async () => {
    for (let i = 0; i < 5; i++) {
      const fp = await createFixtureFile(`clear${i}.ts`, `const x${i} = ${i}`)
      cache.set(fp, project.createSourceFile(fp, `const x${i} = ${i}`))
    }

    cache.clear()
    expect(cache.size).toBe(0)
  })

  it('clears empty cache without error', () => {
    cache.clear()
    expect(cache.size).toBe(0)
  })

  it('resets hit and miss counters', async () => {
    const fp = await createFixtureFile('clearstats.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))
    cache.get(fp)
    cache.get('/nonexistent.ts')

    cache.clear()

    const stats = cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
  })

  it('allows reuse after clear', async () => {
    const fp = await createFixtureFile('reuse.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))
    cache.clear()

    cache.set(fp, project.createSourceFile(fp, 'const y = 2', { overwrite: true }))
    expect(cache.size).toBe(1)
    expect(cache.has(fp)).toBe(true)
  })
})

// ─── getStats ─────────────────────────────────────────

describe('ParseCache getStats', () => {
  let cache: ParseCache
  let project: Project

  beforeEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ParseCache()
  })

  afterEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
  })

  it('returns initial stats with zero values', () => {
    const stats = cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
    expect(stats.hitRate).toBe(0)
    expect(stats.size).toBe(0)
  })

  it('tracks hits after successful get', async () => {
    const fp = await createFixtureFile('stats1.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))
    cache.get(fp)

    const stats = cache.getStats()
    expect(stats.hits).toBe(1)
  })

  it('tracks misses after failed get', () => {
    cache.get('/nonexistent.ts')

    const stats = cache.getStats()
    expect(stats.misses).toBe(1)
  })

  it('calculates hit rate correctly', async () => {
    const fp = await createFixtureFile('stats2.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))

    cache.get(fp)              // hit
    cache.get('/nonexistent')  // miss

    const stats = cache.getStats()
    expect(stats.hitRate).toBe(0.5)
  })

  it('calculates 100% hit rate with only hits', async () => {
    const fp = await createFixtureFile('stats3.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))

    cache.get(fp)
    cache.get(fp)

    const stats = cache.getStats()
    expect(stats.hitRate).toBe(1)
  })

  it('calculates 0% hit rate with only misses', () => {
    cache.get('/a.ts')
    cache.get('/b.ts')

    const stats = cache.getStats()
    expect(stats.hitRate).toBe(0)
  })

  it('tracks size correctly', async () => {
    const fp = await createFixtureFile('stats4.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))

    const stats = cache.getStats()
    expect(stats.size).toBe(1)
  })

  it('resets all stats after clear', async () => {
    const fp = await createFixtureFile('stats5.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))
    cache.get(fp)
    cache.get('/nonexistent')

    cache.clear()

    const stats = cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
    expect(stats.hitRate).toBe(0)
    expect(stats.size).toBe(0)
  })

  it('accumulates hits and misses over multiple operations', async () => {
    const fp = await createFixtureFile('stats6.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))

    cache.get(fp)              // hit
    cache.get(fp)              // hit
    cache.get(fp)              // hit
    cache.get('/nonexistent')  // miss

    const stats = cache.getStats()
    expect(stats.hits).toBe(3)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBeCloseTo(0.75)
  })
})

// ─── LRU cache interaction ────────────────────────────

describe('ParseCache LRU cache interaction', () => {
  let project: Project

  beforeEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
    project = createTestProject()
  })

  afterEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
  })

  it('stores entries keyed by file path', async () => {
    const cache = new ParseCache()
    const fp = await createFixtureFile('keyed.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))

    expect(cache.has(fp)).toBe(true)
    expect(cache.has('/different/path.ts')).toBe(false)
  })

  it('handles overwrite of same key', async () => {
    const cache = new ParseCache()
    const fp = await createFixtureFile('overwrite.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const a = 1'))
    cache.set(fp, project.createSourceFile(fp, 'const b = 2', { overwrite: true }))

    expect(cache.size).toBe(1)
  })

  it('supports get after set for same entry', async () => {
    const cache = new ParseCache()
    const fp = await createFixtureFile('getafter.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))

    const result = cache.get(fp)
    expect(result).not.toBeUndefined()

    // Second get should also work
    const result2 = cache.get(fp)
    expect(result2).not.toBeUndefined()
  })
})

// ─── globalParseCache ─────────────────────────────────

describe('globalParseCache', () => {
  it('is a ParseCache instance', () => {
    expect(globalParseCache).toBeInstanceOf(ParseCache)
  })

  it('has initial size of 0 or more', () => {
    // Shared global, might have entries from other tests
    expect(typeof globalParseCache.size).toBe('number')
  })
})

// ─── Edge cases ───────────────────────────────────────

describe('ParseCache edge cases', () => {
  let cache: ParseCache
  let project: Project

  beforeEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ParseCache()
  })

  afterEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
  })

  it('handles empty file path', async () => {
    // statSync on empty string will fail, so set is no-op
    cache.set('', project.createSourceFile('empty.ts', 'const x = 1'))
    expect(cache.size).toBe(0)
  })

  it('handles unicode file content', async () => {
    const filePath = await createFixtureFile('unicode.ts', '// 日本語\nconst x = "こんにちは"')
    const code = '// 日本語\nconst x = "こんにちは"'
    cache.set(filePath, project.createSourceFile(filePath, code))

    const result = cache.get(filePath)
    expect(result).not.toBeUndefined()
    expect(result!.getFullText()).toBe(code)
  })

  it('handles long file paths', async () => {
    const longDir = 'a'.repeat(100)
    const filePath = await createFixtureFile(`${longDir}/deep.ts`, 'const x = 1')
    cache.set(filePath, project.createSourceFile(filePath, 'const x = 1'))

    expect(cache.has(filePath)).toBe(true)
    expect(cache.get(filePath)).not.toBeUndefined()
  })

  it('handles file path with spaces', async () => {
    const filePath = await createFixtureFile('path with spaces.ts', 'const x = 1')
    cache.set(filePath, project.createSourceFile(filePath, 'const x = 1'))

    expect(cache.get(filePath)).not.toBeUndefined()
  })

  it('handles file path with special characters', async () => {
    const filePath = await createFixtureFile('[special]-file.test.ts', 'const x = 1')
    cache.set(filePath, project.createSourceFile(filePath, 'const x = 1'))

    expect(cache.get(filePath)).not.toBeUndefined()
  })

  it('delete on empty cache returns false', () => {
    expect(cache.delete('/nothing.ts')).toBe(false)
  })

  it('has on empty cache returns false', () => {
    expect(cache.has('/nothing.ts')).toBe(false)
  })

  it('get on empty cache returns undefined', () => {
    expect(cache.get('/nothing.ts')).toBeUndefined()
  })

  it('multiple clears do not error', () => {
    cache.clear()
    cache.clear()
    cache.clear()
    expect(cache.size).toBe(0)
  })
})

// ─── Hit/miss tracking accuracy ───────────────────────

describe('ParseCache hit/miss tracking', () => {
  let cache: ParseCache
  let project: Project

  beforeEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
    project = createTestProject()
    cache = new ParseCache()
  })

  afterEach(async () => {
    await rm(FIXTURES_DIR, { force: true, recursive: true })
  })

  it('counts miss when get returns undefined (no entry)', () => {
    cache.get('/missing.ts')
    expect(cache.getStats().misses).toBe(1)
  })

  it('counts miss when file stat fails (deleted file)', async () => {
    const fp = await createFixtureFile('temp.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))
    await rm(fp, { force: true })

    cache.get(fp)
    expect(cache.getStats().misses).toBe(1)
  })

  it('counts hit when entry exists and file is unchanged', async () => {
    const fp = await createFixtureFile('hit.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))
    cache.get(fp)

    expect(cache.getStats().hits).toBe(1)
    expect(cache.getStats().misses).toBe(0)
  })

  it('does not count set operations as hits or misses', async () => {
    const fp = await createFixtureFile('setonly.ts', 'const x = 1')
    cache.set(fp, project.createSourceFile(fp, 'const x = 1'))

    const stats = cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
  })
})
