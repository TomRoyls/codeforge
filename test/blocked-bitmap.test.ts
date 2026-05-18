import { BlockedBitmap } from '../src/core/blocked-bitmap/blocked-bitmap.js'
import { DEFAULT_BLOCK_SIZE } from '../src/core/blocked-bitmap/blocked-bitmap.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BlockedBitmap', () => {
  describe('constructor', () => {
    it('creates a bitmap with given size and default block size', () => {
      const bm = new BlockedBitmap(100)
      expect(bm.size).toBe(100)
      expect(bm.isEmpty).toBe(true)
    })

    it('creates a bitmap with size 0', () => {
      const bm = new BlockedBitmap(0)
      expect(bm.size).toBe(0)
      expect(bm.isEmpty).toBe(true)
    })

    it('creates a bitmap with custom block size', () => {
      const bm = new BlockedBitmap(64, { blockSize: 16 })
      const stats = bm.stats()
      expect(stats.blockSize).toBe(16)
    })

    it('throws RangeError for negative size', () => {
      expect(() => new BlockedBitmap(-1)).toThrow(RangeError)
      expect(() => new BlockedBitmap(-1)).toThrow('Size must be non-negative')
    })

    it('throws RangeError for block size 0', () => {
      expect(() => new BlockedBitmap(100, { blockSize: 0 })).toThrow(RangeError)
    })

    it('throws RangeError for negative block size', () => {
      expect(() => new BlockedBitmap(100, { blockSize: -8 })).toThrow(RangeError)
    })

    it('throws RangeError for non-multiple-of-8 block size', () => {
      expect(() => new BlockedBitmap(100, { blockSize: 7 })).toThrow(RangeError)
      expect(() => new BlockedBitmap(100, { blockSize: 10 })).toThrow(RangeError)
      expect(() => new BlockedBitmap(100, { blockSize: 3 })).toThrow(RangeError)
    })

    it('accepts block size 8 (minimum valid)', () => {
      const bm = new BlockedBitmap(64, { blockSize: 8 })
      expect(bm.stats().blockSize).toBe(8)
    })

    it('uses DEFAULT_BLOCK_SIZE when no options provided', () => {
      const bm = new BlockedBitmap(1000)
      expect(bm.stats().blockSize).toBe(DEFAULT_BLOCK_SIZE)
    })
  })

  // ─── set ──────────────────────────────────────────────────────────────

  describe('set', () => {
    it('sets a bit and get returns 1', () => {
      const bm = new BlockedBitmap(64)
      bm.set(0)
      expect(bm.get(0)).toBe(1)
    })

    it('sets multiple bits', () => {
      const bm = new BlockedBitmap(64)
      bm.set(0)
      bm.set(10)
      bm.set(63)
      expect(bm.get(0)).toBe(1)
      expect(bm.get(10)).toBe(1)
      expect(bm.get(63)).toBe(1)
      expect(bm.get(1)).toBe(0)
    })

    it('setting an already-set bit is idempotent', () => {
      const bm = new BlockedBitmap(64)
      bm.set(5)
      bm.set(5)
      expect(bm.get(5)).toBe(1)
      expect(bm.countSetBits()).toBe(1)
    })

    it('throws RangeError for negative index', () => {
      const bm = new BlockedBitmap(64)
      expect(() => bm.set(-1)).toThrow(RangeError)
    })

    it('throws RangeError for index equal to size', () => {
      const bm = new BlockedBitmap(64)
      expect(() => bm.set(64)).toThrow(RangeError)
    })

    it('throws RangeError for index beyond size', () => {
      const bm = new BlockedBitmap(10)
      expect(() => bm.set(100)).toThrow(RangeError)
    })

    it('throws on size 0 bitmap', () => {
      const bm = new BlockedBitmap(0)
      expect(() => bm.set(0)).toThrow(RangeError)
    })

    it('sets bits across block boundaries', () => {
      const bm = new BlockedBitmap(256, { blockSize: 64 })
      bm.set(0)
      bm.set(63)
      bm.set(64)
      bm.set(127)
      bm.set(255)
      expect(bm.get(0)).toBe(1)
      expect(bm.get(63)).toBe(1)
      expect(bm.get(64)).toBe(1)
      expect(bm.get(127)).toBe(1)
      expect(bm.get(255)).toBe(1)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears a set bit', () => {
      const bm = new BlockedBitmap(64)
      bm.set(5)
      bm.clear(5)
      expect(bm.get(5)).toBe(0)
    })

    it('clearing an unset bit is a no-op', () => {
      const bm = new BlockedBitmap(64)
      bm.clear(5)
      expect(bm.get(5)).toBe(0)
    })

    it('removes empty blocks after clearing', () => {
      const bm = new BlockedBitmap(64, { blockSize: 8 })
      bm.set(0)
      expect(bm.stats().storedBlocks).toBe(1)
      bm.clear(0)
      expect(bm.stats().storedBlocks).toBe(0)
      expect(bm.isEmpty).toBe(true)
    })

    it('does not remove block if other bits remain', () => {
      const bm = new BlockedBitmap(16, { blockSize: 8 })
      bm.set(0)
      bm.set(1)
      bm.clear(0)
      expect(bm.stats().storedBlocks).toBe(1)
      expect(bm.get(1)).toBe(1)
    })

    it('throws RangeError for out-of-bounds index', () => {
      const bm = new BlockedBitmap(64)
      expect(() => bm.clear(-1)).toThrow(RangeError)
      expect(() => bm.clear(64)).toThrow(RangeError)
    })
  })

  // ─── get ──────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns 0 for unset bits', () => {
      const bm = new BlockedBitmap(64)
      expect(bm.get(0)).toBe(0)
      expect(bm.get(63)).toBe(0)
    })

    it('returns 1 for set bits', () => {
      const bm = new BlockedBitmap(64)
      bm.set(42)
      expect(bm.get(42)).toBe(1)
    })

    it('throws RangeError for negative index', () => {
      const bm = new BlockedBitmap(64)
      expect(() => bm.get(-1)).toThrow(RangeError)
    })

    it('throws RangeError for index at size', () => {
      const bm = new BlockedBitmap(10)
      expect(() => bm.get(10)).toThrow(RangeError)
    })

    it('correctly reads bits within a byte', () => {
      const bm = new BlockedBitmap(16, { blockSize: 8 })
      bm.set(0)
      bm.set(3)
      bm.set(7)
      expect(bm.get(0)).toBe(1)
      expect(bm.get(1)).toBe(0)
      expect(bm.get(2)).toBe(0)
      expect(bm.get(3)).toBe(1)
      expect(bm.get(4)).toBe(0)
      expect(bm.get(5)).toBe(0)
      expect(bm.get(6)).toBe(0)
      expect(bm.get(7)).toBe(1)
    })
  })

  // ─── flip ─────────────────────────────────────────────────────────────

  describe('flip', () => {
    it('flips an unset bit to set', () => {
      const bm = new BlockedBitmap(64)
      bm.flip(0)
      expect(bm.get(0)).toBe(1)
    })

    it('flips a set bit to unset', () => {
      const bm = new BlockedBitmap(64)
      bm.set(0)
      bm.flip(0)
      expect(bm.get(0)).toBe(0)
    })

    it('double flip restores original state', () => {
      const bm = new BlockedBitmap(64)
      bm.flip(10)
      bm.flip(10)
      expect(bm.get(10)).toBe(0)
    })

    it('removes block if flip results in empty block', () => {
      const bm = new BlockedBitmap(8, { blockSize: 8 })
      bm.set(0)
      bm.flip(0)
      expect(bm.isEmpty).toBe(true)
    })

    it('throws RangeError for out-of-bounds index', () => {
      const bm = new BlockedBitmap(64)
      expect(() => bm.flip(-1)).toThrow(RangeError)
      expect(() => bm.flip(64)).toThrow(RangeError)
    })
  })

  // ─── setRange ─────────────────────────────────────────────────────────

  describe('setRange', () => {
    it('sets a range of bits', () => {
      const bm = new BlockedBitmap(64)
      bm.setRange(5, 10)
      for (let i = 5; i < 10; i++) {
        expect(bm.get(i)).toBe(1)
      }
      expect(bm.get(4)).toBe(0)
      expect(bm.get(10)).toBe(0)
    })

    it('setRange with start === end is a no-op', () => {
      const bm = new BlockedBitmap(64)
      bm.setRange(5, 5)
      expect(bm.isEmpty).toBe(true)
    })

    it('sets full range', () => {
      const bm = new BlockedBitmap(16, { blockSize: 8 })
      bm.setRange(0, 16)
      expect(bm.countSetBits()).toBe(16)
    })

    it('sets range across block boundaries', () => {
      const bm = new BlockedBitmap(32, { blockSize: 8 })
      bm.setRange(6, 12)
      for (let i = 6; i < 12; i++) {
        expect(bm.get(i)).toBe(1)
      }
      for (let i = 0; i < 6; i++) {
        expect(bm.get(i)).toBe(0)
      }
      for (let i = 12; i < 32; i++) {
        expect(bm.get(i)).toBe(0)
      }
    })

    it('throws RangeError for invalid range', () => {
      const bm = new BlockedBitmap(64)
      expect(() => bm.setRange(-1, 5)).toThrow(RangeError)
      expect(() => bm.setRange(10, 5)).toThrow(RangeError)
      expect(() => bm.setRange(0, 65)).toThrow(RangeError)
    })
  })

  // ─── clearRange ───────────────────────────────────────────────────────

  describe('clearRange', () => {
    it('clears a range of set bits', () => {
      const bm = new BlockedBitmap(64)
      bm.setRange(0, 20)
      bm.clearRange(5, 15)
      for (let i = 5; i < 15; i++) {
        expect(bm.get(i)).toBe(0)
      }
      for (let i = 0; i < 5; i++) {
        expect(bm.get(i)).toBe(1)
      }
      for (let i = 15; i < 20; i++) {
        expect(bm.get(i)).toBe(1)
      }
    })

    it('clearRange with start === end is a no-op', () => {
      const bm = new BlockedBitmap(64)
      bm.setRange(0, 10)
      bm.clearRange(5, 5)
      expect(bm.countSetBits()).toBe(10)
    })

    it('clearing unset bits in range is a no-op', () => {
      const bm = new BlockedBitmap(64)
      bm.clearRange(0, 64)
      expect(bm.isEmpty).toBe(true)
    })

    it('removes empty blocks after clearing range', () => {
      const bm = new BlockedBitmap(16, { blockSize: 8 })
      bm.set(0)
      bm.set(7)
      bm.clearRange(0, 8)
      expect(bm.stats().storedBlocks).toBe(0)
    })

    it('throws RangeError for invalid range', () => {
      const bm = new BlockedBitmap(64)
      expect(() => bm.clearRange(-1, 5)).toThrow(RangeError)
      expect(() => bm.clearRange(10, 5)).toThrow(RangeError)
    })
  })

  // ─── getRange ─────────────────────────────────────────────────────────

  describe('getRange', () => {
    it('returns bit values in a range', () => {
      const bm = new BlockedBitmap(64)
      bm.set(2)
      bm.set(4)
      expect(bm.getRange(0, 5)).toEqual([0, 0, 1, 0, 1])
    })

    it('returns empty array for start === end', () => {
      const bm = new BlockedBitmap(64)
      expect(bm.getRange(5, 5)).toEqual([])
    })

    it('returns all zeros for unset bitmap', () => {
      const bm = new BlockedBitmap(8)
      expect(bm.getRange(0, 8)).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
    })

    it('returns all ones for fully set bitmap', () => {
      const bm = new BlockedBitmap(8, { blockSize: 8 })
      bm.setRange(0, 8)
      expect(bm.getRange(0, 8)).toEqual([1, 1, 1, 1, 1, 1, 1, 1])
    })

    it('throws RangeError for invalid range', () => {
      const bm = new BlockedBitmap(10)
      expect(() => bm.getRange(5, 11)).toThrow(RangeError)
      expect(() => bm.getRange(5, 3)).toThrow(RangeError)
    })
  })

  // ─── countSetBits / cardinality ───────────────────────────────────────

  describe('countSetBits and cardinality', () => {
    it('returns 0 for empty bitmap', () => {
      const bm = new BlockedBitmap(64)
      expect(bm.countSetBits()).toBe(0)
    })

    it('counts single set bit', () => {
      const bm = new BlockedBitmap(64)
      bm.set(42)
      expect(bm.countSetBits()).toBe(1)
    })

    it('counts multiple set bits', () => {
      const bm = new BlockedBitmap(64)
      bm.set(0)
      bm.set(1)
      bm.set(5)
      bm.set(63)
      expect(bm.countSetBits()).toBe(4)
    })

    it('counts bits across blocks', () => {
      const bm = new BlockedBitmap(128, { blockSize: 32 })
      bm.set(0)
      bm.set(31)
      bm.set(32)
      bm.set(63)
      bm.set(100)
      expect(bm.countSetBits()).toBe(5)
    })

    it('cardinality equals countSetBits', () => {
      const bm = new BlockedBitmap(64)
      bm.set(0)
      bm.set(10)
      bm.set(20)
      expect(bm.cardinality).toBe(bm.countSetBits())
    })

    it('counts after setRange', () => {
      const bm = new BlockedBitmap(64)
      bm.setRange(10, 20)
      expect(bm.countSetBits()).toBe(10)
    })

    it('counts after clearing some bits', () => {
      const bm = new BlockedBitmap(64)
      bm.setRange(0, 10)
      bm.clear(5)
      expect(bm.countSetBits()).toBe(9)
    })
  })

  // ─── findFirstSet ─────────────────────────────────────────────────────

  describe('findFirstSet', () => {
    it('returns -1 for empty bitmap', () => {
      const bm = new BlockedBitmap(64)
      expect(bm.findFirstSet()).toBe(-1)
    })

    it('returns 0 when first bit is set', () => {
      const bm = new BlockedBitmap(64)
      bm.set(0)
      expect(bm.findFirstSet()).toBe(0)
    })

    it('returns correct index for bit set in the middle', () => {
      const bm = new BlockedBitmap(64)
      bm.set(42)
      expect(bm.findFirstSet()).toBe(42)
    })

    it('returns first set bit when multiple are set', () => {
      const bm = new BlockedBitmap(64)
      bm.set(10)
      bm.set(5)
      bm.set(20)
      expect(bm.findFirstSet()).toBe(5)
    })

    it('finds first set bit across blocks', () => {
      const bm = new BlockedBitmap(128, { blockSize: 32 })
      bm.set(64)
      bm.set(100)
      expect(bm.findFirstSet()).toBe(64)
    })

    it('returns -1 after all bits cleared', () => {
      const bm = new BlockedBitmap(64)
      bm.set(10)
      bm.clear(10)
      expect(bm.findFirstSet()).toBe(-1)
    })
  })

  // ─── findFirstClear ───────────────────────────────────────────────────

  describe('findFirstClear', () => {
    it('returns 0 for empty bitmap', () => {
      const bm = new BlockedBitmap(64)
      expect(bm.findFirstClear()).toBe(0)
    })

    it('returns first unset bit', () => {
      const bm = new BlockedBitmap(64)
      bm.set(0)
      bm.set(1)
      expect(bm.findFirstClear()).toBe(2)
    })

    it('returns -1 when all bits are set', () => {
      const bm = new BlockedBitmap(8, { blockSize: 8 })
      bm.setRange(0, 8)
      expect(bm.findFirstClear()).toBe(-1)
    })

    it('finds clear bit after a gap', () => {
      const bm = new BlockedBitmap(64)
      bm.setRange(0, 10)
      expect(bm.findFirstClear()).toBe(10)
    })

    it('returns 0 for single-bit bitmap that is unset', () => {
      const bm = new BlockedBitmap(1, { blockSize: 8 })
      expect(bm.findFirstClear()).toBe(0)
    })

    it('returns -1 for single-bit bitmap that is set', () => {
      const bm = new BlockedBitmap(1, { blockSize: 8 })
      bm.set(0)
      expect(bm.findFirstClear()).toBe(-1)
    })
  })

  // ─── isEmpty / size ───────────────────────────────────────────────────

  describe('isEmpty and size', () => {
    it('isEmpty is true for new bitmap', () => {
      const bm = new BlockedBitmap(64)
      expect(bm.isEmpty).toBe(true)
    })

    it('isEmpty is false after setting a bit', () => {
      const bm = new BlockedBitmap(64)
      bm.set(0)
      expect(bm.isEmpty).toBe(false)
    })

    it('isEmpty is true after clearing the only set bit', () => {
      const bm = new BlockedBitmap(64)
      bm.set(5)
      bm.clear(5)
      expect(bm.isEmpty).toBe(true)
    })

    it('size returns the constructor size', () => {
      expect(new BlockedBitmap(0).size).toBe(0)
      expect(new BlockedBitmap(1).size).toBe(1)
      expect(new BlockedBitmap(1000).size).toBe(1000)
    })
  })

  // ─── clearAll ─────────────────────────────────────────────────────────

  describe('clearAll', () => {
    it('clears all set bits', () => {
      const bm = new BlockedBitmap(64)
      bm.setRange(0, 10)
      bm.clearAll()
      expect(bm.isEmpty).toBe(true)
      expect(bm.countSetBits()).toBe(0)
    })

    it('clearAll on empty bitmap is a no-op', () => {
      const bm = new BlockedBitmap(64)
      bm.clearAll()
      expect(bm.isEmpty).toBe(true)
    })

    it('clearAll resets stats', () => {
      const bm = new BlockedBitmap(64, { blockSize: 8 })
      bm.setRange(0, 20)
      bm.clearAll()
      expect(bm.stats().storedBlocks).toBe(0)
      expect(bm.stats().setBits).toBe(0)
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates an independent copy', () => {
      const bm = new BlockedBitmap(64)
      bm.set(5)
      const clone = bm.clone()
      expect(clone.get(5)).toBe(1)
      expect(clone.size).toBe(64)
    })

    it('modifications to clone do not affect original', () => {
      const bm = new BlockedBitmap(64)
      bm.set(5)
      const clone = bm.clone()
      clone.clear(5)
      clone.set(10)
      expect(bm.get(5)).toBe(1)
      expect(bm.get(10)).toBe(0)
    })

    it('clones empty bitmap', () => {
      const bm = new BlockedBitmap(0)
      const clone = bm.clone()
      expect(clone.size).toBe(0)
      expect(clone.isEmpty).toBe(true)
    })

    it('preserves block size', () => {
      const bm = new BlockedBitmap(64, { blockSize: 16 })
      const clone = bm.clone()
      expect(clone.stats().blockSize).toBe(16)
    })

    it('clones bitmap with multiple blocks', () => {
      const bm = new BlockedBitmap(128, { blockSize: 32 })
      bm.set(0)
      bm.set(31)
      bm.set(32)
      bm.set(100)
      const clone = bm.clone()
      expect(clone.toBitArray()).toEqual(bm.toBitArray())
      expect(clone.stats().storedBlocks).toBe(bm.stats().storedBlocks)
    })
  })

  // ─── static from ──────────────────────────────────────────────────────

  describe('static from', () => {
    it('creates bitmap from bit array', () => {
      const bm = BlockedBitmap.from([1, 0, 1, 1, 0])
      expect(bm.size).toBe(5)
      expect(bm.get(0)).toBe(1)
      expect(bm.get(1)).toBe(0)
      expect(bm.get(2)).toBe(1)
      expect(bm.get(3)).toBe(1)
      expect(bm.get(4)).toBe(0)
    })

    it('creates bitmap from all zeros', () => {
      const bm = BlockedBitmap.from([0, 0, 0])
      expect(bm.isEmpty).toBe(true)
      expect(bm.countSetBits()).toBe(0)
    })

    it('creates bitmap from all ones', () => {
      const bm = BlockedBitmap.from([1, 1, 1])
      expect(bm.countSetBits()).toBe(3)
    })

    it('creates bitmap from empty array', () => {
      const bm = BlockedBitmap.from([])
      expect(bm.size).toBe(0)
      expect(bm.isEmpty).toBe(true)
    })

    it('creates bitmap with custom block size', () => {
      const bm = BlockedBitmap.from([1, 0, 1], { blockSize: 8 })
      expect(bm.stats().blockSize).toBe(8)
    })

    it('throws Error for invalid bit value', () => {
      expect(() => BlockedBitmap.from([2])).toThrow(Error)
      expect(() => BlockedBitmap.from([1, -1])).toThrow(Error)
      expect(() => BlockedBitmap.from([0, 0, 3])).toThrow(Error)
    })
  })

  // ─── toBitArray ───────────────────────────────────────────────────────

  describe('toBitArray', () => {
    it('converts to array of 0s and 1s', () => {
      const bm = BlockedBitmap.from([1, 0, 1, 0, 1])
      expect(bm.toBitArray()).toEqual([1, 0, 1, 0, 1])
    })

    it('returns all zeros for empty bitmap', () => {
      const bm = new BlockedBitmap(4)
      expect(bm.toBitArray()).toEqual([0, 0, 0, 0])
    })

    it('returns empty array for size 0', () => {
      const bm = new BlockedBitmap(0)
      expect(bm.toBitArray()).toEqual([])
    })

    it('returns new array each time', () => {
      const bm = new BlockedBitmap(4)
      const a1 = bm.toBitArray()
      const a2 = bm.toBitArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })
  })

  // ─── toSet ────────────────────────────────────────────────────────────

  describe('toSet', () => {
    it('returns set of set bit indices', () => {
      const bm = new BlockedBitmap(64)
      bm.set(5)
      bm.set(10)
      bm.set(20)
      expect(bm.toSet()).toEqual(new Set([5, 10, 20]))
    })

    it('returns empty set for unset bitmap', () => {
      const bm = new BlockedBitmap(64)
      expect(bm.toSet()).toEqual(new Set())
    })

    it('returns consecutive indices for full range', () => {
      const bm = new BlockedBitmap(8, { blockSize: 8 })
      bm.setRange(0, 8)
      expect(bm.toSet()).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7]))
    })

    it('only includes indices within size bounds', () => {
      const bm = new BlockedBitmap(5, { blockSize: 8 })
      bm.setRange(0, 5)
      const s = bm.toSet()
      expect(s.size).toBe(5)
      expect(s.has(5)).toBe(false)
      expect(s.has(6)).toBe(false)
    })
  })

  // ─── stats ────────────────────────────────────────────────────────────

  describe('stats', () => {
    it('returns correct stats for empty bitmap', () => {
      const bm = new BlockedBitmap(64, { blockSize: 16 })
      const stats = bm.stats()
      expect(stats.totalBits).toBe(64)
      expect(stats.storedBlocks).toBe(0)
      expect(stats.totalBlocks).toBe(4)
      expect(stats.blockSize).toBe(16)
      expect(stats.bytesUsed).toBe(0)
      expect(stats.setBits).toBe(0)
    })

    it('returns correct stats after setting bits', () => {
      const bm = new BlockedBitmap(64, { blockSize: 16 })
      bm.set(0)
      bm.set(20)
      const stats = bm.stats()
      expect(stats.storedBlocks).toBe(2)
      expect(stats.bytesUsed).toBe(4)
      expect(stats.setBits).toBe(2)
    })

    it('totalBlocks is 0 for size 0', () => {
      const bm = new BlockedBitmap(0)
      expect(bm.stats().totalBlocks).toBe(0)
    })

    it('bytesUsed is blockByteSize * storedBlocks', () => {
      const bm = new BlockedBitmap(128, { blockSize: 32 })
      bm.set(0)
      bm.set(64)
      const stats = bm.stats()
      expect(stats.storedBlocks).toBe(2)
      expect(stats.bytesUsed).toBe(2 * (32 / 8))
    })

    it('totalBlocks rounds up for non-aligned sizes', () => {
      const bm = new BlockedBitmap(100, { blockSize: 64 })
      expect(bm.stats().totalBlocks).toBe(2)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('single bit bitmap - set and get', () => {
      const bm = new BlockedBitmap(1, { blockSize: 8 })
      bm.set(0)
      expect(bm.get(0)).toBe(1)
      expect(bm.countSetBits()).toBe(1)
    })

    it('single bit bitmap - out of bounds', () => {
      const bm = new BlockedBitmap(1, { blockSize: 8 })
      expect(() => bm.set(1)).toThrow(RangeError)
      expect(() => bm.get(1)).toThrow(RangeError)
    })

    it('set and clear all bits multiple times', () => {
      const bm = new BlockedBitmap(16, { blockSize: 8 })
      for (let round = 0; round < 3; round++) {
        bm.setRange(0, 16)
        expect(bm.countSetBits()).toBe(16)
        bm.clearRange(0, 16)
        expect(bm.countSetBits()).toBe(0)
        expect(bm.isEmpty).toBe(true)
      }
    })

    it('handles setting every other bit', () => {
      const bm = new BlockedBitmap(64)
      for (let i = 0; i < 64; i += 2) {
        bm.set(i)
      }
      expect(bm.countSetBits()).toBe(32)
      for (let i = 0; i < 64; i++) {
        expect(bm.get(i)).toBe(i % 2 === 0 ? 1 : 0)
      }
    })

    it('handles small block size operations', () => {
      const bm = new BlockedBitmap(32, { blockSize: 8 })
      bm.set(0)
      bm.set(7)
      bm.set(8)
      bm.set(15)
      bm.set(16)
      bm.set(23)
      bm.set(24)
      bm.set(31)
      expect(bm.countSetBits()).toBe(8)
      expect(bm.stats().storedBlocks).toBe(4)
    })

    it('large bitmap sparse access', () => {
      const bm = new BlockedBitmap(10000, { blockSize: 512 })
      bm.set(0)
      bm.set(5000)
      bm.set(9999)
      expect(bm.countSetBits()).toBe(3)
      expect(bm.get(0)).toBe(1)
      expect(bm.get(5000)).toBe(1)
      expect(bm.get(9999)).toBe(1)
      expect(bm.get(5001)).toBe(0)
    })

    it('from and toBitArray roundtrip', () => {
      const bits = [1, 0, 1, 1, 0, 0, 1, 0, 1]
      const bm = BlockedBitmap.from(bits)
      expect(bm.toBitArray()).toEqual(bits)
    })

    it('clone and modify independence', () => {
      const bm = BlockedBitmap.from([1, 1, 1, 1, 1])
      const clone = bm.clone()
      clone.clearRange(0, 5)
      expect(bm.countSetBits()).toBe(5)
      expect(clone.countSetBits()).toBe(0)
    })

    it('flip all bits of a small bitmap', () => {
      const bm = BlockedBitmap.from([1, 0, 1, 0, 1, 0, 1, 0])
      for (let i = 0; i < 8; i++) {
        bm.flip(i)
      }
      expect(bm.toBitArray()).toEqual([0, 1, 0, 1, 0, 1, 0, 1])
    })

    it('findFirstSet finds lowest block index', () => {
      const bm = new BlockedBitmap(256, { blockSize: 64 })
      bm.set(200)
      bm.set(50)
      expect(bm.findFirstSet()).toBe(50)
    })

    it('getRange matches individual gets', () => {
      const bm = new BlockedBitmap(32, { blockSize: 8 })
      bm.set(0)
      bm.set(7)
      bm.set(15)
      bm.set(23)
      const range = bm.getRange(0, 32)
      for (let i = 0; i < 32; i++) {
        expect(range[i]).toBe(bm.get(i))
      }
    })

    it('clearAll then reuse', () => {
      const bm = new BlockedBitmap(64)
      bm.setRange(0, 64)
      bm.clearAll()
      expect(bm.isEmpty).toBe(true)
      bm.set(32)
      expect(bm.get(32)).toBe(1)
      expect(bm.countSetBits()).toBe(1)
    })

    it('toSet matches countSetBits', () => {
      const bm = new BlockedBitmap(128, { blockSize: 32 })
      bm.set(0)
      bm.set(31)
      bm.set(65)
      bm.set(127)
      expect(bm.toSet().size).toBe(bm.countSetBits())
    })

    it('operations on bitmap with size not aligned to block size', () => {
      const bm = new BlockedBitmap(10, { blockSize: 8 })
      bm.set(9)
      expect(bm.get(9)).toBe(1)
      expect(bm.countSetBits()).toBe(1)
      bm.clear(9)
      expect(bm.isEmpty).toBe(true)
    })

    it('stats after partial set and clear', () => {
      const bm = new BlockedBitmap(64, { blockSize: 8 })
      bm.set(0)
      bm.set(1)
      bm.set(2)
      bm.clear(1)
      const stats = bm.stats()
      expect(stats.setBits).toBe(2)
      expect(stats.storedBlocks).toBe(1)
    })

    it('from with single element arrays', () => {
      const bm0 = BlockedBitmap.from([0])
      expect(bm0.size).toBe(1)
      expect(bm0.get(0)).toBe(0)

      const bm1 = BlockedBitmap.from([1])
      expect(bm1.size).toBe(1)
      expect(bm1.get(0)).toBe(1)
    })

    it('validateIndex boundary - index 0 valid on size 1', () => {
      const bm = new BlockedBitmap(1, { blockSize: 8 })
      expect(() => bm.get(0)).not.toThrow()
    })

    it('validateIndex boundary - index 1 invalid on size 1', () => {
      const bm = new BlockedBitmap(1, { blockSize: 8 })
      expect(() => bm.get(1)).toThrow(RangeError)
    })

    it('set and clear pattern leaves correct state', () => {
      const bm = new BlockedBitmap(32, { blockSize: 16 })
      bm.setRange(0, 32)
      bm.clearRange(8, 24)
      expect(bm.countSetBits()).toBe(16)
      expect(bm.getRange(0, 8)).toEqual([1, 1, 1, 1, 1, 1, 1, 1])
      expect(bm.getRange(8, 24).every((b) => b === 0)).toBe(true)
      expect(bm.getRange(24, 32).every((b) => b === 1)).toBe(true)
    })
  })
})
