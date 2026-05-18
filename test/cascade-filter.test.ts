import { CascadeFilter, DEFAULT_CASCADE_FILTER_OPTIONS } from '../src/core/cascade-filter/cascade-filter.js'
import type { CascadeFilterJSON, CascadeFilterOptions, CascadeFilterStatistics } from '../src/core/cascade-filter/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CascadeFilter', () => {
  describe('constructor', () => {
    it('creates an empty filter with default options', () => {
      const filter = new CascadeFilter()
      expect(filter.size).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })

    it('creates a filter with default 3 layers', () => {
      const filter = new CascadeFilter()
      expect(filter.layerCount()).toBe(3)
    })

    it('creates a filter with default expected items of 1000', () => {
      const filter = new CascadeFilter()
      expect(filter.capacity()).toBe(1000)
    })

    it('creates a filter with custom expected items', () => {
      const filter = new CascadeFilter({ expectedItems: 500 })
      expect(filter.capacity()).toBe(500)
    })

    it('creates a filter with custom false positive rate', () => {
      const filter = new CascadeFilter({ falsePositiveRate: 0.001 })
      expect(filter.capacity()).toBe(1000)
    })

    it('creates a filter with custom layer count', () => {
      const filter = new CascadeFilter({ layers: 5 })
      expect(filter.layerCount()).toBe(5)
    })

    it('creates a filter with all custom options', () => {
      const filter = new CascadeFilter({ expectedItems: 200, falsePositiveRate: 0.05, layers: 4 })
      expect(filter.capacity()).toBe(200)
      expect(filter.layerCount()).toBe(4)
    })

    it('accepts empty options object', () => {
      const filter = new CascadeFilter({})
      expect(filter.size).toBe(0)
      expect(filter.layerCount()).toBe(DEFAULT_CASCADE_FILTER_OPTIONS.layers)
    })

    it('creates a filter with single layer', () => {
      const filter = new CascadeFilter({ layers: 1 })
      expect(filter.layerCount()).toBe(1)
    })
  })

  // ─── DEFAULT_CASCADE_FILTER_OPTIONS ──────────────────────────────────

  describe('DEFAULT_CASCADE_FILTER_OPTIONS', () => {
    it('has expectedItems of 1000', () => {
      expect(DEFAULT_CASCADE_FILTER_OPTIONS.expectedItems).toBe(1000)
    })

    it('has falsePositiveRate of 0.01', () => {
      expect(DEFAULT_CASCADE_FILTER_OPTIONS.falsePositiveRate).toBe(0.01)
    })

    it('has layers of 3', () => {
      expect(DEFAULT_CASCADE_FILTER_OPTIONS.layers).toBe(3)
    })
  })

  // ─── add ──────────────────────────────────────────────────────────────

  describe('add', () => {
    it('adds an item and increases size', () => {
      const filter = new CascadeFilter()
      filter.add('hello')
      expect(filter.size).toBe(1)
      expect(filter.isEmpty).toBe(false)
    })

    it('adds multiple items', () => {
      const filter = new CascadeFilter()
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size).toBe(3)
    })

    it('adds the same item multiple times (counting bloom behavior)', () => {
      const filter = new CascadeFilter()
      filter.add('x')
      filter.add('x')
      filter.add('x')
      expect(filter.size).toBe(3)
    })

    it('adds numeric items when typed as number', () => {
      const filter = new CascadeFilter<number>()
      filter.add(42)
      filter.add(100)
      expect(filter.size).toBe(2)
    })

    it('adds object items when typed as object', () => {
      const filter = new CascadeFilter<{ id: number }>()
      filter.add({ id: 1 })
      filter.add({ id: 2 })
      expect(filter.size).toBe(2)
    })

    it('adds empty string', () => {
      const filter = new CascadeFilter()
      filter.add('')
      expect(filter.size).toBe(1)
    })

    it('adds items with special characters', () => {
      const filter = new CascadeFilter()
      filter.add('hello world!')
      filter.add('unicode: \u00e9\u00e8\u00ea')
      expect(filter.size).toBe(2)
    })

    it('adds many items up to expected capacity', () => {
      const filter = new CascadeFilter({ expectedItems: 100 })
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size).toBe(100)
    })
  })

  // ─── has ──────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for an added item', () => {
      const filter = new CascadeFilter()
      filter.add('hello')
      expect(filter.has('hello')).toBe(true)
    })

    it('returns false for a non-added item in empty filter', () => {
      const filter = new CascadeFilter()
      expect(filter.has('missing')).toBe(false)
    })

    it('returns false for a non-added item in non-empty filter', () => {
      const filter = new CascadeFilter()
      filter.add('a')
      expect(filter.has('b')).toBe(false)
    })

    it('returns true for multiple added items', () => {
      const filter = new CascadeFilter()
      filter.add('x')
      filter.add('y')
      filter.add('z')
      expect(filter.has('x')).toBe(true)
      expect(filter.has('y')).toBe(true)
      expect(filter.has('z')).toBe(true)
    })

    it('returns true for item added multiple times', () => {
      const filter = new CascadeFilter()
      filter.add('dup')
      filter.add('dup')
      expect(filter.has('dup')).toBe(true)
    })

    it('returns false for empty string when not added', () => {
      const filter = new CascadeFilter()
      expect(filter.has('')).toBe(false)
    })

    it('returns true for empty string when added', () => {
      const filter = new CascadeFilter()
      filter.add('')
      expect(filter.has('')).toBe(true)
    })

    it('returns correct results for numeric items', () => {
      const filter = new CascadeFilter<number>()
      filter.add(42)
      expect(filter.has(42)).toBe(true)
      expect(filter.has(99)).toBe(false)
    })

    it('returns correct results for object items', () => {
      const filter = new CascadeFilter<{ id: number }>()
      const obj = { id: 1 }
      filter.add(obj)
      expect(filter.has(obj)).toBe(true)
      expect(filter.has({ id: 99 })).toBe(false)
    })
  })

  // ─── remove ───────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes an existing item and returns true', () => {
      const filter = new CascadeFilter()
      filter.add('hello')
      const result = filter.remove('hello')
      expect(result).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('returns false when removing a non-existent item', () => {
      const filter = new CascadeFilter()
      const result = filter.remove('missing')
      expect(result).toBe(false)
      expect(filter.size).toBe(0)
    })

    it('returns false when removing from empty filter', () => {
      const filter = new CascadeFilter()
      expect(filter.remove('anything')).toBe(false)
    })

    it('removes one item while keeping others', () => {
      const filter = new CascadeFilter()
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.remove('b')
      expect(filter.size).toBe(2)
      expect(filter.has('a')).toBe(true)
      expect(filter.has('c')).toBe(true)
    })

    it('handles removing the same item twice', () => {
      const filter = new CascadeFilter()
      filter.add('x')
      expect(filter.remove('x')).toBe(true)
      expect(filter.remove('x')).toBe(false)
      expect(filter.size).toBe(0)
    })

    it('decrements counters correctly for duplicate adds', () => {
      const filter = new CascadeFilter()
      filter.add('dup')
      filter.add('dup')
      filter.remove('dup')
      expect(filter.size).toBe(1)
      expect(filter.has('dup')).toBe(true)
    })

    it('removes all duplicates eventually', () => {
      const filter = new CascadeFilter()
      filter.add('dup')
      filter.add('dup')
      filter.remove('dup')
      filter.remove('dup')
      expect(filter.size).toBe(0)
    })

    it('does not go below zero counters', () => {
      const filter = new CascadeFilter()
      filter.add('x')
      filter.remove('x')
      filter.remove('x')
      expect(filter.size).toBe(0)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears all items from the filter', () => {
      const filter = new CascadeFilter()
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })

    it('clears filter that is already empty', () => {
      const filter = new CascadeFilter()
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })

    it('clears and allows re-adding items', () => {
      const filter = new CascadeFilter()
      filter.add('first')
      filter.clear()
      filter.add('second')
      expect(filter.size).toBe(1)
      expect(filter.has('second')).toBe(true)
      expect(filter.has('first')).toBe(false)
    })

    it('resets statistics after clear', () => {
      const filter = new CascadeFilter()
      filter.add('a')
      filter.has('a')
      filter.remove('a')
      filter.clear()
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.removals).toBe(0)
    })
  })

  // ─── size / isEmpty ───────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size is 0 for new filter', () => {
      const filter = new CascadeFilter()
      expect(filter.size).toBe(0)
    })

    it('isEmpty is true for new filter', () => {
      const filter = new CascadeFilter()
      expect(filter.isEmpty).toBe(true)
    })

    it('isEmpty is false after adding an item', () => {
      const filter = new CascadeFilter()
      filter.add('item')
      expect(filter.isEmpty).toBe(false)
    })

    it('size tracks additions and removals', () => {
      const filter = new CascadeFilter()
      filter.add('a')
      filter.add('b')
      expect(filter.size).toBe(2)
      filter.remove('a')
      expect(filter.size).toBe(1)
      filter.remove('b')
      expect(filter.size).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })
  })

  // ─── layerCount ───────────────────────────────────────────────────────

  describe('layerCount', () => {
    it('returns default 3 layers', () => {
      const filter = new CascadeFilter()
      expect(filter.layerCount()).toBe(3)
    })

    it('returns configured layer count', () => {
      const filter = new CascadeFilter({ layers: 7 })
      expect(filter.layerCount()).toBe(7)
    })

    it('returns 1 for single layer filter', () => {
      const filter = new CascadeFilter({ layers: 1 })
      expect(filter.layerCount()).toBe(1)
    })
  })

  // ─── capacity ─────────────────────────────────────────────────────────

  describe('capacity', () => {
    it('returns default capacity of 1000', () => {
      const filter = new CascadeFilter()
      expect(filter.capacity()).toBe(1000)
    })

    it('returns configured capacity', () => {
      const filter = new CascadeFilter({ expectedItems: 5000 })
      expect(filter.capacity()).toBe(5000)
    })
  })

  // ─── estimatedFillRatio ───────────────────────────────────────────────

  describe('estimatedFillRatio', () => {
    it('returns 0 for empty filter', () => {
      const filter = new CascadeFilter()
      expect(filter.estimatedFillRatio()).toBe(0)
    })

    it('returns positive value after adding items', () => {
      const filter = new CascadeFilter({ expectedItems: 10, layers: 1 })
      filter.add('item')
      expect(filter.estimatedFillRatio()).toBeGreaterThan(0)
    })

    it('returns value between 0 and 1', () => {
      const filter = new CascadeFilter({ expectedItems: 10, layers: 1 })
      for (let i = 0; i < 10; i++) {
        filter.add(`item-${i}`)
      }
      const ratio = filter.estimatedFillRatio()
      expect(ratio).toBeGreaterThan(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })

    it('increases as more items are added', () => {
      const filter = new CascadeFilter({ expectedItems: 100, layers: 1 })
      const ratio1 = filter.estimatedFillRatio()
      filter.add('a')
      const ratio2 = filter.estimatedFillRatio()
      filter.add('b')
      const ratio3 = filter.estimatedFillRatio()
      expect(ratio2).toBeGreaterThanOrEqual(ratio1)
      expect(ratio3).toBeGreaterThanOrEqual(ratio2)
    })
  })

  // ─── expectedFalsePositiveRate ─────────────────────────────────────────

  describe('expectedFalsePositiveRate', () => {
    it('returns 0 for empty filter', () => {
      const filter = new CascadeFilter()
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('returns positive value after adding items', () => {
      const filter = new CascadeFilter({ expectedItems: 10 })
      for (let i = 0; i < 5; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.expectedFalsePositiveRate()).toBeGreaterThan(0)
    })

    it('returns value between 0 and 1', () => {
      const filter = new CascadeFilter({ expectedItems: 10 })
      for (let i = 0; i < 5; i++) {
        filter.add(`item-${i}`)
      }
      const fpr = filter.expectedFalsePositiveRate()
      expect(fpr).toBeGreaterThan(0)
      expect(fpr).toBeLessThanOrEqual(1)
    })
  })

  // ─── getStatistics ────────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('returns initial statistics for new filter', () => {
      const filter = new CascadeFilter()
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.removals).toBe(0)
      expect(stats.totalChecks).toBe(0)
      expect(stats.falsePositiveEstimate).toBe(0)
    })

    it('tracks add operations', () => {
      const filter = new CascadeFilter()
      filter.add('a')
      filter.add('b')
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(2)
    })

    it('tracks lookup operations', () => {
      const filter = new CascadeFilter()
      filter.add('a')
      filter.has('a')
      filter.has('b')
      const stats = filter.getStatistics()
      expect(stats.lookups).toBe(2)
    })

    it('tracks removal operations', () => {
      const filter = new CascadeFilter()
      filter.add('a')
      filter.remove('a')
      filter.remove('b')
      const stats = filter.getStatistics()
      expect(stats.removals).toBe(2)
    })

    it('tracks totalChecks on has calls', () => {
      const filter = new CascadeFilter({ layers: 2 })
      filter.add('a')
      filter.has('a')
      const stats = filter.getStatistics()
      expect(stats.totalChecks).toBe(2)
    })

    it('tracks layerHits as array matching layer count', () => {
      const filter = new CascadeFilter({ layers: 3 })
      const stats = filter.getStatistics()
      expect(stats.layerHits).toHaveLength(3)
      expect(stats.layerHits.every((h) => h === 0)).toBe(true)
    })

    it('updates layerHits after successful has', () => {
      const filter = new CascadeFilter({ layers: 3 })
      filter.add('a')
      filter.has('a')
      const stats = filter.getStatistics()
      const hasAnyHit = stats.layerHits.some((h) => h > 0)
      expect(hasAnyHit).toBe(true)
    })

    it('returns independent copy of layerHits', () => {
      const filter = new CascadeFilter()
      const stats1 = filter.getStatistics()
      const stats2 = filter.getStatistics()
      expect(stats1.layerHits).not.toBe(stats2.layerHits)
    })
  })

  // ─── optimize ─────────────────────────────────────────────────────────

  describe('optimize', () => {
    it('returns optimization data with all fields', () => {
      const filter = new CascadeFilter()
      const result = filter.optimize()
      expect(result).toHaveProperty('currentFillRatio')
      expect(result).toHaveProperty('currentFalsePositiveRate')
      expect(result).toHaveProperty('recommendedExpectedItems')
      expect(result).toHaveProperty('recommendedLayers')
      expect(result).toHaveProperty('estimatedSpaceEfficiency')
    })

    it('returns currentFillRatio of 0 for empty filter', () => {
      const filter = new CascadeFilter()
      const result = filter.optimize()
      expect(result.currentFillRatio).toBe(0)
    })

    it('returns currentFalsePositiveRate of 0 for empty filter', () => {
      const filter = new CascadeFilter()
      const result = filter.optimize()
      expect(result.currentFalsePositiveRate).toBe(0)
    })

    it('returns recommendedExpectedItems equal to configured when empty', () => {
      const filter = new CascadeFilter({ expectedItems: 500 })
      const result = filter.optimize()
      expect(result.recommendedExpectedItems).toBe(500)
    })

    it('returns recommendedExpectedItems of at least 1.5x current size when populated', () => {
      const filter = new CascadeFilter({ expectedItems: 10 })
      for (let i = 0; i < 10; i++) {
        filter.add(`item-${i}`)
      }
      const result = filter.optimize()
      expect(result.recommendedExpectedItems).toBeGreaterThanOrEqual(15)
    })

    it('returns estimatedSpaceEfficiency as a positive number', () => {
      const filter = new CascadeFilter()
      const result = filter.optimize()
      expect(result.estimatedSpaceEfficiency).toBeGreaterThan(0)
    })

    it('returns same layer count when FPR is acceptable', () => {
      const filter = new CascadeFilter({ layers: 3, expectedItems: 1000 })
      const result = filter.optimize()
      expect(result.recommendedLayers).toBe(3)
    })
  })

  // ─── toJSON ───────────────────────────────────────────────────────────

  describe('toJSON', () => {
    it('returns valid JSON representation of empty filter', () => {
      const filter = new CascadeFilter()
      const json = filter.toJSON()
      expect(json.expectedItems).toBe(1000)
      expect(json.falsePositiveRate).toBe(0.01)
      expect(json.layerCount).toBe(3)
      expect(json.itemCount).toBe(0)
    })

    it('includes layers array with correct length', () => {
      const filter = new CascadeFilter({ layers: 3 })
      const json = filter.toJSON()
      expect(json.layers).toHaveLength(3)
    })

    it('each layer has counters, bitCount, and hashCount', () => {
      const filter = new CascadeFilter({ layers: 2 })
      const json = filter.toJSON()
      for (const layer of json.layers) {
        expect(layer).toHaveProperty('counters')
        expect(layer).toHaveProperty('bitCount')
        expect(layer).toHaveProperty('hashCount')
        expect(Array.isArray(layer.counters)).toBe(true)
      }
    })

    it('includes statistics object', () => {
      const filter = new CascadeFilter()
      const json = filter.toJSON()
      expect(json.statistics).toHaveProperty('adds')
      expect(json.statistics).toHaveProperty('lookups')
      expect(json.statistics).toHaveProperty('removals')
      expect(json.statistics).toHaveProperty('layerHits')
      expect(json.statistics).toHaveProperty('totalChecks')
      expect(json.statistics).toHaveProperty('falsePositiveEstimate')
    })

    it('tracks itemCount matching size', () => {
      const filter = new CascadeFilter()
      filter.add('a')
      filter.add('b')
      const json = filter.toJSON()
      expect(json.itemCount).toBe(2)
    })

    it('captures counters as plain number arrays', () => {
      const filter = new CascadeFilter()
      filter.add('x')
      const json = filter.toJSON()
      for (const layer of json.layers) {
        for (const counter of layer.counters) {
          expect(typeof counter).toBe('number')
        }
      }
    })

    it('reflects operations in statistics', () => {
      const filter = new CascadeFilter()
      filter.add('a')
      filter.has('a')
      filter.remove('a')
      const json = filter.toJSON()
      expect(json.statistics.adds).toBe(1)
      expect(json.statistics.lookups).toBe(1)
      expect(json.statistics.removals).toBe(1)
    })
  })

  // ─── fromJSON ─────────────────────────────────────────────────────────

  describe('static fromJSON', () => {
    it('reconstructs a filter from JSON', () => {
      const original = new CascadeFilter({ expectedItems: 100, layers: 2 })
      original.add('hello')
      original.add('world')
      const json = original.toJSON()
      const restored = CascadeFilter.fromJSON<string>(json)
      expect(restored.size).toBe(2)
      expect(restored.has('hello')).toBe(true)
      expect(restored.has('world')).toBe(true)
    })

    it('restores layer count', () => {
      const original = new CascadeFilter({ layers: 4 })
      const json = original.toJSON()
      const restored = CascadeFilter.fromJSON(json)
      expect(restored.layerCount()).toBe(4)
    })

    it('restores capacity', () => {
      const original = new CascadeFilter({ expectedItems: 500 })
      const json = original.toJSON()
      const restored = CascadeFilter.fromJSON(json)
      expect(restored.capacity()).toBe(500)
    })

    it('restores statistics', () => {
      const original = new CascadeFilter()
      original.add('a')
      original.has('a')
      original.remove('a')
      const json = original.toJSON()
      const restored = CascadeFilter.fromJSON(json)
      const stats = restored.getStatistics()
      expect(stats.adds).toBe(1)
      expect(stats.lookups).toBe(1)
      expect(stats.removals).toBe(1)
    })

    it('restores empty filter', () => {
      const original = new CascadeFilter()
      const json = original.toJSON()
      const restored = CascadeFilter.fromJSON(json)
      expect(restored.size).toBe(0)
      expect(restored.isEmpty).toBe(true)
    })

    it('allows continued operations after restore', () => {
      const original = new CascadeFilter()
      original.add('existing')
      const json = original.toJSON()
      const restored = CascadeFilter.fromJSON(json)
      restored.add('new')
      expect(restored.size).toBe(2)
      expect(restored.has('existing')).toBe(true)
      expect(restored.has('new')).toBe(true)
    })

    it('round-trip preserves has results for all items', () => {
      const original = new CascadeFilter({ expectedItems: 50 })
      const items = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
      for (const item of items) {
        original.add(item)
      }
      const json = original.toJSON()
      const restored = CascadeFilter.fromJSON<string>(json)
      for (const item of items) {
        expect(restored.has(item)).toBe(true)
      }
    })
  })

  // ─── Iterator ─────────────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('returns an empty iterator for empty filter', () => {
      const filter = new CascadeFilter()
      const result = [...filter]
      expect(result).toEqual([])
    })

    it('returns an empty iterator for populated filter', () => {
      const filter = new CascadeFilter()
      filter.add('a')
      const result = [...filter]
      expect(result).toEqual([])
    })
  })

  // ─── Bloom Filter Accuracy ────────────────────────────────────────────

  describe('bloom filter accuracy', () => {
    it('has no false negatives', () => {
      const filter = new CascadeFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
      const items: string[] = []
      for (let i = 0; i < 50; i++) {
        const item = `item-${i}`
        items.push(item)
        filter.add(item)
      }
      for (const item of items) {
        expect(filter.has(item)).toBe(true)
      }
    })

    it('provides reasonable false positive rate', () => {
      const filter = new CascadeFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      let falsePositives = 0
      const trials = 1000
      for (let i = 0; i < trials; i++) {
        if (filter.has(`nonexistent-${i}`)) {
          falsePositives++
        }
      }
      expect(falsePositives / trials).toBeLessThan(0.2)
    })

    it('works correctly with single layer', () => {
      const filter = new CascadeFilter({ expectedItems: 100, layers: 1 })
      filter.add('test')
      expect(filter.has('test')).toBe(true)
      expect(filter.has('other')).toBe(false)
    })

    it('works correctly with many layers', () => {
      const filter = new CascadeFilter({ expectedItems: 100, layers: 10 })
      filter.add('test')
      expect(filter.has('test')).toBe(true)
    })

    it('handles high capacity filter', () => {
      const filter = new CascadeFilter({ expectedItems: 10000, falsePositiveRate: 0.001 })
      for (let i = 0; i < 1000; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.has('item-0')).toBe(true)
      expect(filter.has('item-999')).toBe(true)
      expect(filter.has('item-1000')).toBe(false)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles very small expected items', () => {
      const filter = new CascadeFilter({ expectedItems: 1 })
      filter.add('only')
      expect(filter.has('only')).toBe(true)
    })

    it('handles very small false positive rate', () => {
      const filter = new CascadeFilter({ falsePositiveRate: 0.0001 })
      filter.add('item')
      expect(filter.has('item')).toBe(true)
    })

    it('handles very large false positive rate', () => {
      const filter = new CascadeFilter({ falsePositiveRate: 0.5 })
      filter.add('item')
      expect(filter.has('item')).toBe(true)
    })

    it('add and remove cycle preserves other items', () => {
      const filter = new CascadeFilter({ expectedItems: 100 })
      filter.add('keep')
      filter.add('remove')
      filter.remove('remove')
      expect(filter.has('keep')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('multiple clear and re-add cycles', () => {
      const filter = new CascadeFilter()
      for (let cycle = 0; cycle < 5; cycle++) {
        filter.add(`cycle-${cycle}`)
        expect(filter.size).toBe(1)
        expect(filter.has(`cycle-${cycle}`)).toBe(true)
        filter.clear()
        expect(filter.size).toBe(0)
      }
    })

    it('toJSON and fromJSON with complex operations', () => {
      const original = new CascadeFilter({ expectedItems: 50, layers: 2 })
      original.add('a')
      original.add('b')
      original.remove('a')
      const json = original.toJSON()
      const restored = CascadeFilter.fromJSON<string>(json)
      expect(restored.size).toBe(1)
      expect(restored.has('b')).toBe(true)
    })

    it('getStatistics returns fresh falsePositiveEstimate', () => {
      const filter = new CascadeFilter({ expectedItems: 10 })
      filter.add('item')
      const stats = filter.getStatistics()
      expect(stats.falsePositiveEstimate).toBeGreaterThan(0)
    })

    it('clear resets fill ratio', () => {
      const filter = new CascadeFilter({ expectedItems: 10 })
      filter.add('item')
      expect(filter.estimatedFillRatio()).toBeGreaterThan(0)
      filter.clear()
      expect(filter.estimatedFillRatio()).toBe(0)
    })

    it('clear resets false positive rate estimate', () => {
      const filter = new CascadeFilter({ expectedItems: 10 })
      filter.add('item')
      expect(filter.expectedFalsePositiveRate()).toBeGreaterThan(0)
      filter.clear()
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('optimize after adding items returns reasonable recommendations', () => {
      const filter = new CascadeFilter({ expectedItems: 10 })
      for (let i = 0; i < 20; i++) {
        filter.add(`item-${i}`)
      }
      const opt = filter.optimize()
      expect(opt.recommendedExpectedItems).toBeGreaterThanOrEqual(30)
      expect(opt.currentFillRatio).toBeGreaterThan(0)
    })

    it('handles boolean items', () => {
      const filter = new CascadeFilter<boolean>()
      filter.add(true)
      filter.add(false)
      expect(filter.size).toBe(2)
      expect(filter.has(true)).toBe(true)
      expect(filter.has(false)).toBe(true)
    })

    it('handles null items', () => {
      const filter = new CascadeFilter<null>()
      filter.add(null)
      expect(filter.size).toBe(1)
      expect(filter.has(null)).toBe(true)
    })

    it('layer bits scale up with layer index', () => {
      const filter = new CascadeFilter({ expectedItems: 100, layers: 3 })
      const json = filter.toJSON()
      expect(json.layers[1]!.bitCount).toBeGreaterThanOrEqual(json.layers[0]!.bitCount)
      expect(json.layers[2]!.bitCount).toBeGreaterThanOrEqual(json.layers[1]!.bitCount)
    })

    it('layer counters have correct bitCount length', () => {
      const filter = new CascadeFilter({ layers: 3 })
      const json = filter.toJSON()
      for (const layer of json.layers) {
        expect(layer.counters.length).toBe(layer.bitCount)
      }
    })
  })
})
