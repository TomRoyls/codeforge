import { describe, it, expect } from 'vitest'
import { ExtendibleHashTable } from '../../src/core/extendible-hashing/index.js'

describe('ExtendibleHashTable', () => {
  describe('constructor', () => {
    it('creates empty table with defaults', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('creates with custom bucket size', () => {
      const t = new ExtendibleHashTable<string, number>({ bucketSize: 2 })
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      expect(t.size).toBe(3)
    })

    it('creates with custom hash function', () => {
      const t = new ExtendibleHashTable<string, number>({
        hashFunction: (key) => {
          let h = 0
          for (let i = 0; i < key.length; i++) {
            h = (h * 31 + key.charCodeAt(i)) | 0
          }
          return h >>> 0
        },
      })
      t.put('hello', 1)
      expect(t.get('hello')).toBe(1)
    })

    it('creates with bucket size 1', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 1 })
      t.put(1, 'a')
      t.put(2, 'b')
      expect(t.size).toBe(2)
    })

    it('creates with large bucket size', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 100 })
      t.put(1, 'a')
      expect(t.size).toBe(1)
    })

    it('accepts both options simultaneously', () => {
      const t = new ExtendibleHashTable<number, string>({
        bucketSize: 2,
        hashFunction: (k) => k * 2654435761 >>> 0,
      })
      t.put(1, 'x')
      t.put(2, 'y')
      expect(t.get(1)).toBe('x')
      expect(t.get(2)).toBe('y')
    })
  })

  describe('put', () => {
    it('inserts single entry', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('key', 42)
      expect(t.size).toBe(1)
      expect(t.isEmpty()).toBe(false)
    })

    it('inserts multiple entries', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      expect(t.size).toBe(3)
    })

    it('overwrites existing key', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('key', 1)
      t.put('key', 2)
      expect(t.size).toBe(1)
      expect(t.get('key')).toBe(2)
    })

    it('handles duplicate puts without growing size', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('x', 10)
      t.put('x', 20)
      t.put('x', 30)
      expect(t.size).toBe(1)
      expect(t.get('x')).toBe(30)
    })

    it('triggers directory growth on overflow', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 2 })
      for (let i = 0; i < 20; i++) {
        t.put(i, `v${i}`)
      }
      expect(t.size).toBe(20)
      const stats = t.getStats()
      expect(stats.globalDepth).toBeGreaterThanOrEqual(1)
    })

    it('handles many insertions', () => {
      const t = new ExtendibleHashTable<number, number>()
      for (let i = 0; i < 100; i++) {
        t.put(i, i * 10)
      }
      expect(t.size).toBe(100)
    })

    it('handles negative keys', () => {
      const t = new ExtendibleHashTable<number, string>()
      t.put(-1, 'neg')
      t.put(-100, 'neg100')
      expect(t.get(-1)).toBe('neg')
      expect(t.get(-100)).toBe('neg100')
    })

    it('handles zero key', () => {
      const t = new ExtendibleHashTable<number, string>()
      t.put(0, 'zero')
      expect(t.get(0)).toBe('zero')
    })

    it('handles object-like string keys', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('user:1', 100)
      t.put('user:2', 200)
      expect(t.get('user:1')).toBe(100)
      expect(t.get('user:2')).toBe(200)
    })

    it('handles empty string key', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('', 999)
      expect(t.get('')).toBe(999)
    })

    it('preserves all values after many inserts', () => {
      const t = new ExtendibleHashTable<number, number>({ bucketSize: 2 })
      for (let i = 0; i < 50; i++) {
        t.put(i, i * 2)
      }
      for (let i = 0; i < 50; i++) {
        expect(t.get(i)).toBe(i * 2)
      }
    })

    it('handles keys that hash to same bucket', () => {
      let callCount = 0
      const t = new ExtendibleHashTable<string, number>({
        hashFunction: () => { callCount++; return 0 },
        bucketSize: 4,
      })
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      t.put('d', 4)
      t.put('e', 5)
      expect(t.size).toBe(5)
    })

    it('updates value for key in bucket with other entries', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      t.put('a', 99)
      expect(t.get('a')).toBe(99)
      expect(t.size).toBe(2)
    })
  })

  describe('get', () => {
    it('returns undefined for missing key', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect(t.get('missing')).toBeUndefined()
    })

    it('returns value for existing key', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('key', 42)
      expect(t.get('key')).toBe(42)
    })

    it('returns undefined on empty table', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect(t.get('anything')).toBeUndefined()
    })

    it('retrieves after many inserts', () => {
      const t = new ExtendibleHashTable<number, string>()
      for (let i = 0; i < 50; i++) {
        t.put(i, `val${i}`)
      }
      for (let i = 0; i < 50; i++) {
        expect(t.get(i)).toBe(`val${i}`)
      }
    })

    it('returns updated value after overwrite', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('k', 1)
      expect(t.get('k')).toBe(1)
      t.put('k', 2)
      expect(t.get('k')).toBe(2)
    })

    it('returns undefined after delete', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('k', 1)
      t.delete('k')
      expect(t.get('k')).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('deletes existing key', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('key', 1)
      expect(t.delete('key')).toBe(true)
      expect(t.size).toBe(0)
      expect(t.get('key')).toBeUndefined()
    })

    it('returns false for missing key', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect(t.delete('missing')).toBe(false)
    })

    it('returns false on empty table', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect(t.delete('anything')).toBe(false)
    })

    it('deletes one entry preserves others', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      t.delete('b')
      expect(t.size).toBe(2)
      expect(t.get('a')).toBe(1)
      expect(t.get('c')).toBe(3)
      expect(t.get('b')).toBeUndefined()
    })

    it('delete then reinsert works', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('key', 1)
      t.delete('key')
      t.put('key', 2)
      expect(t.get('key')).toBe(2)
      expect(t.size).toBe(1)
    })

    it('deletes all entries one by one', () => {
      const t = new ExtendibleHashTable<number, string>()
      for (let i = 0; i < 10; i++) {
        t.put(i, `v${i}`)
      }
      for (let i = 0; i < 10; i++) {
        expect(t.delete(i)).toBe(true)
      }
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('handles delete of reinserted key', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('k', 1)
      t.delete('k')
      t.put('k', 2)
      t.delete('k')
      expect(t.get('k')).toBeUndefined()
      expect(t.size).toBe(0)
    })

    it('deletes from middle of bucket', () => {
      const t = new ExtendibleHashTable<string, number>({ bucketSize: 10 })
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      t.delete('b')
      expect(t.get('a')).toBe(1)
      expect(t.get('c')).toBe(3)
      expect(t.has('b')).toBe(false)
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('key', 1)
      expect(t.has('key')).toBe(true)
    })

    it('returns false for missing key', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect(t.has('missing')).toBe(false)
    })

    it('returns false on empty table', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect(t.has('anything')).toBe(false)
    })

    it('returns false after delete', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('key', 1)
      t.delete('key')
      expect(t.has('key')).toBe(false)
    })

    it('returns true for multiple keys', () => {
      const t = new ExtendibleHashTable<number, string>()
      t.put(1, 'a')
      t.put(2, 'b')
      t.put(3, 'c')
      expect(t.has(1)).toBe(true)
      expect(t.has(2)).toBe(true)
      expect(t.has(3)).toBe(true)
      expect(t.has(4)).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for empty table', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect(t.size).toBe(0)
    })

    it('returns correct count after inserts', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      expect(t.size).toBe(3)
    })

    it('does not count overwrites', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('a', 2)
      expect(t.size).toBe(1)
    })

    it('decrements on delete', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      t.delete('a')
      expect(t.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new table', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect(t.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      expect(t.isEmpty()).toBe(false)
    })

    it('returns true after all deletes', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.delete('a')
      expect(t.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      t.clear()
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      t.clear()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('clears empty table without error', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.clear()
      expect(t.size).toBe(0)
    })

    it('allows inserts after clear', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.clear()
      t.put('b', 2)
      expect(t.size).toBe(1)
      expect(t.get('b')).toBe(2)
    })

    it('resets stats after clear', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 2 })
      for (let i = 0; i < 10; i++) {
        t.put(i, `v${i}`)
      }
      t.clear()
      const stats = t.getStats()
      expect(stats.globalDepth).toBe(0)
      expect(stats.directorySize).toBe(1)
      expect(stats.bucketCount).toBe(1)
    })
  })

  describe('entries', () => {
    it('returns empty iterator for empty table', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect([...t.entries()]).toEqual([])
    })

    it('returns all entries', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      const result = [...t.entries()]
      expect(result.length).toBe(3)
    })

    it('does not duplicate entries from shared buckets', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      const result = [...t.entries()]
      expect(result.length).toBe(2)
    })

    it('returns correct key-value pairs', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('x', 10)
      t.put('y', 20)
      const map = new Map(t.entries())
      expect(map.get('x')).toBe(10)
      expect(map.get('y')).toBe(20)
    })
  })

  describe('keys', () => {
    it('returns empty iterator for empty table', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect([...t.keys()]).toEqual([])
    })

    it('returns all keys', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      const keys = [...t.keys()]
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys.length).toBe(2)
    })
  })

  describe('values', () => {
    it('returns empty iterator for empty table', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect([...t.values()]).toEqual([])
    })

    it('returns all values', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      const vals = [...t.values()]
      expect(vals).toContain(1)
      expect(vals).toContain(2)
      expect(vals.length).toBe(2)
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty table', () => {
      const t = new ExtendibleHashTable<string, number>()
      let count = 0
      t.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('iterates all entries', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      const result: [string, number][] = []
      t.forEach((v, k, table) => {
        result.push([k, v])
        expect(table).toBe(t)
      })
      expect(result.length).toBe(3)
    })

    it('passes correct table reference', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('x', 42)
      t.forEach((_v, _k, table) => {
        expect(table).toBe(t)
      })
    })
  })

  describe('getStats', () => {
    it('returns initial stats', () => {
      const t = new ExtendibleHashTable<string, number>()
      const stats = t.getStats()
      expect(stats.globalDepth).toBe(0)
      expect(stats.bucketCount).toBe(1)
      expect(stats.directorySize).toBe(1)
      expect(stats.totalEntries).toBe(0)
    })

    it('shows increased depth after growth', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 2 })
      for (let i = 0; i < 20; i++) {
        t.put(i, `v${i}`)
      }
      const stats = t.getStats()
      expect(stats.globalDepth).toBeGreaterThan(0)
      expect(stats.bucketCount).toBeGreaterThan(1)
      expect(stats.totalEntries).toBe(20)
    })

    it('reports correct totalEntries', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      expect(t.getStats().totalEntries).toBe(3)
    })

    it('directorySize is power of 2', () => {
      const t = new ExtendibleHashTable<number, number>({ bucketSize: 2 })
      for (let i = 0; i < 15; i++) {
        t.put(i, i)
      }
      const stats = t.getStats()
      expect(stats.directorySize & (stats.directorySize - 1)).toBe(0)
    })

    it('bucketCount <= directorySize', () => {
      const t = new ExtendibleHashTable<number, number>({ bucketSize: 2 })
      for (let i = 0; i < 20; i++) {
        t.put(i, i)
      }
      const stats = t.getStats()
      expect(stats.bucketCount).toBeLessThanOrEqual(stats.directorySize)
    })
  })

  describe('growth and directory splitting', () => {
    it('doubles directory when bucket overflows at max depth', () => {
      const t = new ExtendibleHashTable<string, number>({
        hashFunction: () => 5,
        bucketSize: 2,
      })
      t.put('a', 1)
      t.put('b', 2)
      expect(t.getStats().globalDepth).toBe(0)
      t.put('c', 3)
      const stats = t.getStats()
      expect(stats.globalDepth).toBeGreaterThanOrEqual(1)
    })

    it('handles all keys hashing to same value', () => {
      const t = new ExtendibleHashTable<string, number>({
        hashFunction: () => 42,
        bucketSize: 2,
      })
      for (let i = 0; i < 10; i++) {
        t.put(`key${i}`, i)
      }
      expect(t.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(t.get(`key${i}`)).toBe(i)
      }
    })

    it('handles sequential integer keys', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 2 })
      for (let i = 0; i < 100; i++) {
        t.put(i, `v${i}`)
      }
      expect(t.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(t.get(i)).toBe(`v${i}`)
      }
    })

    it('multiple growth cycles', () => {
      const t = new ExtendibleHashTable<number, number>({ bucketSize: 1 })
      for (let i = 0; i < 16; i++) {
        t.put(i, i)
      }
      expect(t.size).toBe(16)
      const stats = t.getStats()
      expect(stats.globalDepth).toBeGreaterThanOrEqual(4)
    })

    it('growth with bucket size 3', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 3 })
      for (let i = 0; i < 30; i++) {
        t.put(i, `v${i}`)
      }
      expect(t.size).toBe(30)
    })
  })

  describe('shrinking', () => {
    it('directory shrinks after deletions', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 2 })
      for (let i = 0; i < 10; i++) {
        t.put(i, `v${i}`)
      }
      const statsAfterInsert = t.getStats()
      for (let i = 0; i < 10; i++) {
        t.delete(i)
      }
      const statsAfterDelete = t.getStats()
      expect(statsAfterDelete.globalDepth).toBeLessThan(statsAfterInsert.globalDepth)
    })

    it('table works correctly after shrink', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 2 })
      t.put(1, 'a')
      t.put(2, 'b')
      t.put(3, 'c')
      t.put(4, 'd')
      t.delete(1)
      t.delete(2)
      t.delete(3)
      t.delete(4)
      expect(t.isEmpty()).toBe(true)
      t.put(5, 'e')
      expect(t.get(5)).toBe('e')
    })

    it('partial delete preserves remaining entries', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 2 })
      for (let i = 0; i < 8; i++) {
        t.put(i, `v${i}`)
      }
      for (let i = 0; i < 6; i++) {
        t.delete(i)
      }
      expect(t.size).toBe(2)
      expect(t.get(6)).toBe('v6')
      expect(t.get(7)).toBe('v7')
    })
  })

  describe('edge cases', () => {
    it('handles undefined value', () => {
      const t = new ExtendibleHashTable<string, number | undefined>()
      t.put('a', undefined)
      expect(t.get('a')).toBeUndefined()
      expect(t.has('a')).toBe(true)
    })

    it('handles null value', () => {
      const t = new ExtendibleHashTable<string, number | null>()
      t.put('a', null)
      expect(t.get('a')).toBeNull()
    })

    it('handles null key', () => {
      const t = new ExtendibleHashTable<string | null, number>()
      t.put(null, 42)
      expect(t.get(null)).toBe(42)
    })

    it('handles boolean values', () => {
      const t = new ExtendibleHashTable<string, boolean>()
      t.put('flag', true)
      t.put('other', false)
      expect(t.get('flag')).toBe(true)
      expect(t.get('other')).toBe(false)
    })

    it('handles object values', () => {
      const t = new ExtendibleHashTable<string, { x: number }>()
      t.put('obj', { x: 42 })
      expect(t.get('obj')?.x).toBe(42)
    })

    it('handles array values', () => {
      const t = new ExtendibleHashTable<string, number[]>()
      t.put('arr', [1, 2, 3])
      expect(t.get('arr')).toEqual([1, 2, 3])
    })

    it('handles large number of keys', () => {
      const t = new ExtendibleHashTable<number, number>({ bucketSize: 4 })
      const n = 500
      for (let i = 0; i < n; i++) {
        t.put(i, i * 3)
      }
      expect(t.size).toBe(n)
      for (let i = 0; i < n; i++) {
        expect(t.get(i)).toBe(i * 3)
      }
    })

    it('handles put-get-delete-put cycle', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('key', 1)
      expect(t.get('key')).toBe(1)
      t.delete('key')
      expect(t.get('key')).toBeUndefined()
      t.put('key', 2)
      expect(t.get('key')).toBe(2)
    })

    it('handles single element table operations', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('only', 42)
      expect(t.has('only')).toBe(true)
      expect(t.delete('only')).toBe(true)
      expect(t.has('only')).toBe(false)
      expect(t.isEmpty()).toBe(true)
    })

    it('survives stress test with random keys', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 3 })
      const map = new Map<number, string>()
      for (let i = 0; i < 200; i++) {
        const k = Math.floor(Math.random() * 100)
        const v = `v${k}`
        t.put(k, v)
        map.set(k, v)
      }
      for (const [k, v] of map) {
        expect(t.get(k)).toBe(v)
      }
      expect(t.size).toBe(map.size)
    })

    it('handles put and delete interleaved', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 2 })
      t.put(1, 'a')
      t.put(2, 'b')
      t.delete(1)
      t.put(3, 'c')
      t.delete(2)
      t.put(4, 'd')
      expect(t.size).toBe(2)
      expect(t.get(3)).toBe('c')
      expect(t.get(4)).toBe('d')
    })
  })

  describe('iterators after mutations', () => {
    it('entries after delete', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      t.delete('b')
      const entries = [...t.entries()]
      expect(entries.length).toBe(2)
      const keys = entries.map((e) => e[0])
      expect(keys).toContain('a')
      expect(keys).toContain('c')
    })

    it('keys after clear and reinsert', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.clear()
      t.put('b', 2)
      expect([...t.keys()]).toEqual(['b'])
    })

    it('values after overwrite', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('a', 99)
      expect([...t.values()]).toEqual([99])
    })
  })

  describe('type generics', () => {
    it('works with string keys and number values', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('1', 1)
      expect(t.get('1')).toBe(1)
    })

    it('works with number keys and string values', () => {
      const t = new ExtendibleHashTable<number, string>()
      t.put(1, 'one')
      expect(t.get(1)).toBe('one')
    })

    it('works with string keys and boolean values', () => {
      const t = new ExtendibleHashTable<string, boolean>()
      t.put('flag', true)
      expect(t.get('flag')).toBe(true)
    })

    it('works with number keys and object values', () => {
      const t = new ExtendibleHashTable<number, { name: string }>()
      t.put(1, { name: 'test' })
      expect(t.get(1)?.name).toBe('test')
    })
  })

  describe('collision handling', () => {
    it('stores multiple keys with same hash in same bucket', () => {
      const t = new ExtendibleHashTable<string, number>({
        hashFunction: () => 0,
        bucketSize: 4,
      })
      t.put('x', 1)
      t.put('y', 2)
      t.put('z', 3)
      t.put('w', 4)
      expect(t.size).toBe(4)
      expect(t.get('x')).toBe(1)
      expect(t.get('y')).toBe(2)
      expect(t.get('z')).toBe(3)
      expect(t.get('w')).toBe(4)
    })

    it('splits bucket when capacity exceeded', () => {
      const t = new ExtendibleHashTable<string, number>({
        hashFunction: () => 0,
        bucketSize: 2,
      })
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      expect(t.size).toBe(3)
      expect(t.get('a')).toBe(1)
      expect(t.get('b')).toBe(2)
      expect(t.get('c')).toBe(3)
    })

    it('handles identical hash with delete', () => {
      const t = new ExtendibleHashTable<string, number>({
        hashFunction: () => 7,
        bucketSize: 3,
      })
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      t.delete('b')
      expect(t.size).toBe(2)
      expect(t.get('a')).toBe(1)
      expect(t.get('c')).toBe(3)
    })
  })

  describe('forEach consistency', () => {
    it('forEach sees all entries after growth', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 2 })
      for (let i = 0; i < 20; i++) {
        t.put(i, `v${i}`)
      }
      let count = 0
      t.forEach(() => { count++ })
      expect(count).toBe(20)
    })

    it('forEach count matches size', () => {
      const t = new ExtendibleHashTable<string, number>()
      t.put('a', 1)
      t.put('b', 2)
      t.put('c', 3)
      let count = 0
      t.forEach(() => { count++ })
      expect(count).toBe(t.size)
    })
  })

  describe('stats consistency', () => {
    it('totalEntries equals size', () => {
      const t = new ExtendibleHashTable<number, number>({ bucketSize: 2 })
      for (let i = 0; i < 30; i++) {
        t.put(i, i * 2)
      }
      expect(t.getStats().totalEntries).toBe(t.size)
    })

    it('totalEntries stays consistent after deletes', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 2 })
      for (let i = 0; i < 10; i++) {
        t.put(i, `v${i}`)
      }
      for (let i = 0; i < 5; i++) {
        t.delete(i)
      }
      expect(t.getStats().totalEntries).toBe(5)
    })

    it('globalDepth never negative', () => {
      const t = new ExtendibleHashTable<number, string>({ bucketSize: 2 })
      for (let i = 0; i < 10; i++) {
        t.put(i, `v${i}`)
      }
      for (let i = 0; i < 10; i++) {
        t.delete(i)
      }
      expect(t.getStats().globalDepth).toBeGreaterThanOrEqual(0)
    })

    it('bucketCount is at least 1', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect(t.getStats().bucketCount).toBeGreaterThanOrEqual(1)
    })

    it('directorySize is at least 1', () => {
      const t = new ExtendibleHashTable<string, number>()
      expect(t.getStats().directorySize).toBeGreaterThanOrEqual(1)
    })
  })
})
