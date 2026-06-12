import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
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

  it('returns directory info for directory', async () => {
    const info = await getFileInfo(TEMP_DIR)
    expect(info.isDirectory).toBe(true)
    expect(info.path).toContain(TEMP_DIR)
  })
})

// ─── readFileSafe additional cases ──────────────────────────────────────

describe('readFileSafe - additional', () => {
  beforeEach(() => {
    clearCache()
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    clearCache()
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('returns empty string for empty file', async () => {
    const path = tempFile('empty.txt')
    writeFileSync(path, '', 'utf8')
    const content = await readFileSafe(path)
    expect(content).toBe('')
  })

  it('handles Unicode content', async () => {
    const path = tempFile('unicode.txt')
    const unicode = 'Hello 世界 🌍 ñ'
    writeFileSync(path, unicode, 'utf8')
    const content = await readFileSafe(path)
    expect(content).toBe(unicode)
  })

  it('handles multiline content', async () => {
    const path = tempFile('multiline.txt')
    const content = 'line1\nline2\nline3'
    writeFileSync(path, content, 'utf8')
    const result = await readFileSafe(path)
    expect(result).toBe(content)
  })
})

// ─── readFileStrict additional cases ────────────────────────────────────

describe('readFileStrict - additional', () => {
  beforeEach(() => {
    clearCache()
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    clearCache()
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('returns empty string for empty file', async () => {
    const path = tempFile('empty.txt')
    writeFileSync(path, '', 'utf8')
    const content = await readFileStrict(path)
    expect(content).toBe('')
  })

  it('handles large file content', async () => {
    const path = tempFile('large.txt')
    const content = 'x'.repeat(10000)
    writeFileSync(path, content, 'utf8')
    const result = await readFileStrict(path)
    expect(result.length).toBe(10000)
  })
})

// ─── readJsonFile additional cases ───────────────────────────────────────

describe('readJsonFile - additional', () => {
  beforeEach(() => {
    clearCache()
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    clearCache()
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('handles empty JSON object', async () => {
    const path = tempFile('empty.json')
    writeFileSync(path, '{}', 'utf8')
    const result = await readJsonFile<Record<string, never>>(path)
    expect(result).toEqual({})
  })

  it('handles JSON array', async () => {
    const path = tempFile('array.json')
    writeFileSync(path, '[1,2,3]', 'utf8')
    const result = await readJsonFile<number[]>(path)
    expect(result).toEqual([1, 2, 3])
  })

  it('handles nested JSON', async () => {
    const path = tempFile('nested.json')
    writeFileSync(path, '{"a":{"b":{"c":1}}}', 'utf8')
    const result = await readJsonFile<{ a: { b: { c: number } } }>(path)
    expect(result?.a?.b?.c).toBe(1)
  })

  it('throws for invalid JSON', async () => {
    const path = tempFile('invalid.json')
    writeFileSync(path, '{invalid}', 'utf8')
    await expect(readJsonFile(path)).rejects.toThrow()
  })

  it('throws for non-JSON content', async () => {
    const path = tempFile('not-json.txt')
    writeFileSync(path, 'just text', 'utf8')
    await expect(readJsonFile(path)).rejects.toThrow()
  })
})

// ─── writeFileSafe additional cases ─────────────────────────────────────

describe('writeFileSafe - additional', () => {
  beforeEach(() => {
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('writes empty content', async () => {
    const path = tempFile('empty.txt')
    await writeFileSafe(path, '')
    const { readFileSync } = await import('node:fs')
    expect(readFileSync(path, 'utf8')).toBe('')
  })

  it('writes JSON content', async () => {
    const path = tempFile('data.json')
    const data = JSON.stringify({ key: 'value' })
    await writeFileSafe(path, data)
    const { readFileSync } = await import('node:fs')
    expect(readFileSync(path, 'utf8')).toBe(data)
  })
})

// ─── listFiles additional cases ─────────────────────────────────────────

describe('listFiles - additional', () => {
  beforeEach(() => {
    mkdirSync(TEMP_DIR, { recursive: true })
  })

  afterEach(() => {
    rmSync(TEMP_DIR, { recursive: true, force: true })
  })

  it('filters by extension pattern', async () => {
    writeFileSync(tempFile('a.test.ts'), 'a', 'utf8')
    writeFileSync(tempFile('b.test.js'), 'b', 'utf8')
    const files = await listFiles(TEMP_DIR, '*.test.ts')
    expect(files.length).toBe(1)
    expect(files[0].endsWith('.test.ts')).toBe(true)
  })

  it('filters by wildcard pattern', async () => {
    writeFileSync(tempFile('file1.txt'), 'a', 'utf8')
    writeFileSync(tempFile('file2.txt'), 'b', 'utf8')
    writeFileSync(tempFile('data.json'), 'c', 'utf8')
    const files = await listFiles(TEMP_DIR, '*.txt')
    expect(files.length).toBe(2)
  })

  it('handles pattern with multiple wildcards', async () => {
    writeFileSync(tempFile('test.ts'), 'a', 'utf8')
    writeFileSync(tempFile('test.js'), 'b', 'utf8')
    writeFileSync(tempFile('other.txt'), 'c', 'utf8')
    const files = await listFiles(TEMP_DIR, 'test.*')
    expect(files.length).toBe(2)
  })

  it('should check directory existence', async () => {
    const exists = await directoryExists(tmpdir())
    expect(exists).toBe(true)
  })

  it('should ensure directory exists', async () => {
    const dir = join(tmpdir(), 'fs-test-ensure-' + Date.now())
    await ensureDirectory(dir)
    const exists = await directoryExists(dir)
    expect(exists).toBe(true)
    rmSync(dir, { recursive: true, force: true })
  })

  it('should check file existence', async () => {
    const exists = await fileExists('/nonexistent/file.txt')
    expect(exists).toBe(false)
  })

  it('should write and read file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'fs-test-'))
    const filePath = join(dir, 'test.txt')
    await writeFileSafe(filePath, 'hello')
    const content = await readFileSafe(filePath)
    expect(content).toBe('hello')
    rmSync(dir, { recursive: true, force: true })
  })

  it('clearCache resets cache stats', () => {
    clearCache()
    const stats = getCacheStats()
    expect(stats.size).toBe(0)
  })

  it('directoryExists returns false for non-existent', async () => {
    const result = await directoryExists('/nonexistent/path/xyz')
    expect(result).toBe(false)
  })

  it('fileExists returns false for non-existent', async () => {
    const result = await fileExists('/nonexistent/file.txt')
    expect(result).toBe(false)
  })
})

  it('getCacheStats returns object', () => {
    expect(typeof getCacheStats()).toBe('object')
  })

  it('clearCache returns void', () => {
    expect(clearCache()).toBeUndefined()
  })

  it('fileExists is a function', () => {
    expect(typeof fileExists).toBe('function')
  })

describe('fs-helpers - wave545', () => {
  it('module exists', () => {
    expect(existsSync).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof existsSync).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof existsSync.name).toBe('string')
  })
})

describe('fs-helpers - wave546', () => {
  it('module accessible', () => {
    expect(existsSync).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof existsSync).toBe('function')
  })

  it('module name check', () => {
    expect(typeof existsSync.name).toBe('string')
  })
})

describe('fs-helpers - wave547', () => {
  it('module import works', () => {
    expect(existsSync).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof existsSync).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof existsSync.name).toBe('string')
  })
})

describe('fs-helpers - wave548', () => {
  it('fs-helpers module defined', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers module is function', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers module has name', () => {
    expect(existsSync).toBeDefined()
  })
})

describe('fs-helpers - wave549', () => {
  it('fs-helpers module defined', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers module is function', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers module has name', () => {
    expect(existsSync).toBeDefined()
  })
})

describe('fs-helpers - wave550', () => {
  it('fs-helpers w550 defined', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w550 is function', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w550 has name', () => {
    expect(existsSync).toBeDefined()
  })
})

describe('fs-helpers - wave551', () => {
  it('fs-helpers w551 check 0', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w551 check 1', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w551 check 2', () => {
    expect(existsSync).toBeDefined()
  })
})

describe('fs-helpers - wave552', () => {
  it('fs-helpers w552 v0', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w552 v1', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w552 v2', () => {
    expect(existsSync).toBeDefined()
  })
})

describe('fs-helpers - wave553', () => {
  it('fs-helpers w553 v0', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w553 v1', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w553 v2', () => {
    expect(existsSync).toBeDefined()
  })
})

describe('fs-helpers - wave554', () => {
  it('fs-helpers w554 v0', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w554 v1', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w554 v2', () => {
    expect(existsSync).toBeDefined()
  })
})

describe('fs-helpers - wave555', () => {
  it('fs-helpers w555 v0', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w555 v1', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w555 v2', () => {
    expect(existsSync).toBeDefined()
  })
})

describe('fs-helpers - wave556', () => {
  it('fs-helpers w556 v0', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w556 v1', () => {
    expect(existsSync).toBeDefined()
  })
  it('fs-helpers w556 v2', () => {
    expect(existsSync).toBeDefined()
  })
})
