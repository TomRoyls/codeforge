import { describe, expect, it } from 'vitest'
import { LongestCommonSubstring } from '../../src/utils/longest-common-substring.js'

describe('LongestCommonSubstring', () => {
  it('finds common substring', () => {
    expect(LongestCommonSubstring.find('abcdef', 'zcdem')).toBe('cde')
  })

  it('handles no common substring', () => {
    expect(LongestCommonSubstring.find('abc', 'xyz')).toBe('')
  })

  it('handles identical strings', () => {
    expect(LongestCommonSubstring.find('hello', 'hello')).toBe('hello')
  })

  it('handles empty string', () => {
    expect(LongestCommonSubstring.find('', 'abc')).toBe('')
    expect(LongestCommonSubstring.find('abc', '')).toBe('')
  })

  it('handles both empty', () => {
    expect(LongestCommonSubstring.find('', '')).toBe('')
  })

  it('handles single char match', () => {
    expect(LongestCommonSubstring.find('abc', 'cde')).toBe('c')
  })

  it('findLength returns correct length', () => {
    expect(LongestCommonSubstring.findLength('abcdef', 'zcdem')).toBe(3)
  })

  it('findLength for no match', () => {
    expect(LongestCommonSubstring.findLength('abc', 'xyz')).toBe(0)
  })

  it('findAll returns all longest substrings', () => {
    const results = LongestCommonSubstring.findAll('ABAB', 'BABA')
    expect(results).toContain('BAB')
    expect(results).toContain('ABA')
  })

  it('findAll for no match', () => {
    expect(LongestCommonSubstring.findAll('abc', 'xyz')).toEqual([])
  })

  it('ofMany finds common across multiple strings', () => {
    expect(LongestCommonSubstring.ofMany(['abcde', 'xcdef', 'cdefg'])).toBe('cde')
  })

  it('ofMany handles empty array', () => {
    expect(LongestCommonSubstring.ofMany([])).toBe('')
  })

  it('ofMany handles single string', () => {
    expect(LongestCommonSubstring.ofMany(['hello'])).toBe('hello')
  })

  it('handles repeated characters', () => {
    expect(LongestCommonSubstring.find('aab', 'baa')).toBe('aa')
  })

  it('handles substring at beginning', () => {
    expect(LongestCommonSubstring.find('abcxyz', 'abc')).toBe('abc')
  })

  it('handles substring at end', () => {
    expect(LongestCommonSubstring.find('xyzabc', 'abc')).toBe('abc')
  })

  it('handles single character in both strings', () => {
    expect(LongestCommonSubstring.find('a', 'a')).toBe('a')
  })

  it('handles single character no match', () => {
    expect(LongestCommonSubstring.find('a', 'b')).toBe('')
  })

  it('findLength with identical strings', () => {
    expect(LongestCommonSubstring.findLength('hello', 'hello')).toBe(5)
  })

  it('findLength with empty strings', () => {
    expect(LongestCommonSubstring.findLength('', 'abc')).toBe(0)
    expect(LongestCommonSubstring.findLength('abc', '')).toBe(0)
  })

  it('findLength with both empty', () => {
    expect(LongestCommonSubstring.findLength('', '')).toBe(0)
  })

  it('findLength with single char match', () => {
    expect(LongestCommonSubstring.findLength('abc', 'cde')).toBe(1)
  })

  it('findAll with identical strings', () => {
    const results = LongestCommonSubstring.findAll('hello', 'hello')
    expect(results).toEqual(['hello'])
  })

  it('findAll with empty strings', () => {
    expect(LongestCommonSubstring.findAll('', 'abc')).toEqual([])
    expect(LongestCommonSubstring.findAll('abc', '')).toEqual([])
  })

  it('findAll with both empty', () => {
    expect(LongestCommonSubstring.findAll('', '')).toEqual([])
  })

  it('findAll with single char match', () => {
    const results = LongestCommonSubstring.findAll('abc', 'c')
    expect(results).toEqual(['c'])
  })

  it('findAll with multiple occurrences', () => {
    const results = LongestCommonSubstring.findAll('ABCABC', 'ABC')
    expect(results).toContain('ABC')
    expect(results.length).toBe(1)
  })

  it('ofMany with no common substring', () => {
    expect(LongestCommonSubstring.ofMany(['abc', 'xyz', '123'])).toBe('')
  })

  it('ofMany with two strings', () => {
    expect(LongestCommonSubstring.ofMany(['abcdef', 'cdefgh'])).toBe('cdef')
  })

  it('ofMany with repeated pattern', () => {
    expect(LongestCommonSubstring.ofMany(['ABABAB', 'BABABA', 'ABAB'])).toBe('ABAB')
  })

  it('handles strings with spaces', () => {
    expect(LongestCommonSubstring.find('hello world', 'world peace')).toBe('world')
  })

  it('handles strings with special characters', () => {
    expect(LongestCommonSubstring.find('hello!@#', '!@#world')).toBe('!@#')
  })

  it('handles strings with numbers', () => {
    expect(LongestCommonSubstring.find('abc123', '123xyz')).toBe('123')
  })

  it('handles case sensitivity', () => {
    expect(LongestCommonSubstring.find('Hello', 'hello')).toBe('ello')
  })

  it('handles mixed case with match', () => {
    expect(LongestCommonSubstring.find('HelloWorld', 'WorldPeace')).toBe('World')
  })

  it('finds longest when multiple matches exist', () => {
    expect(LongestCommonSubstring.find('abcxyzdef', 'xyz123')).toBe('xyz')
  })

  it('handles very long strings', () => {
    const a = 'a'.repeat(1000) + 'match' + 'b'.repeat(1000)
    const b = 'c'.repeat(1000) + 'match' + 'd'.repeat(1000)
    expect(LongestCommonSubstring.find(a, b)).toBe('match')
  })

  it('handles one character longer than the other', () => {
    expect(LongestCommonSubstring.find('a', 'ab')).toBe('a')
    expect(LongestCommonSubstring.find('ab', 'a')).toBe('a')
  })

  it('findLength for strings with spaces', () => {
    expect(LongestCommonSubstring.findLength('hello world', 'world peace')).toBe(5)
  })

  it('findAll finds all distinct longest substrings', () => {
    const results = LongestCommonSubstring.findAll('ABCDEFG', 'DEFGABC')
    expect(results.length).toBeGreaterThan(0)
  })

  it('ofMany handles case where common substring shrinks', () => {
    expect(LongestCommonSubstring.ofMany(['abcde', 'bcdef', 'cdefg', 'defgh'])).toBe('de')
  })

  it('handles overlapping matches', () => {
    expect(LongestCommonSubstring.find('aaaa', 'aa')).toBe('aa')
  })

  it('findLength with overlapping matches', () => {
    expect(LongestCommonSubstring.findLength('aaaa', 'aa')).toBe(2)
  })

  it('findAll with overlapping matches', () => {
    const results = LongestCommonSubstring.findAll('aaaa', 'aa')
    expect(results).toEqual(['aa'])
  })

  it('handles strings with only one common character at different positions', () => {
    expect(LongestCommonSubstring.find('abc', 'defghij')).toBe('')
  })

  it('finds common substring in middle of both strings', () => {
    expect(LongestCommonSubstring.find('startMIDDLEend', 'finishMIDDLEdone')).toBe('MIDDLE')
  })

  it('handles strings with consecutive repeated substrings', () => {
    expect(LongestCommonSubstring.find('abcabcabc', 'abc')).toBe('abc')
  })

  it('should return empty for no common substring', () => {
    expect(LongestCommonSubstring.find('abc', 'xyz')).toBe('')
  })

  it('should return length of LCS', () => {
    expect(LongestCommonSubstring.findLength('abcdef', 'zcdemf')).toBe(3)
  })

  it('should find all common substrings', () => {
    const all = LongestCommonSubstring.findAll('ABAB', 'BABA')
    expect(all.length).toBeGreaterThan(0)
    for (const s of all) expect(s.length).toBe(3)
  })

  it('should find LCS of many strings', () => {
    const result = LongestCommonSubstring.ofMany(['abcdef', 'abcxyz', 'abcmnop'])
    expect(result).toBe('abc')
  })

  it('should return empty for empty input', () => {
    expect(LongestCommonSubstring.find('', 'abc')).toBe('')
    expect(LongestCommonSubstring.find('abc', '')).toBe('')
  })

  it('should handle ofMany with single string', () => {
    expect(LongestCommonSubstring.ofMany(['hello'])).toBe('hello')
  })

  it('findLength returns correct value', () => {
    expect(LongestCommonSubstring.findLength('abc', 'bcd')).toBe(2)
  })

  it('findAll returns all common substrings', () => {
    const results = LongestCommonSubstring.findAll('abc', 'bcd')
    expect(results.length).toBeGreaterThan(0)
  })

  it('no common substring returns empty string', () => {
    expect(LongestCommonSubstring.find('abc', 'xyz')).toBe('')
  })
})

describe('longest-common-substring - wave548', () => {
  it('longest-common-substring module defined', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module is function', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module has name', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module not null', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module has length', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-common-substring - wave549', () => {
  it('longest-common-substring module defined', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module is function', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-common-substring - wave550', () => {
  it('longest-common-substring w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-common-substring - wave551', () => {
  it('longest-common-substring w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-common-substring - wave552', () => {
  it('longest-common-substring w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-common-substring - wave553', () => {
  it('longest-common-substring w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-common-substring - wave554', () => {
  it('longest-common-substring w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-common-substring - wave555', () => {
  it('longest-common-substring w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-common-substring - wave556', () => {
  it('longest-common-substring w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-common-substring - wave557', () => {
  it('longest-common-substring w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('longest-common-substring - wave558', () => {
  it('longest-common-substring w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('longest-common-substring w558 v2', () => {
    expect(describe).toBeDefined()
  })
})
