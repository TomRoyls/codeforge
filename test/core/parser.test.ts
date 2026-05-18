import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Project } from 'ts-morph'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { globalParseCache } from '../../src/cache/parse-cache.js'
import { Parser, type ParseError, type ParseFilesResult, type ParseResult } from '../../src/core/parser.js'

// ─── Type Exports ───

describe('ParseError type', () => {
  it('has expected shape', () => {
    const err: ParseError = { error: new Error('test'), filePath: 'test.ts' }
    expect(err.error.message).toBe('test')
    expect(err.filePath).toBe('test.ts')
  })
})

describe('ParseResult type', () => {
  it('has expected shape', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('test.ts', 'const x = 1')
    const result: ParseResult = {
      cached: false,
      filePath: 'test.ts',
      parseTime: 5.0,
      sourceFile: sf,
    }
    expect(result.cached).toBe(false)
    expect(result.filePath).toBe('test.ts')
    expect(result.parseTime).toBeGreaterThanOrEqual(0)
  })
})

// ─── Parser Constructor ───

describe('Parser constructor', () => {
  it('creates parser with default options', () => {
    const parser = new Parser()
    expect(parser.getProject()).toBeNull()
    parser.dispose()
  })

  it('creates parser with custom options', () => {
    const parser = new Parser({ concurrency: 8 })
    expect(parser.getProject()).toBeNull()
    parser.dispose()
  })

  it('creates parser with disk cache option', () => {
    const parser = new Parser({ useDiskCache: true, version: '1.0.0' })
    expect(parser.getProject()).toBeNull()
    parser.dispose()
  })
})

// ─── Parser Lifecycle ───

describe('Parser lifecycle', () => {
  let parser: Parser

  beforeEach(() => {
    parser = new Parser()
    globalParseCache.clear()
  })

  afterEach(() => {
    parser.dispose()
  })

  it('initialize creates project', async () => {
    expect(parser.getProject()).toBeNull()
    await parser.initialize()
    expect(parser.getProject()).not.toBeNull()
  })

  it('dispose clears project', async () => {
    await parser.initialize()
    expect(parser.getProject()).not.toBeNull()
    parser.dispose()
    expect(parser.getProject()).toBeNull()
  })

  it('dispose clears AST cache', async () => {
    const p = new Parser({ useDiskCache: true, version: '1.0.0' })
    await p.initialize()
    expect(p.getASTCache()).not.toBeNull()
    p.dispose()
    expect(p.getASTCache()).toBeNull()
  })

  it('clearCache clears globalParseCache', async () => {
    await parser.initialize()
    globalParseCache.set('test.ts', {} as never)
    await parser.clearCache()
    expect(globalParseCache.get('test.ts')).toBeUndefined()
  })
})

// ─── Parser getASTCache ───

describe('Parser getASTCache', () => {
  it('returns null when disk cache not enabled', () => {
    const parser = new Parser()
    expect(parser.getASTCache()).toBeNull()
    parser.dispose()
  })

  it('returns ASTCache when disk cache enabled and initialized', async () => {
    const parser = new Parser({ useDiskCache: true, version: '1.0.0' })
    await parser.initialize()
    expect(parser.getASTCache()).not.toBeNull()
    parser.dispose()
  })
})

// ─── Parser getCacheStats ───

describe('Parser getCacheStats', () => {
  let parser: Parser

  beforeEach(() => {
    parser = new Parser()
    globalParseCache.clear()
  })

  afterEach(() => {
    parser.dispose()
  })

  it('returns memory stats', async () => {
    await parser.initialize()
    const stats = await parser.getCacheStats()
    expect(stats.memory).toBeDefined()
    expect(typeof stats.memory.hitRate).toBe('number')
    expect(typeof stats.memory.hits).toBe('number')
    expect(typeof stats.memory.misses).toBe('number')
  })

  it('returns null disk stats when disk cache not enabled', async () => {
    await parser.initialize()
    const stats = await parser.getCacheStats()
    expect(stats.disk).toBeNull()
  })
})

// ─── Parser releaseFile ───

