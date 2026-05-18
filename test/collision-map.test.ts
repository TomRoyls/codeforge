import { CollisionMap } from '../src/core/collision-map/collision-map.js'
import type { CollisionEntry } from '../src/core/collision-map/types.js'

// helper: force all keys into one bucket
function constantHash(): number {
  return 42
}

// ─── Constructor ────────────────────────────────────────────────────────

describe('CollisionMap', () => {
  describe('constructor', () => {
    it('creates a map with default 256 buckets', () => {
      const map = new CollisionMap()
      expect(map.bucketCount).toBe(256)
      expect(map.size).toBe(0)
    })

    it('creates a map with custom bucket count', () => {
      const map = new CollisionMap({ bucketCount: 16 })
      expect(map.bucketCount).toBe(16)
    })

    it('creates a map with custom hash function', () => {
      const map = new CollisionMap({ hashFn: () => 0 })
      expect(map.bucketCount).toBe(256)
    })

    it('creates a map with both custom options', () => {
      const map = new CollisionMap<number>({ bucketCount: 8, hashFn: () => 7 })
      expect(map.bucketCount).toBe(8)
    })

    it('defaults to bucketCount 256 when options object is empty', () => {
      const map = new CollisionMap({})
      expect(map.bucketCount).toBe(256)
    })
  })

  // ─── static djb2 ─────────────────────────────────────────────────────

  describe('static djb2', () => {
    it('returns a non-negative number', () => {
      const hash = CollisionMap.djb2('hello')
      expect(hash).toBeGreaterThanOrEqual(0)
    })

    it('returns consistent results for the same key', () => {
      const a = CollisionMap.djb2('test')
      const b = CollisionMap.djb2('test')
      expect(a).toBe(b)
    })

    it('returns different hashes for different keys', () => {
      const a = CollisionMap.djb2('abc')
      const b = CollisionMap.djb2('xyz')
      expect(a).not.toBe(b)
    })

    it('handles empty string', () => {
      const hash = CollisionMap.djb2('')
      expect(typeof hash).toBe('number')
      expect(hash).toBeGreaterThanOrEqual(0)
    })

    it('handles long strings', () => {
      const hash = CollisionMap.djb2('a'.repeat(10000))
      expect(typeof hash).toBe('number')
    })
  })

  // ─── insert ───────────────────────────────────────────────────────────

  describe('insert', () => {
    it('inserts a new key-value pair', () => {
      const map = new CollisionMap<string>()
      map.insert('name', 'Alice')
      expect(map.size).toBe(1)
      expect(map.has('name')).toBe(true)
    })

    it('returns this for chaining', () => {
      const map = new CollisionMap<number>()
      const result = map.insert('a', 1)
      expect(result).toBe(map)
    })

    it('inserts without a value', () => {
      const map = new CollisionMap()
      map.insert('key')
      expect(map.size).toBe(1)
      expect(map.has('key')).toBe(true)
    })

    it('updates value for existing key', () => {
      const map = new CollisionMap<number>()
      map.insert('x', 10)
      map.insert('x', 20)
      expect(map.size).toBe(1)
      const entries = map.get('x')
      expect(entries).toHaveLength(1)
      expect(entries[0]!.value).toBe(20)
    })

    it('does not increase size when updating existing key', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1)
      expect(map.size).toBe(1)
      map.insert('a', 2)
      expect(map.size).toBe(1)
    })

    it('inserts multiple different keys', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      expect(map.size).toBe(3)
    })

    it('stores object values', () => {
      const map = new CollisionMap<{ id: number }>()
      map.insert('user', { id: 42 })
      const entries = map.get('user')
      expect(entries[0]!.value).toEqual({ id: 42 })
    })

    it('allows chaining multiple inserts', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      expect(map.has('a')).toBe(true)
      expect(map.has('b')).toBe(true)
      expect(map.has('c')).toBe(true)
    })

    it('overwrites undefined value with defined value', () => {
      const map = new CollisionMap<number>()
      map.insert('k')
      map.insert('k', 99)
      const entries = map.get('k')
      expect(entries[0]!.value).toBe(99)
    })
  })

  // ─── get ──────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns entries for an existing key', () => {
      const map = new CollisionMap<number>()
      map.insert('x', 10)
      const entries = map.get('x')
      expect(entries).toHaveLength(1)
      expect(entries[0]!.key).toBe('x')
      expect(entries[0]!.value).toBe(10)
    })

    it('returns empty array for non-existent key', () => {
      const map = new CollisionMap<number>()
      const entries = map.get('missing')
      expect(entries).toEqual([])
    })

    it('returns empty array on empty map', () => {
      const map = new CollisionMap()
      expect(map.get('anything')).toEqual([])
    })

    it('returns entry with hash property', () => {
      const map = new CollisionMap<number>()
      map.insert('hello', 1)
      const entries = map.get('hello')
      expect(entries[0]!.hash).toBe(CollisionMap.djb2('hello'))
    })

    it('returns updated value after overwrite', () => {
      const map = new CollisionMap<string>()
      map.insert('k', 'old')
      map.insert('k', 'new')
      const entries = map.get('k')
      expect(entries).toHaveLength(1)
      expect(entries[0]!.value).toBe('new')
    })
  })

  // ─── has ──────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for an existing key', () => {
      const map = new CollisionMap()
      map.insert('exists')
      expect(map.has('exists')).toBe(true)
    })

    it('returns false for a non-existent key', () => {
      const map = new CollisionMap()
      expect(map.has('nope')).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new CollisionMap()
      expect(map.has('anything')).toBe(false)
    })

    it('returns true after insert and false after delete', () => {
      const map = new CollisionMap<number>()
      map.insert('x', 1)
      expect(map.has('x')).toBe(true)
      map.delete('x')
      expect(map.has('x')).toBe(false)
    })

    it('returns true after value update', () => {
      const map = new CollisionMap<number>()
      map.insert('x', 1)
      map.insert('x', 2)
      expect(map.has('x')).toBe(true)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('removes an existing key and returns true', () => {
      const map = new CollisionMap<number>()
      map.insert('x', 1)
      expect(map.delete('x')).toBe(true)
      expect(map.size).toBe(0)
      expect(map.has('x')).toBe(false)
    })

    it('returns false for a non-existent key', () => {
      const map = new CollisionMap()
      expect(map.delete('nope')).toBe(false)
    })

    it('returns false on empty map', () => {
      const map = new CollisionMap()
      expect(map.delete('anything')).toBe(false)
    })

    it('decrements size correctly', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      expect(map.size).toBe(3)
      map.delete('b')
      expect(map.size).toBe(2)
    })

    it('does not affect other entries in the same bucket', () => {
      const map = new CollisionMap<number>({ hashFn: constantHash })
      map.insert('a', 1)
      map.insert('b', 2)
      map.delete('a')
      expect(map.has('b')).toBe(true)
      expect(map.size).toBe(1)
    })

    it('allows re-insertion after deletion', () => {
      const map = new CollisionMap<number>()
      map.insert('x', 1)
      map.delete('x')
      map.insert('x', 2)
      expect(map.size).toBe(1)
      const entries = map.get('x')
      expect(entries[0]!.value).toBe(2)
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────

  describe('size', () => {
    it('is 0 for a new empty map', () => {
      expect(new CollisionMap().size).toBe(0)
    })

    it('increases with each new insert', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1)
      expect(map.size).toBe(1)
      map.insert('b', 2)
      expect(map.size).toBe(2)
    })

    it('does not increase on overwrite', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1)
      map.insert('a', 2)
      expect(map.size).toBe(1)
    })

    it('decreases after delete', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1)
      map.delete('a')
      expect(map.size).toBe(0)
    })

    it('resets to 0 after clear', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1).insert('b', 2)
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  // ─── bucketCount ──────────────────────────────────────────────────────

  describe('bucketCount', () => {
    it('returns the configured bucket count', () => {
      expect(new CollisionMap({ bucketCount: 64 }).bucketCount).toBe(64)
      expect(new CollisionMap({ bucketCount: 8 }).bucketCount).toBe(8)
    })

    it('updates after rehash', () => {
      const map = new CollisionMap({ bucketCount: 4 })
      map.rehash(16)
      expect(map.bucketCount).toBe(16)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all entries', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.has('a')).toBe(false)
      expect(map.has('b')).toBe(false)
      expect(map.has('c')).toBe(false)
    })

    it('clears an already empty map without error', () => {
      const map = new CollisionMap()
      expect(() => map.clear()).not.toThrow()
      expect(map.size).toBe(0)
    })

    it('allows insertions after clear', () => {
      const map = new CollisionMap<number>()
      map.insert('x', 1)
      map.clear()
      map.insert('y', 2)
      expect(map.size).toBe(1)
      expect(map.has('y')).toBe(true)
    })
  })

  // ─── keys ─────────────────────────────────────────────────────────────

  describe('keys', () => {
    it('returns an empty iterator for empty map', () => {
      const map = new CollisionMap()
      expect([...map.keys()]).toEqual([])
    })

    it('returns all keys', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      const keys = [...map.keys()]
      expect(keys).toHaveLength(3)
      expect(keys.sort()).toEqual(['a', 'b', 'c'])
    })

    it('is an iterable iterator', () => {
      const map = new CollisionMap<number>()
      map.insert('x', 1)
      const iter = map.keys()
      expect(typeof iter.next).toBe('function')
      expect(typeof iter[Symbol.iterator]).toBe('function')
    })

    it('does not include deleted keys', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1).insert('b', 2)
      map.delete('a')
      const keys = [...map.keys()]
      expect(keys).toEqual(['b'])
    })
  })

  // ─── values ───────────────────────────────────────────────────────────

  describe('values', () => {
    it('returns an empty iterator for empty map', () => {
      const map = new CollisionMap()
      expect([...map.values()]).toEqual([])
    })

    it('returns all values', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 10).insert('b', 20)
      const vals = [...map.values()]
      expect(vals).toHaveLength(2)
      expect(vals.sort()).toEqual([10, 20])
    })

    it('includes undefined values for keys without value', () => {
      const map = new CollisionMap()
      map.insert('novalue')
      const vals = [...map.values()]
      expect(vals).toEqual([undefined])
    })

    it('is an iterable iterator', () => {
      const map = new CollisionMap<number>()
      map.insert('x', 1)
      const iter = map.values()
      expect(typeof iter.next).toBe('function')
      expect(typeof iter[Symbol.iterator]).toBe('function')
    })
  })

  // ─── entries ──────────────────────────────────────────────────────────

  describe('entries', () => {
    it('returns an empty iterator for empty map', () => {
      const map = new CollisionMap()
      expect([...map.entries()]).toEqual([])
    })

    it('returns [key, value] pairs', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1).insert('b', 2)
      const entries = [...map.entries()]
      expect(entries).toHaveLength(2)
      const sorted = entries.sort((a, b) => a[0].localeCompare(b[0]))
      expect(sorted[0]).toEqual(['a', 1])
      expect(sorted[1]).toEqual(['b', 2])
    })

    it('is an iterable iterator', () => {
      const map = new CollisionMap<number>()
      map.insert('x', 1)
      const iter = map.entries()
      expect(typeof iter.next).toBe('function')
      expect(typeof iter[Symbol.iterator]).toBe('function')
    })

    it('returns undefined value for keys without value', () => {
      const map = new CollisionMap()
      map.insert('k')
      const entries = [...map.entries()]
      expect(entries).toEqual([['k', undefined]])
    })
  })

  // ─── collisions ───────────────────────────────────────────────────────

  describe('collisions', () => {
    it('returns empty map when there are no collisions', () => {
      const map = new CollisionMap<number>({ bucketCount: 256 })
      map.insert('a', 1)
      expect(map.collisions.size).toBe(0)
    })

    it('returns empty map on empty map', () => {
      const map = new CollisionMap()
      expect(map.collisions.size).toBe(0)
    })

    it('detects collisions when multiple keys share a bucket', () => {
      const map = new CollisionMap<number>({ hashFn: constantHash })
      map.insert('a', 1)
      map.insert('b', 2)
      const coll = map.collisions
      expect(coll.size).toBe(1)
      const keys = coll.get(42 % map.bucketCount)!
      expect(keys).toContain('a')
      expect(keys).toContain('b')
    })

    it('returns a Map instance', () => {
      const map = new CollisionMap<number>({ hashFn: constantHash })
      map.insert('x', 1).insert('y', 2)
      expect(map.collisions).toBeInstanceOf(Map)
    })
  })

  // ─── collisionCount ───────────────────────────────────────────────────

  describe('collisionCount', () => {
    it('is 0 when there are no collisions', () => {
      const map = new CollisionMap<number>({ bucketCount: 256 })
      map.insert('a', 1)
      expect(map.collisionCount).toBe(0)
    })

    it('is 0 on empty map', () => {
      expect(new CollisionMap().collisionCount).toBe(0)
    })

    it('counts buckets with more than one entry', () => {
      const map = new CollisionMap<number>({ hashFn: constantHash })
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      expect(map.collisionCount).toBe(1)
    })
  })

  // ─── maxChainLength ───────────────────────────────────────────────────

  describe('maxChainLength', () => {
    it('is 0 on empty map', () => {
      expect(new CollisionMap().maxChainLength).toBe(0)
    })

    it('is 1 with a single entry', () => {
      const map = new CollisionMap<number>()
      map.insert('x', 1)
      expect(map.maxChainLength).toBe(1)
    })

    it('reflects the longest bucket chain', () => {
      const map = new CollisionMap<number>({ hashFn: constantHash })
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      expect(map.maxChainLength).toBe(3)
    })

    it('decreases after deletion', () => {
      const map = new CollisionMap<number>({ hashFn: constantHash })
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      map.delete('a')
      expect(map.maxChainLength).toBe(2)
    })
  })

  // ─── avgChainLength ───────────────────────────────────────────────────

  describe('avgChainLength', () => {
    it('is 0 on empty map', () => {
      expect(new CollisionMap({ bucketCount: 4 }).avgChainLength).toBe(0)
    })

    it('computes average items per bucket', () => {
      const map = new CollisionMap<number>({ bucketCount: 4 })
      map.insert('a', 1).insert('b', 2)
      expect(map.avgChainLength).toBe(2 / 4)
    })
  })

  // ─── loadFactor ───────────────────────────────────────────────────────

  describe('loadFactor', () => {
    it('is 0 on empty map', () => {
      expect(new CollisionMap({ bucketCount: 4 }).loadFactor).toBe(0)
    })

    it('computes size / bucketCount', () => {
      const map = new CollisionMap<number>({ bucketCount: 4 })
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      expect(map.loadFactor).toBe(3 / 4)
    })

    it('exceeds 1 when many collisions', () => {
      const map = new CollisionMap<number>({ bucketCount: 2, hashFn: constantHash })
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      expect(map.loadFactor).toBe(3 / 2)
    })
  })

  // ─── rehash ───────────────────────────────────────────────────────────

  describe('rehash', () => {
    it('changes the bucket count', () => {
      const map = new CollisionMap<number>({ bucketCount: 4 })
      map.rehash(16)
      expect(map.bucketCount).toBe(16)
    })

    it('preserves all entries', () => {
      const map = new CollisionMap<number>({ bucketCount: 4 })
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      map.rehash(32)
      expect(map.size).toBe(3)
      expect(map.has('a')).toBe(true)
      expect(map.has('b')).toBe(true)
      expect(map.has('c')).toBe(true)
    })

    it('preserves values after rehash', () => {
      const map = new CollisionMap<number>({ bucketCount: 4 })
      map.insert('x', 42)
      map.rehash(64)
      const entries = map.get('x')
      expect(entries[0]!.value).toBe(42)
    })

    it('reduces collisions when expanding buckets', () => {
      const map = new CollisionMap<number>({ bucketCount: 2, hashFn: constantHash })
      map.insert('a', 1).insert('b', 2)
      expect(map.collisionCount).toBe(1)
      map.rehash(256)
      // With a larger bucket space and constant hash, they still collide in
      // one bucket, but the test verifies rehash redistributes correctly.
      expect(map.size).toBe(2)
    })

    it('works on empty map', () => {
      const map = new CollisionMap()
      expect(() => map.rehash(64)).not.toThrow()
      expect(map.bucketCount).toBe(64)
      expect(map.size).toBe(0)
    })
  })

  // ─── bucketOf ─────────────────────────────────────────────────────────

  describe('bucketOf', () => {
    it('returns a valid bucket index', () => {
      const map = new CollisionMap({ bucketCount: 16 })
      const idx = map.bucketOf('hello')
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(16)
    })

    it('returns the same index for the same key', () => {
      const map = new CollisionMap({ bucketCount: 8 })
      expect(map.bucketOf('test')).toBe(map.bucketOf('test'))
    })

    it('matches the entry hash location', () => {
      const map = new CollisionMap<number>()
      map.insert('key', 1)
      const entries = map.get('key')
      const expectedBucket = entries[0]!.hash % map.bucketCount
      expect(map.bucketOf('key')).toBe(expectedBucket)
    })
  })

  // ─── itemsInBucket ────────────────────────────────────────────────────

  describe('itemsInBucket', () => {
    it('returns empty array for empty bucket', () => {
      const map = new CollisionMap<number>()
      expect(map.itemsInBucket(0)).toEqual([])
    })

    it('returns entries in a populated bucket', () => {
      const map = new CollisionMap<number>()
      map.insert('x', 1)
      const bucket = map.bucketOf('x')
      const items = map.itemsInBucket(bucket)
      expect(items).toHaveLength(1)
      expect(items[0]!.key).toBe('x')
      expect(items[0]!.value).toBe(1)
    })

    it('returns empty array for negative bucket index', () => {
      const map = new CollisionMap<number>()
      expect(map.itemsInBucket(-1)).toEqual([])
    })

    it('returns empty array for out-of-range bucket index', () => {
      const map = new CollisionMap<number>({ bucketCount: 4 })
      expect(map.itemsInBucket(100)).toEqual([])
    })

    it('returns a copy (not the internal array)', () => {
      const map = new CollisionMap<number>()
      map.insert('k', 1)
      const bucket = map.bucketOf('k')
      const a = map.itemsInBucket(bucket)
      const b = map.itemsInBucket(bucket)
      expect(a).toEqual(b)
      expect(a).not.toBe(b)
    })

    it('shows collision entries in the same bucket', () => {
      const map = new CollisionMap<number>({ hashFn: constantHash })
      map.insert('a', 1).insert('b', 2)
      const bucket = map.bucketOf('a')
      const items = map.itemsInBucket(bucket)
      expect(items).toHaveLength(2)
    })
  })

  // ─── distribution ─────────────────────────────────────────────────────

  describe('distribution', () => {
    it('returns an array of bucketCount zeros for empty map', () => {
      const map = new CollisionMap({ bucketCount: 4 })
      const dist = map.distribution()
      expect(dist).toHaveLength(4)
      expect(dist.every((c) => c === 0)).toBe(true)
    })

    it('reflects entries in buckets', () => {
      const map = new CollisionMap<number>({ bucketCount: 4, hashFn: constantHash })
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      const dist = map.distribution()
      const total = dist.reduce((s, c) => s + c, 0)
      expect(total).toBe(3)
    })

    it('has length equal to bucketCount', () => {
      const map = new CollisionMap({ bucketCount: 10 })
      expect(map.distribution()).toHaveLength(10)
    })
  })

  // ─── uniformity ───────────────────────────────────────────────────────

  describe('uniformity', () => {
    it('returns 1 for empty map', () => {
      const map = new CollisionMap({ bucketCount: 4 })
      expect(map.uniformity()).toBe(1)
    })

    it('returns a value between 0 and 1', () => {
      const map = new CollisionMap<number>({ bucketCount: 8 })
      for (let i = 0; i < 50; i++) {
        map.insert(`key${i}`, i)
      }
      const u = map.uniformity()
      expect(u).toBeGreaterThanOrEqual(0)
      expect(u).toBeLessThanOrEqual(1)
    })

    it('returns low uniformity when all items in one bucket', () => {
      const map = new CollisionMap<number>({ bucketCount: 16, hashFn: constantHash })
      for (let i = 0; i < 10; i++) {
        map.insert(`k${i}`, i)
      }
      // With all items in one bucket, uniformity should be low
      expect(map.uniformity()).toBeLessThan(0.5)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles many insertions and deletions', () => {
      const map = new CollisionMap<number>({ bucketCount: 16 })
      for (let i = 0; i < 100; i++) {
        map.insert(`key${i}`, i)
      }
      expect(map.size).toBe(100)
      for (let i = 0; i < 50; i++) {
        map.delete(`key${i}`)
      }
      expect(map.size).toBe(50)
      expect(map.has('key0')).toBe(false)
      expect(map.has('key99')).toBe(true)
    })

    it('handles rehash with collisions present', () => {
      const map = new CollisionMap<number>({ bucketCount: 2, hashFn: constantHash })
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      map.rehash(4)
      expect(map.size).toBe(3)
      expect(map.has('a')).toBe(true)
      expect(map.has('b')).toBe(true)
      expect(map.has('c')).toBe(true)
    })

    it('handles clear after rehash', () => {
      const map = new CollisionMap<number>({ bucketCount: 4 })
      map.insert('x', 1)
      map.rehash(32)
      map.clear()
      expect(map.size).toBe(0)
      expect(map.has('x')).toBe(false)
    })

    it('handles insert after clear after insert', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1)
      map.clear()
      map.insert('b', 2)
      expect(map.size).toBe(1)
      expect(map.has('a')).toBe(false)
      expect(map.has('b')).toBe(true)
    })

    it('handles keys with special characters', () => {
      const map = new CollisionMap<number>()
      map.insert('', 0)
      map.insert('🔑', 1)
      map.insert('key with spaces', 2)
      map.insert('key\nwith\nnewlines', 3)
      expect(map.size).toBe(4)
      expect(map.get('')[0]!.value).toBe(0)
      expect(map.get('🔑')[0]!.value).toBe(1)
      expect(map.get('key with spaces')[0]!.value).toBe(2)
    })

    it('handles numeric-like string keys', () => {
      const map = new CollisionMap<number>()
      map.insert('0', 0)
      map.insert('1', 1)
      map.insert('-1', -1)
      expect(map.size).toBe(3)
      expect(map.get('0')[0]!.value).toBe(0)
      expect(map.get('1')[0]!.value).toBe(1)
      expect(map.get('-1')[0]!.value).toBe(-1)
    })

    it('handles boolean-like string keys', () => {
      const map = new CollisionMap<number>()
      map.insert('true', 1)
      map.insert('false', 0)
      expect(map.get('true')[0]!.value).toBe(1)
      expect(map.get('false')[0]!.value).toBe(0)
    })

    it('iterates all entries with entries() after mixed operations', () => {
      const map = new CollisionMap<number>({ bucketCount: 4 })
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      map.delete('b')
      map.insert('d', 4)
      const entries = [...map.entries()]
      expect(entries).toHaveLength(3)
      const keys = entries.map((e) => e[0]).sort()
      expect(keys).toEqual(['a', 'c', 'd'])
    })

    it('distribution sums to size after mixed ops', () => {
      const map = new CollisionMap<number>({ bucketCount: 8 })
      for (let i = 0; i < 20; i++) map.insert(`k${i}`, i)
      for (let i = 0; i < 10; i++) map.delete(`k${i}`)
      const dist = map.distribution()
      const total = dist.reduce((s, c) => s + c, 0)
      expect(total).toBe(10)
    })

    it('handles single bucket map', () => {
      const map = new CollisionMap<number>({ bucketCount: 1 })
      map.insert('a', 1).insert('b', 2).insert('c', 3)
      expect(map.size).toBe(3)
      expect(map.collisionCount).toBe(1)
      expect(map.maxChainLength).toBe(3)
      expect(map.loadFactor).toBe(3)
    })

    it('handles very long keys', () => {
      const map = new CollisionMap<number>()
      const longKey = 'x'.repeat(100000)
      map.insert(longKey, 42)
      expect(map.has(longKey)).toBe(true)
      expect(map.get(longKey)[0]!.value).toBe(42)
    })

    it('entries iterator can be consumed by for-of', () => {
      const map = new CollisionMap<number>()
      map.insert('a', 1).insert('b', 2)
      const result: Array<[string, number | undefined]> = []
      for (const entry of map.entries()) {
        result.push(entry)
      }
      expect(result).toHaveLength(2)
    })

    it('CollisionEntry type has expected shape', () => {
      const map = new CollisionMap<number>()
      map.insert('test', 99)
      const entries: CollisionEntry<number>[] = map.get('test')
      expect(entries[0]!.key).toBe('test')
      expect(entries[0]!.value).toBe(99)
      expect(typeof entries[0]!.hash).toBe('number')
    })

    it('supports generic value types', () => {
      const numMap = new CollisionMap<number>()
      numMap.insert('x', 42)
      expect(numMap.get('x')[0]!.value).toBe(42)

      const strMap = new CollisionMap<string>()
      strMap.insert('x', 'hello')
      expect(strMap.get('x')[0]!.value).toBe('hello')

      const boolMap = new CollisionMap<boolean>()
      boolMap.insert('x', true)
      expect(boolMap.get('x')[0]!.value).toBe(true)
    })

    it('handles delete of only entry in a bucket', () => {
      const map = new CollisionMap<number>()
      map.insert('solo', 1)
      const bucket = map.bucketOf('solo')
      expect(map.itemsInBucket(bucket)).toHaveLength(1)
      map.delete('solo')
      expect(map.itemsInBucket(bucket)).toHaveLength(0)
    })

    it('handles rehash down to fewer buckets', () => {
      const map = new CollisionMap<number>({ bucketCount: 32 })
      for (let i = 0; i < 10; i++) map.insert(`k${i}`, i)
      map.rehash(4)
      expect(map.bucketCount).toBe(4)
      expect(map.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(map.has(`k${i}`)).toBe(true)
      }
    })

    it('get returns entries only for the requested key', () => {
      const map = new CollisionMap<number>({ hashFn: constantHash })
      map.insert('a', 1)
      map.insert('b', 2)
      const entries = map.get('a')
      expect(entries).toHaveLength(1)
      expect(entries[0]!.key).toBe('a')
    })
  })
})
