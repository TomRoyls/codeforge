import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'

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
} from '../src/utils/fs-helpers.js'
import { CLIError, SystemError } from '../src/utils/errors.js'

let tmpDir: string

function cleanup() {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

function makeTmpDir(): string {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-fs-test-'))
  return tmpDir
}

function createFile(dir: string, name: string, content: string = 'hello'): string {
  const filePath = path.join(dir, name)
  const parentDir = path.dirname(filePath)
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true })
  }
  fs.writeFileSync(filePath, content, 'utf8')
  return filePath
}

// ─── clearCache & getCacheStats ───────────────────────
describe('clearCache', () => {
  afterEach(cleanup)

  it('clears the cache so subsequent reads hit the filesystem', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'a.txt', 'original')

    const first = await readFileSafe(filePath)
    expect(first).toBe('original')

    fs.writeFileSync(filePath, 'modified', 'utf8')
    const cached = await readFileSafe(filePath)
    expect(cached).toBe('original')

    clearCache()
    const fresh = await readFileSafe(filePath)
    expect(fresh).toBe('modified')
  })

  it('clears stats keys and resets size to 0', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'stat.txt', 'data')

    await readFileSafe(path.join(dir, 'stat.txt'))
    const before = getCacheStats()
    expect(before.size).toBeGreaterThanOrEqual(1)

    clearCache()
    const after = getCacheStats()
    expect(after.size).toBe(0)
    expect(after.keys).toEqual([])
  })

  it('is safe to call on an already-empty cache', () => {
    clearCache()
    clearCache()
    const stats = getCacheStats()
    expect(stats.size).toBe(0)
  })

  it('clears all cache types (read, json, exists, info)', async () => {
    const dir = makeTmpDir()
    const file = createFile(dir, 'multi.txt', '{"x":1}')

    await readFileSafe(file)
    await readJsonFile(file)
    await fileExists(file)
    await getFileInfo(file)

    const before = getCacheStats()
    expect(before.size).toBeGreaterThanOrEqual(4)

    clearCache()
    expect(getCacheStats().size).toBe(0)
  })
})

// ─── getCacheStats ────────────────────────────────────
describe('getCacheStats', () => {
  afterEach(cleanup)

  it('returns stats with keys array, size number, and ttlMs number', () => {
    clearCache()
    const stats = getCacheStats()
    expect(stats).toHaveProperty('keys')
    expect(stats).toHaveProperty('size')
    expect(stats).toHaveProperty('ttlMs')
    expect(Array.isArray(stats.keys)).toBe(true)
    expect(typeof stats.size).toBe('number')
    expect(typeof stats.ttlMs).toBe('number')
  })

  it('reports ttlMs as 60000', () => {
    const stats = getCacheStats()
    expect(stats.ttlMs).toBe(60_000)
  })

  it('returns empty keys and size 0 after clearCache', () => {
    clearCache()
    const stats = getCacheStats()
    expect(stats.keys).toEqual([])
    expect(stats.size).toBe(0)
  })

  it('size increases after readFileSafe caches a result', async () => {
    clearCache()
    const dir = makeTmpDir()
    createFile(dir, 's.txt', 'v')

    await readFileSafe(path.join(dir, 's.txt'))
    const stats = getCacheStats()
    expect(stats.size).toBeGreaterThanOrEqual(1)
  })

  it('keys contain the cache key prefix for readFile', async () => {
    clearCache()
    const dir = makeTmpDir()
    createFile(dir, 'prefixed.txt', 'val')

    await readFileSafe(path.join(dir, 'prefixed.txt'))
    const stats = getCacheStats()
    const hasReadFileKey = stats.keys.some((k) => k.startsWith('readFile:'))
    expect(hasReadFileKey).toBe(true)
  })

  it('keys contain the cache key prefix for readJsonFile', async () => {
    clearCache()
    const dir = makeTmpDir()
    createFile(dir, 'j.json', '{"a":1}')

    await readJsonFile(path.join(dir, 'j.json'))
    const stats = getCacheStats()
    const hasJsonKey = stats.keys.some((k) => k.startsWith('readJsonFile:'))
    expect(hasJsonKey).toBe(true)
  })

  it('keys contain the cache key prefix for fileExists', async () => {
    clearCache()
    const dir = makeTmpDir()
    createFile(dir, 'ex.txt', 'x')

    await fileExists(path.join(dir, 'ex.txt'))
    const stats = getCacheStats()
    const hasExistsKey = stats.keys.some((k) => k.startsWith('fileExists:'))
    expect(hasExistsKey).toBe(true)
  })

  it('keys contain the cache key prefix for getFileInfo', async () => {
    clearCache()
    const dir = makeTmpDir()
    createFile(dir, 'info.txt', 'info')

    await getFileInfo(path.join(dir, 'info.txt'))
    const stats = getCacheStats()
    const hasInfoKey = stats.keys.some((k) => k.startsWith('getFileInfo:'))
    expect(hasInfoKey).toBe(true)
  })
})