describe('Parser releaseFile', () => {
  beforeEach(() => {
    globalParseCache.clear()
  })

  it('removes file from cache', () => {
    const parser = new Parser()
    globalParseCache.set('test.ts', {} as never)
    parser.releaseFile('test.ts')
    expect(globalParseCache.get('test.ts')).toBeUndefined()
    parser.dispose()
  })

  it('does nothing for non-cached file', () => {
    const parser = new Parser()
    parser.releaseFile('nonexistent.ts')
    expect(globalParseCache.get('nonexistent.ts')).toBeUndefined()
    parser.dispose()
  })
})

// ─── Parser parseFile (in-memory) ───

describe('Parser parseFile', () => {
  let parser: Parser
  let tmpDir: string

  beforeEach(async () => {
    parser = new Parser()
    globalParseCache.clear()
    await parser.initialize()

    // Create a temp file for testing
    const { mkdir, writeFile } = await import('node:fs/promises')
    tmpDir = join(process.cwd(), '.tmp-parser-test')
    await mkdir(tmpDir, { recursive: true })
    await writeFile(join(tmpDir, 'sample.ts'), 'export const x = 1;\n')
  })

  afterEach(async () => {
    parser.dispose()
    const { rm } = await import('node:fs/promises')
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  })

  it('parses a valid TypeScript file', async () => {
    const result = await parser.parseFile(join(tmpDir, 'sample.ts'))
    expect(result.filePath).toBe(join(tmpDir, 'sample.ts'))
    expect(result.cached).toBe(false)
    expect(result.sourceFile).toBeDefined()
    expect(result.parseTime).toBeGreaterThanOrEqual(0)
  })

  it('caches parsed file in memory', async () => {
    const filePath = join(tmpDir, 'sample.ts')
    const result1 = await parser.parseFile(filePath)
    expect(result1.cached).toBe(false)

    const result2 = await parser.parseFile(filePath)
    expect(result2.cached).toBe(true)
    expect(result2.diskCached).toBe(false)
  })

  it('initializes project lazily if not initialized', async () => {
    const lazyParser = new Parser()
    globalParseCache.clear()
    expect(lazyParser.getProject()).toBeNull()

    await lazyParser.parseFile(join(tmpDir, 'sample.ts'))
    expect(lazyParser.getProject()).not.toBeNull()
    lazyParser.dispose()
  })
})

// ─── Parser parseFiles / parseFilesWithErrors ───

describe('Parser parseFilesWithErrors', () => {
  let parser: Parser
  let tmpDir: string

  beforeEach(async () => {
    parser = new Parser()
    globalParseCache.clear()
    await parser.initialize()

    const { mkdir, writeFile } = await import('node:fs/promises')
    tmpDir = join(process.cwd(), '.tmp-parser-test-multi')
    await mkdir(tmpDir, { recursive: true })
    await writeFile(join(tmpDir, 'a.ts'), 'export const a = 1;\n')
    await writeFile(join(tmpDir, 'b.ts'), 'export const b = 2;\n')
  })

  afterEach(async () => {
    parser.dispose()
    const { rm } = await import('node:fs/promises')
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  })

  it('parses multiple files', async () => {
    const results = await parser.parseFiles([
      join(tmpDir, 'a.ts'),
      join(tmpDir, 'b.ts'),
    ])
    expect(results).toHaveLength(2)
    expect(results.every((r) => r.sourceFile)).toBe(true)
  })

  it('parseFilesWithErrors returns results and errors', async () => {
    const outcome: ParseFilesResult = await parser.parseFilesWithErrors([
      join(tmpDir, 'a.ts'),
      '/nonexistent/file.ts',
    ])
    expect(outcome.results.length).toBeGreaterThanOrEqual(1)
    expect(outcome.errors.length).toBeGreaterThanOrEqual(1)
  })

  it('parseFilesWithErrors handles all invalid files', async () => {
    const outcome = await parser.parseFilesWithErrors(['/nonexistent1.ts', '/nonexistent2.ts'])
    expect(outcome.errors.length).toBeGreaterThan(0)
  })

  it('parseFiles returns only results (logs errors)', async () => {
    const results = await parser.parseFiles(['/nonexistent.ts'])
    expect(results).toHaveLength(0)
  })
})
