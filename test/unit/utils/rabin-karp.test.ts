import { describe, it, expect } from 'vitest'
import { RabinKarp } from '../../../src/utils/rabin-karp.js'

describe('RabinKarp', () => {
  describe('search', () => {
    it('finds single match', () => {
      const rk = new RabinKarp('abc')
      expect(rk.search('xyzabcdef')).toEqual([3])
    })

    it('finds multiple matches', () => {
      const rk = new RabinKarp('ab')
      expect(rk.search('ababab')).toEqual([0, 2, 4])
    })

    it('finds no matches', () => {
      const rk = new RabinKarp('xyz')
      expect(rk.search('abcdefgh')).toEqual([])
    })

    it('finds match at start', () => {
      const rk = new RabinKarp('hello')
      expect(rk.search('hello world')).toEqual([0])
    })

    it('finds match at end', () => {
      const rk = new RabinKarp('world')
      expect(rk.search('hello world')).toEqual([6])
    })

    it('finds overlapping matches', () => {
      const rk = new RabinKarp('aa')
      expect(rk.search('aaaa')).toEqual([0, 1, 2])
    })

    it('handles pattern longer than text', () => {
      const rk = new RabinKarp('abcdefgh')
      expect(rk.search('abc')).toEqual([])
    })

    it('handles empty pattern', () => {
      const rk = new RabinKarp('')
      expect(rk.search('abc')).toEqual([])
    })

    it('handles exact match', () => {
      const rk = new RabinKarp('exact')
      expect(rk.search('exact')).toEqual([0])
    })

    it('handles single char pattern', () => {
      const rk = new RabinKarp('a')
      expect(rk.search('banana')).toEqual([1, 3, 5])
    })

    it('handles repeated pattern', () => {
      const rk = new RabinKarp('ana')
      expect(rk.search('banana')).toEqual([1, 3])
    })
  })

  describe('case insensitive', () => {
    it('finds case insensitive matches', () => {
      const rk = new RabinKarp('hello', { caseSensitive: false })
      expect(rk.search('HELLO world')).toEqual([0])
    })

    it('finds mixed case', () => {
      const rk = new RabinKarp('world', { caseSensitive: false })
      expect(rk.search('Hello World')).toEqual([6])
    })
  })

  describe('case sensitive (default)', () => {
    it('does not match different case', () => {
      const rk = new RabinKarp('hello')
      expect(rk.search('HELLO world')).toEqual([])
    })
  })

  describe('searchFirst', () => {
    it('returns first match index', () => {
      const rk = new RabinKarp('ab')
      expect(rk.searchFirst('xabxab')).toBe(1)
    })

    it('returns -1 for no match', () => {
      const rk = new RabinKarp('xyz')
      expect(rk.searchFirst('abc')).toBe(-1)
    })
  })

  describe('count', () => {
    it('counts occurrences', () => {
      const rk = new RabinKarp('ab')
      expect(rk.count('ababab')).toBe(3)
    })

    it('returns 0 for no matches', () => {
      const rk = new RabinKarp('xyz')
      expect(rk.count('abc')).toBe(0)
    })
  })

  describe('contains', () => {
    it('returns true when found', () => {
      const rk = new RabinKarp('test')
      expect(rk.contains('this is a test')).toBe(true)
    })

    it('returns false when not found', () => {
      const rk = new RabinKarp('missing')
      expect(rk.contains('hello world')).toBe(false)
    })
  })

  describe('searchMultiple', () => {
    it('searches multiple patterns', () => {
      const result = RabinKarp.searchMultiple('the quick brown fox', ['quick', 'fox', 'slow'])
      expect(result.get('quick')).toEqual([4])
      expect(result.get('fox')).toEqual([16])
      expect(result.get('slow')).toEqual([])
    })
  })

  describe('longer text', () => {
    it('handles long text', () => {
      const text = 'ab'.repeat(5000) + 'needle' + 'ba'.repeat(5000)
      const rk = new RabinKarp('needle')
      expect(rk.search(text)).toEqual([10000])
    })
  })
})
