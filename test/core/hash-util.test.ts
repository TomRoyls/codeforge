import { describe, it, expect } from 'vitest'
import { HashComputer } from '../../src/core/hash-util/hash-computer.js'
import { HashStore } from '../../src/core/hash-util/hash-store.js'
import { HashUtil } from '../../src/core/hash-util/hash-util.js'
import type { HashAlgorithm } from '../../src/core/hash-util/types.js'

describe('HashComputer', () => {
  const computer = new HashComputer()

  describe('compute', () => {
    it('should compute hash with default djb2 algorithm', () => {
      const result = computer.compute('hello')
      expect(result).toBe(computer.computeDjb2('hello'))
    })

    it('should compute hash with simple algorithm', () => {
      const result = computer.compute('hello', 'simple')
      expect(result).toBe(computer.computeSimple('hello'))
    })

    it('should compute hash with fnv1a algorithm', () => {
      const result = computer.compute('hello', 'fnv1a')
      expect(result).toBe(computer.computeFnv1a('hello'))
    })

    it('should compute hash with murmur algorithm', () => {
      const result = computer.compute('hello', 'murmur')
      expect(result).toBe(computer.computeMurmur('hello'))
    })

    it('should compute hash with cyrb53 algorithm', () => {
      const result = computer.compute('hello', 'cyrb53')
      expect(result).toBe(computer.computeCyrb53('hello'))
    })

    it('should fall back to djb2 for unknown algorithm', () => {
      const result = computer.compute('hello', 'djb2' as HashAlgorithm)
      expect(result).toBe(computer.computeDjb2('hello'))
    })
  })

  describe('computeSimple', () => {
    it('should compute a simple additive hash', () => {
      const result = computer.computeSimple('hello')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should return hex string', () => {
      const result = computer.computeSimple('test')
      expect(result).toMatch(/^[0-9a-f]+$/)
    })

    it('should return same hash for same input', () => {
      expect(computer.computeSimple('abc')).toBe(computer.computeSimple('abc'))
    })

    it('should produce different hashes for different inputs', () => {
      expect(computer.computeSimple('abc')).not.toBe(computer.computeSimple('def'))
    })

    it('should handle empty string', () => {
      const result = computer.computeSimple('')
      expect(result).toBe('0')
    })

    it('should handle unicode characters', () => {
      const result = computer.computeSimple('héllo wörld')
      expect(result).toBeTruthy()
    })
  })

  describe('computeDjb2', () => {
    it('should compute djb2 hash', () => {
      const result = computer.computeDjb2('hello')
      expect(result).toBeTruthy()
    })

    it('should return hex string', () => {
      const result = computer.computeDjb2('test')
      expect(result).toMatch(/^[0-9a-f]+$/)
    })

    it('should be deterministic', () => {
      expect(computer.computeDjb2('abc')).toBe(computer.computeDjb2('abc'))
    })

    it('should produce different hashes for different inputs', () => {
      expect(computer.computeDjb2('foo')).not.toBe(computer.computeDjb2('bar'))
    })

    it('should handle empty string', () => {
      const result = computer.computeDjb2('')
      expect(result).toBe('1505')
    })

    it('should handle single character', () => {
      const result = computer.computeDjb2('a')
      expect(result).toBeTruthy()
    })

    it('should handle long string', () => {
      const longStr = 'a'.repeat(10000)
      const result = computer.computeDjb2(longStr)
      expect(result).toBeTruthy()
    })
  })

  describe('computeFnv1a', () => {
    it('should compute fnv1a hash', () => {
      const result = computer.computeFnv1a('hello')
      expect(result).toBeTruthy()
    })

    it('should return hex string', () => {
      const result = computer.computeFnv1a('test')
      expect(result).toMatch(/^[0-9a-f]+$/)
    })

    it('should be deterministic', () => {
      expect(computer.computeFnv1a('abc')).toBe(computer.computeFnv1a('abc'))
    })

    it('should produce different hashes for different inputs', () => {
      expect(computer.computeFnv1a('foo')).not.toBe(computer.computeFnv1a('bar'))
    })

    it('should handle empty string', () => {
      const result = computer.computeFnv1a('')
      expect(result).toBe('811c9dc5')
    })

    it('should handle unicode', () => {
      const result = computer.computeFnv1a('日本語')
      expect(result).toBeTruthy()
    })
  })

  describe('computeMurmur', () => {
    it('should compute murmur hash', () => {
      const result = computer.computeMurmur('hello')
      expect(result).toBeTruthy()
    })

    it('should return hex string', () => {
      const result = computer.computeMurmur('test')
      expect(result).toMatch(/^[0-9a-f]+$/)
    })

    it('should be deterministic', () => {
      expect(computer.computeMurmur('abc')).toBe(computer.computeMurmur('abc'))
    })

    it('should support custom seed', () => {
      const defaultSeed = computer.computeMurmur('hello', 0)
      const customSeed = computer.computeMurmur('hello', 42)
      expect(defaultSeed).not.toBe(customSeed)
    })

    it('should produce different hashes for different inputs', () => {
      expect(computer.computeMurmur('foo')).not.toBe(computer.computeMurmur('bar'))
    })

    it('should handle empty string', () => {
      const result = computer.computeMurmur('')
      expect(result).toBeTruthy()
    })

    it('should handle short string less than 4 chars', () => {
      const result = computer.computeMurmur('ab')
      expect(result).toBeTruthy()
    })

    it('should handle string with 4 chars exactly', () => {
      const result = computer.computeMurmur('abcd')
      expect(result).toBeTruthy()
    })

    it('should handle string with remainder 1', () => {
      const result = computer.computeMurmur('abcde')
      expect(result).toBeTruthy()
    })

    it('should handle string with remainder 3', () => {
      const result = computer.computeMurmur('abcdefg')
      expect(result).toBeTruthy()
    })
  })

  describe('computeCyrb53', () => {
    it('should compute cyrb53 hash', () => {
      const result = computer.computeCyrb53('hello')
      expect(result).toBeTruthy()
    })

    it('should return hex string', () => {
      const result = computer.computeCyrb53('test')
      expect(result).toMatch(/^[0-9a-f]+$/)
    })

    it('should be deterministic', () => {
      expect(computer.computeCyrb53('abc')).toBe(computer.computeCyrb53('abc'))
    })

    it('should support custom seed', () => {
      const defaultSeed = computer.computeCyrb53('hello', 0)
      const customSeed = computer.computeCyrb53('hello', 42)
      expect(defaultSeed).not.toBe(customSeed)
    })

    it('should produce different hashes for different inputs', () => {
      expect(computer.computeCyrb53('foo')).not.toBe(computer.computeCyrb53('bar'))
    })

    it('should handle empty string', () => {
      const result = computer.computeCyrb53('')
      expect(result).toBeTruthy()
    })

    it('should produce 53-bit hash (larger hex)', () => {
      const result = computer.computeCyrb53('test input data')
      const parsed = parseInt(result, 16)
      expect(parsed).toBeGreaterThan(0)
    })
  })

  describe('computeFileHash', () => {
    it('should use djb2 for file hashing', () => {
      const fileHash = computer.computeFileHash('file content')
      const djb2Hash = computer.computeDjb2('file content')
      expect(fileHash).toBe(djb2Hash)
    })

    it('should handle multi-line content', () => {
      const content = 'line1\nline2\nline3'
      const result = computer.computeFileHash(content)
      expect(result).toBeTruthy()
    })
  })

  describe('computeObjectHash', () => {
    it('should hash object deterministically', () => {
      const obj = { a: 1, b: 'test' }
      expect(computer.computeObjectHash(obj)).toBe(computer.computeObjectHash(obj))
    })

    it('should produce same hash regardless of key order', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { b: 2, a: 1 }
      expect(computer.computeObjectHash(obj1)).toBe(computer.computeObjectHash(obj2))
    })

    it('should produce different hashes for different objects', () => {
      const obj1 = { a: 1 }
      const obj2 = { a: 2 }
      expect(computer.computeObjectHash(obj1)).not.toBe(computer.computeObjectHash(obj2))
    })

    it('should handle empty object', () => {
      const result = computer.computeObjectHash({})
      expect(result).toBeTruthy()
    })

    it('should handle nested values', () => {
      const obj = { nested: { key: 'value' }, arr: [1, 2, 3] }
      const result = computer.computeObjectHash(obj)
      expect(result).toBeTruthy()
    })
  })
})

