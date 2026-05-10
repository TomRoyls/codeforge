import { describe, it, expect, beforeEach } from 'vitest'
import { RoaringBitmap } from '../../src/core/roaring-bitmap/roaring-bitmap.js'
import { DEFAULT_ROARING_BITMAP_OPTIONS } from '../../src/core/roaring-bitmap/types.js'
import type { RoaringBitmapOptions, RoaringBitmapJSON, RoaringBitmapStatistics } from '../../src/core/roaring-bitmap/types.js'

describe('RoaringBitmap', () => {
  let bm: RoaringBitmap

  beforeEach(() => {
    bm = new RoaringBitmap()
  })

  describe('constructor', () => {
    it('should create with no options', () => {
      const r = new RoaringBitmap()
      expect(r.isEmpty).toBe(true)
      expect(r.cardinality).toBe(0)
    })

    it('should create with empty options', () => {
      const r = new RoaringBitmap({})
      expect(r.isEmpty).toBe(true)
    })

    it('should create with partial options', () => {
      const r = new RoaringBitmap({ runOptimizeOnAdd: true })
      expect(r.isEmpty).toBe(true)
    })

    it('should create with all options', () => {
      const r = new RoaringBitmap({ runOptimizeOnAdd: true, runOptimizeThreshold: 2, initialCapacity: 100 })
      expect(r.isEmpty).toBe(true)
    })

    it('should accept options object conforming to RoaringBitmapOptions type', () => {
      const opts: RoaringBitmapOptions = { runOptimizeOnAdd: false }
      const r = new RoaringBitmap(opts)
      expect(r.isEmpty).toBe(true)
    })
  })

  describe('add', () => {
    it('should add a single value', () => {
      bm.add(0)
      expect(bm.has(0)).toBe(true)
      expect(bm.cardinality).toBe(1)
    })

    it('should add multiple values', () => {
      bm.add(1)
      bm.add(2)
      bm.add(3)
      expect(bm.cardinality).toBe(3)
    })

    it('should handle adding same value twice', () => {
      bm.add(42)
      bm.add(42)
      expect(bm.cardinality).toBe(1)
    })

    it('should track add statistics', () => {
      bm.add(1)
      bm.add(2)
      expect(bm.getStatistics().adds).toBe(2)
    })

    it('should not increment stats on duplicate add', () => {
      bm.add(1)
      bm.add(1)
      expect(bm.getStatistics().adds).toBe(1)
    })

    it('should handle value 0', () => {
      bm.add(0)
      expect(bm.has(0)).toBe(true)
    })

    it('should handle max uint32 value', () => {
      bm.add(0xFFFFFFFF)
      expect(bm.has(0xFFFFFFFF)).toBe(true)
    })

    it('should handle values in different chunks', () => {
      bm.add(0x00000000)
      bm.add(0x00010000)
      bm.add(0x00020000)
      expect(bm.cardinality).toBe(3)
      expect(bm.has(0x00000000)).toBe(true)
      expect(bm.has(0x00010000)).toBe(true)
      expect(bm.has(0x00020000)).toBe(true)
    })

    it('should convert array to bitmap when exceeding threshold', () => {
      for (let i = 0; i < 5000; i++) {
        bm.add(i)
      }
      expect(bm.cardinality).toBe(5000)
      expect(bm.getStatistics().containerConversions).toBeGreaterThan(0)
    })

    it('should add values in reverse order', () => {
      bm.add(100)
      bm.add(50)
      bm.add(1)
      expect(bm.cardinality).toBe(3)
      expect(bm.toArray()).toEqual([1, 50, 100])
    })
  })

  describe('has', () => {
    it('should return false for empty bitmap', () => {
      expect(bm.has(0)).toBe(false)
      expect(bm.has(42)).toBe(false)
    })

    it('should return true for added value', () => {
      bm.add(42)
      expect(bm.has(42)).toBe(true)
    })

    it('should return false for non-added value', () => {
      bm.add(1)
      expect(bm.has(2)).toBe(false)
    })

    it('should return false after removal', () => {
      bm.add(42)
      bm.remove(42)
      expect(bm.has(42)).toBe(false)
    })

    it('should find values across different chunks', () => {
      bm.add(0)
      bm.add(0xFFFF)
      bm.add(0x10000)
      bm.add(0xFFFFFFFF)
      expect(bm.has(0)).toBe(true)
      expect(bm.has(0xFFFF)).toBe(true)
      expect(bm.has(0x10000)).toBe(true)
      expect(bm.has(0xFFFFFFFF)).toBe(true)
      expect(bm.has(1)).toBe(false)
    })
  })

  describe('remove', () => {
    it('should remove an existing value', () => {
      bm.add(42)
      bm.remove(42)
      expect(bm.has(42)).toBe(false)
      expect(bm.cardinality).toBe(0)
    })

    it('should handle removing non-existent value', () => {
      bm.remove(99)
      expect(bm.cardinality).toBe(0)
      expect(bm.getStatistics().removes).toBe(0)
    })

    it('should track remove statistics', () => {
      bm.add(1)
      bm.add(2)
      bm.remove(1)
      expect(bm.getStatistics().removes).toBe(1)
    })

    it('should remove from middle of array container', () => {
      bm.add(1)
      bm.add(5)
      bm.add(10)
      bm.remove(5)
      expect(bm.has(1)).toBe(true)
      expect(bm.has(5)).toBe(false)
      expect(bm.has(10)).toBe(true)
      expect(bm.cardinality).toBe(2)
    })

    it('should convert bitmap to array when cardinality drops', () => {
      for (let i = 0; i < 5000; i++) {
        bm.add(i)
      }
      for (let i = 0; i < 4500; i++) {
        bm.remove(i)
      }
      expect(bm.cardinality).toBe(500)
      expect(bm.getStatistics().containerConversions).toBeGreaterThan(1)
    })

    it('should delete container when empty after removal', () => {
      bm.add(42)
      bm.remove(42)
      expect(bm.isEmpty).toBe(true)
    })

    it('should handle remove after add-remove-add cycle', () => {
      bm.add(10)
      bm.remove(10)
      bm.add(10)
      expect(bm.has(10)).toBe(true)
      bm.remove(10)
      expect(bm.has(10)).toBe(false)
    })
  })

  describe('cardinality', () => {
    it('should return 0 for empty bitmap', () => {
      expect(bm.cardinality).toBe(0)
    })

    it('should return count of added unique values', () => {
      bm.add(1)
      bm.add(2)
      bm.add(3)
      expect(bm.cardinality).toBe(3)
    })

    it('should update after remove', () => {
      bm.add(1)
      bm.add(2)
      bm.remove(1)
      expect(bm.cardinality).toBe(1)
    })

    it('should count values across multiple containers', () => {
      bm.add(0x0000)
      bm.add(0x10000)
      bm.add(0x20000)
      expect(bm.cardinality).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new bitmap', () => {
      expect(bm.isEmpty).toBe(true)
    })

    it('should be false after add', () => {
      bm.add(1)
      expect(bm.isEmpty).toBe(false)
    })

    it('should be true after removing all', () => {
      bm.add(1)
      bm.remove(1)
      expect(bm.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      bm.add(1)
      bm.add(2)
      bm.clear()
      expect(bm.isEmpty).toBe(true)
    })
  })

  describe('min', () => {
    it('should return undefined for empty bitmap', () => {
      expect(bm.min()).toBeUndefined()
    })

    it('should return single value', () => {
      bm.add(42)
      expect(bm.min()).toBe(42)
    })

    it('should return smallest value', () => {
      bm.add(100)
      bm.add(5)
      bm.add(50)
      expect(bm.min()).toBe(5)
    })

    it('should find min across containers', () => {
      bm.add(0x10000)
      bm.add(0x00000)
      expect(bm.min()).toBe(0x00000)
    })

    it('should return 0 if present', () => {
      bm.add(0)
      bm.add(100)
      expect(bm.min()).toBe(0)
    })
  })

  describe('max', () => {
    it('should return undefined for empty bitmap', () => {
      expect(bm.max()).toBeUndefined()
    })

    it('should return single value', () => {
      bm.add(42)
      expect(bm.max()).toBe(42)
    })

    it('should return largest value', () => {
      bm.add(5)
      bm.add(100)
      bm.add(50)
      expect(bm.max()).toBe(100)
    })

    it('should find max across containers', () => {
      bm.add(0x00000)
      bm.add(0x10000)
      expect(bm.max()).toBe(0x10000)
    })

    it('should return max uint32', () => {
      bm.add(0)
      bm.add(0xFFFFFFFF)
      expect(bm.max()).toBe(0xFFFFFFFF)
    })
  })

  describe('rank', () => {
    it('should return 0 for empty bitmap', () => {
      expect(bm.rank(10)).toBe(0)
    })

    it('should count values less than or equal', () => {
      bm.add(1)
      bm.add(3)
      bm.add(5)
      expect(bm.rank(3)).toBe(2)
    })

    it('should count all when value is max', () => {
      bm.add(1)
      bm.add(2)
      bm.add(3)
      expect(bm.rank(100)).toBe(3)
    })

    it('should count 0 when value is below all', () => {
      bm.add(5)
      bm.add(10)
      expect(bm.rank(4)).toBe(0)
    })

    it('should handle rank at exact value', () => {
      bm.add(5)
      bm.add(10)
      expect(bm.rank(5)).toBe(1)
      expect(bm.rank(10)).toBe(2)
    })

    it('should handle rank across containers', () => {
      bm.add(0x00000)
      bm.add(0x10000)
      bm.add(0x10001)
      expect(bm.rank(0x10000)).toBe(2)
    })
  })

  describe('containsRange', () => {
    it('should return true for empty range', () => {
      expect(bm.containsRange(5, 5)).toBe(true)
    })

    it('should return true for existing range', () => {
      bm.add(1)
      bm.add(2)
      bm.add(3)
      expect(bm.containsRange(1, 4)).toBe(true)
    })

    it('should return false for missing value in range', () => {
      bm.add(1)
      bm.add(3)
      expect(bm.containsRange(1, 4)).toBe(false)
    })

    it('should return false for empty bitmap', () => {
      expect(bm.containsRange(0, 10)).toBe(false)
    })

    it('should handle single element range', () => {
      bm.add(5)
      expect(bm.containsRange(5, 6)).toBe(true)
      expect(bm.containsRange(5, 5)).toBe(true)
      expect(bm.containsRange(6, 7)).toBe(false)
      expect(bm.containsRange(3, 5)).toBe(false)
      expect(bm.containsRange(4, 6)).toBe(false)
    })
  })

  describe('addRange', () => {
    it('should add a range of values', () => {
      bm.addRange(0, 10)
      expect(bm.cardinality).toBe(10)
    })

    it('should add range starting from non-zero', () => {
      bm.addRange(100, 110)
      expect(bm.cardinality).toBe(10)
      expect(bm.has(100)).toBe(true)
      expect(bm.has(109)).toBe(true)
      expect(bm.has(110)).toBe(false)
    })

    it('should handle empty range', () => {
      bm.addRange(5, 5)
      expect(bm.cardinality).toBe(0)
    })

    it('should track adds', () => {
      bm.addRange(0, 5)
      expect(bm.getStatistics().adds).toBe(5)
    })

    it('should not double-add existing values', () => {
      bm.add(5)
      bm.addRange(0, 10)
      expect(bm.cardinality).toBe(10)
      expect(bm.getStatistics().adds).toBe(10)
    })

    it('should add range spanning containers', () => {
      bm.addRange(0xFFFC, 0x10004)
      expect(bm.has(0xFFFC)).toBe(true)
      expect(bm.has(0xFFFF)).toBe(true)
      expect(bm.has(0x10000)).toBe(true)
      expect(bm.has(0x10003)).toBe(true)
      expect(bm.has(0x10004)).toBe(false)
    })
  })

  describe('removeRange', () => {
    it('should remove a range of values', () => {
      bm.addRange(0, 10)
      bm.removeRange(2, 5)
      expect(bm.cardinality).toBe(7)
      expect(bm.has(1)).toBe(true)
      expect(bm.has(2)).toBe(false)
      expect(bm.has(4)).toBe(false)
      expect(bm.has(5)).toBe(true)
    })

    it('should handle empty range', () => {
      bm.addRange(0, 5)
      bm.removeRange(3, 3)
      expect(bm.cardinality).toBe(5)
    })

    it('should track removes', () => {
      bm.addRange(0, 10)
      bm.removeRange(0, 5)
      expect(bm.getStatistics().removes).toBe(5)
    })

    it('should clean up empty containers', () => {
      bm.addRange(0, 10)
      bm.removeRange(0, 10)
      expect(bm.isEmpty).toBe(true)
    })

    it('should remove across containers', () => {
      bm.addRange(0xFFFC, 0x10004)
      bm.removeRange(0xFFFC, 0x10004)
      expect(bm.isEmpty).toBe(true)
    })
  })

  describe('flip', () => {
    it('should add values not in range', () => {
      bm.add(0)
      bm.add(2)
      bm.flip(0, 4)
      expect(bm.has(0)).toBe(false)
      expect(bm.has(1)).toBe(true)
      expect(bm.has(2)).toBe(false)
      expect(bm.has(3)).toBe(true)
    })

    it('should flip empty range', () => {
      bm.add(1)
      bm.flip(5, 5)
      expect(bm.cardinality).toBe(1)
    })

    it('should work on empty bitmap', () => {
      bm.flip(0, 5)
      expect(bm.cardinality).toBe(5)
    })
  })

  describe('clear', () => {
    it('should remove all values', () => {
      bm.add(1)
      bm.add(2)
      bm.add(3)
      bm.clear()
      expect(bm.cardinality).toBe(0)
      expect(bm.isEmpty).toBe(true)
    })

    it('should reset statistics', () => {
      bm.add(1)
      bm.remove(1)
      bm.clear()
      const stats = bm.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.setOperations).toBe(0)
      expect(stats.containerConversions).toBe(0)
      expect(stats.estimatedBytes).toBe(0)
    })

    it('should allow operations after clear', () => {
      bm.add(1)
      bm.clear()
      bm.add(2)
      expect(bm.has(2)).toBe(true)
      expect(bm.has(1)).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty bitmap', () => {
      expect(bm.toArray()).toEqual([])
    })

    it('should return sorted values', () => {
      bm.add(5)
      bm.add(1)
      bm.add(3)
      expect(bm.toArray()).toEqual([1, 3, 5])
    })

    it('should return values across containers', () => {
      bm.add(0)
      bm.add(0x10000)
      bm.add(0x20000)
      expect(bm.toArray()).toEqual([0, 0x10000, 0x20000])
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty bitmap', () => {
      let count = 0
      bm.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should call for each value in order', () => {
      bm.add(3)
      bm.add(1)
      bm.add(2)
      const values: number[] = []
      bm.forEach((v) => values.push(v))
      expect(values).toEqual([1, 2, 3])
    })

    it('should iterate across containers', () => {
      bm.add(0x00000)
      bm.add(0x10000)
      const values: number[] = []
      bm.forEach((v) => values.push(v))
      expect(values).toEqual([0x00000, 0x10000])
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should yield nothing for empty bitmap', () => {
      expect([...bm]).toEqual([])
    })

    it('should yield values in order', () => {
      bm.add(5)
      bm.add(1)
      bm.add(3)
      expect([...bm]).toEqual([1, 3, 5])
    })

    it('should work with for-of loop', () => {
      bm.add(10)
      bm.add(20)
      const values: number[] = []
      for (const v of bm) {
        values.push(v)
      }
      expect(values).toEqual([10, 20])
    })
  })

  describe('and', () => {
    it('should return empty when one is empty', () => {
      const other = new RoaringBitmap()
      bm.add(1)
      const result = bm.and(other)
      expect(result.cardinality).toBe(0)
    })

    it('should intersect overlapping values', () => {
      bm.add(1)
      bm.add(2)
      bm.add(3)
      const other = new RoaringBitmap()
      other.add(2)
      other.add(3)
      other.add(4)
      const result = bm.and(other)
      expect(result.cardinality).toBe(2)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
    })

    it('should track set operations', () => {
      const other = new RoaringBitmap()
      other.add(1)
      bm.and(other)
      expect(bm.getStatistics().setOperations).toBe(1)
    })

    it('should not modify operands', () => {
      bm.add(1)
      bm.add(2)
      const other = new RoaringBitmap()
      other.add(2)
      other.add(3)
      const result = bm.and(other)
      expect(bm.cardinality).toBe(2)
      expect(other.cardinality).toBe(2)
      expect(result.cardinality).toBe(1)
    })

    it('should handle two empty bitmaps', () => {
      const other = new RoaringBitmap()
      const result = bm.and(other)
      expect(result.isEmpty).toBe(true)
    })

    it('should handle large value intersection', () => {
      bm.add(0xFFFFFFFF)
      bm.add(0x10000)
      const other = new RoaringBitmap()
      other.add(0xFFFFFFFF)
      other.add(0x20000)
      const result = bm.and(other)
      expect(result.cardinality).toBe(1)
      expect(result.has(0xFFFFFFFF)).toBe(true)
    })
  })

  describe('or', () => {
    it('should union two bitmaps', () => {
      bm.add(1)
      bm.add(2)
      const other = new RoaringBitmap()
      other.add(2)
      other.add(3)
      const result = bm.or(other)
      expect(result.cardinality).toBe(3)
      expect(result.has(1)).toBe(true)
      expect(result.has(2)).toBe(true)
      expect(result.has(3)).toBe(true)
    })

    it('should handle empty operands', () => {
      const other = new RoaringBitmap()
      const result = bm.or(other)
      expect(result.isEmpty).toBe(true)
    })

    it('should handle one empty operand', () => {
      bm.add(1)
      const other = new RoaringBitmap()
      const result = bm.or(other)
      expect(result.cardinality).toBe(1)
    })

    it('should track set operations', () => {
      const other = new RoaringBitmap()
      bm.or(other)
      expect(bm.getStatistics().setOperations).toBe(1)
    })

    it('should not modify operands', () => {
      bm.add(1)
      const other = new RoaringBitmap()
      other.add(2)
      bm.or(other)
      expect(bm.cardinality).toBe(1)
      expect(other.cardinality).toBe(1)
    })
  })

  describe('andNot', () => {
    it('should compute difference', () => {
      bm.add(1)
      bm.add(2)
      bm.add(3)
      const other = new RoaringBitmap()
      other.add(2)
      const result = bm.andNot(other)
      expect(result.cardinality).toBe(2)
      expect(result.has(1)).toBe(true)
      expect(result.has(3)).toBe(true)
      expect(result.has(2)).toBe(false)
    })

    it('should return copy when other is empty', () => {
      bm.add(1)
      bm.add(2)
      const other = new RoaringBitmap()
      const result = bm.andNot(other)
      expect(result.cardinality).toBe(2)
    })

    it('should return empty when this is empty', () => {
      const other = new RoaringBitmap()
      other.add(1)
      const result = bm.andNot(other)
      expect(result.isEmpty).toBe(true)
    })

    it('should track set operations', () => {
      const other = new RoaringBitmap()
      bm.andNot(other)
      expect(bm.getStatistics().setOperations).toBe(1)
    })
  })

  describe('xor', () => {
    it('should compute symmetric difference', () => {
      bm.add(1)
      bm.add(2)
      const other = new RoaringBitmap()
      other.add(2)
      other.add(3)
      const result = bm.xor(other)
      expect(result.cardinality).toBe(2)
      expect(result.has(1)).toBe(true)
      expect(result.has(3)).toBe(true)
      expect(result.has(2)).toBe(false)
    })

    it('should handle identical bitmaps', () => {
      bm.add(1)
      bm.add(2)
      const other = new RoaringBitmap()
      other.add(1)
      other.add(2)
      const result = bm.xor(other)
      expect(result.isEmpty).toBe(true)
    })

    it('should handle empty operands', () => {
      const other = new RoaringBitmap()
      const result = bm.xor(other)
      expect(result.isEmpty).toBe(true)
    })

    it('should handle one empty operand', () => {
      bm.add(1)
      const other = new RoaringBitmap()
      const result = bm.xor(other)
      expect(result.cardinality).toBe(1)
    })

    it('should track set operations', () => {
      const other = new RoaringBitmap()
      bm.xor(other)
      expect(bm.getStatistics().setOperations).toBe(1)
    })
  })

  describe('runOptimize', () => {
    it('should convert sequential values to run container', () => {
      for (let i = 0; i < 100; i++) {
        bm.add(i)
      }
      bm.runOptimize()
      expect(bm.cardinality).toBe(100)
      const stats = bm.getStatistics()
      expect(stats.containerConversions).toBeGreaterThan(0)
    })

    it('should not convert sparse values', () => {
      for (let i = 0; i < 10; i++) {
        bm.add(i * 1000)
      }
      const conversionsBefore = bm.getStatistics().containerConversions
      bm.runOptimize()
      expect(bm.getStatistics().containerConversions).toBe(conversionsBefore)
    })

    it('should preserve data after optimization', () => {
      for (let i = 0; i < 50; i++) {
        bm.add(i)
      }
      bm.runOptimize()
      for (let i = 0; i < 50; i++) {
        expect(bm.has(i)).toBe(true)
      }
    })

    it('should handle empty bitmap', () => {
      bm.runOptimize()
      expect(bm.isEmpty).toBe(true)
    })
  })

  describe('shrinkToFit', () => {
    it('should convert bitmap to array when small', () => {
      for (let i = 0; i < 5000; i++) {
        bm.add(i)
      }
      for (let i = 0; i < 4900; i++) {
        bm.remove(i)
      }
      bm.shrinkToFit()
      expect(bm.cardinality).toBe(100)
    })

    it('should preserve data after shrink', () => {
      bm.add(1)
      bm.add(2)
      bm.add(3)
      bm.shrinkToFit()
      expect(bm.toArray()).toEqual([1, 2, 3])
    })

    it('should handle empty bitmap', () => {
      bm.shrinkToFit()
      expect(bm.isEmpty).toBe(true)
    })
  })

  describe('getStatistics', () => {
    it('should return zero stats for new bitmap', () => {
      const stats = bm.getStatistics()
      expect(stats.adds).toBe(0)
      expect(stats.removes).toBe(0)
      expect(stats.setOperations).toBe(0)
      expect(stats.containerConversions).toBe(0)
      expect(stats.estimatedBytes).toBe(0)
    })

    it('should return a copy', () => {
      bm.add(1)
      const s1 = bm.getStatistics()
      bm.add(2)
      const s2 = bm.getStatistics()
      expect(s1.adds).toBe(1)
      expect(s2.adds).toBe(2)
    })

    it('should track estimated bytes', () => {
      bm.add(1)
      expect(bm.getStatistics().estimatedBytes).toBeGreaterThan(0)
    })

    it('should increase estimated bytes with more values', () => {
      bm.add(1)
      const eb1 = bm.getStatistics().estimatedBytes
      for (let i = 1; i < 100; i++) {
        bm.add(i * 0x10000)
      }
      const eb2 = bm.getStatistics().estimatedBytes
      expect(eb2).toBeGreaterThan(eb1)
    })
  })

  describe('toJSON', () => {
    it('should serialize empty bitmap', () => {
      const json = bm.toJSON()
      expect(json.containers).toEqual([])
      expect(json.statistics).toBeDefined()
    })

    it('should serialize values in array container', () => {
      bm.add(1)
      bm.add(5)
      const json = bm.toJSON()
      expect(json.containers.length).toBe(1)
      expect(json.containers[0]!.type).toBe('array')
    })

    it('should include statistics', () => {
      bm.add(1)
      const json = bm.toJSON()
      expect(json.statistics.adds).toBe(1)
    })

    it('should produce valid RoaringBitmapJSON type', () => {
      bm.add(1)
      const json: RoaringBitmapJSON = bm.toJSON()
      expect(json.containers).toBeDefined()
    })
  })

  describe('fromJSON', () => {
    it('should restore empty bitmap', () => {
      const json = bm.toJSON()
      const restored = RoaringBitmap.fromJSON(json)
      expect(restored.isEmpty).toBe(true)
    })

    it('should restore values', () => {
      bm.add(1)
      bm.add(2)
      bm.add(3)
      const json = bm.toJSON()
      const restored = RoaringBitmap.fromJSON(json)
      expect(restored.cardinality).toBe(3)
      expect(restored.has(1)).toBe(true)
      expect(restored.has(2)).toBe(true)
      expect(restored.has(3)).toBe(true)
    })

    it('should round-trip correctly', () => {
      for (let i = 0; i < 100; i++) {
        bm.add(i)
      }
      const json = bm.toJSON()
      const restored = RoaringBitmap.fromJSON(json)
      expect(restored.toArray()).toEqual(bm.toArray())
    })

    it('should preserve statistics', () => {
      bm.add(1)
      bm.add(2)
      bm.remove(1)
      const json = bm.toJSON()
      const restored = RoaringBitmap.fromJSON(json)
      expect(restored.getStatistics().adds).toBe(2)
      expect(restored.getStatistics().removes).toBe(1)
    })

    it('should allow operations after restore', () => {
      bm.add(1)
      const restored = RoaringBitmap.fromJSON(bm.toJSON())
      restored.add(2)
      expect(restored.has(2)).toBe(true)
      expect(restored.cardinality).toBe(2)
    })

    it('should round-trip with bitmap containers', () => {
      for (let i = 0; i < 5000; i++) {
        bm.add(i)
      }
      const json = bm.toJSON()
      expect(json.containers[0]!.type).toBe('bitmap')
      const restored = RoaringBitmap.fromJSON(json)
      expect(restored.cardinality).toBe(5000)
      for (let i = 0; i < 5000; i++) {
        expect(restored.has(i)).toBe(true)
      }
    })

    it('should round-trip with run containers', () => {
      for (let i = 0; i < 100; i++) {
        bm.add(i)
      }
      bm.runOptimize()
      const json = bm.toJSON()
      const hasRun = json.containers.some(c => c.type === 'run')
      if (hasRun) {
        const restored = RoaringBitmap.fromJSON(json)
        expect(restored.cardinality).toBe(100)
      }
    })
  })

  describe('container type transitions', () => {
    it('should start as array container', () => {
      bm.add(1)
      const json = bm.toJSON()
      expect(json.containers[0]!.type).toBe('array')
    })

    it('should convert array to bitmap at threshold', () => {
      for (let i = 0; i < 5000; i++) {
        bm.add(i)
      }
      const json = bm.toJSON()
      expect(json.containers[0]!.type).toBe('bitmap')
    })

    it('should convert bitmap to array when sparse', () => {
      for (let i = 0; i < 5000; i++) {
        bm.add(i)
      }
      for (let i = 0; i < 4900; i++) {
        bm.remove(i)
      }
      const json = bm.toJSON()
      expect(json.containers[0]!.type).toBe('array')
    })

    it('should convert to run with runOptimize', () => {
      for (let i = 0; i < 100; i++) {
        bm.add(i)
      }
      bm.runOptimize()
      const json = bm.toJSON()
      expect(json.containers.some(c => c.type === 'run')).toBe(true)
    })

    it('should track container conversions', () => {
      for (let i = 0; i < 5000; i++) {
        bm.add(i)
      }
      expect(bm.getStatistics().containerConversions).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle max uint32', () => {
      bm.add(0xFFFFFFFF)
      expect(bm.has(0xFFFFFFFF)).toBe(true)
      expect(bm.min()).toBe(0xFFFFFFFF)
      expect(bm.max()).toBe(0xFFFFFFFF)
    })

    it('should handle value 0', () => {
      bm.add(0)
      expect(bm.has(0)).toBe(true)
      expect(bm.min()).toBe(0)
    })

    it('should handle sequential values', () => {
      for (let i = 0; i < 1000; i++) {
        bm.add(i)
      }
      expect(bm.cardinality).toBe(1000)
      expect(bm.min()).toBe(0)
      expect(bm.max()).toBe(999)
    })

    it('should handle values at container boundaries', () => {
      bm.add(0xFFFF)
      bm.add(0x10000)
      expect(bm.has(0xFFFF)).toBe(true)
      expect(bm.has(0x10000)).toBe(true)
    })

    it('should handle single value bitmap', () => {
      bm.add(42)
      expect(bm.cardinality).toBe(1)
      expect(bm.isEmpty).toBe(false)
      expect(bm.min()).toBe(42)
      expect(bm.max()).toBe(42)
      expect(bm.toArray()).toEqual([42])
    })

    it('should handle add after many removes', () => {
      for (let i = 0; i < 100; i++) {
        bm.add(i)
      }
      for (let i = 0; i < 100; i++) {
        bm.remove(i)
      }
      expect(bm.isEmpty).toBe(true)
      bm.add(50)
      expect(bm.has(50)).toBe(true)
    })

    it('should handle large sparse values', () => {
      bm.add(0)
      bm.add(0xFFFFFFFE)
      bm.add(0xFFFFFFFF)
      expect(bm.cardinality).toBe(3)
      expect(bm.toArray()).toEqual([0, 0xFFFFFFFE, 0xFFFFFFFF])
    })
  })

  describe('set operations with bitmap containers', () => {
    it('should handle and with bitmap containers', () => {
      for (let i = 0; i < 5000; i++) {
        bm.add(i)
      }
      const other = new RoaringBitmap()
      for (let i = 3000; i < 8000; i++) {
        other.add(i)
      }
      const result = bm.and(other)
      expect(result.cardinality).toBe(2000)
    })

    it('should handle or with bitmap containers', () => {
      for (let i = 0; i < 2000; i++) {
        bm.add(i)
      }
      const other = new RoaringBitmap()
      for (let i = 1500; i < 3500; i++) {
        other.add(i)
      }
      const result = bm.or(other)
      expect(result.cardinality).toBe(3500)
    })

    it('should handle xor with bitmap containers', () => {
      for (let i = 0; i < 2000; i++) {
        bm.add(i)
      }
      const other = new RoaringBitmap()
      for (let i = 1500; i < 3500; i++) {
        other.add(i)
      }
      const result = bm.xor(other)
      expect(result.cardinality).toBe(3000)
    })

    it('should handle andNot with bitmap containers', () => {
      for (let i = 0; i < 3000; i++) {
        bm.add(i)
      }
      const other = new RoaringBitmap()
      for (let i = 1500; i < 4500; i++) {
        other.add(i)
      }
      const result = bm.andNot(other)
      expect(result.cardinality).toBe(1500)
    })
  })

  describe('set operations across containers', () => {
    it('should handle and across different keys', () => {
      bm.add(0x00001)
      bm.add(0x10001)
      const other = new RoaringBitmap()
      other.add(0x00001)
      other.add(0x20001)
      const result = bm.and(other)
      expect(result.cardinality).toBe(1)
      expect(result.has(0x00001)).toBe(true)
    })

    it('should handle or across different keys', () => {
      bm.add(0x00001)
      const other = new RoaringBitmap()
      other.add(0x10001)
      const result = bm.or(other)
      expect(result.cardinality).toBe(2)
    })

    it('should handle xor across different keys', () => {
      bm.add(0x00001)
      bm.add(0x10001)
      const other = new RoaringBitmap()
      other.add(0x10001)
      other.add(0x20001)
      const result = bm.xor(other)
      expect(result.cardinality).toBe(2)
      expect(result.has(0x00001)).toBe(true)
      expect(result.has(0x20001)).toBe(true)
    })

    it('should handle andNot across different keys', () => {
      bm.add(0x00001)
      bm.add(0x10001)
      bm.add(0x20001)
      const other = new RoaringBitmap()
      other.add(0x10001)
      const result = bm.andNot(other)
      expect(result.cardinality).toBe(2)
      expect(result.has(0x00001)).toBe(true)
      expect(result.has(0x20001)).toBe(true)
    })
  })

  describe('range operations with containers', () => {
    it('should add range that triggers bitmap conversion', () => {
      bm.addRange(0, 5000)
      expect(bm.cardinality).toBe(5000)
    })

    it('should remove range from bitmap container', () => {
      bm.addRange(0, 5000)
      bm.removeRange(1000, 2000)
      expect(bm.cardinality).toBe(4000)
    })

    it('should flip in bitmap container', () => {
      bm.addRange(0, 100)
      bm.flip(50, 150)
      expect(bm.has(49)).toBe(true)
      expect(bm.has(50)).toBe(false)
      expect(bm.has(99)).toBe(false)
      expect(bm.has(100)).toBe(true)
    })

    it('should check containsRange in bitmap container', () => {
      bm.addRange(0, 1000)
      expect(bm.containsRange(0, 1000)).toBe(true)
      expect(bm.containsRange(0, 1001)).toBe(false)
    })
  })

  describe('iteration consistency', () => {
    it('should iterate same values as toArray', () => {
      for (let i = 0; i < 100; i += 3) {
        bm.add(i)
      }
      expect([...bm]).toEqual(bm.toArray())
    })

    it('should forEach same values as toArray', () => {
      for (let i = 0; i < 50; i += 2) {
        bm.add(i)
      }
      const values: number[] = []
      bm.forEach((v) => values.push(v))
      expect(values).toEqual(bm.toArray())
    })

    it('should iterate across multiple containers', () => {
      for (let k = 0; k < 5; k++) {
        for (let i = 0; i < 10; i++) {
          bm.add((k << 16) | i)
        }
      }
      const arr = [...bm]
      expect(arr.length).toBe(50)
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]!).toBeGreaterThan(arr[i - 1]!)
      }
    })
  })

  describe('statistics tracking', () => {
    it('should track adds correctly', () => {
      bm.add(1)
      bm.add(2)
      bm.add(3)
      expect(bm.getStatistics().adds).toBe(3)
    })

    it('should track removes correctly', () => {
      bm.add(1)
      bm.add(2)
      bm.remove(1)
      bm.remove(2)
      expect(bm.getStatistics().removes).toBe(2)
    })

    it('should track set operations', () => {
      const other = new RoaringBitmap()
      other.add(1)
      bm.and(other)
      bm.or(other)
      bm.xor(other)
      bm.andNot(other)
      expect(bm.getStatistics().setOperations).toBe(4)
    })

    it('should track container conversions', () => {
      for (let i = 0; i < 5000; i++) {
        bm.add(i)
      }
      for (let i = 0; i < 4900; i++) {
        bm.remove(i)
      }
      expect(bm.getStatistics().containerConversions).toBeGreaterThan(0)
    })

    it('should track estimated bytes', () => {
      bm.add(1)
      expect(bm.getStatistics().estimatedBytes).toBeGreaterThan(0)
      bm.add(0x10000)
      const eb2 = bm.getStatistics().estimatedBytes
      expect(eb2).toBeGreaterThan(0)
    })
  })

  describe('DEFAULT_ROARING_BITMAP_OPTIONS', () => {
    it('should have runOptimizeOnAdd false', () => {
      expect(DEFAULT_ROARING_BITMAP_OPTIONS.runOptimizeOnAdd).toBe(false)
    })

    it('should have runOptimizeThreshold 4', () => {
      expect(DEFAULT_ROARING_BITMAP_OPTIONS.runOptimizeThreshold).toBe(4)
    })

    it('should have initialCapacity 0', () => {
      expect(DEFAULT_ROARING_BITMAP_OPTIONS.initialCapacity).toBe(0)
    })
  })

  describe('exports', () => {
    it('should export RoaringBitmap class', () => {
      expect(RoaringBitmap).toBeDefined()
      expect(typeof RoaringBitmap).toBe('function')
    })

    it('should export DEFAULT_ROARING_BITMAP_OPTIONS', () => {
      expect(DEFAULT_ROARING_BITMAP_OPTIONS).toBeDefined()
    })

    it('should allow type-only import for RoaringBitmapOptions', () => {
      const opts: RoaringBitmapOptions = { runOptimizeOnAdd: true }
      const r = new RoaringBitmap(opts)
      expect(r.isEmpty).toBe(true)
    })

    it('should allow type-only import for RoaringBitmapJSON', () => {
      const json: RoaringBitmapJSON = bm.toJSON()
      expect(json.containers).toBeDefined()
    })

    it('should allow type-only import for RoaringBitmapStatistics', () => {
      const stats: RoaringBitmapStatistics = bm.getStatistics()
      expect(stats.adds).toBe(0)
    })
  })

  describe('run container operations', () => {
    it('should add to run container', () => {
      for (let i = 0; i < 100; i++) {
        bm.add(i)
      }
      bm.runOptimize()
      bm.add(200)
      expect(bm.has(200)).toBe(true)
      expect(bm.cardinality).toBe(101)
    })

    it('should remove from run container', () => {
      for (let i = 0; i < 100; i++) {
        bm.add(i)
      }
      bm.runOptimize()
      bm.remove(50)
      expect(bm.has(50)).toBe(false)
      expect(bm.cardinality).toBe(99)
    })

    it('should check membership in run container', () => {
      for (let i = 0; i < 100; i++) {
        bm.add(i)
      }
      bm.runOptimize()
      expect(bm.has(0)).toBe(true)
      expect(bm.has(99)).toBe(true)
      expect(bm.has(50)).toBe(true)
      expect(bm.has(100)).toBe(false)
    })

    it('should compute rank in run container', () => {
      for (let i = 0; i < 100; i++) {
        bm.add(i)
      }
      bm.runOptimize()
      expect(bm.rank(50)).toBe(51)
      expect(bm.rank(0)).toBe(1)
      expect(bm.rank(99)).toBe(100)
    })

    it('should compute min/max in run container', () => {
      for (let i = 10; i < 50; i++) {
        bm.add(i)
      }
      bm.runOptimize()
      expect(bm.min()).toBe(10)
      expect(bm.max()).toBe(49)
    })

    it('should iterate run container', () => {
      for (let i = 0; i < 50; i++) {
        bm.add(i)
      }
      bm.runOptimize()
      expect([...bm].length).toBe(50)
    })

    it('should serialize and deserialize run container', () => {
      for (let i = 0; i < 100; i++) {
        bm.add(i)
      }
      bm.runOptimize()
      const json = bm.toJSON()
      const restored = RoaringBitmap.fromJSON(json)
      expect(restored.cardinality).toBe(100)
      expect(restored.toArray()).toEqual(bm.toArray())
    })
  })

  describe('serialization round-trip', () => {
    it('should round-trip with multiple container types', () => {
      for (let i = 0; i < 100; i++) {
        bm.add(i)
      }
      for (let i = 0; i < 5000; i++) {
        bm.add(0x10000 + i)
      }
      bm.runOptimize()
      const json = bm.toJSON()
      const restored = RoaringBitmap.fromJSON(json)
      expect(restored.cardinality).toBe(bm.cardinality)
      expect(restored.toArray()).toEqual(bm.toArray())
    })

    it('should round-trip empty bitmap', () => {
      const json = bm.toJSON()
      const restored = RoaringBitmap.fromJSON(json)
      expect(restored.isEmpty).toBe(true)
    })

    it('should round-trip single value', () => {
      bm.add(42)
      const restored = RoaringBitmap.fromJSON(bm.toJSON())
      expect(restored.has(42)).toBe(true)
      expect(restored.cardinality).toBe(1)
    })

    it('should round-trip max value', () => {
      bm.add(0xFFFFFFFF)
      const restored = RoaringBitmap.fromJSON(bm.toJSON())
      expect(restored.has(0xFFFFFFFF)).toBe(true)
    })
  })

  describe('run container run encoding', () => {
    it('should merge adjacent values into runs', () => {
      for (let i = 0; i < 50; i++) {
        bm.add(i)
      }
      bm.runOptimize()
      const json = bm.toJSON()
      const runContainer = json.containers.find(c => c.type === 'run')
      expect(runContainer).toBeDefined()
      const runs = runContainer!.data as Array<{ start: number; length: number }>
      expect(runs.length).toBe(1)
      expect(runs[0]!.start).toBe(0)
      expect(runs[0]!.length).toBe(49)
    })

    it('should create multiple runs for disjoint ranges', () => {
      for (let i = 0; i < 20; i++) bm.add(i)
      for (let i = 100; i < 120; i++) bm.add(i)
      bm.runOptimize()
      const json = bm.toJSON()
      const runContainer = json.containers.find(c => c.type === 'run')
      if (runContainer) {
        const runs = runContainer.data as Array<{ start: number; length: number }>
        expect(runs.length).toBe(2)
      }
    })
  })
})
