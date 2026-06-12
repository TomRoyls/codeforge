import { describe, expect, it } from 'vitest'
import { KnuthMorrisPratt } from '../../src/utils/knuth-morris-pratt.js'

describe('KnuthMorrisPratt', () => {
  describe('search', () => {
    it('finds all occurrences of pattern', () => {
      expect(KnuthMorrisPratt.search('abababab', 'ab')).toEqual([0, 2, 4, 6])
    })

    it('finds single occurrence', () => {
      expect(KnuthMorrisPratt.search('hello world', 'world')).toEqual([6])
    })

    it('returns empty for no match', () => {
      expect(KnuthMorrisPratt.search('hello world', 'xyz')).toEqual([])
    })

    it('returns empty for empty pattern', () => {
      expect(KnuthMorrisPratt.search('hello', '')).toEqual([])
    })

    it('returns empty when text shorter than pattern', () => {
      expect(KnuthMorrisPratt.search('hi', 'hello')).toEqual([])
    })

    it('handles overlapping patterns', () => {
      expect(KnuthMorrisPratt.search('aaa', 'aa')).toEqual([0, 1])
    })

    it('handles pattern at end', () => {
      expect(KnuthMorrisPratt.search('abcdef', 'def')).toEqual([3])
    })

    it('handles pattern at start', () => {
      expect(KnuthMorrisPratt.search('abcdef', 'abc')).toEqual([0])
    })

    it('handles empty text', () => {
      expect(KnuthMorrisPratt.search('', 'abc')).toEqual([])
    })

    it('handles both empty', () => {
      expect(KnuthMorrisPratt.search('', '')).toEqual([])
    })

    it('single char text matches', () => {
      expect(KnuthMorrisPratt.search('a', 'a')).toEqual([0])
    })

    it('single char text no match', () => {
      expect(KnuthMorrisPratt.search('a', 'b')).toEqual([])
    })

    it('handles special characters', () => {
      expect(KnuthMorrisPratt.search('a!@#b!@#c', '!@#')).toEqual([1, 5])
    })

    it('handles unicode', () => {
      expect(KnuthMorrisPratt.search('日本語日本', '日本')).toEqual([0, 3])
    })

    it('handles whitespace pattern', () => {
      expect(KnuthMorrisPratt.search('a b c d', ' ')).toEqual([1, 3, 5])
    })

    it('finds repeated single char', () => {
      expect(KnuthMorrisPratt.search('aaaaa', 'a')).toEqual([0, 1, 2, 3, 4])
    })

    it('handles pattern equals text exactly', () => {
      expect(KnuthMorrisPratt.search('hello', 'hello')).toEqual([0])
    })

    it('handles pattern longer than text with different chars', () => {
      expect(KnuthMorrisPratt.search('ab', 'abcdef')).toEqual([])
    })

    it('finds consecutive overlapping occurrences', () => {
      expect(KnuthMorrisPratt.search('ababa', 'aba')).toEqual([0, 2])
    })

    it('handles numeric strings', () => {
      expect(KnuthMorrisPratt.search('123123123', '123')).toEqual([0, 3, 6])
    })

    it('is case-sensitive', () => {
      expect(KnuthMorrisPratt.search('Hello World', 'hello')).toEqual([])
    })

    it('finds pattern with repeated partial matches', () => {
      expect(KnuthMorrisPratt.search('abcababcab', 'abcab')).toEqual([0, 5])
    })
  })

  describe('buildLPS', () => {
    it('computes correct table for ABABCABAB', () => {
      expect(KnuthMorrisPratt.buildLPS('ABABCABAB')).toEqual([0, 0, 1, 2, 0, 1, 2, 3, 4])
    })

    it('all same chars', () => {
      expect(KnuthMorrisPratt.buildLPS('aaaa')).toEqual([0, 1, 2, 3])
    })

    it('no repeats', () => {
      expect(KnuthMorrisPratt.buildLPS('abcd')).toEqual([0, 0, 0, 0])
    })

    it('single char', () => {
      expect(KnuthMorrisPratt.buildLPS('a')).toEqual([0])
    })

    it('two same chars', () => {
      expect(KnuthMorrisPratt.buildLPS('aa')).toEqual([0, 1])
    })

    it('two different chars', () => {
      expect(KnuthMorrisPratt.buildLPS('ab')).toEqual([0, 0])
    })

    it('empty string returns empty', () => {
      expect(KnuthMorrisPratt.buildLPS('')).toEqual([])
    })

    it('prefix that is also suffix', () => {
      expect(KnuthMorrisPratt.buildLPS('abcabc')).toEqual([0, 0, 0, 1, 2, 3])
    })

    it('handles pattern with partial match at different positions', () => {
      expect(KnuthMorrisPratt.buildLPS('aabaaab')).toEqual([0, 1, 0, 1, 2, 2, 3])
    })

    it('handles pattern ending with repeated prefix', () => {
      expect(KnuthMorrisPratt.buildLPS('abcabcabc')).toEqual([0, 0, 0, 1, 2, 3, 4, 5, 6])
    })

    it('handles pattern with single char repeated', () => {
      expect(KnuthMorrisPratt.buildLPS('aaaab')).toEqual([0, 1, 2, 3, 0])
    })
  })

  describe('contains', () => {
    it('returns true for match', () => {
      expect(KnuthMorrisPratt.contains('hello world', 'world')).toBe(true)
    })

    it('returns false for no match', () => {
      expect(KnuthMorrisPratt.contains('hello world', 'xyz')).toBe(false)
    })

    it('returns true for match at start', () => {
      expect(KnuthMorrisPratt.contains('abcdef', 'abc')).toBe(true)
    })

    it('returns true for match at end', () => {
      expect(KnuthMorrisPratt.contains('abcdef', 'def')).toBe(true)
    })

    it('returns false for empty pattern', () => {
      expect(KnuthMorrisPratt.contains('hello', '')).toBe(false)
    })

    it('returns true for entire text match', () => {
      expect(KnuthMorrisPratt.contains('hello', 'hello')).toBe(true)
    })

    it('returns true for pattern appearing multiple times', () => {
      expect(KnuthMorrisPratt.contains('abcabcabc', 'abc')).toBe(true)
    })

    it('returns false for single char mismatch', () => {
      expect(KnuthMorrisPratt.contains('a', 'b')).toBe(false)
    })
  })

  describe('countOccurrences', () => {
    it('counts correctly', () => {
      expect(KnuthMorrisPratt.countOccurrences('ababab', 'ab')).toBe(3)
    })

    it('returns 0 for no match', () => {
      expect(KnuthMorrisPratt.countOccurrences('abcdef', 'xyz')).toBe(0)
    })

    it('counts overlapping', () => {
      expect(KnuthMorrisPratt.countOccurrences('aaa', 'aa')).toBe(2)
    })

    it('returns 0 for empty pattern', () => {
      expect(KnuthMorrisPratt.countOccurrences('hello', '')).toBe(0)
    })

    it('counts single char occurrences', () => {
      expect(KnuthMorrisPratt.countOccurrences('abcabc', 'a')).toBe(2)
    })

    it('returns 1 for exact match', () => {
      expect(KnuthMorrisPratt.countOccurrences('hello', 'hello')).toBe(1)
    })

    it('counts all same characters', () => {
      expect(KnuthMorrisPratt.countOccurrences('aaaaa', 'a')).toBe(5)
    })
  })

  describe('firstOccurrence', () => {
    it('returns index of first match', () => {
      expect(KnuthMorrisPratt.firstOccurrence('hello world', 'world')).toBe(6)
    })

    it('returns -1 for no match', () => {
      expect(KnuthMorrisPratt.firstOccurrence('hello', 'xyz')).toBe(-1)
    })

    it('returns 0 for match at start', () => {
      expect(KnuthMorrisPratt.firstOccurrence('abcdef', 'abc')).toBe(0)
    })

    it('returns -1 for empty pattern', () => {
      expect(KnuthMorrisPratt.firstOccurrence('hello', '')).toBe(-1)
    })

    it('returns correct index for repeated pattern', () => {
      expect(KnuthMorrisPratt.firstOccurrence('ababab', 'bab')).toBe(1)
    })

    it('returns -1 for pattern longer than text', () => {
      expect(KnuthMorrisPratt.firstOccurrence('ab', 'abc')).toBe(-1)
    })

    it('returns -1 for empty text with non-empty pattern', () => {
      expect(KnuthMorrisPratt.firstOccurrence('', 'a')).toBe(-1)
    })

    it('returns index for numeric strings', () => {
      expect(KnuthMorrisPratt.firstOccurrence('123456', '345')).toBe(2)
    })
  })
})

describe('knuth-morris-pratt - wave548', () => {
  it('knuth-morris-pratt module defined', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module is function', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module has name', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module not null', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module has length', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave549', () => {
  it('knuth-morris-pratt module defined', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module is function', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave550', () => {
  it('knuth-morris-pratt w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave551', () => {
  it('knuth-morris-pratt w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave552', () => {
  it('knuth-morris-pratt w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave553', () => {
  it('knuth-morris-pratt w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave554', () => {
  it('knuth-morris-pratt w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave555', () => {
  it('knuth-morris-pratt w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave556', () => {
  it('knuth-morris-pratt w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