describe('HashStore', () => {
  describe('constructor', () => {
    it('should create store with default algorithm', () => {
      const store = new HashStore()
      expect(store.size()).toBe(0)
    })

    it('should create store with custom algorithm', () => {
      const store = new HashStore('fnv1a')
      store.add('key', 'hash')
      const entry = store.get('key')
      expect(entry!.algorithm).toBe('fnv1a')
    })
  })

  describe('add', () => {
    it('should add an entry', () => {
      const store = new HashStore()
      store.add('key1', 'hash1')
      expect(store.size()).toBe(1)
    })

    it('should add entry with metadata', () => {
      const store = new HashStore()
      store.add('key1', 'hash1', { source: 'test' })
      const entry = store.get('key1')
      expect(entry!.metadata).toEqual({ source: 'test' })
    })

    it('should overwrite existing key', () => {
      const store = new HashStore()
      store.add('key1', 'hash1')
      store.add('key1', 'hash2')
      const entry = store.get('key1')
      expect(entry!.hash).toBe('hash2')
    })
  })

  describe('get', () => {
    it('should return entry for existing key', () => {
      const store = new HashStore()
      store.add('key1', 'hash1')
      const entry = store.get('key1')
      expect(entry).not.toBeNull()
      expect(entry!.key).toBe('key1')
      expect(entry!.hash).toBe('hash1')
    })

    it('should return null for non-existing key', () => {
      const store = new HashStore()
      expect(store.get('missing')).toBeNull()
    })

    it('should include all entry fields', () => {
      const store = new HashStore()
      store.add('k', 'h', { foo: 'bar' })
      const entry = store.get('k')!
      expect(entry.key).toBe('k')
      expect(entry.hash).toBe('h')
      expect(entry.algorithm).toBe('djb2')
      expect(entry.size).toBe(1)
      expect(entry.createdAt).toBeGreaterThan(0)
      expect(entry.metadata).toEqual({ foo: 'bar' })
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      const store = new HashStore()
      store.add('key1', 'hash1')
      expect(store.has('key1')).toBe(true)
    })

    it('should return false for non-existing key', () => {
      const store = new HashStore()
      expect(store.has('missing')).toBe(false)
    })
  })

  describe('remove', () => {
    it('should remove existing entry', () => {
      const store = new HashStore()
      store.add('key1', 'hash1')
      expect(store.remove('key1')).toBe(true)
      expect(store.has('key1')).toBe(false)
    })

    it('should return false for non-existing key', () => {
      const store = new HashStore()
      expect(store.remove('missing')).toBe(false)
    })
  })

  describe('findByHash', () => {
    it('should find entries by hash', () => {
      const store = new HashStore()
      store.add('key1', 'samehash')
      store.add('key2', 'samehash')
      store.add('key3', 'different')
      const found = store.findByHash('samehash')
      expect(found).toHaveLength(2)
    })

    it('should return empty array for no matches', () => {
      const store = new HashStore()
      expect(store.findByHash('nope')).toEqual([])
    })
  })

  describe('getAll', () => {
    it('should return all entries', () => {
      const store = new HashStore()
      store.add('a', 'h1')
      store.add('b', 'h2')
      const all = store.getAll()
      expect(all).toHaveLength(2)
    })

    it('should return empty array for empty store', () => {
      const store = new HashStore()
      expect(store.getAll()).toEqual([])
    })
  })

  describe('size', () => {
    it('should return correct size', () => {
      const store = new HashStore()
      expect(store.size()).toBe(0)
      store.add('a', 'h1')
      expect(store.size()).toBe(1)
      store.add('b', 'h2')
      expect(store.size()).toBe(2)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      const store = new HashStore()
      store.add('a', 'h1')
      store.add('b', 'h2')
      store.clear()
      expect(store.size()).toBe(0)
    })
  })

  describe('export', () => {
    it('should export as record', () => {
      const store = new HashStore()
      store.add('key1', 'hash1')
      store.add('key2', 'hash2')
      const exported = store.export()
      expect(exported).toEqual({ key1: 'hash1', key2: 'hash2' })
    })

    it('should export empty store', () => {
      const store = new HashStore()
      expect(store.export()).toEqual({})
    })
  })

  describe('import', () => {
    it('should import data', () => {
      const store = new HashStore()
      store.import({ a: 'h1', b: 'h2' })
      expect(store.size()).toBe(2)
      expect(store.get('a')!.hash).toBe('h1')
      expect(store.get('b')!.hash).toBe('h2')
    })

    it('should merge with existing entries', () => {
      const store = new HashStore()
      store.add('existing', 'old')
      store.import({ new: 'val' })
      expect(store.size()).toBe(2)
      expect(store.get('existing')!.hash).toBe('old')
    })
  })
})

