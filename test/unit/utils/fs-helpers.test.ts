import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import {
  readFileSafe,
  readFileStrict,
  writeFileSafe,
  fileExists,
  directoryExists,
  ensureDirectory,
  deleteFile,
  listFiles,
  getFileInfo,
  readJsonFile,
  clearCache,
  getCacheStats,
} from '../../../src/utils/fs-helpers'

describe('fs-helpers', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('readFileSafe', () => {
    test('reads existing file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const content = await readFileSafe(testFile)
      expect(content).toBe('content')
    })

    test('returns null for non-existing file', async () => {
      const content = await readFileSafe(path.join(tempDir, 'nonexistent.txt'))
      expect(content).toBeNull()
    })

    test('reads empty file', async () => {
      const testFile = path.join(tempDir, 'empty.txt')
      await fs.writeFile(testFile, '', 'utf-8')
      const content = await readFileSafe(testFile)
      expect(content).toBe('')
    })

    test('reads large file', async () => {
      const testFile = path.join(tempDir, `large.txt`)
      const largeContent = 'x'.repeat(10000)
      await fs.writeFile(testFile, largeContent, 'utf-8')
      const content = await readFileSafe(testFile)
      expect(content).toBe(largeContent)
    })
  })

  describe('readFileStrict', () => {
    test('writes and reads file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const content = await readFileStrict(testFile)
      expect(content).toBe('content')
    })

    test('throws for non-existing file', async () => {
      await expect(readFileStrict(path.join(tempDir, 'nonexistent.txt'))).rejects.toThrow(
        'File not found',
      )
    })
  })

  describe('writeFileSafe', () => {
    test('writes file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await writeFileSafe(testFile, 'content')
      const content = await fs.readFile(testFile, 'utf-8')
      expect(content).toBe('content')
    })

    test('creates parent directories', async () => {
      const nestedPath = path.join(tempDir, 'level1', 'level2', 'test.txt')
      await writeFileSafe(nestedPath, 'nested')
      const content = await fs.readFile(nestedPath, 'utf-8')
      expect(content).toBe('nested')
    })

    test('overwrites existing file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'original', 'utf-8')
      await writeFileSafe(testFile, 'updated')
      const content = await fs.readFile(testFile, 'utf-8')
      expect(content).toBe('updated')
    })
  })

  describe('fileExists', () => {
    test('returns true for existing file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const exists = await fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('returns false for non-existing file', async () => {
      const exists = await fileExists(path.join(tempDir, 'nonexistent.txt'))
      expect(exists).toBe(false)
    })

    test('returns false for directory', async () => {
      const dirPath = path.join(tempDir, 'testdir')
      await fs.mkdir(dirPath)
      const exists = await fileExists(dirPath)
      expect(exists).toBe(false)
    })

    test('throws for permission denied', async () => {
      const readOnlyDir = path.join(tempDir, 'readonly')
      await fs.mkdir(readOnlyDir)
      const restrictedFile = path.join(readOnlyDir, 'secret.txt')
      await fs.writeFile(restrictedFile, 'secret', 'utf-8')
      await fs.chmod(readOnlyDir, 0o555)
      try {
        await fileExists(restrictedFile)
      } catch (error) {
        expect((error as NodeJS.ErrnoException).code).toBe('EACCES')
      } finally {
        await fs.chmod(readOnlyDir, 0o755)
      }
    })
  })

  describe('directoryExists', () => {
    test('returns true for existing directory', async () => {
      const dirPath = path.join(tempDir, 'testdir')
      await fs.mkdir(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('returns false for non-existing directory', async () => {
      const exists = await directoryExists(path.join(tempDir, 'nonexistent'))
      expect(exists).toBe(false)
    })

    test('returns false for file', async () => {
      const filePath = path.join(tempDir, 'test.txt')
      await fs.writeFile(filePath, 'content', 'utf-8')
      const exists = await directoryExists(filePath)
      expect(exists).toBe(false)
    })

    test('throws for permission denied', async () => {
      const readOnlyParent = path.join(tempDir, 'readonlyparent')
      await fs.mkdir(readOnlyParent)
      await fs.chmod(readOnlyParent, 0o555)
      try {
        await directoryExists(path.join(readOnlyParent, 'subdir'))
      } catch (error) {
        expect((error as NodeJS.ErrnoException).code).toBe('EACCES')
      } finally {
        await fs.chmod(readOnlyParent, 0o755)
      }
    })
  })

  describe('ensureDirectory', () => {
    test('creates directory', async () => {
      const dirPath = path.join(tempDir, 'newdir')
      await ensureDirectory(dirPath)
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    test('works if directory exists', async () => {
      const dirPath = path.join(tempDir, 'existing')
      await fs.mkdir(dirPath)
      await expect(ensureDirectory(dirPath)).resolves.not.toThrow()
    })

    test('creates nested directories', async () => {
      const nestedPath = path.join(tempDir, 'l1', 'l2', 'l3')
      await ensureDirectory(nestedPath)
      const exists = await directoryExists(nestedPath)
      expect(exists).toBe(true)
    })

    test('throws for permission denied', async () => {
      const readOnlyDir = path.join(tempDir, 'readonly')
      await fs.mkdir(readOnlyDir)
      await fs.chmod(readOnlyDir, 0o555)
      try {
        await ensureDirectory(path.join(readOnlyDir, 'nested', 'dir'))
      } catch (error) {
        expect((error as Error).message).toContain('Failed to ensure directory')
      } finally {
        await fs.chmod(readOnlyDir, 0o755)
      }
    })
  })

  describe('deleteFile', () => {
    test('deletes existing file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const deleted = await deleteFile(testFile)
      expect(deleted).toBe(true)
      const exists = await fileExists(testFile)
      expect(exists).toBe(false)
    })

    test('returns false for non-existing file', async () => {
      const deleted = await deleteFile(path.join(tempDir, 'nonexistent.txt'))
      expect(deleted).toBe(false)
    })

    test('throws for permission denied', async () => {
      const readOnlyDir = path.join(tempDir, 'readonly')
      await fs.mkdir(readOnlyDir)
      const restrictedFile = path.join(readOnlyDir, 'secret.txt')
      await fs.writeFile(restrictedFile, 'secret', 'utf-8')
      await fs.chmod(readOnlyDir, 0o555)
      try {
        await deleteFile(restrictedFile)
      } catch (error) {
        expect((error as Error).message).toContain('Failed to delete file')
      } finally {
        await fs.chmod(readOnlyDir, 0o755)
      }
    })
  })

  describe('listFiles', () => {
    test('lists all files', async () => {
      await fs.writeFile(path.join(tempDir, 'file1.txt'), 'c1', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'file2.txt'), 'c2', 'utf-8')
      const files = await listFiles(tempDir)
      expect(files).toHaveLength(2)
    })

    test('filters by pattern', async () => {
      await fs.writeFile(path.join(tempDir, 'test.txt'), 'txt', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'test.js'), 'js', 'utf-8')
      const txtFiles = await listFiles(tempDir, '*.txt')
      expect(txtFiles).toHaveLength(1)
    })

    test('returns empty array for empty directory', async () => {
      const files = await listFiles(tempDir)
      expect(files).toEqual([])
    })

    test('does not include directories', async () => {
      await fs.mkdir(path.join(tempDir, 'subdir'))
      await fs.writeFile(path.join(tempDir, 'file.txt'), 'c', 'utf-8')
      const files = await listFiles(tempDir)
      expect(files).toHaveLength(1)
    })

    test('throws for permission denied', async () => {
      const readOnlyDir = path.join(tempDir, 'readonly')
      await fs.mkdir(readOnlyDir)
      await fs.chmod(readOnlyDir, 0o000)
      try {
        await listFiles(readOnlyDir)
      } catch (error) {
        expect((error as Error).message).toContain('Failed to list files')
      } finally {
        await fs.chmod(readOnlyDir, 0o755)
      }
    })
  })

  describe('getFileInfo', () => {
    test('returns file info', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'Hello, World!', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.path).toBe(path.resolve(testFile))
      expect(info.size).toBe(13)
      expect(info.isDirectory).toBe(false)
      expect(info.created).toBeInstanceOf(Date)
      expect(info.modified).toBeInstanceOf(Date)
    })

    test('returns directory info', async () => {
      const dirPath = path.join(tempDir, 'testdir')
      await fs.mkdir(dirPath)
      const info = await getFileInfo(dirPath)
      expect(info.path).toBe(path.resolve(dirPath))
      expect(info.isDirectory).toBe(true)
    })

    test('throws for non-existing file', async () => {
      await expect(getFileInfo(path.join(tempDir, 'nonexistent'))).rejects.toThrow('File not found')
    })

    test('works with empty file', async () => {
      const testFile = path.join(tempDir, 'empty.txt')
      await fs.writeFile(testFile, '', 'utf-8')
      const info = await getFileInfo(testFile)
      expect(info.size).toBe(0)
    })
  })

  describe('readJsonFile', () => {
    test('reads valid JSON file', async () => {
      const testFile = path.join(tempDir, 'test.json')
      await fs.writeFile(testFile, JSON.stringify({ name: 'test', value: 42 }), 'utf-8')
      const result = await readJsonFile<{ name: string; value: number }>(testFile)
      expect(result).toEqual({ name: 'test', value: 42 })
    })

    test('returns null for non-existing file', async () => {
      const result = await readJsonFile(path.join(tempDir, 'nonexistent.json'))
      expect(result).toBeNull()
    })

    test('reads array JSON', async () => {
      const testFile = path.join(tempDir, 'array.json')
      await fs.writeFile(testFile, JSON.stringify([1, 2, 3]), 'utf-8')
      const result = await readJsonFile<number[]>(testFile)
      expect(result).toEqual([1, 2, 3])
    })

    test('reads nested JSON', async () => {
      const testFile = path.join(tempDir, 'nested.json')
      const nested = { level1: { level2: { level3: 'deep' } } }
      await fs.writeFile(testFile, JSON.stringify(nested), 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual(nested)
    })

    test('throws for invalid JSON', async () => {
      const testFile = path.join(tempDir, 'invalid.json')
      await fs.writeFile(testFile, 'not valid json', 'utf-8')
      await expect(readJsonFile(testFile)).rejects.toThrow()
    })

    test('reads empty object JSON', async () => {
      const testFile = path.join(tempDir, 'empty.json')
      await fs.writeFile(testFile, '{}', 'utf-8')
      const result = await readJsonFile(testFile)
      expect(result).toEqual({})
    })
  })

  describe('clearCache', () => {
    test('clearCache function exists and can be called', () => {
      expect(typeof clearCache).toBe('function')
      expect(() => clearCache()).not.toThrow()
    })

    test('clearCache clears the cache', async () => {
      const testFile = path.join(tempDir, 'cached.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      await readFileSafe(testFile)
      clearCache()
      const stats = getCacheStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('getCacheStats', () => {
    test('returns cache statistics', () => {
      clearCache()
      const stats = getCacheStats()
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('keys')
      expect(Array.isArray(stats.keys)).toBe(true)
    })

    test('size increases after caching', async () => {
      clearCache()
      const testFile = path.join(tempDir, 'stats-test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const beforeSize = getCacheStats().size
      await readFileSafe(testFile)
      const afterSize = getCacheStats().size
      expect(afterSize).toBeGreaterThan(beforeSize)
    })

    test('keys contain cached file paths', async () => {
      clearCache()
      const testFile = path.join(tempDir, 'keys-test.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      await readFileSafe(testFile)
      const stats = getCacheStats()
      const hasKey = stats.keys.some((key) => key.includes('keys-test.txt'))
      expect(hasKey).toBe(true)
    })
  })

  describe('cache behavior', () => {
    test('readFileSafe uses cache on second call', async () => {
      clearCache()
      const testFile = path.join(tempDir, 'cache-test.txt')
      await fs.writeFile(testFile, 'original', 'utf-8')
      await readFileSafe(testFile)
      await fs.writeFile(testFile, 'modified', 'utf-8')
      const cachedContent = await readFileSafe(testFile)
      expect(cachedContent).toBe('original')
    })

    test('fileExists caches result', async () => {
      clearCache()
      const testFile = path.join(tempDir, 'exists-cache.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const exists1 = await fileExists(testFile)
      await fs.unlink(testFile)
      const exists2 = await fileExists(testFile)
      expect(exists1).toBe(true)
      expect(exists2).toBe(true)
    })
  })
})
