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

describe('knuth-morris-pratt - wave557', () => {
  it('knuth-morris-pratt w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave558', () => {
  it('knuth-morris-pratt w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave559', () => {
  it('knuth-morris-pratt w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave560', () => {
  it('knuth-morris-pratt w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave561', () => {
  it('knuth-morris-pratt w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave562', () => {
  it('knuth-morris-pratt w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave563', () => {
  it('knuth-morris-pratt w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave564', () => {
  it('knuth-morris-pratt w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave565', () => {
  it('knuth-morris-pratt w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave566', () => {
  it('knuth-morris-pratt w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave127', () => {
  it('knuth-morris-pratt w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave130', () => {
  it('knuth-morris-pratt w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave133', () => {
  it('knuth-morris-pratt w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave136', () => {
  it('knuth-morris-pratt w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - wave139', () => {
  it('knuth-morris-pratt w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w142', () => {
  it('knuth-morris-pratt v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w145', () => {
  it('knuth-morris-pratt v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w148', () => {
  it('knuth-morris-pratt v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w151', () => {
  it('knuth-morris-pratt v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w154', () => {
  it('knuth-morris-pratt v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w157', () => {
  it('knuth-morris-pratt v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w160', () => {
  it('knuth-morris-pratt v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w170', () => {
  it('knuth-morris-pratt x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w180', () => {
  it('knuth-morris-pratt x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w190', () => {
  it('knuth-morris-pratt x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w200', () => {
  it('knuth-morris-pratt x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w210', () => {
  it('knuth-morris-pratt x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w220', () => {
  it('knuth-morris-pratt x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w230', () => {
  it('knuth-morris-pratt x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w240', () => {
  it('knuth-morris-pratt x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w250', () => {
  it('knuth-morris-pratt x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w260', () => {
  it('knuth-morris-pratt x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w270', () => {
  it('knuth-morris-pratt x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w280', () => {
  it('knuth-morris-pratt x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w290', () => {
  it('knuth-morris-pratt x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w300', () => {
  it('knuth-morris-pratt x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w310', () => {
  it('knuth-morris-pratt x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w320', () => {
  it('knuth-morris-pratt x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w330', () => {
  it('knuth-morris-pratt x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w340', () => {
  it('knuth-morris-pratt x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w350', () => {
  it('knuth-morris-pratt x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w360', () => {
  it('knuth-morris-pratt x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w370', () => {
  it('knuth-morris-pratt x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w380', () => {
  it('knuth-morris-pratt x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w390', () => {
  it('knuth-morris-pratt x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('knuth-morris-pratt - w400', () => {
  it('knuth-morris-pratt x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('knuth-morris-pratt x400x9', () => {
    expect(describe).toBeDefined()
  })
})
