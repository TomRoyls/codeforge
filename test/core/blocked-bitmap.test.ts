import { describe, it, expect } from 'vitest'
import { BlockedBitmap } from '../../src/core/blocked-bitmap/blocked-bitmap.js'
import { DEFAULT_BLOCK_SIZE } from '../../src/core/blocked-bitmap/types.js'

describe('BlockedBitmap', () => {
  describe('construction', () => {
    it('should create bitmap with given size', () => {
      const bm = new BlockedBitmap(100)
      expect(bm.size).toBe(100)
      expect(bm.isEmpty).toBe(true)
    })

    it('should create bitmap with size 0', () => {
      const bm = new BlockedBitmap(0)
      expect(bm.size).toBe(0)
      expect(bm.isEmpty).toBe(true)
    })

    it('should throw on negative size', () => {
      expect(() => new BlockedBitmap(-1)).toThrow(RangeError)
    })

    it('should use default block size when not specified', () => {
      const bm = new BlockedBitmap(100)
      expect(bm.stats().blockSize).toBe(DEFAULT_BLOCK_SIZE)
    })

    it('should use custom block size', () => {
      const bm = new BlockedBitmap(100, { blockSize: 128 })
      expect(bm.stats().blockSize).toBe(128)
    })

    it('should throw on invalid block size 0', () => {
      expect(() => new BlockedBitmap(100, { blockSize: 0 })).toThrow(RangeError)
    })

    it('should throw on negative block size', () => {
      expect(() => new BlockedBitmap(100, { blockSize: -8 })).toThrow(RangeError)
    })

    it('should throw on non-multiple-of-8 block size', () => {
      expect(() => new BlockedBitmap(100, { blockSize: 7 })).toThrow(RangeError)
    })

    it('should throw on block size 3', () => {
      expect(() => new BlockedBitmap(100, { blockSize: 3 })).toThrow(RangeError)
    })

    it('should accept block size 8', () => {
      const bm = new BlockedBitmap(100, { blockSize: 8 })
      expect(bm.stats().blockSize).toBe(8)
    })

    it('should accept block size 1024', () => {
      const bm = new BlockedBitmap(100, { blockSize: 1024 })
      expect(bm.stats().blockSize).toBe(1024)
    })

    it('should create bitmap with no stored blocks initially', () => {
      const bm = new BlockedBitmap(1000)
      expect(bm.stats().storedBlocks).toBe(0)
    })
  })

  describe('set/clear/get', () => {
    it('should set and get a bit', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      expect(bm.get(5)).toBe(1)
    })

    it('should return 0 for unset bits', () => {
      const bm = new BlockedBitmap(100)
      expect(bm.get(5)).toBe(0)
    })

    it('should clear a set bit', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      bm.clear(5)
      expect(bm.get(5)).toBe(0)
    })

    it('should clear an already clear bit without error', () => {
      const bm = new BlockedBitmap(100)
      bm.clear(5)
      expect(bm.get(5)).toBe(0)
    })

    it('should set multiple bits', () => {
      const bm = new BlockedBitmap(100)
      bm.set(0)
      bm.set(50)
      bm.set(99)
      expect(bm.get(0)).toBe(1)
      expect(bm.get(50)).toBe(1)
      expect(bm.get(99)).toBe(1)
      expect(bm.get(1)).toBe(0)
    })

    it('should throw on negative index for set', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.set(-1)).toThrow(RangeError)
    })

    it('should throw on out-of-range index for set', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.set(100)).toThrow(RangeError)
    })

    it('should throw on negative index for clear', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.clear(-1)).toThrow(RangeError)
    })

    it('should throw on out-of-range index for clear', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.clear(100)).toThrow(RangeError)
    })

    it('should throw on negative index for get', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.get(-1)).toThrow(RangeError)
    })

    it('should throw on out-of-range index for get', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.get(100)).toThrow(RangeError)
    })

    it('should handle setting bit 0', () => {
      const bm = new BlockedBitmap(10)
      bm.set(0)
      expect(bm.get(0)).toBe(1)
    })

    it('should handle setting last bit', () => {
      const bm = new BlockedBitmap(100)
      bm.set(99)
      expect(bm.get(99)).toBe(1)
    })

    it('should remove block when last bit is cleared', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      expect(bm.stats().storedBlocks).toBe(1)
      bm.clear(5)
      expect(bm.stats().storedBlocks).toBe(0)
    })
  })

  describe('flip', () => {
    it('should flip a 0 to 1', () => {
      const bm = new BlockedBitmap(100)
      bm.flip(5)
      expect(bm.get(5)).toBe(1)
    })

    it('should flip a 1 to 0', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      bm.flip(5)
      expect(bm.get(5)).toBe(0)
    })

    it('should flip twice back to original', () => {
      const bm = new BlockedBitmap(100)
      bm.flip(5)
      bm.flip(5)
      expect(bm.get(5)).toBe(0)
    })

    it('should throw on negative index', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.flip(-1)).toThrow(RangeError)
    })

    it('should throw on out-of-range index', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.flip(100)).toThrow(RangeError)
    })

    it('should remove block when flipped to 0 makes block empty', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      expect(bm.stats().storedBlocks).toBe(1)
      bm.flip(5)
      expect(bm.stats().storedBlocks).toBe(0)
    })
  })

  describe('setRange/clearRange/getRange', () => {
    it('should set a range of bits', () => {
      const bm = new BlockedBitmap(100)
      bm.setRange(10, 20)
      for (let i = 10; i < 20; i++) {
        expect(bm.get(i)).toBe(1)
      }
      expect(bm.get(9)).toBe(0)
      expect(bm.get(20)).toBe(0)
    })

    it('should clear a range of bits', () => {
      const bm = new BlockedBitmap(100)
      bm.setRange(10, 30)
      bm.clearRange(15, 25)
      for (let i = 10; i < 15; i++) {
        expect(bm.get(i)).toBe(1)
      }
      for (let i = 15; i < 25; i++) {
        expect(bm.get(i)).toBe(0)
      }
      for (let i = 25; i < 30; i++) {
        expect(bm.get(i)).toBe(1)
      }
    })

    it('should get a range of bits', () => {
      const bm = new BlockedBitmap(100)
      bm.setRange(10, 20)
      const range = bm.getRange(5, 25)
      expect(range.length).toBe(20)
      for (let i = 0; i < 5; i++) expect(range[i]).toBe(0)
      for (let i = 5; i < 15; i++) expect(range[i]).toBe(1)
      for (let i = 15; i < 20; i++) expect(range[i]).toBe(0)
    })

    it('should handle empty range (start === end)', () => {
      const bm = new BlockedBitmap(100)
      bm.setRange(10, 10)
      expect(bm.countSetBits()).toBe(0)
    })

    it('should handle clearRange on empty range', () => {
      const bm = new BlockedBitmap(100)
      bm.setRange(0, 50)
      bm.clearRange(25, 25)
      expect(bm.countSetBits()).toBe(50)
    })

    it('should throw on invalid range (start > end)', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.setRange(20, 10)).toThrow(RangeError)
    })

    it('should throw on negative range start', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.setRange(-1, 10)).toThrow(RangeError)
    })

    it('should throw on range end > size', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.setRange(0, 101)).toThrow(RangeError)
    })

    it('should set range spanning multiple blocks', () => {
      const bm = new BlockedBitmap(1000, { blockSize: 64 })
      bm.setRange(0, 200)
      expect(bm.countSetBits()).toBe(200)
      for (let i = 0; i < 200; i++) {
        expect(bm.get(i)).toBe(1)
      }
      for (let i = 200; i < 1000; i++) {
        expect(bm.get(i)).toBe(0)
      }
    })

    it('should clear range spanning multiple blocks', () => {
      const bm = new BlockedBitmap(1000, { blockSize: 64 })
      bm.setRange(0, 300)
      bm.clearRange(50, 250)
      expect(bm.countSetBits()).toBe(100)
    })

    it('should handle getRange on all zeros', () => {
      const bm = new BlockedBitmap(10)
      const range = bm.getRange(0, 10)
      expect(range).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    })

    it('should handle setRange of single bit', () => {
      const bm = new BlockedBitmap(100)
      bm.setRange(5, 6)
      expect(bm.get(5)).toBe(1)
      expect(bm.get(4)).toBe(0)
      expect(bm.get(6)).toBe(0)
    })

    it('should handle clearRange that empties blocks', () => {
      const bm = new BlockedBitmap(100, { blockSize: 8 })
      bm.set(0)
      bm.set(4)
      expect(bm.stats().storedBlocks).toBe(1)
      bm.clearRange(0, 8)
      expect(bm.stats().storedBlocks).toBe(0)
    })
  })

  describe('countSetBits', () => {
    it('should return 0 for empty bitmap', () => {
      const bm = new BlockedBitmap(100)
      expect(bm.countSetBits()).toBe(0)
    })

    it('should count set bits correctly', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      bm.set(10)
      bm.set(99)
      expect(bm.countSetBits()).toBe(3)
    })

    it('should count after range set', () => {
      const bm = new BlockedBitmap(100)
      bm.setRange(10, 20)
      expect(bm.countSetBits()).toBe(10)
    })

    it('should count after range clear', () => {
      const bm = new BlockedBitmap(100)
      bm.setRange(0, 100)
      bm.clearRange(25, 75)
      expect(bm.countSetBits()).toBe(50)
    })

    it('should count all bits set', () => {
      const bm = new BlockedBitmap(32)
      bm.setRange(0, 32)
      expect(bm.countSetBits()).toBe(32)
    })
  })

  describe('cardinality', () => {
    it('should return same as countSetBits', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      bm.set(10)
      expect(bm.cardinality).toBe(bm.countSetBits())
    })

    it('should return 0 for empty', () => {
      const bm = new BlockedBitmap(100)
      expect(bm.cardinality).toBe(0)
    })
  })

  describe('findFirstSet', () => {
    it('should return -1 for empty bitmap', () => {
      const bm = new BlockedBitmap(100)
      expect(bm.findFirstSet()).toBe(-1)
    })

    it('should find first set bit at 0', () => {
      const bm = new BlockedBitmap(100)
      bm.set(0)
      expect(bm.findFirstSet()).toBe(0)
    })

    it('should find first set bit in middle', () => {
      const bm = new BlockedBitmap(100)
      bm.set(50)
      expect(bm.findFirstSet()).toBe(50)
    })

    it('should find first set bit among many', () => {
      const bm = new BlockedBitmap(100)
      bm.set(30)
      bm.set(50)
      bm.set(70)
      expect(bm.findFirstSet()).toBe(30)
    })

    it('should find first set in different block', () => {
      const bm = new BlockedBitmap(1000, { blockSize: 64 })
      bm.set(200)
      bm.set(100)
      expect(bm.findFirstSet()).toBe(100)
    })

    it('should return -1 for size 0 bitmap', () => {
      const bm = new BlockedBitmap(0)
      expect(bm.findFirstSet()).toBe(-1)
    })
  })

  describe('findFirstClear', () => {
    it('should find first clear bit at 0', () => {
      const bm = new BlockedBitmap(100)
      bm.set(0)
      bm.set(1)
      bm.set(2)
      expect(bm.findFirstClear()).toBe(3)
    })

    it('should return 0 for empty bitmap', () => {
      const bm = new BlockedBitmap(100)
      expect(bm.findFirstClear()).toBe(0)
    })

    it('should return -1 when all bits are set', () => {
      const bm = new BlockedBitmap(10)
      bm.setRange(0, 10)
      expect(bm.findFirstClear()).toBe(-1)
    })

    it('should find clear bit after set range', () => {
      const bm = new BlockedBitmap(100)
      bm.setRange(0, 50)
      expect(bm.findFirstClear()).toBe(50)
    })

    it('should return -1 for size 0 bitmap', () => {
      const bm = new BlockedBitmap(0)
      expect(bm.findFirstClear()).toBe(-1)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new bitmap', () => {
      const bm = new BlockedBitmap(100)
      expect(bm.isEmpty).toBe(true)
    })

    it('should be false after setting a bit', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      expect(bm.isEmpty).toBe(false)
    })

    it('should be true after clearing all bits', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      bm.clear(5)
      expect(bm.isEmpty).toBe(true)
    })

    it('should be true for size 0', () => {
      const bm = new BlockedBitmap(0)
      expect(bm.isEmpty).toBe(true)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      bm.set(50)
      const clone = bm.clone()
      expect(clone.get(5)).toBe(1)
      expect(clone.get(50)).toBe(1)
      expect(clone.size).toBe(100)
    })

    it('should not affect original when modified', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      const clone = bm.clone()
      clone.set(10)
      expect(bm.get(10)).toBe(0)
      expect(clone.get(10)).toBe(1)
    })

    it('should not affect clone when original modified', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      const clone = bm.clone()
      bm.clear(5)
      expect(clone.get(5)).toBe(1)
    })

    it('should preserve block size', () => {
      const bm = new BlockedBitmap(100, { blockSize: 128 })
      const clone = bm.clone()
      expect(clone.stats().blockSize).toBe(128)
    })

    it('should clone empty bitmap', () => {
      const bm = new BlockedBitmap(100)
      const clone = bm.clone()
      expect(clone.isEmpty).toBe(true)
      expect(clone.size).toBe(100)
    })
  })

  describe('clear', () => {
    it('should clear all bits', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      bm.set(50)
      bm.clearAll()
      expect(bm.isEmpty).toBe(true)
      expect(bm.get(5)).toBe(0)
      expect(bm.get(50)).toBe(0)
    })

    it('should clear already empty bitmap', () => {
      const bm = new BlockedBitmap(100)
      bm.clearAll()
      expect(bm.isEmpty).toBe(true)
    })
  })

  describe('from factory', () => {
    it('should create bitmap from array', () => {
      const bm = BlockedBitmap.from([0, 1, 0, 1, 1])
      expect(bm.size).toBe(5)
      expect(bm.get(0)).toBe(0)
      expect(bm.get(1)).toBe(1)
      expect(bm.get(3)).toBe(1)
      expect(bm.get(4)).toBe(1)
    })

    it('should create bitmap from empty array', () => {
      const bm = BlockedBitmap.from([])
      expect(bm.size).toBe(0)
    })

    it('should create bitmap from all zeros', () => {
      const bm = BlockedBitmap.from([0, 0, 0])
      expect(bm.isEmpty).toBe(true)
    })

    it('should create bitmap from all ones', () => {
      const bm = BlockedBitmap.from([1, 1, 1])
      expect(bm.countSetBits()).toBe(3)
    })

    it('should throw on invalid value', () => {
      expect(() => BlockedBitmap.from([0, 2, 1])).toThrow(Error)
    })

    it('should throw on negative value', () => {
      expect(() => BlockedBitmap.from([0, -1, 1])).toThrow(Error)
    })

    it('should accept options', () => {
      const bm = BlockedBitmap.from([1, 0, 1], { blockSize: 16 })
      expect(bm.stats().blockSize).toBe(16)
    })
  })

  describe('toBitArray', () => {
    it('should convert to array of bits', () => {
      const bm = new BlockedBitmap(5)
      bm.set(1)
      bm.set(3)
      expect(bm.toBitArray()).toEqual([0, 1, 0, 1, 0])
    })

    it('should convert empty bitmap to all zeros', () => {
      const bm = new BlockedBitmap(5)
      expect(bm.toBitArray()).toEqual([0, 0, 0, 0, 0])
    })

    it('should convert full bitmap to all ones', () => {
      const bm = new BlockedBitmap(5)
      bm.setRange(0, 5)
      expect(bm.toBitArray()).toEqual([1, 1, 1, 1, 1])
    })

    it('should convert size 0 bitmap', () => {
      const bm = new BlockedBitmap(0)
      expect(bm.toBitArray()).toEqual([])
    })
  })

  describe('toSet', () => {
    it('should return set of set bit indices', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      bm.set(10)
      bm.set(99)
      expect(bm.toSet()).toEqual(new Set([5, 10, 99]))
    })

    it('should return empty set for empty bitmap', () => {
      const bm = new BlockedBitmap(100)
      expect(bm.toSet()).toEqual(new Set())
    })

    it('should return all indices when all set', () => {
      const bm = new BlockedBitmap(5)
      bm.setRange(0, 5)
      expect(bm.toSet()).toEqual(new Set([0, 1, 2, 3, 4]))
    })
  })

  describe('stats', () => {
    it('should return correct stats for empty bitmap', () => {
      const bm = new BlockedBitmap(1000)
      const s = bm.stats()
      expect(s.totalBits).toBe(1000)
      expect(s.storedBlocks).toBe(0)
      expect(s.setBits).toBe(0)
      expect(s.blockSize).toBe(DEFAULT_BLOCK_SIZE)
    })

    it('should report stored blocks after setting bits', () => {
      const bm = new BlockedBitmap(1000, { blockSize: 64 })
      bm.set(5)
      bm.set(100)
      const s = bm.stats()
      expect(s.storedBlocks).toBe(2)
      expect(s.setBits).toBe(2)
    })

    it('should report single block for adjacent bits', () => {
      const bm = new BlockedBitmap(1000, { blockSize: 64 })
      bm.set(5)
      bm.set(10)
      const s = bm.stats()
      expect(s.storedBlocks).toBe(1)
    })

    it('should compute total blocks', () => {
      const bm = new BlockedBitmap(1000, { blockSize: 64 })
      const s = bm.stats()
      expect(s.totalBlocks).toBe(Math.ceil(1000 / 64))
    })

    it('should compute bytes used', () => {
      const bm = new BlockedBitmap(1000, { blockSize: 64 })
      bm.set(5)
      const s = bm.stats()
      expect(s.bytesUsed).toBe(64 / 8)
    })

    it('should handle size 0', () => {
      const bm = new BlockedBitmap(0)
      const s = bm.stats()
      expect(s.totalBlocks).toBe(0)
      expect(s.storedBlocks).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle single bit bitmap', () => {
      const bm = new BlockedBitmap(1)
      expect(bm.get(0)).toBe(0)
      bm.set(0)
      expect(bm.get(0)).toBe(1)
      expect(bm.countSetBits()).toBe(1)
    })

    it('should handle negative index for getRange', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.getRange(-1, 10)).toThrow(RangeError)
    })

    it('should handle invalid range for clearRange', () => {
      const bm = new BlockedBitmap(100)
      expect(() => bm.clearRange(50, 200)).toThrow(RangeError)
    })

    it('should handle large sparse bitmap efficiently', () => {
      const bm = new BlockedBitmap(1_000_000)
      bm.set(0)
      bm.set(500_000)
      bm.set(999_999)
      expect(bm.countSetBits()).toBe(3)
      expect(bm.stats().storedBlocks).toBe(3)
    })

    it('should handle adjacent blocks', () => {
      const bm = new BlockedBitmap(1000, { blockSize: 64 })
      bm.set(63)
      bm.set(64)
      expect(bm.get(63)).toBe(1)
      expect(bm.get(64)).toBe(1)
      expect(bm.stats().storedBlocks).toBe(2)
    })

    it('should handle setting same bit twice', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      bm.set(5)
      expect(bm.get(5)).toBe(1)
      expect(bm.countSetBits()).toBe(1)
    })

    it('should handle clearing same bit twice', () => {
      const bm = new BlockedBitmap(100)
      bm.set(5)
      bm.clear(5)
      bm.clear(5)
      expect(bm.get(5)).toBe(0)
    })

    it('should handle bitmap exactly one block in size', () => {
      const bm = new BlockedBitmap(64, { blockSize: 64 })
      bm.set(0)
      bm.set(63)
      expect(bm.stats().storedBlocks).toBe(1)
      expect(bm.countSetBits()).toBe(2)
    })

    it('should handle set and clear across block boundary', () => {
      const bm = new BlockedBitmap(1000, { blockSize: 64 })
      for (let i = 60; i < 68; i++) {
        bm.set(i)
      }
      expect(bm.countSetBits()).toBe(8)
      bm.clearRange(60, 68)
      expect(bm.countSetBits()).toBe(0)
    })
  })

  describe('large bitmaps', () => {
    it('should handle millions of sparse bits', () => {
      const bm = new BlockedBitmap(5_000_000, { blockSize: 1024 })
      for (let i = 0; i < 5_000_000; i += 100_000) {
        bm.set(i)
      }
      expect(bm.countSetBits()).toBe(50)
      expect(bm.get(0)).toBe(1)
      expect(bm.get(100_000)).toBe(1)
      expect(bm.get(4_900_000)).toBe(1)
    })

    it('should handle setting many adjacent bits across blocks', () => {
      const bm = new BlockedBitmap(10_000, { blockSize: 64 })
      bm.setRange(0, 5000)
      expect(bm.countSetBits()).toBe(5000)
      expect(bm.stats().storedBlocks).toBe(Math.ceil(5000 / 64))
    })

    it('should handle large clear range', () => {
      const bm = new BlockedBitmap(10_000)
      bm.setRange(0, 10000)
      bm.clearRange(2000, 8000)
      expect(bm.countSetBits()).toBe(4000)
      expect(bm.get(1999)).toBe(1)
      expect(bm.get(2000)).toBe(0)
      expect(bm.get(7999)).toBe(0)
      expect(bm.get(8000)).toBe(1)
    })

    it('should handle full bitmap set and clear', () => {
      const bm = new BlockedBitmap(256, { blockSize: 64 })
      bm.setRange(0, 256)
      expect(bm.countSetBits()).toBe(256)
      expect(bm.findFirstClear()).toBe(-1)
      bm.clearRange(0, 256)
      expect(bm.countSetBits()).toBe(0)
      expect(bm.isEmpty).toBe(true)
    })

    it('should handle toSet on large sparse bitmap', () => {
      const bm = new BlockedBitmap(1_000_000)
      bm.set(100)
      bm.set(999_999)
      const s = bm.toSet()
      expect(s.size).toBe(2)
      expect(s.has(100)).toBe(true)
      expect(s.has(999_999)).toBe(true)
    })

    it('should handle toBitArray on moderate bitmap', () => {
      const bm = new BlockedBitmap(10)
      bm.set(2)
      bm.set(7)
      const arr = bm.toBitArray()
      expect(arr).toEqual([0, 0, 1, 0, 0, 0, 0, 1, 0, 0])
    })

    it('should handle clone of large bitmap', () => {
      const bm = new BlockedBitmap(1_000_000)
      bm.set(0)
      bm.set(500_000)
      const clone = bm.clone()
      expect(clone.get(0)).toBe(1)
      expect(clone.get(500_000)).toBe(1)
      expect(clone.size).toBe(1_000_000)
      bm.clear(0)
      expect(clone.get(0)).toBe(1)
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_BLOCK_SIZE', () => {
      expect(DEFAULT_BLOCK_SIZE).toBe(512)
    })
  })

  describe('additional coverage', () => {
    it('should handle setRange covering entire bitmap', () => {
      const bm = new BlockedBitmap(50, { blockSize: 16 })
      bm.setRange(0, 50)
      expect(bm.countSetBits()).toBe(50)
      expect(bm.findFirstClear()).toBe(-1)
    })

    it('should handle clearRange on unset bits', () => {
      const bm = new BlockedBitmap(100)
      bm.clearRange(0, 100)
      expect(bm.isEmpty).toBe(true)
    })

    it('should handle getRange covering entire bitmap', () => {
      const bm = new BlockedBitmap(8)
      bm.set(3)
      const range = bm.getRange(0, 8)
      expect(range).toEqual([0, 0, 0, 1, 0, 0, 0, 0])
    })

    it('should handle flip creating then removing a block', () => {
      const bm = new BlockedBitmap(100, { blockSize: 8 })
      bm.flip(3)
      expect(bm.get(3)).toBe(1)
      expect(bm.stats().storedBlocks).toBe(1)
      bm.flip(3)
      expect(bm.get(3)).toBe(0)
      expect(bm.stats().storedBlocks).toBe(0)
    })

    it('should handle findFirstSet with single bit in last block', () => {
      const bm = new BlockedBitmap(1000, { blockSize: 64 })
      bm.set(900)
      expect(bm.findFirstSet()).toBe(900)
    })

    it('should handle findFirstClear after sparse sets', () => {
      const bm = new BlockedBitmap(100)
      bm.set(0)
      bm.set(2)
      bm.set(4)
      expect(bm.findFirstClear()).toBe(1)
    })

    it('should handle from with single element', () => {
      const bm = BlockedBitmap.from([1])
      expect(bm.size).toBe(1)
      expect(bm.get(0)).toBe(1)
    })

    it('should handle toSet after clearAll', () => {
      const bm = new BlockedBitmap(100)
      bm.setRange(0, 10)
      bm.clearAll()
      expect(bm.toSet().size).toBe(0)
    })

    it('should handle stats after multiple operations', () => {
      const bm = new BlockedBitmap(200, { blockSize: 64 })
      bm.setRange(0, 200)
      bm.clearRange(0, 200)
      const s = bm.stats()
      expect(s.storedBlocks).toBe(0)
      expect(s.setBits).toBe(0)
    })

    it('should handle set bit at block boundary exactly', () => {
      const bm = new BlockedBitmap(200, { blockSize: 64 })
      bm.set(64)
      bm.set(128)
      expect(bm.stats().storedBlocks).toBe(2)
      expect(bm.get(64)).toBe(1)
      expect(bm.get(128)).toBe(1)
    })

    it('should handle byte boundary bits', () => {
      const bm = new BlockedBitmap(100, { blockSize: 64 })
      bm.set(7)
      bm.set(8)
      bm.set(15)
      bm.set(16)
      expect(bm.get(7)).toBe(1)
      expect(bm.get(8)).toBe(1)
      expect(bm.get(15)).toBe(1)
      expect(bm.get(16)).toBe(1)
    })
  })
})
