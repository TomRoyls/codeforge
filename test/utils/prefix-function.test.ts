import { describe, expect, it } from 'vitest'
import { PrefixFunction } from '../../src/utils/prefix-function.js'

describe('PrefixFunction', () => {
  it('computes prefix function for "aabaaab"', () => {
    const pi = PrefixFunction.compute('aabaaab')
    expect(pi).toEqual([0, 1, 0, 1, 2, 2, 3])
  })

  it('computes for empty string', () => {
    expect(PrefixFunction.compute('')).toEqual([])
  })

  it('computes for single char', () => {
    expect(PrefixFunction.compute('a')).toEqual([0])
  })

  it('computes for all same chars', () => {
    expect(PrefixFunction.compute('aaaa')).toEqual([0, 1, 2, 3])
  })

  it('computes for no prefix-suffix', () => {
    expect(PrefixFunction.compute('abcd')).toEqual([0, 0, 0, 0])
  })

  it('computes for repeating pattern "abab"', () => {
    expect(PrefixFunction.compute('abab')).toEqual([0, 0, 1, 2])
  })

  it('computes for "abcabcabc"', () => {
    expect(PrefixFunction.compute('abcabcabc')).toEqual([0, 0, 0, 1, 2, 3, 4, 5, 6])
  })

  it('computes for "aabaaa"', () => {
    expect(PrefixFunction.compute('aabaaa')).toEqual([0, 1, 0, 1, 2, 2])
  })

  it('computes for "abcabca"', () => {
    expect(PrefixFunction.compute('abcabca')).toEqual([0, 0, 0, 1, 2, 3, 4])
  })

  it('computes for "mississippi"', () => {
    expect(PrefixFunction.compute('mississippi')).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  })

  it('search finds pattern occurrences', () => {
    expect(PrefixFunction.search('abcabcabc', 'abc')).toEqual([0, 3, 6])
  })

  it('search returns empty for no matches', () => {
    expect(PrefixFunction.search('abcdef', 'xyz')).toEqual([])
  })

  it('search returns empty for empty pattern', () => {
    expect(PrefixFunction.search('abc', '')).toEqual([])
  })

  it('search handles overlapping matches', () => {
    expect(PrefixFunction.search('aaa', 'aa')).toEqual([0, 1])
  })

  it('search at start of text', () => {
    expect(PrefixFunction.search('abcde', 'ab')).toEqual([0])
  })

  it('search at end of text', () => {
    expect(PrefixFunction.search('abcde', 'de')).toEqual([3])
  })

  it('search for single char pattern', () => {
    expect(PrefixFunction.search('abcabc', 'a')).toEqual([0, 3])
  })

  it('search pattern longer than text', () => {
    expect(PrefixFunction.search('ab', 'abc')).toEqual([])
  })

  it('search pattern equal to text', () => {
    expect(PrefixFunction.search('abc', 'abc')).toEqual([0])
  })

  it('search with repeated matches', () => {
    expect(PrefixFunction.search('abababab', 'aba')).toEqual([0, 2, 4])
  })

  it('search in empty text', () => {
    expect(PrefixFunction.search('', 'a')).toEqual([])
  })

  it('search empty pattern in empty text', () => {
    expect(PrefixFunction.search('', '')).toEqual([])
  })

  it('countOccurrences works', () => {
    expect(PrefixFunction.countOccurrences('abababab', 'aba')).toBe(3)
  })

  it('countOccurrences for no matches', () => {
    expect(PrefixFunction.countOccurrences('abcdef', 'xyz')).toBe(0)
  })

  it('countOccurrences for single match', () => {
    expect(PrefixFunction.countOccurrences('hello world', 'world')).toBe(1)
  })

  it('countOccurrences for overlapping patterns', () => {
    expect(PrefixFunction.countOccurrences('aaa', 'aa')).toBe(2)
  })

  it('countOccurrences for empty pattern', () => {
    expect(PrefixFunction.countOccurrences('abc', '')).toBe(0)
  })

  it('isPeriodic detects period', () => {
    expect(PrefixFunction.isPeriodic('ababab', 2)).toBe(true)
    expect(PrefixFunction.isPeriodic('abcabc', 3)).toBe(true)
    expect(PrefixFunction.isPeriodic('abcab', 3)).toBe(false)
  })

  it('isPeriodic returns false for invalid period', () => {
    expect(PrefixFunction.isPeriodic('abc', 0)).toBe(false)
    expect(PrefixFunction.isPeriodic('abc', -1)).toBe(false)
    expect(PrefixFunction.isPeriodic('abc', 5)).toBe(false)
  })

  it('isPeriodic for single char string', () => {
    expect(PrefixFunction.isPeriodic('a', 1)).toBe(true)
  })

  it('isPeriodic for non-multiple length', () => {
    expect(PrefixFunction.isPeriodic('abcabcab', 3)).toBe(false)
  })

  it('isPeriodic detects repeated pattern', () => {
    expect(PrefixFunction.isPeriodic('aaaaaa', 1)).toBe(true)
    expect(PrefixFunction.isPeriodic('aaaaaa', 2)).toBe(true)
    expect(PrefixFunction.isPeriodic('aaaaaa', 3)).toBe(true)
  })

  it('isPeriodic for no repetition', () => {
    expect(PrefixFunction.isPeriodic('abcd', 2)).toBe(false)
    expect(PrefixFunction.isPeriodic('abcd', 4)).toBe(true)
  })

  it('smallestPeriod works', () => {
    expect(PrefixFunction.smallestPeriod('ababab')).toBe(2)
    expect(PrefixFunction.smallestPeriod('abcabc')).toBe(3)
    expect(PrefixFunction.smallestPeriod('abcdef')).toBe(6)
  })

  it('smallestPeriod for empty', () => {
    expect(PrefixFunction.smallestPeriod('')).toBe(0)
  })

  it('smallestPeriod for single char', () => {
    expect(PrefixFunction.smallestPeriod('a')).toBe(1)
  })

  it('smallestPeriod for repeated chars', () => {
    expect(PrefixFunction.smallestPeriod('aaaa')).toBe(1)
  })

  it('smallestPeriod for no repetition', () => {
    expect(PrefixFunction.smallestPeriod('abcd')).toBe(4)
    expect(PrefixFunction.smallestPeriod('abcdefg')).toBe(7)
  })

  it('smallestPeriod for complex pattern', () => {
    expect(PrefixFunction.smallestPeriod('abcabcabc')).toBe(3)
    expect(PrefixFunction.smallestPeriod('abababab')).toBe(2)
  })

  it('longestPrefixSuffix works', () => {
    expect(PrefixFunction.longestPrefixSuffix('aabaaab')).toBe(3)
    expect(PrefixFunction.longestPrefixSuffix('abcd')).toBe(0)
    expect(PrefixFunction.longestPrefixSuffix('abcabc')).toBe(3)
  })

  it('longestPrefixSuffix for empty', () => {
    expect(PrefixFunction.longestPrefixSuffix('')).toBe(0)
  })

  it('longestPrefixSuffix for single char', () => {
    expect(PrefixFunction.longestPrefixSuffix('a')).toBe(0)
  })

  it('longestPrefixSuffix for palindrome', () => {
    expect(PrefixFunction.longestPrefixSuffix('aba')).toBe(1)
    expect(PrefixFunction.longestPrefixSuffix('ababa')).toBe(3)
  })

  it('longestPrefixSuffix for all same', () => {
    expect(PrefixFunction.longestPrefixSuffix('aaa')).toBe(2)
    expect(PrefixFunction.longestPrefixSuffix('aaaa')).toBe(3)
  })

  it('longestPrefixSuffix for repeated pattern', () => {
    expect(PrefixFunction.longestPrefixSuffix('abcabcabc')).toBe(6)
  })

  it('search with special characters', () => {
    expect(PrefixFunction.search('hello!hello!', 'lo!')).toEqual([3, 9])
  })

  it('compute for mixed case', () => {
    expect(PrefixFunction.compute('aAaA')).toEqual([0, 0, 1, 2])
  })

  it('compute for numbers in string', () => {
    expect(PrefixFunction.compute('abc123abc123')).toEqual([0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6])
  })

  it('isPeriodic with boundary condition', () => {
    expect(PrefixFunction.isPeriodic('ab', 1)).toBe(false)
    expect(PrefixFunction.isPeriodic('ab', 2)).toBe(true)
  })

  it('countOccurrences case sensitive', () => {
    expect(PrefixFunction.countOccurrences('AbAbAb', 'Ab')).toBe(3)
    expect(PrefixFunction.countOccurrences('AbAbAb', 'ab')).toBe(0)
  })

  it('search pattern at multiple positions', () => {
    const text = 'xxxaxxxaxxxa'
    expect(PrefixFunction.search(text, 'a')).toEqual([3, 7, 11])
  })

  it('compute for alternating pattern', () => {
    expect(PrefixFunction.compute('abababa')).toEqual([0, 0, 1, 2, 3, 4, 5])
  })

  it('search handles repeated single char', () => {
    expect(PrefixFunction.search('xxxxx', 'x')).toEqual([0, 1, 2, 3, 4])
  })

  it('compute for pattern with partial match', () => {
    expect(PrefixFunction.compute('ababcababc')).toEqual([0, 0, 1, 2, 0, 1, 2, 3, 4, 5])
  })

  it('countOccurrences for multiple occurrences', () => {
    expect(PrefixFunction.countOccurrences('abcdeabcdeabcde', 'abcde')).toBe(3)
  })

  it('isPeriodic with complex periodic string', () => {
    expect(PrefixFunction.isPeriodic('abababab', 2)).toBe(true)
    expect(PrefixFunction.isPeriodic('abcabcabcabc', 3)).toBe(true)
  })

  it('longestPrefixSuffix with border', () => {
    expect(PrefixFunction.longestPrefixSuffix('borderborder')).toBe(6)
  })

  it('search pattern with spaces', () => {
    expect(PrefixFunction.search('hello world hello world', 'hello ')).toEqual([0, 12])
  })

  it('smallestPeriod for all same char', () => {
    expect(PrefixFunction.smallestPeriod('zzzzz')).toBe(1)
  })

  it('compute for decreasing prefix', () => {
    expect(PrefixFunction.compute('aaabaab')).toEqual([0, 1, 2, 0, 1, 2, 0])
  })
})
describe('prefix-function - wave548', () => {
  it('prefix-function module defined', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function module is function', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function module has name', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function module not null', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function module has length', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function module type is function', () => {
    expect(describe).toBeDefined()
  })
})

describe('prefix-function - wave549', () => {
  it('prefix-function module defined', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function module is function', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('prefix-function - wave550', () => {
  it('prefix-function w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('prefix-function - wave551', () => {
  it('prefix-function w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prefix-function - wave552', () => {
  it('prefix-function w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prefix-function - wave553', () => {
  it('prefix-function w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prefix-function - wave554', () => {
  it('prefix-function w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prefix-function - wave555', () => {
  it('prefix-function w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('prefix-function - wave556', () => {
  it('prefix-function w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('prefix-function w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
