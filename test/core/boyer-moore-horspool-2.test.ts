import { describe, it, expect } from 'vitest'
import { BoyerMooreHorspool2 } from '../../src/core/boyer-moore-horspool-2/index.js'

// ─── Constructor ───

describe('BoyerMooreHorspool2 - Constructor', () => {
  it('should store the pattern', () => {
    const bmh = new BoyerMooreHorspool2('abc')
    expect(bmh.pattern()).toBe('abc')
  })

  it('should accept a single character pattern', () => {
    const bmh = new BoyerMooreHorspool2('x')
    expect(bmh.pattern()).toBe('x')
  })

  it('should accept an empty string pattern', () => {
    const bmh = new BoyerMooreHorspool2('')
    expect(bmh.pattern()).toBe('')
  })

  it('should accept a long pattern', () => {
    const pattern = 'thequickbrownfoxjumpsoverthelazydog'
    const bmh = new BoyerMooreHorspool2(pattern)
    expect(bmh.pattern()).toBe(pattern)
  })
})

// ─── search ───

describe('BoyerMooreHorspool2 - search', () => {
  it('should find a single occurrence', () => {
    const bmh = new BoyerMooreHorspool2('abc')
    expect(bmh.search('xyzabcdef')).toEqual([3])
  })

  it('should find multiple occurrences', () => {
    const bmh = new BoyerMooreHorspool2('ab')
    expect(bmh.search('ababab')).toEqual([0, 2, 4])
  })

  it('should return empty array when no match', () => {
    const bmh = new BoyerMooreHorspool2('xyz')
    expect(bmh.search('abcdef')).toEqual([])
  })

  it('should find pattern at start of text', () => {
    const bmh = new BoyerMooreHorspool2('hello')
    expect(bmh.search('hello world')).toEqual([0])
  })

  it('should find pattern at end of text', () => {
    const bmh = new BoyerMooreHorspool2('world')
    expect(bmh.search('hello world')).toEqual([6])
  })

  it('should return empty for empty pattern', () => {
    const bmh = new BoyerMooreHorspool2('')
    expect(bmh.search('hello')).toEqual([])
  })

  it('should return empty for empty text', () => {
    const bmh = new BoyerMooreHorspool2('abc')
    expect(bmh.search('')).toEqual([])
  })

  it('should return empty when pattern is longer than text', () => {
    const bmh = new BoyerMooreHorspool2('abcdef')
    expect(bmh.search('abc')).toEqual([])
  })

  it('should find single character matches', () => {
    const bmh = new BoyerMooreHorspool2('a')
    expect(bmh.search('banana')).toEqual([1, 3, 5])
  })

  it('should handle overlapping matches', () => {
    const bmh = new BoyerMooreHorspool2('aa')
    expect(bmh.search('aaaa')).toEqual([0, 1, 2])
  })

  it('should find exact match when pattern equals text', () => {
    const bmh = new BoyerMooreHorspool2('exact')
    expect(bmh.search('exact')).toEqual([0])
  })

  it('should handle repeated characters in pattern', () => {
    const bmh = new BoyerMooreHorspool2('aaa')
    expect(bmh.search('aaaaa')).toEqual([0, 1, 2])
  })

  it('should handle text with special characters', () => {
    const bmh = new BoyerMooreHorspool2('!')
    expect(bmh.search('a!b!c')).toEqual([1, 3])
  })
})

// ─── findFirst ───

describe('BoyerMooreHorspool2 - findFirst', () => {
  it('should return index of first match', () => {
    const bmh = new BoyerMooreHorspool2('ab')
    expect(bmh.findFirst('ababab')).toBe(0)
  })

  it('should return -1 when no match', () => {
    const bmh = new BoyerMooreHorspool2('xyz')
    expect(bmh.findFirst('abcdef')).toBe(-1)
  })

  it('should return 0 when pattern matches at start', () => {
    const bmh = new BoyerMooreHorspool2('start')
    expect(bmh.findFirst('start here')).toBe(0)
  })

  it('should return correct index for match in middle', () => {
    const bmh = new BoyerMooreHorspool2('mid')
    expect(bmh.findFirst('xmidy')).toBe(1)
  })

  it('should return -1 for empty text', () => {
    const bmh = new BoyerMooreHorspool2('abc')
    expect(bmh.findFirst('')).toBe(-1)
  })
})

// ─── hasMatch ───

describe('BoyerMooreHorspool2 - hasMatch', () => {
  it('should return true when match exists', () => {
    const bmh = new BoyerMooreHorspool2('test')
    expect(bmh.hasMatch('this is a test')).toBe(true)
  })

  it('should return false when no match', () => {
    const bmh = new BoyerMooreHorspool2('missing')
    expect(bmh.hasMatch('nothing here')).toBe(false)
  })

  it('should return false for empty text', () => {
    const bmh = new BoyerMooreHorspool2('abc')
    expect(bmh.hasMatch('')).toBe(false)
  })

  it('should return false for empty pattern', () => {
    const bmh = new BoyerMooreHorspool2('')
    expect(bmh.hasMatch('hello')).toBe(false)
  })
})

// ─── pattern ───

describe('BoyerMooreHorspool2 - pattern', () => {
  it('should return the original pattern', () => {
    const bmh = new BoyerMooreHorspool2('findme')
    expect(bmh.pattern()).toBe('findme')
  })
})
