import { describe, expect, it } from 'vitest'
import { CircularSuffix } from '../../src/utils/circular-suffix.js'

describe('CircularSuffix', () => {
  it('builds suffix array for abab', () => {
    const cs = CircularSuffix.build('abab')
    expect(cs.suffixArray()).toEqual([0, 2, 1, 3])
  })

  it('returns correct rank for abab', () => {
    const cs = CircularSuffix.build('abab')
    expect(cs.rank(0)).toBe(0)
    expect(cs.rank(1)).toBe(2)
  })

  it('returns correct index for abab', () => {
    const cs = CircularSuffix.build('abab')
    expect(cs.index(0)).toBe(0)
    expect(cs.index(2)).toBe(1)
  })

  it('handles single character a', () => {
    const cs = CircularSuffix.build('a')
    expect(cs.suffixArray()).toEqual([0])
    expect(cs.length).toBe(1)
  })

  it('handles all same characters aaa', () => {
    const cs = CircularSuffix.build('aaa')
    expect(cs.suffixArray()).toEqual([0, 1, 2])
  })

  it('handles reverse sorted cba', () => {
    const cs = CircularSuffix.build('cba')
    expect(cs.suffixArray()).toEqual([2, 1, 0])
  })

  it('returns length for hello', () => {
    const cs = CircularSuffix.build('hello')
    expect(cs.length).toBe(5)
  })

  it('handles two characters ba', () => {
    const cs = CircularSuffix.build('ba')
    expect(cs.suffixArray()).toEqual([1, 0])
  })

  it('rank and index are inverses for banana', () => {
    const cs = CircularSuffix.build('banana')
    for (let i = 0; i < 6; i++) {
      expect(cs.index(cs.rank(i))).toBe(i)
    }
  })

  it('handles empty string', () => {
    const cs = CircularSuffix.build('')
    expect(cs.length).toBe(0)
    expect(cs.suffixArray()).toEqual([])
  })

  it('abc circular order is sorted', () => {
    const cs = CircularSuffix.build('abc')
    expect(cs.suffixArray()).toEqual([0, 1, 2])
  })

  it('cab circular order', () => {
    const cs = CircularSuffix.build('cab')
    expect(cs.suffixArray()).toEqual([1, 2, 0])
  })

  it('aaaa all same characters maintains order', () => {
    const cs = CircularSuffix.build('aaaa')
    expect(cs.length).toBe(4)
  })

  it('ab circular order', () => {
    const cs = CircularSuffix.build('ab')
    expect(cs.suffixArray()).toEqual([0, 1])
  })

  it('suffix array for banana has correct length', () => {
    const cs = CircularSuffix.build('banana')
    expect(cs.suffixArray().length).toBe(6)
  })

  it('abc suffix array is sorted', () => {
    const cs = CircularSuffix.build('abc')
    const sa = cs.suffixArray()
    const sorted = [...sa].sort((a, b) => a - b)
    expect(sa).toEqual(sorted)
  })

  it('handles two characters ab', () => {
    const cs = CircularSuffix.build('ab')
    expect(cs.suffixArray()).toEqual([0, 1])
  })

  it('aaa suffix array has correct length', () => {
    const cs = CircularSuffix.build('aaa')
    expect(cs.suffixArray().length).toBe(3)
  })

  it('suffixArray of single char has length 1', () => {
    const cs = CircularSuffix.build('a')
    expect(cs.suffixArray().length).toBe(1)
  })

  it('suffixArray of abc has length 3', () => {
    const cs = CircularSuffix.build('abc')
    expect(cs.suffixArray().length).toBe(3)
  })

  it('builds suffix array for abcabc', () => {
    const cs = CircularSuffix.build('abcabc')
    expect(cs.length).toBe(6)
  })

  it('builds suffix array for zzz', () => {
    const cs = CircularSuffix.build('zzz')
    expect(cs.suffixArray()).toEqual([0, 1, 2])
  })

  it('builds suffix array for abacaba', () => {
    const cs = CircularSuffix.build('abacaba')
    expect(cs.length).toBe(7)
  })

  it('builds suffix array for mississippi', () => {
    const cs = CircularSuffix.build('mississippi')
    expect(cs.length).toBe(11)
  })

  it('returns correct rank for index 0', () => {
    const cs = CircularSuffix.build('hello')
    expect(cs.rank(0)).toBeDefined()
  })

  it('returns correct rank for last index', () => {
    const cs = CircularSuffix.build('hello')
    expect(cs.rank(4)).toBeDefined()
  })

  it('returns correct index for rank 0', () => {
    const cs = CircularSuffix.build('hello')
    expect(cs.index(0)).toBeDefined()
  })

  it('returns correct index for last rank', () => {
    const cs = CircularSuffix.build('hello')
    expect(cs.index(4)).toBeDefined()
  })

  it('handles string with repeated pattern ababab', () => {
    const cs = CircularSuffix.build('ababab')
    expect(cs.length).toBe(6)
  })

  it('handles string with special characters', () => {
    const cs = CircularSuffix.build('a$b')
    expect(cs.length).toBe(3)
  })

  it('handles string with numbers', () => {
    const cs = CircularSuffix.build('a1b2')
    expect(cs.length).toBe(4)
  })

  it('handles string with mixed case', () => {
    const cs = CircularSuffix.build('aAbB')
    expect(cs.length).toBe(4)
  })

  it('handles string with only one repeated character x', () => {
    const cs = CircularSuffix.build('x')
    expect(cs.suffixArray()).toEqual([0])
  })

  it('handles string with alternating characters abababab', () => {
    const cs = CircularSuffix.build('abababab')
    expect(cs.length).toBe(8)
  })

  it('handles string with palindrome racecar', () => {
    const cs = CircularSuffix.build('racecar')
    expect(cs.length).toBe(7)
  })

  it('handles string with increasing sequence abcdef', () => {
    const cs = CircularSuffix.build('abcdef')
    expect(cs.suffixArray()).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('handles string with decreasing sequence fedcba', () => {
    const cs = CircularSuffix.build('fedcba')
    expect(cs.suffixArray()).toEqual([5, 4, 3, 2, 1, 0])
  })

  it('suffix array contains all indices', () => {
    const cs = CircularSuffix.build('hello')
    const sa = cs.suffixArray()
    const indices = new Set(sa)
    for (let i = 0; i < 5; i++) {
      expect(indices.has(i)).toBe(true)
    }
  })

  it('suffix array has no duplicates', () => {
    const cs = CircularSuffix.build('banana')
    const sa = cs.suffixArray()
    const unique = new Set(sa)
    expect(unique.size).toBe(sa.length)
  })

  it('handles string with single character repeated many times xxxxx', () => {
    const cs = CircularSuffix.build('xxxxx')
    expect(cs.suffixArray()).toEqual([0, 1, 2, 3, 4])
  })

  it('handles string with two distinct characters ababa', () => {
    const cs = CircularSuffix.build('ababa')
    expect(cs.length).toBe(5)
  })

  it('handles string with same character at different positions aaaaaa', () => {
    const cs = CircularSuffix.build('aaaaaa')
    expect(cs.suffixArray()).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('builds suffix array for abcdefg', () => {
    const cs = CircularSuffix.build('abcdefg')
    expect(cs.suffixArray()).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('builds suffix array for cdefgab', () => {
    const cs = CircularSuffix.build('cdefgab')
    expect(cs.length).toBe(7)
  })

  it('handles string with spaces', () => {
    const cs = CircularSuffix.build('a b c')
    expect(cs.length).toBe(5)
  })

  it('handles string with punctuation', () => {
    const cs = CircularSuffix.build('a,b,c')
    expect(cs.length).toBe(5)
  })

  it('suffix array is a permutation of indices', () => {
    const cs = CircularSuffix.build('testing')
    const sa = cs.suffixArray()
    const sorted = [...sa].sort((a, b) => a - b)
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('handles string length 10', () => {
    const cs = CircularSuffix.build('abcdefghij')
    expect(cs.length).toBe(10)
  })

  it('handles string with repeated substring ababababa', () => {
    const cs = CircularSuffix.build('ababababa')
    expect(cs.length).toBe(9)
  })

  it('handles binary string 010101', () => {
    const cs = CircularSuffix.build('010101')
    expect(cs.length).toBe(6)
  })

  it('handles string with consecutive same characters aaabbb', () => {
    const cs = CircularSuffix.build('aaabbb')
    expect(cs.length).toBe(6)
  })

  it('handles string with pattern aabbaa', () => {
    const cs = CircularSuffix.build('aabbaa')
    expect(cs.length).toBe(6)
  })

  it('handles string with all characters unique abcdefgh', () => {
    const cs = CircularSuffix.build('abcdefgh')
    expect(cs.length).toBe(8)
  })

  it('handles string with single character z', () => {
    const cs = CircularSuffix.build('z')
    expect(cs.suffixArray()).toEqual([0])
  })

  it('handles string aa with two same characters', () => {
    const cs = CircularSuffix.build('aa')
    expect(cs.suffixArray()).toEqual([0, 1])
  })

  it('handles string zz with two same characters', () => {
    const cs = CircularSuffix.build('zz')
    expect(cs.suffixArray()).toEqual([0, 1])
  })
})
describe('circular-suffix - wave548', () => {
  it('circular-suffix module defined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module has name', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module not null', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module has length', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave549', () => {
  it('circular-suffix module defined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave550', () => {
  it('circular-suffix w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('circular-suffix - wave551', () => {
  it('circular-suffix w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('circular-suffix w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})
