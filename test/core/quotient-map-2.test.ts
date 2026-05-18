import { describe, it, expect } from 'vitest'
import { QuotientMap2 } from '../../src/core/quotient-map-2/index.js'

describe('QuotientMap2', () => {
  const caseInsensitiveEq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()
  const sameLengthEq = (a: string, b: string) => a.length === b.length

  describe('constructor', () => {
    it('creates empty map with equivalence function', () => {
      const qm = new QuotientMap2<string>(caseInsensitiveEq)
      expect(qm.size).toBe(0)
    })
  })

  // ─── set / get / has ───

  describe('set / get / has', () => {
    it('sets and gets a value', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('abc', 1)
      expect(qm.get('abc')).toBe(1)
      expect(qm.has('abc')).toBe(true)
    })

    it('returns undefined for missing key', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      expect(qm.get('missing')).toBeUndefined()
      expect(qm.has('missing')).toBe(false)
    })

    it('overwrites existing value', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('abc', 1)
      qm.set('abc', 99)
      expect(qm.get('abc')).toBe(99)
      expect(qm.size).toBe(1)
    })

    it('stores multiple keys', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('ab', 2)
      qm.set('abc', 3)
      qm.set('abcd', 4)
      expect(qm.size).toBe(3)
    })

    it('links equivalent keys into same class', () => {
      const qm = new QuotientMap2<string>(caseInsensitiveEq)
      qm.set('Hello', 'val1')
      qm.set('hello', 'val2')
      const eqClass = qm.getEquivalenceClass('Hello')
      expect(eqClass).toContain('Hello')
      expect(eqClass).toContain('hello')
      expect(eqClass.length).toBe(2)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('abc', 1)
      expect(qm.delete('abc')).toBe(true)
      expect(qm.has('abc')).toBe(false)
      expect(qm.size).toBe(0)
    })

    it('returns false for missing key', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      expect(qm.delete('missing')).toBe(false)
    })

    it('only deletes specified key, not equivalent ones', () => {
      const qm = new QuotientMap2<string>(caseInsensitiveEq)
      qm.set('Hello', 'v1')
      qm.set('hello', 'v2')
      qm.delete('Hello')
      expect(qm.has('Hello')).toBe(false)
      expect(qm.has('hello')).toBe(true)
    })
  })

  // ─── getEquivalenceClass ───

  describe('getEquivalenceClass', () => {
    it('returns empty array for missing key', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      expect(qm.getEquivalenceClass('missing')).toEqual([])
    })

    it('returns single element class when no equivalents', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('abc', 1)
      expect(qm.getEquivalenceClass('abc')).toEqual(['abc'])
    })

    it('groups by same length', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('ab', 2)
      qm.set('cd', 2)
      qm.set('ef', 2)
      const cls = qm.getEquivalenceClass('ab')
      expect(cls.sort()).toEqual(['ab', 'cd', 'ef'])
    })

    it('separates different lengths into different classes', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('ab', 2)
      qm.set('abc', 3)
      expect(qm.getEquivalenceClass('ab')).toEqual(['ab'])
      expect(qm.getEquivalenceClass('abc')).toEqual(['abc'])
    })
  })

  // ─── getClassRepresentative ───

  describe('getClassRepresentative', () => {
    it('returns undefined for missing key', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      expect(qm.getClassRepresentative('missing')).toBeUndefined()
    })

    it('returns a representative for existing key', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('abc', 1)
      const rep = qm.getClassRepresentative('abc')
      expect(typeof rep).toBe('string')
    })

    it('returns same representative for equivalent keys', () => {
      const qm = new QuotientMap2<string>(caseInsensitiveEq)
      qm.set('Hello', 'v1')
      qm.set('hello', 'v2')
      expect(qm.getClassRepresentative('Hello')).toBe(qm.getClassRepresentative('hello'))
    })
  })

  // ─── mergeClasses ───

  describe('mergeClasses', () => {
    it('does nothing for missing keys', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.mergeClasses('a', 'b')
      expect(qm.size).toBe(0)
    })

    it('merges two separate classes', () => {
      const qm = new QuotientMap2<number>((a, b) => a === b)
      qm.set('x', 1)
      qm.set('y', 2)
      expect(qm.classCount()).toBe(2)
      qm.mergeClasses('x', 'y')
      expect(qm.classCount()).toBe(1)
      expect(qm.getEquivalenceClass('x')).toContain('y')
    })

    it('does nothing for already merged keys', () => {
      const qm = new QuotientMap2<string>(caseInsensitiveEq)
      qm.set('Hello', 'v1')
      qm.set('hello', 'v2')
      expect(qm.classCount()).toBe(1)
      qm.mergeClasses('Hello', 'hello')
      expect(qm.classCount()).toBe(1)
    })
  })

  // ─── classCount ───

  describe('classCount', () => {
    it('returns 0 for empty map', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      expect(qm.classCount()).toBe(0)
    })

    it('counts separate classes correctly', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('a', 1)
      qm.set('ab', 2)
      qm.set('abc', 3)
      expect(qm.classCount()).toBe(3)
    })

    it('counts merged class as one', () => {
      const qm = new QuotientMap2<string>(caseInsensitiveEq)
      qm.set('Hello', 'v1')
      qm.set('HELLO', 'v2')
      qm.set('World', 'v3')
      expect(qm.classCount()).toBe(2)
    })
  })

  // ─── keys / values / entries ───

  describe('keys / values / entries', () => {
    it('returns empty arrays for empty map', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      expect(qm.keys()).toEqual([])
      expect(qm.values()).toEqual([])
      expect(qm.entries()).toEqual([])
    })

    it('returns all keys', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('a', 1)
      qm.set('b', 2)
      expect(qm.keys().sort()).toEqual(['a', 'b'])
    })

    it('returns all values', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('a', 10)
      qm.set('b', 20)
      expect(qm.values().sort()).toEqual([10, 20])
    })

    it('returns all entries', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('a', 1)
      qm.set('b', 2)
      const entries = qm.entries().sort((x, y) => x[0].localeCompare(y[0]))
      expect(entries).toEqual([['a', 1], ['b', 2]])
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('clears all data', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      qm.set('abc', 1)
      qm.set('de', 2)
      qm.clear()
      expect(qm.size).toBe(0)
      expect(qm.classCount()).toBe(0)
      expect(qm.keys()).toEqual([])
    })
  })

  // ─── edge cases ───

  describe('edge cases', () => {
    it('handles empty string keys', () => {
      const qm = new QuotientMap2<number>((a, b) => a === b)
      qm.set('', 42)
      expect(qm.get('')).toBe(42)
      expect(qm.size).toBe(1)
    })

    it('handles many equivalent keys', () => {
      const qm = new QuotientMap2<number>(sameLengthEq)
      for (let i = 0; i < 10; i++) {
        qm.set(`k${i}`, i)
      }
      expect(qm.size).toBe(10)
      expect(qm.classCount()).toBe(1)
      expect(qm.getEquivalenceClass('k0').length).toBe(10)
    })
  })
})