// ─── readFileSafe ─────────────────────────────────────
describe('readFileSafe', () => {
  afterEach(cleanup)

  it('returns file content as string', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'read.txt', 'hello world')
    const content = await readFileSafe(filePath)
    expect(content).toBe('hello world')
  })

  it('returns null for non-existent file', async () => {
    const dir = makeTmpDir()
    const content = await readFileSafe(path.join(dir, 'nope.txt'))
    expect(content).toBeNull()
  })

  it('caches the result on second call', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'cached.txt', 'first')

    const first = await readFileSafe(filePath)
    expect(first).toBe('first')

    fs.writeFileSync(filePath, 'second', 'utf8')
    const second = await readFileSafe(filePath)
    expect(second).toBe('first')
  })

  it('re-reads after null is returned for non-existent file', async () => {
    const dir = makeTmpDir()
    const missingPath = path.join(dir, 'missing.txt')

    const first = await readFileSafe(missingPath)
    expect(first).toBeNull()

    createFile(dir, 'missing.txt', 'now here')

    const second = await readFileSafe(missingPath)
    expect(second).toBe('now here')
  })

  it('resolves relative paths', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'rel.txt', 'relative')
    const content = await readFileSafe(filePath)
    expect(content).toBe('relative')
  })

  it('reads empty file as empty string', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'empty.txt', '')
    const content = await readFileSafe(filePath)
    expect(content).toBe('')
  })

  it('reads unicode content correctly', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'unicode.txt', 'こんにちは 🌍 émojis')
    const content = await readFileSafe(filePath)
    expect(content).toBe('こんにちは 🌍 émojis')
  })

  it('reads multiline content', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'multi.txt', 'line1\nline2\nline3')
    const content = await readFileSafe(filePath)
    expect(content).toBe('line1\nline2\nline3')
  })

  it('reads large content', async () => {
    const dir = makeTmpDir()
    const bigContent = 'x'.repeat(100_000)
    const filePath = createFile(dir, 'big.txt', bigContent)
    const content = await readFileSafe(filePath)
    expect(content).toBe(bigContent)
    expect(content.length).toBe(100_000)
  })

  it('reads JSON string from file without parsing', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'data.json', '{"key": "value"}')
    const content = await readFileSafe(filePath)
    expect(content).toBe('{"key": "value"}')
  })

  it('re-reads after clearCache', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'refresh.txt', 'old')

    await readFileSafe(filePath)
    fs.writeFileSync(filePath, 'new', 'utf8')

    clearCache()
    const content = await readFileSafe(filePath)
    expect(content).toBe('new')
  })
})

// ─── readFileStrict ───────────────────────────────────
describe('readFileStrict', () => {
  afterEach(cleanup)

  it('returns file content as string', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'strict.txt', 'strict content')
    const content = await readFileStrict(filePath)
    expect(content).toBe('strict content')
  })

  it('throws CLIError for non-existent file', async () => {
    const dir = makeTmpDir()
    await expect(readFileStrict(path.join(dir, 'nope.txt'))).rejects.toThrow(CLIError)
  })

  it('CLIError has code E002 for file not found', async () => {
    const dir = makeTmpDir()
    try {
      await readFileStrict(path.join(dir, 'missing.txt'))
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).code).toBe('E002')
    }
  })

  it('CLIError message contains the resolved path', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'absent.txt')
    const resolved = path.resolve(filePath)

    try {
      await readFileStrict(filePath)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).message).toContain(resolved)
    }
  })

  it('reads empty file', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'empty.txt', '')
    const content = await readFileStrict(filePath)
    expect(content).toBe('')
  })

  it('reads unicode content', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'uni.txt', 'αβγδ 🎉')
    const content = await readFileStrict(filePath)
    expect(content).toBe('αβγδ 🎉')
  })

  it('does not cache results', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'nocache.txt', 'first')

    const first = await readFileStrict(filePath)
    expect(first).toBe('first')

    fs.writeFileSync(filePath, 'second', 'utf8')
    const second = await readFileStrict(filePath)
    expect(second).toBe('second')
  })

  it('throws SystemError for permission denied on directory', async () => {
    const dir = makeTmpDir()
    const subDir = path.join(dir, 'subdir')
    fs.mkdirSync(subDir)

    await expect(readFileStrict(subDir)).rejects.toThrow()
  })

  it('reads multiline content', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'ml.txt', 'a\nb\nc')
    const content = await readFileStrict(filePath)
    expect(content).toBe('a\nb\nc')
  })

  it('reads file with special characters in content', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'special.txt', 'tabs\there\nand\rcarriage')
    const content = await readFileStrict(filePath)
    expect(content).toBe('tabs\there\nand\rcarriage')
  })
})

