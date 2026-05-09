import { describe, it, expect } from 'vitest'
import { RankSelect } from '../../src/core/rank-select/rank-select.js'

function naiveRank1(bits: number[], index: number): number {
  let count = 0
  for (let i = 0; i < index; i++) {
    if (bits[i] === 1) count++
  }
  return count
}

function naiveRank0(bits: number[], index: number): number {
  let count = 0
  for (let i = 0; i < index; i++) {
    if (bits[i] === 0) count++
  }
  return count
}

function naiveSelect(bits: number[], k: number, target: number): number {
  let count = 0
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === target) {
      if (count === k) return i
      count++
    }
  }
  return -1
}

function naiveNext(bits: number[], index: number, target: number): number {
  for (let i = index; i < bits.length; i++) {
    if (bits[i] === target) return i
  }
  return -1
}

function naivePrev(bits: number[], index: number, target: number): number {
  for (let i = index; i >= 0; i--) {
    if (bits[i] === target) return i
  }
  return -1
}

describe('RankSelect', () => {
  describe('constructor', () => {
    it('should create from string', () => {
      const rs = new RankSelect('10110')
      expect(rs.size()).toBe(5)
    })

    it('should create from number array', () => {
      const rs = new RankSelect([1, 0, 1, 1, 0])
      expect(rs.size()).toBe(5)
    })

    it('should create from Uint32Array', () => {
      const words = new Uint32Array([0b1101])
      const rs = new RankSelect(words, 4)
      expect(rs.size()).toBe(4)
      expect(rs.access(0)).toBe(1)
      expect(rs.access(1)).toBe(0)
      expect(rs.access(2)).toBe(1)
      expect(rs.access(3)).toBe(1)
    })

    it('should create from empty string', () => {
      const rs = new RankSelect('')
      expect(rs.size()).toBe(0)
      expect(rs.count1()).toBe(0)
      expect(rs.count0()).toBe(0)
    })

    it('should create from empty array', () => {
      const rs = new RankSelect([])
      expect(rs.size()).toBe(0)
    })

    it('should throw on invalid character in string', () => {
      expect(() => new RankSelect('10a01')).toThrow()
    })

    it('should throw on invalid bit value in array', () => {
      expect(() => new RankSelect([0, 1, 2])).toThrow()
    })

    it('should handle single bit 0', () => {
      const rs = new RankSelect([0])
      expect(rs.size()).toBe(1)
      expect(rs.access(0)).toBe(0)
    })

    it('should handle single bit 1', () => {
      const rs = new RankSelect([1])
      expect(rs.size()).toBe(1)
      expect(rs.access(0)).toBe(1)
    })

    it('should handle undefined values in array as 0', () => {
      const rs = new RankSelect([1, undefined, 0] as unknown as number[])
      expect(rs.size()).toBe(3)
    })
  })

  describe('static constructors', () => {
    it('fromString creates instance', () => {
      const rs = RankSelect.fromString('110100')
      expect(rs.size()).toBe(6)
      expect(rs.count1()).toBe(3)
    })

    it('fromArray creates instance', () => {
      const rs = RankSelect.fromArray([1, 1, 0, 1, 0, 0])
      expect(rs.size()).toBe(6)
      expect(rs.count1()).toBe(3)
    })

    it('fromString empty', () => {
      const rs = RankSelect.fromString('')
      expect(rs.size()).toBe(0)
    })

    it('fromArray empty', () => {
      const rs = RankSelect.fromArray([])
      expect(rs.size()).toBe(0)
    })
  })

  describe('access', () => {
    it('returns correct bits', () => {
      const rs = new RankSelect('10110')
      expect(rs.access(0)).toBe(1)
      expect(rs.access(1)).toBe(0)
      expect(rs.access(2)).toBe(1)
      expect(rs.access(3)).toBe(1)
      expect(rs.access(4)).toBe(0)
    })

    it('throws on negative index', () => {
      const rs = new RankSelect('101')
      expect(() => rs.access(-1)).toThrow()
    })

    it('throws on out of bounds index', () => {
      const rs = new RankSelect('101')
      expect(() => rs.access(3)).toThrow()
    })

    it('throws on equal to size', () => {
      const rs = new RankSelect('101')
      expect(() => rs.access(3)).toThrow()
    })
  })

  describe('rank1', () => {
    it('returns 0 for index 0', () => {
      const rs = new RankSelect('111')
      expect(rs.rank1(0)).toBe(0)
    })

    it('returns 0 for negative index', () => {
      const rs = new RankSelect('111')
      expect(rs.rank1(-1)).toBe(0)
    })

    it('counts ones correctly on known pattern', () => {
      const rs = new RankSelect('10110')
      expect(rs.rank1(1)).toBe(1)
      expect(rs.rank1(2)).toBe(1)
      expect(rs.rank1(3)).toBe(2)
      expect(rs.rank1(4)).toBe(3)
      expect(rs.rank1(5)).toBe(3)
    })

    it('clamps to size when index > length', () => {
      const rs = new RankSelect('101')
      expect(rs.rank1(100)).toBe(2)
    })

    it('works on all-ones', () => {
      const rs = new RankSelect('1111')
      expect(rs.rank1(4)).toBe(4)
      expect(rs.rank1(2)).toBe(2)
    })

    it('works on all-zeros', () => {
      const rs = new RankSelect('0000')
      expect(rs.rank1(4)).toBe(0)
      expect(rs.rank1(2)).toBe(0)
    })

    it('works on empty bitvector', () => {
      const rs = new RankSelect('')
      expect(rs.rank1(0)).toBe(0)
    })

    it('matches naive on alternating pattern', () => {
      const bits = [1, 0, 1, 0, 1, 0, 1, 0]
      const rs = new RankSelect(bits)
      for (let i = 0; i <= bits.length; i++) {
        expect(rs.rank1(i)).toBe(naiveRank1(bits, i))
      }
    })
  })

  describe('rank0', () => {
    it('returns 0 for index 0', () => {
      const rs = new RankSelect('000')
      expect(rs.rank0(0)).toBe(0)
    })

    it('counts zeros correctly', () => {
      const rs = new RankSelect('10110')
      expect(rs.rank0(1)).toBe(0)
      expect(rs.rank0(2)).toBe(1)
      expect(rs.rank0(3)).toBe(1)
      expect(rs.rank0(4)).toBe(1)
      expect(rs.rank0(5)).toBe(2)
    })

    it('works on all-zeros', () => {
      const rs = new RankSelect('0000')
      expect(rs.rank0(4)).toBe(4)
    })

    it('works on all-ones', () => {
      const rs = new RankSelect('1111')
      expect(rs.rank0(4)).toBe(0)
    })

    it('rank0(i) + rank1(i) === i', () => {
      const rs = new RankSelect('101101001')
      for (let i = 0; i <= rs.size(); i++) {
        expect(rs.rank0(i) + rs.rank1(i)).toBe(i)
      }
    })

    it('matches naive on known pattern', () => {
      const bits = [1, 0, 1, 1, 0, 0, 1, 0]
      const rs = new RankSelect(bits)
      for (let i = 0; i <= bits.length; i++) {
        expect(rs.rank0(i)).toBe(naiveRank0(bits, i))
      }
    })
  })

  describe('select1', () => {
    it('returns -1 for k < 0', () => {
      const rs = new RankSelect('101')
      expect(rs.select1(-1)).toBe(-1)
    })

    it('returns -1 for k >= totalOnes', () => {
      const rs = new RankSelect('101')
      expect(rs.select1(3)).toBe(-1)
    })

    it('returns -1 when no ones', () => {
      const rs = new RankSelect('000')
      expect(rs.select1(0)).toBe(-1)
    })

    it('finds first one (k=0)', () => {
      const rs = new RankSelect('001010')
      expect(rs.select1(0)).toBe(2)
    })

    it('finds positions correctly', () => {
      const bits = [1, 0, 1, 1, 0, 1]
      const rs = new RankSelect(bits)
      expect(rs.select1(0)).toBe(0)
      expect(rs.select1(1)).toBe(2)
      expect(rs.select1(2)).toBe(3)
      expect(rs.select1(3)).toBe(5)
    })

    it('matches naive on known pattern', () => {
      const bits = [1, 0, 1, 0, 1, 1, 0, 0, 1, 0]
      const rs = new RankSelect(bits)
      const total = bits.filter(b => b === 1).length
      for (let k = 0; k < total; k++) {
        expect(rs.select1(k)).toBe(naiveSelect(bits, k, 1))
      }
    })

    it('returns -1 for empty bitvector', () => {
      const rs = new RankSelect('')
      expect(rs.select1(0)).toBe(-1)
    })

    it('works on single 1', () => {
      const rs = new RankSelect([1])
      expect(rs.select1(0)).toBe(0)
    })
  })

  describe('select0', () => {
    it('returns -1 for k < 0', () => {
      const rs = new RankSelect('101')
      expect(rs.select0(-1)).toBe(-1)
    })

    it('returns -1 for k >= totalZeros', () => {
      const rs = new RankSelect('101')
      expect(rs.select0(2)).toBe(-1)
    })

    it('returns -1 when no zeros', () => {
      const rs = new RankSelect('111')
      expect(rs.select0(0)).toBe(-1)
    })

    it('finds first zero (k=0)', () => {
      const rs = new RankSelect('110100')
      expect(rs.select0(0)).toBe(2)
    })

    it('finds positions correctly', () => {
      const bits = [0, 1, 0, 0, 1, 0]
      const rs = new RankSelect(bits)
      expect(rs.select0(0)).toBe(0)
      expect(rs.select0(1)).toBe(2)
      expect(rs.select0(2)).toBe(3)
      expect(rs.select0(3)).toBe(5)
    })

    it('matches naive on known pattern', () => {
      const bits = [1, 0, 1, 0, 1, 1, 0, 0, 1, 0]
      const rs = new RankSelect(bits)
      const total = bits.filter(b => b === 0).length
      for (let k = 0; k < total; k++) {
        expect(rs.select0(k)).toBe(naiveSelect(bits, k, 0))
      }
    })

    it('returns -1 for empty bitvector', () => {
      const rs = new RankSelect('')
      expect(rs.select0(0)).toBe(-1)
    })

    it('works on single 0', () => {
      const rs = new RankSelect([0])
      expect(rs.select0(0)).toBe(0)
    })
  })

  describe('size', () => {
    it('returns correct size', () => {
      expect(new RankSelect('101').size()).toBe(3)
      expect(new RankSelect('').size()).toBe(0)
      expect(new RankSelect('0').size()).toBe(1)
    })
  })

  describe('count1', () => {
    it('counts ones correctly', () => {
      expect(new RankSelect('10110').count1()).toBe(3)
      expect(new RankSelect('000').count1()).toBe(0)
      expect(new RankSelect('111').count1()).toBe(3)
      expect(new RankSelect('').count1()).toBe(0)
    })
  })

  describe('count0', () => {
    it('counts zeros correctly', () => {
      expect(new RankSelect('10110').count0()).toBe(2)
      expect(new RankSelect('000').count0()).toBe(3)
      expect(new RankSelect('111').count0()).toBe(0)
      expect(new RankSelect('').count0()).toBe(0)
    })
  })

  describe('next1', () => {
    it('finds next 1 from given index', () => {
      const rs = new RankSelect('001010')
      expect(rs.next1(0)).toBe(2)
      expect(rs.next1(2)).toBe(2)
      expect(rs.next1(3)).toBe(4)
    })

    it('returns -1 when no next 1', () => {
      const rs = new RankSelect('00100')
      expect(rs.next1(4)).toBe(-1)
    })

    it('returns -1 for all zeros', () => {
      const rs = new RankSelect('000')
      expect(rs.next1(0)).toBe(-1)
    })

    it('handles negative index as 0', () => {
      const rs = new RankSelect('100')
      expect(rs.next1(-5)).toBe(0)
    })

    it('returns -1 for index >= size', () => {
      const rs = new RankSelect('101')
      expect(rs.next1(3)).toBe(-1)
    })

    it('returns -1 for empty bitvector', () => {
      const rs = new RankSelect('')
      expect(rs.next1(0)).toBe(-1)
    })

    it('finds at first position', () => {
      const rs = new RankSelect('100')
      expect(rs.next1(0)).toBe(0)
    })
  })

  describe('prev1', () => {
    it('finds previous 1 from given index', () => {
      const rs = new RankSelect('101010')
      expect(rs.prev1(2)).toBe(2)
      expect(rs.prev1(3)).toBe(2)
      expect(rs.prev1(5)).toBe(4)
    })

    it('returns -1 when no previous 1', () => {
      const rs = new RankSelect('0001')
      expect(rs.prev1(2)).toBe(-1)
    })

    it('returns -1 for all zeros', () => {
      const rs = new RankSelect('000')
      expect(rs.prev1(2)).toBe(-1)
    })

    it('returns -1 for negative index', () => {
      const rs = new RankSelect('101')
      expect(rs.prev1(-1)).toBe(-1)
    })

    it('clamps to last index', () => {
      const rs = new RankSelect('1001')
      expect(rs.prev1(10)).toBe(3)
    })

    it('returns -1 for empty bitvector', () => {
      const rs = new RankSelect('')
      expect(rs.prev1(0)).toBe(-1)
    })

    it('finds at first position', () => {
      const rs = new RankSelect('100')
      expect(rs.prev1(0)).toBe(0)
    })
  })

  describe('next0', () => {
    it('finds next 0 from given index', () => {
      const rs = new RankSelect('110100')
      expect(rs.next0(0)).toBe(2)
      expect(rs.next0(2)).toBe(2)
      expect(rs.next0(3)).toBe(4)
    })

    it('returns -1 when no next 0', () => {
      const rs = new RankSelect('00111')
      expect(rs.next0(2)).toBe(-1)
    })

    it('returns -1 for all ones', () => {
      const rs = new RankSelect('111')
      expect(rs.next0(0)).toBe(-1)
    })

    it('handles negative index as 0', () => {
      const rs = new RankSelect('011')
      expect(rs.next0(-5)).toBe(0)
    })

    it('returns -1 for index >= size', () => {
      const rs = new RankSelect('101')
      expect(rs.next0(3)).toBe(-1)
    })

    it('returns -1 for empty bitvector', () => {
      const rs = new RankSelect('')
      expect(rs.next0(0)).toBe(-1)
    })
  })

  describe('prev0', () => {
    it('finds previous 0 from given index', () => {
      const rs = new RankSelect('010101')
      expect(rs.prev0(1)).toBe(0)
      expect(rs.prev0(2)).toBe(2)
      expect(rs.prev0(5)).toBe(4)
    })

    it('returns -1 when no previous 0', () => {
      const rs = new RankSelect('1110')
      expect(rs.prev0(2)).toBe(-1)
    })

    it('returns -1 for all ones', () => {
      const rs = new RankSelect('111')
      expect(rs.prev0(2)).toBe(-1)
    })

    it('returns -1 for negative index', () => {
      const rs = new RankSelect('010')
      expect(rs.prev0(-1)).toBe(-1)
    })

    it('clamps to last index', () => {
      const rs = new RankSelect('0110')
      expect(rs.prev0(10)).toBe(3)
    })

    it('returns -1 for empty bitvector', () => {
      const rs = new RankSelect('')
      expect(rs.prev0(0)).toBe(-1)
    })
  })

  describe('toString', () => {
    it('returns binary string', () => {
      expect(new RankSelect('10110').toString()).toBe('10110')
    })

    it('returns empty string for empty', () => {
      expect(new RankSelect('').toString()).toBe('')
    })

    it('returns single char for single bit', () => {
      expect(new RankSelect('1').toString()).toBe('1')
      expect(new RankSelect('0').toString()).toBe('0')
    })
  })

  describe('toArray', () => {
    it('returns number array', () => {
      expect(new RankSelect('10110').toArray()).toEqual([1, 0, 1, 1, 0])
    })

    it('returns empty array for empty', () => {
      expect(new RankSelect('').toArray()).toEqual([])
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const rs = new RankSelect('10110')
      const cl = rs.clone()
      expect(cl.toArray()).toEqual(rs.toArray())
      expect(cl.size()).toBe(rs.size())
    })

    it('clone is equal after creation', () => {
      const rs = new RankSelect('1100101')
      const cl = rs.clone()
      expect(cl.toString()).toBe(rs.toString())
      expect(cl.count1()).toBe(rs.count1())
      expect(cl.count0()).toBe(rs.count0())
    })
  })

  describe('roundtrip', () => {
    it('toString -> fromString roundtrip', () => {
      const original = '101101001'
      const rs = RankSelect.fromString(original)
      expect(rs.toString()).toBe(original)
    })

    it('toArray -> fromArray roundtrip', () => {
      const original = [1, 0, 1, 1, 0, 1, 0, 0, 1]
      const rs = RankSelect.fromArray(original)
      expect(rs.toArray()).toEqual(original)
    })

    it('clone -> toArray roundtrip', () => {
      const rs = new RankSelect('1100101')
      const cl = rs.clone()
      expect(cl.toArray()).toEqual(rs.toArray())
    })
  })

  describe('all-ones bitvector', () => {
    it('rank1 works', () => {
      const rs = new RankSelect('11111')
      expect(rs.rank1(0)).toBe(0)
      expect(rs.rank1(3)).toBe(3)
      expect(rs.rank1(5)).toBe(5)
    })

    it('rank0 works', () => {
      const rs = new RankSelect('11111')
      expect(rs.rank0(5)).toBe(0)
    })

    it('select1 works', () => {
      const rs = new RankSelect('11111')
      expect(rs.select1(0)).toBe(0)
      expect(rs.select1(4)).toBe(4)
    })

    it('select0 returns -1', () => {
      const rs = new RankSelect('11111')
      expect(rs.select0(0)).toBe(-1)
    })

    it('next1 works', () => {
      const rs = new RankSelect('11111')
      expect(rs.next1(0)).toBe(0)
      expect(rs.next1(4)).toBe(4)
    })

    it('prev1 works', () => {
      const rs = new RankSelect('11111')
      expect(rs.prev1(4)).toBe(4)
      expect(rs.prev1(0)).toBe(0)
    })

    it('next0 returns -1', () => {
      const rs = new RankSelect('11111')
      expect(rs.next0(0)).toBe(-1)
    })

    it('prev0 returns -1', () => {
      const rs = new RankSelect('11111')
      expect(rs.prev0(4)).toBe(-1)
    })

    it('count1 returns size', () => {
      const rs = new RankSelect('11111')
      expect(rs.count1()).toBe(5)
      expect(rs.count0()).toBe(0)
    })
  })

  describe('all-zeros bitvector', () => {
    it('rank0 works', () => {
      const rs = new RankSelect('00000')
      expect(rs.rank0(0)).toBe(0)
      expect(rs.rank0(3)).toBe(3)
      expect(rs.rank0(5)).toBe(5)
    })

    it('rank1 works', () => {
      const rs = new RankSelect('00000')
      expect(rs.rank1(5)).toBe(0)
    })

    it('select0 works', () => {
      const rs = new RankSelect('00000')
      expect(rs.select0(0)).toBe(0)
      expect(rs.select0(4)).toBe(4)
    })

    it('select1 returns -1', () => {
      const rs = new RankSelect('00000')
      expect(rs.select1(0)).toBe(-1)
    })

    it('next0 works', () => {
      const rs = new RankSelect('00000')
      expect(rs.next0(0)).toBe(0)
      expect(rs.next0(4)).toBe(4)
    })

    it('prev0 works', () => {
      const rs = new RankSelect('00000')
      expect(rs.prev0(4)).toBe(4)
      expect(rs.prev0(0)).toBe(0)
    })

    it('next1 returns -1', () => {
      const rs = new RankSelect('00000')
      expect(rs.next1(0)).toBe(-1)
    })

    it('prev1 returns -1', () => {
      const rs = new RankSelect('00000')
      expect(rs.prev1(4)).toBe(-1)
    })

    it('count0 returns size', () => {
      const rs = new RankSelect('00000')
      expect(rs.count0()).toBe(5)
      expect(rs.count1()).toBe(0)
    })
  })

  describe('alternating pattern', () => {
    const bits = '1010101010101010'
    const rs = new RankSelect(bits)

    it('has correct counts', () => {
      expect(rs.count1()).toBe(8)
      expect(rs.count0()).toBe(8)
    })

    it('rank1 is correct at every position', () => {
      for (let i = 0; i <= bits.length; i++) {
        expect(rs.rank1(i)).toBe(Math.ceil(i / 2))
      }
    })

    it('rank0 is correct at every position', () => {
      for (let i = 0; i <= bits.length; i++) {
        expect(rs.rank0(i)).toBe(Math.floor(i / 2))
      }
    })

    it('select1 is correct', () => {
      for (let k = 0; k < 8; k++) {
        expect(rs.select1(k)).toBe(k * 2)
      }
    })

    it('select0 is correct', () => {
      for (let k = 0; k < 8; k++) {
        expect(rs.select0(k)).toBe(k * 2 + 1)
      }
    })

    it('next1 from each position', () => {
      expect(rs.next1(0)).toBe(0)
      expect(rs.next1(1)).toBe(2)
      expect(rs.next1(7)).toBe(8)
      expect(rs.next1(15)).toBe(-1)
    })

    it('prev1 from each position', () => {
      expect(rs.prev1(0)).toBe(0)
      expect(rs.prev1(1)).toBe(0)
      expect(rs.prev1(2)).toBe(2)
      expect(rs.prev1(15)).toBe(14)
    })
  })

  describe('boundary conditions', () => {
    it('first bit is 1', () => {
      const rs = new RankSelect('10000')
      expect(rs.access(0)).toBe(1)
      expect(rs.rank1(1)).toBe(1)
      expect(rs.select1(0)).toBe(0)
    })

    it('first bit is 0', () => {
      const rs = new RankSelect('01111')
      expect(rs.access(0)).toBe(0)
      expect(rs.rank0(1)).toBe(1)
      expect(rs.select0(0)).toBe(0)
    })

    it('last bit is 1', () => {
      const rs = new RankSelect('00001')
      expect(rs.access(4)).toBe(1)
      expect(rs.rank1(5)).toBe(1)
      expect(rs.select1(0)).toBe(4)
    })

    it('last bit is 0', () => {
      const rs = new RankSelect('11110')
      expect(rs.access(4)).toBe(0)
      expect(rs.rank0(5)).toBe(1)
      expect(rs.select0(0)).toBe(4)
    })

    it('single 1 at position 0', () => {
      const rs = new RankSelect([1])
      expect(rs.rank1(0)).toBe(0)
      expect(rs.rank1(1)).toBe(1)
      expect(rs.select1(0)).toBe(0)
      expect(rs.next1(0)).toBe(0)
      expect(rs.prev1(0)).toBe(0)
    })

    it('single 0 at position 0', () => {
      const rs = new RankSelect([0])
      expect(rs.rank0(0)).toBe(0)
      expect(rs.rank0(1)).toBe(1)
      expect(rs.select0(0)).toBe(0)
      expect(rs.next0(0)).toBe(0)
      expect(rs.prev0(0)).toBe(0)
    })
  })

  describe('large random bitvectors', () => {
    it('rank1/rank0 match naive for 1000 bits', () => {
      const bits: number[] = []
      for (let i = 0; i < 1000; i++) {
        bits.push(Math.random() < 0.5 ? 1 : 0)
      }
      const rs = new RankSelect(bits)
      for (let i = 0; i <= bits.length; i++) {
        expect(rs.rank1(i)).toBe(naiveRank1(bits, i))
        expect(rs.rank0(i)).toBe(naiveRank0(bits, i))
      }
    })

    it('select1/select0 match naive for 1000 bits', () => {
      const bits: number[] = []
      for (let i = 0; i < 1000; i++) {
        bits.push(Math.random() < 0.5 ? 1 : 0)
      }
      const rs = new RankSelect(bits)
      const ones = bits.filter(b => b === 1).length
      const zeros = bits.filter(b => b === 0).length
      for (let k = 0; k < ones; k++) {
        expect(rs.select1(k)).toBe(naiveSelect(bits, k, 1))
      }
      for (let k = 0; k < zeros; k++) {
        expect(rs.select0(k)).toBe(naiveSelect(bits, k, 0))
      }
    })

    it('next1/prev1/next0/prev0 match naive for 1000 bits', () => {
      const bits: number[] = []
      for (let i = 0; i < 1000; i++) {
        bits.push(Math.random() < 0.5 ? 1 : 0)
      }
      const rs = new RankSelect(bits)
      for (let i = 0; i < bits.length; i++) {
        expect(rs.next1(i)).toBe(naiveNext(bits, i, 1))
        expect(rs.next0(i)).toBe(naiveNext(bits, i, 0))
      }
      for (let i = 0; i < bits.length; i++) {
        expect(rs.prev1(i)).toBe(naivePrev(bits, i, 1))
        expect(rs.prev0(i)).toBe(naivePrev(bits, i, 0))
      }
    })

    it('performance is reasonable for 10000 bits', () => {
      const bits: number[] = []
      for (let i = 0; i < 10000; i++) {
        bits.push(Math.random() < 0.5 ? 1 : 0)
      }
      const start = performance.now()
      const rs = new RankSelect(bits)
      for (let i = 0; i <= 10000; i += 100) {
        rs.rank1(i)
        rs.rank0(i)
      }
      const ones = rs.count1()
      const zeros = rs.count0()
      for (let k = 0; k < Math.min(ones, 100); k++) {
        rs.select1(k)
      }
      for (let k = 0; k < Math.min(zeros, 100); k++) {
        rs.select0(k)
      }
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(1000)
    })

    it('rank1 correct for 5000 bits sampled', () => {
      const bits: number[] = []
      for (let i = 0; i < 5000; i++) {
        bits.push(Math.random() < 0.3 ? 1 : 0)
      }
      const rs = new RankSelect(bits)
      for (let i = 0; i <= 5000; i += 7) {
        expect(rs.rank1(i)).toBe(naiveRank1(bits, i))
      }
    })

    it('dense bitvector (80% ones) selects correctly', () => {
      const bits: number[] = []
      for (let i = 0; i < 1000; i++) {
        bits.push(Math.random() < 0.8 ? 1 : 0)
      }
      const rs = new RankSelect(bits)
      const zeros = bits.filter(b => b === 0).length
      for (let k = 0; k < zeros; k++) {
        expect(rs.select0(k)).toBe(naiveSelect(bits, k, 0))
      }
    })

    it('sparse bitvector (10% ones) selects correctly', () => {
      const bits: number[] = []
      for (let i = 0; i < 1000; i++) {
        bits.push(Math.random() < 0.1 ? 1 : 0)
      }
      const rs = new RankSelect(bits)
      const ones = bits.filter(b => b === 1).length
      for (let k = 0; k < ones; k++) {
        expect(rs.select1(k)).toBe(naiveSelect(bits, k, 1))
      }
    })
  })

  describe('cross-validation', () => {
    it('select1(rank1(pos)) <= pos for all 1-bits', () => {
      const bits = '101101001110'
      const rs = new RankSelect(bits)
      for (let i = 0; i < bits.length; i++) {
        if (rs.access(i) === 1) {
          const r = rs.rank1(i + 1)
          expect(rs.select1(r - 1)).toBe(i)
        }
      }
    })

    it('select0(rank0(pos)) <= pos for all 0-bits', () => {
      const bits = '101101001110'
      const rs = new RankSelect(bits)
      for (let i = 0; i < bits.length; i++) {
        if (rs.access(i) === 0) {
          const r = rs.rank0(i + 1)
          expect(rs.select0(r - 1)).toBe(i)
        }
      }
    })

    it('rank1(select1(k)+1) === k+1', () => {
      const bits = '101101001110'
      const rs = new RankSelect(bits)
      const ones = rs.count1()
      for (let k = 0; k < ones; k++) {
        const pos = rs.select1(k)
        expect(pos).toBeGreaterThanOrEqual(0)
        expect(rs.rank1(pos! + 1)).toBe(k + 1)
      }
    })

    it('rank0(select0(k)+1) === k+1', () => {
      const bits = '101101001110'
      const rs = new RankSelect(bits)
      const zeros = rs.count0()
      for (let k = 0; k < zeros; k++) {
        const pos = rs.select0(k)
        expect(pos).toBeGreaterThanOrEqual(0)
        expect(rs.rank0(pos! + 1)).toBe(k + 1)
      }
    })
  })

  describe('Uint32Array input', () => {
    it('creates from Uint32Array with length', () => {
      const words = new Uint32Array([0b1101, 0b101])
      const rs = new RankSelect(words, 40)
      expect(rs.size()).toBe(40)
      expect(rs.access(0)).toBe(1)
      expect(rs.access(1)).toBe(0)
      expect(rs.access(2)).toBe(1)
      expect(rs.access(3)).toBe(1)
      expect(rs.access(32)).toBe(1)
      expect(rs.access(33)).toBe(0)
      expect(rs.access(34)).toBe(1)
    })

    it('rank1 works across word boundary', () => {
      const words = new Uint32Array([0xffffffff, 0x0])
      const rs = new RankSelect(words, 64)
      expect(rs.rank1(32)).toBe(32)
      expect(rs.rank1(64)).toBe(32)
      expect(rs.rank1(33)).toBe(32)
    })

    it('select1 works across word boundary', () => {
      const words = new Uint32Array([0xffffffff, 0b1])
      const rs = new RankSelect(words, 64)
      expect(rs.select1(0)).toBe(0)
      expect(rs.select1(31)).toBe(31)
      expect(rs.select1(32)).toBe(32)
      expect(rs.select1(33)).toBe(-1)
    })
  })

  describe('select consistency with rank for large data', () => {
    it('every select1(k) maps back via rank1', () => {
      const bits: number[] = []
      for (let i = 0; i < 2000; i++) {
        bits.push(Math.random() < 0.4 ? 1 : 0)
      }
      const rs = new RankSelect(bits)
      const ones = rs.count1()
      for (let k = 0; k < ones; k++) {
        const pos = rs.select1(k)
        expect(pos).toBeGreaterThanOrEqual(0)
        expect(rs.rank1(pos! + 1)).toBe(k + 1)
        expect(rs.rank1(pos!)).toBe(k)
      }
    })

    it('every select0(k) maps back via rank0', () => {
      const bits: number[] = []
      for (let i = 0; i < 2000; i++) {
        bits.push(Math.random() < 0.4 ? 1 : 0)
      }
      const rs = new RankSelect(bits)
      const zeros = rs.count0()
      for (let k = 0; k < zeros; k++) {
        const pos = rs.select0(k)
        expect(pos).toBeGreaterThanOrEqual(0)
        expect(rs.rank0(pos! + 1)).toBe(k + 1)
        expect(rs.rank0(pos!)).toBe(k)
      }
    })
  })
})
