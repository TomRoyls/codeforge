import { describe, it, expect, beforeEach } from 'vitest'
import { CodeHashMap } from '../../src/core/code-hashmap/code-hashmap.js'
import { DEFAULT_HASHMAP_OPTIONS } from '../../src/core/code-hashmap/types.js'
import type { HashMapEntry, HashMapOptions, HashMapStats } from '../../src/core/code-hashmap/types.js'

describe('CodeHashMap', () => {
  let map: CodeHashMap<string>

  beforeEach(() => {
    map = new CodeHashMap<string>()
  })

  describe('constructor', () => {
    it('should create a map with default options', () => {
      const m = new CodeHashMap()
      expect(m.getSize()).toBe(0)
      expect(m.getCapacity()).toBe(DEFAULT_HASHMAP_OPTIONS.capacity)
    })

    it('should accept custom capacity', () => {
      const m = new CodeHashMap({ capacity: 32 })
      expect(m.getCapacity()).toBe(32)
    })

    it('should accept custom load factor', () => {
      const m = new CodeHashMap({ loadFactor: 0.5 })
      const stats = m.getStats()
      expect(stats.capacity).toBe(DEFAULT_HASHMAP_OPTIONS.capacity)
    })

    it('should accept custom hash function', () => {
      const customHash = (_key: string): number => 42
      const m = new CodeHashMap({ hashFunction: customHash })
      m.set('a', 'val')
      m.set('b', 'val2')
      expect(m.getSize()).toBe(2)
    })

    it('should accept all options combined', () => {
      const m = new CodeHashMap({ capacity: 8, loadFactor: 0.9, hashFunction: (k: string) => k.length })
      expect(m.getCapacity()).toBe(8)
    })
  })

  describe('set', () => {
    it('should store a value by key', () => {
      map.set('key1', 'value1')
      expect(map.get('key1')).toBe('value1')
    })

    it('should overwrite an existing key', () => {
      map.set('key1', 'value1')
      map.set('key1', 'value2')
      expect(map.get('key1')).toBe('value2')
    })

    it('should not increase size when overwriting', () => {
      map.set('key1', 'value1')
      map.set('key1', 'value2')
      expect(map.getSize()).toBe(1)
    })

    it('should store multiple keys', () => {
      map.set('a', '1')
      map.set('b', '2')
      map.set('c', '3')
      expect(map.getSize()).toBe(3)
    })

    it('should store null values', () => {
      const nullMap = new CodeHashMap<string | null>()
      nullMap.set('key', null)
      expect(nullMap.get('key')).toBeNull()
    })

    it('should store undefined values', () => {
      const undefMap = new CodeHashMap<string | undefined>()
      undefMap.set('key', undefined)
      expect(undefMap.get('key')).toBeUndefined()
    })

    it('should store object values', () => {
      const objMap = new CodeHashMap<{ id: number }>()
      objMap.set('obj', { id: 1 })
      expect(objMap.get('obj')).toEqual({ id: 1 })
    })

    it('should store array values', () => {
      const arrMap = new CodeHashMap<number[]>()
      arrMap.set('arr', [1, 2, 3])
      expect(arrMap.get('arr')).toEqual([1, 2, 3])
    })

    it('should store numeric string keys', () => {
      map.set('123', 'numeric')
      expect(map.get('123')).toBe('numeric')
    })

    it('should store empty string key', () => {
      map.set('', 'empty')
      expect(map.get('')).toBe('empty')
    })
  })

  describe('get', () => {
    it('should return undefined for missing key', () => {
      expect(map.get('nonexistent')).toBeUndefined()
    })

    it('should return the stored value', () => {
      map.set('key1', 'value1')
      expect(map.get('key1')).toBe('value1')
    })

    it('should return updated value after overwrite', () => {
      map.set('key1', 'old')
      map.set('key1', 'new')
      expect(map.get('key1')).toBe('new')
    })

    it('should return undefined after delete', () => {
      map.set('key1', 'value1')
      map.delete('key1')
      expect(map.get('key1')).toBeUndefined()
    })

    it('should return undefined after clear', () => {
      map.set('key1', 'value1')
      map.clear()
      expect(map.get('key1')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return false for missing key', () => {
      expect(map.has('missing')).toBe(false)
    })

    it('should return true for existing key', () => {
      map.set('key1', 'value1')
      expect(map.has('key1')).toBe(true)
    })

    it('should return false after delete', () => {
      map.set('key1', 'value1')
      map.delete('key1')
      expect(map.has('key1')).toBe(false)
    })

    it('should return false after clear', () => {
      map.set('key1', 'value1')
      map.clear()
      expect(map.has('key1')).toBe(false)
    })

    it('should return true for key with null value', () => {
      const nullMap = new CodeHashMap<string | null>()
      nullMap.set('key', null)
      expect(nullMap.has('key')).toBe(true)
    })

    it('should return true for key with undefined value', () => {
      const undefMap = new CodeHashMap<string | undefined>()
      undefMap.set('key', undefined)
      expect(undefMap.has('key')).toBe(true)
    })
  })

  describe('delete', () => {
    it('should return true when deleting existing key', () => {
      map.set('key1', 'value1')
      expect(map.delete('key1')).toBe(true)
    })

    it('should return false when deleting missing key', () => {
      expect(map.delete('nonexistent')).toBe(false)
    })

    it('should decrease size after deletion', () => {
      map.set('key1', 'value1')
      map.set('key2', 'value2')
      map.delete('key1')
      expect(map.getSize()).toBe(1)
    })

    it('should not affect other entries', () => {
      map.set('key1', 'value1')
      map.set('key2', 'value2')
      map.delete('key1')
      expect(map.get('key2')).toBe('value2')
    })

    it('should allow re-adding deleted key', () => {
      map.set('key1', 'value1')
      map.delete('key1')
      map.set('key1', 'value2')
      expect(map.get('key1')).toBe('value2')
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      map.set('a', '1')
      map.set('b', '2')
      map.set('c', '3')
      map.clear()
      expect(map.getSize()).toBe(0)
    })

    it('should reset size to zero', () => {
      map.set('key1', 'value1')
      map.clear()
      expect(map.getSize()).toBe(0)
    })

    it('should reset collisions', () => {
      const collisionMap = new CodeHashMap<string>({ hashFunction: (_k: string) => 1 })
      collisionMap.set('a', '1')
      collisionMap.set('b', '2')
      expect(collisionMap.getCollisions()).toBeGreaterThan(0)
      collisionMap.clear()
      expect(collisionMap.getCollisions()).toBe(0)
    })

    it('should preserve capacity', () => {
      map.set('key1', 'value1')
      map.clear()
      expect(map.getCapacity()).toBe(DEFAULT_HASHMAP_OPTIONS.capacity)
    })

    it('should allow set after clear', () => {
      map.set('key1', 'value1')
      map.clear()
      map.set('key2', 'value2')
      expect(map.get('key2')).toBe('value2')
      expect(map.getSize()).toBe(1)
    })
  })

  describe('entries', () => {
    it('should return empty array for empty map', () => {
      expect(map.entries()).toEqual([])
    })

    it('should return all entries', () => {
      map.set('a', '1')
      map.set('b', '2')
      const entries = map.entries()
      expect(entries.length).toBe(2)
    })

    it('should return entries with correct structure', () => {
      map.set('key1', 'value1')
      const entries = map.entries()
      expect(entries[0]).toHaveProperty('key')
      expect(entries[0]).toHaveProperty('value')
      expect(entries[0]).toHaveProperty('hash')
      expect(entries[0]).toHaveProperty('timestamp')
    })

    it('should reflect updates in entries', () => {
      map.set('key1', 'old')
      map.set('key1', 'new')
      const entries = map.entries()
      expect(entries.length).toBe(1)
      expect(entries[0]?.value).toBe('new')
    })

    it('should not include deleted entries', () => {
      map.set('a', '1')
      map.set('b', '2')
      map.delete('a')
      const entries = map.entries()
      expect(entries.length).toBe(1)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      expect(map.keys()).toEqual([])
    })

    it('should return all keys', () => {
      map.set('a', '1')
      map.set('b', '2')
      map.set('c', '3')
      const keys = map.keys()
      expect(keys.length).toBe(3)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
    })

    it('should not include deleted keys', () => {
      map.set('a', '1')
      map.set('b', '2')
      map.delete('a')
      const keys = map.keys()
      expect(keys).not.toContain('a')
      expect(keys).toContain('b')
    })
  })

  describe('values', () => {
    it('should return empty array for empty map', () => {
      expect(map.values()).toEqual([])
    })

    it('should return all values', () => {
      map.set('a', '1')
      map.set('b', '2')
      const values = map.values()
      expect(values.length).toBe(2)
      expect(values).toContain('1')
      expect(values).toContain('2')
    })

    it('should not include values of deleted entries', () => {
      map.set('a', '1')
      map.set('b', '2')
      map.delete('a')
      const values = map.values()
      expect(values).not.toContain('1')
      expect(values).toContain('2')
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      map.set('a', '1')
      map.set('b', '2')
      map.set('c', '3')
      const result: string[] = []
      map.forEach((value, _key) => {
        result.push(value)
      })
      expect(result.length).toBe(3)
      expect(result).toContain('1')
      expect(result).toContain('2')
      expect(result).toContain('3')
    })

    it('should provide key and entry to callback', () => {
      map.set('key1', 'value1')
      let capturedKey: string | null = null
      let capturedValue: string | null = null
      map.forEach((v, k) => {
        capturedKey = k
        capturedValue = v
      })
      expect(capturedKey).toBe('key1')
      expect(capturedValue).toBe('value1')
    })

    it('should provide full entry object to callback', () => {
      map.set('key1', 'value1')
      let capturedEntry: HashMapEntry<string> | null = null
      map.forEach((_v, _k, entry) => {
        capturedEntry = entry
      })
      expect(capturedEntry).not.toBeNull()
      expect(capturedEntry!.key).toBe('key1')
      expect(capturedEntry!.value).toBe('value1')
      expect(capturedEntry!.hash).toBeDefined()
      expect(capturedEntry!.timestamp).toBeDefined()
    })

    it('should not iterate over empty map', () => {
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should not iterate over deleted entries', () => {
      map.set('a', '1')
      map.set('b', '2')
      map.delete('a')
      const result: string[] = []
      map.forEach((v) => { result.push(v) })
      expect(result.length).toBe(1)
      expect(result).toContain('2')
    })
  })

  describe('getSize', () => {
    it('should return 0 for new map', () => {
      expect(map.getSize()).toBe(0)
    })

    it('should return correct size after additions', () => {
      map.set('a', '1')
      map.set('b', '2')
      expect(map.getSize()).toBe(2)
    })

    it('should return correct size after deletions', () => {
      map.set('a', '1')
      map.set('b', '2')
      map.delete('a')
      expect(map.getSize()).toBe(1)
    })

    it('should return 0 after clear', () => {
      map.set('a', '1')
      map.clear()
      expect(map.getSize()).toBe(0)
    })
  })

  describe('getCapacity', () => {
    it('should return default capacity', () => {
      expect(map.getCapacity()).toBe(DEFAULT_HASHMAP_OPTIONS.capacity)
    })

    it('should return custom capacity', () => {
      const m = new CodeHashMap({ capacity: 64 })
      expect(m.getCapacity()).toBe(64)
    })

    it('should return new capacity after resize', () => {
      const m = new CodeHashMap<string>({ capacity: 4 })
      m.resize(32)
      expect(m.getCapacity()).toBe(32)
    })
  })

  describe('getStats', () => {
    it('should return stats for empty map', () => {
      const stats = map.getStats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(DEFAULT_HASHMAP_OPTIONS.capacity)
      expect(stats.loadFactor).toBe(0)
      expect(stats.collisions).toBe(0)
      expect(stats.resizeCount).toBe(0)
    })

    it('should return correct size in stats', () => {
      map.set('a', '1')
      map.set('b', '2')
      const stats = map.getStats()
      expect(stats.size).toBe(2)
    })

    it('should return correct load factor', () => {
      const m = new CodeHashMap<string>({ capacity: 4 })
      m.set('a', '1')
      const stats = m.getStats()
      expect(stats.loadFactor).toBe(0.25)
    })

    it('should return correct resize count', () => {
      const stats = map.getStats()
      expect(stats.resizeCount).toBe(0)
    })

    it('should track collisions', () => {
      const collisionMap = new CodeHashMap<string>({ hashFunction: (_k: string) => 1 })
      collisionMap.set('a', '1')
      collisionMap.set('b', '2')
      const stats = collisionMap.getStats()
      expect(stats.collisions).toBeGreaterThan(0)
    })
  })

  describe('resize', () => {
    it('should change capacity', () => {
      map.resize(64)
      expect(map.getCapacity()).toBe(64)
    })

    it('should preserve all entries', () => {
      map.set('a', '1')
      map.set('b', '2')
      map.set('c', '3')
      map.resize(64)
      expect(map.getSize()).toBe(3)
      expect(map.get('a')).toBe('1')
      expect(map.get('b')).toBe('2')
      expect(map.get('c')).toBe('3')
    })

    it('should increment resizeCount', () => {
      map.resize(32)
      expect(map.getStats().resizeCount).toBe(1)
      map.resize(64)
      expect(map.getStats().resizeCount).toBe(2)
    })

    it('should allow shrinking', () => {
      map.set('a', '1')
      map.resize(4)
      expect(map.getCapacity()).toBe(4)
      expect(map.get('a')).toBe('1')
    })

    it('should handle resize to same capacity', () => {
      map.set('a', '1')
      map.resize(DEFAULT_HASHMAP_OPTIONS.capacity)
      expect(map.get('a')).toBe('1')
      expect(map.getStats().resizeCount).toBe(1)
    })
  })

  describe('getCollisions', () => {
    it('should return 0 for no collisions', () => {
      expect(map.getCollisions()).toBe(0)
    })

    it('should return 0 for single entry', () => {
      map.set('a', '1')
      expect(map.getCollisions()).toBe(0)
    })

    it('should count collisions with forced hash', () => {
      const collisionMap = new CodeHashMap<string>({ hashFunction: (_k: string) => 5 })
      collisionMap.set('a', '1')
      collisionMap.set('b', '2')
      collisionMap.set('c', '3')
      expect(collisionMap.getCollisions()).toBe(2)
    })
  })

  describe('collision handling', () => {
    it('should handle keys that hash to same bucket', () => {
      const collisionMap = new CodeHashMap<string>({ hashFunction: (_k: string) => 1 })
      collisionMap.set('a', 'val-a')
      collisionMap.set('b', 'val-b')
      collisionMap.set('c', 'val-c')
      expect(collisionMap.get('a')).toBe('val-a')
      expect(collisionMap.get('b')).toBe('val-b')
      expect(collisionMap.get('c')).toBe('val-c')
    })

    it('should handle deletion in collision chain', () => {
      const collisionMap = new CodeHashMap<string>({ hashFunction: (_k: string) => 1 })
      collisionMap.set('a', '1')
      collisionMap.set('b', '2')
      collisionMap.set('c', '3')
      collisionMap.delete('b')
      expect(collisionMap.get('a')).toBe('1')
      expect(collisionMap.get('b')).toBeUndefined()
      expect(collisionMap.get('c')).toBe('3')
    })

    it('should handle overwrite in collision chain', () => {
      const collisionMap = new CodeHashMap<string>({ hashFunction: (_k: string) => 1 })
      collisionMap.set('a', '1')
      collisionMap.set('b', '2')
      collisionMap.set('b', 'updated')
      expect(collisionMap.get('b')).toBe('updated')
      expect(collisionMap.getSize()).toBe(2)
    })

    it('should correctly report has for collided keys', () => {
      const collisionMap = new CodeHashMap<string>({ hashFunction: (_k: string) => 1 })
      collisionMap.set('x', '1')
      collisionMap.set('y', '2')
      expect(collisionMap.has('x')).toBe(true)
      expect(collisionMap.has('y')).toBe(true)
      expect(collisionMap.has('z')).toBe(false)
    })
  })

  describe('automatic resizing', () => {
    it('should auto-resize when load factor exceeded', () => {
      const m = new CodeHashMap<string>({ capacity: 4, loadFactor: 0.5 })
      m.set('a', '1')
      m.set('b', '2')
      m.set('c', '3')
      expect(m.getStats().resizeCount).toBeGreaterThan(0)
      expect(m.get('a')).toBe('1')
      expect(m.get('b')).toBe('2')
      expect(m.get('c')).toBe('3')
    })

    it('should not resize below load factor', () => {
      const m = new CodeHashMap<string>({ capacity: 100, loadFactor: 0.75 })
      m.set('a', '1')
      m.set('b', '2')
      expect(m.getStats().resizeCount).toBe(0)
    })

    it('should preserve entries across multiple resizes', () => {
      const m = new CodeHashMap<string>({ capacity: 2, loadFactor: 0.5 })
      for (let i = 0; i < 10; i++) {
        m.set(`key${i}`, `val${i}`)
      }
      expect(m.getSize()).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(m.get(`key${i}`)).toBe(`val${i}`)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle large dataset', () => {
      const m = new CodeHashMap<number>()
      for (let i = 0; i < 1000; i++) {
        m.set(`key${i}`, i)
      }
      expect(m.getSize()).toBe(1000)
      expect(m.get('key500')).toBe(500)
    })

    it('should handle special characters in keys', () => {
      map.set('key with spaces', '1')
      map.set('key-with-dashes', '2')
      map.set('key_with_underscores', '3')
      map.set('key.with.dots', '4')
      expect(map.get('key with spaces')).toBe('1')
      expect(map.get('key-with-dashes')).toBe('2')
      expect(map.get('key_with_underscores')).toBe('3')
      expect(map.get('key.with.dots')).toBe('4')
    })

    it('should handle unicode keys', () => {
      map.set('日本語', 'japanese')
      map.set('emoji🎉', 'emoji')
      expect(map.get('日本語')).toBe('japanese')
      expect(map.get('emoji🎉')).toBe('emoji')
    })

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(10000)
      map.set(longKey, 'value')
      expect(map.get(longKey)).toBe('value')
    })

    it('should handle boolean values', () => {
      const boolMap = new CodeHashMap<boolean>()
      boolMap.set('t', true)
      boolMap.set('f', false)
      expect(boolMap.get('t')).toBe(true)
      expect(boolMap.get('f')).toBe(false)
    })

    it('should handle numeric values', () => {
      const numMap = new CodeHashMap<number>()
      numMap.set('zero', 0)
      numMap.set('neg', -1)
      numMap.set('float', 3.14)
      expect(numMap.get('zero')).toBe(0)
      expect(numMap.get('neg')).toBe(-1)
      expect(numMap.get('float')).toBe(3.14)
    })

    it('should handle set delete set cycle', () => {
      map.set('key', 'v1')
      map.delete('key')
      map.set('key', 'v2')
      expect(map.get('key')).toBe('v2')
      expect(map.getSize()).toBe(1)
    })

    it('should handle delete from empty map', () => {
      expect(map.delete('nonexistent')).toBe(false)
      expect(map.getSize()).toBe(0)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_HASHMAP_OPTIONS', () => {
      expect(DEFAULT_HASHMAP_OPTIONS.capacity).toBe(16)
      expect(DEFAULT_HASHMAP_OPTIONS.loadFactor).toBe(0.75)
      expect(typeof DEFAULT_HASHMAP_OPTIONS.hashFunction).toBe('function')
    })

    it('should have a working default hash function', () => {
      const hash1 = DEFAULT_HASHMAP_OPTIONS.hashFunction('test')
      const hash2 = DEFAULT_HASHMAP_OPTIONS.hashFunction('test')
      const hash3 = DEFAULT_HASHMAP_OPTIONS.hashFunction('other')
      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(hash3)
    })

    it('should re-export types from code-hashmap module', () => {
      const entry: HashMapEntry<string> = {
        key: 'test',
        value: 'val',
        hash: 123,
        timestamp: Date.now(),
      }
      expect(entry.key).toBe('test')

      const opts: HashMapOptions = {
        capacity: 16,
        loadFactor: 0.75,
        hashFunction: () => 0,
      }
      expect(opts.capacity).toBe(16)

      const stats: HashMapStats = {
        size: 0,
        capacity: 16,
        loadFactor: 0,
        collisions: 0,
        resizeCount: 0,
      }
      expect(stats.size).toBe(0)
    })
  })

  describe('load factor behavior', () => {
    it('should compute load factor as size / capacity', () => {
      const m = new CodeHashMap<string>({ capacity: 8 })
      m.set('a', '1')
      expect(m.getStats().loadFactor).toBe(1 / 8)
      m.set('b', '2')
      expect(m.getStats().loadFactor).toBe(2 / 8)
    })

    it('should update load factor after resize', () => {
      const m = new CodeHashMap<string>({ capacity: 4 })
      m.set('a', '1')
      m.set('b', '2')
      m.resize(16)
      const stats = m.getStats()
      expect(stats.loadFactor).toBe(2 / 16)
    })

    it('should update load factor after delete', () => {
      const m = new CodeHashMap<string>({ capacity: 8 })
      m.set('a', '1')
      m.set('b', '2')
      m.delete('a')
      expect(m.getStats().loadFactor).toBe(1 / 8)
    })
  })

  describe('statistics tracking', () => {
    it('should track resize count across multiple resizes', () => {
      const m = new CodeHashMap<string>({ capacity: 4, loadFactor: 0.5 })
      m.set('a', '1')
      m.set('b', '2')
      m.set('c', '3')
      const count = m.getStats().resizeCount
      expect(count).toBeGreaterThan(0)
    })

    it('should reset collisions on clear', () => {
      const collisionMap = new CodeHashMap<string>({ hashFunction: (_k: string) => 1 })
      collisionMap.set('a', '1')
      collisionMap.set('b', '2')
      expect(collisionMap.getCollisions()).toBeGreaterThan(0)
      collisionMap.clear()
      expect(collisionMap.getCollisions()).toBe(0)
    })

    it('should track collisions correctly after resize', () => {
      const m = new CodeHashMap<string>({ capacity: 2, loadFactor: 0.5, hashFunction: (_k: string) => 1 })
      m.set('a', '1')
      m.set('b', '2')
      m.set('c', '3')
      expect(m.getStats().collisions).toBeGreaterThan(0)
    })
  })

  describe('capacity management', () => {
    it('should double capacity on auto-resize', () => {
      const m = new CodeHashMap<string>({ capacity: 4, loadFactor: 0.5 })
      m.set('a', '1')
      m.set('b', '2')
      m.set('c', '3')
      expect(m.getCapacity()).toBeGreaterThanOrEqual(8)
    })

    it('should maintain correct capacity after manual resize', () => {
      map.resize(128)
      expect(map.getCapacity()).toBe(128)
    })

    it('should not lose data during auto-resize with collisions', () => {
      const m = new CodeHashMap<string>({ capacity: 2, loadFactor: 0.5, hashFunction: (_k: string) => 1 })
      m.set('a', '1')
      m.set('b', '2')
      m.set('c', '3')
      m.set('d', '4')
      expect(m.get('a')).toBe('1')
      expect(m.get('b')).toBe('2')
      expect(m.get('c')).toBe('3')
      expect(m.get('d')).toBe('4')
    })
  })

  describe('iteration consistency', () => {
    it('forEach should visit all entries exactly once', () => {
      map.set('a', '1')
      map.set('b', '2')
      map.set('c', '3')
      const visited: Record<string, number> = {}
      map.forEach((_v, k) => {
        visited[k] = (visited[k] ?? 0) + 1
      })
      expect(Object.keys(visited).length).toBe(3)
      for (const count of Object.values(visited)) {
        expect(count).toBe(1)
      }
    })

    it('entries should be consistent with keys and values', () => {
      map.set('x', '10')
      map.set('y', '20')
      const entries = map.entries()
      const keys = map.keys()
      const values = map.values()
      expect(entries.length).toBe(keys.length)
      expect(entries.length).toBe(values.length)
    })
  })
})