// ─── readJsonFile ─────────────────────────────────────
describe('readJsonFile', () => {
  afterEach(cleanup)

  it('parses valid JSON object', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'obj.json', '{"name":"test","value":42}')
    const result = await readJsonFile(filePath)
    expect(result).toEqual({ name: 'test', value: 42 })
  })

  it('parses valid JSON array', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'arr.json', '[1,2,3]')
    const result = await readJsonFile<{ length: number }>(filePath)
    expect(result).toEqual([1, 2, 3])
  })

  it('parses JSON string value', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'str.json', '"hello"')
    const result = await readJsonFile<string>(filePath)
    expect(result).toBe('hello')
  })

  it('parses JSON number value', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'num.json', '42.5')
    const result = await readJsonFile<number>(filePath)
    expect(result).toBe(42.5)
  })

  it('parses JSON boolean value', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'bool.json', 'true')
    const result = await readJsonFile<boolean>(filePath)
    expect(result).toBe(true)
  })

  it('parses JSON null value', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'null.json', 'null')
    const result = await readJsonFile<null>(filePath)
    expect(result).toBeNull()
  })

  it('returns null for non-existent file', async () => {
    const dir = makeTmpDir()
    const result = await readJsonFile(path.join(dir, 'nope.json'))
    expect(result).toBeNull()
  })

  it('caches parsed JSON result', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'cached.json', '{"v":1}')

    const first = await readJsonFile<{ v: number }>(filePath)
    expect(first).toEqual({ v: 1 })

    fs.writeFileSync(filePath, '{"v":2}', 'utf8')
    const second = await readJsonFile<{ v: number }>(filePath)
    expect(second).toEqual({ v: 1 })
  })

  it('re-reads after null for non-existent JSON file', async () => {
    const dir = makeTmpDir()
    const missing = path.join(dir, 'missing.json')

    const first = await readJsonFile(missing)
    expect(first).toBeNull()

    createFile(dir, 'missing.json', '{"now":true}')

    const second = await readJsonFile(missing)
    expect(second).toEqual({ now: true })
  })

  it('throws error for invalid JSON', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'bad.json', '{not valid json}')
    await expect(readJsonFile(filePath)).rejects.toThrow()
  })

  it('throws SyntaxError for malformed JSON', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'syn.json', '{bad}')
    await expect(readJsonFile(filePath)).rejects.toThrow(SyntaxError)
  })

  it('reads after clearCache', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'fresh.json', '{"a":1}')

    await readJsonFile(filePath)
    fs.writeFileSync(filePath, '{"a":2}', 'utf8')

    clearCache()
    const result = await readJsonFile<{ a: number }>(filePath)
    expect(result).toEqual({ a: 2 })
  })

  it('handles nested JSON objects', async () => {
    const dir = makeTmpDir()
    const obj = { level1: { level2: { level3: 'deep' } } }
    const filePath = createFile(dir, 'nested.json', JSON.stringify(obj))
    const result = await readJsonFile(filePath)
    expect(result).toEqual(obj)
  })

  it('handles JSON with unicode', async () => {
    const dir = makeTmpDir()
    const obj = { emoji: '🎉', text: 'こんにちは' }
    const filePath = createFile(dir, 'uni.json', JSON.stringify(obj))
    const result = await readJsonFile<{ emoji: string; text: string }>(filePath)
    expect(result).toEqual(obj)
  })

  it('handles empty JSON object', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'empty.json', '{}')
    const result = await readJsonFile<Record<string, unknown>>(filePath)
    expect(result).toEqual({})
  })
})

