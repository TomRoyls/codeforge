import { CuckooSet, DEFAULT_CUCKOO_SET_OPTIONS } from '../src/core/cuckoo-set/cuckoo-set.js'
import type { CuckooSetOptions, CuckooStats } from '../src/core/cuckoo-set/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CuckooSet', () => {
  describe('constructor', () => {
    it('creates an empty set with default capacity', () => {
      const set = new CuckooSet<string>()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
      expect(set.capacity).toBe(DEFAULT_CUCKOO_SET_OPTIONS.capacity)
    })

    it('creates a set with a numeric capacity', () => {
      const set = new CuckooSet<string>(64)
      expect(set.capacity).toBe(64)
      expect(set.size).toBe(0)
    })

    it('clamps capacity to minimum of 2 when given 0', () => {
      const set = new CuckooSet<string>(0)
      expect(set.capacity).toBe(2)
    })

    it('clamps capacity to minimum of 2 when given 1', () => {
      const set = new CuckooSet<string>(1)
      expect(set.capacity).toBe(2)
    })

    it('clamps capacity to minimum of 2 when given negative', () => {
      const set = new CuckooSet<string>(-10)
      expect(set.capacity).toBe(2)
    })

    it('creates a set with options object', () => {
      const set = new CuckooSet<string>({ capacity: 32, maxKicks: 100 })
      expect(set.capacity).toBe(32)
    })

    it('uses default maxKicks when only capacity is provided', () => {
      const set = new CuckooSet<string>(32)
      // maxKicks is private, we can verify behavior indirectly via add
      expect(set.capacity).toBe(32)
    })

    it('uses defaults when empty options object is given', () => {
      const set = new CuckooSet<string>({})
      expect(set.capacity).toBe(DEFAULT_CUCKOO_SET_OPTIONS.capacity)
    })

    it('uses default capacity when only maxKicks is in options', () => {
      const set = new CuckooSet<string>({ maxKicks: 50 })
      expect(set.capacity).toBe(DEFAULT_CUCKOO_SET_OPTIONS.capacity)
    })

    it('clamps capacity from options to minimum of 2', () => {
      const set = new CuckooSet<string>({ capacity: -5 })
      expect(set.capacity).toBe(2)
    })
  })

  // ─── add ──────────────────────────────────────────────────────────────

  describe('add', () => {
    it('adds a value and returns true', () => {
      const set = new CuckooSet<string>()
      expect(set.add('hello')).toBe(true)
      expect(set.size).toBe(1)
    })

    it('returns false when adding a duplicate', () => {
      const set = new CuckooSet<string>()
      set.add('hello')
      expect(set.add('hello')).toBe(false)
      expect(set.size).toBe(1)
    })

    it('adds multiple distinct values', () => {
      const set = new CuckooSet<string>()
      expect(set.add('a')).toBe(true)
      expect(set.add('b')).toBe(true)
      expect(set.add('c')).toBe(true)
      expect(set.size).toBe(3)
    })

    it('handles numeric values', () => {
      const set = new CuckooSet<number>()
      set.add(1)
      set.add(2)
      set.add(3)
      expect(set.size).toBe(3)
      expect(set.has(2)).toBe(true)
    })

    it('handles number 0 as a valid value', () => {
      const set = new CuckooSet<number>()
      expect(set.add(0)).toBe(true)
      expect(set.has(0)).toBe(true)
      expect(set.size).toBe(1)
    })

    it('handles empty string as a value', () => {
      const set = new CuckooSet<string>()
      expect(set.add('')).toBe(true)
      expect(set.has('')).toBe(true)
    })

    it('handles boolean-like string values', () => {
      const set = new CuckooSet<string>()
      set.add('true')
      set.add('false')
      expect(set.has('true')).toBe(true)
      expect(set.has('false')).toBe(true)
    })

    it('handles objects via stringification', () => {
      const set = new CuckooSet<{ id: number }>()
      const obj = { id: 1 }
      set.add(obj)
      expect(set.size).toBe(1)
    })

    it('triggers rehash when table is full', () => {
      const set = new CuckooSet<number>(4)
      // Add more items than capacity to force rehash
      for (let i = 0; i < 20; i++) {
        set.add(i)
      }
      expect(set.size).toBe(20)
      expect(set.capacity).toBeGreaterThan(4)
    })

    it('adds values that fill both tables', () => {
      const set = new CuckooSet<string>(16)
      for (let i = 0; i < 8; i++) {
        set.add(`item-${i}`)
      }
      expect(set.size).toBe(8)
      const stats = set.stats()
      expect(stats.table1Occupancy + stats.table2Occupancy).toBe(8)
    })
  })

  // ─── has / contains ───────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for existing value', () => {
      const set = new CuckooSet<string>()
      set.add('test')
      expect(set.has('test')).toBe(true)
    })

    it('returns false for non-existing value', () => {
      const set = new CuckooSet<string>()
      set.add('test')
      expect(set.has('other')).toBe(false)
    })

    it('returns false on empty set', () => {
      const set = new CuckooSet<string>()
      expect(set.has('anything')).toBe(false)
    })

    it('finds values after multiple adds', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
    })

    it('does not find deleted values', () => {
      const set = new CuckooSet<string>()
      set.add('target')
      set.delete('target')
      expect(set.has('target')).toBe(false)
    })
  })

  describe('contains', () => {
    it('returns true for existing value (alias for has)', () => {
      const set = new CuckooSet<string>()
      set.add('hello')
      expect(set.contains('hello')).toBe(true)
    })

    it('returns false for non-existing value (alias for has)', () => {
      const set = new CuckooSet<string>()
      expect(set.contains('missing')).toBe(false)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('removes an existing value and returns true', () => {
      const set = new CuckooSet<string>()
      set.add('remove-me')
      expect(set.delete('remove-me')).toBe(true)
      expect(set.size).toBe(0)
    })

    it('returns false for non-existing value', () => {
      const set = new CuckooSet<string>()
      expect(set.delete('ghost')).toBe(false)
    })

    it('returns false on empty set', () => {
      const set = new CuckooSet<string>()
      expect(set.delete('anything')).toBe(false)
    })

    it('only removes the targeted value', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      set.delete('b')
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(false)
      expect(set.has('c')).toBe(true)
      expect(set.size).toBe(2)
    })

    it('can remove all values one by one', () => {
      const set = new CuckooSet<string>()
      set.add('x')
      set.add('y')
      set.add('z')
      expect(set.delete('x')).toBe(true)
      expect(set.delete('y')).toBe(true)
      expect(set.delete('z')).toBe(true)
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('allows re-adding a deleted value', () => {
      const set = new CuckooSet<string>()
      set.add('recyclable')
      set.delete('recyclable')
      expect(set.add('recyclable')).toBe(true)
      expect(set.size).toBe(1)
      expect(set.has('recyclable')).toBe(true)
    })

    it('handles deletion with numeric values', () => {
      const set = new CuckooSet<number>()
      set.add(42)
      expect(set.delete(42)).toBe(true)
      expect(set.delete(42)).toBe(false)
    })
  })

  // ─── size / isEmpty ───────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size is 0 for empty set', () => {
      const set = new CuckooSet<string>()
      expect(set.size).toBe(0)
    })

    it('isEmpty returns true for empty set', () => {
      const set = new CuckooSet<string>()
      expect(set.isEmpty()).toBe(true)
    })

    it('size increments with each unique add', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      expect(set.size).toBe(1)
      set.add('b')
      expect(set.size).toBe(2)
      set.add('c')
      expect(set.size).toBe(3)
    })

    it('size does not increment on duplicate add', () => {
      const set = new CuckooSet<string>()
      set.add('dup')
      set.add('dup')
      expect(set.size).toBe(1)
    })

    it('size decrements on delete', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.delete('a')
      expect(set.size).toBe(1)
    })

    it('isEmpty returns false after add', () => {
      const set = new CuckooSet<string>()
      set.add('x')
      expect(set.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after removing all', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.delete('a')
      expect(set.isEmpty()).toBe(true)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all elements', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      set.clear()
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('makes all previous values inaccessible', () => {
      const set = new CuckooSet<string>()
      set.add('gone')
      set.clear()
      expect(set.has('gone')).toBe(false)
    })

    it('clear on already empty set is a no-op', () => {
      const set = new CuckooSet<string>()
      set.clear()
      expect(set.size).toBe(0)
    })

    it('allows adding after clear', () => {
      const set = new CuckooSet<string>()
      set.add('before')
      set.clear()
      set.add('after')
      expect(set.size).toBe(1)
      expect(set.has('after')).toBe(true)
      expect(set.has('before')).toBe(false)
    })

    it('preserves capacity after clear', () => {
      const set = new CuckooSet<string>(32)
      set.add('a')
      set.clear()
      expect(set.capacity).toBe(32)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      const cloned = set.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.has('a')).toBe(true)
      expect(cloned.has('b')).toBe(true)
    })

    it('modifications to clone do not affect original', () => {
      const set = new CuckooSet<string>()
      set.add('shared')
      const cloned = set.clone()
      cloned.add('new')
      expect(set.has('new')).toBe(false)
      expect(cloned.has('new')).toBe(true)
    })

    it('modifications to original do not affect clone', () => {
      const set = new CuckooSet<string>()
      set.add('shared')
      const cloned = set.clone()
      set.delete('shared')
      expect(cloned.has('shared')).toBe(true)
    })

    it('clones empty set', () => {
      const set = new CuckooSet<string>()
      const cloned = set.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('preserves capacity in clone', () => {
      const set = new CuckooSet<string>(64)
      set.add('x')
      const cloned = set.clone()
      expect(cloned.capacity).toBe(64)
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty set', () => {
      const set = new CuckooSet<string>()
      expect(set.toArray()).toEqual([])
    })

    it('returns all added values', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.add('c')
      const arr = set.toArray()
      expect(arr.sort()).toEqual(['a', 'b', 'c'])
    })

    it('does not include deleted values', () => {
      const set = new CuckooSet<string>()
      set.add('a')
      set.add('b')
      set.delete('a')
      expect(set.toArray()).toEqual(['b'])
    })

    it('returns a new array each time', () => {
      const set = new CuckooSet<string>()
      set.add('x')
      const a1 = set.toArray()
      const a2 = set.toArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })

    it('returns values from both tables', () => {
      const set = new CuckooSet<string>(8)
      for (let i = 0; i < 6; i++) {
        set.add(`v${i}`)
      }
      const arr = set.toArray()
      expect(arr.sort()).toEqual(['v0', 'v1', 'v2', 'v3', 'v4', 'v5'])
    })
  })

  // ─── static from ──────────────────────────────────────────────────────

  describe('static from', () => {
    it('creates a set from an array', () => {
      const set = CuckooSet.from(['a', 'b', 'c'])
      expect(set.size).toBe(3)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
    })

    it('creates a set from an empty array', () => {
      const set = CuckooSet.from([])
      expect(set.size).toBe(0)
      expect(set.isEmpty()).toBe(true)
    })

    it('creates a set with custom capacity', () => {
      const set = CuckooSet.from(['a', 'b'], 64)
      expect(set.capacity).toBe(64)
    })

    it('deduplicates items from source', () => {
      const set = CuckooSet.from(['a', 'b', 'a', 'c', 'b'])
      expect(set.size).toBe(3)
    })

    it('creates a set from a Set iterable', () => {
      const source = new Set([1, 2, 3])
      const set = CuckooSet.from(source)
      expect(set.size).toBe(3)
      expect(set.has(2)).toBe(true)
    })

    it('creates a set from a generator', () => {
      function* gen() {
        yield 10
        yield 20
        yield 30
      }
      const set = CuckooSet.from(gen())
      expect(set.size).toBe(3)
      expect(set.has(20)).toBe(true)
    })

    it('uses auto-sized capacity when none specified', () => {
      const set = CuckooSet.from([1, 2, 3])
      // capacity = max(2, arr.length * 2) = 6
      expect(set.capacity).toBe(6)
    })
  })

  // ─── forEach ──────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all values', () => {
      const set = new CuckooSet<string>()
      set.add('x')
      set.add('y')
      set.add('z')
      const collected: string[] = []
      set.forEach((v) => collected.push(v))
      expect(collected.sort()).toEqual(['x', 'y', 'z'])
    })

    it('does not call callback on empty set', () => {
      const set = new CuckooSet<string>()
      let count = 0
      set.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates exactly size times', () => {
      const set = new CuckooSet<number>()
      for (let i = 0; i < 10; i++) set.add(i)
      let count = 0
      set.forEach(() => count++)
      expect(count).toBe(10)
    })

    it('only visits occupied slots (not deleted)', () => {
      const set = new CuckooSet<string>()
      set.add('keep')
      set.add('remove')
      set.delete('remove')
      const collected: string[] = []
      set.forEach((v) => collected.push(v))
      expect(collected).toEqual(['keep'])
    })
  })

  // ─── capacity / loadFactor ────────────────────────────────────────────

  describe('capacity and loadFactor', () => {
    it('capacity returns configured capacity', () => {
      const set = new CuckooSet<string>(128)
      expect(set.capacity).toBe(128)
    })

    it('loadFactor is 0 for empty set', () => {
      const set = new CuckooSet<string>()
      expect(set.loadFactor).toBe(0)
    })

    it('loadFactor increases with adds', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      expect(set.loadFactor).toBe(1 / 16)
      set.add('b')
      expect(set.loadFactor).toBe(2 / 16)
    })

    it('loadFactor decreases with deletes', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      set.add('b')
      set.delete('a')
      expect(set.loadFactor).toBe(1 / 16)
    })

    it('capacity changes after rehash', () => {
      const set = new CuckooSet<number>(4)
      for (let i = 0; i < 20; i++) set.add(i)
      expect(set.capacity).toBeGreaterThan(4)
    })
  })

  // ─── rehash ───────────────────────────────────────────────────────────

  describe('rehash', () => {
    it('preserves all elements after rehash', () => {
      const set = new CuckooSet<string>(16)
      for (let i = 0; i < 8; i++) set.add(`item-${i}`)
      set.rehash(64)
      expect(set.size).toBe(8)
      for (let i = 0; i < 8; i++) {
        expect(set.has(`item-${i}`)).toBe(true)
      }
    })

    it('updates capacity to new value', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      set.rehash(128)
      expect(set.capacity).toBe(128)
    })

    it('clamps new capacity to minimum of 2', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      set.rehash(-5)
      expect(set.capacity).toBe(2)
    })

    it('rehash with no argument uses current capacity', () => {
      const set = new CuckooSet<string>(32)
      set.add('a')
      set.add('b')
      set.rehash()
      expect(set.capacity).toBe(32)
      expect(set.size).toBe(2)
    })

    it('rehash on empty set works without error', () => {
      const set = new CuckooSet<string>()
      set.rehash(64)
      expect(set.size).toBe(0)
      expect(set.capacity).toBe(64)
    })

    it('rehash changes internal seeds so lookups still work', () => {
      const set = new CuckooSet<string>(16)
      set.add('alpha')
      set.add('beta')
      set.add('gamma')
      set.rehash(32)
      expect(set.has('alpha')).toBe(true)
      expect(set.has('beta')).toBe(true)
      expect(set.has('gamma')).toBe(true)
      expect(set.has('delta')).toBe(false)
    })
  })

  // ─── stats ────────────────────────────────────────────────────────────

  describe('stats', () => {
    it('returns correct stats for empty set', () => {
      const set = new CuckooSet<string>(16)
      const stats = set.stats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(16)
      expect(stats.loadFactor).toBe(0)
      expect(stats.maxChainLength).toBe(0)
      expect(stats.table1Occupancy).toBe(0)
      expect(stats.table2Occupancy).toBe(0)
      expect(stats.resizeCount).toBe(0)
    })

    it('returns updated stats after adds', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      set.add('b')
      set.add('c')
      const stats = set.stats()
      expect(stats.size).toBe(3)
      expect(stats.table1Occupancy + stats.table2Occupancy).toBe(3)
    })

    it('returns updated stats after deletes', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      set.add('b')
      set.delete('a')
      const stats = set.stats()
      expect(stats.size).toBe(1)
      expect(stats.table1Occupancy + stats.table2Occupancy).toBe(1)
    })

    it('loadFactor in stats matches getter', () => {
      const set = new CuckooSet<string>(16)
      set.add('x')
      const stats = set.stats()
      expect(stats.loadFactor).toBe(set.loadFactor)
    })

    it('capacity in stats matches getter', () => {
      const set = new CuckooSet<string>(32)
      const stats = set.stats()
      expect(stats.capacity).toBe(set.capacity)
    })

    it('stats are consistent after clear', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      set.add('b')
      set.clear()
      const stats = set.stats()
      expect(stats.size).toBe(0)
      expect(stats.table1Occupancy).toBe(0)
      expect(stats.table2Occupancy).toBe(0)
      expect(stats.maxChainLength).toBe(0)
    })
  })

  // ─── DEFAULT_CUCKOO_SET_OPTIONS ───────────────────────────────────────

  describe('DEFAULT_CUCKOO_SET_OPTIONS', () => {
    it('has capacity of 16', () => {
      expect(DEFAULT_CUCKOO_SET_OPTIONS.capacity).toBe(16)
    })

    it('has maxKicks of 500', () => {
      expect(DEFAULT_CUCKOO_SET_OPTIONS.maxKicks).toBe(500)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles small capacity (2)', () => {
      const set = new CuckooSet<string>(2)
      set.add('a')
      set.add('b')
      expect(set.size).toBe(2)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
    })

    it('handles single element lifecycle', () => {
      const set = new CuckooSet<string>()
      expect(set.add('only')).toBe(true)
      expect(set.has('only')).toBe(true)
      expect(set.size).toBe(1)
      expect(set.delete('only')).toBe(true)
      expect(set.has('only')).toBe(false)
      expect(set.size).toBe(0)
    })

    it('handles add-delete-add cycle', () => {
      const set = new CuckooSet<string>()
      set.add('x')
      set.delete('x')
      expect(set.add('x')).toBe(true)
      expect(set.has('x')).toBe(true)
    })

    it('handles many add-delete cycles', () => {
      const set = new CuckooSet<string>(32)
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 10; i++) {
          set.add(`r${round}-v${i}`)
        }
        for (let i = 0; i < 10; i++) {
          set.delete(`r${round}-v${i}`)
        }
        expect(set.size).toBe(0)
      }
    })

    it('handles values with special characters', () => {
      const set = new CuckooSet<string>()
      set.add('hello world')
      set.add('🚀')
      set.add('a\nb')
      set.add('')
      expect(set.has('hello world')).toBe(true)
      expect(set.has('🚀')).toBe(true)
      expect(set.has('a\nb')).toBe(true)
      expect(set.has('')).toBe(true)
    })

    it('handles very long strings', () => {
      const set = new CuckooSet<string>()
      const longStr = 'x'.repeat(10000)
      set.add(longStr)
      expect(set.has(longStr)).toBe(true)
    })

    it('handles numeric string collisions', () => {
      const set = new CuckooSet<string>()
      set.add('1')
      set.add('2')
      set.add('3')
      expect(set.has('1')).toBe(true)
      expect(set.has('2')).toBe(true)
      expect(set.has('3')).toBe(true)
      expect(set.has('4')).toBe(false)
    })

    it('handles mixed type strings', () => {
      const set = new CuckooSet<string>()
      set.add('undefined')
      set.add('null')
      set.add('NaN')
      set.add('Infinity')
      expect(set.size).toBe(4)
      expect(set.has('undefined')).toBe(true)
      expect(set.has('null')).toBe(true)
    })

    it('clone then add preserves both sets independently', () => {
      const set = new CuckooSet<string>(16)
      set.add('base')
      const cloned = set.clone()
      set.add('orig-only')
      cloned.add('clone-only')
      expect(set.has('clone-only')).toBe(false)
      expect(cloned.has('orig-only')).toBe(false)
      expect(set.has('base')).toBe(true)
      expect(cloned.has('base')).toBe(true)
    })

    it('from + toArray roundtrip', () => {
      const original = ['apple', 'banana', 'cherry', 'date']
      const set = CuckooSet.from(original)
      const arr = set.toArray().sort()
      expect(arr).toEqual([...original].sort())
    })

    it('from with duplicate input preserves uniqueness', () => {
      const set = CuckooSet.from(['a', 'a', 'a'])
      expect(set.size).toBe(1)
    })

    it('large set operations', () => {
      const set = new CuckooSet<number>(64)
      for (let i = 0; i < 200; i++) {
        set.add(i)
      }
      expect(set.size).toBe(200)
      for (let i = 0; i < 200; i++) {
        expect(set.has(i)).toBe(true)
      }
      for (let i = 0; i < 100; i++) {
        set.delete(i)
      }
      expect(set.size).toBe(100)
      for (let i = 100; i < 200; i++) {
        expect(set.has(i)).toBe(true)
      }
      for (let i = 0; i < 100; i++) {
        expect(set.has(i)).toBe(false)
      }
    })

    it('forEach collects correct count after mixed ops', () => {
      const set = new CuckooSet<string>(16)
      set.add('a')
      set.add('b')
      set.add('c')
      set.delete('b')
      set.add('d')
      let count = 0
      set.forEach(() => count++)
      expect(count).toBe(3)
    })

    it('clear then re-populate', () => {
      const set = new CuckooSet<string>(16)
      for (let i = 0; i < 10; i++) set.add(`old-${i}`)
      set.clear()
      for (let i = 0; i < 5; i++) set.add(`new-${i}`)
      expect(set.size).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(set.has(`new-${i}`)).toBe(true)
      }
      for (let i = 0; i < 10; i++) {
        expect(set.has(`old-${i}`)).toBe(false)
      }
    })

    it('rehash with smaller capacity preserves data', () => {
      const set = new CuckooSet<string>(64)
      set.add('a')
      set.add('b')
      set.add('c')
      set.rehash(8)
      expect(set.size).toBe(3)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
    })

    it('stats returns all required fields', () => {
      const set = new CuckooSet<string>(16)
      const stats: CuckooStats = set.stats()
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('capacity')
      expect(stats).toHaveProperty('loadFactor')
      expect(stats).toHaveProperty('maxChainLength')
      expect(stats).toHaveProperty('table1Occupancy')
      expect(stats).toHaveProperty('table2Occupancy')
      expect(stats).toHaveProperty('resizeCount')
    })

    it('adding and checking many similar strings', () => {
      const set = new CuckooSet<string>(64)
      const values: string[] = []
      for (let i = 0; i < 50; i++) {
        const v = `key-${i.toString().padStart(3, '0')}`
        values.push(v)
        set.add(v)
      }
      for (const v of values) {
        expect(set.has(v)).toBe(true)
      }
      expect(set.size).toBe(50)
    })
  })
})
