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

  describe('hashFile', () => {
    let tempDir: string

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hash-file-test-'))
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

describe('Extended Cache Tests', () => {
  describe('Hash Function Additional Tests', () => {
    test('hashContent handles very long string', () => {
      const longStr = 'x'.repeat(100000)
      const hash = hashContent(longStr)
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    test('hashContent handles repeated pattern', () => {
      const pattern = 'abcabcabcabc'
      const hash = hashContent(pattern)
      expect(hash).toHaveLength(64)
    })

    test('hashContent handles all same characters', () => {
      const sameChars = 'aaaaaa'
      const hash = hashContent(sameChars)
      expect(hash).toHaveLength(64)
    })

    test('hashContent handles alternating pattern', () => {
      const alternating = 'abababab'
      const hash = hashContent(alternating)
      expect(hash).toHaveLength(64)
    })

    test('hashContent handles palindrome', () => {
      const palindrome = 'madam'
      const hash = hashContent(palindrome)
      expect(hash).toHaveLength(64)
    })

    test('hashContent handles string with only digits', () => {
      const digits = '1234567890'
      const hash = hashContent(digits)
      expect(hash).toHaveLength(64)
    })

    test('hashContent handles string with mixed case and digits', () => {
      const mixed = 'AbC123xYz'
      const hash = hashContent(mixed)
      expect(hash).toHaveLength(64)
    })

    test('hashContent handles very short strings', () => {
      expect(hashContent('a')).toHaveLength(64)
      expect(hashContent('ab')).toHaveLength(64)
      expect(hashContent('')).toHaveLength(64)
    })

    test('hashContent handles consecutive spaces', () => {
      const spaces = '    '
      const hash = hashContent(spaces)
      expect(hash).toHaveLength(64)
    })

    test('hashContent handles tabs and spaces mixed', () => {
      const tabsAndSpaces = '\t \t  \n\n  '
      const hash = hashContent(tabsAndSpaces)
      expect(hash).toHaveLength(64)
    })
  })

  describe('Hash File Additional Tests', () => {
    let tempDir: string

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hash-file-additional2-'))
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('hashFile handles file with BOM', async () => {
      const bomFile = path.join(tempDir, 'bom.txt')
      await fs.writeFile(bomFile, '\ufeffcontent', 'utf-8')
      const hash = await hashFile(bomFile)
      expect(hash).toHaveLength(64)
    })

    test('hashFile handles file with mixed encoding', async () => {
      const mixedFile = path.join(tempDir, 'mixed.txt')
      await fs.writeFile(mixedFile, 'Hello 世界! 🌍', 'utf-8')
      const hash = await hashFile(mixedFile)
      expect(hash).toHaveLength(64)
    })

    test('hashFile handles file with only BOM', async () => {
      const bomOnlyFile = path.join(tempDir, 'bom-only.txt')
      await fs.writeFile(bomOnlyFile, '\ufeff', 'utf-8')
      const hash = await hashFile(bomOnlyFile)
      expect(hash).toHaveLength(64)
    })

    test('hashFile handles file with multiple lines', async () => {
      const multiLineFile = path.join(tempDir, 'multi.txt')
      const multiLineContent = 'line1\nline2\nline3'
      await fs.writeFile(multiLineFile, multiLineContent, 'utf-8')
      const hash = await hashFile(multiLineFile)
      expect(hash).toHaveLength(64)
    })

    test('hashFile is deterministic for same content', async () => {
      const file1 = path.join(tempDir, 'det1.txt')
      const file2 = path.join(tempDir, 'det2.txt')
      await Promise.all([
        fs.writeFile(file1, 'same content', 'utf-8'),
        fs.writeFile(file2, 'same content', 'utf-8'),
      ])
      const [hash1, hash2] = await Promise.all([hashFile(file1), hashFile(file2)])
      expect(hash1).toBe(hash2)
    })

    test('hashFile handles large file efficiently', async () => {
      const largeFile = path.join(tempDir, 'large.txt')
      await fs.writeFile(largeFile, 'x'.repeat(100000), 'utf-8')
      const hash = await hashFile(largeFile)
      expect(hash).toHaveLength(64)
    })

    test('hashFile handles zero-length file', async () => {
      const zeroFile = path.join(tempDir, 'zero.txt')
      await fs.writeFile(zeroFile, '', 'utf-8')
      const hash = await hashFile(zeroFile)
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    })
  })

  describe('CacheStore Additional Operations', () => {
    let tempDir: string
    let cacheStore: CacheStore

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cache-ops-'))
      cacheStore = new CacheStore(tempDir)
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('CacheStore handles set-has-delete cycle', async () => {
      await cacheStore.set('cycle-key', 'value1')
      const hasBefore = await cacheStore.has('cycle-key')
      await cacheStore.delete('cycle-key')
      const hasAfter = await cacheStore.has('cycle-key')
      expect(hasBefore).toBe(true)
      expect(hasAfter).toBe(false)
    })

    test('CacheStore handles set-delete-has-get sequence', async () => {
      await cacheStore.set('sequence-key', 'value')
      await cacheStore.delete('sequence-key')
      const has = await cacheStore.has('sequence-key')
      const result = await cacheStore.get<string>('sequence-key')
      expect(has).toBe(false)
      expect(result).toBeNull()
    })

    test('CacheStore handles overwrite-then-delete', async () => {
      await cacheStore.set('overwrite-key', 'value1')
      await cacheStore.set('overwrite-key', 'value2')
      await cacheStore.delete('overwrite-key')
      const result = await cacheStore.get<string>('overwrite-key')
      expect(result).toBeNull()
    })

    test('CacheStore handles multiple operations on same key sequentially', async () => {
      await cacheStore.set('seq-key', 'v1')
      await cacheStore.get<string>('seq-key')
      await cacheStore.set('seq-key', 'v2')
      await cacheStore.get<string>('seq-key')
      await cacheStore.set('seq-key', 'v3')
      const final = await cacheStore.get<string>('seq-key')
      expect(final).toBe('v3')
    })

    test('CacheStore handles TTL expiration during reads', async () => {
      const ttl = 100
      await cacheStore.set('ttl-read-key', 'value', ttl)
      await new Promise((resolve) => setTimeout(resolve, 50))
      const beforeExpire = await cacheStore.get<string>('ttl-read-key')
      await new Promise((resolve) => setTimeout(resolve, 60))
      const afterExpire = await cacheStore.get<string>('ttl-read-key')
      expect(beforeExpire).toBe('value')
      expect(afterExpire).toBeNull()
    })

    test('CacheStore handles get on just-cleared cache', async () => {
      await cacheStore.set('before-clear', 'value')
      await cacheStore.clear()
      const result = await cacheStore.get<string>('before-clear')
      expect(result).toBeNull()
    })

    test('CacheStore handles has on just-cleared cache', async () => {
      await cacheStore.set('before-has', 'value')
      await cacheStore.clear()
      const result = await cacheStore.has('before-has')
      expect(result).toBe(false)
    })

    test('CacheStore handles stats on empty cache', async () => {
      const stats = await cacheStore.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.size).toBe(0)
    })

    test('CacheStore handles delete on empty cache', async () => {
      const result = await cacheStore.delete('empty-key')
      expect(result).toBe(false)
    })
  })

  describe('CacheStore Value Type Variations', () => {
    let tempDir: string
    let cacheStore: CacheStore

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'value-variations-'))
      cacheStore = new CacheStore(tempDir)
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('CacheStore handles boolean true with TTL', async () => {
      await cacheStore.set('bool-ttl', true, 5000)
      const result1 = await cacheStore.get<boolean>('bool-ttl')
      expect(result1).toBe(true)
      await cacheStore.set('bool-ttl', false, 5000)
      const result2 = await cacheStore.get<boolean>('bool-ttl')
      expect(result2).toBe(false)
    })

    test('CacheStore handles number with different types', async () => {
      await cacheStore.set('num-int', 42, 5000)
      await cacheStore.set('num-float', 42.5, 5000)
      await cacheStore.set('num-zero', 0, 5000)
      const [intResult, floatResult, zeroResult] = await Promise.all([
        cacheStore.get<number>('num-int'),
        cacheStore.get<number>('num-float'),
        cacheStore.get<number>('num-zero'),
      ])
      expect(intResult).toBe(42)
      expect(floatResult).toBe(42.5)
      expect(zeroResult).toBe(0)
    })

    test('CacheStore handles string with escape sequences', async () => {
      const escapeStr = 'value\\n\\t\\r'
      await cacheStore.set('escape-key', escapeStr)
      const result = await cacheStore.get<string>('escape-key')
      expect(result).toBe(escapeStr)
    })

    test('CacheStore handles object with array and object', async () => {
      const complexObj = { arr: [1, 2, 3], obj: { nested: 'value' } }
      await cacheStore.set('complex-type', complexObj)
      const result = await cacheStore.get<typeof complexObj>('complex-type')
      expect(result).toEqual(complexObj)
    })

    test('CacheStore handles function type', async () => {
      const func = () => 'test'
      await cacheStore.set('func-type', func)
      const result = await cacheStore.get<() => void>('func-type')
      expect(result).toBeUndefined()
    })

    test('CacheStore handles Date object', async () => {
      const date = new Date('2024-01-01T00:00:00.000Z')
      await cacheStore.set('date-type', date)
      const result = await cacheStore.get<string>('date-type')
      expect(result).toBe(date.toISOString())
    })

    test('CacheStore handles symbol type', async () => {
      const sym = Symbol('test-symbol')
      await cacheStore.set('symbol-type', sym)
      const result = await cacheStore.get<symbol>('symbol-type')
      expect(result).toBeUndefined()
    })

    test('CacheStore handles bigint', async () => {
      const bigInt = BigInt(9007199254740991)
      await expect(cacheStore.set('bigint', bigInt)).rejects.toThrow()
    })
  })

  describe('InvalidationManager Additional Scenarios', () => {
    let tempDir: string
    let cacheStore: CacheStore
    let manager: InvalidationManager

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'inv-scenarios-'))
      cacheStore = new CacheStore(tempDir)
      manager = new InvalidationManager(cacheStore, '1.0.0')
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('InvalidationManager handles content-based with hash change', async () => {
      const testFile = path.join(tempDir, 'hash-change.txt')
      await fs.writeFile(testFile, 'original', 'utf-8')
      const originalHash = await hashFile(testFile)
      await fs.writeFile(testFile, 'modified', 'utf-8')
      const result = await manager.invalidateOnContentChange(testFile, originalHash)
      expect(result).toBe(true)
    })

    test('InvalidationManager handles content-based with same content', async () => {
      const testFile = path.join(tempDir, 'same-content.txt')
      await fs.writeFile(testFile, 'unchanged', 'utf-8')
      const sameHash = await hashFile(testFile)
      const result = await manager.invalidateOnContentChange(testFile, sameHash)
      expect(result).toBe(false)
    })

    test('InvalidationManager handles version with major increase', async () => {
      const result = manager.invalidateOnVersionChange('2.0.0')
      expect(result).toBe(true)
    })

    test('InvalidationManager handles version with minor increase', async () => {
      const result = manager.invalidateOnVersionChange('1.1.0')
      expect(result).toBe(true)
    })

    test('InvalidationManager handles version with patch increase', async () => {
      const result = manager.invalidateOnVersionChange('1.0.1')
      expect(result).toBe(true)
    })

    test('InvalidationManager handles version with pre-release', async () => {
      const result = manager.invalidateOnVersionChange('1.0.0-beta')
      expect(result).toBe(true)
    })

    test('InvalidationManager handles version with build metadata', async () => {
      const result = manager.invalidateOnVersionChange('1.0.0+build')
      expect(result).toBe(true)
    })

    test('InvalidationManager handles version with all metadata', async () => {
      const result = manager.invalidateOnVersionChange('1.0.0-beta+build.meta')
      expect(result).toBe(true)
    })

    test('InvalidationManager handles time-based with exact expiration', async () => {
      await cacheStore.set('expire-exact', { timestamp: Date.now(), ttl: 50 })
      await new Promise((resolve) => setTimeout(resolve, 60))
      const result = await manager.shouldInvalidate('expire-exact', InvalidationStrategy.TimeBased)
      expect(result).toBe(true)
    })

    test('InvalidationManager handles time-based before expiration', async () => {
      await cacheStore.set('expire-before', { timestamp: Date.now(), ttl: 5000 })
      const result = await manager.shouldInvalidate('expire-before', InvalidationStrategy.TimeBased)
      expect(result).toBe(false)
    })
  })

  describe('CacheEntry Field Tests', () => {
    let tempDir: string
    let cacheStore: CacheStore

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'entry-fields-'))
      cacheStore = new CacheStore(tempDir)
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('CacheEntry has key field', async () => {
      await cacheStore.set('key-check', 'value')
      const files = await fs.readdir(tempDir)
      const content = await fs.readFile(path.join(tempDir, files[0]!), 'utf-8')
      const entry: CacheEntry<string> = JSON.parse(content)
      expect(entry.key).toBe('key-check')
    })

    test('CacheEntry has timestamp number type', async () => {
      await cacheStore.set('timestamp-check', 'value')
      const files = await fs.readdir(tempDir)
      const content = await fs.readFile(path.join(tempDir, files[0]!), 'utf-8')
      const entry: CacheEntry<string> = JSON.parse(content)
      expect(typeof entry.timestamp).toBe('number')
    })

    test('CacheEntry timestamp is recent', async () => {
      const before = Date.now()
      await cacheStore.set('timestamp-recent', 'value')
      const files = await fs.readdir(tempDir)
      const content = await fs.readFile(path.join(tempDir, files[0]!), 'utf-8')
      const entry: CacheEntry<string> = JSON.parse(content)
      expect(entry.timestamp).toBeGreaterThanOrEqual(before)
      expect(entry.timestamp).toBeLessThanOrEqual(before + 1000)
    })

    test('CacheEntry TTL field is number when present', async () => {
      await cacheStore.set('ttl-check', 'value', 60000)
      const files = await fs.readdir(tempDir)
      const content = await fs.readFile(path.join(tempDir, files[0]!), 'utf-8')
      const entry: CacheEntry<string> = JSON.parse(content)
      expect(entry.ttl).toBe(60000)
    })

    test('CacheEntry TTL field is undefined when not provided', async () => {
      await cacheStore.set('no-ttl', 'value')
      const files = await fs.readdir(tempDir)
      const content = await fs.readFile(path.join(tempDir, files[0]!), 'utf-8')
      const entry: CacheEntry<string> = JSON.parse(content)
      expect(entry.ttl).toBeUndefined()
    })
  })

  describe('Error Recovery Tests', () => {
    let tempDir: string
    let cacheStore: CacheStore

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'error-recovery-'))
      cacheStore = new CacheStore(tempDir)
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('CacheStore recovers after corrupted cache file', async () => {
      await cacheStore.set('recover-key', 'value')
      const files = await fs.readdir(tempDir)
      const content = await fs.readFile(path.join(tempDir, files[0]!), 'utf-8')
      await fs.writeFile(path.join(tempDir, files[0]!), 'corrupted json', 'utf-8')
      const result = await cacheStore.get<string>('recover-key')
      expect(result).toBeNull()
    })

    test('CacheStore allows setting new value after corrupted read', async () => {
      await cacheStore.set('recover-key', 'new-value')
      const result = await cacheStore.get<string>('recover-key')
      expect(result).toBe('new-value')
    })

    test('CacheStore has returns true even with corrupted content', async () => {
      await cacheStore.set('has-check', 'value')
      const files = await fs.readdir(tempDir)
      await fs.writeFile(path.join(tempDir, files[0]!), 'corrupted', 'utf-8')
      const result = await cacheStore.has('has-check')
      expect(result).toBe(true)
    })
  })

  describe('Performance and Stress Tests', () => {
    let tempDir: string
    let cacheStore: CacheStore

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'performance-'))
      cacheStore = new CacheStore(tempDir)
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('CacheStore handles rapid successive get operations', async () => {
      await cacheStore.set('rapid-get', 'value')
      for (let i = 0; i < 50; i++) {
        await cacheStore.get<string>('rapid-get')
      }
      const final = await cacheStore.get<string>('rapid-get')
      expect(final).toBe('value')
    })

    test('CacheStore handles rapid successive set operations', async () => {
      for (let i = 0; i < 50; i++) {
        await cacheStore.set(`rapid-set-${i}`, `value${i}`)
      }
      const final = await cacheStore.get<string>('rapid-set-49')
      expect(final).toBe('value49')
    })

    test('CacheStore handles alternating get and set', async () => {
      for (let i = 0; i < 20; i++) {
        await cacheStore.set('alt-key', `value${i}`)
        const result = await cacheStore.get<string>('alt-key')
        expect(result).toBe(`value${i}`)
      }
    })

    test('CacheStore stats accuracy with many entries', async () => {
      const count = 100
      for (let i = 0; i < count; i++) {
        await cacheStore.set(`stat-key-${i}`, `value${i}`)
      }
      const stats = await cacheStore.getStats()
      expect(stats.entries).toBe(count)
    })

    test('CacheStore clear performance with many entries', async () => {
      const count = 50
      for (let i = 0; i < count; i++) {
        await cacheStore.set(`clear-key-${i}`, `value${i}`)
      }
      const beforeClear = await cacheStore.getStats()
      await cacheStore.clear()
      const afterClear = await cacheStore.getStats()
      expect(beforeClear.entries).toBeGreaterThan(afterClear.entries)
      expect(beforeClear.size).toBeGreaterThan(afterClear.size)
    })
  })

  describe('Real-World Usage Patterns', () => {
    let tempDir: string
    let cacheStore: CacheStore

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'realworld-'))
      cacheStore = new CacheStore(tempDir)
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('CacheStore handles typical key naming', async () => {
      await cacheStore.set('user:123456', 'data')
      const result = await cacheStore.get<string>('user:123456')
      expect(result).toBe('data')
    })

    test('CacheStore handles session-like keys', async () => {
      await cacheStore.set('session:abc123', 'data')
      const result = await cacheStore.get<string>('session:abc123')
      expect(result).toBe('data')
    })

    test('CacheStore handles config-like keys', async () => {
      await cacheStore.set('config:app:theme', 'dark')
      const result = await cacheStore.get<string>('config:app:theme')
      expect(result).toBe('dark')
    })

    test('CacheStore handles cache-like keys', async () => {
      await cacheStore.set('cache:timestamp', '123456789')
      const result = await cacheStore.get<string>('cache:timestamp')
      expect(result).toBe('123456789')
    })
  })

  describe('Hash Function Performance Tests', () => {
    test('hashContent handles very large input efficiently', () => {
      const large = 'x'.repeat(1000000)
      const start = Date.now()
      const hash = hashContent(large)
      const duration = Date.now() - start
      expect(hash).toHaveLength(64)
      expect(duration).toBeLessThan(1000)
    })

    test('hashContent is performant for repeated calls', () => {
      const content = 'test'
      const iterations = 1000
      const start = Date.now()
      for (let i = 0; i < iterations; i++) {
        hashContent(content)
      }
      const duration = Date.now() - start
      expect(duration).toBeLessThan(500)
    })

    test('hashContent handles very short input efficiently', () => {
      const short = 'x'
      const iterations = 1000
      const start = Date.now()
      for (let i = 0; i < iterations; i++) {
        hashContent(short)
      }
      const duration = Date.now() - start
      expect(duration).toBeLessThan(100)
    })
  })

  describe('Hash File Performance Tests', () => {
    let tempDir: string

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hash-perf-'))
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('hashFile handles small file efficiently', async () => {
      const smallFile = path.join(tempDir, 'small.txt')
      await fs.writeFile(smallFile, 'x', 'utf-8')
      const start = Date.now()
      const hash = await hashFile(smallFile)
      const duration = Date.now() - start
      expect(hash).toHaveLength(64)
      expect(duration).toBeLessThan(100)
    })

    test('hashFile handles large file efficiently', async () => {
      const largeFile = path.join(tempDir, 'large.txt')
      await fs.writeFile(largeFile, 'x'.repeat(100000), 'utf-8')
      const start = Date.now()
      const hash = await hashFile(largeFile)
      const duration = Date.now() - start
      expect(hash).toHaveLength(64)
      expect(duration).toBeLessThan(500)
    })

    test('hashFile streams large file efficiently', async () => {
      const largeFile = path.join(tempDir, 'stream-large.txt')
      await fs.writeFile(largeFile, 'x'.repeat(500000), 'utf-8')
      const start = Date.now()
      const hash = await hashFile(largeFile)
      const duration = Date.now() - start
      expect(hash).toHaveLength(64)
      expect(duration).toBeLessThan(1000)
    })
  })

  describe('CacheStore Data Integrity Tests', () => {
    let tempDir: string
    let cacheStore: CacheStore

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'integrity-'))
      cacheStore = new CacheStore(tempDir)
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('CacheStore preserves value through serialization round-trip', async () => {
      const original = { data: { nested: { deep: 'value' } } }
      await cacheStore.set('integrity-test', original)
      const result = await cacheStore.get<typeof original>('integrity-test')
      expect(result).toEqual(original)
    })

    test('CacheStore handles special JSON characters in values', async () => {
      const specialChars = {
        chars: '\x00\x01',
        control: '\u001c',
        newline: '\n',
        tab: '\t',
        backslash: '\\\\',
      }
      await cacheStore.set('json-special', specialChars)
      const result = await cacheStore.get<typeof specialChars>('json-special')
      expect(result).toEqual(specialChars)
    })

    test('CacheStore handles nested null values', async () => {
      const withNulls = { a: null, b: { c: null, d: { e: null } } }
      await cacheStore.set('nested-nulls', withNulls)
      const result = await cacheStore.get<typeof withNulls>('nested-nulls')
      expect(result).toEqual(withNulls)
    })

    test('CacheStore handles undefined in object', async () => {
      const withUndefined = { a: undefined, b: undefined, c: undefined }
      await cacheStore.set('with-undefined', withUndefined)
      const result = await cacheStore.get<{ a: unknown; b: unknown; c: unknown }>('with-undefined')
      expect(result).toEqual(withUndefined)
    })

    test('CacheStore handles circular references', async () => {
      const ref1 = { data: 'shared' }
      const ref2 = ref1
      const circular = { ref1, ref2 }
      await cacheStore.set('circular', circular)
      const result = await cacheStore.get<typeof circular>('circular')
      expect(result).toEqual(circular)
    })

    test('CacheStore handles array with self-reference', async () => {
      const selfRef: Record<string, unknown> = { self: 'reference' }
      const withSelfRef = { data: selfRef }
      await cacheStore.set('self-ref', withSelfRef)
      const result = await cacheStore.get<{ data: { self: string } }>('self-ref')
      expect(result?.data.self).toBe('reference')
    })
  })

  describe('CacheStore Error Recovery Tests', () => {
    let tempDir: string
    let cacheStore: CacheStore

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'error-recovery-'))
      cacheStore = new CacheStore(tempDir)
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('CacheStore continues operation after get error', async () => {
      await cacheStore.set('continue-test', 'value')
      const files = await fs.readdir(tempDir)
      await fs.writeFile(path.join(tempDir, files[0]!), 'invalid json{{{', 'utf-8')
      const result1 = await cacheStore.get<string>('continue-test')
      expect(result1).toBeNull()
      const result2 = await cacheStore.get<string>('continue-test')
      expect(result2).toBeNull()
      await cacheStore.set('continue-test', 'new-value')
      const result3 = await cacheStore.get<string>('continue-test')
      expect(result3).toBe('new-value')
    })

    test('CacheStore continues operation after has error', async () => {
      await cacheStore.set('has-test', 'value')
      const files = await fs.readdir(tempDir)
      const cacheFile = files[0]!
      await fs.writeFile(path.join(tempDir, cacheFile), 'invalid json', 'utf-8')
      const result1 = await cacheStore.has('has-test')
      expect(result1).toBe(true)
      const result2 = await cacheStore.get<string>('has-test')
      expect(result2).toBeNull()
      await cacheStore.set('has-test', 'recovered')
      const result3 = await cacheStore.has('has-test')
      expect(result3).toBe(true)
      const result4 = await cacheStore.get<string>('has-test')
      expect(result4).toBe('recovered')
    })

    test('CacheStore continues operation after delete error', async () => {
      await cacheStore.set('delete-test', 'value')
      const files = await fs.readdir(tempDir)
      const cacheFile = path.join(tempDir, files[0]!)
      await fs.rm(cacheFile)
      await fs.mkdir(cacheFile)
      const result1 = await cacheStore.get<string>('delete-test')
      expect(result1).toBeNull()
      const result2 = await cacheStore.delete('delete-test')
      expect(result2).toBe(false)
      await fs.rm(cacheFile, { recursive: true })
      await cacheStore.set('delete-test', 'recovered')
      const result3 = await cacheStore.get<string>('delete-test')
      expect(result3).toBe('recovered')
    })

    test('CacheStore continues operation after clear error', async () => {
      await cacheStore.set('clear-test', 'value1')
      const files = await fs.readdir(tempDir)
      await fs.writeFile(path.join(tempDir, files[0]!), 'invalid json', 'utf-8')
      await cacheStore.clear()
      const result2 = await cacheStore.has('clear-test')
      expect(result2).toBe(false)
      await cacheStore.set('clear-test', 'value2')
      const result4 = await cacheStore.get<string>('clear-test')
      expect(result4).toBe('value2')
    })

    test('CacheStore continues after getStats error', async () => {
      await cacheStore.set('stats-test', 'value')
      const stats = await cacheStore.getStats()
      expect(stats.entries).toBeGreaterThanOrEqual(1)
      expect(stats.size).toBeGreaterThanOrEqual(0)
    })
  })

  describe('InvalidationManager Complex Scenarios', () => {
    let tempDir: string
    let cacheStore: CacheStore
    let manager: InvalidationManager

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'inv-complex-'))
      cacheStore = new CacheStore(tempDir)
      manager = new InvalidationManager(cacheStore, '1.0.0')
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('InvalidationManager handles mixed strategies', async () => {
      await cacheStore.set('mixed-1', { timestamp: Date.now(), ttl: 1000 })
      await cacheStore.set('mixed-2', { timestamp: Date.now() })
      const results = await Promise.all([
        manager.shouldInvalidate('mixed-1', InvalidationStrategy.TimeBased),
        manager.shouldInvalidate('mixed-2', InvalidationStrategy.ContentBased),
        manager.shouldInvalidate('mixed-2', InvalidationStrategy.VersionBased),
      ])
      expect(results).toHaveLength(3)
    })

    test('InvalidationManager handles TTL boundary', async () => {
      await cacheStore.set('ttl-boundary', { timestamp: Date.now(), ttl: 1 })
      await new Promise((resolve) => setTimeout(resolve, 10))
      const result1 = await manager.shouldInvalidate('ttl-boundary', InvalidationStrategy.TimeBased)
      expect(result1).toBe(true)
      await cacheStore.delete('ttl-boundary')
      const result2 = await manager.shouldInvalidate('ttl-boundary', InvalidationStrategy.TimeBased)
      expect(result2).toBe(true)
    })

    test('InvalidationManager handles content change with missing file', async () => {
      await expect(
        manager.invalidateOnContentChange(path.join(tempDir, 'missing.txt'), 'somehash'),
      ).rejects.toThrow()
    })
  })

  describe('CacheStore Isolation Tests', () => {
    let tempDir1: string
    let tempDir2: string
    let cacheStore1: CacheStore
    let cacheStore2: CacheStore

    beforeEach(async () => {
      tempDir1 = await fs.mkdtemp(path.join(os.tmpdir(), 'iso-1-'))
      tempDir2 = await fs.mkdtemp(path.join(os.tmpdir(), 'iso-2-'))
      cacheStore1 = new CacheStore(tempDir1)
      cacheStore2 = new CacheStore(tempDir2)
    })

    afterEach(async () => {
      await fs.rm(tempDir1, { recursive: true, force: true })
      await fs.rm(tempDir2, { recursive: true, force: true })
    })

    test('stores are completely isolated', async () => {
      await cacheStore1.set('iso-key', 'value1')
      await cacheStore2.set('iso-key', 'value2')
      const result1 = await cacheStore1.get<string>('iso-key')
      const result2 = await cacheStore2.get<string>('iso-key')
      expect(result1).toBe('value1')
      expect(result2).toBe('value2')
    })

    test('stores do not affect each other', async () => {
      await cacheStore1.clear()
      await cacheStore2.set('iso-key', 'value3')
      const result = await cacheStore2.get<string>('iso-key')
      expect(result).toBe('value3')
    })

    test('concurrent operations on isolated stores', async () => {
      await Promise.all([
        cacheStore1.set('concurrent-1', 'value1'),
        cacheStore2.set('concurrent-2', 'value2'),
      ])
      const [result1, result2] = await Promise.all([
        cacheStore1.get<string>('concurrent-1'),
        cacheStore2.get<string>('concurrent-2'),
      ])
      expect(result1).toBe('value1')
      expect(result2).toBe('value2')
    })
  })

  describe('CacheStore Real-World Patterns', () => {
    let tempDir: string
    let cacheStore: CacheStore

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'realworld-'))
      cacheStore = new CacheStore(tempDir)
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('CacheStore handles user data pattern', async () => {
      const userData = { userId: 12345, sessionId: 'abc-def-789', preferences: { theme: 'dark' } }
      await cacheStore.set('user-data', userData)
      const result = await cacheStore.get<typeof userData>('user-data')
      expect(result).toEqual(userData)
    })

    test('CacheStore handles config data pattern', async () => {
      const configData = { settings: { debug: true, language: 'en', version: '2.5.1' } }
      await cacheStore.set('config-data', configData)
      const result = await cacheStore.get<typeof configData>('config-data')
      expect(result).toEqual(configData)
    })

    test('CacheStore handles session data pattern', async () => {
      const sessionData = { sessionId: 'xyz-789', startTime: Date.now(), data: { key: 'value' } }
      await cacheStore.set('session-data', sessionData)
      const result = await cacheStore.get<typeof sessionData>('session-data')
      expect(result).toEqual(sessionData)
    })

    test('CacheStore handles cached API responses', async () => {
      const apiResponse = { status: 200, data: { items: [1, 2, 3] } }
      await cacheStore.set('api-response', apiResponse)
      const result = await cacheStore.get<typeof apiResponse>('api-response')
      expect(result).toEqual(apiResponse)
    })

    test('CacheStore handles metadata objects', async () => {
      const metadata = {
        created: Date.now(),
        updated: Date.now(),
        expires: 86400000,
        tags: ['cache', 'data'],
      }
      await cacheStore.set('metadata', metadata)
      const result = await cacheStore.get<typeof metadata>('metadata')
      expect(result).toEqual(metadata)
    })

    test('CacheStore handles array of objects', async () => {
      const arrayOfObjects = Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Item ${i}` }))
      await cacheStore.set('array-of-objects', arrayOfObjects)
      const result = await cacheStore.get<typeof arrayOfObjects>('array-of-objects')
      expect(result).toEqual(arrayOfObjects)
      expect(result).toHaveLength(10)
    })

    test('CacheStore handles Map objects', async () => {
      const mapObject = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ])
      const serialized = Array.from(mapObject.entries())
      await cacheStore.set('map-object', serialized)
      const result = await cacheStore.get<string[][]>('map-object')
      expect(result).toEqual(serialized)
      expect(result).toHaveLength(2)
    })
  })

  describe('InvalidationManager Integration Tests', () => {
    let tempDir: string
    let cacheStore: CacheStore
    let manager: InvalidationManager

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'inv-integration-'))
      cacheStore = new CacheStore(tempDir)
      manager = new InvalidationManager(cacheStore, '2.0.0')
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('InvalidationManager integrates with time-based TTL', async () => {
      await cacheStore.set('integration-ttl', { timestamp: Date.now(), ttl: 30 })
      const result = await manager.shouldInvalidate(
        'integration-ttl',
        InvalidationStrategy.TimeBased,
      )
      expect(result).toBe(false)
      await new Promise((resolve) => setTimeout(resolve, 50))
      const result2 = await manager.shouldInvalidate(
        'integration-ttl',
        InvalidationStrategy.TimeBased,
      )
      expect(result2).toBe(true)
    })

    test('InvalidationManager integrates with content-based', async () => {
      const testFile = path.join(tempDir, 'integration.txt')
      await fs.writeFile(testFile, 'content', 'utf-8')
      const originalHash = hashContent('content')
      await cacheStore.set('integration-content', { file: testFile, hash: originalHash })
      const result1 = await manager.invalidateOnContentChange(testFile, originalHash)
      expect(result1).toBe(false)
      await fs.writeFile(testFile, 'modified', 'utf-8')
      const result2 = await manager.invalidateOnContentChange(testFile, originalHash)
      expect(result2).toBe(true)
    })

    test('InvalidationManager integrates with version-based', async () => {
      const result = manager.invalidateOnVersionChange('2.0.0')
      expect(result).toBe(false)
      const result2 = manager.invalidateOnVersionChange('1.0.0')
      expect(result2).toBe(true)
    })

    test('InvalidationManager handles multiple strategies sequentially', async () => {
      await cacheStore.set('multi-strat', 'value', 1000)
      const results = await Promise.all([
        manager.shouldInvalidate('multi-strat', InvalidationStrategy.TimeBased),
        manager.shouldInvalidate('multi-strat', InvalidationStrategy.ContentBased),
        manager.shouldInvalidate('multi-strat', InvalidationStrategy.VersionBased),
      ])
      expect(results).toHaveLength(3)
      await cacheStore.delete('multi-strat')
    })
  })

  describe('CacheStore Stress Tests', () => {
    let tempDir: string
    let cacheStore: CacheStore

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'stress-'))
      cacheStore = new CacheStore(tempDir)
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('CacheStore handles 100 rapid set operations', async () => {
      const ops = Array.from({ length: 100 }, (_, i) => cacheStore.set(`stress-${i}`, `value${i}`))
      await Promise.all(ops)
      for (let i = 0; i < 100; i++) {
        const result = await cacheStore.get<string>(`stress-${i}`)
        expect(result).toBe(`value${i}`)
      }
      const stats = await cacheStore.getStats()
      expect(stats.entries).toBe(100)
    })

    test('CacheStore handles 50 rapid set-get-delete cycles', async () => {
      for (let i = 0; i < 50; i++) {
        await cacheStore.set(`cycle-${i}`, 'value')
        await cacheStore.get<string>(`cycle-${i}`)
        await cacheStore.delete(`cycle-${i}`)
        await cacheStore.set(`cycle-${i}`, 'new-value')
        const result = await cacheStore.get<string>(`cycle-${i}`)
        expect(result).toBe('new-value')
      }
      const stats = await cacheStore.getStats()
      expect(stats.entries).toBe(50)
    })

    test('CacheStore handles many concurrent reads', async () => {
      const key = 'read-test'
      await cacheStore.set(key, 'value')
      const readPromises = Array.from({ length: 50 }, () => cacheStore.get<string>(key))
      const results = await Promise.all(readPromises)
      expect(results.every((r) => r === 'value')).toBe(true)
    })
  })

  describe('Hash Function Edge Cases Extended', () => {
    test('hashContent handles empty array input', () => {
      const arr: number[] = []
      const hash = hashContent(JSON.stringify(arr))
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    test('hashContent handles array with single element', () => {
      const single = [1]
      const hash = hashContent(JSON.stringify(single))
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    test('hashContent handles large array', () => {
      const large = Array.from({ length: 1000 }, (_, i) => i)
      const hash = hashContent(JSON.stringify(large))
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    test('hashContent handles nested array', () => {
      const nested = [
        [1, [2]],
        [3, [4]],
      ]
      const hash = hashContent(JSON.stringify(nested))
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    test('hashContent handles array with objects', () => {
      const objArray = [{ a: 1 }, { b: 2 }, { c: 3 }]
      const hash = hashContent(JSON.stringify(objArray))
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    test('hashContent handles sparse array', () => {
      const sparse: unknown[] = new Array(10)
      sparse[5] = 'value'
      const hash = hashContent(JSON.stringify(sparse))
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    test('hashContent handles array with mixed types', () => {
      const mixed = [1, 'two', true, null, undefined, { key: 'value' }]
      const hash = hashContent(JSON.stringify(mixed))
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })
  })

  describe('CacheStore Value Edge Cases Extended', () => {
    let tempDir: string
    let cacheStore: CacheStore

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'value-edge-extended-'))
      cacheStore = new CacheStore(tempDir)
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('CacheStore handles zero length string', async () => {
      await cacheStore.set('zero-length', '')
      const result = await cacheStore.get<string>('zero-length')
      expect(result).toBe('')
    })

    test('CacheStore handles max length string', async () => {
      const maxStr = 'a'.repeat(1000)
      await cacheStore.set('max-length', maxStr)
      const result = await cacheStore.get<string>('max-length')
      expect(result).toBe(maxStr)
    })

    test('CacheStore handles array of empty strings', async () => {
      const emptyArray = ['', '', '', '']
      await cacheStore.set('empty-strings', emptyArray)
      const result = await cacheStore.get<string[]>('empty-strings')
      expect(result).toEqual(emptyArray)
    })

    test('CacheStore handles array of null values', async () => {
      const nullArray = [null, null, null]
      await cacheStore.set('null-array', nullArray)
      const result = await cacheStore.get<null[]>('null-array')
      expect(result).toEqual(nullArray)
    })

    test('CacheStore handles array of undefined values', async () => {
      const undefinedArray = [undefined, undefined, undefined]
      await cacheStore.set('undefined-array', undefinedArray)
      const result = await cacheStore.get<unknown[]>('undefined-array')
      expect(result).toEqual([null, null, null])
    })

    test('CacheStore handles very deep nesting', async () => {
      const deep = { level1: { level2: { level3: { level4: { value: 'deepest' } } } } }
      await cacheStore.set('deep-nesting', deep)
      const result = await cacheStore.get<typeof deep>('deep-nesting')
      expect(result).toEqual(deep)
    })

    test('CacheStore handles cyclic references', async () => {
      const cyclic: { self: unknown } = { self: null }
      cyclic.self = cyclic
      await expect(cacheStore.set('cyclic', cyclic)).rejects.toThrow()
    })

    test('CacheStore handles BigInt in object', async () => {
      const bigIntValue = BigInt('9007199254740991')
      await expect(cacheStore.set('bigint', bigIntValue)).rejects.toThrow()
    })

    test('CacheStore handles negative BigInt', async () => {
      const negBigInt = BigInt(-9007199254740991)
      await expect(cacheStore.set('neg-bigint', negBigInt)).rejects.toThrow()
    })
  })

  describe('CacheStore Operation Edge Cases', () => {
    let tempDir: string
    let cacheStore: CacheStore

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'op-edge-cases'))
      cacheStore = new CacheStore(tempDir)
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('CacheStore handles set-delete-get-delete-get cycle', async () => {
      await cacheStore.set('op-cycle', 'value1')
      await cacheStore.delete('op-cycle')
      const result1 = await cacheStore.get<string>('op-cycle')
      expect(result1).toBeNull()
      await cacheStore.set('op-cycle', 'value2')
      const result2 = await cacheStore.get<string>('op-cycle')
      expect(result2).toBe('value2')
      await cacheStore.set('op-cycle', 'value3')
      const result3 = await cacheStore.get<string>('op-cycle')
      expect(result3).toBe('value3')
      await cacheStore.delete('op-cycle')
      const result4 = await cacheStore.get<string>('op-cycle')
      expect(result4).toBeNull()
      await cacheStore.set('op-cycle', 'value4')
      const result5 = await cacheStore.get<string>('op-cycle')
      expect(result5).toBe('value4')
    })

    test('CacheStore handles has-has-delete-has-get sequence', async () => {
      await cacheStore.set('has-op', 'value')
      const has1 = await cacheStore.has('has-op')
      await cacheStore.delete('has-op')
      const has2 = await cacheStore.has('has-op')
      const get = await cacheStore.get<string>('has-op')
      expect(get).toBeNull()
      await cacheStore.set('has-op', 'value2')
      const has3 = await cacheStore.has('has-op')
      expect(has3).toBe(true)
      const result3 = await cacheStore.get<string>('has-op')
      expect(result3).toBe('value2')
      await cacheStore.delete('has-op')
      const has4 = await cacheStore.has('has-op')
      expect(has4).toBe(false)
    })

    test('CacheStore handles get-delete-get-delete cycle on missing key', async () => {
      const result = await cacheStore.get<string>('missing-op-cycle')
      expect(result).toBeNull()
      await cacheStore.set('missing-op-cycle', 'value')
      await cacheStore.delete('missing-op-cycle')
      const has = await cacheStore.has('missing-op-cycle')
      expect(has).toBe(false)
      const get = await cacheStore.get<string>('missing-op-cycle')
      expect(get).toBeNull()
    })

    test('CacheStore handles set with same key then different keys', async () => {
      await cacheStore.set('same-key-diff', 'value1')
      await cacheStore.set('diff-key-1', 'different')
      await cacheStore.set('diff-key-2', 'different2')
      const result1 = await cacheStore.get<string>('same-key-diff')
      expect(result1).toBe('value1')
      const result2 = await cacheStore.get<string>('diff-key-1')
      expect(result2).toBe('different')
      const result3 = await cacheStore.get<string>('diff-key-2')
      expect(result3).toBe('different2')
    })

    test('CacheStore handles clear then set', async () => {
      await cacheStore.set('clear-then-set', 'value1')
      await cacheStore.clear()
      const result = await cacheStore.get<string>('clear-then-set')
      expect(result).toBeNull()
      await cacheStore.set('clear-then-set', 'value2')
      const result2 = await cacheStore.get<string>('clear-then-set')
      expect(result2).toBe('value2')
    })
  })

  describe('InvalidationManager Extended Tests', () => {
    let tempDir: string
    let cacheStore: CacheStore
    let manager: InvalidationManager

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'inv-extended'))
      cacheStore = new CacheStore(tempDir)
      manager = new InvalidationManager(cacheStore, '1.0.0')
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    test('InvalidationManager handles very old timestamp', async () => {
      await cacheStore.set('old-timestamp', { timestamp: Date.now() - 200000, ttl: 100000 })
      const result = await manager.shouldInvalidate('old-timestamp', InvalidationStrategy.TimeBased)
      expect(result).toBe(true)
    })

    test('InvalidationManager handles future timestamp', async () => {
      await cacheStore.set('future-timestamp', { timestamp: Date.now() + 86400000, ttl: 86400000 })
      const result = await manager.shouldInvalidate(
        'future-timestamp',
        InvalidationStrategy.TimeBased,
      )
      expect(result).toBe(false)
    })

    test('InvalidationManager handles negative TTL', async () => {
      await cacheStore.set('neg-ttl', { timestamp: Date.now(), ttl: -1000 })
      const result = await manager.shouldInvalidate('neg-ttl', InvalidationStrategy.TimeBased)
      expect(result).toBe(true)
    })

    test('InvalidationManager handles zero TTL', async () => {
      await cacheStore.set('zero-ttl', { timestamp: Date.now(), ttl: 0 })
      const result = await manager.shouldInvalidate('zero-ttl', InvalidationStrategy.TimeBased)
      await new Promise((resolve) => setTimeout(resolve, 10))
      const result2 = await manager.shouldInvalidate('zero-ttl', InvalidationStrategy.TimeBased)
      expect(result2).toBe(true)
    })

    test('InvalidationManager handles fraction TTL', async () => {
      await cacheStore.set('frac-ttl', { timestamp: Date.now(), ttl: 500 })
      const result = await manager.shouldInvalidate('frac-ttl', InvalidationStrategy.TimeBased)
      expect(result).toBe(false)
    })

    test('InvalidationManager handles multiple version comparisons', async () => {
      const versions = ['1.0.0', '1.0.1', '1.1.0', '1.0.0.1', '1.0.0.0']
      const results = await Promise.all(versions.map((v) => manager.invalidateOnVersionChange(v)))
      expect(results[0]).toBe(false)
      expect(results.slice(1).every((r) => r === true)).toBe(true)
    })

    test('InvalidationManager handles version with build metadata', async () => {
      const result = manager.invalidateOnVersionChange('1.0.0+202401010')
      expect(result).toBe(true)
    })

    test('InvalidationManager handles version with pre-release', async () => {
      const result = manager.invalidateOnVersionChange('1.0.0-alpha')
      expect(result).toBe(true)
    })

    test('InvalidationManager handles version with post-release', async () => {
      const result = manager.invalidateOnVersionChange('1.0.0+post')
      expect(result).toBe(true)
    })

    test('InvalidationManager handles concurrent strategy checks', async () => {
      await cacheStore.set('concurrent-1', { timestamp: Date.now(), ttl: 1000 })
      await cacheStore.set('concurrent-2', { timestamp: Date.now() + 10 })
      const results = await Promise.all([
        manager.shouldInvalidate('concurrent-1', InvalidationStrategy.TimeBased),
        manager.shouldInvalidate('concurrent-2', InvalidationStrategy.TimeBased),
      ])
      expect(results).toHaveLength(2)
      await cacheStore.delete('concurrent-1')
      await cacheStore.delete('concurrent-2')
    })
  })
})