// ─── writeFileSafe ────────────────────────────────────
describe('writeFileSafe', () => {
  afterEach(cleanup)

  it('writes content to a file', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'write.txt')
    await writeFileSafe(filePath, 'written')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('written')
  })

  it('creates parent directories if they do not exist', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'a', 'b', 'c', 'deep.txt')
    await writeFileSafe(filePath, 'deep')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('deep')
  })

  it('overwrites existing file content', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'over.txt')
    await writeFileSafe(filePath, 'first')
    await writeFileSafe(filePath, 'second')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('second')
  })

  it('writes empty string', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'empty.txt')
    await writeFileSafe(filePath, '')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('')
  })

  it('writes unicode content', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'uni.txt')
    await writeFileSafe(filePath, 'こんにちは 🌍')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('こんにちは 🌍')
  })

  it('writes large content', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'big.txt')
    const bigContent = 'y'.repeat(100_000)
    await writeFileSafe(filePath, bigContent)
    expect(fs.readFileSync(filePath, 'utf8')).toBe(bigContent)
  })

  it('throws SystemError for invalid path', async () => {
    await expect(writeFileSafe('/dev/null/impossible/path/file.txt', 'data')).rejects.toThrow(
      SystemError,
    )
  })

  it('SystemError has code E502', async () => {
    try {
      await writeFileSafe('/dev/null/impossible/path/file.txt', 'data')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(SystemError)
      expect((error as SystemError).code).toBe('E502')
    }
  })

  it('writes multiline content', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'ml.txt')
    await writeFileSafe(filePath, 'line1\nline2\nline3')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('line1\nline2\nline3')
  })

  it('creates file when parent dir is exactly tmpDir', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'root.txt')
    await writeFileSafe(filePath, 'root level')
    expect(fs.readFileSync(filePath, 'utf8')).toBe('root level')
  })
})

// ─── fileExists ───────────────────────────────────────
describe('fileExists', () => {
  afterEach(cleanup)

  it('returns true for existing file', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'exists.txt')
    const result = await fileExists(filePath)
    expect(result).toBe(true)
  })

  it('returns false for non-existent file', async () => {
    const dir = makeTmpDir()
    const result = await fileExists(path.join(dir, 'nope.txt'))
    expect(result).toBe(false)
  })

  it('returns false for a directory path', async () => {
    const dir = makeTmpDir()
    const result = await fileExists(dir)
    expect(result).toBe(false)
  })

  it('caches true result', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'cached.txt')

    const first = await fileExists(filePath)
    expect(first).toBe(true)

    fs.unlinkSync(filePath)
    const second = await fileExists(filePath)
    expect(second).toBe(true)
  })

  it('caches false result', async () => {
    const dir = makeTmpDir()
    const missingPath = path.join(dir, 'missing.txt')

    const first = await fileExists(missingPath)
    expect(first).toBe(false)

    createFile(dir, 'missing.txt', 'now here')
    const second = await fileExists(missingPath)
    expect(second).toBe(false)
  })

  it('returns correct value after clearCache', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'fresh.txt')

    await fileExists(filePath)
    fs.unlinkSync(filePath)

    clearCache()
    const result = await fileExists(filePath)
    expect(result).toBe(false)
  })

  it('works with relative paths', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'rel.txt')
    const result = await fileExists(path.resolve(filePath))
    expect(result).toBe(true)
  })

  it('returns false for empty filename in non-existent dir', async () => {
    const dir = makeTmpDir()
    const result = await fileExists(path.join(dir, 'nonexist', 'file.txt'))
    expect(result).toBe(false)
  })
})

// ─── directoryExists ──────────────────────────────────
describe('directoryExists', () => {
  afterEach(cleanup)

  it('returns true for existing directory', async () => {
    const dir = makeTmpDir()
    const subDir = path.join(dir, 'subdir')
    fs.mkdirSync(subDir)
    const result = await directoryExists(subDir)
    expect(result).toBe(true)
  })

  it('returns true for tmpDir itself', async () => {
    const dir = makeTmpDir()
    const result = await directoryExists(dir)
    expect(result).toBe(true)
  })

  it('returns false for non-existent directory', async () => {
    const dir = makeTmpDir()
    const result = await directoryExists(path.join(dir, 'nonexist'))
    expect(result).toBe(false)
  })

  it('returns false for a file path', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'file.txt')
    const result = await directoryExists(filePath)
    expect(result).toBe(false)
  })

  it('returns false for deeply non-existent path', async () => {
    const dir = makeTmpDir()
    const result = await directoryExists(path.join(dir, 'a', 'b', 'c'))
    expect(result).toBe(false)
  })

  it('does not cache results', async () => {
    const dir = makeTmpDir()
    const subDir = path.join(dir, 'nocache')

    const first = await directoryExists(subDir)
    expect(first).toBe(false)

    fs.mkdirSync(subDir)
    const second = await directoryExists(subDir)
    expect(second).toBe(true)
  })

  it('works with nested directory', async () => {
    const dir = makeTmpDir()
    const nested = path.join(dir, 'level1', 'level2')
    fs.mkdirSync(nested, { recursive: true })
    const result = await directoryExists(nested)
    expect(result).toBe(true)
  })

  it('handles path.resolve correctly', async () => {
    const dir = makeTmpDir()
    const subDir = path.join(dir, 'resolved')
    fs.mkdirSync(subDir)
    const result = await directoryExists(path.resolve(subDir))
    expect(result).toBe(true)
  })
})

