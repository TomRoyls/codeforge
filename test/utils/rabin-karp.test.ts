import { describe, expect, it } from 'vitest'
import { RabinKarp } from '../../src/utils/rabin-karp.js'

describe('RabinKarp', () => {
  describe('search', () => {
    it('finds pattern at beginning', () => {
      expect(new RabinKarp().search('hello world', 'hello')).toEqual([0])
    })

    it('finds pattern at end', () => {
      expect(new RabinKarp().search('hello world', 'world')).toEqual([6])
    })

    it('finds multiple occurrences', () => {
      expect(new RabinKarp().search('abcabcabc', 'abc')).toEqual([0, 3, 6])
    })

    it('returns empty for no match', () => {
      expect(new RabinKarp().search('hello world', 'xyz')).toEqual([])
    })

    it('returns empty for pattern longer than text', () => {
      expect(new RabinKarp().search('ab', 'abcd')).toEqual([])
    })

    it('returns empty for empty pattern', () => {
      expect(new RabinKarp().search('hello', '')).toEqual([])
    })

    it('finds single character', () => {
      expect(new RabinKarp().search('abcabc', 'a')).toEqual([0, 3])
    })

    it('finds overlapping patterns', () => {
      expect(new RabinKarp().search('aaaa', 'aa')).toEqual([0, 1, 2])
    })

    it('handles exact match', () => {
      expect(new RabinKarp().search('abc', 'abc')).toEqual([0])
    })
  })

  describe('contains', () => {
    it('returns true when found', () => {
      expect(new RabinKarp().contains('hello', 'ell')).toBe(true)
    })

    it('returns false when not found', () => {
      expect(new RabinKarp().contains('hello', 'xyz')).toBe(false)
    })
  })

  describe('count', () => {
    it('counts all occurrences', () => {
      expect(new RabinKarp().count('abababab', 'ab')).toBe(4)
    })

    it('returns 0 for no match', () => {
      expect(new RabinKarp().count('hello', 'xyz')).toBe(0)
    })
  })

  describe('searchMultiple', () => {
    it('searches multiple patterns', () => {
      const rk = new RabinKarp()
      const result = rk.searchMultiple('abcabcdef', ['abc', 'def', 'xyz'])
      expect(result.get('abc')).toEqual([0, 3])
      expect(result.get('def')).toEqual([6])
      expect(result.get('xyz')).toEqual([])
    })
  })

  describe('custom parameters', () => {
    it('works with different base and mod', () => {
      const rk = new RabinKarp(131, 1_000_000_009)
      expect(rk.search('hello world', 'world')).toEqual([6])
    })
  })

  it('finds pattern in long text', () => {
    const text = 'a'.repeat(100) + 'needle' + 'b'.repeat(100)
    const rk = new RabinKarp()
    expect(rk.search(text, 'needle')).toEqual([100])
  })

  it('empty text returns empty', () => {
    expect(new RabinKarp().search('', 'abc')).toEqual([])
  })

  it('finds single match at start', () => {
    expect(new RabinKarp().search('abcdef', 'abc')).toEqual([0])
  })

  it('finds no match returns empty', () => {
    expect(new RabinKarp().search('abcdef', 'xyz')).toEqual([])
  })

  it('finds match at start', () => {
    expect(new RabinKarp().search('abcdef', 'abc')).toEqual([0])
  })

  it('no match returns empty', () => {
    expect(new RabinKarp().search('abcdef', 'xyz')).toEqual([])
  })

  it('match at start', () => {
    expect(new RabinKarp().search('abcdef', 'abc')).toEqual([0])
  })

  it('no match returns empty', () => {
    expect(new RabinKarp().search('abcdef', 'xyz')).toEqual([])
  })

  it('finds pattern at start', () => {
    expect(new RabinKarp().search('abcdef', 'abc')).toEqual([0])
  })
})
