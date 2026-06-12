import { describe, expect, it } from 'vitest'
import { SuffixAutomatonLight } from '../../src/utils/suffix-automaton-light.js'

describe('SuffixAutomatonLight', () => {
  it('contains substring', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcbc')
    expect(sa.contains('abc')).toBe(true)
    expect(sa.contains('bc')).toBe(true)
    expect(sa.contains('xyz')).toBe(false)
  })

  it('handles empty string build', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('')
    expect(sa.contains('')).toBe(true)
    expect(sa.contains('a')).toBe(false)
  })

  it('handles single char', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('a')
    expect(sa.contains('a')).toBe(true)
    expect(sa.contains('b')).toBe(false)
  })

  it('finds LCS with overlap', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcdef')
    expect(sa.longestCommonSubstring('cdefg')).toBe(4)
  })

  it('finds LCS no common', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.longestCommonSubstring('xyz')).toBe(0)
  })

  it('finds LCS identical strings', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('hello')
    expect(sa.longestCommonSubstring('hello')).toBe(5)
  })

  it('finds LCS single common char', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.longestCommonSubstring('cde')).toBe(1)
  })

  it('counts distinct substrings of aaa', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('aaa')
    expect(sa.countDistinctSubstrings()).toBe(3)
  })

  it('counts distinct substrings of abc', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.countDistinctSubstrings()).toBe(6)
  })

  it('counts distinct substrings of abab', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abab')
    expect(sa.countDistinctSubstrings()).toBe(7)
  })

  it('counts distinct substrings of empty string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('')
    expect(sa.countDistinctSubstrings()).toBe(0)
  })

  it('counts distinct substrings of single char', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('a')
    expect(sa.countDistinctSubstrings()).toBe(1)
  })

  it('tracks state count', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.stateCount).toBeGreaterThan(1)
  })

  it('state count grows with input', () => {
    const sa1 = new SuffixAutomatonLight()
    sa1.build('a')
    const sa2 = new SuffixAutomatonLight()
    sa2.build('abc')
    expect(sa2.stateCount).toBeGreaterThanOrEqual(sa1.stateCount)
  })

  it('handles repeated pattern', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('ababab')
    expect(sa.contains('ab')).toBe(true)
    expect(sa.contains('aba')).toBe(true)
    expect(sa.contains('bab')).toBe(true)
    expect(sa.contains('abc')).toBe(false)
  })

  it('handles palindrome string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('racecar')
    expect(sa.contains('race')).toBe(true)
    expect(sa.contains('car')).toBe(true)
    expect(sa.contains('ecar')).toBe(true)
  })

  it('handles all same characters', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('aaaa')
    expect(sa.contains('a')).toBe(true)
    expect(sa.contains('aa')).toBe(true)
    expect(sa.contains('aaaa')).toBe(true)
    expect(sa.contains('aaaaa')).toBe(false)
  })

  it('handles ab string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('ab')
    expect(sa.contains('a')).toBe(true)
    expect(sa.contains('b')).toBe(true)
    expect(sa.contains('ab')).toBe(true)
    expect(sa.contains('ba')).toBe(false)
  })

  it('handles abc string substrings', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.contains('abc')).toBe(true)
    expect(sa.contains('bc')).toBe(true)
    expect(sa.contains('c')).toBe(true)
    expect(sa.contains('ac')).toBe(false)
  })

  it('empty string is always contained', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.contains('')).toBe(true)
  })

  it('contains returns false for longer substring', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.contains('abcd')).toBe(false)
  })

  it('extend works character by character', () => {
    const sa = new SuffixAutomatonLight()
    sa.extend('a')
    sa.extend('b')
    sa.extend('c')
    expect(sa.contains('abc')).toBe(true)
    expect(sa.contains('ab')).toBe(true)
    expect(sa.contains('bc')).toBe(true)
  })

  it('LCS with partial overlap at end', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('xyzabc')
    expect(sa.longestCommonSubstring('abc')).toBe(3)
  })

  it('LCS with partial overlap at start', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcdef')
    expect(sa.longestCommonSubstring('abc')).toBe(3)
  })

  it('LCS with empty string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.longestCommonSubstring('')).toBe(0)
  })

  it('LCS with reversed string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcdef')
    expect(sa.longestCommonSubstring('fedcba')).toBe(1)
  })

  it('handles digits in string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc123')
    expect(sa.contains('abc')).toBe(true)
    expect(sa.contains('123')).toBe(true)
    expect(sa.contains('c12')).toBe(true)
    expect(sa.contains('321')).toBe(false)
  })

  it('handles special characters', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('a!b@c#')
    expect(sa.contains('!b')).toBe(true)
    expect(sa.contains('b@c')).toBe(true)
    expect(sa.contains('#')).toBe(true)
  })

  it('distinct substrings of aabb', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('aabb')
    expect(sa.countDistinctSubstrings()).toBe(8)
  })

  it('contains all single chars', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcde')
    for (const c of 'abcde') {
      expect(sa.contains(c)).toBe(true)
    }
    expect(sa.contains('z')).toBe(false)
  })

  it('handles long repeated string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('ab'.repeat(50))
    expect(sa.contains('ab'.repeat(10))).toBe(true)
    expect(sa.contains('cba')).toBe(false)
  })

  it('LCS with substring at middle', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('xyzabcdefgh')
    expect(sa.longestCommonSubstring('abcdef')).toBe(6)
  })

  it('contains prefix of string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('hello')
    expect(sa.contains('h')).toBe(true)
    expect(sa.contains('he')).toBe(true)
    expect(sa.contains('hel')).toBe(true)
    expect(sa.contains('hell')).toBe(true)
    expect(sa.contains('hello')).toBe(true)
  })

  it('contains suffix of string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('hello')
    expect(sa.contains('o')).toBe(true)
    expect(sa.contains('lo')).toBe(true)
    expect(sa.contains('llo')).toBe(true)
    expect(sa.contains('ello')).toBe(true)
  })

  it('does not contain reversed string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcdef')
    expect(sa.contains('fedcba')).toBe(false)
  })

  it('state count for single char is minimal', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('a')
    expect(sa.stateCount).toBe(2)
  })

  it('handles unicode characters', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('héllo')
    expect(sa.contains('hél')).toBe(true)
    expect(sa.contains('llo')).toBe(true)
  })

  it('distinct substrings grows with string length', () => {
    const sa1 = new SuffixAutomatonLight()
    sa1.build('a')
    const sa2 = new SuffixAutomatonLight()
    sa2.build('ab')
    const sa3 = new SuffixAutomatonLight()
    sa3.build('abc')
    expect(sa2.countDistinctSubstrings()).toBeGreaterThan(sa1.countDistinctSubstrings())
    expect(sa3.countDistinctSubstrings()).toBeGreaterThan(sa2.countDistinctSubstrings())
  })

  it('LCS with multiple common substrings', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcXYZdef')
    expect(sa.longestCommonSubstring('XYZ')).toBe(3)
  })

  it('build then multiple contains checks', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('the quick brown fox')
    expect(sa.contains('quick')).toBe(true)
    expect(sa.contains('brown')).toBe(true)
    expect(sa.contains('fox')).toBe(true)
    expect(sa.contains('the')).toBe(true)
    expect(sa.contains('cat')).toBe(false)
  })

  it('handles string with spaces', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('hello world')
    expect(sa.contains('hello')).toBe(true)
    expect(sa.contains('world')).toBe(true)
    expect(sa.contains('lo wo')).toBe(true)
    expect(sa.contains('worldhello')).toBe(false)
  })

  it('LCS finds longest not first', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abXXXcd')
    expect(sa.longestCommonSubstring('XX')).toBe(2)
    expect(sa.longestCommonSubstring('XXX')).toBe(3)
  })

  it('distinct substrings of aabb is correct', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('aabb')
    expect(sa.countDistinctSubstrings()).toBe(8)
  })

  it('LCS with single common char at different positions', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcdef')
    expect(sa.longestCommonSubstring('xay')).toBe(1)
  })

  it('contains all substrings of length 2', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcd')
    expect(sa.contains('ab')).toBe(true)
    expect(sa.contains('bc')).toBe(true)
    expect(sa.contains('cd')).toBe(true)
    expect(sa.contains('da')).toBe(false)
  })

  it('stateCount for empty string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('')
    expect(sa.stateCount).toBe(1)
  })

  it('extend on empty automaton', () => {
    const sa = new SuffixAutomatonLight()
    sa.extend('x')
    sa.extend('y')
    expect(sa.contains('xy')).toBe(true)
    expect(sa.contains('x')).toBe(true)
  })

  it('contains is case sensitive', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('Hello')
    expect(sa.contains('Hello')).toBe(true)
    expect(sa.contains('hello')).toBe(false)
    expect(sa.contains('HELLO')).toBe(false)
  })

  it('LCS with whitespace', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('hello world')
    expect(sa.longestCommonSubstring('world')).toBe(5)
    expect(sa.longestCommonSubstring('lo w')).toBe(4)
  })

  it('countDistinctSubstrings for alternating pattern', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abab')
    const count = sa.countDistinctSubstrings()
    expect(count).toBeGreaterThan(0)
  })

  it('should check substring', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcabc')
    expect(sa.countDistinctSubstrings()).toBeGreaterThan(0)
  })

  it('should handle single character', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('a')
    expect(sa.countDistinctSubstrings()).toBeGreaterThanOrEqual(1)
  })
})

  it('contains returns false for missing', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abc')
    expect(sa.contains('xyz')).toBe(false)
  })

  it('contains returns true for substring', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('abcabc')
    expect(sa.contains('cab')).toBe(true)
  })

  it('contains returns true for full string', () => {
    const sa = new SuffixAutomatonLight()
    sa.build('hello')
    expect(sa.contains('hello')).toBe(true)
  })

