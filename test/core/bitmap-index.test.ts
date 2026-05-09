import { describe, it, expect, beforeEach } from 'vitest'
import { BitmapIndex } from '../../src/core/bitmap-index/bitmap-index.js'
import type { BitmapIndexStats } from '../../src/core/bitmap-index/types.js'

describe('BitmapIndex', () => {
  let index: BitmapIndex

  beforeEach(() => {
    index = new BitmapIndex(100)
    index.addField('color', 4)
    index.addField('size', 3)
  })

  describe('constructor', () => {
    it('should create an index with given number of records', () => {
      const idx = new BitmapIndex(50)
      expect(idx.getNumRecords()).toBe(50)
    })

    it('should create an index with 0 records', () => {
      const idx = new BitmapIndex(0)
      expect(idx.getNumRecords()).toBe(0)
    })

    it('should throw on negative numRecords', () => {
      expect(() => new BitmapIndex(-1)).toThrow(RangeError)
    })

    it('should throw on non-integer numRecords', () => {
      expect(() => new BitmapIndex(10.5 as unknown as number)).toThrow(RangeError)
    })

    it('should throw on NaN numRecords', () => {
      expect(() => new BitmapIndex(NaN)).toThrow(RangeError)
    })

    it('should throw on Infinity numRecords', () => {
      expect(() => new BitmapIndex(Infinity)).toThrow(RangeError)
    })

    it('should create an index with no fields initially', () => {
      const idx = new BitmapIndex(10)
      expect(idx.getFields()).toEqual([])
    })

    it('should handle large numRecords', () => {
      const idx = new BitmapIndex(1_000_000)
      expect(idx.getNumRecords()).toBe(1_000_000)
    })
  })

  describe('addField', () => {
    it('should add a field to the index', () => {
      const idx = new BitmapIndex(10)
      idx.addField('status', 2)
      expect(idx.getFields()).toContain('status')
    })

    it('should track cardinality of added field', () => {
      const idx = new BitmapIndex(10)
      idx.addField('grade', 5)
      expect(idx.getCardinality('grade')).toBe(5)
    })

    it('should add multiple fields', () => {
      const idx = new BitmapIndex(10)
      idx.addField('a', 2)
      idx.addField('b', 3)
      idx.addField('c', 10)
      expect(idx.getFields()).toEqual(['a', 'b', 'c'])
    })

    it('should throw on duplicate field name', () => {
      const idx = new BitmapIndex(10)
      idx.addField('dup', 2)
      expect(() => idx.addField('dup', 3)).toThrow(/already exists/)
    })

    it('should throw on empty field name', () => {
      const idx = new BitmapIndex(10)
      expect(() => idx.addField('', 2)).toThrow(/non-empty string/)
    })

    it('should throw on cardinality of 0', () => {
      const idx = new BitmapIndex(10)
      expect(() => idx.addField('bad', 0)).toThrow(RangeError)
    })

    it('should throw on negative cardinality', () => {
      const idx = new BitmapIndex(10)
      expect(() => idx.addField('bad', -1)).toThrow(RangeError)
    })

    it('should throw on non-integer cardinality', () => {
      const idx = new BitmapIndex(10)
      expect(() => idx.addField('bad', 2.5 as unknown as number)).toThrow(RangeError)
    })

    it('should accept cardinality of 1', () => {
      const idx = new BitmapIndex(10)
      idx.addField('single', 1)
      expect(idx.getCardinality('single')).toBe(1)
    })

    it('should accept large cardinality', () => {
      const idx = new BitmapIndex(10)
      idx.addField('big', 1000)
      expect(idx.getCardinality('big')).toBe(1000)
    })
  })

  describe('set and get', () => {
    it('should set and get a value', () => {
      index.set('color', 0, 2)
      expect(index.get('color', 0)).toBe(2)
    })

    it('should set value 0', () => {
      index.set('color', 5, 0)
      expect(index.get('color', 5)).toBe(0)
    })

    it('should set max valid value', () => {
      index.set('color', 10, 3)
      expect(index.get('color', 10)).toBe(3)
    })

    it('should overwrite previous value', () => {
      index.set('color', 0, 1)
      index.set('color', 0, 3)
      expect(index.get('color', 0)).toBe(3)
    })

    it('should return -1 for unset record', () => {
      expect(index.get('color', 50)).toBe(-1)
    })

    it('should throw on non-existent field', () => {
      expect(() => index.set('nonexistent', 0, 0)).toThrow(/not found/)
    })

    it('should throw on get non-existent field', () => {
      expect(() => index.get('nonexistent', 0)).toThrow(/not found/)
    })

    it('should throw on negative record index', () => {
      expect(() => index.set('color', -1, 0)).toThrow(RangeError)
    })

    it('should throw on record index >= numRecords', () => {
      expect(() => index.set('color', 100, 0)).toThrow(RangeError)
    })

    it('should throw on negative value', () => {
      expect(() => index.set('color', 0, -1)).toThrow(RangeError)
    })

    it('should throw on value >= cardinality', () => {
      expect(() => index.set('color', 0, 4)).toThrow(RangeError)
    })

    it('should throw on non-integer value', () => {
      expect(() => index.set('color', 0, 1.5 as unknown as number)).toThrow(RangeError)
    })

    it('should throw on non-integer record index', () => {
      expect(() => index.set('color', 0.5 as unknown as number, 0)).toThrow(RangeError)
    })

    it('should set multiple records independently', () => {
      index.set('color', 0, 1)
      index.set('color', 1, 2)
      index.set('color', 2, 3)
      expect(index.get('color', 0)).toBe(1)
      expect(index.get('color', 1)).toBe(2)
      expect(index.get('color', 2)).toBe(3)
    })

    it('should handle setting across different fields', () => {
      index.set('color', 0, 2)
      index.set('size', 0, 1)
      expect(index.get('color', 0)).toBe(2)
      expect(index.get('size', 0)).toBe(1)
    })

    it('should handle last valid record index', () => {
      index.set('color', 99, 1)
      expect(index.get('color', 99)).toBe(1)
    })

    it('should handle first record index', () => {
      index.set('color', 0, 3)
      expect(index.get('color', 0)).toBe(3)
    })

    it('overwriting should clear the old value bitmap', () => {
      index.set('color', 10, 1)
      expect(index.queryEquals('color', 1)).toContain(10)
      index.set('color', 10, 2)
      expect(index.queryEquals('color', 1)).not.toContain(10)
      expect(index.queryEquals('color', 2)).toContain(10)
    })
  })

  describe('queryEquals', () => {
    beforeEach(() => {
      for (let i = 0; i < 20; i++) {
        index.set('color', i, i % 4)
      }
    })

    it('should return all records with value 0', () => {
      const result = index.queryEquals('color', 0)
      expect(result).toEqual([0, 4, 8, 12, 16])
    })

    it('should return all records with value 1', () => {
      const result = index.queryEquals('color', 1)
      expect(result).toEqual([1, 5, 9, 13, 17])
    })

    it('should return all records with value 2', () => {
      const result = index.queryEquals('color', 2)
      expect(result).toEqual([2, 6, 10, 14, 18])
    })

    it('should return all records with value 3', () => {
      const result = index.queryEquals('color', 3)
      expect(result).toEqual([3, 7, 11, 15, 19])
    })

    it('should return empty array for value with no records', () => {
      index.set('color', 0, 1)
      const result = index.queryEquals('color', 0)
      expect(result).not.toContain(0)
    })

    it('should throw on non-existent field', () => {
      expect(() => index.queryEquals('nonexistent', 0)).toThrow(/not found/)
    })

    it('should throw on value out of range', () => {
      expect(() => index.queryEquals('color', 4)).toThrow(RangeError)
    })

    it('should throw on negative value', () => {
      expect(() => index.queryEquals('color', -1)).toThrow(RangeError)
    })

    it('should return results in sorted order', () => {
      const result = index.queryEquals('color', 0)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]!).toBeGreaterThan(result[i - 1]!)
      }
    })
  })

  describe('queryRange', () => {
    beforeEach(() => {
      for (let i = 0; i < 20; i++) {
        index.set('color', i, i % 4)
      }
    })

    it('should return records with values in range [0, 1]', () => {
      const result = index.queryRange('color', 0, 1)
      expect(result).toEqual([0, 1, 4, 5, 8, 9, 12, 13, 16, 17])
    })

    it('should return records with values in range [2, 3]', () => {
      const result = index.queryRange('color', 2, 3)
      expect(result).toEqual([2, 3, 6, 7, 10, 11, 14, 15, 18, 19])
    })

    it('should return all records for full range [0, cardinality-1]', () => {
      const result = index.queryRange('color', 0, 3)
      expect(result.sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i))
    })

    it('should return same as queryEquals for single-value range', () => {
      const equals = index.queryEquals('color', 2)
      const range = index.queryRange('color', 2, 2)
      expect(range).toEqual(equals)
    })

    it('should throw on min > max', () => {
      expect(() => index.queryRange('color', 3, 1)).toThrow(/must be <=/)
    })

    it('should throw on min out of bounds', () => {
      expect(() => index.queryRange('color', -1, 2)).toThrow(RangeError)
    })

    it('should throw on max out of bounds', () => {
      expect(() => index.queryRange('color', 0, 4)).toThrow(RangeError)
    })

    it('should throw on non-existent field', () => {
      expect(() => index.queryRange('nonexistent', 0, 1)).toThrow(/not found/)
    })

    it('should throw on non-integer min', () => {
      expect(() => index.queryRange('color', 0.5 as unknown as number, 1)).toThrow(TypeError)
    })

    it('should throw on non-integer max', () => {
      expect(() => index.queryRange('color', 0, 1.5 as unknown as number)).toThrow(TypeError)
    })

    it('should return results in sorted order', () => {
      const result = index.queryRange('color', 1, 2)
      for (let i = 1; i < result.length; i++) {
        expect(result[i]!).toBeGreaterThan(result[i - 1]!)
      }
    })
  })

  describe('queryAnd', () => {
    beforeEach(() => {
      for (let i = 0; i < 30; i++) {
        index.set('color', i, i % 4)
        index.set('size', i, i % 3)
      }
    })

    it('should return intersection of two sets', () => {
      const color0 = index.queryEquals('color', 0)
      const size0 = index.queryEquals('size', 0)
      const result = index.queryAnd([color0, size0])
      expect(result.sort((a, b) => a - b)).toEqual([0, 12, 24])
    })

    it('should return intersection of three sets', () => {
      const color1 = index.queryEquals('color', 1)
      const size2 = index.queryEquals('size', 2)
      const manual = [5, 17, 29]
      const result = index.queryAnd([color1, size2, manual])
      expect(result.sort((a, b) => a - b)).toEqual([5, 17, 29])
    })

    it('should return empty for no intersection', () => {
      const color0 = index.queryEquals('color', 0)
      const color1 = index.queryEquals('color', 1)
      const result = index.queryAnd([color0, color1])
      expect(result).toEqual([])
    })

    it('should return empty array for empty input', () => {
      expect(index.queryAnd([])).toEqual([])
    })

    it('should return copy of single set', () => {
      const set = [1, 2, 3]
      const result = index.queryAnd([set])
      expect(result).toEqual([1, 2, 3])
    })

    it('should return copy, not reference', () => {
      const set = [1, 2, 3]
      const result = index.queryAnd([set])
      result.push(4)
      expect(set).toEqual([1, 2, 3])
    })

    it('should handle intersection with empty set', () => {
      const color0 = index.queryEquals('color', 0)
      const result = index.queryAnd([color0, []])
      expect(result).toEqual([])
    })

    it('should handle duplicate indices in input sets', () => {
      const result = index.queryAnd([[1, 1, 2], [1, 2, 2]])
      expect(result.sort((a, b) => a - b)).toEqual([1, 2])
    })
  })

  describe('queryOr', () => {
    beforeEach(() => {
      for (let i = 0; i < 30; i++) {
        index.set('color', i, i % 4)
        index.set('size', i, i % 3)
      }
    })

    it('should return union of two sets', () => {
      const color0 = index.queryEquals('color', 0)
      const color1 = index.queryEquals('color', 1)
      const result = index.queryOr([color0, color1])
      expect(result.sort((a, b) => a - b)).toEqual([0, 1, 4, 5, 8, 9, 12, 13, 16, 17, 20, 21, 24, 25, 28, 29])
    })

    it('should return empty array for empty input', () => {
      expect(index.queryOr([])).toEqual([])
    })

    it('should return copy of single set', () => {
      const set = [1, 2, 3]
      const result = index.queryOr([set])
      expect(result).toEqual([1, 2, 3])
    })

    it('should handle union of overlapping sets', () => {
      const result = index.queryOr([[1, 2, 3], [2, 3, 4]])
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3, 4])
    })

    it('should handle union with empty set', () => {
      const color0 = index.queryEquals('color', 0)
      const result = index.queryOr([color0, []])
      expect(result.sort((a, b) => a - b)).toEqual(color0.sort((a, b) => a - b))
    })

    it('should deduplicate indices', () => {
      const result = index.queryOr([[1, 2], [2, 3], [1, 3]])
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('should ignore negative indices', () => {
      const result = index.queryOr([[-1, 0, 1], [2, -5]])
      expect(result.sort((a, b) => a - b)).toEqual([0, 1, 2])
    })

    it('should ignore out-of-range indices', () => {
      const result = index.queryOr([[0, 1], [200, 300]])
      expect(result.sort((a, b) => a - b)).toEqual([0, 1])
    })
  })

  describe('countResults', () => {
    it('should return length of result array', () => {
      expect(index.countResults([1, 2, 3, 4, 5])).toBe(5)
    })

    it('should return 0 for empty array', () => {
      expect(index.countResults([])).toBe(0)
    })

    it('should count after queryEquals', () => {
      for (let i = 0; i < 20; i++) {
        index.set('color', i, i % 4)
      }
      const result = index.queryEquals('color', 0)
      expect(index.countResults(result)).toBe(5)
    })
  })

  describe('getNumRecords', () => {
    it('should return the number of records', () => {
      expect(index.getNumRecords()).toBe(100)
    })

    it('should return 0 for empty index', () => {
      const idx = new BitmapIndex(0)
      expect(idx.getNumRecords()).toBe(0)
    })
  })

  describe('getFields', () => {
    it('should return all field names', () => {
      expect(index.getFields()).toEqual(['color', 'size'])
    })

    it('should return empty array for no fields', () => {
      const idx = new BitmapIndex(10)
      expect(idx.getFields()).toEqual([])
    })

    it('should return fields in insertion order', () => {
      const idx = new BitmapIndex(10)
      idx.addField('z', 2)
      idx.addField('a', 2)
      idx.addField('m', 2)
      expect(idx.getFields()).toEqual(['z', 'a', 'm'])
    })
  })

  describe('getCardinality', () => {
    it('should return cardinality of existing field', () => {
      expect(index.getCardinality('color')).toBe(4)
      expect(index.getCardinality('size')).toBe(3)
    })

    it('should throw for non-existent field', () => {
      expect(() => index.getCardinality('nonexistent')).toThrow(/not found/)
    })
  })

  describe('clear', () => {
    it('should clear all data', () => {
      for (let i = 0; i < 10; i++) {
        index.set('color', i, i % 4)
      }
      index.clear()
      for (let i = 0; i < 10; i++) {
        expect(index.get('color', i)).toBe(-1)
      }
    })

    it('should clear all fields', () => {
      for (let i = 0; i < 10; i++) {
        index.set('color', i, 1)
        index.set('size', i, 2)
      }
      index.clear()
      expect(index.get('color', 0)).toBe(-1)
      expect(index.get('size', 0)).toBe(-1)
    })

    it('should preserve field definitions after clear', () => {
      index.clear()
      expect(index.getFields()).toEqual(['color', 'size'])
      expect(index.getCardinality('color')).toBe(4)
    })

    it('should allow setting values after clear', () => {
      index.set('color', 0, 2)
      index.clear()
      index.set('color', 0, 1)
      expect(index.get('color', 0)).toBe(1)
    })

    it('queryEquals should return empty after clear', () => {
      for (let i = 0; i < 10; i++) {
        index.set('color', i, 1)
      }
      index.clear()
      expect(index.queryEquals('color', 1)).toEqual([])
    })
  })

  describe('getStats', () => {
    it('should return correct stats', () => {
      const stats = index.getStats()
      expect(stats.numRecords).toBe(100)
      expect(stats.fields).toEqual(['color', 'size'])
      expect(stats.cardinalities).toEqual({ color: 4, size: 3 })
    })

    it('should calculate memory usage', () => {
      const stats = index.getStats()
      expect(stats.memoryUsage).toBeGreaterThan(0)
    })

    it('should report 0 memory for empty index', () => {
      const idx = new BitmapIndex(10)
      expect(idx.getStats().memoryUsage).toBe(0)
    })
  })

  describe('serialization', () => {
    it('should serialize to JSON and back', () => {
      for (let i = 0; i < 10; i++) {
        index.set('color', i, i % 4)
        index.set('size', i, i % 3)
      }
      const json = index.toJSON()
      const restored = BitmapIndex.fromJSON(json as Record<string, unknown>)

      expect(restored.getNumRecords()).toBe(100)
      expect(restored.getFields()).toEqual(['color', 'size'])
      expect(restored.getCardinality('color')).toBe(4)
      expect(restored.getCardinality('size')).toBe(3)

      for (let i = 0; i < 10; i++) {
        expect(restored.get('color', i)).toBe(i % 4)
        expect(restored.get('size', i)).toBe(i % 3)
      }
    })

    it('should preserve queries after deserialization', () => {
      for (let i = 0; i < 20; i++) {
        index.set('color', i, i % 4)
      }
      const json = index.toJSON()
      const restored = BitmapIndex.fromJSON(json as Record<string, unknown>)
      expect(restored.queryEquals('color', 0).sort((a, b) => a - b)).toEqual([0, 4, 8, 12, 16])
    })

    it('should handle empty index serialization', () => {
      const idx = new BitmapIndex(50)
      const json = idx.toJSON()
      const restored = BitmapIndex.fromJSON(json as Record<string, unknown>)
      expect(restored.getNumRecords()).toBe(50)
      expect(restored.getFields()).toEqual([])
    })
  })

  describe('boundary conditions', () => {
    it('should handle index with 0 records', () => {
      const idx = new BitmapIndex(0)
      idx.addField('test', 2)
      expect(idx.queryEquals('test', 0)).toEqual([])
    })

    it('should handle records at word boundaries (bit 32)', () => {
      const idx = new BitmapIndex(64)
      idx.addField('val', 2)
      idx.set('val', 31, 0)
      idx.set('val', 32, 1)
      idx.set('val', 63, 0)
      expect(idx.get('val', 31)).toBe(0)
      expect(idx.get('val', 32)).toBe(1)
      expect(idx.get('val', 63)).toBe(0)
      expect(idx.queryEquals('val', 0)).toEqual([31, 63])
      expect(idx.queryEquals('val', 1)).toEqual([32])
    })

    it('should handle exactly one word of records', () => {
      const idx = new BitmapIndex(32)
      idx.addField('v', 2)
      idx.set('v', 0, 0)
      idx.set('v', 31, 1)
      expect(idx.get('v', 0)).toBe(0)
      expect(idx.get('v', 31)).toBe(1)
      expect(idx.queryEquals('v', 0)).toEqual([0])
      expect(idx.queryEquals('v', 1)).toEqual([31])
    })

    it('should handle 33 records (spanning two words)', () => {
      const idx = new BitmapIndex(33)
      idx.addField('v', 3)
      idx.set('v', 32, 2)
      expect(idx.get('v', 32)).toBe(2)
      expect(idx.queryEquals('v', 2)).toEqual([32])
    })

    it('should handle large number of records', () => {
      const idx = new BitmapIndex(1000)
      idx.addField('cat', 10)
      for (let i = 0; i < 1000; i++) {
        idx.set('cat', i, i % 10)
      }
      const result = idx.queryEquals('cat', 5)
      expect(result.length).toBe(100)
      expect(result[0]).toBe(5)
      expect(result[1]).toBe(15)
    })
  })

  describe('complex queries', () => {
    it('should combine queryEquals with queryAnd', () => {
      for (let i = 0; i < 30; i++) {
        index.set('color', i, i % 4)
        index.set('size', i, i % 3)
      }
      const color0 = index.queryEquals('color', 0)
      const size1 = index.queryEquals('size', 1)
      const result = index.queryAnd([color0, size1])
      expect(result.sort((a, b) => a - b)).toEqual([4, 16, 28])
    })

    it('should combine queryRange with queryAnd', () => {
      for (let i = 0; i < 30; i++) {
        index.set('color', i, i % 4)
        index.set('size', i, i % 3)
      }
      const colorRange = index.queryRange('color', 0, 1)
      const sizeRange = index.queryRange('size', 0, 1)
      const result = index.queryAnd([colorRange, sizeRange])
      expect(result.sort((a, b) => a - b)).toEqual([0, 1, 4, 9, 12, 13, 16, 21, 24, 25, 28])
    })

    it('should combine queryOr with queryAnd', () => {
      for (let i = 0; i < 20; i++) {
        index.set('color', i, i % 4)
      }
      const set1 = index.queryEquals('color', 0)
      const set2 = index.queryEquals('color', 1)
      const orResult = index.queryOr([set1, set2])
      const rangeResult = index.queryRange('color', 0, 1)
      const andResult = index.queryAnd([orResult, rangeResult])
      expect(andResult.sort((a, b) => a - b)).toEqual([0, 1, 4, 5, 8, 9, 12, 13, 16, 17])
    })

    it('should handle multi-field AND query', () => {
      const idx = new BitmapIndex(100)
      idx.addField('country', 5)
      idx.addField('status', 3)
      idx.addField('category', 4)
      for (let i = 0; i < 100; i++) {
        idx.set('country', i, i % 5)
        idx.set('status', i, i % 3)
        idx.set('category', i, i % 4)
      }
      const c0 = idx.queryEquals('country', 0)
      const s0 = idx.queryEquals('status', 0)
      const cat0 = idx.queryEquals('category', 0)
      const result = idx.queryAnd([c0, s0, cat0])
      expect(result.sort((a, b) => a - b)).toEqual([0, 60])
    })

    it('should handle queryRange followed by queryOr', () => {
      for (let i = 0; i < 20; i++) {
        index.set('color', i, i % 4)
      }
      const low = index.queryRange('color', 0, 1)
      const high = index.queryRange('color', 2, 3)
      const result = index.queryOr([low, high])
      expect(result.sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i))
    })
  })

  describe('edge cases with set/get', () => {
    it('should handle setting same value twice', () => {
      index.set('color', 5, 2)
      index.set('color', 5, 2)
      expect(index.get('color', 5)).toBe(2)
      expect(index.queryEquals('color', 2)).toEqual([5])
    })

    it('should handle rapid value changes', () => {
      for (let v = 0; v < 4; v++) {
        index.set('color', 10, v)
        expect(index.get('color', 10)).toBe(v)
      }
    })

    it('should handle all records set to same value', () => {
      for (let i = 0; i < 100; i++) {
        index.set('color', i, 2)
      }
      const result = index.queryEquals('color', 2)
      expect(result.length).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(result).toContain(i)
      }
    })

    it('should handle sparse data (few records set)', () => {
      index.set('color', 5, 1)
      index.set('color', 50, 3)
      index.set('color', 95, 0)
      expect(index.queryEquals('color', 1)).toEqual([5])
      expect(index.queryEquals('color', 3)).toEqual([50])
      expect(index.queryEquals('color', 0)).toEqual([95])
    })
  })

  describe('queryAnd and queryOr consistency', () => {
    it('AND of single set with itself equals the set', () => {
      for (let i = 0; i < 10; i++) {
        index.set('color', i, i % 4)
      }
      const set = index.queryEquals('color', 0)
      const result = index.queryAnd([set, set])
      expect(result.sort((a, b) => a - b)).toEqual(set.sort((a, b) => a - b))
    })

    it('OR of single set with itself equals the set', () => {
      for (let i = 0; i < 10; i++) {
        index.set('color', i, i % 4)
      }
      const set = index.queryEquals('color', 0)
      const result = index.queryOr([set, set])
      expect(result.sort((a, b) => a - b)).toEqual(set.sort((a, b) => a - b))
    })

    it('AND distributes over multiple sets correctly', () => {
      const a = [0, 1, 2, 3, 4]
      const b = [2, 3, 4, 5, 6]
      const c = [1, 3, 4, 7]
      const result = index.queryAnd([a, b, c])
      expect(result.sort((a, b) => a - b)).toEqual([3, 4])
    })

    it('OR distributes over multiple sets correctly', () => {
      const a = [0, 1]
      const b = [2, 3]
      const c = [4, 5]
      const result = index.queryOr([a, b, c])
      expect(result.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5])
    })
  })

  describe('field with cardinality 1', () => {
    it('should work with cardinality 1 field', () => {
      const idx = new BitmapIndex(10)
      idx.addField('flag', 1)
      idx.set('flag', 0, 0)
      idx.set('flag', 5, 0)
      expect(idx.get('flag', 0)).toBe(0)
      expect(idx.get('flag', 5)).toBe(0)
      expect(idx.queryEquals('flag', 0)).toEqual([0, 5])
    })

    it('should throw when setting value 1 on cardinality 1 field', () => {
      const idx = new BitmapIndex(10)
      idx.addField('flag', 1)
      expect(() => idx.set('flag', 0, 1)).toThrow(RangeError)
    })
  })

  describe('realistic use case', () => {
    it('should support filtering product catalog', () => {
      const catalog = new BitmapIndex(1000)
      catalog.addField('category', 5)
      catalog.addField('priceRange', 4)
      catalog.addField('inStock', 2)

      for (let i = 0; i < 1000; i++) {
        catalog.set('category', i, i % 5)
        catalog.set('priceRange', i, i % 4)
        catalog.set('inStock', i, i % 2)
      }

      const electronics = catalog.queryEquals('category', 0)
      const midPrice = catalog.queryEquals('priceRange', 1)
      const inStock = catalog.queryEquals('inStock', 1)
      const result = catalog.queryAnd([electronics, midPrice, inStock])

      expect(result.length).toBeGreaterThan(0)
      for (const idx of result) {
        expect(idx % 5).toBe(0)
        expect(idx % 4).toBe(1)
        expect(idx % 2).toBe(1)
      }
    })

    it('should support OR queries for category expansion', () => {
      const catalog = new BitmapIndex(200)
      catalog.addField('tag', 5)
      for (let i = 0; i < 200; i++) {
        catalog.set('tag', i, i % 5)
      }
      const tag0 = catalog.queryEquals('tag', 0)
      const tag1 = catalog.queryEquals('tag', 1)
      const combined = catalog.queryOr([tag0, tag1])
      expect(combined.length).toBe(80)
    })
  })

  describe('additional edge cases', () => {
    it('should handle queryRange on size field', () => {
      const idx = new BitmapIndex(12)
      idx.addField('v', 5)
      for (let i = 0; i < 12; i++) {
        idx.set('v', i, i % 5)
      }
      const result = idx.queryRange('v', 1, 3)
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3, 6, 7, 8, 11])
    })

    it('should handle queryOr with many small sets', () => {
      const sets = [[0], [2], [4], [6], [8]]
      const result = index.queryOr(sets)
      expect(result.sort((a, b) => a - b)).toEqual([0, 2, 4, 6, 8])
    })

    it('should handle queryAnd with all same sets', () => {
      const set = [3, 7, 11]
      const result = index.queryAnd([set, set, set])
      expect(result.sort((a, b) => a - b)).toEqual([3, 7, 11])
    })

    it('should handle clear on empty index', () => {
      const idx = new BitmapIndex(10)
      idx.addField('v', 2)
      expect(() => idx.clear()).not.toThrow()
    })

    it('should return correct stats after clear', () => {
      for (let i = 0; i < 10; i++) {
        index.set('color', i, 1)
      }
      index.clear()
      const stats = index.getStats()
      expect(stats.numRecords).toBe(100)
      expect(stats.fields).toEqual(['color', 'size'])
    })

    it('should handle queryEquals for unset field data', () => {
      const idx = new BitmapIndex(10)
      idx.addField('empty', 3)
      expect(idx.queryEquals('empty', 0)).toEqual([])
      expect(idx.queryEquals('empty', 1)).toEqual([])
      expect(idx.queryEquals('empty', 2)).toEqual([])
    })

    it('should handle queryRange for unset field data', () => {
      const idx = new BitmapIndex(10)
      idx.addField('empty', 3)
      expect(idx.queryRange('empty', 0, 2)).toEqual([])
    })

    it('should correctly serialize and deserialize cleared index', () => {
      for (let i = 0; i < 10; i++) {
        index.set('color', i, 1)
      }
      index.clear()
      const json = index.toJSON()
      const restored = BitmapIndex.fromJSON(json as Record<string, unknown>)
      expect(restored.get('color', 0)).toBe(-1)
      expect(restored.queryEquals('color', 1)).toEqual([])
    })

    it('should handle get on unset record in unset field', () => {
      const idx = new BitmapIndex(10)
      idx.addField('v', 3)
      expect(idx.get('v', 5)).toBe(-1)
    })

    it('should handle large cardinality range query', () => {
      const idx = new BitmapIndex(50)
      idx.addField('big', 20)
      for (let i = 0; i < 50; i++) {
        idx.set('big', i, i % 20)
      }
      const result = idx.queryRange('big', 0, 19)
      expect(result.sort((a, b) => a - b)).toEqual(Array.from({ length: 50 }, (_, i) => i))
    })
  })
})
