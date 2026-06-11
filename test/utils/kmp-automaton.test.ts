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
})
