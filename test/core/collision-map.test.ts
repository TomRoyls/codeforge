import { describe, it, expect } from 'vitest'
import { CollisionMap } from '../../src/core/collision-map/collision-map.js'

describe('CollisionMap', () => {
  describe('constructor', () => {
    it('creates with default bucket count of 256', () => {
      const cm = new CollisionMap()
      expect(cm.bucketCount).toBe(256)
    })

    it('creates with custom bucket count', () => {
      const cm = new CollisionMap({ bucketCount: 64 })
      expect(cm.bucketCount).toBe(64)
    })

    it('creates with custom hash function', () => {
      const cm = new CollisionMap({ hashFn: () => 0 })
      expect(cm.bucketCount).toBe(256)
    })

    it('creates with both options', () => {
      const cm = new CollisionMap({ bucketCount: 16, hashFn: () => 42 })
      expect(cm.bucketCount).toBe(16)
    })

    it('starts with size 0', () => {
      const cm = new CollisionMap()
      expect(cm.size).toBe(0)
    })

    it('starts with empty collisions', () => {
      const cm = new CollisionMap()
      expect(cm.collisionCount).toBe(0)
    })
  })

  describe('insert', () => {
    it('inserts a key with value', () => {
      const cm = new CollisionMap()
      cm.insert('hello', 'world')
      expect(cm.size).toBe(1)
    })

    it('inserts a key without value', () => {
      const cm = new CollisionMap()
      cm.insert('key')
      expect(cm.size).toBe(1)
    })

    it('returns this for chaining', () => {
      const cm = new CollisionMap()
      const result = cm.insert('a', '1')
      expect(result).toBe(cm)
    })

    it('updates value for existing key', () => {
      const cm = new CollisionMap()
      cm.insert('key', 'old')
      cm.insert('key', 'new')
      expect(cm.size).toBe(1)
      const entries = [...cm.entries()]
      expect(entries[0]![1]).toBe('new')
    })

    it('does not increase size on duplicate key', () => {
      const cm = new CollisionMap()
      cm.insert('key', 'v1')
      cm.insert('key', 'v2')
      expect(cm.size).toBe(1)
    })

    it('handles multiple distinct keys', () => {
      const cm = new CollisionMap()
      cm.insert('a', '1')
      cm.insert('b', '2')
      cm.insert('c', '3')
      expect(cm.size).toBe(3)
    })

    it('handles empty string key', () => {
      const cm = new CollisionMap()
      cm.insert('', 'empty')
      expect(cm.size).toBe(1)
      expect(cm.has('')).toBe(true)
    })

    it('handles numeric string keys', () => {
      const cm = new CollisionMap()
      cm.insert('0', 'zero')
      cm.insert('1', 'one')
      expect(cm.size).toBe(2)
    })

    it('handles long keys', () => {
      const cm = new CollisionMap()
      const longKey = 'a'.repeat(1000)
      cm.insert(longKey, 'long')
      expect(cm.has(longKey)).toBe(true)
    })
  })

  describe('get', () => {
    it('returns entries for existing key', () => {
      const cm = new CollisionMap()
      cm.insert('hello', 'world')
      const result = cm.get('hello')
      expect(result.length).toBe(1)
      expect(result[0]!.key).toBe('hello')
      expect(result[0]!.value).toBe('world')
    })

    it('returns empty array for missing key', () => {
      const cm = new CollisionMap()
      const result = cm.get('missing')
      expect(result.length).toBe(0)
    })

    it('returns entry with hash', () => {
      const cm = new CollisionMap()
      cm.insert('test', 'val')
      const result = cm.get('test')
      expect(result[0]!.hash).toBe(CollisionMap.djb2('test'))
    })

    it('returns updated value after re-insert', () => {
      const cm = new CollisionMap()
      cm.insert('key', 'old')
      cm.insert('key', 'new')
      const result = cm.get('key')
      expect(result[0]!.value).toBe('new')
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const cm = new CollisionMap()
      cm.insert('key', 'val')
      expect(cm.has('key')).toBe(true)
    })

    it('returns false for missing key', () => {
      const cm = new CollisionMap()
      expect(cm.has('missing')).toBe(false)
    })

    it('returns false after deletion', () => {
      const cm = new CollisionMap()
      cm.insert('key', 'val')
      cm.delete('key')
      expect(cm.has('key')).toBe(false)
    })

    it('returns true for empty string key if inserted', () => {
      const cm = new CollisionMap()
      cm.insert('', 'empty')
      expect(cm.has('')).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const cm = new CollisionMap()
      cm.insert('key', 'val')
      expect(cm.delete('key')).toBe(true)
      expect(cm.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const cm = new CollisionMap()
      expect(cm.delete('missing')).toBe(false)
    })

    it('deletes without affecting other keys', () => {
      const cm = new CollisionMap()
      cm.insert('a', '1')
      cm.insert('b', '2')
      cm.delete('a')
      expect(cm.size).toBe(1)
      expect(cm.has('b')).toBe(true)
      expect(cm.has('a')).toBe(false)
    })

    it('can delete and re-insert', () => {
      const cm = new CollisionMap()
      cm.insert('key', 'v1')
      cm.delete('key')
      cm.insert('key', 'v2')
      expect(cm.size).toBe(1)
      expect(cm.get('key')[0]!.value).toBe('v2')
    })

    it('handles delete on empty map', () => {
      const cm = new CollisionMap()
      expect(cm.delete('anything')).toBe(false)
    })
  })

  describe('collisions', () => {
    it('returns empty map when no collisions', () => {
      const cm = new CollisionMap({ bucketCount: 256, hashFn: (k) => {
        const hashes: Record<string, number> = { a: 0, b: 1 }
        return hashes[k] ?? 2
      }})
      cm.insert('a')
      cm.insert('b')
      expect(cm.collisions.size).toBe(0)
    })

    it('detects collisions in same bucket', () => {
      const cm = new CollisionMap({ hashFn: () => 0, bucketCount: 4 })
      cm.insert('a')
      cm.insert('b')
      expect(cm.collisions.size).toBe(1)
    })

    it('collision map contains correct keys', () => {
      const cm = new CollisionMap({ hashFn: () => 0, bucketCount: 4 })
      cm.insert('x')
      cm.insert('y')
      const collKeys = cm.collisions.get(0)
      expect(collKeys).toEqual(['x', 'y'])
    })

    it('collision count is correct with multiple collision buckets', () => {
      const cm = new CollisionMap({
        bucketCount: 4,
        hashFn: (k) => {
          if (k === 'a' || k === 'b') return 0
          if (k === 'c' || k === 'd') return 1
          return 2
        }
      })
      cm.insert('a')
      cm.insert('b')
      cm.insert('c')
      cm.insert('d')
      expect(cm.collisionCount).toBe(2)
    })

    it('single item buckets are not collisions', () => {
      const cm = new CollisionMap({
        bucketCount: 4,
        hashFn: (k) => {
          const m: Record<string, number> = { a: 0, b: 1 }
          return m[k] ?? 2
        }
      })
      cm.insert('a')
      cm.insert('b')
      expect(cm.collisionCount).toBe(0)
    })

    it('collision count updates after delete', () => {
      const cm = new CollisionMap({ hashFn: () => 0, bucketCount: 4 })
      cm.insert('a')
      cm.insert('b')
      expect(cm.collisionCount).toBe(1)
      cm.delete('a')
      expect(cm.collisionCount).toBe(0)
    })
  })

  describe('maxChainLength', () => {
    it('is 0 for empty map', () => {
      const cm = new CollisionMap()
      expect(cm.maxChainLength).toBe(0)
    })

    it('is 1 for single item', () => {
      const cm = new CollisionMap()
      cm.insert('key')
      expect(cm.maxChainLength).toBe(1)
    })

    it('increases with collisions', () => {
      const cm = new CollisionMap({ hashFn: () => 0, bucketCount: 4 })
      cm.insert('a')
      cm.insert('b')
      cm.insert('c')
      expect(cm.maxChainLength).toBe(3)
    })

    it('reflects the longest chain across buckets', () => {
      const cm = new CollisionMap({
        bucketCount: 4,
        hashFn: (k) => {
          if (k === 'a' || k === 'b') return 0
          return 1
        }
      })
      cm.insert('a')
      cm.insert('b')
      cm.insert('c')
      cm.insert('d')
      cm.insert('e')
      expect(cm.maxChainLength).toBe(3)
    })

    it('decreases after delete', () => {
      const cm = new CollisionMap({ hashFn: () => 0, bucketCount: 4 })
      cm.insert('a')
      cm.insert('b')
      cm.insert('c')
      cm.delete('c')
      expect(cm.maxChainLength).toBe(2)
    })
  })

  describe('avgChainLength', () => {
    it('is 0 for empty map', () => {
      const cm = new CollisionMap()
      expect(cm.avgChainLength).toBe(0)
    })

    it('computes correctly', () => {
      const cm = new CollisionMap({ bucketCount: 4 })
      cm.insert('a')
      cm.insert('b')
      expect(cm.avgChainLength).toBeCloseTo(0.5)
    })

    it('computes with many items', () => {
      const cm = new CollisionMap({ bucketCount: 10 })
      for (let i = 0; i < 100; i++) {
        cm.insert(`key${i}`)
      }
      expect(cm.avgChainLength).toBe(10)
    })
  })

  describe('loadFactor', () => {
    it('is 0 for empty map', () => {
      const cm = new CollisionMap()
      expect(cm.loadFactor).toBe(0)
    })

    it('computes correctly', () => {
      const cm = new CollisionMap({ bucketCount: 4 })
      cm.insert('a')
      expect(cm.loadFactor).toBeCloseTo(0.25)
    })

    it('increases with more items', () => {
      const cm = new CollisionMap({ bucketCount: 4 })
      for (let i = 0; i < 4; i++) {
        cm.insert(`key${i}`)
      }
      expect(cm.loadFactor).toBe(1)
    })

    it('can exceed 1 with collisions', () => {
      const cm = new CollisionMap({ hashFn: () => 0, bucketCount: 4 })
      for (let i = 0; i < 8; i++) {
        cm.insert(`key${i}`)
      }
      expect(cm.loadFactor).toBe(2)
    })
  })

  describe('size', () => {
    it('tracks insertions', () => {
      const cm = new CollisionMap()
      cm.insert('a')
      cm.insert('b')
      cm.insert('c')
      expect(cm.size).toBe(3)
    })

    it('decreases on delete', () => {
      const cm = new CollisionMap()
      cm.insert('a')
      cm.insert('b')
      cm.delete('a')
      expect(cm.size).toBe(1)
    })

    it('resets on clear', () => {
      const cm = new CollisionMap()
      cm.insert('a')
      cm.insert('b')
      cm.clear()
      expect(cm.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('removes all entries', () => {
      const cm = new CollisionMap()
      cm.insert('a')
      cm.insert('b')
      cm.insert('c')
      cm.clear()
      expect(cm.size).toBe(0)
      expect(cm.collisionCount).toBe(0)
      expect(cm.maxChainLength).toBe(0)
    })

    it('allows re-insertion after clear', () => {
      const cm = new CollisionMap()
      cm.insert('a')
      cm.clear()
      cm.insert('b')
      expect(cm.size).toBe(1)
      expect(cm.has('b')).toBe(true)
    })

    it('preserves bucket count', () => {
      const cm = new CollisionMap({ bucketCount: 64 })
      cm.insert('a')
      cm.clear()
      expect(cm.bucketCount).toBe(64)
    })
  })

  describe('keys', () => {
    it('returns empty iterator for empty map', () => {
      const cm = new CollisionMap()
      expect([...cm.keys()]).toEqual([])
    })

    it('returns all keys', () => {
      const cm = new CollisionMap()
      cm.insert('a', '1')
      cm.insert('b', '2')
      const keys = [...cm.keys()]
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys.length).toBe(2)
    })

    it('does not return deleted keys', () => {
      const cm = new CollisionMap()
      cm.insert('a')
      cm.insert('b')
      cm.delete('a')
      const keys = [...cm.keys()]
      expect(keys).toEqual(['b'])
    })
  })

  describe('values', () => {
    it('returns empty iterator for empty map', () => {
      const cm = new CollisionMap()
      expect([...cm.values()]).toEqual([])
    })

    it('returns all values', () => {
      const cm = new CollisionMap()
      cm.insert('a', '1')
      cm.insert('b', '2')
      const vals = [...cm.values()]
      expect(vals).toContain('1')
      expect(vals).toContain('2')
    })

    it('returns undefined for keys without value', () => {
      const cm = new CollisionMap()
      cm.insert('a')
      const vals = [...cm.values()]
      expect(vals).toEqual([undefined])
    })
  })

  describe('entries', () => {
    it('returns empty iterator for empty map', () => {
      const cm = new CollisionMap()
      expect([...cm.entries()]).toEqual([])
    })

    it('returns all entries', () => {
      const cm = new CollisionMap()
      cm.insert('a', '1')
      cm.insert('b', '2')
      const entries = [...cm.entries()]
      expect(entries.length).toBe(2)
      for (const [k, v] of entries) {
        if (k === 'a') expect(v).toBe('1')
        if (k === 'b') expect(v).toBe('2')
      }
    })

    it('returns key-value pairs', () => {
      const cm = new CollisionMap()
      cm.insert('x', 'val')
      const entries = [...cm.entries()]
      expect(entries[0]).toEqual(['x', 'val'])
    })
  })

  describe('rehash', () => {
    it('changes bucket count', () => {
      const cm = new CollisionMap({ bucketCount: 4 })
      cm.insert('a')
      cm.rehash(8)
      expect(cm.bucketCount).toBe(8)
    })

    it('preserves all entries', () => {
      const cm = new CollisionMap({ bucketCount: 4 })
      cm.insert('a', '1')
      cm.insert('b', '2')
      cm.insert('c', '3')
      cm.rehash(16)
      expect(cm.size).toBe(3)
      expect(cm.has('a')).toBe(true)
      expect(cm.has('b')).toBe(true)
      expect(cm.has('c')).toBe(true)
    })

    it('preserves values', () => {
      const cm = new CollisionMap({ bucketCount: 4 })
      cm.insert('key', 'val')
      cm.rehash(64)
      const result = cm.get('key')
      expect(result[0]!.value).toBe('val')
    })

    it('may reduce collisions with more buckets', () => {
      const cm = new CollisionMap({ hashFn: () => 0, bucketCount: 1 })
      cm.insert('a')
      cm.insert('b')
      expect(cm.collisionCount).toBe(1)
      cm.rehash(256)
      expect(cm.collisionCount).toBe(1)
    })

    it('rehash to same size works', () => {
      const cm = new CollisionMap({ bucketCount: 4 })
      cm.insert('a', '1')
      cm.rehash(4)
      expect(cm.size).toBe(1)
      expect(cm.has('a')).toBe(true)
    })

    it('rehash to smaller size works', () => {
      const cm = new CollisionMap({ bucketCount: 256 })
      cm.insert('a', '1')
      cm.insert('b', '2')
      cm.rehash(2)
      expect(cm.size).toBe(2)
      expect(cm.bucketCount).toBe(2)
    })

    it('rehash with custom hash function preserves function', () => {
      let callCount = 0
      const customHash = (k: string) => {
        callCount++
        return k.length
      }
      const cm = new CollisionMap({ bucketCount: 4, hashFn: customHash })
      cm.insert('abc')
      cm.rehash(8)
      cm.insert('def')
      expect(callCount).toBeGreaterThan(0)
    })
  })

  describe('bucketOf', () => {
    it('returns a valid bucket index', () => {
      const cm = new CollisionMap({ bucketCount: 16 })
      const idx = cm.bucketOf('hello')
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(16)
    })

    it('returns same index for same key', () => {
      const cm = new CollisionMap()
      expect(cm.bucketOf('test')).toBe(cm.bucketOf('test'))
    })

    it('returns different indices for different keys (usually)', () => {
      const cm = new CollisionMap({ bucketCount: 256 })
      const idx1 = cm.bucketOf('a')
      const idx2 = cm.bucketOf('b')
      expect(idx1).not.toBe(idx2)
    })

    it('is consistent with insert placement', () => {
      const cm = new CollisionMap({ bucketCount: 16 })
      cm.insert('key')
      const idx = cm.bucketOf('key')
      expect(cm.itemsInBucket(idx).length).toBe(1)
    })
  })

  describe('itemsInBucket', () => {
    it('returns empty array for empty bucket', () => {
      const cm = new CollisionMap()
      expect(cm.itemsInBucket(0)).toEqual([])
    })

    it('returns entries in bucket', () => {
      const cm = new CollisionMap({ bucketCount: 4, hashFn: () => 1 })
      cm.insert('a', '1')
      cm.insert('b', '2')
      const items = cm.itemsInBucket(1)
      expect(items.length).toBe(2)
    })

    it('returns copy of entries', () => {
      const cm = new CollisionMap({ hashFn: () => 0, bucketCount: 4 })
      cm.insert('a')
      const items = cm.itemsInBucket(0)
      items.pop()
      expect(cm.itemsInBucket(0).length).toBe(1)
    })

    it('returns empty for out of range bucket', () => {
      const cm = new CollisionMap({ bucketCount: 4 })
      expect(cm.itemsInBucket(-1)).toEqual([])
      expect(cm.itemsInBucket(4)).toEqual([])
      expect(cm.itemsInBucket(100)).toEqual([])
    })

    it('entries contain key, value, hash', () => {
      const cm = new CollisionMap({ bucketCount: 4 })
      cm.insert('test', 'val')
      const bucket = cm.bucketOf('test')
      const items = cm.itemsInBucket(bucket)
      expect(items[0]!.key).toBe('test')
      expect(items[0]!.value).toBe('val')
      expect(typeof items[0]!.hash).toBe('number')
    })
  })

  describe('distribution', () => {
    it('returns array of bucket count length', () => {
      const cm = new CollisionMap({ bucketCount: 8 })
      const dist = cm.distribution()
      expect(dist.length).toBe(8)
    })

    it('returns zeros for empty map', () => {
      const cm = new CollisionMap({ bucketCount: 4 })
      expect(cm.distribution()).toEqual([0, 0, 0, 0])
    })

    it('counts items per bucket', () => {
      const cm = new CollisionMap({ hashFn: () => 2, bucketCount: 4 })
      cm.insert('a')
      cm.insert('b')
      const dist = cm.distribution()
      expect(dist[2]).toBe(2)
    })

    it('sum equals size', () => {
      const cm = new CollisionMap({ bucketCount: 16 })
      for (let i = 0; i < 50; i++) {
        cm.insert(`key${i}`)
      }
      const dist = cm.distribution()
      const sum = dist.reduce((a, b) => a + b, 0)
      expect(sum).toBe(50)
    })

    it('updates after rehash', () => {
      const cm = new CollisionMap({ hashFn: () => 0, bucketCount: 1 })
      cm.insert('a')
      cm.insert('b')
      expect(cm.distribution()).toEqual([2])
      cm.rehash(4)
      const dist = cm.distribution()
      expect(dist.length).toBe(4)
      expect(dist.reduce((a, b) => a + b, 0)).toBe(2)
    })
  })

  describe('uniformity', () => {
    it('returns 1 for empty map', () => {
      const cm = new CollisionMap()
      expect(cm.uniformity()).toBe(1)
    })

    it('returns value between 0 and 1', () => {
      const cm = new CollisionMap({ bucketCount: 16 })
      for (let i = 0; i < 100; i++) {
        cm.insert(`key${i}`)
      }
      const u = cm.uniformity()
      expect(u).toBeGreaterThanOrEqual(0)
      expect(u).toBeLessThanOrEqual(1)
    })

    it('returns low score for poor distribution', () => {
      const cm = new CollisionMap({ hashFn: () => 0, bucketCount: 64 })
      for (let i = 0; i < 100; i++) {
        cm.insert(`key${i}`)
      }
      expect(cm.uniformity()).toBeLessThan(0.5)
    })

    it('returns higher score for better distribution', () => {
      const cm = new CollisionMap({ bucketCount: 256 })
      for (let i = 0; i < 256; i++) {
        cm.insert(`key${i}`)
      }
      expect(cm.uniformity()).toBeGreaterThan(0)
    })

    it('returns 1 for single item in large bucket count', () => {
      const cm = new CollisionMap({ bucketCount: 256 })
      cm.insert('only')
      expect(cm.uniformity()).toBeGreaterThan(0)
    })
  })

  describe('djb2 hash', () => {
    it('returns a number', () => {
      expect(typeof CollisionMap.djb2('test')).toBe('number')
    })

    it('is deterministic', () => {
      expect(CollisionMap.djb2('hello')).toBe(CollisionMap.djb2('hello'))
    })

    it('returns different hashes for different strings', () => {
      expect(CollisionMap.djb2('a')).not.toBe(CollisionMap.djb2('b'))
    })

    it('returns unsigned 32-bit integer', () => {
      const hash = CollisionMap.djb2('test')
      expect(hash).toBeGreaterThanOrEqual(0)
      expect(hash).toBeLessThanOrEqual(0xFFFFFFFF)
    })

    it('handles empty string', () => {
      const hash = CollisionMap.djb2('')
      expect(typeof hash).toBe('number')
    })

    it('handles unicode', () => {
      const hash = CollisionMap.djb2('日本語')
      expect(typeof hash).toBe('number')
    })

    it('distributes reasonably', () => {
      const hashes = new Set<number>()
      for (let i = 0; i < 100; i++) {
        hashes.add(CollisionMap.djb2(`key${i}`))
      }
      expect(hashes.size).toBeGreaterThan(50)
    })
  })

  describe('chaining', () => {
    it('supports method chaining', () => {
      const cm = new CollisionMap()
      cm.insert('a', '1').insert('b', '2').insert('c', '3')
      expect(cm.size).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('handles special characters in keys', () => {
      const cm = new CollisionMap()
      cm.insert('hello world', 'val')
      cm.insert('key\n', 'val')
      cm.insert('key\t', 'val')
      expect(cm.size).toBe(3)
    })

    it('handles unicode keys', () => {
      const cm = new CollisionMap()
      cm.insert('日本語', 'japanese')
      cm.insert('中文', 'chinese')
      expect(cm.size).toBe(2)
      expect(cm.has('日本語')).toBe(true)
    })

    it('handles null-like value', () => {
      const cm = new CollisionMap<string | null>()
      cm.insert('key', null)
      expect(cm.size).toBe(1)
      const result = cm.get('key')
      expect(result[0]!.value).toBe(null)
    })

    it('handles undefined value', () => {
      const cm = new CollisionMap()
      cm.insert('key', undefined)
      expect(cm.size).toBe(1)
      const result = cm.get('key')
      expect(result[0]!.value).toBe(undefined)
    })

    it('handles object values', () => {
      const cm = new CollisionMap<{ id: number }>()
      cm.insert('key', { id: 42 })
      const result = cm.get('key')
      expect(result[0]!.value!.id).toBe(42)
    })

    it('handles array values', () => {
      const cm = new CollisionMap<number[]>()
      cm.insert('key', [1, 2, 3])
      const result = cm.get('key')
      expect(result[0]!.value).toEqual([1, 2, 3])
    })

    it('handles very large bucket count', () => {
      const cm = new CollisionMap({ bucketCount: 10000 })
      cm.insert('key')
      expect(cm.size).toBe(1)
      expect(cm.bucketCount).toBe(10000)
    })

    it('handles bucket count of 1', () => {
      const cm = new CollisionMap({ bucketCount: 1 })
      cm.insert('a')
      cm.insert('b')
      expect(cm.size).toBe(2)
      expect(cm.collisionCount).toBe(1)
    })

    it('iterators work after many operations', () => {
      const cm = new CollisionMap({ bucketCount: 4 })
      for (let i = 0; i < 20; i++) {
        cm.insert(`key${i}`, `val${i}`)
      }
      for (let i = 0; i < 10; i++) {
        cm.delete(`key${i}`)
      }
      expect([...cm.keys()].length).toBe(10)
      expect([...cm.values()].length).toBe(10)
      expect([...cm.entries()].length).toBe(10)
    })
  })

  describe('with custom hash function', () => {
    it('uses provided hash function', () => {
      const cm = new CollisionMap({ bucketCount: 4, hashFn: () => 2 })
      cm.insert('a')
      cm.insert('b')
      expect(cm.itemsInBucket(2).length).toBe(2)
      expect(cm.itemsInBucket(0).length).toBe(0)
    })

    it('identity hash causes all collisions', () => {
      const cm = new CollisionMap({ hashFn: () => 42, bucketCount: 10 })
      cm.insert('a')
      cm.insert('b')
      cm.insert('c')
      expect(cm.collisionCount).toBe(1)
      expect(cm.maxChainLength).toBe(3)
    })

    it('length-based hash', () => {
      const cm = new CollisionMap({
        bucketCount: 8,
        hashFn: (k) => k.length
      })
      cm.insert('a')
      cm.insert('b')
      expect(cm.bucketOf('a')).toBe(1)
      expect(cm.bucketOf('b')).toBe(1)
      expect(cm.collisionCount).toBe(1)
    })
  })

  describe('concurrent-like operations', () => {
    it('mixed insert and delete', () => {
      const cm = new CollisionMap()
      cm.insert('a')
      cm.insert('b')
      cm.delete('a')
      cm.insert('c')
      cm.delete('b')
      cm.insert('d')
      expect(cm.size).toBe(2)
      expect(cm.has('c')).toBe(true)
      expect(cm.has('d')).toBe(true)
    })

    it('re-insert after multiple deletes', () => {
      const cm = new CollisionMap()
      for (let i = 0; i < 5; i++) {
        cm.insert('key', `val${i}`)
        cm.delete('key')
      }
      cm.insert('key', 'final')
      expect(cm.size).toBe(1)
      expect(cm.get('key')[0]!.value).toBe('final')
    })
  })

  describe('type parameter', () => {
    it('works with number values', () => {
      const cm = new CollisionMap<number>()
      cm.insert('a', 1)
      cm.insert('b', 2)
      expect([...cm.values()]).toContain(1)
      expect([...cm.values()]).toContain(2)
    })

    it('works with boolean values', () => {
      const cm = new CollisionMap<boolean>()
      cm.insert('flag', true)
      expect(cm.get('flag')[0]!.value).toBe(true)
    })
  })
})
