import { CuckooBloomFilter, DEFAULT_CUCKOO_BLOOM_OPTIONS } from '../src/core/cuckoo-bloom/cuckoo-bloom.js'
import type { CuckooBloomOptions } from '../src/core/cuckoo-bloom/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CuckooBloomFilter', () => {
  describe('constructor', () => {
    it('creates a filter with default options', () => {
      const filter = new CuckooBloomFilter()
      expect(filter.capacity).toBe(DEFAULT_CUCKOO_BLOOM_OPTIONS.capacity)
      expect(filter.size).toBe(0)
    })

    it('creates a filter with custom capacity', () => {
      const filter = new CuckooBloomFilter(512)
      expect(filter.capacity).toBe(512)
    })

    it('creates a filter with all custom parameters', () => {
      const filter = new CuckooBloomFilter(256, 12, 8, 100)
      expect(filter.capacity).toBe(256)
      expect(filter.size).toBe(0)
    })

    it('creates a filter with minimal capacity', () => {
      const filter = new CuckooBloomFilter(4)
      expect(filter.capacity).toBe(4)
    })

    it('creates a filter with small bucket size', () => {
      const filter = new CuckooBloomFilter(16, 8, 2, 50)
      expect(filter.capacity).toBe(16)
    })
  })

  // ─── add ──────────────────────────────────────────────────────────────

  describe('add', () => {
    it('adds a single item and returns true', () => {
      const filter = new CuckooBloomFilter<string>()
      expect(filter.add('hello')).toBe(true)
    })

    it('increments size after adding an item', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('hello')
      expect(filter.size).toBe(1)
    })

    it('adds multiple distinct items', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size).toBe(3)
    })

    it('adds the same item twice and increments size both times', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('hello')
      filter.add('hello')
      expect(filter.size).toBe(2)
    })

    it('adds numeric items using generic type', () => {
      const filter = new CuckooBloomFilter<number>(100)
      expect(filter.add(42)).toBe(true)
      expect(filter.add(100)).toBe(true)
      expect(filter.size).toBe(2)
    })

    it('adds object items by serializing them', () => {
      const filter = new CuckooBloomFilter<{ id: number }>(100)
      expect(filter.add({ id: 1 })).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('adds many items up to a reasonable capacity', () => {
      const filter = new CuckooBloomFilter<string>(512)
      let added = 0
      for (let i = 0; i < 100; i++) {
        if (filter.add(`item-${i}`)) added++
      }
      expect(added).toBe(100)
      expect(filter.size).toBe(100)
    })

    it('returns boolean for add operations', () => {
      const filter = new CuckooBloomFilter<string>(100)
      const result = filter.add('test')
      expect(typeof result).toBe('boolean')
    })

    it('adds items with empty string', () => {
      const filter = new CuckooBloomFilter<string>()
      expect(filter.add('')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('adds items with special characters', () => {
      const filter = new CuckooBloomFilter<string>()
      expect(filter.add('hello world! @#$%')).toBe(true)
      expect(filter.add('emoji 🎉')).toBe(true)
      expect(filter.size).toBe(2)
    })

    it('adds items with unicode strings', () => {
      const filter = new CuckooBloomFilter<string>()
      expect(filter.add('日本語')).toBe(true)
      expect(filter.add('Ñoño')).toBe(true)
      expect(filter.size).toBe(2)
    })
  })

  // ─── contains ─────────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns true for an added item', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('hello')
      expect(filter.contains('hello')).toBe(true)
    })

    it('returns false for an item not in the filter', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('hello')
      expect(filter.contains('world')).toBe(false)
    })

    it('returns false on an empty filter', () => {
      const filter = new CuckooBloomFilter<string>()
      expect(filter.contains('anything')).toBe(false)
    })

    it('returns true for multiple added items', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.contains('a')).toBe(true)
      expect(filter.contains('b')).toBe(true)
      expect(filter.contains('c')).toBe(true)
    })

    it('returns true for numeric items', () => {
      const filter = new CuckooBloomFilter<number>(100)
      filter.add(42)
      expect(filter.contains(42)).toBe(true)
      expect(filter.contains(99)).toBe(false)
    })

    it('handles object items with same structure', () => {
      const filter = new CuckooBloomFilter<{ id: number }>(100)
      filter.add({ id: 1 })
      // JSON.stringify matches, so this should contain
      expect(filter.contains({ id: 1 })).toBe(true)
    })

    it('returns false for object with different structure', () => {
      const filter = new CuckooBloomFilter<{ id: number }>(100)
      filter.add({ id: 1 })
      expect(filter.contains({ id: 2 })).toBe(false)
    })

    it('returns true for empty string if added', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('')
      expect(filter.contains('')).toBe(true)
    })

    it('returns false for empty string if not added', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('nonempty')
      expect(filter.contains('')).toBe(false)
    })

    it('returns true after adding same item twice', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('dup')
      filter.add('dup')
      expect(filter.contains('dup')).toBe(true)
    })
  })

  // ─── remove ───────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes an existing item and returns true', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('hello')
      expect(filter.remove('hello')).toBe(true)
    })

    it('decrements size after removing', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('hello')
      filter.remove('hello')
      expect(filter.size).toBe(0)
    })

    it('returns false for non-existent item', () => {
      const filter = new CuckooBloomFilter<string>()
      expect(filter.remove('nope')).toBe(false)
    })

    it('does not change size when removing non-existent item', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('hello')
      filter.remove('world')
      expect(filter.size).toBe(1)
    })

    it('removes one instance of a duplicate item', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('dup')
      filter.add('dup')
      expect(filter.size).toBe(2)
      filter.remove('dup')
      expect(filter.size).toBe(1)
      // Item should still be found (one copy remains)
      expect(filter.contains('dup')).toBe(true)
    })

    it('removes from a filter with many items', () => {
      const filter = new CuckooBloomFilter<string>(256)
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size).toBe(50)
      expect(filter.remove('item-25')).toBe(true)
      expect(filter.size).toBe(49)
      expect(filter.contains('item-25')).toBe(false)
    })

    it('returns false on empty filter', () => {
      const filter = new CuckooBloomFilter<string>()
      expect(filter.remove('anything')).toBe(false)
    })

    it('removes numeric items', () => {
      const filter = new CuckooBloomFilter<number>(100)
      filter.add(42)
      expect(filter.remove(42)).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('remove then add the same item again', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.add('hello')
      filter.remove('hello')
      expect(filter.size).toBe(0)
      expect(filter.contains('hello')).toBe(false)
      filter.add('hello')
      expect(filter.size).toBe(1)
      expect(filter.contains('hello')).toBe(true)
    })
  })

  // ─── size ─────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for a new filter', () => {
      const filter = new CuckooBloomFilter<string>()
      expect(filter.size).toBe(0)
    })

    it('tracks size through adds', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('a')
      expect(filter.size).toBe(1)
      filter.add('b')
      expect(filter.size).toBe(2)
      filter.add('c')
      expect(filter.size).toBe(3)
    })

    it('tracks size through removes', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.size).toBe(1)
    })

    it('tracks size through add-remove-add cycles', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('x')
      expect(filter.size).toBe(1)
      filter.remove('x')
      expect(filter.size).toBe(0)
      filter.add('y')
      expect(filter.size).toBe(1)
    })
  })

  // ─── capacity ─────────────────────────────────────────────────────────

  describe('capacity', () => {
    it('returns the configured capacity', () => {
      const filter = new CuckooBloomFilter<string>(500)
      expect(filter.capacity).toBe(500)
    })

    it('returns default capacity when not specified', () => {
      const filter = new CuckooBloomFilter<string>()
      expect(filter.capacity).toBe(DEFAULT_CUCKOO_BLOOM_OPTIONS.capacity)
    })

    it('does not change after adding items', () => {
      const filter = new CuckooBloomFilter<string>(100)
      filter.add('test')
      expect(filter.capacity).toBe(100)
    })
  })

  // ─── falsePositiveRate ────────────────────────────────────────────────

  describe('falsePositiveRate', () => {
    it('returns 0 for empty filter', () => {
      const filter = new CuckooBloomFilter<string>()
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('returns a number between 0 and 1 after adding items', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('test')
      const fpr = filter.falsePositiveRate
      expect(fpr).toBeGreaterThan(0)
      expect(fpr).toBeLessThanOrEqual(1)
    })

    it('increases with smaller fingerprint size', () => {
      const filterSmall = new CuckooBloomFilter<string>(256, 4, 4, 500)
      const filterLarge = new CuckooBloomFilter<string>(256, 16, 4, 500)
      filterSmall.add('test')
      filterLarge.add('test')
      expect(filterSmall.falsePositiveRate).toBeGreaterThan(filterLarge.falsePositiveRate)
    })

    it('is calculated consistently for the same parameters', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('a')
      const fpr1 = filter.falsePositiveRate
      filter.add('b')
      // FPR is a static property based on fingerprint size and bucket size
      // not on number of items (it's the theoretical rate)
      expect(filter.falsePositiveRate).toBe(fpr1)
    })

    it('depends on fingerprint size and bucket size', () => {
      const filter = new CuckooBloomFilter<string>(256, 8, 4, 500)
      filter.add('x')
      // fpr = 1 - (1 - 2^-8)^4 ≈ 1 - 0.99609375^4
      const expectedFpr = 1 - Math.pow(1 - Math.pow(2, -8), 4)
      expect(filter.falsePositiveRate).toBeCloseTo(expectedFpr, 10)
    })
  })

  // ─── fillRatio ────────────────────────────────────────────────────────

  describe('fillRatio', () => {
    it('returns 0 for empty filter', () => {
      const filter = new CuckooBloomFilter<string>()
      expect(filter.fillRatio).toBe(0)
    })

    it('returns a value between 0 and 1 after adding items', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('test')
      expect(filter.fillRatio).toBeGreaterThan(0)
      expect(filter.fillRatio).toBeLessThanOrEqual(1)
    })

    it('increases as more items are added', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('a')
      const ratio1 = filter.fillRatio
      filter.add('b')
      const ratio2 = filter.fillRatio
      expect(ratio2).toBeGreaterThan(ratio1)
    })

    it('decreases after removing items', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('a')
      filter.add('b')
      const ratioAfterAdds = filter.fillRatio
      filter.remove('a')
      const ratioAfterRemove = filter.fillRatio
      expect(ratioAfterRemove).toBeLessThan(ratioAfterAdds)
    })

    it('returns 0 after clearing', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('test')
      filter.clear()
      expect(filter.fillRatio).toBe(0)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('resets size to 0', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('a')
      filter.add('b')
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('makes contains return false for previously added items', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('hello')
      filter.clear()
      expect(filter.contains('hello')).toBe(false)
    })

    it('allows adding items after clearing', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('first')
      filter.clear()
      filter.add('second')
      expect(filter.size).toBe(1)
      expect(filter.contains('second')).toBe(true)
    })

    it('clears an already empty filter without error', () => {
      const filter = new CuckooBloomFilter<string>()
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('clears a filter with many items', () => {
      const filter = new CuckooBloomFilter<string>(512)
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size).toBe(100)
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.contains('item-0')).toBe(false)
      expect(filter.contains('item-99')).toBe(false)
    })
  })

  // ─── toString ─────────────────────────────────────────────────────────

  describe('toString', () => {
    it('returns a string representation with capacity and size', () => {
      const filter = new CuckooBloomFilter<string>(100)
      filter.add('test')
      const str = filter.toString()
      expect(str).toContain('CuckooBloomFilter')
      expect(str).toContain('capacity: 100')
      expect(str).toContain('size: 1')
    })

    it('includes fillRatio in output', () => {
      const filter = new CuckooBloomFilter<string>(100)
      filter.add('test')
      const str = filter.toString()
      expect(str).toContain('fillRatio:')
    })

    it('includes falsePositiveRate in output', () => {
      const filter = new CuckooBloomFilter<string>(100)
      filter.add('test')
      const str = filter.toString()
      expect(str).toContain('falsePositiveRate:')
    })

    it('shows size 0 for empty filter', () => {
      const filter = new CuckooBloomFilter<string>(100)
      const str = filter.toString()
      expect(str).toContain('size: 0')
    })

    it('formats fillRatio to 4 decimal places', () => {
      const filter = new CuckooBloomFilter<string>(100)
      const str = filter.toString()
      // fillRatio for empty filter is 0.0000
      expect(str).toContain('fillRatio: 0.0000')
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy with same size', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('a')
      filter.add('b')
      const cloned = filter.clone()
      expect(cloned.size).toBe(filter.size)
    })

    it('creates a copy with same capacity', () => {
      const filter = new CuckooBloomFilter<string>(200)
      const cloned = filter.clone()
      expect(cloned.capacity).toBe(filter.capacity)
    })

    it('modifications to clone do not affect original', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('shared')
      const cloned = filter.clone()
      cloned.add('extra')
      expect(filter.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('removal from clone does not affect original', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('shared')
      const cloned = filter.clone()
      cloned.remove('shared')
      expect(filter.contains('shared')).toBe(true)
      expect(cloned.contains('shared')).toBe(false)
    })

    it('clone of empty filter has size 0', () => {
      const filter = new CuckooBloomFilter<string>()
      const cloned = filter.clone()
      expect(cloned.size).toBe(0)
    })

    it('clone preserves containment results', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('alpha')
      filter.add('beta')
      const cloned = filter.clone()
      expect(cloned.contains('alpha')).toBe(true)
      expect(cloned.contains('beta')).toBe(true)
      expect(cloned.contains('gamma')).toBe(false)
    })

    it('clone preserves falsePositiveRate', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('x')
      const cloned = filter.clone()
      expect(cloned.falsePositiveRate).toBe(filter.falsePositiveRate)
    })

    it('clone preserves fillRatio', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('x')
      const cloned = filter.clone()
      expect(cloned.fillRatio).toBe(filter.fillRatio)
    })

    it('clone of a clone works correctly', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('item')
      const cloned1 = filter.clone()
      const cloned2 = cloned1.clone()
      expect(cloned2.size).toBe(1)
      expect(cloned2.contains('item')).toBe(true)
    })
  })

  // ─── DEFAULT_CUCKOO_BLOOM_OPTIONS ─────────────────────────────────────

  describe('DEFAULT_CUCKOO_BLOOM_OPTIONS', () => {
    it('has correct default capacity', () => {
      expect(DEFAULT_CUCKOO_BLOOM_OPTIONS.capacity).toBe(1024)
    })

    it('has correct default fingerprintSize', () => {
      expect(DEFAULT_CUCKOO_BLOOM_OPTIONS.fingerprintSize).toBe(8)
    })

    it('has correct default bucketSize', () => {
      expect(DEFAULT_CUCKOO_BLOOM_OPTIONS.bucketSize).toBe(4)
    })

    it('has correct default maxKicks', () => {
      expect(DEFAULT_CUCKOO_BLOOM_OPTIONS.maxKicks).toBe(500)
    })

    it('all values are numbers', () => {
      expect(typeof DEFAULT_CUCKOO_BLOOM_OPTIONS.capacity).toBe('number')
      expect(typeof DEFAULT_CUCKOO_BLOOM_OPTIONS.fingerprintSize).toBe('number')
      expect(typeof DEFAULT_CUCKOO_BLOOM_OPTIONS.bucketSize).toBe('number')
      expect(typeof DEFAULT_CUCKOO_BLOOM_OPTIONS.maxKicks).toBe('number')
    })
  })

  // ─── CuckooBloomOptions Type ──────────────────────────────────────────

  describe('CuckooBloomOptions type', () => {
    it('can be used to create an options object', () => {
      const options: CuckooBloomOptions = {
        capacity: 512,
        fingerprintSize: 12,
        bucketSize: 6,
        maxKicks: 300,
      }
      expect(options.capacity).toBe(512)
      expect(options.fingerprintSize).toBe(12)
      expect(options.bucketSize).toBe(6)
      expect(options.maxKicks).toBe(300)
    })
  })

  // ─── add + remove + contains integration ──────────────────────────────

  describe('add / remove / contains integration', () => {
    it('full lifecycle: add, check, remove, verify', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('item1')
      expect(filter.contains('item1')).toBe(true)
      filter.remove('item1')
      expect(filter.contains('item1')).toBe(false)
      expect(filter.size).toBe(0)
    })

    it('handles many items with add and contains', () => {
      const filter = new CuckooBloomFilter<string>(1024)
      const items: string[] = []
      for (let i = 0; i < 200; i++) {
        const item = `item-${i}`
        items.push(item)
        filter.add(item)
      }
      for (const item of items) {
        expect(filter.contains(item)).toBe(true)
      }
    })

    it('add-remove-readd pattern', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('x')
      expect(filter.size).toBe(1)
      filter.remove('x')
      expect(filter.size).toBe(0)
      filter.add('x')
      expect(filter.size).toBe(1)
      expect(filter.contains('x')).toBe(true)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles very small capacity', () => {
      const filter = new CuckooBloomFilter<string>(4, 8, 2, 10)
      filter.add('a')
      filter.add('b')
      expect(filter.size).toBe(2)
      expect(filter.contains('a')).toBe(true)
      expect(filter.contains('b')).toBe(true)
    })

    it('handles large fingerprint size', () => {
      const filter = new CuckooBloomFilter<string>(256, 32, 4, 500)
      filter.add('test')
      expect(filter.contains('test')).toBe(true)
      expect(filter.falsePositiveRate).toBeCloseTo(1 - Math.pow(1 - Math.pow(2, -32), 4), 10)
    })

    it('handles null-like JSON values correctly', () => {
      const filter = new CuckooBloomFilter<string>(100)
      filter.add('null')
      expect(filter.contains('null')).toBe(true)
    })

    it('handles boolean-like string values', () => {
      const filter = new CuckooBloomFilter<string>(100)
      filter.add('true')
      filter.add('false')
      expect(filter.contains('true')).toBe(true)
      expect(filter.contains('false')).toBe(true)
    })

    it('clear followed by many adds works', () => {
      const filter = new CuckooBloomFilter<string>(256)
      for (let i = 0; i < 50; i++) filter.add(`old-${i}`)
      filter.clear()
      for (let i = 0; i < 50; i++) filter.add(`new-${i}`)
      expect(filter.size).toBe(50)
      expect(filter.contains('new-0')).toBe(true)
      expect(filter.contains('old-0')).toBe(false)
    })

    it('clone after clear works', () => {
      const filter = new CuckooBloomFilter<string>(256)
      filter.add('test')
      filter.clear()
      const cloned = filter.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.contains('test')).toBe(false)
    })

    it('filter with different generic types works', () => {
      const numFilter = new CuckooBloomFilter<number>(100)
      numFilter.add(1)
      numFilter.add(2)
      expect(numFilter.contains(1)).toBe(true)
      expect(numFilter.contains(3)).toBe(false)

      const boolFilter = new CuckooBloomFilter<boolean>(100)
      boolFilter.add(true)
      expect(boolFilter.contains(true)).toBe(true)
      expect(boolFilter.contains(false)).toBe(false)
    })

    it('fillRatio after full clear and refill', () => {
      const filter = new CuckooBloomFilter<string>(64)
      for (let i = 0; i < 20; i++) filter.add(`item-${i}`)
      const ratioFull = filter.fillRatio
      filter.clear()
      expect(filter.fillRatio).toBe(0)
      for (let i = 0; i < 5; i++) filter.add(`new-${i}`)
      const ratioPartial = filter.fillRatio
      expect(ratioPartial).toBeGreaterThan(0)
      expect(ratioPartial).toBeLessThan(ratioFull)
    })

    it('toString after operations reflects current state', () => {
      const filter = new CuckooBloomFilter<string>(100)
      filter.add('test')
      const str1 = filter.toString()
      expect(str1).toContain('size: 1')
      filter.remove('test')
      const str2 = filter.toString()
      expect(str2).toContain('size: 0')
    })

    it('handles rapid add and remove cycles', () => {
      const filter = new CuckooBloomFilter<string>(256)
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 10; i++) {
          filter.add(`r${round}-item-${i}`)
        }
        for (let i = 0; i < 10; i++) {
          filter.remove(`r${round}-item-${i}`)
        }
      }
      expect(filter.size).toBe(0)
    })

    it('multiple clears in succession work', () => {
      const filter = new CuckooBloomFilter<string>(100)
      filter.add('a')
      filter.clear()
      filter.clear()
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('add after failed removal still works', () => {
      const filter = new CuckooBloomFilter<string>(100)
      filter.remove('nonexistent') // no-op
      filter.add('real')
      expect(filter.size).toBe(1)
      expect(filter.contains('real')).toBe(true)
    })

    it('handles deeply nested JSON objects', () => {
      const filter = new CuckooBloomFilter<{ a: { b: { c: number } } }>(100)
      const obj = { a: { b: { c: 42 } } }
      filter.add(obj)
      expect(filter.contains({ a: { b: { c: 42 } } })).toBe(true)
    })
  })

  // ─── Stress / Scale ───────────────────────────────────────────────────

  describe('stress and scale', () => {
    it('handles a large number of unique string items', () => {
      const filter = new CuckooBloomFilter<string>(2048)
      const count = 500
      for (let i = 0; i < count; i++) {
        filter.add(`unique-item-${i}-${Math.random()}`)
      }
      expect(filter.size).toBe(count)
    })

    it('handles a large number of numeric items', () => {
      const filter = new CuckooBloomFilter<number>(2048)
      for (let i = 0; i < 500; i++) {
        filter.add(i)
      }
      expect(filter.size).toBe(500)
    })

    it('handles batch add then batch remove', () => {
      const filter = new CuckooBloomFilter<string>(1024)
      const items: string[] = []
      for (let i = 0; i < 100; i++) {
        items.push(`batch-${i}`)
        filter.add(`batch-${i}`)
      }
      expect(filter.size).toBe(100)
      for (const item of items) {
        filter.remove(item)
      }
      expect(filter.size).toBe(0)
    })
  })
})
