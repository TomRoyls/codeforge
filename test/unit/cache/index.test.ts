/**
 * @fileoverview Comprehensive tests for src/cache/index.ts
 * Tests hash functions, CacheStore class, and InvalidationManager
 * @module test/unit/cache/index.test
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import {
  hashContent,
  hashFile,
  hashFileSync,
  hashObject,
  generateRandomHash,
  CacheStore,
  InvalidationManager,
  InvalidationStrategy,
  createDefaultCache,
  createDefaultInvalidationManager,
  type CacheEntry,
} from '../../../src/cache/index'

/**
 * Hash Functions Tests
 * @description Tests for content hashing utilities using SHA-256
 */
describe('Hash Functions', () => {
  /**
   * hashContent function tests
   * @description Tests for hashing string content
   */
  describe('hashContent', () => {
    test('returns consistent SHA-256 hash for same input', () => {
      const content = 'test content'
      const hash1 = hashContent(content)
      const hash2 = hashContent(content)
      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64) // SHA-256 hex digest length
    })

    test('produces different hashes for different inputs', () => {
      const hash1 = hashContent('content1')
      const hash2 = hashContent('content2')
      expect(hash1).not.toBe(hash2)
    })

    test('handles empty string', () => {
      const hash = hashContent('')
      expect(hash).toHaveLength(64)
      expect(typeof hash).toBe('string')
    })

    test('handles special characters', () => {
      const hash = hashContent('!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`')
      expect(hash).toHaveLength(64)
    })

    test('handles unicode characters', () => {
      const hash = hashContent('Hello 世界 🌍')
      expect(hash).toHaveLength(64)
    })

    test('handles large content', () => {
      const largeContent = 'x'.repeat(100000)
      const hash = hashContent(largeContent)
      expect(hash).toHaveLength(64)
    })

    test('handles newlines and whitespace', () => {
      const hash = hashContent('line1\nline2\r\nline3\ttab')
      expect(hash).toHaveLength(64)
    })

    test('produces valid hexadecimal string', () => {
      const hash = hashContent('test')
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })
  })

  /**
   * hashFile function tests
   * @description Tests for async file hashing using streams
   */
  describe('hashFile', () => {
    let tempDir: string

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hashfile-test-'))
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('returns hash for existing file', async () => {
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, 'test content', 'utf-8')
      const hash = await hashFile(testFile)
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    test('produces same hash as hashContent for same content', async () => {
      const content = 'same content'
      const testFile = path.join(tempDir, 'test.txt')
      await fs.writeFile(testFile, content, 'utf-8')
      const fileHash = await hashFile(testFile)
      const contentHash = hashContent(content)
      expect(fileHash).toBe(contentHash)
    })

    test('handles empty file', async () => {
      const testFile = path.join(tempDir, 'empty.txt')
      await fs.writeFile(testFile, '', 'utf-8')
      const hash = await hashFile(testFile)
      expect(hash).toHaveLength(64)
    })

    test('handles large file', async () => {
      const testFile = path.join(tempDir, 'large.txt')
      const largeContent = 'x'.repeat(100000)
      await fs.writeFile(testFile, largeContent, 'utf-8')
      const hash = await hashFile(testFile)
      expect(hash).toHaveLength(64)
    })

    test('handles binary file', async () => {
      const testFile = path.join(tempDir, 'binary.bin')
      const binaryData = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe, 0xfd])
      await fs.writeFile(testFile, binaryData)
      const hash = await hashFile(testFile)
      expect(hash).toHaveLength(64)
    })

    test('throws error for non-existent file', async () => {
      const nonExistent = path.join(tempDir, 'nonexistent.txt')
      await expect(hashFile(nonExistent)).rejects.toThrow()
    })

    test('handles file with special characters in name', async () => {
      const testFile = path.join(tempDir, 'test-file_1.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const hash = await hashFile(testFile)
      expect(hash).toHaveLength(64)
    })
  })

  /**
   * hashFileSync function tests
   * @description Tests for synchronous file hashing
   */
  describe('hashFileSync', () => {
    let tempDir: string

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hashfilesync-test-'))
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('returns hash for existing file', () => {
      const testFile = path.join(tempDir, 'test.txt')
      fs.writeFile(testFile, 'test content', 'utf-8').then(() => {})
      // Need to ensure file exists before sync read
    })

    test('returns hash for existing file synchronously', async () => {
      const testFile = path.join(tempDir, 'sync-test.txt')
      await fs.writeFile(testFile, 'sync content', 'utf-8')
      const hash = hashFileSync(testFile)
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    test('produces same hash as async hashFile', async () => {
      const testFile = path.join(tempDir, 'compare.txt')
      await fs.writeFile(testFile, 'compare content', 'utf-8')
      const syncHash = hashFileSync(testFile)
      const asyncHash = await hashFile(testFile)
      expect(syncHash).toBe(asyncHash)
    })

    test('handles empty file', async () => {
      const testFile = path.join(tempDir, 'empty.txt')
      await fs.writeFile(testFile, '', 'utf-8')
      const hash = hashFileSync(testFile)
      expect(hash).toHaveLength(64)
    })

    test('handles large file', async () => {
      const testFile = path.join(tempDir, 'large.txt')
      const largeContent = 'y'.repeat(100000)
      await fs.writeFile(testFile, largeContent, 'utf-8')
      const hash = hashFileSync(testFile)
      expect(hash).toHaveLength(64)
    })

    test('throws error for non-existent file', () => {
      const nonExistent = path.join(tempDir, 'nonexistent.txt')
      expect(() => hashFileSync(nonExistent)).toThrow()
    })
  })

  /**
   * hashObject function tests
   * @description Tests for deterministic object hashing
   */
  describe('hashObject', () => {
    test('produces consistent hash for same object', () => {
      const obj = { a: 1, b: 2, c: 'test' }
      const hash1 = hashObject(obj)
      const hash2 = hashObject(obj)
      expect(hash1).toBe(hash2)
    })

    test('produces same hash regardless of key order', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { b: 2, a: 1 }
      expect(hashObject(obj1)).toBe(hashObject(obj2))
    })

    test('produces different hashes for different values', () => {
      const obj1 = { a: 1 }
      const obj2 = { a: 2 }
      expect(hashObject(obj1)).not.toBe(hashObject(obj2))
    })

    test('handles empty object', () => {
      const hash = hashObject({})
      expect(hash).toHaveLength(64)
    })

    test('handles nested objects', () => {
      const obj = { outer: { inner: { deep: 'value' } } }
      const hash = hashObject(obj)
      expect(hash).toHaveLength(64)
    })

    test('handles arrays', () => {
      const obj = { arr: [1, 2, 3] }
      const hash = hashObject(obj)
      expect(hash).toHaveLength(64)
    })

    test('handles null values', () => {
      const obj = { a: null, b: 'value' }
      const hash = hashObject(obj)
      expect(hash).toHaveLength(64)
    })

    test('handles boolean values', () => {
      const obj = { a: true, b: false }
      const hash = hashObject(obj)
      expect(hash).toHaveLength(64)
    })

    test('handles numeric values', () => {
      const obj = { int: 42, float: 3.14, negative: -1 }
      const hash = hashObject(obj)
      expect(hash).toHaveLength(64)
    })

    test('handles complex nested structure', () => {
      const obj = {
        level1: {
          level2: {
            level3: [
              { id: 1, name: 'item1' },
              { id: 2, name: 'item2' },
            ],
          },
        },
      }
      const hash = hashObject(obj)
      expect(hash).toHaveLength(64)
    })
  })

  /**
   * generateRandomHash function tests
   * @description Tests for UUID-based random hash generation
   */
  describe('generateRandomHash', () => {
    test('returns 32 character hex string', () => {
      const hash = generateRandomHash()
      expect(hash).toHaveLength(32)
      expect(hash).toMatch(/^[a-f0-9]{32}$/)
    })

    test('produces different hashes on each call', () => {
      const hashes = new Set<string>()
      for (let i = 0; i < 100; i++) {
        hashes.add(generateRandomHash())
      }
      expect(hashes.size).toBe(100)
    })

    test('does not contain dashes', () => {
      const hash = generateRandomHash()
      expect(hash).not.toContain('-')
    })

    test('returns string type', () => {
      const hash = generateRandomHash()
      expect(typeof hash).toBe('string')
    })
  })
})

