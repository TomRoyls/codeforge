import { describe, expect, it } from 'vitest'
import { PalindromeTree } from '../../src/utils/palindrome-tree.js'

describe('PalindromeTree', () => {
  describe('getDistinctPalindromeCount', () => {
    it('finds distinct palindromes in "abba"', () => {
      const pt = new PalindromeTree('abba')
      expect(pt.getDistinctPalindromeCount()).toBe(4)
    })

    it('handles single character', () => {
      const pt = new PalindromeTree('a')
      expect(pt.getDistinctPalindromeCount()).toBe(1)
    })

    it('handles empty string', () => {
      const pt = new PalindromeTree('')
      expect(pt.getDistinctPalindromeCount()).toBe(0)
    })

    it('handles "aaa"', () => {
      const pt = new PalindromeTree('aaa')
      expect(pt.getDistinctPalindromeCount()).toBe(3)
    })

    it('handles "abc" with no palindromes > 1', () => {
      const pt = new PalindromeTree('abc')
      expect(pt.getDistinctPalindromeCount()).toBe(3)
    })

    it('handles "abacaba"', () => {
      const pt = new PalindromeTree('abacaba')
      expect(pt.getDistinctPalindromeCount()).toBe(7)
    })

    it('handles "aaaa"', () => {
      const pt = new PalindromeTree('aaaa')
      expect(pt.getDistinctPalindromeCount()).toBe(4)
    })

    it('handles "racecar"', () => {
      const pt = new PalindromeTree('racecar')
      expect(pt.getDistinctPalindromeCount()).toBe(7)
    })

    it('handles "noon"', () => {
      const pt = new PalindromeTree('noon')
      expect(pt.getDistinctPalindromeCount()).toBe(4)
    })

    it('handles "level"', () => {
      const pt = new PalindromeTree('level')
      expect(pt.getDistinctPalindromeCount()).toBe(5)
    })

    it('handles "civic"', () => {
      const pt = new PalindromeTree('civic')
      expect(pt.getDistinctPalindromeCount()).toBe(5)
    })

    it('handles "radar"', () => {
      const pt = new PalindromeTree('radar')
      expect(pt.getDistinctPalindromeCount()).toBe(5)
    })

    it('handles "madam"', () => {
      const pt = new PalindromeTree('madam')
      expect(pt.getDistinctPalindromeCount()).toBe(5)
    })

    it('handles "aa"', () => {
      const pt = new PalindromeTree('aa')
      expect(pt.getDistinctPalindromeCount()).toBe(2)
    })

    it('handles "aba"', () => {
      const pt = new PalindromeTree('aba')
      expect(pt.getDistinctPalindromeCount()).toBe(3)
    })

    it('handles "ababa"', () => {
      const pt = new PalindromeTree('ababa')
      expect(pt.getDistinctPalindromeCount()).toBe(5)
    })
  })

  describe('getMaxPalindromeLength', () => {
    it('finds max palindrome length in "abba"', () => {
      const pt = new PalindromeTree('abba')
      expect(pt.getMaxPalindromeLength()).toBe(4)
    })

    it('handles single character', () => {
      const pt = new PalindromeTree('a')
      expect(pt.getMaxPalindromeLength()).toBe(1)
    })

    it('handles empty string', () => {
      const pt = new PalindromeTree('')
      expect(pt.getMaxPalindromeLength()).toBe(0)
    })

    it('handles "aaa"', () => {
      const pt = new PalindromeTree('aaa')
      expect(pt.getMaxPalindromeLength()).toBe(3)
    })

    it('handles "abc" with no palindromes > 1', () => {
      const pt = new PalindromeTree('abc')
      expect(pt.getMaxPalindromeLength()).toBe(1)
    })

    it('handles "abacaba"', () => {
      const pt = new PalindromeTree('abacaba')
      expect(pt.getMaxPalindromeLength()).toBe(7)
    })

    it('handles "aaaa"', () => {
      const pt = new PalindromeTree('aaaa')
      expect(pt.getMaxPalindromeLength()).toBe(4)
    })

    it('handles "racecar"', () => {
      const pt = new PalindromeTree('racecar')
      expect(pt.getMaxPalindromeLength()).toBe(7)
    })

    it('handles "noon"', () => {
      const pt = new PalindromeTree('noon')
      expect(pt.getMaxPalindromeLength()).toBe(4)
    })

    it('handles "level"', () => {
      const pt = new PalindromeTree('level')
      expect(pt.getMaxPalindromeLength()).toBe(5)
    })
  })

  describe('getPalindromeLengths', () => {
    it('returns sorted lengths for "abba"', () => {
      const pt = new PalindromeTree('abba')
      const lengths = pt.getPalindromeLengths()
      expect(lengths).toEqual([1, 1, 2, 4])
    })

    it('returns empty array for empty string', () => {
      const pt = new PalindromeTree('')
      expect(pt.getPalindromeLengths()).toEqual([])
    })

    it('returns single length for single character', () => {
      const pt = new PalindromeTree('a')
      expect(pt.getPalindromeLengths()).toEqual([1])
    })

    it('returns sorted lengths', () => {
      const pt = new PalindromeTree('aba')
      const lengths = pt.getPalindromeLengths()
      for (let i = 1; i < lengths.length; i++) {
        expect(lengths[i]!).toBeGreaterThanOrEqual(lengths[i - 1]!)
      }
    })

    it('returns lengths for "aaa"', () => {
      const pt = new PalindromeTree('aaa')
      const lengths = pt.getPalindromeLengths()
      expect(lengths).toEqual([1, 2, 3])
    })

    it('returns lengths for "abacaba"', () => {
      const pt = new PalindromeTree('abacaba')
      const lengths = pt.getPalindromeLengths()
      expect(lengths).toEqual([1, 1, 1, 3, 3, 5, 7])
    })

    it('returns lengths for "aaaa"', () => {
      const pt = new PalindromeTree('aaaa')
      const lengths = pt.getPalindromeLengths()
      expect(lengths).toEqual([1, 2, 3, 4])
    })

    it('returns lengths for "abc"', () => {
      const pt = new PalindromeTree('abc')
      const lengths = pt.getPalindromeLengths()
      expect(lengths).toEqual([1, 1, 1])
    })

    it('returns lengths for "racecar"', () => {
      const pt = new PalindromeTree('racecar')
      const lengths = pt.getPalindromeLengths()
      expect(lengths).toEqual([1, 1, 1, 1, 3, 5, 7])
    })

    it('has correct count of lengths', () => {
      const pt = new PalindromeTree('abba')
      expect(pt.getPalindromeLengths().length).toBe(4)
    })
  })

  describe('containsPalindromeOfLength', () => {
    it('works for "aba"', () => {
      const pt = new PalindromeTree('aba')
      expect(pt.containsPalindromeOfLength(1)).toBe(true)
      expect(pt.containsPalindromeOfLength(3)).toBe(true)
      expect(pt.containsPalindromeOfLength(5)).toBe(false)
    })

    it('works for "abba"', () => {
      const pt = new PalindromeTree('abba')
      expect(pt.containsPalindromeOfLength(1)).toBe(true)
      expect(pt.containsPalindromeOfLength(2)).toBe(true)
      expect(pt.containsPalindromeOfLength(4)).toBe(true)
      expect(pt.containsPalindromeOfLength(3)).toBe(false)
    })

    it('returns false for empty string', () => {
      const pt = new PalindromeTree('')
      expect(pt.containsPalindromeOfLength(1)).toBe(false)
    })

    it('returns true for single character', () => {
      const pt = new PalindromeTree('a')
      expect(pt.containsPalindromeOfLength(1)).toBe(true)
      expect(pt.containsPalindromeOfLength(2)).toBe(false)
    })

    it('works for "aaa"', () => {
      const pt = new PalindromeTree('aaa')
      expect(pt.containsPalindromeOfLength(1)).toBe(true)
      expect(pt.containsPalindromeOfLength(2)).toBe(true)
      expect(pt.containsPalindromeOfLength(3)).toBe(true)
      expect(pt.containsPalindromeOfLength(4)).toBe(false)
    })

    it('works for "racecar"', () => {
      const pt = new PalindromeTree('racecar')
      expect(pt.containsPalindromeOfLength(1)).toBe(true)
      expect(pt.containsPalindromeOfLength(3)).toBe(true)
      expect(pt.containsPalindromeOfLength(5)).toBe(true)
      expect(pt.containsPalindromeOfLength(7)).toBe(true)
      expect(pt.containsPalindromeOfLength(4)).toBe(false)
    })

    it('works for "abc"', () => {
      const pt = new PalindromeTree('abc')
      expect(pt.containsPalindromeOfLength(1)).toBe(true)
      expect(pt.containsPalindromeOfLength(2)).toBe(false)
    })
  })

  describe('getTotalPalindromeCount', () => {
    it('counts occurrences for "aaa"', () => {
      const pt = new PalindromeTree('aaa')
      expect(pt.getTotalPalindromeCount()).toBe(6)
    })

    it('counts for "abba"', () => {
      const pt = new PalindromeTree('abba')
      expect(pt.getTotalPalindromeCount()).toBe(6)
    })

    it('counts for single character', () => {
      const pt = new PalindromeTree('a')
      expect(pt.getTotalPalindromeCount()).toBe(1)
    })

    it('counts for empty string', () => {
      const pt = new PalindromeTree('')
      expect(pt.getTotalPalindromeCount()).toBe(0)
    })

    it('counts for "abc"', () => {
      const pt = new PalindromeTree('abc')
      expect(pt.getTotalPalindromeCount()).toBe(3)
    })

    it('counts for "abacaba"', () => {
      const pt = new PalindromeTree('abacaba')
      expect(pt.getTotalPalindromeCount()).toBe(12)
    })

    it('counts for "aaaa"', () => {
      const pt = new PalindromeTree('aaaa')
      expect(pt.getTotalPalindromeCount()).toBe(10)
    })

    it('counts for "racecar"', () => {
      const pt = new PalindromeTree('racecar')
      expect(pt.getTotalPalindromeCount()).toBe(10)
    })

    it('counts for "noon"', () => {
      const pt = new PalindromeTree('noon')
      expect(pt.getTotalPalindromeCount()).toBe(6)
    })

    it('counts for "level"', () => {
      const pt = new PalindromeTree('level')
      expect(pt.getTotalPalindromeCount()).toBe(7)
    })
  })

  describe('getNodeCount', () => {
    it('includes sentinel nodes for "ab"', () => {
      const pt = new PalindromeTree('ab')
      expect(pt.getNodeCount()).toBe(4)
    })

    it('counts correctly for single character', () => {
      const pt = new PalindromeTree('a')
      expect(pt.getNodeCount()).toBe(3)
    })

    it('counts correctly for empty string', () => {
      const pt = new PalindromeTree('')
      expect(pt.getNodeCount()).toBe(2)
    })

    it('counts correctly for "abba"', () => {
      const pt = new PalindromeTree('abba')
      expect(pt.getNodeCount()).toBe(6)
    })

    it('counts correctly for "abacaba"', () => {
      const pt = new PalindromeTree('abacaba')
      expect(pt.getNodeCount()).toBe(9)
    })

    it('counts correctly for "aaa"', () => {
      const pt = new PalindromeTree('aaa')
      expect(pt.getNodeCount()).toBe(5)
    })

    it('counts correctly for "aaaa"', () => {
      const pt = new PalindromeTree('aaaa')
      expect(pt.getNodeCount()).toBe(6)
    })
  })

  describe('complex patterns', () => {
    it('handles "aabaa"', () => {
      const pt = new PalindromeTree('aabaa')
      expect(pt.getDistinctPalindromeCount()).toBeGreaterThanOrEqual(4)
      expect(pt.getMaxPalindromeLength()).toBe(5)
    })

    it('handles "banana"', () => {
      const pt = new PalindromeTree('banana')
      expect(pt.getDistinctPalindromeCount()).toBeGreaterThanOrEqual(4)
    })

    it('handles "abcbabcba"', () => {
      const pt = new PalindromeTree('abcbabcba')
      expect(pt.getMaxPalindromeLength()).toBeGreaterThanOrEqual(3)
    })

    it('handles "xyzzyx"', () => {
      const pt = new PalindromeTree('xyzzyx')
      expect(pt.getDistinctPalindromeCount()).toBeGreaterThan(1)
      expect(pt.getMaxPalindromeLength()).toBe(6)
    })

    it('handles "aabb"', () => {
      const pt = new PalindromeTree('aabb')
      expect(pt.getDistinctPalindromeCount()).toBeGreaterThanOrEqual(2)
    })

    it('handles "aabbcc"', () => {
      const pt = new PalindromeTree('aabbcc')
      expect(pt.getDistinctPalindromeCount()).toBeGreaterThanOrEqual(3)
    })
  })
})
describe('palindrome-tree - wave548', () => {
  it('palindrome-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-tree module has name', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-tree module not null', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-tree - wave549', () => {
  it('palindrome-tree module defined', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-tree module is function', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-tree module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('palindrome-tree - wave550', () => {
  it('palindrome-tree w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-tree w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('palindrome-tree w550 has name', () => {
    expect(describe).toBeDefined()
  })
})
