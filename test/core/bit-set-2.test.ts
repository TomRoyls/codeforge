import { describe, it, expect, beforeEach } from 'vitest'
import { BitSet2 } from '../../src/core/bit-set-2/index.js'

describe('BitSet2', () => {
  describe('constructor', () => {
    it('should create with default size', () => {
      const bs = new BitSet2()
      expect(bs.size).toBe(64)
      expect(bs.isEmpty).toBe(true)
      expect(bs.count).toBe(0)
    })

    it('should create with specified size', () => {
      const bs = new BitSet2(128)
      expect(bs.size).toBe(128)
    })

    it('should create with size 0', () => {
      const bs = new BitSet2(0)
      expect(bs.size).toBe(0)
    })

    it('should create with options object', () => {
      const bs = new BitSet2({ size: 100, growable: false })
      expect(bs.size).toBe(100)
    })

    it('should create with options and default growable', () => {
      const bs = new BitSet2({ size: 50 })
      expect(bs.size).toBe(50)
    })

    it('should throw for negative size', () => {
      expect(() => new BitSet2(-1)).toThrow('non-negative')
    })

    it('should throw for non-integer size', () => {
      expect(() => new BitSet2(3.5)).toThrow('integer')
    })

    it('should throw for negative size in options', () => {
      expect(() => new BitSet2({ size: -5 })).toThrow('non-negative')
    })

    it('should throw for non-integer size in options', () => {
      expect(() => new BitSet2({ size: 2.7 })).toThrow('integer')
    })
  })

  describe('set', () => {
    let bs: BitSet2
    beforeEach(() => { bs = new BitSet2(64) })

    it('should set a bit', () => {
      bs.set(0)
      expect(bs.get(0)).toBe(true)
    })

    it('should set multiple bits', () => {
      bs.set(1).set(3).set(7)
      expect(bs.get(1)).toBe(true)
      expect(bs.get(3)).toBe(true)
      expect(bs.get(7)).toBe(true)
      expect(bs.get(2)).toBe(false)
    })

    it('should be chainable', () => {
      const result = bs.set(5)
      expect(result).toBe(bs)
    })

    it('should set high bit in first word', () => {
      bs.set(31)
      expect(bs.get(31)).toBe(true)
    })

    it('should set bit in second word', () => {
      bs.set(32)
      expect(bs.get(32)).toBe(true)
    })

    it('should grow when index exceeds size', () => {
      bs.set(100)
      expect(bs.get(100)).toBe(true)
      expect(bs.size).toBe(101)
    })

    it('should throw for negative index', () => {
      expect(() => bs.set(-1)).toThrow('non-negative')
    })

    it('should throw for non-integer index', () => {
      expect(() => bs.set(1.5)).toThrow('integer')
    })

    it('should throw when non-growable and index exceeds size', () => {
      const fixed = new BitSet2({ size: 16, growable: false })
      expect(() => fixed.set(16)).toThrow('out of bounds')
    })
  })

  describe('clear', () => {
    let bs: BitSet2
    beforeEach(() => { bs = new BitSet2(64) })

    it('should clear a set bit', () => {
      bs.set(5)
      bs.clear(5)
      expect(bs.get(5)).toBe(false)
    })

    it('should be chainable', () => {
      bs.set(5)
      const result = bs.clear(5)
      expect(result).toBe(bs)
    })

    it('should be no-op on already clear bit', () => {
      bs.clear(3)
      expect(bs.get(3)).toBe(false)
    })

    it('should be no-op for negative index', () => {
      bs.clear(-1)
    })

    it('should be no-op for index beyond size', () => {
      bs.clear(100)
    })

    it('should clear and set again', () => {
      bs.set(10)
      bs.clear(10)
      expect(bs.get(10)).toBe(false)
      bs.set(10)
      expect(bs.get(10)).toBe(true)
    })
  })

  describe('toggle', () => {
    let bs: BitSet2
    beforeEach(() => { bs = new BitSet2(64) })

    it('should toggle bit on', () => {
      bs.toggle(5)
      expect(bs.get(5)).toBe(true)
    })

    it('should toggle bit off', () => {
      bs.set(5)
      bs.toggle(5)
      expect(bs.get(5)).toBe(false)
    })

    it('should be chainable', () => {
      const result = bs.toggle(0)
      expect(result).toBe(bs)
    })

    it('should toggle multiple times', () => {
      bs.toggle(3)
      expect(bs.get(3)).toBe(true)
      bs.toggle(3)
      expect(bs.get(3)).toBe(false)
      bs.toggle(3)
      expect(bs.get(3)).toBe(true)
    })

    it('should grow when toggling beyond size', () => {
      bs.toggle(100)
      expect(bs.get(100)).toBe(true)
      expect(bs.size).toBe(101)
    })
  })

  describe('get', () => {
    let bs: BitSet2
    beforeEach(() => { bs = new BitSet2(64) })

    it('should return false for unset bit', () => {
      expect(bs.get(5)).toBe(false)
    })

    it('should return true for set bit', () => {
      bs.set(5)
      expect(bs.get(5)).toBe(true)
    })

    it('should return false for negative index', () => {
      expect(bs.get(-1)).toBe(false)
    })

    it('should return false for index beyond size', () => {
      expect(bs.get(100)).toBe(false)
    })

    it('should return false for non-integer index', () => {
      expect(bs.get(1.5)).toBe(false)
    })

    it('should return false for NaN', () => {
      expect(bs.get(NaN)).toBe(false)
    })
  })

  describe('flip', () => {
    it('should flip all bits', () => {
      const bs = new BitSet2(8)
      bs.set(0).set(2).set(4)
      bs.flip()
      expect(bs.get(0)).toBe(false)
      expect(bs.get(1)).toBe(true)
      expect(bs.get(2)).toBe(false)
      expect(bs.get(3)).toBe(true)
      expect(bs.get(4)).toBe(false)
      expect(bs.get(5)).toBe(true)
      expect(bs.get(6)).toBe(true)
      expect(bs.get(7)).toBe(true)
    })

    it('should be chainable', () => {
      const bs = new BitSet2(8)
      const result = bs.flip()
      expect(result).toBe(bs)
    })

    it('should flip empty bitset', () => {
      const bs = new BitSet2(4)
      bs.flip()
      expect(bs.get(0)).toBe(true)
      expect(bs.get(1)).toBe(true)
      expect(bs.get(2)).toBe(true)
      expect(bs.get(3)).toBe(true)
    })

    it('should flip full bitset', () => {
      const bs = new BitSet2(4)
      bs.setAll()
      bs.flip()
      expect(bs.isEmpty).toBe(true)
    })

    it('should not set bits beyond size', () => {
      const bs = new BitSet2(3)
      bs.flip()
      expect(bs.get(0)).toBe(true)
      expect(bs.get(1)).toBe(true)
      expect(bs.get(2)).toBe(true)
    })
  })

  describe('and', () => {
    it('should AND two bitsets', () => {
      const a = new BitSet2(8)
      a.set(0).set(2).set(4)
      const b = new BitSet2(8)
      b.set(0).set(3).set(4)
      a.and(b)
      expect(a.get(0)).toBe(true)
      expect(a.get(2)).toBe(false)
      expect(a.get(3)).toBe(false)
      expect(a.get(4)).toBe(true)
    })

    it('should be chainable', () => {
      const a = new BitSet2(4)
      const b = new BitSet2(4)
      const result = a.and(b)
      expect(result).toBe(a)
    })

    it('should clear extra words when a is larger', () => {
      const a = new BitSet2(64)
      a.set(33)
      const b = new BitSet2(32)
      a.and(b)
      expect(a.get(33)).toBe(false)
    })
  })

  describe('or', () => {
    it('should OR two bitsets', () => {
      const a = new BitSet2(8)
      a.set(0).set(2)
      const b = new BitSet2(8)
      b.set(1).set(3)
      a.or(b)
      expect(a.get(0)).toBe(true)
      expect(a.get(1)).toBe(true)
      expect(a.get(2)).toBe(true)
      expect(a.get(3)).toBe(true)
    })

    it('should be chainable', () => {
      const a = new BitSet2(4)
      const b = new BitSet2(4)
      const result = a.or(b)
      expect(result).toBe(a)
    })

    it('should grow to accommodate larger operand', () => {
      const a = new BitSet2(32)
      const b = new BitSet2(64)
      b.set(50)
      a.or(b)
      expect(a.get(50)).toBe(true)
      expect(a.size).toBe(64)
    })
  })

  describe('xor', () => {
    it('should XOR two bitsets', () => {
      const a = new BitSet2(8)
      a.set(0).set(2)
      const b = new BitSet2(8)
      b.set(0).set(3)
      a.xor(b)
      expect(a.get(0)).toBe(false)
      expect(a.get(2)).toBe(true)
      expect(a.get(3)).toBe(true)
    })

    it('should be chainable', () => {
      const a = new BitSet2(4)
      const b = new BitSet2(4)
      const result = a.xor(b)
      expect(result).toBe(a)
    })

    it('should grow to accommodate larger operand', () => {
      const a = new BitSet2(32)
      const b = new BitSet2(64)
      b.set(50)
      a.xor(b)
      expect(a.get(50)).toBe(true)
    })
  })

  describe('not', () => {
    it('should return a new inverted bitset', () => {
      const bs = new BitSet2(4)
      bs.set(0).set(2)
      const inverted = bs.not()
      expect(inverted.get(0)).toBe(false)
      expect(inverted.get(1)).toBe(true)
      expect(inverted.get(2)).toBe(false)
      expect(inverted.get(3)).toBe(true)
    })

    it('should not modify original', () => {
      const bs = new BitSet2(4)
      bs.set(0)
      bs.not()
      expect(bs.get(0)).toBe(true)
    })

    it('should return a new instance', () => {
      const bs = new BitSet2(4)
      const result = bs.not()
      expect(result).not.toBe(bs)
    })
  })

  describe('nand', () => {
    it('should NAND two bitsets', () => {
      const a = new BitSet2(8)
      a.set(0).set(2)
      const b = new BitSet2(8)
      b.set(0).set(3)
      a.nand(b)
      expect(a.get(0)).toBe(false)
      expect(a.get(1)).toBe(true)
      expect(a.get(2)).toBe(true)
      expect(a.get(3)).toBe(true)
    })

    it('should be chainable', () => {
      const a = new BitSet2(4)
      const b = new BitSet2(4)
      const result = a.nand(b)
      expect(result).toBe(a)
    })
  })

  describe('nor', () => {
    it('should NOR two bitsets', () => {
      const a = new BitSet2(8)
      a.set(0).set(2)
      const b = new BitSet2(8)
      b.set(1).set(2)
      a.nor(b)
      expect(a.get(0)).toBe(false)
      expect(a.get(1)).toBe(false)
      expect(a.get(2)).toBe(false)
      expect(a.get(3)).toBe(true)
    })

    it('should be chainable', () => {
      const a = new BitSet2(4)
      const b = new BitSet2(4)
      const result = a.nor(b)
      expect(result).toBe(a)
    })
  })

  describe('size', () => {
    it('should return initial size', () => {
      const bs = new BitSet2(32)
      expect(bs.size).toBe(32)
    })

    it('should grow when setting beyond size', () => {
      const bs = new BitSet2(16)
      bs.set(50)
      expect(bs.size).toBe(51)
    })
  })

  describe('count', () => {
    it('should return 0 for empty bitset', () => {
      const bs = new BitSet2(64)
      expect(bs.count).toBe(0)
    })

    it('should count set bits', () => {
      const bs = new BitSet2(64)
      bs.set(0).set(5).set(31)
      expect(bs.count).toBe(3)
    })

    it('should count across word boundary', () => {
      const bs = new BitSet2(64)
      bs.set(0).set(32)
      expect(bs.count).toBe(2)
    })

    it('should update after clear', () => {
      const bs = new BitSet2(16)
      bs.set(1).set(3).set(7)
      expect(bs.count).toBe(3)
      bs.clear(3)
      expect(bs.count).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new bitset', () => {
      const bs = new BitSet2(64)
      expect(bs.isEmpty).toBe(true)
    })

    it('should be false after setting a bit', () => {
      const bs = new BitSet2(64)
      bs.set(0)
      expect(bs.isEmpty).toBe(false)
    })

    it('should be true after clearing all bits', () => {
      const bs = new BitSet2(16)
      bs.set(5)
      bs.clear(5)
      expect(bs.isEmpty).toBe(true)
    })
  })

  describe('setAll', () => {
    it('should set all bits', () => {
      const bs = new BitSet2(8)
      bs.setAll()
      expect(bs.count).toBe(8)
      for (let i = 0; i < 8; i++) {
        expect(bs.get(i)).toBe(true)
      }
    })

    it('should be chainable', () => {
      const bs = new BitSet2(4)
      const result = bs.setAll()
      expect(result).toBe(bs)
    })

    it('should handle non-aligned size', () => {
      const bs = new BitSet2(5)
      bs.setAll()
      expect(bs.get(0)).toBe(true)
      expect(bs.get(4)).toBe(true)
      expect(bs.count).toBe(5)
    })
  })

  describe('clearAll', () => {
    it('should clear all bits', () => {
      const bs = new BitSet2(16)
      bs.setAll()
      bs.clearAll()
      expect(bs.isEmpty).toBe(true)
    })

    it('should be chainable', () => {
      const bs = new BitSet2(4)
      const result = bs.clearAll()
      expect(result).toBe(bs)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const bs = new BitSet2(16)
      bs.set(3).set(7)
      const copy = bs.clone()
      expect(copy.get(3)).toBe(true)
      expect(copy.get(7)).toBe(true)
      expect(copy.size).toBe(bs.size)
    })

    it('should not affect original when modified', () => {
      const bs = new BitSet2(16)
      bs.set(5)
      const copy = bs.clone()
      copy.clear(5)
      expect(bs.get(5)).toBe(true)
    })

    it('should be a different instance', () => {
      const bs = new BitSet2(16)
      const copy = bs.clone()
      expect(copy).not.toBe(bs)
    })
  })

  describe('equals', () => {
    it('should return true for identical bitsets', () => {
      const a = new BitSet2(16)
      a.set(1).set(3)
      const b = new BitSet2(16)
      b.set(1).set(3)
      expect(a.equals(b)).toBe(true)
    })

    it('should return true for two empty bitsets', () => {
      const a = new BitSet2(16)
      const b = new BitSet2(16)
      expect(a.equals(b)).toBe(true)
    })

    it('should return false for different bits', () => {
      const a = new BitSet2(16)
      a.set(1)
      const b = new BitSet2(16)
      b.set(2)
      expect(a.equals(b)).toBe(false)
    })

    it('should return false for different sizes', () => {
      const a = new BitSet2(16)
      const b = new BitSet2(32)
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('intersects', () => {
    it('should return true when bits overlap', () => {
      const a = new BitSet2(16)
      a.set(3).set(7)
      const b = new BitSet2(16)
      b.set(2).set(7)
      expect(a.intersects(b)).toBe(true)
    })

    it('should return false when no overlap', () => {
      const a = new BitSet2(16)
      a.set(1).set(3)
      const b = new BitSet2(16)
      b.set(2).set(4)
      expect(a.intersects(b)).toBe(false)
    })

    it('should return false for empty bitsets', () => {
      const a = new BitSet2(16)
      const b = new BitSet2(16)
      expect(a.intersects(b)).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return indices of set bits', () => {
      const bs = new BitSet2(16)
      bs.set(1).set(3).set(7)
      expect(bs.toArray()).toEqual([1, 3, 7])
    })

    it('should return empty array for empty bitset', () => {
      const bs = new BitSet2(16)
      expect(bs.toArray()).toEqual([])
    })

    it('should handle all bits set', () => {
      const bs = new BitSet2(4)
      bs.setAll()
      expect(bs.toArray()).toEqual([0, 1, 2, 3])
    })
  })

  describe('toString', () => {
    it('should return string representation', () => {
      const bs = new BitSet2(8)
      bs.set(0).set(2).set(7)
      expect(bs.toString()).toBe('10000101')
    })

    it('should return all zeros for empty bitset', () => {
      const bs = new BitSet2(4)
      expect(bs.toString()).toBe('0000')
    })

    it('should return all ones for full bitset', () => {
      const bs = new BitSet2(4)
      bs.setAll()
      expect(bs.toString()).toBe('1111')
    })
  })

  describe('forEach', () => {
    it('should iterate over all bits', () => {
      const bs = new BitSet2(4)
      bs.set(1).set(3)
      const results: Array<{ index: number; value: boolean }> = []
      bs.forEach((index, value) => {
        results.push({ index, value })
      })
      expect(results).toEqual([
        { index: 0, value: false },
        { index: 1, value: true },
        { index: 2, value: false },
        { index: 3, value: true },
      ])
    })

    it('should handle empty bitset', () => {
      const bs = new BitSet2(4)
      const results: number[] = []
      bs.forEach((_index, value) => {
        if (value) results.push(_index)
      })
      expect(results).toEqual([])
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over set bits', () => {
      const bs = new BitSet2(16)
      bs.set(1).set(5).set(10)
      expect([...bs]).toEqual([1, 5, 10])
    })

    it('should return empty for empty bitset', () => {
      const bs = new BitSet2(16)
      expect([...bs]).toEqual([])
    })

    it('should work with for-of', () => {
      const bs = new BitSet2(8)
      bs.set(0).set(2).set(4)
      const result: number[] = []
      for (const bit of bs) {
        result.push(bit)
      }
      expect(result).toEqual([0, 2, 4])
    })
  })

  describe('range', () => {
    it('should extract a range of bits', () => {
      const bs = new BitSet2(16)
      bs.set(2).set(4).set(6).set(8)
      const r = bs.range(3, 7)
      expect(r.get(0)).toBe(false)
      expect(r.get(1)).toBe(true)
      expect(r.get(2)).toBe(false)
      expect(r.get(3)).toBe(true)
      expect(r.size).toBe(4)
    })

    it('should return empty for invalid range', () => {
      const bs = new BitSet2(16)
      bs.set(5)
      const r = bs.range(5, 3)
      expect(r.size).toBe(0)
    })

    it('should clamp end to size', () => {
      const bs = new BitSet2(8)
      bs.set(6)
      const r = bs.range(5, 100)
      expect(r.size).toBe(3)
    })

    it('should handle start equal to end', () => {
      const bs = new BitSet2(16)
      bs.set(5)
      const r = bs.range(5, 5)
      expect(r.size).toBe(0)
    })

    it('should handle negative start', () => {
      const bs = new BitSet2(8)
      const r = bs.range(-1, 5)
      expect(r.size).toBe(0)
    })
  })

  describe('nextSet', () => {
    it('should find next set bit', () => {
      const bs = new BitSet2(16)
      bs.set(3).set(7)
      expect(bs.nextSet(0)).toBe(3)
      expect(bs.nextSet(4)).toBe(7)
      expect(bs.nextSet(8)).toBe(-1)
    })

    it('should return -1 when no set bit found', () => {
      const bs = new BitSet2(16)
      expect(bs.nextSet(0)).toBe(-1)
    })

    it('should return current index if set', () => {
      const bs = new BitSet2(16)
      bs.set(5)
      expect(bs.nextSet(5)).toBe(5)
    })

    it('should handle negative from as 0', () => {
      const bs = new BitSet2(16)
      bs.set(0)
      expect(bs.nextSet(-5)).toBe(0)
    })
  })

  describe('nextClear', () => {
    it('should find next clear bit', () => {
      const bs = new BitSet2(16)
      bs.set(0).set(1).set(2)
      expect(bs.nextClear(0)).toBe(3)
    })

    it('should return -1 when no clear bit found', () => {
      const bs = new BitSet2(4)
      bs.setAll()
      expect(bs.nextClear(0)).toBe(-1)
    })

    it('should return current index if clear', () => {
      const bs = new BitSet2(16)
      expect(bs.nextClear(0)).toBe(0)
    })
  })

  describe('previousSet', () => {
    it('should find previous set bit', () => {
      const bs = new BitSet2(16)
      bs.set(3).set(7)
      expect(bs.previousSet(10)).toBe(7)
      expect(bs.previousSet(6)).toBe(3)
    })

    it('should return -1 when no set bit found', () => {
      const bs = new BitSet2(16)
      expect(bs.previousSet(15)).toBe(-1)
    })

    it('should clamp from to size-1', () => {
      const bs = new BitSet2(8)
      bs.set(5)
      expect(bs.previousSet(100)).toBe(5)
    })

    it('should return current index if set', () => {
      const bs = new BitSet2(16)
      bs.set(5)
      expect(bs.previousSet(5)).toBe(5)
    })
  })

  describe('previousClear', () => {
    it('should find previous clear bit', () => {
      const bs = new BitSet2(16)
      bs.set(0).set(1).set(2)
      expect(bs.previousClear(2)).toBe(-1)
      expect(bs.previousClear(5)).toBe(5)
    })

    it('should return -1 when all bits set', () => {
      const bs = new BitSet2(4)
      bs.setAll()
      expect(bs.previousClear(3)).toBe(-1)
    })

    it('should clamp from to size-1', () => {
      const bs = new BitSet2(8)
      expect(bs.previousClear(100)).toBe(7)
    })
  })

  describe('fromArray', () => {
    it('should create bitset from array of indices', () => {
      const bs = BitSet2.fromArray([0, 3, 7])
      expect(bs.get(0)).toBe(true)
      expect(bs.get(3)).toBe(true)
      expect(bs.get(7)).toBe(true)
      expect(bs.get(1)).toBe(false)
    })

    it('should create empty bitset from empty array', () => {
      const bs = BitSet2.fromArray([])
      expect(bs.isEmpty).toBe(true)
    })

    it('should accept options', () => {
      const bs = BitSet2.fromArray([1, 3], { size: 64, growable: false })
      expect(bs.size).toBe(64)
    })

    it('should size based on max index', () => {
      const bs = BitSet2.fromArray([0, 50])
      expect(bs.size).toBe(51)
    })
  })

  describe('words', () => {
    it('should return the underlying Uint32Array', () => {
      const bs = new BitSet2(64)
      expect(bs.words).toBeInstanceOf(Uint32Array)
    })

    it('should have correct length', () => {
      const bs = new BitSet2(64)
      expect(bs.words.length).toBe(2)
    })

    it('should reflect set bits', () => {
      const bs = new BitSet2(64)
      bs.set(0)
      expect(bs.words[0]! & 1).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle bit at index 0', () => {
      const bs = new BitSet2(1)
      bs.set(0)
      expect(bs.get(0)).toBe(true)
      bs.clear(0)
      expect(bs.get(0)).toBe(false)
    })

    it('should handle large bitsets', () => {
      const bs = new BitSet2(10000)
      bs.set(0)
      bs.set(9999)
      bs.set(5000)
      expect(bs.count).toBe(3)
      expect(bs.get(9999)).toBe(true)
    })

    it('should handle cross-word operations', () => {
      const bs = new BitSet2(64)
      bs.set(31)
      bs.set(32)
      expect(bs.get(31)).toBe(true)
      expect(bs.get(32)).toBe(true)
      bs.toggle(31)
      bs.toggle(32)
      expect(bs.get(31)).toBe(false)
      expect(bs.get(32)).toBe(false)
    })

    it('should handle consecutive sets and clears', () => {
      const bs = new BitSet2(32)
      for (let i = 0; i < 32; i++) {
        bs.set(i)
      }
      expect(bs.count).toBe(32)
      for (let i = 0; i < 32; i++) {
        bs.clear(i)
      }
      expect(bs.isEmpty).toBe(true)
    })

    it('should handle size that is exact multiple of 32', () => {
      const bs = new BitSet2(64)
      bs.setAll()
      expect(bs.count).toBe(64)
    })

    it('should handle size 1', () => {
      const bs = new BitSet2(1)
      expect(bs.size).toBe(1)
      bs.set(0)
      expect(bs.count).toBe(1)
      bs.clear(0)
      expect(bs.isEmpty).toBe(true)
    })

    it('should handle bit operations with different sized bitsets', () => {
      const a = new BitSet2(16)
      a.set(0)
      const b = new BitSet2(64)
      b.set(0).set(50)
      a.or(b)
      expect(a.get(0)).toBe(true)
      expect(a.get(50)).toBe(true)
    })

    it('should handle XOR producing all zeros', () => {
      const a = new BitSet2(8)
      a.set(0).set(2)
      const b = new BitSet2(8)
      b.set(0).set(2)
      a.xor(b)
      expect(a.isEmpty).toBe(true)
    })

    it('should handle multiple grow operations', () => {
      const bs = new BitSet2(4)
      bs.set(0)
      bs.set(10)
      bs.set(100)
      bs.set(200)
      expect(bs.size).toBe(201)
      expect(bs.count).toBe(4)
    })
  })
})