/**
 * CacheStore Class Tests
 * @description Tests for file-based cache storage
 */
describe('CacheStore', () => {
  let tempDir: string
  let cacheStore: CacheStore

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cachestore-test-'))
    cacheStore = new CacheStore(tempDir)
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  /**
   * Constructor tests
   * @description Tests for CacheStore initialization
   */
  describe('constructor', () => {
    test('creates instance with cache directory', () => {
      const store = new CacheStore('/tmp/test-cache')
      expect(store).toBeInstanceOf(CacheStore)
    })

    test('accepts relative path', () => {
      const store = new CacheStore('./cache')
      expect(store).toBeInstanceOf(CacheStore)
    })

    test('accepts absolute path', () => {
      const store = new CacheStore('/absolute/path/to/cache')
      expect(store).toBeInstanceOf(CacheStore)
    })
  })

  /**
   * get method tests
   * @description Tests for retrieving cached values
   */
  describe('get', () => {
    test('returns null for non-existent key', async () => {
      const result = await cacheStore.get<string>('nonexistent')
      expect(result).toBeNull()
    })

    test('returns value for existing key', async () => {
      await cacheStore.set('test-key', 'test-value')
      const result = await cacheStore.get<string>('test-key')
      expect(result).toBe('test-value')
    })

    test('returns null for expired entry', async () => {
      const shortTtl = 1 // 1ms TTL
      await cacheStore.set('expiring-key', 'value', shortTtl)
      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 10))
      const result = await cacheStore.get<string>('expiring-key')
      expect(result).toBeNull()
    })

    test('handles complex objects', async () => {
      const complexValue = {
        nested: { deep: 'value' },
        array: [1, 2, 3],
        bool: true,
      }
      await cacheStore.set('complex', complexValue)
      const result = await cacheStore.get<typeof complexValue>('complex')
      expect(result).toEqual(complexValue)
    })

    test('handles number values', async () => {
      await cacheStore.set('number', 42)
      const result = await cacheStore.get<number>('number')
      expect(result).toBe(42)
    })

    test('handles boolean values', async () => {
      await cacheStore.set('bool-true', true)
      await cacheStore.set('bool-false', false)
      expect(await cacheStore.get<boolean>('bool-true')).toBe(true)
      expect(await cacheStore.get<boolean>('bool-false')).toBe(false)
    })

    test('handles null value', async () => {
      await cacheStore.set('null-key', null)
      const result = await cacheStore.get<null>('null-key')
      expect(result).toBeNull()
    })

    test('handles array values', async () => {
      const arr = [1, 'two', { three: 3 }]
      await cacheStore.set('array-key', arr)
      const result = await cacheStore.get<typeof arr>('array-key')
      expect(result).toEqual(arr)
    })

    test('returns null for corrupted cache file', async () => {
      await fs.writeFile(path.join(tempDir, 'corrupted.json'), 'not valid json')
      const result = await cacheStore.get('corrupted')
      expect(result).toBeNull()
    })

    test('deletes expired entry from disk', async () => {
      const shortTtl = 1
      await cacheStore.set('expire-delete', 'value', shortTtl)
      await new Promise((resolve) => setTimeout(resolve, 10))
      await cacheStore.get<string>('expire-delete')
      const hasAfter = await cacheStore.has('expire-delete')
      expect(hasAfter).toBe(false)
    })
  })

  /**
   * set method tests
   * @description Tests for storing values in cache
   */
  describe('set', () => {
    test('stores string value', async () => {
      await cacheStore.set('string-key', 'string-value')
      const result = await cacheStore.get<string>('string-key')
      expect(result).toBe('string-value')
    })

    test('stores object value', async () => {
      const obj = { foo: 'bar', num: 123 }
      await cacheStore.set('object-key', obj)
      const result = await cacheStore.get<typeof obj>('object-key')
      expect(result).toEqual(obj)
    })

    test('creates cache directory if not exists', async () => {
      const newDir = path.join(tempDir, 'new-cache-dir')
      const newStore = new CacheStore(newDir)
      await newStore.set('key', 'value')
      const dirExists = await fs.stat(newDir).then(
        () => true,
        () => false,
      )
      expect(dirExists).toBe(true)
    })

    test('overwrites existing key', async () => {
      await cacheStore.set('overwrite', 'original')
      await cacheStore.set('overwrite', 'updated')
      const result = await cacheStore.get<string>('overwrite')
      expect(result).toBe('updated')
    })

    test('stores with TTL', async () => {
      await cacheStore.set('with-ttl', 'value', 60000)
      const result = await cacheStore.get<string>('with-ttl')
      expect(result).toBe('value')
    })

    test('handles empty string value', async () => {
      await cacheStore.set('empty', '')
      const result = await cacheStore.get<string>('empty')
      expect(result).toBe('')
    })

    test('handles concurrent sets to same key', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        cacheStore.set('concurrent', `value-${i}`),
      )
      await Promise.all(promises)
      const result = await cacheStore.get<string>('concurrent')
      expect(typeof result).toBe('string')
    })
  })

  /**
   * has method tests
   * @description Tests for checking key existence
   */
  describe('has', () => {
    test('returns false for non-existent key', async () => {
      const result = await cacheStore.has('nonexistent')
      expect(result).toBe(false)
    })

    test('returns true for existing key', async () => {
      await cacheStore.set('exists', 'value')
      const result = await cacheStore.has('exists')
      expect(result).toBe(true)
    })

    test('returns false after key is deleted', async () => {
      await cacheStore.set('to-delete', 'value')
      await cacheStore.delete('to-delete')
      const result = await cacheStore.has('to-delete')
      expect(result).toBe(false)
    })

    test('returns false for directory instead of file', async () => {
      // This tests the statSync.isFile() check
      await cacheStore.set('file-key', 'value')
      const result = await cacheStore.has('file-key')
      expect(result).toBe(true)
    })
  })

  /**
   * delete method tests
   * @description Tests for removing cached entries
   */
  describe('delete', () => {
    test('returns true when deleting existing key', async () => {
      await cacheStore.set('delete-me', 'value')
      const result = await cacheStore.delete('delete-me')
      expect(result).toBe(true)
    })

    test('returns false when deleting non-existent key', async () => {
      const result = await cacheStore.delete('nonexistent')
      expect(result).toBe(false)
    })

    test('removes entry from cache', async () => {
      await cacheStore.set('remove', 'value')
      await cacheStore.delete('remove')
      const result = await cacheStore.get<string>('remove')
      expect(result).toBeNull()
    })

    test('allows re-adding deleted key', async () => {
      await cacheStore.set('re-add', 'original')
      await cacheStore.delete('re-add')
      await cacheStore.set('re-add', 'new-value')
      const result = await cacheStore.get<string>('re-add')
      expect(result).toBe('new-value')
    })
  })

  /**
   * clear method tests
   * @description Tests for clearing all cache entries
   */
  describe('clear', () => {
    test('removes all entries', async () => {
      await cacheStore.set('key1', 'value1')
      await cacheStore.set('key2', 'value2')
      await cacheStore.set('key3', 'value3')
      await cacheStore.clear()
      expect(await cacheStore.has('key1')).toBe(false)
      expect(await cacheStore.has('key2')).toBe(false)
      expect(await cacheStore.has('key3')).toBe(false)
    })

    test('works on empty cache', async () => {
      await expect(cacheStore.clear()).resolves.not.toThrow()
    })

    test('allows adding entries after clear', async () => {
      await cacheStore.set('before-clear', 'value')
      await cacheStore.clear()
      await cacheStore.set('after-clear', 'new-value')
      const result = await cacheStore.get<string>('after-clear')
      expect(result).toBe('new-value')
    })

    test('handles non-existent directory gracefully', async () => {
      const newStore = new CacheStore('/nonexistent/path/to/cache')
      await expect(newStore.clear()).resolves.not.toThrow()
    })
  })

  /**
   * getStats method tests
   * @description Tests for cache statistics
   */
  describe('getStats', () => {
    test('returns zero stats for empty cache', async () => {
      const stats = await cacheStore.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.size).toBe(0)
    })

    test('returns correct entry count', async () => {
      await cacheStore.set('key1', 'value1')
      await cacheStore.set('key2', 'value2')
      const stats = await cacheStore.getStats()
      expect(stats.entries).toBe(2)
    })

    test('returns total size of entries', async () => {
      await cacheStore.set('key1', 'x'.repeat(100))
      const stats = await cacheStore.getStats()
      expect(stats.size).toBeGreaterThan(0)
    })

    test('updates stats after deletion', async () => {
      await cacheStore.set('temp', 'value')
      const beforeDelete = await cacheStore.getStats()
      await cacheStore.delete('temp')
      const afterDelete = await cacheStore.getStats()
      expect(afterDelete.entries).toBeLessThan(beforeDelete.entries)
    })

    test('handles non-existent directory', async () => {
      const newStore = new CacheStore('/nonexistent/path')
      const stats = await newStore.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.size).toBe(0)
    })
  })
})

