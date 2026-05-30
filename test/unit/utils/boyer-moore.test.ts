import { describe, it, expect } from 'vitest'
import { BoyerMoore } from '../../../src/utils/boyer-moore.js'

describe('BoyerMoore', () => {
  describe('search', () => {
    it('finds single match', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.search('xyzabcdef')).toEqual([3])
    })

    it('finds multiple matches', () => {
      const bm = new BoyerMoore('ab')
      expect(bm.search('ababab')).toEqual([0, 2, 4])
    })

    it('finds no matches', () => {
      const bm = new BoyerMoore('xyz')
      expect(bm.search('abcdefgh')).toEqual([])
    })

    it('finds match at start', () => {
      const bm = new BoyerMoore('hello')
      expect(bm.search('hello world')).toEqual([0])
    })

    it('finds match at end', () => {
      const bm = new BoyerMoore('world')
      expect(bm.search('hello world')).toEqual([6])
    })

    it('handles exact match', () => {
      const bm = new BoyerMoore('exact')
      expect(bm.search('exact')).toEqual([0])
    })

    it('handles single char pattern', () => {
      const bm = new BoyerMoore('a')
      expect(bm.search('banana')).toEqual([1, 3, 5])
    })

    it('handles empty pattern', () => {
      const bm = new BoyerMoore('')
      expect(bm.search('abc')).toEqual([])
    })

    it('handles pattern longer than text', () => {
      const bm = new BoyerMoore('abcdefgh')
      expect(bm.search('abc')).toEqual([])
    })

    it('handles repeated pattern in text', () => {
      const bm = new BoyerMoore('ana')
      expect(bm.search('banana')).toEqual([1, 3])
    })

    it('finds all occurrences of abcabc', () => {
      const bm = new BoyerMoore('abcabc')
      expect(bm.search('abcabcabcabc')).toEqual([0, 3, 6])
    })

    it('handles pattern at every position', () => {
      const bm = new BoyerMoore('a')
      expect(bm.search('aaa')).toEqual([0, 1, 2])
    })
  })

  describe('case insensitive', () => {
    it('finds case insensitive matches', () => {
      const bm = new BoyerMoore('hello', { caseSensitive: false })
      expect(bm.search('HELLO world')).toEqual([0])
    })

    it('finds mixed case', () => {
      const bm = new BoyerMoore('world', { caseSensitive: false })
      expect(bm.search('Hello World')).toEqual([6])
    })
  })

  describe('case sensitive (default)', () => {
    it('does not match different case', () => {
      const bm = new BoyerMoore('hello')
      expect(bm.search('HELLO world')).toEqual([])
    })
  })

  describe('searchFirst', () => {
    it('returns first match', () => {
      const bm = new BoyerMoore('ab')
      expect(bm.searchFirst('xabxab')).toBe(1)
    })

    it('returns -1 for no match', () => {
      const bm = new BoyerMoore('xyz')
      expect(bm.searchFirst('abc')).toBe(-1)
    })

    it('returns 0 for match at start', () => {
      const bm = new BoyerMoore('abc')
      expect(bm.searchFirst('abcdef')).toBe(0)
    })
  })

  describe('contains', () => {
    it('returns true when found', () => {
      const bm = new BoyerMoore('test')
      expect(bm.contains('this is a test')).toBe(true)
    })

    it('returns false when not found', () => {
      const bm = new BoyerMoore('missing')
      expect(bm.contains('hello world')).toBe(false)
    })
  })

  describe('count', () => {
    it('counts occurrences', () => {
      const bm = new BoyerMoore('ab')
      expect(bm.count('ababab')).toBe(3)
    })

    it('returns 0 for no matches', () => {
      const bm = new BoyerMoore('xyz')
      expect(bm.count('abc')).toBe(0)
    })
  })

  describe('performance advantage', () => {
    it('handles long text efficiently', () => {
      const text = 'ab'.repeat(5000) + 'needle' + 'ba'.repeat(5000)
      const bm = new BoyerMoore('needle')
      expect(bm.search(text)).toEqual([10000])
    })

    it('handles long pattern', () => {
      const pattern = 'a'.repeat(100) + 'b'
      const text = 'x'.repeat(500) + pattern + 'y'.repeat(500)
      const bm = new BoyerMoore(pattern)
      expect(bm.searchFirst(text)).toBe(500)
    })
  })

  describe('edge cases', () => {
    it('handles single char text', () => {
      const bm = new BoyerMoore('a')
      expect(bm.search('a')).toEqual([0])
      expect(bm.search('b')).toEqual([])
    })

    it('handles special characters', () => {
      const bm = new BoyerMoore('$@#')
      expect(bm.search('ab$@#cd')).toEqual([2])
    })
  })
})