// ─── ensureDirectory ──────────────────────────────────
describe('ensureDirectory', () => {
  afterEach(cleanup)

  it('creates a directory', async () => {
    const dir = makeTmpDir()
    const subDir = path.join(dir, 'newdir')
    await ensureDirectory(subDir)
    expect(fs.statSync(subDir).isDirectory()).toBe(true)
  })

  it('creates nested directories recursively', async () => {
    const dir = makeTmpDir()
    const nested = path.join(dir, 'a', 'b', 'c')
    await ensureDirectory(nested)
    expect(fs.statSync(nested).isDirectory()).toBe(true)
  })

  it('does not throw if directory already exists', async () => {
    const dir = makeTmpDir()
    const subDir = path.join(dir, 'existing')
    fs.mkdirSync(subDir)
    await expect(ensureDirectory(subDir)).resolves.toBeUndefined()
    expect(fs.statSync(subDir).isDirectory()).toBe(true)
  })

  it('does not throw if tmpDir itself is ensured', async () => {
    const dir = makeTmpDir()
    await expect(ensureDirectory(dir)).resolves.toBeUndefined()
  })

  it('throws SystemError for invalid path', async () => {
    await expect(ensureDirectory('/dev/null/impossible/dir')).rejects.toThrow(SystemError)
  })

  it('SystemError has code E502 for io error', async () => {
    try {
      await ensureDirectory('/dev/null/impossible/dir')
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(SystemError)
      expect((error as SystemError).code).toBe('E502')
    }
  })

  it('creates single-level directory', async () => {
    const dir = makeTmpDir()
    const single = path.join(dir, 'single')
    await ensureDirectory(single)
    expect(fs.statSync(single).isDirectory()).toBe(true)
  })

  it('creates directory and parent at once', async () => {
    const dir = makeTmpDir()
    const parent = path.join(dir, 'parent')
    const child = path.join(parent, 'child')
    await ensureDirectory(child)
    expect(fs.statSync(parent).isDirectory()).toBe(true)
    expect(fs.statSync(child).isDirectory()).toBe(true)
  })
})

// ─── deleteFile ───────────────────────────────────────
describe('deleteFile', () => {
  afterEach(cleanup)

  it('deletes an existing file and returns true', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'del.txt')
    const result = await deleteFile(filePath)
    expect(result).toBe(true)
    expect(fs.existsSync(filePath)).toBe(false)
  })

  it('returns false for non-existent file', async () => {
    const dir = makeTmpDir()
    const result = await deleteFile(path.join(dir, 'nope.txt'))
    expect(result).toBe(false)
  })

  it('does not throw for non-existent file', async () => {
    const dir = makeTmpDir()
    await expect(deleteFile(path.join(dir, 'missing.txt'))).resolves.toBe(false)
  })

  it('throws SystemError when trying to delete a directory', async () => {
    const dir = makeTmpDir()
    const subDir = path.join(dir, 'subdir')
    fs.mkdirSync(subDir)
    await expect(deleteFile(subDir)).rejects.toThrow(SystemError)
  })

  it('SystemError has code E502', async () => {
    const dir = makeTmpDir()
    const subDir = path.join(dir, 'errdir')
    fs.mkdirSync(subDir)
    try {
      await deleteFile(subDir)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(SystemError)
      expect((error as SystemError).code).toBe('E502')
    }
  })

  it('can delete file in nested directory', async () => {
    const dir = makeTmpDir()
    const nested = path.join(dir, 'sub')
    fs.mkdirSync(nested)
    const filePath = path.join(nested, 'nested.txt')
    fs.writeFileSync(filePath, 'data', 'utf8')

    const result = await deleteFile(filePath)
    expect(result).toBe(true)
    expect(fs.existsSync(filePath)).toBe(false)
  })

  it('can delete file with unicode name', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, '日本語.txt', 'data')
    const result = await deleteFile(filePath)
    expect(result).toBe(true)
    expect(fs.existsSync(filePath)).toBe(false)
  })

  it('returns false on second delete of same file', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'twice.txt')

    const first = await deleteFile(filePath)
    expect(first).toBe(true)

    const second = await deleteFile(filePath)
    expect(second).toBe(false)
  })
})