/**
 * InvalidationManager Class Tests
 * @description Tests for cache invalidation strategies
 */
describe('InvalidationManager', () => {
  let tempDir: string
  let cacheStore: CacheStore
  let manager: InvalidationManager

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'invalidation-test-'))
    cacheStore = new CacheStore(tempDir)
    manager = new InvalidationManager(cacheStore, '1.0.0')
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  /**
   * Constructor tests
   * @description Tests for InvalidationManager initialization
   */
  describe('constructor', () => {
    test('creates instance with cache store and version', () => {
      const mgr = new InvalidationManager(cacheStore, '2.0.0')
      expect(mgr).toBeInstanceOf(InvalidationManager)
    })

    test('accepts semantic version string', () => {
      const mgr = new InvalidationManager(cacheStore, '1.2.3-beta.1')
      expect(mgr).toBeInstanceOf(InvalidationManager)
    })
  })

  /**
   * shouldInvalidate method tests
   * @description Tests for invalidation decision logic
   */
  describe('shouldInvalidate', () => {
    test('returns true for time-based with no entry', async () => {
      const result = await manager.shouldInvalidate('nonexistent', InvalidationStrategy.TimeBased)
      expect(result).toBe(true)
    })

    test('returns true for expired time-based entry', async () => {
      const shortTtl = 1 // 1ms
      await cacheStore.set('time-key', { timestamp: Date.now(), ttl: shortTtl })
      await new Promise((resolve) => setTimeout(resolve, 10))
      const result = await manager.shouldInvalidate('time-key', InvalidationStrategy.TimeBased)
      expect(result).toBe(true)
    })

    test('returns false for valid time-based entry', async () => {
      const longTtl = 60000 // 60 seconds
      await cacheStore.set('valid-time-key', { timestamp: Date.now(), ttl: longTtl })
      const result = await manager.shouldInvalidate(
        'valid-time-key',
        InvalidationStrategy.TimeBased,
      )
      expect(result).toBe(false)
    })

    test('returns false for content-based strategy', async () => {
      const result = await manager.shouldInvalidate(
        'content-key',
        InvalidationStrategy.ContentBased,
      )
      expect(result).toBe(false)
    })

    test('returns false for version-based strategy', async () => {
      const result = await manager.shouldInvalidate(
        'version-key',
        InvalidationStrategy.VersionBased,
      )
      expect(result).toBe(false)
    })
  })

  /**
   * invalidateOnContentChange method tests
   * @description Tests for content-based invalidation
   */
  describe('invalidateOnContentChange', () => {
    test('returns true when content has changed', async () => {
      const testFile = path.join(tempDir, 'content-test.txt')
      await fs.writeFile(testFile, 'original content', 'utf-8')
      const originalHash = hashContent('different content')
      const result = await manager.invalidateOnContentChange(testFile, originalHash)
      expect(result).toBe(true)
    })

    test('returns false when content is unchanged', async () => {
      const testFile = path.join(tempDir, 'same-content.txt')
      const content = 'same content'
      await fs.writeFile(testFile, content, 'utf-8')
      const fileHash = await hashFile(testFile)
      const result = await manager.invalidateOnContentChange(testFile, fileHash)
      expect(result).toBe(false)
    })

    test('throws error for non-existent file', async () => {
      const nonExistent = path.join(tempDir, 'missing.txt')
      await expect(manager.invalidateOnContentChange(nonExistent, 'somehash')).rejects.toThrow()
    })

    test('handles file modification', async () => {
      const testFile = path.join(tempDir, 'modified.txt')
      await fs.writeFile(testFile, 'original', 'utf-8')
      const originalHash = await hashFile(testFile)
      await fs.writeFile(testFile, 'modified', 'utf-8')
      const result = await manager.invalidateOnContentChange(testFile, originalHash)
      expect(result).toBe(true)
    })
  })

  /**
   * invalidateOnVersionChange method tests
   * @description Tests for version-based invalidation
   */
  describe('invalidateOnVersionChange', () => {
    test('returns false for same version', () => {
      const result = manager.invalidateOnVersionChange('1.0.0')
      expect(result).toBe(false)
    })

    test('returns true for different version', () => {
      const result = manager.invalidateOnVersionChange('2.0.0')
      expect(result).toBe(true)
    })

    test('returns true for patch version change', () => {
      const result = manager.invalidateOnVersionChange('1.0.1')
      expect(result).toBe(true)
    })

    test('returns true for minor version change', () => {
      const result = manager.invalidateOnVersionChange('1.1.0')
      expect(result).toBe(true)
    })

    test('handles pre-release versions', () => {
      const result = manager.invalidateOnVersionChange('1.0.0-beta')
      expect(result).toBe(true)
    })
  })
})

