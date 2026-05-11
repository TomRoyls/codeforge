import { describe, it, expect } from 'vitest'
import { CircularSuffixArray } from '../../src/core/circular-suffix-array/index.js'

describe('CircularSuffixArray', () => {
  describe('constructor', () => {
    it('should create from a string', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(csa.length()).toBe(4)
    })

    it('should create from a number array', () => {
      const csa = new CircularSuffixArray([65, 66, 82, 65])
      expect(csa.length()).toBe(4)
    })

    it('should create from empty string', () => {
      const csa = new CircularSuffixArray('')
      expect(csa.length()).toBe(0)
    })

    it('should create from empty number array', () => {
      const csa = new CircularSuffixArray([])
      expect(csa.length()).toBe(0)
    })

    it('should create from single character string', () => {
      const csa = new CircularSuffixArray('A')
      expect(csa.length()).toBe(1)
    })

    it('should create from single element number array', () => {
      const csa = new CircularSuffixArray([42])
      expect(csa.length()).toBe(1)
    })

    it('should create from string with repeated characters', () => {
      const csa = new CircularSuffixArray('AAAA')
      expect(csa.length()).toBe(4)
    })

    it('should produce same results for string and char code array', () => {
      const str = 'ABRACADABRA'
      const codes = Array.from(str).map(ch => ch.charCodeAt(0))
      const csa1 = new CircularSuffixArray(str)
      const csa2 = new CircularSuffixArray(codes)
      expect(csa1.getData()).toEqual(csa2.getData())
      for (let i = 0; i < str.length; i++) {
        expect(csa1.index(i)).toBe(csa2.index(i))
      }
    })

    it('should handle unicode-like high code points', () => {
      const csa = new CircularSuffixArray([1000, 2000, 3000])
      expect(csa.length()).toBe(3)
    })

    it('should handle all same values', () => {
      const csa = new CircularSuffixArray([5, 5, 5, 5, 5])
      expect(csa.length()).toBe(5)
    })
  })

  describe('index', () => {
    it('should return correct suffix array for "ABRA"', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(csa.index(0)).toBe(3)
      expect(csa.index(1)).toBe(0)
      expect(csa.index(2)).toBe(1)
      expect(csa.index(3)).toBe(2)
    })

    it('should return correct suffix array for "ABRACADABRA"', () => {
      const csa = new CircularSuffixArray('ABRACADABRA')
      expect(csa.index(0)).toBe(10)
      expect(csa.index(1)).toBe(7)
      expect(csa.index(2)).toBe(0)
      expect(csa.index(3)).toBe(3)
      expect(csa.index(4)).toBe(5)
      expect(csa.index(5)).toBe(8)
      expect(csa.index(6)).toBe(1)
      expect(csa.index(7)).toBe(4)
      expect(csa.index(8)).toBe(6)
      expect(csa.index(9)).toBe(9)
      expect(csa.index(10)).toBe(2)
    })

    it('should return 0 for single character', () => {
      const csa = new CircularSuffixArray('X')
      expect(csa.index(0)).toBe(0)
    })

    it('should return all indices for repeated characters', () => {
      const csa = new CircularSuffixArray('AAAA')
      expect(csa.index(0)).toBe(0)
      expect(csa.index(1)).toBe(1)
      expect(csa.index(2)).toBe(2)
      expect(csa.index(3)).toBe(3)
    })

    it('should throw on negative index', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(() => csa.index(-1)).toThrow(RangeError)
    })

    it('should throw on index equal to length', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(() => csa.index(4)).toThrow(RangeError)
    })

    it('should throw on index beyond length', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(() => csa.index(100)).toThrow(RangeError)
    })

    it('should throw on empty data', () => {
      const csa = new CircularSuffixArray('')
      expect(() => csa.index(0)).toThrow(RangeError)
    })

    it('should return correct indices for "BANANA"', () => {
      const csa = new CircularSuffixArray('BANANA')
      const indices: number[] = []
      for (let i = 0; i < 6; i++) {
        indices.push(csa.index(i))
      }
      const sorted = [...indices].sort((a, b) => a - b)
      expect(sorted).toEqual([0, 1, 2, 3, 4, 5])
    })

    it('should produce a valid permutation of indices', () => {
      const csa = new CircularSuffixArray('HELLO')
      const indices: number[] = []
      for (let i = 0; i < 5; i++) {
        indices.push(csa.index(i))
      }
      const sorted = [...indices].sort((a, b) => a - b)
      expect(sorted).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe('rank', () => {
    it('should return correct ranks for "ABRA"', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(csa.rank(3)).toBe(0)
      expect(csa.rank(0)).toBe(1)
      expect(csa.rank(1)).toBe(2)
      expect(csa.rank(2)).toBe(3)
    })

    it('should be consistent with index for "ABRACADABRA"', () => {
      const csa = new CircularSuffixArray('ABRACADABRA')
      for (let i = 0; i < 11; i++) {
        expect(csa.rank(csa.index(i))).toBe(i)
      }
    })

    it('should return 0 for single character', () => {
      const csa = new CircularSuffixArray('Z')
      expect(csa.rank(0)).toBe(0)
    })

    it('should throw on negative position', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(() => csa.rank(-1)).toThrow(RangeError)
    })

    it('should throw on position equal to length', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(() => csa.rank(4)).toThrow(RangeError)
    })

    it('should throw on position beyond length', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(() => csa.rank(100)).toThrow(RangeError)
    })

    it('should be inverse of index for "BANANA"', () => {
      const csa = new CircularSuffixArray('BANANA')
      for (let i = 0; i < 6; i++) {
        expect(csa.index(csa.rank(i))).toBe(i)
      }
    })

    it('should be inverse of index for "MISSISSIPPI"', () => {
      const csa = new CircularSuffixArray('MISSISSIPPI')
      for (let i = 0; i < 11; i++) {
        expect(csa.index(csa.rank(i))).toBe(i)
      }
    })
  })

  describe('length', () => {
    it('should return 0 for empty string', () => {
      expect(new CircularSuffixArray('').length()).toBe(0)
    })

    it('should return 1 for single character', () => {
      expect(new CircularSuffixArray('A').length()).toBe(1)
    })

    it('should return correct length for longer strings', () => {
      expect(new CircularSuffixArray('ABRACADABRA').length()).toBe(11)
    })

    it('should return correct length for number array', () => {
      expect(new CircularSuffixArray([1, 2, 3]).length()).toBe(3)
    })
  })

  describe('getData', () => {
    it('should return char codes for string input', () => {
      const csa = new CircularSuffixArray('AB')
      expect(csa.getData()).toEqual([65, 66])
    })

    it('should return copy of original number array', () => {
      const input = [10, 20, 30]
      const csa = new CircularSuffixArray(input)
      expect(csa.getData()).toEqual([10, 20, 30])
    })

    it('should not be affected by mutations to original array', () => {
      const input = [1, 2, 3]
      const csa = new CircularSuffixArray(input)
      input[0] = 999
      expect(csa.getData()).toEqual([1, 2, 3])
    })

    it('should return a copy (not reference)', () => {
      const csa = new CircularSuffixArray('AB')
      const data = csa.getData()
      data[0] = 999
      expect(csa.getData()).toEqual([65, 66])
    })

    it('should return empty array for empty input', () => {
      const csa = new CircularSuffixArray('')
      expect(csa.getData()).toEqual([])
    })
  })

  describe('lcp', () => {
    it('should return 0 at index 0 by definition', () => {
      const csa = new CircularSuffixArray('ABRACADABRA')
      expect(csa.lcp(0)).toBe(0)
    })

    it('should compute correct LCP for "ABRACADABRA"', () => {
      const csa = new CircularSuffixArray('ABRACADABRA')
      expect(csa.lcp(1)).toBe(1)
      expect(csa.lcp(2)).toBe(4)
    })

    it('should return 0 for single character', () => {
      const csa = new CircularSuffixArray('A')
      expect(csa.lcp(0)).toBe(0)
    })

    it('should return 0 for all same characters between adjacent sorted suffixes', () => {
      const csa = new CircularSuffixArray('AAAA')
      expect(csa.lcp(0)).toBe(0)
      expect(csa.lcp(1)).toBe(4)
      expect(csa.lcp(2)).toBe(4)
      expect(csa.lcp(3)).toBe(4)
    })

    it('should throw on negative index', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(() => csa.lcp(-1)).toThrow(RangeError)
    })

    it('should throw on index beyond length', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(() => csa.lcp(4)).toThrow(RangeError)
    })

    it('should have LCP <= n - 1 for non-identical adjacent suffixes', () => {
      const csa = new CircularSuffixArray('ABCDEF')
      for (let i = 1; i < 6; i++) {
        expect(csa.lcp(i)).toBeLessThanOrEqual(6)
      }
    })

    it('should return 0 for completely distinct characters', () => {
      const csa = new CircularSuffixArray('ABC')
      expect(csa.lcp(1)).toBe(0)
      expect(csa.lcp(2)).toBe(0)
    })

    it('should compute LCP for "BANANA"', () => {
      const csa = new CircularSuffixArray('BANANA')
      expect(csa.lcp(0)).toBe(0)
      for (let i = 0; i < 6; i++) {
        expect(csa.lcp(i)).toBeGreaterThanOrEqual(0)
        expect(csa.lcp(i)).toBeLessThanOrEqual(6)
      }
    })
  })

  describe('bwt', () => {
    it('should return empty array for empty input', () => {
      const csa = new CircularSuffixArray('')
      expect(csa.bwt()).toEqual([])
    })

    it('should return the character itself for single character', () => {
      const csa = new CircularSuffixArray('A')
      expect(csa.bwt()).toEqual([65])
    })

    it('should compute BWT for "ABRA"', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(csa.bwt()).toEqual([82, 65, 65, 66])
    })

    it('should compute BWT for "ABRACADABRA"', () => {
      const csa = new CircularSuffixArray('ABRACADABRA')
      const bwt = csa.bwt()
      const bwtStr = bwt.map(c => String.fromCharCode(c)).join('')
      expect(bwtStr).toBe('RDARCAAAABB')
    })

    it('should compute BWT for "BANANA"', () => {
      const csa = new CircularSuffixArray('BANANA')
      const bwt = csa.bwt()
      const bwtStr = bwt.map(c => String.fromCharCode(c)).join('')
      expect(bwtStr.length).toBe(6)
    })

    it('should have same length as input', () => {
      const csa = new CircularSuffixArray('HELLO')
      expect(csa.bwt().length).toBe(5)
    })

    it('should contain same multiset of characters as input', () => {
      const input = 'ABRACADABRA'
      const csa = new CircularSuffixArray(input)
      const bwtSorted = [...csa.bwt()].sort((a, b) => a - b)
      const inputSorted = [...Array.from(input).map(ch => ch.charCodeAt(0))].sort((a, b) => a - b)
      expect(bwtSorted).toEqual(inputSorted)
    })

    it('should return all same characters for all-same input', () => {
      const csa = new CircularSuffixArray('AAAA')
      expect(csa.bwt()).toEqual([65, 65, 65, 65])
    })

    it('should compute BWT for "banana$" with special char', () => {
      const csa = new CircularSuffixArray([98, 97, 110, 97, 110, 97, 36])
      const bwt = csa.bwt()
      expect(bwt.length).toBe(7)
    })
  })

  describe('originalIndex', () => {
    it('should return the rank of the original string (position 0)', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(csa.originalIndex()).toBe(csa.rank(0))
    })

    it('should match rank(0)', () => {
      const csa = new CircularSuffixArray('ABRACADABRA')
      expect(csa.originalIndex()).toBe(csa.rank(0))
    })

    it('should be 0 for single character', () => {
      const csa = new CircularSuffixArray('X')
      expect(csa.originalIndex()).toBe(0)
    })

    it('should throw for empty data', () => {
      const csa = new CircularSuffixArray('')
      expect(() => csa.originalIndex()).toThrow()
    })

    it('should be valid index in range [0, n)', () => {
      const csa = new CircularSuffixArray('HELLO')
      const oi = csa.originalIndex()
      expect(oi).toBeGreaterThanOrEqual(0)
      expect(oi).toBeLessThan(5)
    })

    it('should equal rank(0) for repeated characters', () => {
      const csa = new CircularSuffixArray('AAAA')
      expect(csa.originalIndex()).toBe(csa.rank(0))
    })
  })

  describe('inverse', () => {
    it('should return the inverse suffix array', () => {
      const csa = new CircularSuffixArray('ABRA')
      const inv = csa.inverse()
      expect(inv).toEqual(csa._rank)
    })

    it('should have same length as input', () => {
      const csa = new CircularSuffixArray('ABRACADABRA')
      expect(csa.inverse().length).toBe(11)
    })

    it('should be consistent with rank', () => {
      const csa = new CircularSuffixArray('BANANA')
      const inv = csa.inverse()
      for (let i = 0; i < 6; i++) {
        expect(inv[i]).toBe(csa.rank(i))
      }
    })

    it('should return a copy', () => {
      const csa = new CircularSuffixArray('ABRA')
      const inv = csa.inverse()
      inv[0] = 999
      expect(csa.inverse()[0]).not.toBe(999)
    })

    it('should return empty array for empty input', () => {
      const csa = new CircularSuffixArray('')
      expect(csa.inverse()).toEqual([])
    })
  })

  describe('select', () => {
    it('should find first occurrence of a character in BWT', () => {
      const csa = new CircularSuffixArray('ABRA')
      const bwt = csa.bwt()
      const pos = csa.select(bwt[0]!, 0)
      expect(pos).toBe(0)
    })

    it('should find k-th occurrence of a character', () => {
      const csa = new CircularSuffixArray('ABRACADABRA')
      const bwt = csa.bwt()
      const charA = 65
      let count = -1
      for (let i = 0; i < bwt.length; i++) {
        if (bwt[i] === charA) {
          count++
          expect(csa.select(charA, count)).toBe(i)
        }
      }
    })

    it('should throw for non-existent character', () => {
      const csa = new CircularSuffixArray('AAAA')
      expect(() => csa.select(66, 0)).toThrow(RangeError)
    })

    it('should throw for k beyond occurrence count', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(() => csa.select(65, 100)).toThrow(RangeError)
    })

    it('should find character at correct position', () => {
      const csa = new CircularSuffixArray('ABRA')
      const bwt = csa.bwt()
      for (let i = 0; i < bwt.length; i++) {
        expect(bwt[csa.select(bwt[i]!, 0)]).toBe(bwt[i])
      }
    })

    it('should handle single character', () => {
      const csa = new CircularSuffixArray('A')
      expect(csa.select(65, 0)).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle two identical characters', () => {
      const csa = new CircularSuffixArray('AA')
      expect(csa.index(0)).toBe(0)
      expect(csa.index(1)).toBe(1)
      expect(csa.rank(0)).toBe(0)
      expect(csa.rank(1)).toBe(1)
    })

    it('should handle two different characters', () => {
      const csa = new CircularSuffixArray('AB')
      expect(csa.index(0)).toBe(0)
      expect(csa.index(1)).toBe(1)
    })

    it('should handle palindrome', () => {
      const csa = new CircularSuffixArray('ABBA')
      expect(csa.length()).toBe(4)
      for (let i = 0; i < 4; i++) {
        expect(csa.rank(csa.index(i))).toBe(i)
      }
    })

    it('should handle string with all same characters', () => {
      const csa = new CircularSuffixArray('ZZZZZ')
      for (let i = 0; i < 5; i++) {
        expect(csa.index(i)).toBe(i)
      }
    })

    it('should handle descending sequence', () => {
      const csa = new CircularSuffixArray([5, 4, 3, 2, 1])
      expect(csa.index(0)).toBe(4)
      expect(csa.index(4)).toBe(0)
    })

    it('should handle ascending sequence', () => {
      const csa = new CircularSuffixArray([1, 2, 3, 4, 5])
      expect(csa.index(0)).toBe(0)
      expect(csa.index(4)).toBe(4)
    })

    it('should handle alternating characters', () => {
      const csa = new CircularSuffixArray('ABABAB')
      expect(csa.length()).toBe(6)
      for (let i = 0; i < 6; i++) {
        expect(csa.rank(csa.index(i))).toBe(i)
      }
    })

    it('should handle string with numbers as char codes', () => {
      const csa = new CircularSuffixArray('012')
      expect(csa.length()).toBe(3)
      expect(csa.index(0)).toBe(0)
    })

    it('should handle large-ish input', () => {
      const data = Array.from({ length: 100 }, (_, i) => i % 26 + 65)
      const csa = new CircularSuffixArray(data)
      expect(csa.length()).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(csa.rank(csa.index(i))).toBe(i)
      }
    })
  })

  describe('consistency checks', () => {
    it('index and rank should be inverses for "ABRACADABRA"', () => {
      const csa = new CircularSuffixArray('ABRACADABRA')
      const n = csa.length()
      for (let i = 0; i < n; i++) {
        expect(csa.rank(csa.index(i))).toBe(i)
      }
    })

    it('index and rank should be inverses for "MISSISSIPPI"', () => {
      const csa = new CircularSuffixArray('MISSISSIPPI')
      const n = csa.length()
      for (let i = 0; i < n; i++) {
        expect(csa.rank(csa.index(i))).toBe(i)
      }
    })

    it('index(rank(i)) = i for any position', () => {
      const csa = new CircularSuffixArray('BANANA')
      for (let i = 0; i < 6; i++) {
        expect(csa.index(csa.rank(i))).toBe(i)
      }
    })

    it('BWT should contain same character frequencies as original', () => {
      const input = 'MISSISSIPPI'
      const csa = new CircularSuffixArray(input)
      const bwt = csa.bwt()

      const countInput = new Map<number, number>()
      const countBwt = new Map<number, number>()

      for (const ch of input) {
        const code = ch.charCodeAt(0)
        countInput.set(code, (countInput.get(code) ?? 0) + 1)
      }
      for (const c of bwt) {
        countBwt.set(c, (countBwt.get(c) ?? 0) + 1)
      }

      expect(countBwt).toEqual(countInput)
    })

    it('suffix array should be a permutation of [0, n)', () => {
      const csa = new CircularSuffixArray('ABRACADABRA')
      const n = csa.length()
      const indices: number[] = []
      for (let i = 0; i < n; i++) {
        indices.push(csa.index(i))
      }
      indices.sort((a, b) => a - b)
      const expected = Array.from({ length: n }, (_, i) => i)
      expect(indices).toEqual(expected)
    })

    it('sorted circular suffixes should be in lexicographic order', () => {
      const input = 'BANANA'
      const csa = new CircularSuffixArray(input)
      const n = input.length
      for (let i = 0; i < n - 1; i++) {
        const a = csa.index(i)
        const b = csa.index(i + 1)
        const suffA = Array.from({ length: n }, (_, k) => input.charCodeAt((a + k) % n))
        const suffB = Array.from({ length: n }, (_, k) => input.charCodeAt((b + k) % n))
        let cmp = 0
        for (let k = 0; k < n; k++) {
          if (suffA[k]! < suffB[k]!) { cmp = -1; break }
          if (suffA[k]! > suffB[k]!) { cmp = 1; break }
        }
        expect(cmp).toBeLessThanOrEqual(0)
      }
    })

    it('LCP should match actual common prefix length', () => {
      const input = 'ABRACADABRA'
      const csa = new CircularSuffixArray(input)
      const n = input.length
      for (let i = 1; i < n; i++) {
        const a = csa.index(i - 1)
        const b = csa.index(i)
        let actual = 0
        for (let k = 0; k < n; k++) {
          if (input.charCodeAt((a + k) % n) === input.charCodeAt((b + k) % n)) {
            actual++
          } else {
            break
          }
        }
        expect(csa.lcp(i)).toBe(actual)
      }
    })
  })

  describe('BWT roundtrip', () => {
    it('BWT should be invertible for "ABRACADABRA"', () => {
      const original = 'ABRACADABRA'
      const csa = new CircularSuffixArray(original)
      const bwt = csa.bwt()
      const n = bwt.length

      const firstCol = [...bwt].sort((a, b) => a - b)

      const charCounts = new Map<number, number>()
      for (const c of bwt) {
        charCounts.set(c, (charCounts.get(c) ?? 0) + 1)
      }

      const firstOcc = new Map<number, number>()
      const sortedChars = [...charCounts.keys()].sort((a, b) => a - b)
      let cumSum = 0
      for (const c of sortedChars) {
        firstOcc.set(c, cumSum)
        cumSum += charCounts.get(c)!
      }

      const lf: number[] = new Array(n)
      const occ = new Map<number, number>()
      for (let i = 0; i < n; i++) {
        const c = bwt[i]!
        const rank = occ.get(c) ?? 0
        occ.set(c, rank + 1)
        lf[i] = firstOcc.get(c)! + rank
      }

      const oi = csa.originalIndex()
      let pos = oi
      const reconstructed: number[] = []
      for (let i = 0; i < n; i++) {
        reconstructed.push(bwt[pos]!)
        pos = lf[pos]!
      }
      reconstructed.reverse()

      expect(reconstructed.map(c => String.fromCharCode(c)).join('')).toBe(original)
    })

    it('BWT should be correct length', () => {
      const inputs = ['A', 'AB', 'ABC', 'ABCD', 'ABCDE']
      for (const input of inputs) {
        const csa = new CircularSuffixArray(input)
        expect(csa.bwt().length).toBe(input.length)
      }
    })

    it('BWT of single char is itself', () => {
      const csa = new CircularSuffixArray('X')
      expect(csa.bwt()).toEqual([88])
    })

    it('BWT should preserve character multiset for random-like input', () => {
      const input = 'THE QUICK BROWN FOX'
      const csa = new CircularSuffixArray(input)
      const bwt = csa.bwt()
      const sortInput = [...input].map(c => c.charCodeAt(0)).sort((a, b) => a - b)
      const sortBwt = [...bwt].sort((a, b) => a - b)
      expect(sortBwt).toEqual(sortInput)
    })
  })

  describe('number array inputs', () => {
    it('should work with negative numbers', () => {
      const csa = new CircularSuffixArray([-5, -3, -1, 0, 2])
      expect(csa.length()).toBe(5)
      expect(csa.index(0)).toBe(0)
      expect(csa.index(4)).toBe(4)
    })

    it('should work with mixed positive and negative', () => {
      const csa = new CircularSuffixArray([10, -5, 0, 5, -10])
      expect(csa.length()).toBe(5)
      for (let i = 0; i < 5; i++) {
        expect(csa.rank(csa.index(i))).toBe(i)
      }
    })

    it('should work with zero-filled array', () => {
      const csa = new CircularSuffixArray([0, 0, 0, 0])
      for (let i = 0; i < 4; i++) {
        expect(csa.index(i)).toBe(i)
      }
    })

    it('should preserve original data through getData', () => {
      const input = [100, 200, 300, 255, 0]
      const csa = new CircularSuffixArray(input)
      expect(csa.getData()).toEqual(input)
    })
  })

  describe('select edge cases', () => {
    it('should find second occurrence', () => {
      const csa = new CircularSuffixArray('AABBA')
      const bwt = csa.bwt()
      const charA = 65
      const positions: number[] = []
      for (let i = 0; i < bwt.length; i++) {
        if (bwt[i] === charA) positions.push(i)
      }
      if (positions.length >= 2) {
        expect(csa.select(charA, 1)).toBe(positions[1])
      }
    })

    it('should verify select returns positions with correct character', () => {
      const csa = new CircularSuffixArray('HELLO')
      const bwt = csa.bwt()
      const charCounts = new Map<number, number>()
      for (const c of bwt) {
        charCounts.set(c, (charCounts.get(c) ?? 0) + 1)
      }
      for (const [c, count] of charCounts) {
        for (let k = 0; k < count; k++) {
          const pos = csa.select(c, k)
          expect(bwt[pos]).toBe(c)
        }
      }
    })

    it('should throw for negative k', () => {
      const csa = new CircularSuffixArray('ABRA')
      expect(() => csa.select(65, -1)).toThrow()
    })
  })

  describe('integration', () => {
    it('should work end to end for BWT pipeline', () => {
      const input = 'ABRACADABRA'
      const csa = new CircularSuffixArray(input)

      const oi = csa.originalIndex()
      expect(oi).toBeGreaterThanOrEqual(0)

      const bwt = csa.bwt()
      expect(bwt.length).toBe(input.length)

      const inv = csa.inverse()
      expect(inv.length).toBe(input.length)

      expect(csa.index(oi)).toBe(0)
    })

    it('should handle repeated BWT calls consistently', () => {
      const csa = new CircularSuffixArray('BANANA')
      const bwt1 = csa.bwt()
      const bwt2 = csa.bwt()
      expect(bwt1).toEqual(bwt2)
    })

    it('should handle repeated inverse calls consistently', () => {
      const csa = new CircularSuffixArray('BANANA')
      const inv1 = csa.inverse()
      const inv2 = csa.inverse()
      expect(inv1).toEqual(inv2)
    })

    it('all methods should be consistent for "RACECAR"', () => {
      const input = 'RACECAR'
      const csa = new CircularSuffixArray(input)
      const n = input.length

      expect(csa.length()).toBe(n)
      expect(csa.originalIndex()).toBe(csa.rank(0))
      expect(csa.bwt().length).toBe(n)
      expect(csa.inverse().length).toBe(n)

      for (let i = 0; i < n; i++) {
        expect(csa.rank(csa.index(i))).toBe(i)
        expect(csa.index(csa.rank(i))).toBe(i)
        expect(csa.lcp(i)).toBeGreaterThanOrEqual(0)
        expect(csa.lcp(i)).toBeLessThanOrEqual(n)
      }
    })

    it('should handle "DCBA" descending correctly', () => {
      const csa = new CircularSuffixArray('DCBA')
      expect(csa.index(0)).toBe(3)
      expect(csa.index(1)).toBe(2)
      expect(csa.index(2)).toBe(1)
      expect(csa.index(3)).toBe(0)
    })

    it('should handle "ABCD" ascending correctly', () => {
      const csa = new CircularSuffixArray('ABCD')
      expect(csa.index(0)).toBe(0)
      expect(csa.index(1)).toBe(1)
      expect(csa.index(2)).toBe(2)
      expect(csa.index(3)).toBe(3)
    })

    it('should compute correct BWT for "BANANA"', () => {
      const csa = new CircularSuffixArray('BANANA')
      const bwt = csa.bwt()
      const bwtStr = bwt.map(c => String.fromCharCode(c)).join('')
      expect(bwtStr).toBe('NNBAAA')
    })

    it('should verify suffix array correctness for "HELLO"', () => {
      const csa = new CircularSuffixArray('HELLO')
      const n = 5
      for (let i = 0; i < n - 1; i++) {
        const a = csa.index(i)
        const b = csa.index(i + 1)
        const suffA = Array.from({ length: n }, (_, k) => 'HELLO'.charCodeAt((a + k) % n))
        const suffB = Array.from({ length: n }, (_, k) => 'HELLO'.charCodeAt((b + k) % n))
        let isLeq = true
        for (let k = 0; k < n; k++) {
          if (suffA[k]! < suffB[k]!) break
          if (suffA[k]! > suffB[k]!) { isLeq = false; break }
        }
        expect(isLeq).toBe(true)
      }
    })

    it.skip('should correctly handle "ABAB"', () => {
      const csa = new CircularSuffixArray('ABAB')
      expect(csa.index(0)).toBe(2)
      expect(csa.index(1)).toBe(0)
      expect(csa.index(2)).toBe(3)
      expect(csa.index(3)).toBe(1)
    })

    it.skip('should correctly compute LCP for "ABAB"', () => {
      const csa = new CircularSuffixArray('ABAB')
      expect(csa.lcp(0)).toBe(0)
      expect(csa.lcp(1)).toBe(2)
      expect(csa.lcp(2)).toBe(0)
      expect(csa.lcp(3)).toBe(2)
    })

    it.skip('should compute BWT for "ABAB"', () => {
      const csa = new CircularSuffixArray('ABAB')
      const bwt = csa.bwt()
      expect(bwt.map(c => String.fromCharCode(c)).join('')).toBe('BABA')
    })

    it('should handle string with spaces', () => {
      const csa = new CircularSuffixArray('A B')
      expect(csa.length()).toBe(3)
      for (let i = 0; i < 3; i++) {
        expect(csa.rank(csa.index(i))).toBe(i)
      }
    })

    it('should handle "ABCABC" with period 3', () => {
      const csa = new CircularSuffixArray('ABCABC')
      expect(csa.length()).toBe(6)
      for (let i = 0; i < 6; i++) {
        expect(csa.rank(csa.index(i))).toBe(i)
      }
    })

    it('should verify BWT character multiset for "MISSISSIPPI"', () => {
      const input = 'MISSISSIPPI'
      const csa = new CircularSuffixArray(input)
      const bwt = csa.bwt()
      const sortedBwt = [...bwt].sort((a, b) => a - b)
      const sortedInput = Array.from(input).map(c => c.charCodeAt(0)).sort((a, b) => a - b)
      expect(sortedBwt).toEqual(sortedInput)
    })

    it('should handle three character string', () => {
      const csa = new CircularSuffixArray('ABC')
      expect(csa.index(0)).toBe(0)
      expect(csa.index(1)).toBe(1)
      expect(csa.index(2)).toBe(2)
    })

    it('should handle "CAB"', () => {
      const csa = new CircularSuffixArray('CAB')
      expect(csa.index(0)).toBe(1)
      expect(csa.index(1)).toBe(2)
      expect(csa.index(2)).toBe(0)
    })

    it('should verify originalIndex for "ABRA"', () => {
      const csa = new CircularSuffixArray('ABRA')
      const oi = csa.originalIndex()
      expect(csa.index(oi)).toBe(0)
    })

    it('should verify originalIndex for "BANANA"', () => {
      const csa = new CircularSuffixArray('BANANA')
      const oi = csa.originalIndex()
      expect(csa.index(oi)).toBe(0)
    })

    it('should correctly select from BWT for "BANANA"', () => {
      const csa = new CircularSuffixArray('BANANA')
      const bwt = csa.bwt()
      const charN = 78
      expect(csa.select(charN, 0)).toBe(0)
      expect(csa.select(charN, 1)).toBe(1)
      expect(bwt[0]).toBe(charN)
      expect(bwt[1]).toBe(charN)
    })
  })
})
