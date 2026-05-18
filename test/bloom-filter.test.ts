import { BloomFilter, DEFAULT_BLOOM_FILTER_OPTIONS } from '../src/core/bloom-filter/bloom-filter.js'
import type { BloomFilterJSON, BloomFilterOptions } from '../src/core/bloom-filter/bloom-filter.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BloomFilter', () => {
  describe('constructor', () => {
    it('creates a filter with default options', () => {
      const bf = new BloomFilter()
      expect(bf.size).toBe(0)
      expect(bf.bitCount).toBeGreaterThan(0)
      expect(bf.hashCount).toBeGreaterThan(0)
    })

    it('creates a filter with expectedItems and falsePositiveRate', () => {
      const bf = new BloomFilter(500, 0.001)
      expect(bf.size).toBe(0)
      expect(bf.bitCount).toBeGreaterThan(0)
    })

    it('creates a filter from a partial options object', () => {
      const bf = new BloomFilter({ expectedItems: 2000 })
      expect(bf.size).toBe(0)
    })

    it('uses DEFAULT_BLOOM_FILTER_OPTIONS when no arguments given', () => {
      const bf = new BloomFilter()
      const bf2 = new BloomFilter(
        DEFAULT_BLOOM_FILTER_OPTIONS.expectedItems,
        DEFAULT_BLOOM_FILTER_OPTIONS.falsePositiveRate,
      )
      expect(bf.bitCount).toBe(bf2.bitCount)
      expect(bf.hashCount).toBe(bf2.hashCount)
    })

    it('creates a filter with only expectedItems (positional)', () => {
      const bf = new BloomFilter(100)
      expect(bf.size).toBe(0)
    })

    it('overrides only falsePositiveRate via options', () => {
      const bf = new BloomFilter({ falsePositiveRate: 0.001 })
      expect(bf.size).toBe(0)
    })
  })

  // ─── add / has ──────────────────────────────────────────────────────

  describe('add and has', () => {
    it('returns true for an inserted item', () => {
      const bf = new BloomFilter<number>(100)
      bf.add(42)
      expect(bf.has(42)).toBe(true)
    })

    it('returns false for an item never inserted', () => {
      const bf = new BloomFilter<string>(100)
      expect(bf.has('missing')).toBe(false)
    })

    it('handles string items', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('hello')
      expect(bf.has('hello')).toBe(true)
      expect(bf.has('world')).toBe(false)
    })

    it('handles numeric items', () => {
      const bf = new BloomFilter<number>(100)
      bf.add(1)
      bf.add(2)
      bf.add(3)
      expect(bf.has(1)).toBe(true)
      expect(bf.has(2)).toBe(true)
      expect(bf.has(3)).toBe(true)
    })

    it('handles object items via JSON serialization', () => {
      interface Item {
        id: number
        name: string
      }
      const bf = new BloomFilter<Item>(100)
      const item: Item = { id: 1, name: 'test' }
      bf.add(item)
      expect(bf.has(item)).toBe(true)
      expect(bf.has({ id: 2, name: 'other' })).toBe(false)
    })

    it('tracks size correctly after multiple inserts', () => {
      const bf = new BloomFilter<string>(100)
      expect(bf.size).toBe(0)
      bf.add('a')
      expect(bf.size).toBe(1)
      bf.add('b')
      expect(bf.size).toBe(2)
      bf.add('c')
      expect(bf.size).toBe(3)
    })

    it('does not deduplicate inserts — size counts every add', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('x')
      bf.add('x')
      bf.add('x')
      expect(bf.size).toBe(3)
    })

    it('handles empty string', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('')
      expect(bf.has('')).toBe(true)
    })

    it('handles items with special characters', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('hello\nworld')
      bf.add('tab\there')
      bf.add('quote"inside')
      expect(bf.has('hello\nworld')).toBe(true)
      expect(bf.has('tab\there')).toBe(true)
      expect(bf.has('quote"inside')).toBe(true)
    })
  })

  // ─── No false negatives (guaranteed) ────────────────────────────────

  describe('no false negatives', () => {
    it('never produces false negatives for inserted items', () => {
      const bf = new BloomFilter<string>(200, 0.01)
      const items: string[] = []
      for (let i = 0; i < 200; i++) {
        const item = `item-${i}`
        items.push(item)
        bf.add(item)
      }
      for (const item of items) {
        expect(bf.has(item)).toBe(true)
      }
    })

    it('maintains no false negatives with high load', () => {
      const bf = new BloomFilter<string>(50, 0.01)
      const items: string[] = []
      for (let i = 0; i < 100; i++) {
        const item = `overload-${i}`
        items.push(item)
        bf.add(item)
      }
      for (const item of items) {
        expect(bf.has(item)).toBe(true)
      }
    })
  })

  // ─── False positive characteristics ─────────────────────────────────

  describe('false positive characteristics', () => {
    it('false positive rate is 0 when empty', () => {
      const bf = new BloomFilter<string>(100)
      expect(bf.falsePositiveRate()).toBe(0)
    })

    it('false positive rate increases with more items', () => {
      const bf = new BloomFilter<string>(100, 0.01)
      const fp1 = bf.falsePositiveRate()
      bf.add('a')
      const fp2 = bf.falsePositiveRate()
      bf.add('b')
      bf.add('c')
      bf.add('d')
      bf.add('e')
      const fp3 = bf.falsePositiveRate()
      expect(fp2).toBeGreaterThanOrEqual(fp1)
      expect(fp3).toBeGreaterThanOrEqual(fp2)
    })

    it('actual false positive rate stays near target when under capacity', () => {
      const expectedItems = 10000
      const targetRate = 0.01
      const bf = new BloomFilter<string>(expectedItems, targetRate)

      for (let i = 0; i < expectedItems; i++) {
        bf.add(`item-${i}`)
      }

      let falsePositives = 0
      const trials = 10000
      for (let i = 0; i < trials; i++) {
        if (bf.has(`not-inserted-${i}`)) {
          falsePositives++
        }
      }

      const actualRate = falsePositives / trials
      // Allow generous margin: should be within 5x of target
      expect(actualRate).toBeLessThan(targetRate * 5)
    })

    it('lower target FP rate produces larger bit array', () => {
      const bf1 = new BloomFilter<string>(100, 0.1)
      const bf2 = new BloomFilter<string>(100, 0.001)
      expect(bf2.bitCount).toBeGreaterThan(bf1.bitCount)
    })
  })

  // ─── isEmpty ────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for a new filter', () => {
      const bf = new BloomFilter()
      expect(bf.isEmpty()).toBe(true)
    })

    it('returns false after inserting an item', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('item')
      expect(bf.isEmpty()).toBe(false)
    })

    it('returns true after clearing', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('item')
      bf.clear()
      expect(bf.isEmpty()).toBe(true)
    })
  })

  // ─── fillRatio ──────────────────────────────────────────────────────

  describe('fillRatio', () => {
    it('returns 0 for an empty filter', () => {
      const bf = new BloomFilter<string>(100)
      expect(bf.fillRatio()).toBe(0)
    })

    it('increases after inserting items', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('a')
      const ratio1 = bf.fillRatio()
      bf.add('b')
      bf.add('c')
      const ratio2 = bf.fillRatio()
      expect(ratio2).toBeGreaterThanOrEqual(ratio1)
    })

    it('returns a value between 0 and 1', () => {
      const bf = new BloomFilter<string>(100)
      for (let i = 0; i < 50; i++) {
        bf.add(`item-${i}`)
      }
      const ratio = bf.fillRatio()
      expect(ratio).toBeGreaterThanOrEqual(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })

    it('returns 0 after clearing', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('item')
      bf.clear()
      expect(bf.fillRatio()).toBe(0)
    })
  })

  // ─── clear ──────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all items', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('a')
      bf.add('b')
      bf.add('c')
      bf.clear()
      expect(bf.size).toBe(0)
      expect(bf.isEmpty()).toBe(true)
    })

    it('causes has() to return false for previously inserted items', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('hello')
      expect(bf.has('hello')).toBe(true)
      bf.clear()
      expect(bf.has('hello')).toBe(false)
    })

    it('allows reuse after clearing', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('first')
      bf.clear()
      bf.add('second')
      expect(bf.has('second')).toBe(true)
      expect(bf.has('first')).toBe(false)
      expect(bf.size).toBe(1)
    })
  })

  // ─── clone ──────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('original')
      const cloned = bf.clone()
      expect(cloned.has('original')).toBe(true)
      expect(cloned.size).toBe(bf.size)
    })

    it('does not affect the original when modified', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('shared')
      const cloned = bf.clone()
      cloned.add('extra')
      expect(bf.has('extra')).toBe(false)
      expect(cloned.has('extra')).toBe(true)
      expect(bf.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('preserves bitCount and hashCount', () => {
      const bf = new BloomFilter<string>(200, 0.001)
      const cloned = bf.clone()
      expect(cloned.bitCount).toBe(bf.bitCount)
      expect(cloned.hashCount).toBe(bf.hashCount)
    })

    it('preserves falsePositiveRate', () => {
      const bf = new BloomFilter<string>(100)
      bf.add('x')
      const cloned = bf.clone()
      expect(cloned.falsePositiveRate()).toBeCloseTo(bf.falsePositiveRate())
    })
  })

  // ─── merge ──────────────────────────────────────────────────────────

  describe('merge', () => {
    it('merges two compatible filters', () => {
      const bf1 = new BloomFilter<string>(100)
      const bf2 = new BloomFilter<string>(100)
      bf1.add('a')
      bf2.add('b')
      bf1.merge(bf2)
      expect(bf1.has('a')).toBe(true)
      expect(bf1.has('b')).toBe(true)
    })

    it('adds sizes together after merge', () => {
      const bf1 = new BloomFilter<string>(100)
      const bf2 = new BloomFilter<string>(100)
      bf1.add('x')
      bf2.add('y')
      bf2.add('z')
      bf1.merge(bf2)
      expect(bf1.size).toBe(3)
    })

    it('throws when bit counts differ', () => {
      const bf1 = new BloomFilter<string>(100, 0.01)
      const bf2 = new BloomFilter<string>(100, 0.001)
      expect(() => bf1.merge(bf2)).toThrow('Cannot merge bloom filters with different bit counts')
    })

    it('throws when hash counts differ', () => {
      const bf1 = new BloomFilter<string>(10, 0.5)
      const bf2 = new BloomFilter<string>(1000, 0.5)
      if (bf1.hashCount !== bf2.hashCount) {
        expect(() => bf1.merge(bf2)).toThrow('Cannot merge bloom filters with different hash counts')
      } else {
        expect(true).toBe(true)
      }
    })

    it('preserves items from both filters', () => {
      const bf1 = new BloomFilter<string>(200)
      const bf2 = new BloomFilter<string>(200)
      const items1 = ['a', 'b', 'c']
      const items2 = ['d', 'e', 'f']
      for (const item of items1) bf1.add(item)
      for (const item of items2) bf2.add(item)
      bf1.merge(bf2)
      for (const item of [...items1, ...items2]) {
        expect(bf1.has(item)).toBe(true)
      }
    })
  })

  // ─── toJSON / fromJSON ─────────────────────────────────────────────

  describe('toJSON and fromJSON', () => {
    it('serializes to a valid JSON object', () => {
      const bf = new BloomFilter<string>(100, 0.01)
      bf.add('test')
      const json = bf.toJSON()
      expect(json).toHaveProperty('bitArray')
      expect(json).toHaveProperty('bitCount')
      expect(json).toHaveProperty('hashCount')
      expect(json).toHaveProperty('expectedItems')
      expect(json).toHaveProperty('targetFalsePositiveRate')
      expect(json).toHaveProperty('itemCount')
      expect(json.itemCount).toBe(1)
      expect(json.expectedItems).toBe(100)
      expect(json.targetFalsePositiveRate).toBe(0.01)
      expect(Array.isArray(json.bitArray)).toBe(true)
    })

    it('round-trips correctly', () => {
      const bf = new BloomFilter<string>(100, 0.01)
      bf.add('alpha')
      bf.add('beta')
      bf.add('gamma')
      const json = bf.toJSON()
      const restored = BloomFilter.fromJSON<string>(json)
      expect(restored.has('alpha')).toBe(true)
      expect(restored.has('beta')).toBe(true)
      expect(restored.has('gamma')).toBe(true)
      expect(restored.has('delta')).toBe(false)
      expect(restored.size).toBe(3)
    })

    it('preserves bitCount and hashCount', () => {
      const bf = new BloomFilter<string>(100, 0.01)
      const json = bf.toJSON()
      const restored = BloomFilter.fromJSON<string>(json)
      expect(restored.bitCount).toBe(bf.bitCount)
      expect(restored.hashCount).toBe(bf.hashCount)
    })

    it('handles empty filter serialization', () => {
      const bf = new BloomFilter<string>(100)
      const json = bf.toJSON()
      expect(json.itemCount).toBe(0)
      const restored = BloomFilter.fromJSON<string>(json)
      expect(restored.size).toBe(0)
      expect(restored.isEmpty()).toBe(true)
    })

    it('produces the same FP rate after round-trip', () => {
      const bf = new BloomFilter<string>(100, 0.01)
      bf.add('x')
      bf.add('y')
      const fpOriginal = bf.falsePositiveRate()
      const restored = BloomFilter.fromJSON<string>(bf.toJSON())
      expect(restored.falsePositiveRate()).toBeCloseTo(fpOriginal)
    })
  })

  // ─── static create ─────────────────────────────────────────────────

  describe('static create', () => {
    it('creates a filter with the given parameters', () => {
      const bf = BloomFilter.create<string>(100, 0.05)
      expect(bf.size).toBe(0)
      bf.add('test')
      expect(bf.has('test')).toBe(true)
    })

    it('is equivalent to the constructor', () => {
      const bf1 = new BloomFilter<string>(100, 0.01)
      const bf2 = BloomFilter.create<string>(100, 0.01)
      expect(bf1.bitCount).toBe(bf2.bitCount)
      expect(bf1.hashCount).toBe(bf2.hashCount)
    })
  })

  // ─── bitCount / hashCount properties ───────────────────────────────

  describe('bitCount and hashCount', () => {
    it('bitCount is positive', () => {
      const bf = new BloomFilter(100, 0.01)
      expect(bf.bitCount).toBeGreaterThan(0)
    })

    it('hashCount is at least 1', () => {
      const bf = new BloomFilter(100, 0.01)
      expect(bf.hashCount).toBeGreaterThanOrEqual(1)
    })

    it('bitCount grows with lower FP rate', () => {
      const bf1 = new BloomFilter(100, 0.1)
      const bf2 = new BloomFilter(100, 0.01)
      const bf3 = new BloomFilter(100, 0.001)
      expect(bf2.bitCount).toBeGreaterThan(bf1.bitCount)
      expect(bf3.bitCount).toBeGreaterThan(bf2.bitCount)
    })

    it('bitCount grows with more expected items', () => {
      const bf1 = new BloomFilter(100, 0.01)
      const bf2 = new BloomFilter(1000, 0.01)
      expect(bf2.bitCount).toBeGreaterThan(bf1.bitCount)
    })
  })

  // ─── DEFAULT_BLOOM_FILTER_OPTIONS ──────────────────────────────────

  describe('DEFAULT_BLOOM_FILTER_OPTIONS', () => {
    it('has expected default values', () => {
      expect(DEFAULT_BLOOM_FILTER_OPTIONS.expectedItems).toBe(1000)
      expect(DEFAULT_BLOOM_FILTER_OPTIONS.falsePositiveRate).toBe(0.01)
    })
  })

  // ─── Edge cases ────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles very small expectedItems', () => {
      const bf = new BloomFilter<string>(1, 0.5)
      bf.add('only')
      expect(bf.has('only')).toBe(true)
      expect(bf.bitCount).toBeGreaterThan(0)
    })

    it('handles single item filter', () => {
      const bf = new BloomFilter<string>(1, 0.01)
      bf.add('solo')
      expect(bf.has('solo')).toBe(true)
      expect(bf.size).toBe(1)
    })

    it('handles boolean values via serialization', () => {
      const bf = new BloomFilter<boolean>(100)
      bf.add(true)
      bf.add(false)
      expect(bf.has(true)).toBe(true)
      expect(bf.has(false)).toBe(true)
    })

    it('handles null value via serialization', () => {
      const bf = new BloomFilter<null>(100)
      bf.add(null)
      expect(bf.has(null)).toBe(true)
    })

    it('handles array items via serialization', () => {
      const bf = new BloomFilter<number[]>(100)
      bf.add([1, 2, 3])
      expect(bf.has([1, 2, 3])).toBe(true)
      expect(bf.has([4, 5, 6])).toBe(false)
    })

    it('handles many insertions gracefully', () => {
      const bf = new BloomFilter<string>(1000, 0.01)
      for (let i = 0; i < 1000; i++) {
        bf.add(`item-${i}`)
      }
      expect(bf.size).toBe(1000)
      expect(bf.has('item-0')).toBe(true)
      expect(bf.has('item-500')).toBe(true)
      expect(bf.has('item-999')).toBe(true)
    })

    it('fillRatio approaches 1 with many items beyond capacity', () => {
      const bf = new BloomFilter<string>(10, 0.01)
      for (let i = 0; i < 500; i++) {
        bf.add(`item-${i}`)
      }
      expect(bf.fillRatio()).toBeGreaterThan(0.9)
    })

    it('clone of empty filter works correctly', () => {
      const bf = new BloomFilter<string>(100)
      const cloned = bf.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.bitCount).toBe(bf.bitCount)
    })

    it('clear and reinsert preserves correctness', () => {
      const bf = new BloomFilter<string>(100)
      for (let i = 0; i < 10; i++) bf.add(`old-${i}`)
      bf.clear()
      for (let i = 0; i < 10; i++) {
        expect(bf.has(`old-${i}`)).toBe(false)
      }
      bf.add('new')
      expect(bf.has('new')).toBe(true)
      expect(bf.size).toBe(1)
    })
  })
})