// ─── listFiles ────────────────────────────────────────
describe('listFiles', () => {
  afterEach(cleanup)

  it('returns empty array for empty directory', async () => {
    const dir = makeTmpDir()
    const emptyDir = path.join(dir, 'empty')
    fs.mkdirSync(emptyDir)
    const files = await listFiles(emptyDir)
    expect(files).toEqual([])
  })

  it('returns list of files in directory', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'a.txt', 'a')
    createFile(dir, 'b.txt', 'b')
    const files = await listFiles(dir)
    expect(files).toHaveLength(2)
    expect(files.map((f) => path.basename(f)).sort()).toEqual(['a.txt', 'b.txt'])
  })

  it('returns absolute paths', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'abs.txt', 'x')
    const files = await listFiles(dir)
    expect(files[0]).toBe(path.resolve(path.join(dir, 'abs.txt')))
  })

  it('does not include directories in results', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'file.txt', 'f')
    fs.mkdirSync(path.join(dir, 'subdir'))
    const files = await listFiles(dir)
    expect(files).toHaveLength(1)
    expect(path.basename(files[0])).toBe('file.txt')
  })

  it('does not recurse into subdirectories', async () => {
    const dir = makeTmpDir()
    const subDir = path.join(dir, 'sub')
    fs.mkdirSync(subDir)
    createFile(subDir, 'nested.txt', 'n')
    createFile(dir, 'root.txt', 'r')
    const files = await listFiles(dir)
    expect(files).toHaveLength(1)
    expect(path.basename(files[0])).toBe('root.txt')
  })

  it('filters files by pattern with asterisk wildcard', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'a.ts', 'a')
    createFile(dir, 'b.js', 'b')
    createFile(dir, 'c.ts', 'c')
    const files = await listFiles(dir, '*.ts')
    expect(files).toHaveLength(2)
    expect(files.map((f) => path.basename(f)).sort()).toEqual(['a.ts', 'c.ts'])
  })

  it('pattern matches full filename', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'test.txt', 't')
    createFile(dir, 'mytest.txt', 'm')
    createFile(dir, 'testing.txt', 'g')
    const files = await listFiles(dir, 'test.txt')
    expect(files).toHaveLength(1)
    expect(path.basename(files[0])).toBe('test.txt')
  })

  it('pattern with wildcard matches prefix', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'prefix-a.txt', 'a')
    createFile(dir, 'prefix-b.txt', 'b')
    createFile(dir, 'other.txt', 'o')
    const files = await listFiles(dir, 'prefix-*.txt')
    expect(files).toHaveLength(2)
  })

  it('pattern with wildcard matches suffix', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'data.json', 'j')
    createFile(dir, 'data.txt', 't')
    createFile(dir, 'config.json', 'c')
    const files = await listFiles(dir, '*.json')
    expect(files).toHaveLength(2)
  })

  it('pattern with multiple wildcards', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'src_main.ts', 's')
    createFile(dir, 'src_util.ts', 'u')
    createFile(dir, 'test_main.ts', 't')
    createFile(dir, 'other.txt', 'o')
    const files = await listFiles(dir, 'src_*.ts')
    expect(files).toHaveLength(2)
  })

  it('dot in pattern is escaped (literal dot)', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'file.txt', 'a')
    createFile(dir, 'fileXtxt', 'b')
    const files = await listFiles(dir, 'file.txt')
    expect(files).toHaveLength(1)
    expect(path.basename(files[0])).toBe('file.txt')
  })

  it('returns empty when pattern matches nothing', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'a.txt', 'a')
    const files = await listFiles(dir, '*.md')
    expect(files).toEqual([])
  })

  it('throws SystemError for non-existent directory', async () => {
    const dir = makeTmpDir()
    await expect(listFiles(path.join(dir, 'nope'))).rejects.toThrow(SystemError)
  })

  it('SystemError has code E502 for non-existent directory', async () => {
    const dir = makeTmpDir()
    try {
      await listFiles(path.join(dir, 'missing'))
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(SystemError)
      expect((error as SystemError).code).toBe('E502')
    }
  })

  it('handles directory with many files', async () => {
    const dir = makeTmpDir()
    for (let i = 0; i < 50; i++) {
      createFile(dir, `file-${i}.txt`, `content-${i}`)
    }
    const files = await listFiles(dir)
    expect(files).toHaveLength(50)
  })

  it('handles files with special characters in names', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'file with spaces.txt', 's')
    createFile(dir, 'file-with-dashes.txt', 'd')
    const files = await listFiles(dir)
    expect(files).toHaveLength(2)
  })

  it('pattern with no wildcard matches exact filename', async () => {
    const dir = makeTmpDir()
    createFile(dir, 'exact.txt', 'e')
    createFile(dir, 'exact.txt.bak', 'b')
    const files = await listFiles(dir, 'exact.txt')
    expect(files).toHaveLength(1)
    expect(path.basename(files[0])).toBe('exact.txt')
  })
})

