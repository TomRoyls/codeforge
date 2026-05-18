import { describe, expect, it } from 'vitest'
import { SuffixArray3 } from '../../src/core/suffix-array-3/index.js'

// ─── Constructor ───

describe('SuffixArray3 constructor', () => {
  it('creates suffix array from simple string', () => {
    const sa = new SuffixArray3('banana')
    expect(sa.length).toBe(6)
  })

  it('handles empty string', () => {
    const sa = new SuffixArray3('')
    expect(sa.length).toBe(0)
  })

  it('handles single character', () => {
    const sa = new SuffixArray3('a')
    expect(sa.length).toBe(1)
  })
})

// ─── length ───

describe('SuffixArray3 length', () => {
  it('returns correct length for non-empty string', () => {
    expect(new SuffixArray3('hello').length).toBe(5)
  })

  it('returns 0 for empty string', () => {
    expect(new SuffixArray3('').length).toBe(0)
  })
})

// ─── toArray ───

describe('SuffixArray3 toArray', () => {
  it('returns all suffixes sorted lexicographically', () => {
    const sa = new SuffixArray3('banana')
    const suffixes = sa.toArray()
    expect(suffixes).toEqual([
      'a',
      'ana',
      'anana',
      'banana',
      'na',
      'nana',
    ])
  })

  it('returns empty array for empty string', () => {
    const sa = new SuffixArray3('')
    expect(sa.toArray()).toEqual([])
  })

  it('returns single suffix for single character', () => {
    const sa = new SuffixArray3('x')
    expect(sa.toArray()).toEqual(['x'])
  })
})

// ─── getSuffix ───

describe('SuffixArray3 getSuffix', () => {
  it('returns the suffix at given index in sorted order', () => {
    const sa = new SuffixArray3('banana')
    expect(sa.getSuffix(0)).toBe('a')
    expect(sa.getSuffix(3)).toBe('banana')
  })

  it('throws for negative index', () => {
    const sa = new SuffixArray3('abc')
    expect(() => sa.getSuffix(-1)).toThrow('Index out of bounds')
  })

  it('throws for index >= length', () => {
    const sa = new SuffixArray3('abc')
    expect(() => sa.getSuffix(3)).toThrow('Index out of bounds')
  })

  it('returns last suffix', () => {
    const sa = new SuffixArray3('banana')
    expect(sa.getSuffix(sa.length - 1)).toBe('nana')
  })
})

// ─── indexOf ───

describe('SuffixArray3 indexOf', () => {
  it('returns the sorted position for a valid suffix index', () => {
    const sa = new SuffixArray3('banana')
    // 'banana' starts at index 0 in original, find its position in sorted order
    const pos = sa.indexOf(0)
    expect(typeof pos).toBe('number')
    expect(pos).toBeGreaterThanOrEqual(0)
    expect(pos).toBeLessThan(sa.length)
  })

  it('throws for negative suffix index', () => {
    const sa = new SuffixArray3('abc')
    expect(() => sa.indexOf(-1)).toThrow('Suffix index out of bounds')
  })

  it('throws for suffix index >= text length', () => {
    const sa = new SuffixArray3('abc')
    expect(() => sa.indexOf(3)).toThrow('Suffix index out of bounds')
  })

  it('round-trips with getSuffix for all positions', () => {
    const sa = new SuffixArray3('banana')
    for (let i = 0; i < sa.length; i++) {
      const suffix = sa.getSuffix(i)
      const originalIndex = sa.length - suffix.length
      const sortedPos = sa.indexOf(originalIndex)
      expect(sortedPos).toBe(i)
    }
  })
})

// ─── search ───

describe('SuffixArray3 search', () => {
  it('finds all occurrences of a pattern', () => {
    const sa = new SuffixArray3('banana')
    expect(sa.search('ana')).toEqual([1, 3])
  })

  it('finds single occurrence', () => {
    const sa = new SuffixArray3('banana')
    expect(sa.search('ban')).toEqual([0])
  })

  it('returns empty for non-existent pattern', () => {
    const sa = new SuffixArray3('banana')
    expect(sa.search('xyz')).toEqual([])
  })

  it('returns all indices for empty pattern', () => {
    const sa = new SuffixArray3('abc')
    const result = sa.search('')
    expect(result).toEqual([0, 1, 2])
  })

  it('finds pattern at end of string', () => {
    const sa = new SuffixArray3('banana')
    expect(sa.search('na')).toEqual([2, 4])
  })

  it('finds single-character pattern', () => {
    const sa = new SuffixArray3('aabaa')
    expect(sa.search('a')).toEqual([0, 1, 3, 4])
  })

  it('returns all indices for empty string on empty text', () => {
    const sa = new SuffixArray3('')
    expect(sa.search('')).toEqual([])
  })

  it('handles repeated characters', () => {
    const sa = new SuffixArray3('aaaa')
    expect(sa.search('aa')).toEqual([0, 1, 2])
  })
})

// ─── count ───

describe('SuffixArray3 count', () => {
  it('counts occurrences of pattern', () => {
    const sa = new SuffixArray3('banana')
    expect(sa.count('ana')).toBe(2)
    expect(sa.count('na')).toBe(2)
    expect(sa.count('ban')).toBe(1)
  })

  it('returns 0 for non-existent pattern', () => {
    const sa = new SuffixArray3('banana')
    expect(sa.count('xyz')).toBe(0)
  })

  it('returns length for empty pattern', () => {
    const sa = new SuffixArray3('abc')
    expect(sa.count('')).toBe(3)
  })

  it('returns 0 count on empty text for non-empty pattern', () => {
    const sa = new SuffixArray3('')
    expect(sa.count('a')).toBe(0)
  })
})

// ─── has ───

describe('SuffixArray3 has', () => {
  it('returns true for existing pattern', () => {
    const sa = new SuffixArray3('banana')
    expect(sa.has('ana')).toBe(true)
    expect(sa.has('ban')).toBe(true)
    expect(sa.has('na')).toBe(true)
  })

  it('returns false for non-existent pattern', () => {
    const sa = new SuffixArray3('banana')
    expect(sa.has('xyz')).toBe(false)
    expect(sa.has('bananana')).toBe(false)
  })

  it('returns true for empty pattern', () => {
    const sa = new SuffixArray3('abc')
    expect(sa.has('')).toBe(true)
  })

  it('returns false for non-empty pattern on empty text', () => {
    const sa = new SuffixArray3('')
    expect(sa.has('a')).toBe(false)
  })
})
