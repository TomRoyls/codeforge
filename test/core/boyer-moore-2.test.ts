import { describe, it, expect } from 'vitest'
import { BoyerMoore2 } from '../../src/core/boyer-moore-2/index.js'

// ─── Constructor ───

describe('BoyerMoore2 - Constructor', () => {
  it('should store the pattern', () => {
    const bm = new BoyerMoore2('abc')
    expect(bm.pattern()).toBe('abc')
  })

  it('should accept a single character pattern', () => {
    const bm = new BoyerMoore2('x')
    expect(bm.pattern()).toBe('x')
  })

  it('should accept an empty string pattern', () => {
    const bm = new BoyerMoore2('')
    expect(bm.pattern()).toBe('')
  })

  it('should accept a long pattern', () => {
    const pattern = 'abcdefghijklmnopqrstuvwxyz'.repeat(10)
    const bm = new BoyerMoore2(pattern)
    expect(bm.pattern()).toBe(pattern)
  })
})

// ─── search ───

describe('BoyerMoore2 - search', () => {
  it('should find a single occurrence', () => {
    const bm = new BoyerMoore2('abc')
    expect(bm.search('xyzabcdef')).toEqual([3])
  })

  it('should find multiple occurrences', () => {
    const bm = new BoyerMoore2('ab')
    expect(bm.search('ababab')).toEqual([0, 2, 4])
  })

  it('should return empty array when no match', () => {
    const bm = new BoyerMoore2('xyz')
    expect(bm.search('abcdef')).toEqual([])
  })

  it('should find pattern at start of text', () => {
    const bm = new BoyerMoore2('hello')
    expect(bm.search('hello world')).toEqual([0])
  })

  it('should find pattern at end of text', () => {
    const bm = new BoyerMoore2('world')
    expect(bm.search('hello world')).toEqual([6])
  })

  it('should return empty for empty pattern', () => {
    const bm = new BoyerMoore2('')
    expect(bm.search('hello')).toEqual([])
  })

  it('should return empty for empty text', () => {
    const bm = new BoyerMoore2('abc')
    expect(bm.search('')).toEqual([])
  })

  it('should return empty when pattern is longer than text', () => {
    const bm = new BoyerMoore2('abcdef')
    expect(bm.search('abc')).toEqual([])
  })

  it('should handle overlapping matches', () => {
    const bm = new BoyerMoore2('aa')
    expect(bm.search('aaaa')).toEqual([0, 1, 2])
  })

  it('should find single character matches', () => {
    const bm = new BoyerMoore2('a')
    expect(bm.search('banana')).toEqual([1, 3, 5])
  })

  it('should handle repeated characters in pattern', () => {
    const bm = new BoyerMoore2('aaa')
    expect(bm.search('aaaaa')).toEqual([0, 1, 2])
  })

  it('should find exact match when pattern equals text', () => {
    const bm = new BoyerMoore2('exact')
    expect(bm.search('exact')).toEqual([0])
  })
})

// ─── findFirst ───

describe('BoyerMoore2 - findFirst', () => {
  it('should return index of first match', () => {
    const bm = new BoyerMoore2('ab')
    expect(bm.findFirst('ababab')).toBe(0)
  })

  it('should return -1 when no match', () => {
    const bm = new BoyerMoore2('xyz')
    expect(bm.findFirst('abcdef')).toBe(-1)
  })

  it('should return 0 when pattern matches at start', () => {
    const bm = new BoyerMoore2('start')
    expect(bm.findFirst('start here')).toBe(0)
  })

  it('should return correct index for match in middle', () => {
    const bm = new BoyerMoore2('mid')
    expect(bm.findFirst('xmidy')).toBe(1)
  })
})

// ─── hasMatch ───

describe('BoyerMoore2 - hasMatch', () => {
  it('should return true when match exists', () => {
    const bm = new BoyerMoore2('test')
    expect(bm.hasMatch('this is a test')).toBe(true)
  })

  it('should return false when no match', () => {
    const bm = new BoyerMoore2('missing')
    expect(bm.hasMatch('nothing here')).toBe(false)
  })

  it('should return false for empty text', () => {
    const bm = new BoyerMoore2('abc')
    expect(bm.hasMatch('')).toBe(false)
  })

  it('should return false for empty pattern', () => {
    const bm = new BoyerMoore2('')
    expect(bm.hasMatch('hello')).toBe(false)
  })
})

// ─── pattern ───

describe('BoyerMoore2 - pattern', () => {
  it('should return the original pattern', () => {
    const bm = new BoyerMoore2('findme')
    expect(bm.pattern()).toBe('findme')
  })
})
