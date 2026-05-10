import { describe, it, expect, beforeEach } from 'vitest'
import { CascadeFilter } from '../../src/core/cascade-filter/cascade-filter.js'
import { DEFAULT_CASCADE_FILTER_OPTIONS } from '../../src/core/cascade-filter/types.js'
import type { CascadeFilterJSON } from '../../src/core/cascade-filter/types.js'

describe('CascadeFilter', () => {
  let filter: CascadeFilter

  beforeEach(() => {
    filter = new CascadeFilter()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const f = new CascadeFilter()
      expect(f.isEmpty).toBe(true)
      expect(f.size).toBe(0)
    })

    it('should create with empty options', () => {
      const f = new CascadeFilter({})
      expect(f.isEmpty).toBe(true)
    })

    it('should accept expectedItems option', () => {
      const f = new CascadeFilter({ expectedItems: 5000 })
      expect(f.capacity()).toBe(5000)
    })

    it('should accept falsePositiveRate option', () => {
      const f = new CascadeFilter({ falsePositiveRate: 0.001 })
      expect(f.capacity()).toBe(DEFAULT_CASCADE_FILTER_OPTIONS.expectedItems)
    })

    it('should accept layers option', () => {
      const f = new CascadeFilter({ layers: 5 })
      expect(f.layerCount()).toBe(5)
    })

    it('should accept all options together', () => {
      const f = new CascadeFilter({ expectedItems: 2000, falsePositiveRate: 0.001, layers: 4 })
      expect(f.capacity()).toBe(2000)
      expect(f.layerCount()).toBe(4)
    })

    it('should default to 3 layers', () => {
      const f = new CascadeFilter()
      expect(f.layerCount()).toBe(3)
    })

    it('should default to 1000 expectedItems', () => {
      const f = new CascadeFilter()
      expect(f.capacity()).toBe(1000)
    })

    it('should default to 0.01 falsePositiveRate', () => {
      const f = new CascadeFilter({ expectedItems: 100 })
      f.add('test')
      expect(f.expectedFalsePositiveRate()).toBeGreaterThan(0)
      expect(f.expectedFalsePositiveRate()).toBeLessThan(0.1)
    })

    it('should create layers with different bit counts', () => {
      const f = new CascadeFilter({ expectedItems: 1000, layers: 3 })
      const json = f.toJSON()
      expect(json.layers[0]!.bitCount).toBeLessThan(json.layers[1]!.bitCount)
      expect(json.layers[1]!.bitCount).toBeLessThan(json.layers[2]!.bitCount)
    })

    it('should create single layer filter', () => {
      const f = new CascadeFilter({ layers: 1 })
      expect(f.layerCount()).toBe(1)
    })

    it('should create many layer filter', () => {
      const f = new CascadeFilter({ layers: 10 })
      expect(f.layerCount()).toBe(10)
    })

    it('should have minimum 64 bits per layer', () => {
      const f = new CascadeFilter({ expectedItems: 1, falsePositiveRate: 0.5, layers: 3 })
      const json = f.toJSON()
      for (const layer of json.layers) {
        expect(layer.bitCount).toBeGreaterThanOrEqual(64)
      }
    })

    it('should produce larger layers for lower error rates', () => {
      const f1 = new CascadeFilter({ expectedItems: 100, falsePositiveRate: 0.1, layers: 2 })
      const f2 = new CascadeFilter({ expectedItems: 100, falsePositiveRate: 0.001, layers: 2 })
      const j1 = f1.toJSON()
      const j2 = f2.toJSON()
      const total1 = j1.layers.reduce((s, l) => s + l.bitCount, 0)
      const total2 = j2.layers.reduce((s, l) => s + l.bitCount, 0)
      expect(total2).toBeGreaterThan(total1)
    })

    it('should override partial defaults correctly', () => {
      const f = new CascadeFilter({ expectedItems: 500 })
      expect(f.capacity()).toBe(500)
      expect(f.layerCount()).toBe(DEFAULT_CASCADE_FILTER_OPTIONS.layers)
    })
  })

  describe('add', () => {
    it('should add a single item', () => {
      filter.add('hello')
      expect(filter.size).toBe(1)
      expect(filter.isEmpty).toBe(false)
    })

    it('should add multiple items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size).toBe(3)
    })

    it('should add duplicate items', () => {
      filter.add('x')
      filter.add('x')
      expect(filter.size).toBe(2)
    })

    it('should add numeric items', () => {
      const f = new CascadeFilter<number>()
      f.add(42)
      f.add(100)
      expect(f.size).toBe(2)
      expect(f.has(42)).toBe(true)
    })

    it('should add object items', () => {
      const f = new CascadeFilter<object>()
      f.add({ key: 'value' })
      expect(f.size).toBe(1)
    })

    it('should update statistics on add', () => {
      filter.add('test')
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(1)
    })

    it('should track multiple adds in statistics', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.getStatistics().adds).toBe(3)
    })

    it('should increment fill ratio after adds', () => {
      const initial = filter.estimatedFillRatio()
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.estimatedFillRatio()).toBeGreaterThan(initial)
    })

    it('should handle adding empty string', () => {
      filter.add('')
      expect(filter.size).toBe(1)
      expect(filter.has('')).toBe(true)
    })

    it('should handle adding special characters', () => {
      filter.add('hello\nworld\t!')
      expect(filter.has('hello\nworld\t!')).toBe(true)
    })

    it('should handle adding unicode strings', () => {
      filter.add('こんにちは')
      filter.add('🚀🎉')
      expect(filter.has('こんにちは')).toBe(true)
      expect(filter.has('🚀🎉')).toBe(true)
    })

    it('should not increase has count when adding', () => {
      filter.add('test')
      expect(filter.getStatistics().lookups).toBe(0)
    })
  })

  describe('has', () => {
    it('should return true for added items', () => {
      filter.add('test')
      expect(filter.has('test')).toBe(true)
    })

    it('should return false for non-added items in empty filter', () => {
      expect(filter.has('nothing')).toBe(false)
    })

    it('should return false for non-added items after adds', () => {
      filter.add('a')
      filter.add('b')
      expect(filter.has('c')).toBe(false)
    })

    it('should find items added multiple times', () => {
      filter.add('x')
      filter.add('x')
      filter.add('x')
      expect(filter.has('x')).toBe(true)
    })

    it('should update lookups statistic', () => {
      filter.add('test')
      filter.has('test')
      expect(filter.getStatistics().lookups).toBe(1)
    })

    it('should update totalChecks statistic', () => {
      filter.add('test')
      filter.has('test')
      expect(filter.getStatistics().totalChecks).toBe(filter.layerCount())
    })

    it('should short-circuit on first layer rejection', () => {
      filter.add('exists')
      filter.has('nonexistent')
      const stats = filter.getStatistics()
      expect(stats.totalChecks).toBeLessThanOrEqual(filter.layerCount())
    })

    it('should track layerHits for found items', () => {
      filter.add('test')
      filter.has('test')
      const stats = filter.getStatistics()
      for (let i = 0; i < filter.layerCount(); i++) {
        expect(stats.layerHits[i]).toBe(1)
      }
    })

    it('should handle multiple lookups', () => {
      filter.add('test')
      filter.has('test')
      filter.has('test')
      filter.has('test')
      expect(filter.getStatistics().lookups).toBe(3)
    })

    it('should update falsePositiveEstimate on positive lookup', () => {
      filter.add('test')
      filter.has('test')
      const stats = filter.getStatistics()
      expect(stats.falsePositiveEstimate).toBeGreaterThan(0)
    })

    it('should not update falsePositiveEstimate on negative lookup', () => {
      filter.has('nonexistent')
      expect(filter.getStatistics().falsePositiveEstimate).toBe(0)
    })

    it('should handle has on empty filter', () => {
      expect(filter.has('anything')).toBe(false)
      expect(filter.getStatistics().lookups).toBe(1)
    })

    it('should work with different types', () => {
      const f = new CascadeFilter<number>()
      f.add(42)
      expect(f.has(42)).toBe(true)
      expect(f.has(43)).toBe(false)
    })

    it('should find items across all layers', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      for (let i = 0; i < 50; i++) {
        expect(filter.has(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('remove', () => {
    it('should remove an added item', () => {
      filter.add('test')
      expect(filter.remove('test')).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('should return false for non-existent item', () => {
      expect(filter.remove('nothing')).toBe(false)
    })

    it('should return false for item never added', () => {
      filter.add('a')
      expect(filter.remove('b')).toBe(false)
    })

    it('should handle removing from empty filter', () => {
      expect(filter.remove('anything')).toBe(false)
      expect(filter.size).toBe(0)
    })

    it('should decrement size on removal', () => {
      filter.add('x')
      filter.add('y')
      expect(filter.size).toBe(2)
      filter.remove('x')
      expect(filter.size).toBe(1)
    })

    it('should track removals in statistics', () => {
      filter.add('test')
      filter.remove('test')
      expect(filter.getStatistics().removals).toBe(1)
    })

    it('should track failed removals in statistics', () => {
      filter.remove('nothing')
      expect(filter.getStatistics().removals).toBe(1)
    })

    it('should allow re-adding after removal', () => {
      filter.add('test')
      filter.remove('test')
      filter.add('test')
      expect(filter.size).toBe(1)
      expect(filter.has('test')).toBe(true)
    })

    it('should handle duplicate add and single remove', () => {
      filter.add('test')
      filter.add('test')
      filter.remove('test')
      expect(filter.size).toBe(1)
      expect(filter.has('test')).toBe(true)
    })

    it('should handle removing all items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.remove('a')
      filter.remove('b')
      filter.remove('c')
      expect(filter.isEmpty).toBe(true)
    })

    it('should handle removing one of many', () => {
      for (let i = 0; i < 20; i++) {
        filter.add(`item-${i}`)
      }
      filter.remove('item-10')
      expect(filter.size).toBe(19)
      expect(filter.has('item-10')).toBe(false)
    })

    it('should not affect other items when removing', () => {
      filter.add('keep')
      filter.add('remove')
      filter.remove('remove')
      expect(filter.has('keep')).toBe(true)
    })

    it('should handle double removal', () => {
      filter.add('test')
      expect(filter.remove('test')).toBe(true)
      expect(filter.remove('test')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear an empty filter', () => {
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })

    it('should clear a filter with items', () => {
      filter.add('a')
      filter.add('b')
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })

    it('should reset statistics', () => {
      filter.add('a')
      filter.has('a')
      filter.clear()
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.removals).toBe(0)
      expect(stats.totalChecks).toBe(0)
    })

    it('should reset fill ratio', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      filter.clear()
      expect(filter.estimatedFillRatio()).toBe(0)
    })

    it('should reset false positive rate', () => {
      filter.add('test')
      filter.clear()
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('should allow adding after clear', () => {
      filter.add('before')
      filter.clear()
      filter.add('after')
      expect(filter.size).toBe(1)
      expect(filter.has('after')).toBe(true)
    })

    it('should reset layer hits in statistics', () => {
      filter.add('test')
      filter.has('test')
      filter.clear()
      const stats = filter.getStatistics()
      for (let i = 0; i < filter.layerCount(); i++) {
        expect(stats.layerHits[i]).toBe(0)
      }
    })

    it('should preserve layer count after clear', () => {
      const originalCount = filter.layerCount()
      filter.add('test')
      filter.clear()
      expect(filter.layerCount()).toBe(originalCount)
    })

    it('should preserve capacity after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.capacity()).toBe(DEFAULT_CASCADE_FILTER_OPTIONS.expectedItems)
    })
  })

  describe('estimatedFillRatio', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.estimatedFillRatio()).toBe(0)
    })

    it('should increase with adds', () => {
      const before = filter.estimatedFillRatio()
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.estimatedFillRatio()).toBeGreaterThan(before)
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 200; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.estimatedFillRatio()).toBeGreaterThanOrEqual(0)
      expect(filter.estimatedFillRatio()).toBeLessThanOrEqual(1)
    })

    it('should decrease after removals', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      const before = filter.estimatedFillRatio()
      for (let i = 0; i < 50; i++) {
        filter.remove(`item-${i}`)
      }
      expect(filter.estimatedFillRatio()).toBeLessThanOrEqual(before)
    })

    it('should return 0 after clear', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      filter.clear()
      expect(filter.estimatedFillRatio()).toBe(0)
    })
  })

  describe('expectedFalsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('should increase with more items', () => {
      filter.add('a')
      const rate1 = filter.expectedFalsePositiveRate()
      for (let i = 0; i < 500; i++) {
        filter.add(`item-${i}`)
      }
      const rate2 = filter.expectedFalsePositiveRate()
      expect(rate2).toBeGreaterThan(rate1)
    })

    it('should be positive for non-empty filter', () => {
      filter.add('test')
      expect(filter.expectedFalsePositiveRate()).toBeGreaterThan(0)
    })

    it('should be less than 1', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.expectedFalsePositiveRate()).toBeLessThan(1)
    })

    it('should return 0 after clear', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      filter.clear()
      expect(filter.expectedFalsePositiveRate()).toBe(0)
    })

    it('should decrease with more layers for same capacity', () => {
      const f2 = new CascadeFilter({ expectedItems: 100, falsePositiveRate: 0.01, layers: 2 })
      const f5 = new CascadeFilter({ expectedItems: 100, falsePositiveRate: 0.01, layers: 5 })
      for (let i = 0; i < 50; i++) {
        f2.add(`item-${i}`)
        f5.add(`item-${i}`)
      }
      expect(f5.expectedFalsePositiveRate()).toBeLessThan(f2.expectedFalsePositiveRate())
    })
  })

  describe('layerCount', () => {
    it('should return default layer count', () => {
      expect(filter.layerCount()).toBe(3)
    })

    it('should return custom layer count', () => {
      const f = new CascadeFilter({ layers: 7 })
      expect(f.layerCount()).toBe(7)
    })

    it('should return 1 for single layer', () => {
      const f = new CascadeFilter({ layers: 1 })
      expect(f.layerCount()).toBe(1)
    })
  })

  describe('capacity', () => {
    it('should return default capacity', () => {
      expect(filter.capacity()).toBe(DEFAULT_CASCADE_FILTER_OPTIONS.expectedItems)
    })

    it('should return custom capacity', () => {
      const f = new CascadeFilter({ expectedItems: 5000 })
      expect(f.capacity()).toBe(5000)
    })

    it('should not change after adding items', () => {
      filter.add('test')
      expect(filter.capacity()).toBe(DEFAULT_CASCADE_FILTER_OPTIONS.expectedItems)
    })
  })

  describe('size', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.size).toBe(0)
    })

    it('should reflect number of adds', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size).toBe(3)
    })

    it('should decrease after removal', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new filter', () => {
      expect(filter.isEmpty).toBe(true)
    })

    it('should be false after adding', () => {
      filter.add('test')
      expect(filter.isEmpty).toBe(false)
    })

    it('should be true after removing all', () => {
      filter.add('test')
      filter.remove('test')
      expect(filter.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.isEmpty).toBe(true)
    })
  })

  describe('optimize', () => {
    it('should return optimization result object', () => {
      const result = filter.optimize()
      expect(result).toHaveProperty('currentFillRatio')
      expect(result).toHaveProperty('currentFalsePositiveRate')
      expect(result).toHaveProperty('recommendedExpectedItems')
      expect(result).toHaveProperty('recommendedLayers')
      expect(result).toHaveProperty('estimatedSpaceEfficiency')
    })

    it('should return 0 fill ratio for empty filter', () => {
      const result = filter.optimize()
      expect(result.currentFillRatio).toBe(0)
    })

    it('should return 0 FPR for empty filter', () => {
      const result = filter.optimize()
      expect(result.currentFalsePositiveRate).toBe(0)
    })

    it('should recommend same items when empty', () => {
      const result = filter.optimize()
      expect(result.recommendedExpectedItems).toBe(filter.capacity())
    })

    it('should recommend more items when over capacity', () => {
      const f = new CascadeFilter({ expectedItems: 10 })
      for (let i = 0; i < 50; i++) {
        f.add(`item-${i}`)
      }
      const result = f.optimize()
      expect(result.recommendedExpectedItems).toBeGreaterThan(f.capacity())
    })

    it('should report space efficiency between 0 and 2', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      const result = filter.optimize()
      expect(result.estimatedSpaceEfficiency).toBeGreaterThan(0)
    })

    it('should return positive FPR for non-empty filter', () => {
      filter.add('test')
      const result = filter.optimize()
      expect(result.currentFalsePositiveRate).toBeGreaterThan(0)
    })

    it('should recommend more layers when FPR exceeds target', () => {
      const f = new CascadeFilter({ expectedItems: 5, falsePositiveRate: 0.0001, layers: 1 })
      for (let i = 0; i < 100; i++) {
        f.add(`item-${i}`)
      }
      const result = f.optimize()
      expect(result.recommendedLayers).toBeGreaterThanOrEqual(f.layerCount())
    })

    it('should not modify the filter', () => {
      filter.add('test')
      const sizeBefore = filter.size
      filter.optimize()
      expect(filter.size).toBe(sizeBefore)
      expect(filter.has('test')).toBe(true)
    })
  })

  describe('toJSON', () => {
    it('should return a valid JSON object', () => {
      const json = filter.toJSON()
      expect(json).toHaveProperty('layers')
      expect(json).toHaveProperty('expectedItems')
      expect(json).toHaveProperty('falsePositiveRate')
      expect(json).toHaveProperty('layerCount')
      expect(json).toHaveProperty('itemCount')
      expect(json).toHaveProperty('statistics')
    })

    it('should include correct layer count', () => {
      const json = filter.toJSON()
      expect(json.layers.length).toBe(filter.layerCount())
    })

    it('should include 0 itemCount for empty filter', () => {
      const json = filter.toJSON()
      expect(json.itemCount).toBe(0)
    })

    it('should include correct itemCount', () => {
      filter.add('a')
      filter.add('b')
      const json = filter.toJSON()
      expect(json.itemCount).toBe(2)
    })

    it('should include counters for each layer', () => {
      filter.add('test')
      const json = filter.toJSON()
      for (const layer of json.layers) {
        expect(layer.counters).toBeInstanceOf(Array)
        expect(layer.bitCount).toBeGreaterThan(0)
        expect(layer.hashCount).toBeGreaterThan(0)
      }
    })

    it('should serialize statistics', () => {
      filter.add('test')
      filter.has('test')
      const json = filter.toJSON()
      expect(json.statistics.adds).toBe(1)
      expect(json.statistics.lookups).toBe(1)
    })

    it('should include layerHits in statistics', () => {
      const json = filter.toJSON()
      expect(json.statistics.layerHits).toBeInstanceOf(Array)
      expect(json.statistics.layerHits.length).toBe(filter.layerCount())
    })

    it('should preserve expectedItems', () => {
      const f = new CascadeFilter({ expectedItems: 5000 })
      const json = f.toJSON()
      expect(json.expectedItems).toBe(5000)
    })

    it('should preserve falsePositiveRate', () => {
      const f = new CascadeFilter({ falsePositiveRate: 0.001 })
      const json = f.toJSON()
      expect(json.falsePositiveRate).toBe(0.001)
    })

    it('should be serializable to string', () => {
      filter.add('test')
      const json = filter.toJSON()
      const str = JSON.stringify(json)
      expect(str.length).toBeGreaterThan(0)
      const parsed = JSON.parse(str) as CascadeFilterJSON
      expect(parsed.itemCount).toBe(1)
    })
  })

  describe('fromJSON', () => {
    it('should restore filter from JSON', () => {
      filter.add('test')
      const json = filter.toJSON()
      const restored = CascadeFilter.fromJSON(json)
      expect(restored.size).toBe(1)
      expect(restored.has('test')).toBe(true)
    })

    it('should restore empty filter', () => {
      const json = filter.toJSON()
      const restored = CascadeFilter.fromJSON(json)
      expect(restored.isEmpty).toBe(true)
      expect(restored.size).toBe(0)
    })

    it('should restore correct layer count', () => {
      const f = new CascadeFilter({ layers: 5 })
      f.add('test')
      const json = f.toJSON()
      const restored = CascadeFilter.fromJSON(json)
      expect(restored.layerCount()).toBe(5)
    })

    it('should restore capacity', () => {
      const f = new CascadeFilter({ expectedItems: 5000 })
      f.add('test')
      const json = f.toJSON()
      const restored = CascadeFilter.fromJSON(json)
      expect(restored.capacity()).toBe(5000)
    })

    it('should restore statistics', () => {
      filter.add('a')
      filter.add('b')
      filter.has('a')
      const json = filter.toJSON()
      const restored = CascadeFilter.fromJSON(json)
      const stats = restored.getStatistics()
      expect(stats.adds).toBe(2)
      expect(stats.lookups).toBe(1)
    })

    it('should restore layerHits', () => {
      filter.add('test')
      filter.has('test')
      const json = filter.toJSON()
      const restored = CascadeFilter.fromJSON(json)
      const stats = restored.getStatistics()
      expect(stats.layerHits.length).toBe(filter.layerCount())
    })

    it('should handle round-trip serialization', () => {
      const f = new CascadeFilter({ expectedItems: 500, falsePositiveRate: 0.005, layers: 4 })
      for (let i = 0; i < 50; i++) {
        f.add(`item-${i}`)
      }
      const json1 = f.toJSON()
      const restored = CascadeFilter.fromJSON(json1)
      const json2 = restored.toJSON()
      expect(json2.itemCount).toBe(json1.itemCount)
      expect(json2.expectedItems).toBe(json1.expectedItems)
      expect(json2.falsePositiveRate).toBe(json1.falsePositiveRate)
      expect(json2.layerCount).toBe(json1.layerCount)
    })

    it('should find items in restored filter', () => {
      for (let i = 0; i < 20; i++) {
        filter.add(`item-${i}`)
      }
      const json = filter.toJSON()
      const restored = CascadeFilter.fromJSON(json)
      for (let i = 0; i < 20; i++) {
        expect(restored.has(`item-${i}`)).toBe(true)
      }
    })

    it('should work with type parameter', () => {
      const f = new CascadeFilter<number>()
      f.add(42)
      const json = f.toJSON()
      const restored = CascadeFilter.fromJSON<number>(json)
      expect(restored.has(42)).toBe(true)
    })
  })

  describe('getStatistics', () => {
    it('should return initial statistics', () => {
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.lookups).toBe(0)
      expect(stats.removals).toBe(0)
      expect(stats.totalChecks).toBe(0)
      expect(stats.falsePositiveEstimate).toBe(0)
    })

    it('should return correct layerHits array length', () => {
      const stats = filter.getStatistics()
      expect(stats.layerHits.length).toBe(filter.layerCount())
    })

    it('should track adds', () => {
      filter.add('a')
      filter.add('b')
      expect(filter.getStatistics().adds).toBe(2)
    })

    it('should track lookups', () => {
      filter.has('a')
      filter.has('b')
      expect(filter.getStatistics().lookups).toBe(2)
    })

    it('should track removals', () => {
      filter.add('a')
      filter.remove('a')
      filter.remove('b')
      expect(filter.getStatistics().removals).toBe(2)
    })

    it('should track totalChecks', () => {
      filter.add('test')
      filter.has('test')
      const stats = filter.getStatistics()
      expect(stats.totalChecks).toBe(filter.layerCount())
    })

    it('should return a copy of layerHits', () => {
      filter.add('test')
      filter.has('test')
      const stats1 = filter.getStatistics()
      stats1.layerHits[0] = 999
      const stats2 = filter.getStatistics()
      expect(stats2.layerHits[0]).not.toBe(999)
    })

    it('should not mutate internal state', () => {
      filter.add('test')
      const stats = filter.getStatistics()
      stats.adds = 999
      expect(filter.getStatistics().adds).toBe(1)
    })

    it('should compute falsePositiveEstimate', () => {
      filter.add('test')
      const stats = filter.getStatistics()
      expect(stats.falsePositiveEstimate).toBeGreaterThan(0)
    })

    it('should show 0 falsePositiveEstimate for empty filter', () => {
      expect(filter.getStatistics().falsePositiveEstimate).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      expect(typeof filter[Symbol.iterator]).toBe('function')
    })

    it('should return an iterator', () => {
      const iter = filter[Symbol.iterator]()
      expect(iter.next).toBeInstanceOf(Function)
    })

    it('should yield nothing for bloom filter', () => {
      filter.add('test')
      const items = [...filter]
      expect(items.length).toBe(0)
    })
  })

  describe('integration', () => {
    it('should handle bulk add and query', () => {
      const items = Array.from({ length: 500 }, (_, i) => `item-${i}`)
      for (const item of items) {
        filter.add(item)
      }
      let found = 0
      for (const item of items) {
        if (filter.has(item)) found++
      }
      expect(found).toBe(500)
    })

    it('should handle mixed add/remove/has operations', () => {
      filter.add('a')
      filter.add('b')
      expect(filter.has('a')).toBe(true)
      filter.remove('a')
      expect(filter.has('a')).toBe(false)
      expect(filter.has('b')).toBe(true)
      filter.add('c')
      expect(filter.has('c')).toBe(true)
      expect(filter.size).toBe(2)
    })

    it('should maintain statistics across operations', () => {
      filter.add('a')
      filter.add('b')
      filter.has('a')
      filter.has('b')
      filter.has('c')
      filter.remove('a')
      const stats = filter.getStatistics()
      expect(stats.adds).toBe(2)
      expect(stats.lookups).toBe(3)
      expect(stats.removals).toBe(1)
      expect(stats.totalChecks).toBeGreaterThan(0)
    })

    it('should survive JSON round-trip with data', () => {
      const f = new CascadeFilter({ expectedItems: 200, layers: 4 })
      for (let i = 0; i < 100; i++) {
        f.add(`item-${i}`)
      }
      const json = f.toJSON()
      const str = JSON.stringify(json)
      const parsed = JSON.parse(str) as CascadeFilterJSON
      const restored = CascadeFilter.fromJSON(parsed)
      for (let i = 0; i < 100; i++) {
        expect(restored.has(`item-${i}`)).toBe(true)
      }
      expect(restored.size).toBe(100)
    })

    it('should handle single layer filter operations', () => {
      const f = new CascadeFilter({ layers: 1 })
      f.add('test')
      expect(f.has('test')).toBe(true)
      expect(f.has('other')).toBe(false)
      f.remove('test')
      expect(f.has('test')).toBe(false)
    })

    it('should handle many layers', () => {
      const f = new CascadeFilter({ layers: 8, expectedItems: 100 })
      for (let i = 0; i < 50; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 50; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
      expect(f.layerCount()).toBe(8)
    })

    it('should handle high capacity filter', () => {
      const f = new CascadeFilter({ expectedItems: 100000, falsePositiveRate: 0.001 })
      for (let i = 0; i < 100; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(f.has(`item-${i}`)).toBe(true)
      }
    })

    it('should handle add-remove-add cycle', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        filter.add('test')
        expect(filter.has('test')).toBe(true)
        filter.remove('test')
      }
      expect(filter.getStatistics().adds).toBe(5)
      expect(filter.getStatistics().removals).toBe(5)
    })

    it('should handle boolean items', () => {
      const f = new CascadeFilter<boolean>()
      f.add(true)
      f.add(false)
      expect(f.has(true)).toBe(true)
      expect(f.has(false)).toBe(true)
      expect(f.size).toBe(2)
    })

    it('should handle null items', () => {
      const f = new CascadeFilter<null>()
      f.add(null)
      expect(f.has(null)).toBe(true)
    })
  })
})
