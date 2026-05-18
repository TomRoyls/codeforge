import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  clearCache,
  deleteFile,
  directoryExists,
  ensureDirectory,
  fileExists,
  getCacheStats,
  getFileInfo,
  listFiles,
  readFileSafe,
  readFileStrict,
  readJsonFile,
  writeFileSafe,
} from '../../src/utils/fs-helpers.js'

// ─── Helpers ───

const TEMP_DIR = join(tmpdir(), `fs-helpers-test-${Date.now()}`)

function tempFile(name: string): string {
  return join(TEMP_DIR, name)
}

// ─── Cache Management ───

describe('fs-helpers cache', () => {
  beforeEach(() => {
    clearCache()
  })

  it('clearCache empties the cache', () => {
    clearCache()
    expect(getCacheStats().size).toBe(0)
    expect(getCacheStats().keys).toEqual([])
  })

  it('getCacheStats returns ttlMs of 60000', () => {
    expect(getCacheStats().ttlMs).toBe(60_000)
  })

  it('getCacheStats returns keys array', () => {
    clearCache()
    expect(Array.isArray(getCacheStats().keys)).toBe(true)
  })
})

// ─── readFileSafe ───

describe('readFileSafe', () => {
  beforeEach(() => {
    clearCache()
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    clearCache()
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('returns file content when file exists', async () => {
    const path = tempFile('exists.txt')
    writeFileSync(path, 'hello world', 'utf8')
    const content = await readFileSafe(path)
    expect(content).toBe('hello world')
  })

  it('returns null when file does not exist', async () => {
    const content = await readFileSafe(tempFile('nope.txt'))
    expect(content).toBeNull()
  })

  it('caches the result', async () => {
    const path = tempFile('cached.txt')
    writeFileSync(path, 'cached', 'utf8')
    await readFileSafe(path)
    expect(getCacheStats().size).toBeGreaterThan(0)
  })
})

// ─── readFileStrict ───

describe('readFileStrict', () => {
  beforeEach(() => {
    clearCache()
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    clearCache()
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('returns file content when file exists', async () => {
    const path = tempFile('strict.txt')
    writeFileSync(path, 'strict content', 'utf8')
    const content = await readFileStrict(path)
    expect(content).toBe('strict content')
  })

  it('throws CLIError when file does not exist', async () => {
    await expect(readFileStrict(tempFile('missing.txt'))).rejects.toThrow()
  })
})

// ─── readJsonFile ───

describe('readJsonFile', () => {
  beforeEach(() => {
    clearCache()
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    clearCache()
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('parses and returns JSON content', async () => {
    const path = tempFile('data.json')
    writeFileSync(path, '{"name":"test","value":42}', 'utf8')
    const result = await readJsonFile<{ name: string; value: number }>(path)
    expect(result).toEqual({ name: 'test', value: 42 })
  })

  it('returns null when file does not exist', async () => {
    const result = await readJsonFile(tempFile('missing.json'))
    expect(result).toBeNull()
  })

  it('caches the result', async () => {
    const path = tempFile('cached.json')
    writeFileSync(path, '{"a":1}', 'utf8')
    await readJsonFile(path)
    expect(getCacheStats().size).toBeGreaterThan(0)
  })
})

// ─── writeFileSafe ───

describe('writeFileSafe', () => {
  beforeEach(() => {
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('writes content to file', async () => {
    const path = tempFile('output.txt')
    await writeFileSafe(path, 'written content')
    const { readFileSync } = await import('node:fs')
    expect(readFileSync(path, 'utf8')).toBe('written content')
  })

  it('creates parent directories if needed', async () => {
    const path = join(TEMP_DIR, 'sub', 'dir', 'file.txt')
    await writeFileSafe(path, 'nested')
    expect(existsSync(path)).toBe(true)
  })

  it('overwrites existing file', async () => {
    const path = tempFile('overwrite.txt')
    writeFileSync(path, 'old', 'utf8')
    await writeFileSafe(path, 'new')
    const { readFileSync } = await import('node:fs')
    expect(readFileSync(path, 'utf8')).toBe('new')
  })
})

// ─── fileExists ───

describe('fileExists', () => {
  beforeEach(() => {
    clearCache()
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    clearCache()
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('returns true when file exists', async () => {
    const path = tempFile('exists.txt')
    writeFileSync(path, 'data', 'utf8')
    expect(await fileExists(path)).toBe(true)
  })

  it('returns false when file does not exist', async () => {
    expect(await fileExists(tempFile('nope.txt'))).toBe(false)
  })

  it('returns false for a directory', async () => {
    expect(await fileExists(TEMP_DIR)).toBe(false)
  })
})

// ─── directoryExists ───

describe('directoryExists', () => {
  beforeEach(() => {
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('returns true for existing directory', async () => {
    expect(await directoryExists(TEMP_DIR)).toBe(true)
  })

  it('returns false for non-existent directory', async () => {
    expect(await directoryExists(join(TEMP_DIR, 'nope'))).toBe(false)
  })

  it('returns false for a file', async () => {
    const path = tempFile('file.txt')
    writeFileSync(path, 'data', 'utf8')
    expect(await directoryExists(path)).toBe(false)
  })
})

// ─── ensureDirectory ───

describe('ensureDirectory', () => {
  beforeEach(() => {
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('creates directory if it does not exist', async () => {
    const dir = join(TEMP_DIR, 'new-dir')
    await ensureDirectory(dir)
    expect(existsSync(dir)).toBe(true)
  })

  it('does not throw if directory already exists', async () => {
    await expect(ensureDirectory(TEMP_DIR)).resolves.toBeUndefined()
  })

  it('creates nested directories', async () => {
    const dir = join(TEMP_DIR, 'a', 'b', 'c')
    await ensureDirectory(dir)
    expect(existsSync(dir)).toBe(true)
  })
})

// ─── deleteFile ───

describe('deleteFile', () => {
  beforeEach(() => {
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('returns true when file deleted', async () => {
    const path = tempFile('del.txt')
    writeFileSync(path, 'data', 'utf8')
    expect(await deleteFile(path)).toBe(true)
    expect(existsSync(path)).toBe(false)
  })

  it('returns false when file does not exist', async () => {
    expect(await deleteFile(tempFile('nope.txt'))).toBe(false)
  })
})

// ─── listFiles ───

describe('listFiles', () => {
  beforeEach(() => {
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('returns files in directory', async () => {
    writeFileSync(tempFile('a.txt'), 'a', 'utf8')
    writeFileSync(tempFile('b.txt'), 'b', 'utf8')
    const files = await listFiles(TEMP_DIR)
    expect(files.length).toBe(2)
    expect(files.every((f) => f.endsWith('.txt'))).toBe(true)
  })

  it('returns empty array for empty directory', async () => {
    const files = await listFiles(TEMP_DIR)
    expect(files).toEqual([])
  })

  it('filters by pattern', async () => {
    writeFileSync(tempFile('a.ts'), 'a', 'utf8')
    writeFileSync(tempFile('b.js'), 'b', 'utf8')
    const files = await listFiles(TEMP_DIR, '*.ts')
    expect(files.length).toBe(1)
    expect(files[0].endsWith('.ts')).toBe(true)
  })

  it('does not include directories', async () => {
    mkdirSync(join(TEMP_DIR, 'subdir'), { recursive: true })
    writeFileSync(tempFile('file.txt'), 'data', 'utf8')
    const files = await listFiles(TEMP_DIR)
    expect(files.length).toBe(1)
  })
})

// ─── getFileInfo ───

describe('getFileInfo', () => {
  beforeEach(() => {
    clearCache()
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    clearCache()
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('returns file info for existing file', async () => {
    const path = tempFile('info.txt')
    writeFileSync(path, 'hello', 'utf8')
    const info = await getFileInfo(path)
    expect(info.path).toContain('info.txt')
    expect(info.size).toBe(5)
    expect(info.isDirectory).toBe(false)
    expect(info.created).toBeInstanceOf(Date)
    expect(info.modified).toBeInstanceOf(Date)
  })

  it('throws for non-existent file', async () => {
    await expect(getFileInfo(tempFile('missing.txt'))).rejects.toThrow()
  })

  it('caches the result', async () => {
    const path = tempFile('cached-info.txt')
    writeFileSync(path, 'c', 'utf8')
    await getFileInfo(path)
    expect(getCacheStats().size).toBeGreaterThan(0)
  })
})
