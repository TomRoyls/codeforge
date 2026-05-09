import { describe, it, expect } from 'vitest'
import { SuccinctBitvector } from '../../src/core/succinct-bitvector/succinct-bitvector.js'

function naiveRank1(bits: number[], index: number): number {
  let count = 0
  for (let i = 0; i < index; i++) {
    if (bits[i] === 1) count++
  }
  return count
}

function naiveSelect(bits: number[], k: number, target: number): number {
  let count = 0
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === target) {
      count++
      if (count === k) return i
    }
  }
  return -1
}

describe('SuccinctBitvector', () => {
  describe('constructor', () => {
    it('should create from number array', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0])
      expect(bv.length()).toBe(5)
      expect(bv.toArray()).toEqual([1, 0, 1, 1, 0])
    })

    it('should create from string', () => {
      const bv = new SuccinctBitvector('10110')
      expect(bv.length()).toBe(5)
      expect(bv.toArray()).toEqual([1, 0, 1, 1, 0])
    })

    it('should create from Uint8Array', () => {
      const bv = new SuccinctBitvector(new Uint8Array([1, 0, 1, 1, 0]))
      expect(bv.length()).toBe(5)
      expect(bv.toArray()).toEqual([1, 0, 1, 1, 0])
    })

    it('should create empty bitvector from empty array', () => {
      const bv = new SuccinctBitvector([])
      expect(bv.length()).toBe(0)
      expect(bv.isEmpty()).toBe(true)
    })

    it('should create empty bitvector from empty string', () => {
      const bv = new SuccinctBitvector('')
      expect(bv.length()).toBe(0)
      expect(bv.isEmpty()).toBe(true)
    })

    it('should create empty bitvector from empty Uint8Array', () => {
      const bv = new SuccinctBitvector(new Uint8Array([]))
      expect(bv.length()).toBe(0)
      expect(bv.isEmpty()).toBe(true)
    })

    it('should throw on invalid bit value in array', () => {
      expect(() => new SuccinctBitvector([0, 1, 2])).toThrow()
    })

    it('should throw on invalid bit value in Uint8Array', () => {
      expect(() => new SuccinctBitvector(new Uint8Array([0, 1, 3]))).toThrow()
    })

    it('should throw on invalid character in string', () => {
      expect(() => new SuccinctBitvector('10a01')).toThrow()
    })

    it('should handle single bit 0', () => {
      const bv = new SuccinctBitvector([0])
      expect(bv.length()).toBe(1)
      expect(bv.access(0)).toBe(0)
    })

    it('should handle single bit 1', () => {
      const bv = new SuccinctBitvector([1])
      expect(bv.length()).toBe(1)
      expect(bv.access(0)).toBe(1)
    })
  })

  describe('static fromString', () => {
    it('should create bitvector from binary string', () => {
      const bv = SuccinctBitvector.fromString('1100')
      expect(bv.length()).toBe(4)
      expect(bv.toArray()).toEqual([1, 1, 0, 0])
    })

    it('should create bitvector from empty string', () => {
      const bv = SuccinctBitvector.fromString('')
      expect(bv.isEmpty()).toBe(true)
    })

    it('should throw on non-binary string', () => {
      expect(() => SuccinctBitvector.fromString('12')).toThrow()
    })
  })

  describe('static fromNumber', () => {
    it('should create bitvector from number 5 (101) with length 3', () => {
      const bv = SuccinctBitvector.fromNumber(5, 3)
      expect(bv.toArray()).toEqual([1, 0, 1])
    })

    it('should create bitvector from number 0 with length 4', () => {
      const bv = SuccinctBitvector.fromNumber(0, 4)
      expect(bv.toArray()).toEqual([0, 0, 0, 0])
    })

    it('should create bitvector from number 255 with length 8', () => {
      const bv = SuccinctBitvector.fromNumber(255, 8)
      expect(bv.toArray()).toEqual([1, 1, 1, 1, 1, 1, 1, 1])
    })

    it('should handle zero length', () => {
      const bv = SuccinctBitvector.fromNumber(0, 0)
      expect(bv.isEmpty()).toBe(true)
    })

    it('should throw on negative length', () => {
      expect(() => SuccinctBitvector.fromNumber(0, -1)).toThrow()
    })

    it('should throw on non-integer number', () => {
      expect(() => SuccinctBitvector.fromNumber(1.5, 4)).toThrow()
    })

    it('should handle number larger than bits', () => {
      const bv = SuccinctBitvector.fromNumber(7, 2)
      expect(bv.toArray()).toEqual([1, 1])
    })
  })

  describe('access', () => {
    it('should return correct bit at each index', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0, 0])
      expect(bv.access(0)).toBe(1)
      expect(bv.access(1)).toBe(0)
      expect(bv.access(2)).toBe(1)
      expect(bv.access(3)).toBe(1)
      expect(bv.access(4)).toBe(0)
      expect(bv.access(5)).toBe(0)
    })

    it('should throw on negative index', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      expect(() => bv.access(-1)).toThrow()
    })

    it('should throw on index equal to length', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      expect(() => bv.access(3)).toThrow()
    })

    it('should throw on index beyond length', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      expect(() => bv.access(100)).toThrow()
    })

    it('should work on all-zeros bitvector', () => {
      const bv = new SuccinctBitvector([0, 0, 0, 0])
      expect(bv.access(0)).toBe(0)
      expect(bv.access(3)).toBe(0)
    })

    it('should work on all-ones bitvector', () => {
      const bv = new SuccinctBitvector([1, 1, 1, 1])
      expect(bv.access(0)).toBe(1)
      expect(bv.access(3)).toBe(1)
    })
  })

  describe('rank1', () => {
    it('should return 0 for index 0', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0])
      expect(bv.rank1(0)).toBe(0)
    })

    it('should count 1s correctly for [1,0,1,1,0]', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0])
      expect(bv.rank1(1)).toBe(1)
      expect(bv.rank1(2)).toBe(1)
      expect(bv.rank1(3)).toBe(2)
      expect(bv.rank1(4)).toBe(3)
      expect(bv.rank1(5)).toBe(3)
    })

    it('should return 0 for all-zeros bitvector', () => {
      const bv = new SuccinctBitvector([0, 0, 0, 0, 0])
      expect(bv.rank1(5)).toBe(0)
    })

    it('should return index for all-ones bitvector', () => {
      const bv = new SuccinctBitvector([1, 1, 1, 1])
      expect(bv.rank1(4)).toBe(4)
    })

    it('should handle negative index', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      expect(bv.rank1(-1)).toBe(0)
    })

    it('should handle index beyond length', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      expect(bv.rank1(100)).toBe(2)
    })

    it('should work with alternating pattern', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 0, 1, 0])
      expect(bv.rank1(1)).toBe(1)
      expect(bv.rank1(2)).toBe(1)
      expect(bv.rank1(3)).toBe(2)
      expect(bv.rank1(4)).toBe(2)
      expect(bv.rank1(5)).toBe(3)
      expect(bv.rank1(6)).toBe(3)
    })
  })

  describe('rank0', () => {
    it('should return 0 for index 0', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0])
      expect(bv.rank0(0)).toBe(0)
    })

    it('should count 0s correctly for [1,0,1,1,0]', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0])
      expect(bv.rank0(1)).toBe(0)
      expect(bv.rank0(2)).toBe(1)
      expect(bv.rank0(3)).toBe(1)
      expect(bv.rank0(4)).toBe(1)
      expect(bv.rank0(5)).toBe(2)
    })

    it('should return index for all-zeros bitvector', () => {
      const bv = new SuccinctBitvector([0, 0, 0, 0])
      expect(bv.rank0(4)).toBe(4)
    })

    it('should return 0 for all-ones bitvector', () => {
      const bv = new SuccinctBitvector([1, 1, 1, 1])
      expect(bv.rank0(4)).toBe(0)
    })

    it('should satisfy rank0(i) + rank1(i) = i', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 0, 1, 1, 0, 0])
      for (let i = 0; i <= 8; i++) {
        expect(bv.rank0(i) + bv.rank1(i)).toBe(i)
      }
    })
  })

  describe('select1', () => {
    it('should find positions of 1s in [1,0,1,1,0]', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0])
      expect(bv.select1(1)).toBe(0)
      expect(bv.select1(2)).toBe(2)
      expect(bv.select1(3)).toBe(3)
    })

    it('should return -1 for k=0', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      expect(bv.select1(0)).toBe(-1)
    })

    it('should return -1 when k exceeds count of 1s', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      expect(bv.select1(3)).toBe(-1)
    })

    it('should return -1 for all-zeros bitvector', () => {
      const bv = new SuccinctBitvector([0, 0, 0, 0])
      expect(bv.select1(1)).toBe(-1)
    })

    it('should work for all-ones bitvector', () => {
      const bv = new SuccinctBitvector([1, 1, 1, 1])
      expect(bv.select1(1)).toBe(0)
      expect(bv.select1(2)).toBe(1)
      expect(bv.select1(3)).toBe(2)
      expect(bv.select1(4)).toBe(3)
    })

    it('should work for single bit 1', () => {
      const bv = new SuccinctBitvector([1])
      expect(bv.select1(1)).toBe(0)
    })

    it('should work for single bit 0', () => {
      const bv = new SuccinctBitvector([0])
      expect(bv.select1(1)).toBe(-1)
    })

    it('should handle negative k', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      expect(bv.select1(-1)).toBe(-1)
    })
  })

  describe('select0', () => {
    it('should find positions of 0s in [1,0,1,1,0]', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0])
      expect(bv.select0(1)).toBe(1)
      expect(bv.select0(2)).toBe(4)
    })

    it('should return -1 for k=0', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      expect(bv.select0(0)).toBe(-1)
    })

    it('should return -1 when k exceeds count of 0s', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      expect(bv.select0(2)).toBe(-1)
    })

    it('should return -1 for all-ones bitvector', () => {
      const bv = new SuccinctBitvector([1, 1, 1, 1])
      expect(bv.select0(1)).toBe(-1)
    })

    it('should work for all-zeros bitvector', () => {
      const bv = new SuccinctBitvector([0, 0, 0, 0])
      expect(bv.select0(1)).toBe(0)
      expect(bv.select0(2)).toBe(1)
      expect(bv.select0(3)).toBe(2)
      expect(bv.select0(4)).toBe(3)
    })

    it('should work for single bit 0', () => {
      const bv = new SuccinctBitvector([0])
      expect(bv.select0(1)).toBe(0)
    })

    it('should work for single bit 1', () => {
      const bv = new SuccinctBitvector([1])
      expect(bv.select0(1)).toBe(-1)
    })
  })

  describe('countOnes and countZeros', () => {
    it('should count ones correctly', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0])
      expect(bv.countOnes()).toBe(3)
    })

    it('should count zeros correctly', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0])
      expect(bv.countZeros()).toBe(2)
    })

    it('should return 0 ones for all-zeros', () => {
      const bv = new SuccinctBitvector([0, 0, 0])
      expect(bv.countOnes()).toBe(0)
    })

    it('should return 0 zeros for all-ones', () => {
      const bv = new SuccinctBitvector([1, 1, 1])
      expect(bv.countZeros()).toBe(0)
    })

    it('should satisfy countOnes + countZeros = length', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 0, 0, 1])
      expect(bv.countOnes() + bv.countZeros()).toBe(bv.length())
    })

    it('should handle empty bitvector', () => {
      const bv = new SuccinctBitvector([])
      expect(bv.countOnes()).toBe(0)
      expect(bv.countZeros()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty bitvector', () => {
      const bv = new SuccinctBitvector([])
      expect(bv.isEmpty()).toBe(true)
    })

    it('should return false for non-empty bitvector', () => {
      const bv = new SuccinctBitvector([0])
      expect(bv.isEmpty()).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return copy of bits', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      const arr = bv.toArray()
      expect(arr).toEqual([1, 0, 1])
      arr[0] = 0
      expect(bv.access(0)).toBe(1)
    })

    it('should return empty array for empty bitvector', () => {
      const bv = new SuccinctBitvector([])
      expect(bv.toArray()).toEqual([])
    })
  })

  describe('toString', () => {
    it('should return binary string', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1])
      expect(bv.toString()).toBe('1011')
    })

    it('should return empty string for empty bitvector', () => {
      const bv = new SuccinctBitvector([])
      expect(bv.toString()).toBe('')
    })
  })

  describe('equals', () => {
    it('should return true for identical bitvectors', () => {
      const bv1 = new SuccinctBitvector([1, 0, 1, 1])
      const bv2 = new SuccinctBitvector([1, 0, 1, 1])
      expect(bv1.equals(bv2)).toBe(true)
    })

    it('should return false for different bitvectors', () => {
      const bv1 = new SuccinctBitvector([1, 0, 1])
      const bv2 = new SuccinctBitvector([1, 1, 0])
      expect(bv1.equals(bv2)).toBe(false)
    })

    it('should return false for different lengths', () => {
      const bv1 = new SuccinctBitvector([1, 0])
      const bv2 = new SuccinctBitvector([1, 0, 1])
      expect(bv1.equals(bv2)).toBe(false)
    })

    it('should return true for two empty bitvectors', () => {
      const bv1 = new SuccinctBitvector([])
      const bv2 = new SuccinctBitvector('')
      expect(bv1.equals(bv2)).toBe(true)
    })

    it('should be reflexive', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      expect(bv.equals(bv)).toBe(true)
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1])
      const clone = bv.clone()
      expect(clone.equals(bv)).toBe(true)
      expect(clone).not.toBe(bv)
    })

    it('should preserve all operations on clone', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0])
      const clone = bv.clone()
      expect(clone.access(0)).toBe(1)
      expect(clone.rank1(5)).toBe(3)
      expect(clone.select1(2)).toBe(2)
      expect(clone.countOnes()).toBe(3)
      expect(clone.length()).toBe(5)
    })

    it('should handle empty bitvector', () => {
      const bv = new SuccinctBitvector([])
      const clone = bv.clone()
      expect(clone.isEmpty()).toBe(true)
      expect(clone.equals(bv)).toBe(true)
    })
  })

  describe('slice', () => {
    it('should extract a sub-bitvector', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0])
      const s = bv.slice(1, 4)
      expect(s.toArray()).toEqual([0, 1, 1])
    })

    it('should handle full slice', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      const s = bv.slice(0, 3)
      expect(s.equals(bv)).toBe(true)
    })

    it('should handle single element slice', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      const s = bv.slice(1, 2)
      expect(s.toArray()).toEqual([0])
    })

    it('should handle start at end', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      const s = bv.slice(3, 3)
      expect(s.isEmpty()).toBe(true)
    })

    it('should handle start > end', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      const s = bv.slice(2, 1)
      expect(s.isEmpty()).toBe(true)
    })

    it('should clamp negative start', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      const s = bv.slice(-1, 2)
      expect(s.toArray()).toEqual([1, 0])
    })

    it('should clamp end beyond length', () => {
      const bv = new SuccinctBitvector([1, 0, 1])
      const s = bv.slice(1, 100)
      expect(s.toArray()).toEqual([0, 1])
    })

    it('should produce correct rank/select on sliced bitvector', () => {
      const bv = new SuccinctBitvector([1, 0, 1, 1, 0, 1])
      const s = bv.slice(2, 5)
      expect(s.toArray()).toEqual([1, 1, 0])
      expect(s.rank1(3)).toBe(2)
      expect(s.select1(1)).toBe(0)
    })

    it('should handle empty bitvector', () => {
      const bv = new SuccinctBitvector([])
      const s = bv.slice(0, 0)
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('all-zeros bitvector', () => {
    const bv = new SuccinctBitvector(new Array(100).fill(0))

    it('should have all zeros', () => {
      expect(bv.countOnes()).toBe(0)
      expect(bv.countZeros()).toBe(100)
    })

    it('rank1 should always be 0', () => {
      for (let i = 0; i <= 100; i += 10) {
        expect(bv.rank1(i)).toBe(0)
      }
    })

    it('rank0 should equal index', () => {
      for (let i = 0; i <= 100; i += 10) {
        expect(bv.rank0(i)).toBe(i)
      }
    })

    it('select1 should always return -1', () => {
      expect(bv.select1(1)).toBe(-1)
      expect(bv.select1(10)).toBe(-1)
    })

    it('select0 should return correct positions', () => {
      for (let k = 1; k <= 100; k += 10) {
        expect(bv.select0(k)).toBe(k - 1)
      }
    })
  })

  describe('all-ones bitvector', () => {
    const bv = new SuccinctBitvector(new Array(100).fill(1))

    it('should have all ones', () => {
      expect(bv.countOnes()).toBe(100)
      expect(bv.countZeros()).toBe(0)
    })

    it('rank1 should equal index', () => {
      for (let i = 0; i <= 100; i += 10) {
        expect(bv.rank1(i)).toBe(i)
      }
    })

    it('rank0 should always be 0', () => {
      for (let i = 0; i <= 100; i += 10) {
        expect(bv.rank0(i)).toBe(0)
      }
    })

    it('select0 should always return -1', () => {
      expect(bv.select0(1)).toBe(-1)
    })

    it('select1 should return correct positions', () => {
      for (let k = 1; k <= 100; k += 10) {
        expect(bv.select1(k)).toBe(k - 1)
      }
    })
  })

  describe('alternating pattern', () => {
    const bits = Array.from({ length: 100 }, (_, i) => i % 2)
    const bv = new SuccinctBitvector(bits)

    it('should have equal ones and zeros', () => {
      expect(bv.countOnes()).toBe(50)
      expect(bv.countZeros()).toBe(50)
    })

    it('rank1 should be correct at all positions', () => {
      for (let i = 0; i <= 100; i++) {
        expect(bv.rank1(i)).toBe(naiveRank1(bits, i))
      }
    })

    it('select1 should be correct', () => {
      for (let k = 1; k <= 50; k++) {
        expect(bv.select1(k)).toBe(naiveSelect(bits, k, 1))
      }
    })

    it('select0 should be correct', () => {
      for (let k = 1; k <= 50; k++) {
        expect(bv.select0(k)).toBe(naiveSelect(bits, k, 0))
      }
    })
  })

  describe('random bitvector small', () => {
    const seed = 42
    const bits: number[] = []
    let s = seed
    for (let i = 0; i < 200; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff
      bits.push(s % 2)
    }
    const bv = new SuccinctBitvector(bits)

    it('rank1 should match naive at every position', () => {
      for (let i = 0; i <= bits.length; i++) {
        expect(bv.rank1(i)).toBe(naiveRank1(bits, i))
      }
    })

    it('rank0 should match naive at every position', () => {
      for (let i = 0; i <= bits.length; i++) {
        expect(bv.rank0(i)).toBe(i - naiveRank1(bits, i))
      }
    })

    it('select1 should match naive', () => {
      let count1 = 0
      for (let i = 0; i < bits.length; i++) {
        if (bits[i] === 1) count1++
      }
      for (let k = 1; k <= count1; k++) {
        expect(bv.select1(k)).toBe(naiveSelect(bits, k, 1))
      }
      expect(bv.select1(count1 + 1)).toBe(-1)
    })

    it('select0 should match naive', () => {
      let count0 = 0
      for (let i = 0; i < bits.length; i++) {
        if (bits[i] === 0) count0++
      }
      for (let k = 1; k <= count0; k++) {
        expect(bv.select0(k)).toBe(naiveSelect(bits, k, 0))
      }
      expect(bv.select0(count0 + 1)).toBe(-1)
    })

    it('access should match at every index', () => {
      for (let i = 0; i < bits.length; i++) {
        expect(bv.access(i)).toBe(bits[i])
      }
    })

    it('countOnes should be correct', () => {
      const expected = bits.filter(b => b === 1).length
      expect(bv.countOnes()).toBe(expected)
    })

    it('toString should reproduce original bits', () => {
      expect(bv.toString()).toBe(bits.join(''))
    })
  })

  describe('large bitvector (10000+ bits)', () => {
    const size = 12000
    const bits: number[] = []
    let s = 12345
    for (let i = 0; i < size; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff
      bits.push(s % 2)
    }
    const bv = new SuccinctBitvector(bits)

    it('should have correct length', () => {
      expect(bv.length()).toBe(size)
    })

    it('rank1 should be correct at sampled positions', () => {
      for (let i = 0; i <= size; i += 37) {
        expect(bv.rank1(i)).toBe(naiveRank1(bits, i))
      }
      expect(bv.rank1(size)).toBe(naiveRank1(bits, size))
    })

    it('rank0 should be correct at sampled positions', () => {
      for (let i = 0; i <= size; i += 37) {
        expect(bv.rank0(i)).toBe(i - naiveRank1(bits, i))
      }
    })

    it('select1 should be correct at sampled k values', () => {
      let count1 = 0
      for (let i = 0; i < size; i++) {
        if (bits[i] === 1) count1++
      }
      for (let k = 1; k <= count1; k += 17) {
        expect(bv.select1(k)).toBe(naiveSelect(bits, k, 1))
      }
    })

    it('select0 should be correct at sampled k values', () => {
      let count0 = 0
      for (let i = 0; i < size; i++) {
        if (bits[i] === 0) count0++
      }
      for (let k = 1; k <= count0; k += 17) {
        expect(bv.select0(k)).toBe(naiveSelect(bits, k, 0))
      }
    })

    it('access should work at sampled positions', () => {
      for (let i = 0; i < size; i += 53) {
        expect(bv.access(i)).toBe(bits[i])
      }
    })

    it('clone should produce equal bitvector', () => {
      const clone = bv.clone()
      expect(clone.equals(bv)).toBe(true)
      expect(clone.length()).toBe(size)
    })

    it('slice should produce correct sub-bitvector', () => {
      const s = bv.slice(100, 200)
      expect(s.length()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(s.access(i)).toBe(bits[100 + i])
      }
    })
  })

  describe('edge cases', () => {
    it('should handle bitvector of exactly 64 bits', () => {
      const bits = Array.from({ length: 64 }, (_, i) => i % 2)
      const bv = new SuccinctBitvector(bits)
      expect(bv.rank1(64)).toBe(32)
      expect(bv.select1(32)).toBe(63)
    })

    it('should handle bitvector of exactly 128 bits', () => {
      const bits = Array.from({ length: 128 }, (_, i) => i % 3 === 0 ? 1 : 0)
      const bv = new SuccinctBitvector(bits)
      const expectedOnes = bits.filter(b => b === 1).length
      expect(bv.countOnes()).toBe(expectedOnes)
      expect(bv.rank1(128)).toBe(expectedOnes)
    })

    it('should handle bitvector of 256 bits (4 blocks)', () => {
      const bits = Array.from({ length: 256 }, (_, i) => i < 128 ? 1 : 0)
      const bv = new SuccinctBitvector(bits)
      expect(bv.rank1(128)).toBe(128)
      expect(bv.rank1(256)).toBe(128)
      expect(bv.select1(1)).toBe(0)
      expect(bv.select1(128)).toBe(127)
      expect(bv.select0(1)).toBe(128)
    })

    it('should handle 1 followed by many zeros', () => {
      const bits = [1, ...new Array(200).fill(0)]
      const bv = new SuccinctBitvector(bits)
      expect(bv.select1(1)).toBe(0)
      expect(bv.rank1(1)).toBe(1)
      expect(bv.rank1(201)).toBe(1)
      expect(bv.select0(1)).toBe(1)
      expect(bv.select0(200)).toBe(200)
    })

    it('should handle many zeros followed by 1', () => {
      const bits = [...new Array(200).fill(0), 1]
      const bv = new SuccinctBitvector(bits)
      expect(bv.select1(1)).toBe(200)
      expect(bv.rank1(200)).toBe(0)
      expect(bv.rank1(201)).toBe(1)
      expect(bv.select0(1)).toBe(0)
      expect(bv.select0(200)).toBe(199)
    })

    it('should handle 0 followed by many ones', () => {
      const bits = [0, ...new Array(200).fill(1)]
      const bv = new SuccinctBitvector(bits)
      expect(bv.select1(1)).toBe(1)
      expect(bv.select0(1)).toBe(0)
      expect(bv.rank1(1)).toBe(0)
      expect(bv.rank1(201)).toBe(200)
    })

    it('should handle many ones followed by 0', () => {
      const bits = [...new Array(200).fill(1), 0]
      const bv = new SuccinctBitvector(bits)
      expect(bv.select1(200)).toBe(199)
      expect(bv.select0(1)).toBe(200)
      expect(bv.rank1(200)).toBe(200)
    })
  })

  describe('rank/select consistency', () => {
    it('rank1(select1(k)+1) should equal k for small bitvector', () => {
      const bits = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0]
      const bv = new SuccinctBitvector(bits)
      const totalOnes = bv.countOnes()
      for (let k = 1; k <= totalOnes; k++) {
        const pos = bv.select1(k)
        if (pos >= 0) {
          expect(bv.rank1(pos + 1)).toBe(k)
        }
      }
    })

    it('rank0(select0(k)+1) should equal k for small bitvector', () => {
      const bits = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0]
      const bv = new SuccinctBitvector(bits)
      const totalZeros = bv.countZeros()
      for (let k = 1; k <= totalZeros; k++) {
        const pos = bv.select0(k)
        if (pos >= 0) {
          expect(bv.rank0(pos + 1)).toBe(k)
        }
      }
    })

    it('rank1(select1(k)+1) should equal k for large bitvector', () => {
      const bits: number[] = []
      let s = 99
      for (let i = 0; i < 5000; i++) {
        s = (s * 1103515245 + 12345) & 0x7fffffff
        bits.push(s % 2)
      }
      const bv = new SuccinctBitvector(bits)
      const totalOnes = bv.countOnes()
      for (let k = 1; k <= totalOnes; k += 7) {
        const pos = bv.select1(k)
        if (pos >= 0) {
          expect(bv.rank1(pos + 1)).toBe(k)
        }
      }
    })

    it('rank0(select0(k)+1) should equal k for large bitvector', () => {
      const bits: number[] = []
      let s = 99
      for (let i = 0; i < 5000; i++) {
        s = (s * 1103515245 + 12345) & 0x7fffffff
        bits.push(s % 2)
      }
      const bv = new SuccinctBitvector(bits)
      const totalZeros = bv.countZeros()
      for (let k = 1; k <= totalZeros; k += 7) {
        const pos = bv.select0(k)
        if (pos >= 0) {
          expect(bv.rank0(pos + 1)).toBe(k)
        }
      }
    })
  })
})