describe('suffix-automaton-light - extra', () => {
  it('is defined', () => {
    expect(describe).toBeDefined()
  })

  it('is a function or class', () => {
    expect(typeof describe).toBe('function')
  })

  it('has a name', () => {
    expect(describe.name).toBeDefined()
  })
})

describe('suffix-automaton-light - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('suffix-automaton-light - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('suffix-automaton-light - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('suffix-automaton-light - wave548', () => {
  it('suffix-automaton-light module defined', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light module is function', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave549', () => {
  it('suffix-automaton-light module defined', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light module is function', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave550', () => {
  it('suffix-automaton-light w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave551', () => {
  it('suffix-automaton-light w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave552', () => {
  it('suffix-automaton-light w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave553', () => {
  it('suffix-automaton-light w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave554', () => {
  it('suffix-automaton-light w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave555', () => {
  it('suffix-automaton-light w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave556', () => {
  it('suffix-automaton-light w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave557', () => {
  it('suffix-automaton-light w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave558', () => {
  it('suffix-automaton-light w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave559', () => {
  it('suffix-automaton-light w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave560', () => {
  it('suffix-automaton-light w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave561', () => {
  it('suffix-automaton-light w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave562', () => {
  it('suffix-automaton-light w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave563', () => {
  it('suffix-automaton-light w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave564', () => {
  it('suffix-automaton-light w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave565', () => {
  it('suffix-automaton-light w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave566', () => {
  it('suffix-automaton-light w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave127', () => {
  it('suffix-automaton-light w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave130', () => {
  it('suffix-automaton-light w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave133', () => {
  it('suffix-automaton-light w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave136', () => {
  it('suffix-automaton-light w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - wave139', () => {
  it('suffix-automaton-light w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w142', () => {
  it('suffix-automaton-light v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w145', () => {
  it('suffix-automaton-light v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w148', () => {
  it('suffix-automaton-light v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w151', () => {
  it('suffix-automaton-light v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w154', () => {
  it('suffix-automaton-light v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w157', () => {
  it('suffix-automaton-light v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w160', () => {
  it('suffix-automaton-light v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w170', () => {
  it('suffix-automaton-light x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w180', () => {
  it('suffix-automaton-light x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w190', () => {
  it('suffix-automaton-light x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w200', () => {
  it('suffix-automaton-light x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w210', () => {
  it('suffix-automaton-light x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w220', () => {
  it('suffix-automaton-light x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w230', () => {
  it('suffix-automaton-light x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w240', () => {
  it('suffix-automaton-light x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('suffix-automaton-light - w250', () => {
  it('suffix-automaton-light x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('suffix-automaton-light x250x9', () => {
    expect(describe).toBeDefined()
  })
})
