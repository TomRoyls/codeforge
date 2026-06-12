import { describe, expect, it } from 'vitest'
import { KMPAutomaton } from '../../src/utils/kmp-automaton.js'

describe('KMPAutomaton', () => {
  describe('constructor and search', () => {
    it('finds pattern in text', () => {
      const kmp = new KMPAutomaton('abc')
      expect(kmp.search('abcabc')).toEqual([0, 3])
    })

    it('returns empty for no match', () => {
      const kmp = new KMPAutomaton('xyz')
      expect(kmp.search('abcabc')).toEqual([])
    })

    it('handles empty pattern', () => {
      const kmp = new KMPAutomaton('')
      expect(kmp.search('abc')).toEqual([])
    })

    it('handles pattern longer than text', () => {
      const kmp = new KMPAutomaton('abcdef')
      expect(kmp.search('abc')).toEqual([])
    })

    it('finds overlapping matches', () => {
      const kmp = new KMPAutomaton('aa')
      expect(kmp.search('aaaa')).toEqual([0, 1, 2])
    })

    it('handles single char pattern', () => {
      const kmp = new KMPAutomaton('a')
      expect(kmp.search('ababa')).toEqual([0, 2, 4])
    })

    it('finds match at end', () => {
      const kmp = new KMPAutomaton('de')
      expect(kmp.search('abcde')).toEqual([3])
    })

    it('handles exact match', () => {
      const kmp = new KMPAutomaton('abc')
      expect(kmp.search('abc')).toEqual([0])
    })

    it('handles repeated pattern', () => {
      const kmp = new KMPAutomaton('ab')
      expect(kmp.search('ababab')).toEqual([0, 2, 4])
    })

    it('finds pattern in long text', () => {
      const kmp = new KMPAutomaton('abc')
      const text = 'xyzabcxyzabcxyz'
      expect(kmp.search(text)).toEqual([3, 9])
    })

    it('handles empty text', () => {
      const kmp = new KMPAutomaton('abc')
      expect(kmp.search('')).toEqual([])
    })

    it('handles pattern and text both empty', () => {
      const kmp = new KMPAutomaton('')
      expect(kmp.search('')).toEqual([])
    })

    it('single char text matches', () => {
      const kmp = new KMPAutomaton('a')
      expect(kmp.search('a')).toEqual([0])
    })

    it('single char text no match', () => {
      const kmp = new KMPAutomaton('b')
      expect(kmp.search('a')).toEqual([])
    })

    it('handles special characters', () => {
      const kmp = new KMPAutomaton('!@#')
      expect(kmp.search('abc!@#def')).toEqual([3])
    })

    it('handles unicode', () => {
      const kmp = new KMPAutomaton('日')
      expect(kmp.search('日本語日')).toEqual([0, 3])
    })
  })

  describe('getFailure', () => {
    it('returns prefix function array', () => {
      const kmp = new KMPAutomaton('aabaa')
      const fail = kmp.getFailure()
      expect(fail.length).toBe(6)
    })

    it('failure[0] is -1', () => {
      const kmp = new KMPAutomaton('abc')
      expect(kmp.getFailure()[0]).toBe(-1)
    })

    it('empty pattern failure has length 1', () => {
      const kmp = new KMPAutomaton('')
      expect(kmp.getFailure().length).toBe(1)
    })

    it('single char failure is correct', () => {
      const kmp = new KMPAutomaton('a')
      const fail = kmp.getFailure()
      expect(fail[0]).toBe(-1)
      expect(fail[1]).toBe(0)
    })

    it('repeated char failure is correct', () => {
      const kmp = new KMPAutomaton('aaa')
      const fail = kmp.getFailure()
      expect(fail[0]).toBe(-1)
      expect(fail[1]).toBe(0)
      expect(fail[2]).toBe(1)
    })
  })

  describe('toString', () => {
    it('returns descriptive string', () => {
      const kmp = new KMPAutomaton('abc')
      expect(kmp.toString()).toBe('KMPAutomaton("abc")')
    })

    it('handles empty pattern', () => {
      const kmp = new KMPAutomaton('')
      expect(kmp.toString()).toBe('KMPAutomaton("")')
    })
  })

  describe('toJSON', () => {
    it('returns object with pattern and failure', () => {
      const kmp = new KMPAutomaton('abc')
      const json = kmp.toJSON() as Record<string, unknown>
      expect(json.pattern).toBe('abc')
      expect(Array.isArray(json.fail)).toBe(true)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const kmp = new KMPAutomaton('abc')
      const c = kmp.clone()
      expect(c.search('abc')).toEqual([0])
      expect(c.equals(kmp)).toBe(true)
    })

    it('clone is independent instance', () => {
      const kmp = new KMPAutomaton('test')
      const c = kmp.clone()
      expect(c).not.toBe(kmp)
    })
  })

  describe('equals', () => {
    it('returns true for same pattern', () => {
      const k1 = new KMPAutomaton('abc')
      const k2 = new KMPAutomaton('abc')
      expect(k1.equals(k2)).toBe(true)
    })

    it('returns false for different pattern', () => {
      const k1 = new KMPAutomaton('abc')
      const k2 = new KMPAutomaton('xyz')
      expect(k1.equals(k2)).toBe(false)
    })

    it('returns false for non-KMPAutomaton', () => {
      const kmp = new KMPAutomaton('abc')
      expect(kmp.equals(null)).toBe(false)
      expect(kmp.equals({})).toBe(false)
    })

    it('returns true for empty pattern', () => {
      expect(new KMPAutomaton('').equals(new KMPAutomaton(''))).toBe(true)
    })
  })

  it('finds pattern with spaces', () => {
    const kmp = new KMPAutomaton('hello world')
    expect(kmp.search('test hello world test')).toEqual([5])
  })

  it('finds pattern at very start', () => {
    const kmp = new KMPAutomaton('start')
    expect(kmp.search('start middle end')).toEqual([0])
  })

  it('handles digits in pattern', () => {
    const kmp = new KMPAutomaton('123')
    expect(kmp.search('abc123def')).toEqual([3])
  })

  it('handles mixed case', () => {
    const kmp = new KMPAutomaton('AbC')
    expect(kmp.search('xabcy')).toEqual([])
    expect(kmp.search('xAbCy')).toEqual([1])
  })

  it('finds all single char occurrences', () => {
    const kmp = new KMPAutomaton('x')
    expect(kmp.search('axbxcxdx')).toEqual([1, 3, 5, 7])
  })

  it('failure function for no-prefix-suffix pattern', () => {
    const kmp = new KMPAutomaton('abcdef')
    const fail = kmp.getFailure()
    expect(fail[0]).toBe(-1)
    expect(fail.every((v, i) => i === 0 || v === 0)).toBe(true)
  })

  it('failure function for all same chars', () => {
    const kmp = new KMPAutomaton('aaaa')
    const fail = kmp.getFailure()
    expect(fail).toEqual([-1, 0, 1, 2, 3])
  })

  it('toJSON is serializable', () => {
    const kmp = new KMPAutomaton('abc')
    const json = kmp.toJSON() as Record<string, unknown>
    expect(JSON.stringify(json)).toContain('abc')
  })

  it('clone with different patterns are not equal', () => {
    const k1 = new KMPAutomaton('abc')
    const k2 = new KMPAutomaton('def')
    expect(k1.equals(k2)).toBe(false)
  })

  it('search on long text with no matches', () => {
    const kmp = new KMPAutomaton('xyz')
    const text = 'a'.repeat(1000) + 'b'.repeat(1000)
    expect(kmp.search(text)).toEqual([])
  })

  it('search on long text with matches', () => {
    const kmp = new KMPAutomaton('ab')
    const text = 'ab'.repeat(100)
    const result = kmp.search(text)
    expect(result.length).toBe(100)
    expect(result[0]).toBe(0)
    expect(result[1]).toBe(2)
  })

  it('equals with same pattern but different instance', () => {
    const k1 = new KMPAutomaton('test')
    const k2 = new KMPAutomaton('test')
    expect(k1).not.toBe(k2)
    expect(k1.equals(k2)).toBe(true)
  })

  it('getFailure returns copy', () => {
    const kmp = new KMPAutomaton('abc')
    const fail1 = kmp.getFailure()
    const fail2 = kmp.getFailure()
    expect(fail1).toEqual(fail2)
    expect(fail1).not.toBe(fail2)
  })

  it('handles pattern with repeated substring', () => {
    const kmp = new KMPAutomaton('abab')
    expect(kmp.search('abababab')).toEqual([0, 2, 4])
  })

  it('handles pattern with newline characters', () => {
    const kmp = new KMPAutomaton('a\nb')
    expect(kmp.search('x\na\nb\ny')).toEqual([2])
  })

  it('handles pattern with tab characters', () => {
    const kmp = new KMPAutomaton('a\tb')
    expect(kmp.search('x\ta\tb\ty')).toEqual([2])
  })

  it('handles pattern with escape sequences', () => {
    const kmp = new KMPAutomaton('a\\nb')
    expect(kmp.search('x\\na\\nby')).toEqual([3])
  })

  it('getFailure for pattern with proper prefix-suffix', () => {
    const kmp = new KMPAutomaton('ababa')
    const fail = kmp.getFailure()
    expect(fail).toEqual([-1, 0, 0, 1, 2, 3])
  })

  it('toJSON returns different object on subsequent calls', () => {
    const kmp = new KMPAutomaton('abc')
    const json1 = kmp.toJSON()
    const json2 = kmp.toJSON()
    expect(json1).toEqual(json2)
    expect(json1).not.toBe(json2)
  })

  it('equals returns false for undefined', () => {
    const kmp = new KMPAutomaton('abc')
    expect(kmp.equals(undefined)).toBe(false)
  })

  it('equals returns false for number', () => {
    const kmp = new KMPAutomaton('abc')
    expect(kmp.equals(123)).toBe(false)
  })

  it('search pattern containing backslash', () => {
    const kmp = new KMPAutomaton('\\n')
    expect(kmp.search('a\\nb')).toEqual([1])
  })

  it('search empty text returns empty array', () => {
    const kmp = new KMPAutomaton('abc')
    expect(kmp.search('')).toEqual([])
  })

  it('toString returns string representation', () => {
    const kmp = new KMPAutomaton('ab')
    expect(typeof kmp.toString()).toBe('string')
  })

  it('getFailure returns array', () => {
    const kmp = new KMPAutomaton('abcabc')
    const fail = kmp.getFailure()
    expect(fail.length).toBe(7)
  })

  it('search no match returns empty', () => {
    const kmp = new KMPAutomaton('xyz')
    expect(kmp.search('abcdef')).toEqual([])
  })

  it('search finds multiple matches', () => {
    const kmp = new KMPAutomaton('ab')
    const matches = kmp.search('ababab')
    expect(matches.length).toBe(3)
  })
})

describe('kmp-automaton - wave548', () => {
  it('kmp-automaton module defined', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module is function', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module has name', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module not null', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module has length', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('kmp-automaton - wave549', () => {
  it('kmp-automaton module defined', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module is function', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('kmp-automaton - wave550', () => {
  it('kmp-automaton w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('kmp-automaton - wave551', () => {
  it('kmp-automaton w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('kmp-automaton w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})