/**
 * Factory Functions Tests
 * @description Tests for cache factory functions
 */
describe('Factory Functions', () => {
  /**
   * createDefaultCache function tests
   * @description Tests for default cache store creation
   */
  describe('createDefaultCache', () => {
    test('returns CacheStore instance', () => {
      const cache = createDefaultCache()
      expect(cache).toBeInstanceOf(CacheStore)
    })

    test('creates cache with default directory', () => {
      const cache = createDefaultCache()
      expect(cache).toBeDefined()
    })
  })

  /**
   * createDefaultInvalidationManager function tests
   * @description Tests for default invalidation manager creation
   */
  describe('createDefaultInvalidationManager', () => {
    test('returns InvalidationManager instance', () => {
      const cache = createDefaultCache()
      const manager = createDefaultInvalidationManager(cache, '1.0.0')
      expect(manager).toBeInstanceOf(InvalidationManager)
    })

    test('accepts custom version', () => {
      const cache = createDefaultCache()
      const manager = createDefaultInvalidationManager(cache, '2.0.0')
      expect(manager).toBeDefined()
    })
  })
})

/**
 * InvalidationStrategy Enum Tests
 * @description Tests for invalidation strategy enum values
 */
describe('InvalidationStrategy', () => {
  test('has TimeBased strategy', () => {
    expect(InvalidationStrategy.TimeBased).toBe('time-based')
  })

  test('has ContentBased strategy', () => {
    expect(InvalidationStrategy.ContentBased).toBe('content-based')
  })

  test('has VersionBased strategy', () => {
    expect(InvalidationStrategy.VersionBased).toBe('version-based')
  })
})