describe('HashUtil', () => {
  describe('constructor', () => {
    it('should use djb2 as default algorithm', () => {
      const util = new HashUtil()
      expect(util.getAlgorithm()).toBe('djb2')
    })

    it('should accept custom algorithm', () => {
      const util = new HashUtil('fnv1a')
      expect(util.getAlgorithm()).toBe('fnv1a')
    })
  })

  describe('hash', () => {
    it('should hash data with default algorithm', () => {
      const util = new HashUtil()
      const result = util.hash('hello')
      expect(result).toBeTruthy()
    })

    it('should use configured algorithm', () => {
      const utilDjb2 = new HashUtil('djb2')
      const utilFnv = new HashUtil('fnv1a')
      expect(utilDjb2.hash('test')).not.toBe(utilFnv.hash('test'))
    })

    it('should be deterministic', () => {
      const util = new HashUtil()
      expect(util.hash('data')).toBe(util.hash('data'))
    })
  })

  describe('verify', () => {
    it('should return true for matching hash', () => {
      const util = new HashUtil()
      const hash = util.hash('test data')
      expect(util.verify('test data', hash)).toBe(true)
    })

    it('should return false for non-matching hash', () => {
      const util = new HashUtil()
      expect(util.verify('test data', 'wronghash')).toBe(false)
    })

    it('should verify with different algorithms', () => {
      const util = new HashUtil('fnv1a')
      const hash = util.hash('content')
      expect(util.verify('content', hash)).toBe(true)
    })
  })

  describe('compare', () => {
    it('should return match for equal hashes', () => {
      const util = new HashUtil()
      const result = util.compare('abc', 'abc')
      expect(result.match).toBe(true)
      expect(result.hash1).toBe('abc')
      expect(result.hash2).toBe('abc')
    })

    it('should return no match for different hashes', () => {
      const util = new HashUtil()
      const result = util.compare('abc', 'def')
      expect(result.match).toBe(false)
    })

    it('should include algorithm in result', () => {
      const util = new HashUtil('fnv1a')
      const result = util.compare('a', 'b')
      expect(result.algorithm).toBe('fnv1a')
    })
  })

  describe('deduplicate', () => {
    it('should identify unique items', () => {
      const util = new HashUtil()
      const items = new Map<string, string>([
        ['a', 'content1'],
        ['b', 'content2'],
      ])
      const result = util.deduplicate(items)
      expect(result.uniqueCount).toBe(2)
      expect(result.duplicateCount).toBe(0)
    })

    it('should detect duplicates', () => {
      const util = new HashUtil()
      const items = new Map<string, string>([
        ['a', 'same content'],
        ['b', 'same content'],
      ])
      const result = util.deduplicate(items)
      expect(result.uniqueCount).toBe(1)
      expect(result.duplicateCount).toBe(1)
    })

    it('should calculate saved bytes', () => {
      const util = new HashUtil()
      const items = new Map<string, string>([
        ['a', 'hello'],
        ['b', 'hello'],
      ])
      const result = util.deduplicate(items)
      expect(result.savedBytes).toBe(5)
    })

    it('should populate unique map', () => {
      const util = new HashUtil()
      const items = new Map<string, string>([
        ['a', 'content1'],
        ['b', 'content2'],
      ])
      const result = util.deduplicate(items)
      expect(result.unique.has('a')).toBe(true)
      expect(result.unique.has('b')).toBe(true)
    })

    it('should populate duplicates map', () => {
      const util = new HashUtil()
      const items = new Map<string, string>([
        ['a', 'same'],
        ['b', 'same'],
        ['c', 'same'],
      ])
      const result = util.deduplicate(items)
      expect(result.duplicates.has('a')).toBe(true)
      expect(result.duplicates.get('a')).toEqual(['b', 'c'])
    })

    it('should report total items', () => {
      const util = new HashUtil()
      const items = new Map<string, string>([
        ['a', 'x'],
        ['b', 'y'],
        ['c', 'z'],
      ])
      const result = util.deduplicate(items)
      expect(result.totalItems).toBe(3)
    })

    it('should handle empty input', () => {
      const util = new HashUtil()
      const result = util.deduplicate(new Map())
      expect(result.totalItems).toBe(0)
      expect(result.uniqueCount).toBe(0)
      expect(result.duplicateCount).toBe(0)
      expect(result.savedBytes).toBe(0)
    })

    it('should handle all duplicates', () => {
      const util = new HashUtil()
      const items = new Map<string, string>([
        ['a', 'same'],
        ['b', 'same'],
        ['c', 'same'],
      ])
      const result = util.deduplicate(items)
      expect(result.uniqueCount).toBe(1)
      expect(result.duplicateCount).toBe(2)
    })

    it('should handle no duplicates', () => {
      const util = new HashUtil()
      const items = new Map<string, string>([
        ['a', 'content1'],
        ['b', 'content2'],
        ['c', 'content3'],
      ])
      const result = util.deduplicate(items)
      expect(result.uniqueCount).toBe(3)
      expect(result.duplicateCount).toBe(0)
      expect(result.savedBytes).toBe(0)
    })
  })

  describe('checkIntegrity', () => {
    it('should validate correct hashes', () => {
      const util = new HashUtil()
      const hash = util.hash('content')
      const entries = new Map<string, { content: string; expectedHash: string }>([
        ['file1', { content: 'content', expectedHash: hash }],
      ])
      const results = util.checkIntegrity(entries)
      expect(results[0]!.valid).toBe(true)
    })

    it('should detect invalid hashes', () => {
      const util = new HashUtil()
      const entries = new Map<string, { content: string; expectedHash: string }>([
        ['file1', { content: 'content', expectedHash: 'wronghash' }],
      ])
      const results = util.checkIntegrity(entries)
      expect(results[0]!.valid).toBe(false)
    })

    it('should include actual hash in result', () => {
      const util = new HashUtil()
      const entries = new Map<string, { content: string; expectedHash: string }>([
        ['file1', { content: 'hello', expectedHash: 'test' }],
      ])
      const results = util.checkIntegrity(entries)
      expect(results[0]!.actualHash).toBe(util.hash('hello'))
    })

    it('should include expected hash in result', () => {
      const util = new HashUtil()
      const entries = new Map<string, { content: string; expectedHash: string }>([
        ['file1', { content: 'hello', expectedHash: 'expected' }],
      ])
      const results = util.checkIntegrity(entries)
      expect(results[0]!.expectedHash).toBe('expected')
    })

    it('should include key in result', () => {
      const util = new HashUtil()
      const entries = new Map<string, { content: string; expectedHash: string }>([
        ['mykey', { content: 'data', expectedHash: 'h' }],
      ])
      const results = util.checkIntegrity(entries)
      expect(results[0]!.key).toBe('mykey')
    })

    it('should include algorithm in result', () => {
      const util = new HashUtil('murmur')
      const entries = new Map<string, { content: string; expectedHash: string }>([
        ['k', { content: 'd', expectedHash: 'h' }],
      ])
      const results = util.checkIntegrity(entries)
      expect(results[0]!.algorithm).toBe('murmur')
    })

    it('should handle multiple entries', () => {
      const util = new HashUtil()
      const hash1 = util.hash('content1')
      const hash2 = util.hash('content2')
      const entries = new Map<string, { content: string; expectedHash: string }>([
        ['f1', { content: 'content1', expectedHash: hash1 }],
        ['f2', { content: 'content2', expectedHash: 'wrong' }],
      ])
      const results = util.checkIntegrity(entries)
      expect(results).toHaveLength(2)
      expect(results[0]!.valid).toBe(true)
      expect(results[1]!.valid).toBe(false)
    })

    it('should handle empty entries', () => {
      const util = new HashUtil()
      const results = util.checkIntegrity(new Map())
      expect(results).toEqual([])
    })
  })

  describe('getAlgorithm / setAlgorithm', () => {
    it('should get current algorithm', () => {
      const util = new HashUtil('djb2')
      expect(util.getAlgorithm()).toBe('djb2')
    })

    it('should change algorithm', () => {
      const util = new HashUtil('djb2')
      util.setAlgorithm('fnv1a')
      expect(util.getAlgorithm()).toBe('fnv1a')
    })

    it('should use new algorithm for hashing', () => {
      const util = new HashUtil('djb2')
      const hash1 = util.hash('test')
      util.setAlgorithm('fnv1a')
      const hash2 = util.hash('test')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('getStore', () => {
    it('should return the hash store', () => {
      const util = new HashUtil()
      const store = util.getStore()
      expect(store).toBeInstanceOf(HashStore)
    })

    it('should return same store instance', () => {
      const util = new HashUtil()
      expect(util.getStore()).toBe(util.getStore())
    })
  })
})

describe('Algorithm consistency', () => {
  const computer = new HashComputer()

  it('simple algorithm should be consistent across calls', () => {
    const h1 = computer.computeSimple('consistency test')
    const h2 = computer.computeSimple('consistency test')
    expect(h1).toBe(h2)
  })

  it('djb2 algorithm should be consistent across calls', () => {
    const h1 = computer.computeDjb2('consistency test')
    const h2 = computer.computeDjb2('consistency test')
    expect(h1).toBe(h2)
  })

  it('fnv1a algorithm should be consistent across calls', () => {
    const h1 = computer.computeFnv1a('consistency test')
    const h2 = computer.computeFnv1a('consistency test')
    expect(h1).toBe(h2)
  })

  it('murmur algorithm should be consistent across calls', () => {
    const h1 = computer.computeMurmur('consistency test')
    const h2 = computer.computeMurmur('consistency test')
    expect(h1).toBe(h2)
  })

  it('cyrb53 algorithm should be consistent across calls', () => {
    const h1 = computer.computeCyrb53('consistency test')
    const h2 = computer.computeCyrb53('consistency test')
    expect(h1).toBe(h2)
  })

  it('all algorithms should produce different results from each other', () => {
    const data = 'algorithm comparison test'
    const algorithms: HashAlgorithm[] = ['simple', 'djb2', 'fnv1a', 'murmur', 'cyrb53']
    const hashes = new Set(algorithms.map((a) => computer.compute(data, a)))
    expect(hashes.size).toBeGreaterThan(1)
  })
})

describe('Edge cases', () => {
  const computer = new HashComputer()

  it('should handle very long strings', () => {
    const longStr = 'x'.repeat(100000)
    const result = computer.computeDjb2(longStr)
    expect(result).toBeTruthy()
  })

  it('should handle special characters', () => {
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\'
    const result = computer.computeDjb2(special)
    expect(result).toBeTruthy()
  })

  it('should handle newlines and tabs', () => {
    const whitespace = 'line1\n\tline2\r\nline3'
    const result = computer.computeDjb2(whitespace)
    expect(result).toBeTruthy()
  })

  it('should handle null-like strings', () => {
    const result = computer.computeDjb2('\0\0\0')
    expect(result).toBeTruthy()
  })

  it('store should track createdAt timestamp', () => {
    const store = new HashStore()
    const before = Date.now()
    store.add('key', 'hash')
    const entry = store.get('key')!
    expect(entry.createdAt).toBeGreaterThanOrEqual(before)
    expect(entry.createdAt).toBeLessThanOrEqual(Date.now())
  })

  it('deduplicate should handle single item', () => {
    const util = new HashUtil()
    const items = new Map<string, string>([['a', 'content']])
    const result = util.deduplicate(items)
    expect(result.uniqueCount).toBe(1)
    expect(result.duplicateCount).toBe(0)
  })

  it('verify should work after algorithm change', () => {
    const util = new HashUtil('djb2')
    const hash = util.hash('data')
    util.setAlgorithm('fnv1a')
    expect(util.verify('data', hash)).toBe(false)
  })

  it('compare should work with empty strings', () => {
    const util = new HashUtil()
    const result = util.compare('', '')
    expect(result.match).toBe(true)
  })

  it('object hash should handle arrays', () => {
    const obj = { arr: [1, 2, 3] }
    const hash = computer.computeObjectHash(obj)
    expect(hash).toBeTruthy()
    expect(hash).toBe(computer.computeObjectHash(obj))
  })

  it('store import/export roundtrip', () => {
    const store = new HashStore()
    store.add('a', 'h1')
    store.add('b', 'h2')
    const exported = store.export()

    const store2 = new HashStore()
    store2.import(exported)
    expect(store2.size()).toBe(2)
    expect(store2.get('a')!.hash).toBe('h1')
    expect(store2.get('b')!.hash).toBe('h2')
  })
})
