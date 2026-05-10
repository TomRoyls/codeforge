import { describe, it, expect, beforeEach } from 'vitest'
import { RankedBitset } from '../../src/core/ranked-bitset/ranked-bitset.js'
import type { RankedBitsetOptions } from '../../src/core/ranked-bitset/types.js'

function naiveRank(bits: string, index: number): number {
  let count = 0
  for (let i = 0; i < index; i++) {
    if (bits[i] === '1') count++
  }
  return count
}

function naiveSelect1(bits: string, k: number): number {
  let count = 0
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1') {
      if (count === k) return i
      count++
    }
  }
  return -1
}

function naiveSelect0(bits: string, k: number): number {
  let count = 0
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '0') {
      if (count === k) return i
      count++
    }
  }
  return -1
}

describe('RankedBitset', () => {
  let bs: RankedBitset

  beforeEach(() => {
    bs = new RankedBitset()
  })

  describe('constructor', () => {
    it('should create empty bitset with no arguments', () => {
      const b = new RankedBitset()
      expect(b.size).toBe(0)
    })

    it('should create bitset with undefined initial capacity', () => {
      const b = new RankedBitset(undefined)
      expect(b.size).toBe(0)
    })

    it('should create bitset with initial capacity 0', () => {
      const b = new RankedBitset(0)
      expect(b.size).toBe(0)
    })

    it('should create bitset with small initial capacity', () => {
      const b = new RankedBitset(100)
      expect(b.size).toBe(0)
    })

    it('should create bitset with large initial capacity', () => {
      const b = new RankedBitset(10000)
      expect(b.size).toBe(0)
    })

    it('should accept RankedBitsetOptions', () => {
      const opts: RankedBitsetOptions = { initialCapacity: 64 }
      const b = new RankedBitset(opts.initialCapacity)
      expect(b.size).toBe(0)
    })
  })

  describe('set', () => {
    it('should set bit at index 0', () => {
      bs.set(0)
      expect(bs.get(0)).toBe(true)
      expect(bs.size).toBe(1)
    })

    it('should set bit at index 1', () => {
      bs.set(1)
      expect(bs.get(1)).toBe(true)
      expect(bs.size).toBe(2)
    })

    it('should set multiple bits', () => {
      bs.set(0)
      bs.set(5)
      bs.set(10)
      expect(bs.get(0)).toBe(true)
      expect(bs.get(5)).toBe(true)
      expect(bs.get(10)).toBe(true)
      expect(bs.get(1)).toBe(false)
    })

    it('should set bit beyond initial capacity', () => {
      const b = new RankedBitset(10)
      b.set(100)
      expect(b.get(100)).toBe(true)
      expect(b.size).toBe(101)
    })

    it('should handle setting same bit twice', () => {
      bs.set(5)
      bs.set(5)
      expect(bs.get(5)).toBe(true)
    })

    it('should throw on negative index', () => {
      expect(() => bs.set(-1)).toThrow(RangeError)
    })

    it('should set bits at word boundaries', () => {
      bs.set(31)
      bs.set(32)
      bs.set(63)
      bs.set(64)
      expect(bs.get(31)).toBe(true)
      expect(bs.get(32)).toBe(true)
      expect(bs.get(63)).toBe(true)
      expect(bs.get(64)).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear a set bit', () => {
      bs.set(5)
      bs.clear(5)
      expect(bs.get(5)).toBe(false)
    })

    it('should handle clearing unset bit', () => {
      bs.clear(5)
      expect(bs.get(5)).toBe(false)
    })

    it('should throw on negative index', () => {
      expect(() => bs.clear(-1)).toThrow(RangeError)
    })

    it('should clear bits at word boundaries', () => {
      bs.set(31)
      bs.set(32)
      bs.clear(31)
      expect(bs.get(31)).toBe(false)
      expect(bs.get(32)).toBe(true)
    })

    it('should handle clearing beyond capacity gracefully', () => {
      bs.set(5)
      bs.clear(1000)
      expect(bs.get(5)).toBe(true)
    })
  })

  describe('get', () => {
    it('should return false for unset bits', () => {
      expect(bs.get(0)).toBe(false)
      expect(bs.get(10)).toBe(false)
      expect(bs.get(100)).toBe(false)
    })

    it('should return true for set bits', () => {
      bs.set(3)
      expect(bs.get(3)).toBe(true)
    })

    it('should throw on negative index', () => {
      expect(() => bs.get(-1)).toThrow(RangeError)
    })

    it('should return false for index beyond capacity', () => {
      expect(bs.get(10000)).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty bitset', () => {
      expect(bs.size).toBe(0)
    })

    it('should update when setting bits', () => {
      bs.set(10)
      expect(bs.size).toBe(11)
    })

    it('should not shrink when clearing', () => {
      bs.set(10)
      bs.clear(10)
      expect(bs.size).toBe(11)
    })

    it('should track max set index', () => {
      bs.set(5)
      bs.set(3)
      bs.set(10)
      expect(bs.size).toBe(11)
    })
  })

  describe('build and rank', () => {
    it('should return 0 for rank at index 0', () => {
      bs.set(0)
      bs.build()
      expect(bs.rank(0)).toBe(0)
    })

    it('should return 1 for rank at index 1 with bit 0 set', () => {
      bs.set(0)
      bs.build()
      expect(bs.rank(1)).toBe(1)
    })

    it('should count single set bit correctly', () => {
      bs.set(5)
      bs.build()
      expect(bs.rank(6)).toBe(1)
      expect(bs.rank(5)).toBe(0)
    })

    it('should count multiple set bits', () => {
      bs.set(0)
      bs.set(2)
      bs.set(4)
      bs.build()
      expect(bs.rank(1)).toBe(1)
      expect(bs.rank(3)).toBe(2)
      expect(bs.rank(5)).toBe(3)
    })

    it('should handle all bits set in one word', () => {
      for (let i = 0; i < 32; i++) {
        bs.set(i)
      }
      bs.build()
      expect(bs.rank(32)).toBe(32)
      expect(bs.rank(16)).toBe(16)
      expect(bs.rank(1)).toBe(1)
    })

    it('should handle bits across word boundary', () => {
      bs.set(31)
      bs.set(32)
      bs.build()
      expect(bs.rank(32)).toBe(1)
      expect(bs.rank(33)).toBe(2)
    })

    it('should handle bits across superblock boundary', () => {
      for (let i = 510; i < 515; i++) {
        bs.set(i)
      }
      bs.build()
      expect(bs.rank(511)).toBe(1)
      expect(bs.rank(512)).toBe(2)
      expect(bs.rank(515)).toBe(5)
    })

    it('should handle empty bitset rank', () => {
      bs.build()
      expect(bs.rank(0)).toBe(0)
    })

    it('should handle rank beyond size', () => {
      bs.set(0)
      bs.set(1)
      bs.build()
      expect(bs.rank(100)).toBe(2)
    })

    it('should handle negative index rank', () => {
      bs.set(0)
      bs.build()
      expect(bs.rank(-1)).toBe(0)
    })

    it('rank matches naive counting for pattern 10101010', () => {
      for (let i = 0; i < 8; i++) {
        if (i % 2 === 0) bs.set(i)
      }
      bs.build()
      const str = bs.toString()
      for (let i = 0; i <= 8; i++) {
        expect(bs.rank(i)).toBe(naiveRank(str, i))
      }
    })

    it('rank matches naive for 100 random bits', () => {
      const bits: boolean[] = []
      for (let i = 0; i < 100; i++) {
        const val = Math.random() > 0.5
        bits.push(val)
        if (val) bs.set(i)
      }
      bs.build()
      const str = bits.map(b => b ? '1' : '0').join('')
      for (let i = 0; i <= 100; i++) {
        expect(bs.rank(i)).toBe(naiveRank(str, i))
      }
    })

    it('rank matches naive for 1000 bits with sparse pattern', () => {
      for (let i = 0; i < 1000; i += 7) {
        bs.set(i)
      }
      bs.build()
      const str = bs.toString()
      for (let i = 0; i <= 1000; i += 13) {
        expect(bs.rank(i)).toBe(naiveRank(str, i))
      }
    })

    it('rank matches naive for 10000+ bits', () => {
      for (let i = 0; i < 10000; i++) {
        if (i % 3 === 0 || i % 5 === 0) {
          bs.set(i)
        }
      }
      bs.build()
      const str = bs.toString()
      for (let i = 0; i <= 10000; i += 97) {
        expect(bs.rank(i)).toBe(naiveRank(str, i))
      }
    })

    it('rank at every position for first 200 bits', () => {
      for (let i = 0; i < 200; i++) {
        if (i % 3 === 0) bs.set(i)
      }
      bs.build()
      const str = bs.toString()
      for (let i = 0; i <= 200; i++) {
        expect(bs.rank(i)).toBe(naiveRank(str, i))
      }
    })
  })

  describe('rank1', () => {
    it('should be alias for rank', () => {
      bs.set(0)
      bs.set(5)
      bs.set(10)
      bs.build()
      expect(bs.rank1(11)).toBe(bs.rank(11))
      expect(bs.rank1(6)).toBe(bs.rank(6))
      expect(bs.rank1(1)).toBe(bs.rank(1))
    })

    it('should count set bits correctly', () => {
      bs.set(0)
      bs.set(1)
      bs.set(2)
      bs.build()
      expect(bs.rank1(3)).toBe(3)
      expect(bs.rank1(1)).toBe(1)
    })
  })

  describe('rank0', () => {
    it('should count zeros correctly', () => {
      bs.set(1)
      bs.build()
      expect(bs.rank0(3)).toBe(2)
    })

    it('should return 0 when all bits are set', () => {
      for (let i = 0; i < 10; i++) {
        bs.set(i)
      }
      bs.build()
      expect(bs.rank0(10)).toBe(0)
    })

    it('should return index when no bits are set', () => {
      bs.set(20)
      bs.build()
      expect(bs.rank0(10)).toBe(10)
    })

    it('rank0 + rank1 = index', () => {
      for (let i = 0; i < 100; i++) {
        if (i % 3 === 0) bs.set(i)
      }
      bs.build()
      for (let i = 0; i <= 100; i += 7) {
        expect(bs.rank0(i) + bs.rank1(i)).toBe(i)
      }
    })
  })

  describe('select1', () => {
    it('should return position of first set bit', () => {
      bs.set(5)
      bs.build()
      expect(bs.select1(0)).toBe(5)
    })

    it('should return position of k-th set bit', () => {
      bs.set(2)
      bs.set(5)
      bs.set(10)
      bs.build()
      expect(bs.select1(0)).toBe(2)
      expect(bs.select1(1)).toBe(5)
      expect(bs.select1(2)).toBe(10)
    })

    it('should return -1 for out of range k', () => {
      bs.set(0)
      bs.build()
      expect(bs.select1(1)).toBe(-1)
    })

    it('should return -1 for negative k', () => {
      bs.set(0)
      bs.build()
      expect(bs.select1(-1)).toBe(-1)
    })

    it('should return -1 for empty bitset', () => {
      bs.build()
      expect(bs.select1(0)).toBe(-1)
    })

    it('should match naive select1 for random pattern', () => {
      for (let i = 0; i < 200; i++) {
        if (Math.random() > 0.5) bs.set(i)
      }
      bs.build()
      const str = bs.toString()
      const ones = str.split('').filter(c => c === '1').length
      for (let k = 0; k < ones; k++) {
        expect(bs.select1(k)).toBe(naiveSelect1(str, k))
      }
    })

    it('should find bits across superblock boundary', () => {
      for (let i = 509; i < 515; i++) {
        bs.set(i)
      }
      bs.build()
      for (let k = 0; k < 6; k++) {
        expect(bs.select1(k)).toBe(509 + k)
      }
    })

    it('should handle 10000+ bits select', () => {
      for (let i = 0; i < 10000; i += 5) {
        bs.set(i)
      }
      bs.build()
      const str = bs.toString()
      const ones = str.split('').filter(c => c === '1').length
      for (let k = 0; k < ones; k += 50) {
        expect(bs.select1(k)).toBe(naiveSelect1(str, k))
      }
    })
  })

  describe('select0', () => {
    it('should return position of first zero bit', () => {
      bs.set(0)
      bs.set(1)
      bs.set(2)
      bs.set(4)
      bs.set(5)
      bs.build()
      expect(bs.select0(0)).toBe(3)
    })

    it('should find zeros interleaved with ones', () => {
      bs.set(0)
      bs.set(2)
      bs.set(4)
      bs.build()
      expect(bs.select0(0)).toBe(1)
      expect(bs.select0(1)).toBe(3)
    })

    it('should return -1 for out of range k', () => {
      bs.build()
      expect(bs.select0(0)).toBe(-1)
    })

    it('should return -1 for negative k', () => {
      bs.build()
      expect(bs.select0(-1)).toBe(-1)
    })

    it('should return -1 when all bits are set', () => {
      for (let i = 0; i < 10; i++) {
        bs.set(i)
      }
      bs.build()
      expect(bs.select0(0)).toBe(-1)
    })

    it('should find first zero at position 0', () => {
      bs.set(1)
      bs.set(2)
      bs.build()
      expect(bs.select0(0)).toBe(0)
    })

    it('should match naive select0 for random pattern', () => {
      for (let i = 0; i < 200; i++) {
        if (Math.random() > 0.5) bs.set(i)
      }
      bs.build()
      const str = bs.toString()
      const zeros = str.split('').filter(c => c === '0').length
      for (let k = 0; k < Math.min(zeros, 100); k++) {
        expect(bs.select0(k)).toBe(naiveSelect0(str, k))
      }
    })
  })

  describe('countOnes', () => {
    it('should return 0 for empty bitset', () => {
      expect(bs.countOnes()).toBe(0)
    })

    it('should count single bit', () => {
      bs.set(5)
      expect(bs.countOnes()).toBe(1)
    })

    it('should count multiple bits', () => {
      bs.set(0)
      bs.set(5)
      bs.set(10)
      expect(bs.countOnes()).toBe(3)
    })

    it('should handle all bits set in word', () => {
      for (let i = 0; i < 32; i++) {
        bs.set(i)
      }
      expect(bs.countOnes()).toBe(32)
    })

    it('should handle bits across words', () => {
      for (let i = 0; i < 64; i++) {
        bs.set(i)
      }
      expect(bs.countOnes()).toBe(64)
    })

    it('should not count cleared bits', () => {
      bs.set(0)
      bs.set(1)
      bs.clear(0)
      expect(bs.countOnes()).toBe(1)
    })
  })

  describe('countZeros', () => {
    it('should return size for empty bitset', () => {
      expect(bs.countZeros()).toBe(0)
    })

    it('should count zeros correctly', () => {
      bs.set(0)
      bs.set(1)
      bs.set(2)
      expect(bs.countZeros()).toBe(0)
    })

    it('countOnes + countZeros = size', () => {
      for (let i = 0; i < 50; i++) {
        if (i % 3 === 0) bs.set(i)
      }
      expect(bs.countOnes() + bs.countZeros()).toBe(bs.size)
    })
  })

  describe('setRange', () => {
    it('should set range of bits', () => {
      bs.setRange(3, 7)
      expect(bs.get(2)).toBe(false)
      expect(bs.get(3)).toBe(true)
      expect(bs.get(4)).toBe(true)
      expect(bs.get(5)).toBe(true)
      expect(bs.get(6)).toBe(true)
      expect(bs.get(7)).toBe(false)
    })

    it('should handle empty range', () => {
      bs.setRange(3, 3)
      expect(bs.get(3)).toBe(false)
    })

    it('should throw on negative start', () => {
      expect(() => bs.setRange(-1, 5)).toThrow(RangeError)
    })

    it('should throw when end < start', () => {
      expect(() => bs.setRange(5, 3)).toThrow(RangeError)
    })

    it('should extend size', () => {
      bs.setRange(0, 10)
      expect(bs.size).toBe(10)
    })

    it('should set range across word boundary', () => {
      bs.setRange(30, 34)
      for (let i = 30; i < 34; i++) {
        expect(bs.get(i)).toBe(true)
      }
      expect(bs.get(29)).toBe(false)
      expect(bs.get(34)).toBe(false)
    })

    it('should set large range', () => {
      bs.setRange(0, 1000)
      expect(bs.countOnes()).toBe(1000)
    })
  })

  describe('clearRange', () => {
    it('should clear range of bits', () => {
      bs.setRange(0, 10)
      bs.clearRange(3, 7)
      for (let i = 3; i < 7; i++) {
        expect(bs.get(i)).toBe(false)
      }
      expect(bs.get(2)).toBe(true)
      expect(bs.get(7)).toBe(true)
    })

    it('should handle empty range', () => {
      bs.set(5)
      bs.clearRange(5, 5)
      expect(bs.get(5)).toBe(true)
    })

    it('should throw on negative start', () => {
      expect(() => bs.clearRange(-1, 5)).toThrow(RangeError)
    })

    it('should throw when end < start', () => {
      expect(() => bs.clearRange(5, 3)).toThrow(RangeError)
    })

    it('should clear range across word boundary', () => {
      bs.setRange(0, 100)
      bs.clearRange(30, 34)
      for (let i = 30; i < 34; i++) {
        expect(bs.get(i)).toBe(false)
      }
    })
  })

  describe('toggle', () => {
    it('should toggle bit from 0 to 1', () => {
      const result = bs.toggle(5)
      expect(result).toBe(true)
      expect(bs.get(5)).toBe(true)
    })

    it('should toggle bit from 1 to 0', () => {
      bs.set(5)
      const result = bs.toggle(5)
      expect(result).toBe(false)
      expect(bs.get(5)).toBe(false)
    })

    it('should throw on negative index', () => {
      expect(() => bs.toggle(-1)).toThrow(RangeError)
    })

    it('should toggle multiple times', () => {
      expect(bs.toggle(0)).toBe(true)
      expect(bs.toggle(0)).toBe(false)
      expect(bs.toggle(0)).toBe(true)
    })

    it('should extend size when toggling beyond current size', () => {
      bs.toggle(10)
      expect(bs.size).toBe(11)
    })
  })

  describe('toString', () => {
    it('should return empty string for empty bitset', () => {
      expect(bs.toString()).toBe('')
    })

    it('should return correct string representation', () => {
      bs.set(0)
      bs.set(2)
      bs.set(4)
      expect(bs.toString()).toBe('10101')
    })

    it('should show zeros for unset bits', () => {
      bs.set(0)
      expect(bs.toString()).toBe('1')
    })

    it('should represent all bits set', () => {
      for (let i = 0; i < 8; i++) {
        bs.set(i)
      }
      expect(bs.toString()).toBe('11111111')
    })

    it('should represent alternating pattern', () => {
      for (let i = 0; i < 8; i += 2) {
        bs.set(i)
      }
      expect(bs.toString()).toBe('1010101')
    })
  })

  describe('build must be called before rank', () => {
    it('should not throw if rank called before build on empty bitset', () => {
      expect(() => bs.rank(0)).not.toThrow()
    })

    it('should give correct results after build', () => {
      bs.set(0)
      bs.set(3)
      bs.set(7)
      bs.build()
      expect(bs.rank(8)).toBe(3)
    })
  })

  describe('single bit operations', () => {
    it('should handle setting and getting bit 0', () => {
      bs.set(0)
      expect(bs.get(0)).toBe(true)
      bs.build()
      expect(bs.rank(1)).toBe(1)
    })

    it('should handle single bit at high index', () => {
      bs.set(500)
      bs.build()
      expect(bs.rank(501)).toBe(1)
      expect(bs.rank(500)).toBe(0)
      expect(bs.rank(499)).toBe(0)
    })

    it('should handle single bit at index 1', () => {
      bs.set(1)
      bs.build()
      expect(bs.rank(1)).toBe(0)
      expect(bs.rank(2)).toBe(1)
    })
  })

  describe('many bits (10000+)', () => {
    it('should correctly rank 10000 bits with pattern every 3rd', () => {
      for (let i = 0; i < 10000; i++) {
        if (i % 3 === 0) bs.set(i)
      }
      bs.build()
      const str = bs.toString()
      for (let i = 0; i <= 10000; i += 100) {
        expect(bs.rank(i)).toBe(naiveRank(str, i))
      }
    })

    it('should correctly rank 10000 bits dense pattern', () => {
      for (let i = 0; i < 10000; i++) {
        bs.set(i)
      }
      bs.build()
      expect(bs.rank(10000)).toBe(10000)
      expect(bs.rank(5000)).toBe(5000)
    })

    it('should correctly select from 10000 sparse bits', () => {
      const positions: number[] = []
      for (let i = 0; i < 10000; i += 100) {
        bs.set(i)
        positions.push(i)
      }
      bs.build()
      for (let k = 0; k < positions.length; k++) {
        expect(bs.select1(k)).toBe(positions[k])
      }
    })

    it('should handle 10000 bits with all zeros then build', () => {
      bs.set(0)
      bs.set(9999)
      bs.build()
      expect(bs.rank(10000)).toBe(2)
      expect(bs.select1(0)).toBe(0)
      expect(bs.select1(1)).toBe(9999)
    })
  })

  describe('sequential set then build then rank', () => {
    it('should handle sequential set-build-rank pattern', () => {
      bs.set(0)
      bs.set(1)
      bs.set(2)
      bs.build()
      expect(bs.rank(3)).toBe(3)
      bs.set(3)
      bs.build()
      expect(bs.rank(4)).toBe(4)
    })

    it('should handle clear then rebuild', () => {
      bs.set(0)
      bs.set(1)
      bs.build()
      expect(bs.rank(2)).toBe(2)
      bs.clear(0)
      bs.build()
      expect(bs.rank(2)).toBe(1)
    })

    it('should handle toggle then rebuild', () => {
      bs.set(0)
      bs.build()
      expect(bs.rank(1)).toBe(1)
      bs.toggle(0)
      bs.build()
      expect(bs.rank(1)).toBe(0)
    })

    it('should handle setRange then build', () => {
      bs.setRange(0, 10)
      bs.build()
      expect(bs.rank(10)).toBe(10)
    })

    it('should handle clearRange then rebuild', () => {
      bs.setRange(0, 10)
      bs.build()
      expect(bs.rank(10)).toBe(10)
      bs.clearRange(3, 7)
      bs.build()
      expect(bs.rank(10)).toBe(6)
    })
  })

  describe('verify rank matches manual counting', () => {
    it('should match manual count for pattern 11001100', () => {
      const pattern = [1, 1, 0, 0, 1, 1, 0, 0]
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === 1) bs.set(i)
      }
      bs.build()
      expect(bs.rank(2)).toBe(2)
      expect(bs.rank(4)).toBe(2)
      expect(bs.rank(6)).toBe(4)
      expect(bs.rank(8)).toBe(4)
    })

    it('should match for all ones then all zeros', () => {
      for (let i = 0; i < 50; i++) {
        bs.set(i)
      }
      bs.build()
      for (let i = 0; i <= 100; i++) {
        const expected = Math.min(i, 50)
        expect(bs.rank(i)).toBe(expected)
      }
    })

    it('should match for single bit at various positions', () => {
      const positions = [0, 1, 31, 32, 63, 64, 511, 512, 1000]
      for (const pos of positions) {
        const b = new RankedBitset()
        b.set(pos)
        b.build()
        expect(b.rank(pos)).toBe(0)
        expect(b.rank(pos + 1)).toBe(1)
      }
    })
  })

  describe('select returns -1 for out of range', () => {
    it('select1 returns -1 when k exceeds count', () => {
      bs.set(0)
      bs.build()
      expect(bs.select1(1)).toBe(-1)
      expect(bs.select1(100)).toBe(-1)
    })

    it('select0 returns -1 when k exceeds zero count', () => {
      bs.set(0)
      bs.build()
      expect(bs.select0(bs.size)).toBe(-1)
    })

    it('select1 returns -1 for k = total ones', () => {
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) bs.set(i)
      }
      bs.build()
      expect(bs.select1(5)).toBe(-1)
    })
  })

  describe('edge cases', () => {
    it('should handle exactly 512 bits (one superblock)', () => {
      for (let i = 0; i < 512; i++) {
        bs.set(i)
      }
      bs.build()
      expect(bs.rank(512)).toBe(512)
      expect(bs.rank(256)).toBe(256)
    })

    it('should handle exactly 513 bits (crosses superblock)', () => {
      for (let i = 0; i < 513; i++) {
        bs.set(i)
      }
      bs.build()
      expect(bs.rank(513)).toBe(513)
      expect(bs.rank(512)).toBe(512)
      expect(bs.rank(511)).toBe(511)
    })

    it('should handle exactly 1024 bits (two superblocks)', () => {
      for (let i = 0; i < 1024; i++) {
        bs.set(i)
      }
      bs.build()
      expect(bs.rank(1024)).toBe(1024)
      expect(bs.rank(512)).toBe(512)
    })

    it('should handle 2048 bits with mixed pattern', () => {
      for (let i = 0; i < 2048; i++) {
        if (i % 7 === 0) bs.set(i)
      }
      bs.build()
      const str = bs.toString()
      for (let i = 0; i <= 2048; i += 37) {
        expect(bs.rank(i)).toBe(naiveRank(str, i))
      }
    })

    it('should handle bit at index 0 with rank(0)', () => {
      bs.set(0)
      bs.build()
      expect(bs.rank(0)).toBe(0)
    })

    it('should handle only last bit set in superblock', () => {
      bs.set(511)
      bs.build()
      expect(bs.rank(511)).toBe(0)
      expect(bs.rank(512)).toBe(1)
    })

    it('rank0 at position 0', () => {
      bs.build()
      expect(bs.rank0(0)).toBe(0)
    })

    it('should rebuild after modifications', () => {
      bs.setRange(0, 20)
      bs.build()
      expect(bs.rank(20)).toBe(20)
      bs.clearRange(5, 15)
      bs.build()
      expect(bs.rank(20)).toBe(10)
    })
  })

  describe('integration tests', () => {
    it('full workflow: set, build, rank, select, modify, rebuild', () => {
      bs.setRange(0, 100)
      bs.build()
      expect(bs.rank(100)).toBe(100)
      expect(bs.select1(50)).toBe(50)
      bs.clearRange(0, 50)
      bs.build()
      expect(bs.rank(100)).toBe(50)
      expect(bs.select1(0)).toBe(50)
    })

    it('stress test with alternating pattern', () => {
      for (let i = 0; i < 5000; i++) {
        if (i % 2 === 0) bs.set(i)
      }
      bs.build()
      expect(bs.rank(5000)).toBe(2500)
      expect(bs.select1(0)).toBe(0)
      expect(bs.select1(1)).toBe(2)
      expect(bs.select1(2499)).toBe(4998)
    })

    it('rank and select are inverse operations', () => {
      for (let i = 0; i < 500; i++) {
        if (i % 11 === 0) bs.set(i)
      }
      bs.build()
      const ones = bs.countOnes()
      for (let k = 0; k < ones; k++) {
        const pos = bs.select1(k)
        if (pos >= 0) {
          expect(bs.rank(pos + 1)).toBe(k + 1)
          expect(bs.rank(pos)).toBe(k)
        }
      }
    })

    it('should work with sparse high-index bits', () => {
      bs.set(0)
      bs.set(1000)
      bs.set(2000)
      bs.set(3000)
      bs.build()
      expect(bs.select1(0)).toBe(0)
      expect(bs.select1(1)).toBe(1000)
      expect(bs.select1(2)).toBe(2000)
      expect(bs.select1(3)).toBe(3000)
      expect(bs.rank(1)).toBe(1)
      expect(bs.rank(1001)).toBe(2)
      expect(bs.rank(2001)).toBe(3)
      expect(bs.rank(3001)).toBe(4)
    })
  })
})