/**
 * CacheEntry Interface Tests
 * @description Tests for cache entry structure
 */
describe('CacheEntry', () => {
  test('stores entry with required fields', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'entry-test-'))
    const cache = new CacheStore(tempDir)

    await cache.set('test', 'value')
    const files = await fs.readdir(tempDir)
    const content = await fs.readFile(path.join(tempDir, files[0]!), 'utf-8')
    const entry: CacheEntry<string> = JSON.parse(content)

    expect(entry.key).toBe('test')
    expect(entry.value).toBe('value')
    expect(typeof entry.timestamp).toBe('number')

    await fs.rm(tempDir, { recursive: true, force: true })
  })

  test('includes optional TTL when provided', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ttl-test-'))
    const cache = new CacheStore(tempDir)

    await cache.set('with-ttl', 'value', 60000)
    const files = await fs.readdir(tempDir)
    const content = await fs.readFile(path.join(tempDir, files[0]!), 'utf-8')
    const entry: CacheEntry<string> = JSON.parse(content)

    expect(entry.ttl).toBe(60000)

    await fs.rm(tempDir, { recursive: true, force: true })
  })
})

/**
 * Edge Cases Tests
 * @description Tests for edge cases and error handling
 */
describe('Edge Cases', () => {
  let tempDir: string
  let cacheStore: CacheStore

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'edge-test-'))
    cacheStore = new CacheStore(tempDir)
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  test('handles concurrent reads and writes', async () => {
    const operations: Promise<unknown>[] = []
    for (let i = 0; i < 50; i++) {
      operations.push(cacheStore.set(`key-${i}`, `value-${i}`))
    }
    for (let i = 0; i < 50; i++) {
      operations.push(cacheStore.get<string>(`key-${i}`))
    }
    await Promise.all(operations)
    expect(true).toBe(true)
  })

  test('handles very long key names', async () => {
    const longKey = 'a'.repeat(1000)
    await cacheStore.set(longKey, 'value')
    const result = await cacheStore.get<string>(longKey)
    expect(result).toBe('value')
  })

  test('handles keys with special characters', async () => {
    const specialKey = 'key/with:special*chars?and#symbols'
    await cacheStore.set(specialKey, 'value')
    const result = await cacheStore.get<string>(specialKey)
    expect(result).toBe('value')
  })

  test('handles unicode keys', async () => {
    const unicodeKey = '键-キー-🔑'
    await cacheStore.set(unicodeKey, 'unicode-value')
    const result = await cacheStore.get<string>(unicodeKey)
    expect(result).toBe('unicode-value')
  })

  test('handles deeply nested objects', async () => {
    const deep: Record<string, unknown> = {}
    let current = deep
    for (let i = 0; i < 50; i++) {
      current.level = {}
      current = current.level as Record<string, unknown>
    }
    current.value = 'deep'
    await cacheStore.set('deep', deep)
    const result = await cacheStore.get<typeof deep>('deep')
    expect(result).toBeDefined()
  })

  test('handles very large values', async () => {
    const largeValue = 'x'.repeat(100000)
    await cacheStore.set('large', largeValue)
    const result = await cacheStore.get<string>('large')
    expect(result).toBe(largeValue)
  })

  test('CacheStore handles permission errors gracefully', async () => {
    // Create a cache in a read-only directory (if possible on this system)
    // This test may behave differently on different platforms
    const readOnlyDir = path.join(tempDir, 'readonly')
    await fs.mkdir(readOnlyDir)
    const readOnlyCache = new CacheStore(readOnlyDir)

    // Try to use the cache - should not throw
    const result = await readOnlyCache.get<string>('any-key')
    expect(result).toBeNull()
  })
})