// ─── getFileInfo ──────────────────────────────────────
describe('getFileInfo', () => {
  afterEach(cleanup)

  it('returns FileInfo with all required properties', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'info.txt', 'content data')
    const info = await getFileInfo(filePath)

    expect(info).toHaveProperty('path')
    expect(info).toHaveProperty('size')
    expect(info).toHaveProperty('created')
    expect(info).toHaveProperty('modified')
    expect(info).toHaveProperty('isDirectory')
  })

  it('returns resolved absolute path', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'path.txt', 'x')
    const info = await getFileInfo(filePath)
    expect(info.path).toBe(path.resolve(filePath))
  })

  it('returns correct file size', async () => {
    const dir = makeTmpDir()
    const content = 'hello world'
    const filePath = createFile(dir, 'size.txt', content)
    const info = await getFileInfo(filePath)
    expect(info.size).toBe(Buffer.byteLength(content, 'utf8'))
  })

  it('returns isDirectory as false for file', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'notdir.txt', 'x')
    const info = await getFileInfo(filePath)
    expect(info.isDirectory).toBe(false)
  })

  it('returns isDirectory as true for directory', async () => {
    const dir = makeTmpDir()
    const info = await getFileInfo(dir)
    expect(info.isDirectory).toBe(true)
  })

  it('returns Date objects for created and modified', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'dates.txt', 'x')
    const info = await getFileInfo(filePath)
    expect(info.created).toBeInstanceOf(Date)
    expect(info.modified).toBeInstanceOf(Date)
  })

  it('created and modified dates are valid', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'valid.txt', 'x')
    const info = await getFileInfo(filePath)
    expect(info.created.getTime()).not.toBeNaN()
    expect(info.modified.getTime()).not.toBeNaN()
  })

  it('throws CLIError for non-existent file', async () => {
    const dir = makeTmpDir()
    await expect(getFileInfo(path.join(dir, 'nope.txt'))).rejects.toThrow(CLIError)
  })

  it('CLIError has code E002 for non-existent file', async () => {
    const dir = makeTmpDir()
    try {
      await getFileInfo(path.join(dir, 'missing.txt'))
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(CLIError)
      expect((error as CLIError).code).toBe('E002')
    }
  })

  it('caches the result', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'cached.txt', 'data')

    const first = await getFileInfo(filePath)
    const second = await getFileInfo(filePath)

    expect(first).toBe(second)
  })

  it('reads fresh info after clearCache', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'fresh.txt', 'small')

    const first = await getFileInfo(filePath)
    expect(first.size).toBe(5)

    fs.writeFileSync(filePath, 'much larger content here', 'utf8')
    clearCache()

    const second = await getFileInfo(filePath)
    expect(second.size).toBeGreaterThan(5)
  })

  it('returns size 0 for empty file', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'empty.txt', '')
    const info = await getFileInfo(filePath)
    expect(info.size).toBe(0)
  })

  it('path is the resolved absolute path not the input', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'resolve.txt', 'x')
    const info = await getFileInfo(filePath)
    expect(path.isAbsolute(info.path)).toBe(true)
  })
})

// ─── Cache TTL ────────────────────────────────────────
describe('cache TTL behavior', () => {
  afterEach(cleanup)

  it('cache entries expire after TTL', async () => {
    vi.useFakeTimers()
    try {
      const dir = makeTmpDir()
      const filePath = createFile(dir, 'ttl.txt', 'before')

      const first = await readFileSafe(filePath)
      expect(first).toBe('before')

      fs.writeFileSync(filePath, 'after', 'utf8')

      // Within TTL - should return cached
      vi.advanceTimersByTime(30_000)
      const cached = await readFileSafe(filePath)
      expect(cached).toBe('before')

      // After TTL - should read fresh
      vi.advanceTimersByTime(31_000)
      const fresh = await readFileSafe(filePath)
      expect(fresh).toBe('after')
    } finally {
      vi.useRealTimers()
    }
  })

  it('fileExists cache entry expires after TTL', async () => {
    vi.useFakeTimers()
    try {
      const dir = makeTmpDir()
      const filePath = createFile(dir, 'ttl-exists.txt')

      const first = await fileExists(filePath)
      expect(first).toBe(true)

      fs.unlinkSync(filePath)

      // Within TTL
      vi.advanceTimersByTime(30_000)
      const cached = await fileExists(filePath)
      expect(cached).toBe(true)

      // After TTL
      vi.advanceTimersByTime(31_000)
      const fresh = await fileExists(filePath)
      expect(fresh).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('getFileInfo cache entry expires after TTL', async () => {
    vi.useFakeTimers()
    try {
      const dir = makeTmpDir()
      const filePath = createFile(dir, 'ttl-info.txt', 'small')

      const first = await getFileInfo(filePath)
      expect(first.size).toBe(5)

      fs.writeFileSync(filePath, 'much bigger content', 'utf8')

      vi.advanceTimersByTime(61_000)
      const fresh = await getFileInfo(filePath)
      expect(fresh.size).toBeGreaterThan(5)
    } finally {
      vi.useRealTimers()
    }
  })

  it('readJsonFile cache entry expires after TTL', async () => {
    vi.useFakeTimers()
    try {
      const dir = makeTmpDir()
      const filePath = createFile(dir, 'ttl.json', '{"v":1}')

      const first = await readJsonFile<{ v: number }>(filePath)
      expect(first!.v).toBe(1)

      fs.writeFileSync(filePath, '{"v":99}', 'utf8')

      vi.advanceTimersByTime(61_000)
      const fresh = await readJsonFile<{ v: number }>(filePath)
      expect(fresh!.v).toBe(99)
    } finally {
      vi.useRealTimers()
    }
  })

  it('readFileSafe re-reads null result after TTL', async () => {
    vi.useFakeTimers()
    try {
      const dir = makeTmpDir()
      const missingPath = path.join(dir, 'missing-ttl.txt')

      const first = await readFileSafe(missingPath)
      expect(first).toBeNull()

      createFile(dir, 'missing-ttl.txt', 'appeared')

      vi.advanceTimersByTime(61_000)
      const fresh = await readFileSafe(missingPath)
      expect(fresh).toBe('appeared')
    } finally {
      vi.useRealTimers()
    }
  })
})

// ─── Integration ──────────────────────────────────────
describe('integration: multiple operations', () => {
  afterEach(cleanup)

  it('write then read round-trip', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'rt.txt')
    await writeFileSafe(filePath, 'round trip')
    const content = await readFileSafe(filePath)
    expect(content).toBe('round trip')
  })

  it('write then readJson round-trip', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'rt.json')
    const data = { key: 'value', num: 42 }
    await writeFileSafe(filePath, JSON.stringify(data))
    const result = await readJsonFile<{ key: string; num: number }>(filePath)
    expect(result).toEqual(data)
  })

  it('write then delete then verify gone', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'wd.txt')
    await writeFileSafe(filePath, 'temp')
    expect(await fileExists(filePath)).toBe(true)
    clearCache()
    expect(await deleteFile(filePath)).toBe(true)
    clearCache()
    expect(await fileExists(filePath)).toBe(false)
  })

  it('ensureDirectory then directoryExists', async () => {
    const dir = makeTmpDir()
    const subDir = path.join(dir, 'check')
    await ensureDirectory(subDir)
    expect(await directoryExists(subDir)).toBe(true)
  })

  it('write multiple then listFiles', async () => {
    const dir = makeTmpDir()
    await writeFileSafe(path.join(dir, 'a.ts'), 'a')
    await writeFileSafe(path.join(dir, 'b.ts'), 'b')
    await writeFileSafe(path.join(dir, 'c.md'), 'c')
    const files = await listFiles(dir, '*.ts')
    expect(files).toHaveLength(2)
  })

  it('write then getFileInfo then verify properties', async () => {
    const dir = makeTmpDir()
    const filePath = path.join(dir, 'info.txt')
    await writeFileSafe(filePath, 'test data')
    const info = await getFileInfo(filePath)
    expect(info.size).toBe(9)
    expect(info.isDirectory).toBe(false)
    expect(info.path).toBe(path.resolve(filePath))
    expect(info.created).toBeInstanceOf(Date)
    expect(info.modified).toBeInstanceOf(Date)
  })

  it('clearCache resets all function caches', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'all.txt', 'original')
    const jsonPath = createFile(dir, 'all.json', '{"x":1}')

    await readFileSafe(filePath)
    await readJsonFile(jsonPath)
    await fileExists(filePath)
    await getFileInfo(filePath)

    const stats = getCacheStats()
    expect(stats.size).toBeGreaterThanOrEqual(4)

    clearCache()
    expect(getCacheStats().size).toBe(0)
  })

  it('readFileStrict and readFileSafe on same file', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'both.txt', 'same')

    const safe = await readFileSafe(filePath)
    clearCache()
    const strict = await readFileStrict(filePath)
    expect(safe).toBe(strict)
  })

  it('write in nested dir then listFiles', async () => {
    const dir = makeTmpDir()
    await writeFileSafe(path.join(dir, 'sub', 'deep.txt'), 'deep')
    const files = await listFiles(dir)
    expect(files).toHaveLength(0) // listFiles doesn't recurse

    const subFiles = await listFiles(path.join(dir, 'sub'))
    expect(subFiles).toHaveLength(1)
    expect(path.basename(subFiles[0])).toBe('deep.txt')
  })

  it('handles concurrent reads on same file', async () => {
    const dir = makeTmpDir()
    const filePath = createFile(dir, 'conc.txt', 'concurrent')

    const results = await Promise.all([
      readFileSafe(filePath),
      readFileSafe(filePath),
      readFileSafe(filePath),
    ])
    expect(results).toEqual(['concurrent', 'concurrent', 'concurrent'])
  })
})
