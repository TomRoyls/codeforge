import { describe, it, expect } from 'vitest'
import { PolyHash } from '../../src/core/poly-hash/index.js'

describe('PolyHash', () => {
  describe('constructor', () => {
    it('creates PolyHash with default options', () => {
      const ph = new PolyHash('abc')
      expect(ph.size).toBe(3)
      expect(ph.base).toBe(31)
      expect(ph.mod).toBe(1_000_000_007)
    })

    it('creates PolyHash with custom base', () => {
      const ph = new PolyHash('abc', { base: 37 })
      expect(ph.base).toBe(37)
    })

    it('creates PolyHash with custom mod', () => {
      const ph = new PolyHash('abc', { mod: 1_000_000_009 })
      expect(ph.mod).toBe(1_000_000_009)
    })

    it('creates PolyHash with custom base and mod', () => {
      const ph = new PolyHash('abc', { base: 53, mod: 997 })
      expect(ph.base).toBe(53)
      expect(ph.mod).toBe(997)
    })

    it('creates PolyHash with empty string', () => {
      const ph = new PolyHash('')
      expect(ph.size).toBe(0)
      expect(ph.isEmpty).toBe(true)
    })

    it('creates PolyHash with single character', () => {
      const ph = new PolyHash('a')
      expect(ph.size).toBe(1)
    })

    it('creates PolyHash with long string', () => {
      const ph = new PolyHash('a'.repeat(10000))
      expect(ph.size).toBe(10000)
    })
  })

  describe('size', () => {
    it('returns 0 for empty string', () => {
      expect(new PolyHash('').size).toBe(0)
    })

    it('returns 1 for single character', () => {
      expect(new PolyHash('x').size).toBe(1)
    })

    it('returns correct length for multi-char string', () => {
      expect(new PolyHash('hello').size).toBe(5)
    })

    it('updates after append', () => {
      const ph = new PolyHash('ab')
      ph.append('c')
      expect(ph.size).toBe(3)
    })

    it('updates after popBack', () => {
      const ph = new PolyHash('abc')
      ph.popBack()
      expect(ph.size).toBe(2)
    })

    it('updates after pushFront', () => {
      const ph = new PolyHash('bc')
      ph.pushFront('a')
      expect(ph.size).toBe(3)
    })

    it('updates after clear', () => {
      const ph = new PolyHash('abc')
      ph.clear()
      expect(ph.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty string', () => {
      expect(new PolyHash('').isEmpty).toBe(true)
    })

    it('returns false for non-empty string', () => {
      expect(new PolyHash('a').isEmpty).toBe(false)
    })

    it('returns true after clearing', () => {
      const ph = new PolyHash('abc')
      ph.clear()
      expect(ph.isEmpty).toBe(true)
    })

    it('returns true after popping all characters', () => {
      const ph = new PolyHash('ab')
      ph.popBack()
      ph.popBack()
      expect(ph.isEmpty).toBe(true)
    })

    it('returns false after appending to empty', () => {
      const ph = new PolyHash('')
      ph.append('a')
      expect(ph.isEmpty).toBe(false)
    })
  })

  describe('hash', () => {
    it('returns 0 for empty string', () => {
      expect(new PolyHash('').hash()).toBe(0)
    })

    it('returns charCode for single character', () => {
      expect(new PolyHash('a').hash()).toBe(97)
    })

    it('computes hash for two characters', () => {
      const ph = new PolyHash('ab')
      expect(ph.hash()).toBe((97 * 31 + 98) % 1_000_000_007)
    })

    it('computes hash for three characters', () => {
      const ph = new PolyHash('abc')
      const expected = ((97 * 31 + 98) * 31 + 99) % 1_000_000_007
      expect(ph.hash()).toBe(expected)
    })

    it('computes hash with custom base', () => {
      const ph = new PolyHash('ab', { base: 37 })
      expect(ph.hash()).toBe((97 * 37 + 98) % 1_000_000_007)
    })

    it('computes hash with custom mod', () => {
      const ph = new PolyHash('ab', { mod: 997 })
      expect(ph.hash()).toBe((97 * 31 + 98) % 997)
    })

    it('computes consistent hash for same string', () => {
      const h1 = new PolyHash('hello').hash()
      const h2 = new PolyHash('hello').hash()
      expect(h1).toBe(h2)
    })

    it('computes different hashes for different strings', () => {
      const h1 = new PolyHash('hello').hash()
      const h2 = new PolyHash('world').hash()
      expect(h1).not.toBe(h2)
    })

    it('updates after append', () => {
      const ph = new PolyHash('a')
      const h1 = ph.hash()
      ph.append('b')
      const h2 = ph.hash()
      expect(h2).not.toBe(h1)
      expect(h2).toBe((h1 * 31 + 98) % 1_000_000_007)
    })
  })

  describe('hashRange', () => {
    it('returns 0 for empty range', () => {
      const ph = new PolyHash('abc')
      expect(ph.hashRange(0, 0)).toBe(0)
    })

    it('returns hash of first character', () => {
      const ph = new PolyHash('abc')
      expect(ph.hashRange(0, 1)).toBe(97)
    })

    it('returns hash of last character', () => {
      const ph = new PolyHash('abc')
      expect(ph.hashRange(2, 3)).toBe(99)
    })

    it('returns hash of middle substring', () => {
      const ph = new PolyHash('abc')
      expect(ph.hashRange(1, 2)).toBe(98)
    })

    it('returns hash of full string via range', () => {
      const ph = new PolyHash('abc')
      expect(ph.hashRange(0, 3)).toBe(ph.hash())
    })

    it('returns hash of two-char substring', () => {
      const ph = new PolyHash('abcd')
      expect(ph.hashRange(1, 3)).toBe((98 * 31 + 99) % 1_000_000_007)
    })

    it('throws on negative l', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.hashRange(-1, 2)).toThrow(RangeError)
    })

    it('throws on negative r', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.hashRange(0, -1)).toThrow(RangeError)
    })

    it('throws on l > r', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.hashRange(2, 1)).toThrow(RangeError)
    })

    it('throws on r > size', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.hashRange(0, 4)).toThrow(RangeError)
    })

    it('throws on l > size', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.hashRange(4, 4)).toThrow(RangeError)
    })

    it('matches individual char hash', () => {
      const ph = new PolyHash('hello')
      for (let i = 0; i < ph.size; i++) {
        expect(ph.hashRange(i, i + 1)).toBe('hello'.charCodeAt(i))
      }
    })

    it('consistent with hashPrefix', () => {
      const ph = new PolyHash('abcde')
      expect(ph.hashRange(0, 3)).toBe(ph.hashPrefix(3))
      expect(ph.hashRange(0, 5)).toBe(ph.hashPrefix(5))
    })
  })

  describe('hashPrefix', () => {
    it('returns 0 for prefix of length 0', () => {
      const ph = new PolyHash('abc')
      expect(ph.hashPrefix(0)).toBe(0)
    })

    it('returns hash of full string for prefix of length n', () => {
      const ph = new PolyHash('abc')
      expect(ph.hashPrefix(3)).toBe(ph.hash())
    })

    it('returns hash of first character', () => {
      const ph = new PolyHash('abc')
      expect(ph.hashPrefix(1)).toBe(97)
    })

    it('returns hash of first two characters', () => {
      const ph = new PolyHash('abc')
      expect(ph.hashPrefix(2)).toBe((97 * 31 + 98) % 1_000_000_007)
    })

    it('throws on negative n', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.hashPrefix(-1)).toThrow(RangeError)
    })

    it('throws on n > size', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.hashPrefix(4)).toThrow(RangeError)
    })

    it('returns 0 for empty string prefix', () => {
      const ph = new PolyHash('')
      expect(ph.hashPrefix(0)).toBe(0)
    })
  })

  describe('append', () => {
    it('appends a character to empty string', () => {
      const ph = new PolyHash('')
      ph.append('a')
      expect(ph.size).toBe(1)
      expect(ph.hash()).toBe(97)
    })

    it('appends a character to non-empty string', () => {
      const ph = new PolyHash('a')
      ph.append('b')
      expect(ph.size).toBe(2)
      expect(ph.hash()).toBe((97 * 31 + 98) % 1_000_000_007)
    })

    it('appends multiple characters', () => {
      const ph = new PolyHash('')
      ph.append('a')
      ph.append('b')
      ph.append('c')
      expect(ph.toString()).toBe('abc')
      expect(ph.hash()).toBe(new PolyHash('abc').hash())
    })

    it('throws on empty string argument', () => {
      const ph = new PolyHash('a')
      expect(() => ph.append('')).toThrow(RangeError)
    })

    it('throws on multi-character argument', () => {
      const ph = new PolyHash('a')
      expect(() => ph.append('ab')).toThrow(RangeError)
    })

    it('updates hash correctly after append', () => {
      const ph = new PolyHash('abc')
      const original = ph.hash()
      ph.append('d')
      expect(ph.hash()).toBe((original * 31 + 100) % 1_000_000_007)
    })

    it('updates hashRange correctly after append', () => {
      const ph = new PolyHash('abc')
      ph.append('d')
      expect(ph.hashRange(3, 4)).toBe(100)
    })
  })

  describe('pushFront', () => {
    it('prepends character to empty string', () => {
      const ph = new PolyHash('')
      ph.pushFront('a')
      expect(ph.size).toBe(1)
      expect(ph.toString()).toBe('a')
    })

    it('prepends character to non-empty string', () => {
      const ph = new PolyHash('bc')
      ph.pushFront('a')
      expect(ph.toString()).toBe('abc')
    })

    it('prepends multiple characters', () => {
      const ph = new PolyHash('c')
      ph.pushFront('b')
      ph.pushFront('a')
      expect(ph.toString()).toBe('abc')
      expect(ph.hash()).toBe(new PolyHash('abc').hash())
    })

    it('throws on empty string argument', () => {
      const ph = new PolyHash('a')
      expect(() => ph.pushFront('')).toThrow(RangeError)
    })

    it('throws on multi-character argument', () => {
      const ph = new PolyHash('a')
      expect(() => ph.pushFront('ab')).toThrow(RangeError)
    })

    it('produces same hash as constructing equivalent string', () => {
      const ph = new PolyHash('bc')
      ph.pushFront('a')
      const direct = new PolyHash('abc')
      expect(ph.hash()).toBe(direct.hash())
    })
  })

  describe('popBack', () => {
    it('returns undefined for empty string', () => {
      const ph = new PolyHash('')
      expect(ph.popBack()).toBeUndefined()
    })

    it('removes and returns last character', () => {
      const ph = new PolyHash('abc')
      expect(ph.popBack()).toBe('c')
      expect(ph.size).toBe(2)
    })

    it('pops all characters', () => {
      const ph = new PolyHash('ab')
      expect(ph.popBack()).toBe('b')
      expect(ph.popBack()).toBe('a')
      expect(ph.size).toBe(0)
      expect(ph.isEmpty).toBe(true)
    })

    it('returns undefined after popping all', () => {
      const ph = new PolyHash('a')
      ph.popBack()
      expect(ph.popBack()).toBeUndefined()
    })

    it('updates hash after pop', () => {
      const ph = new PolyHash('abc')
      ph.popBack()
      expect(ph.hash()).toBe(new PolyHash('ab').hash())
    })

    it('updates hashRange after pop', () => {
      const ph = new PolyHash('abc')
      ph.popBack()
      expect(ph.hashRange(0, 2)).toBe(new PolyHash('ab').hashRange(0, 2))
    })

    it('produces correct string after multiple pops', () => {
      const ph = new PolyHash('abcde')
      ph.popBack()
      ph.popBack()
      expect(ph.toString()).toBe('abc')
    })
  })

  describe('toString', () => {
    it('returns empty string for empty PolyHash', () => {
      expect(new PolyHash('').toString()).toBe('')
    })

    it('returns the original string', () => {
      expect(new PolyHash('hello').toString()).toBe('hello')
    })

    it('returns updated string after append', () => {
      const ph = new PolyHash('hel')
      ph.append('l')
      ph.append('o')
      expect(ph.toString()).toBe('hello')
    })

    it('returns updated string after pushFront', () => {
      const ph = new PolyHash('ello')
      ph.pushFront('h')
      expect(ph.toString()).toBe('hello')
    })

    it('returns updated string after popBack', () => {
      const ph = new PolyHash('hello!')
      ph.popBack()
      expect(ph.toString()).toBe('hello')
    })

    it('returns empty after clear', () => {
      const ph = new PolyHash('hello')
      ph.clear()
      expect(ph.toString()).toBe('')
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty string', () => {
      expect(new PolyHash('').toArray()).toEqual([])
    })

    it('returns single element for single char', () => {
      expect(new PolyHash('a').toArray()).toEqual([97])
    })

    it('returns prefix hashes for multi-char string', () => {
      const ph = new PolyHash('ab')
      expect(ph.toArray()).toEqual([97, (97 * 31 + 98) % 1_000_000_007])
    })

    it('returns n elements for string of length n', () => {
      const ph = new PolyHash('abc')
      expect(ph.toArray().length).toBe(3)
    })

    it('last element equals hash', () => {
      const ph = new PolyHash('hello')
      const arr = ph.toArray()
      expect(arr[arr.length - 1]).toBe(ph.hash())
    })

    it('returns copy', () => {
      const ph = new PolyHash('abc')
      const arr = ph.toArray()
      arr[0] = 999
      expect(ph.hashPrefix(1)).toBe(97)
    })

    it('updates after append', () => {
      const ph = new PolyHash('a')
      ph.append('b')
      expect(ph.toArray().length).toBe(2)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const ph = new PolyHash('abc')
      const cloned = ph.clone()
      expect(cloned.hash()).toBe(ph.hash())
      expect(cloned.toString()).toBe(ph.toString())
    })

    it('preserves options', () => {
      const ph = new PolyHash('abc', { base: 37, mod: 997 })
      const cloned = ph.clone()
      expect(cloned.base).toBe(37)
      expect(cloned.mod).toBe(997)
    })

    it('modifying clone does not affect original', () => {
      const ph = new PolyHash('abc')
      const cloned = ph.clone()
      cloned.append('d')
      expect(ph.size).toBe(3)
      expect(cloned.size).toBe(4)
    })

    it('modifying original does not affect clone', () => {
      const ph = new PolyHash('abc')
      const cloned = ph.clone()
      ph.append('d')
      expect(cloned.size).toBe(3)
    })

    it('clones empty PolyHash', () => {
      const ph = new PolyHash('')
      const cloned = ph.clone()
      expect(cloned.isEmpty).toBe(true)
      expect(cloned.size).toBe(0)
    })

    it('clone has same hashRange values', () => {
      const ph = new PolyHash('abcde')
      const cloned = ph.clone()
      for (let i = 0; i <= ph.size; i++) {
        for (let j = i; j <= ph.size; j++) {
          expect(ph.hashRange(i, j)).toBe(cloned.hashRange(i, j))
        }
      }
    })
  })

  describe('static fromString', () => {
    it('creates PolyHash from string', () => {
      const ph = PolyHash.fromString('hello')
      expect(ph.toString()).toBe('hello')
    })

    it('creates PolyHash with options', () => {
      const ph = PolyHash.fromString('hello', { base: 37 })
      expect(ph.base).toBe(37)
    })

    it('creates PolyHash from empty string', () => {
      const ph = PolyHash.fromString('')
      expect(ph.isEmpty).toBe(true)
    })

    it('produces same result as constructor', () => {
      const ph1 = new PolyHash('test')
      const ph2 = PolyHash.fromString('test')
      expect(ph1.hash()).toBe(ph2.hash())
    })
  })

  describe('clear', () => {
    it('clears non-empty PolyHash', () => {
      const ph = new PolyHash('hello')
      ph.clear()
      expect(ph.isEmpty).toBe(true)
      expect(ph.size).toBe(0)
      expect(ph.toString()).toBe('')
    })

    it('clears empty PolyHash without error', () => {
      const ph = new PolyHash('')
      expect(() => ph.clear()).not.toThrow()
    })

    it('allows operations after clear', () => {
      const ph = new PolyHash('abc')
      ph.clear()
      ph.append('x')
      expect(ph.toString()).toBe('x')
      expect(ph.hash()).toBe(120)
    })

    it('resets hash to 0', () => {
      const ph = new PolyHash('abc')
      ph.clear()
      expect(ph.hash()).toBe(0)
    })

    it('allows reuse after clear', () => {
      const ph = new PolyHash('abc')
      ph.clear()
      ph.append('d')
      ph.append('e')
      expect(ph.hash()).toBe(new PolyHash('de').hash())
    })
  })

  describe('forEach', () => {
    it('iterates over all characters', () => {
      const ph = new PolyHash('abc')
      const chars: string[] = []
      ph.forEach((c) => chars.push(c))
      expect(chars).toEqual(['a', 'b', 'c'])
    })

    it('provides correct indices', () => {
      const ph = new PolyHash('abc')
      const indices: number[] = []
      ph.forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does nothing for empty string', () => {
      const ph = new PolyHash('')
      let count = 0
      ph.forEach(() => count++)
      expect(count).toBe(0)
    })

    it('iterates single character', () => {
      const ph = new PolyHash('x')
      const chars: string[] = []
      ph.forEach((c) => chars.push(c))
      expect(chars).toEqual(['x'])
    })

    it('iterates after append', () => {
      const ph = new PolyHash('a')
      ph.append('b')
      const chars: string[] = []
      ph.forEach((c) => chars.push(c))
      expect(chars).toEqual(['a', 'b'])
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const ph = new PolyHash('abc')
      expect([...ph]).toEqual(['a', 'b', 'c'])
    })

    it('works with for...of', () => {
      const ph = new PolyHash('abc')
      const chars: string[] = []
      for (const c of ph) {
        chars.push(c)
      }
      expect(chars).toEqual(['a', 'b', 'c'])
    })

    it('works with empty string', () => {
      const ph = new PolyHash('')
      expect([...ph]).toEqual([])
    })

    it('works with Array.from', () => {
      const ph = new PolyHash('hi')
      expect(Array.from(ph)).toEqual(['h', 'i'])
    })
  })

  describe('charAt', () => {
    it('returns character at valid index', () => {
      const ph = new PolyHash('hello')
      expect(ph.charAt(0)).toBe('h')
      expect(ph.charAt(4)).toBe('o')
    })

    it('returns character at middle index', () => {
      const ph = new PolyHash('hello')
      expect(ph.charAt(2)).toBe('l')
    })

    it('throws on negative index', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.charAt(-1)).toThrow(RangeError)
    })

    it('throws on index >= size', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.charAt(3)).toThrow(RangeError)
    })

    it('throws on empty string', () => {
      const ph = new PolyHash('')
      expect(() => ph.charAt(0)).toThrow(RangeError)
    })

    it('works for index 0 of single char', () => {
      const ph = new PolyHash('z')
      expect(ph.charAt(0)).toBe('z')
    })
  })

  describe('substring', () => {
    it('returns full string with no args', () => {
      const ph = new PolyHash('hello')
      expect(ph.substring(0)).toBe('hello')
    })

    it('returns substring with start and end', () => {
      const ph = new PolyHash('hello')
      expect(ph.substring(1, 4)).toBe('ell')
    })

    it('returns single character substring', () => {
      const ph = new PolyHash('hello')
      expect(ph.substring(0, 1)).toBe('h')
    })

    it('returns empty substring', () => {
      const ph = new PolyHash('hello')
      expect(ph.substring(2, 2)).toBe('')
    })

    it('throws on negative start', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.substring(-1)).toThrow(RangeError)
    })

    it('throws on start > end', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.substring(2, 1)).toThrow(RangeError)
    })

    it('throws on end > size', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.substring(0, 4)).toThrow(RangeError)
    })

    it('returns suffix with only start', () => {
      const ph = new PolyHash('hello')
      expect(ph.substring(3)).toBe('lo')
    })
  })

  describe('equals', () => {
    it('returns true for same strings', () => {
      const ph1 = new PolyHash('hello')
      const ph2 = new PolyHash('hello')
      expect(ph1.equals(ph2)).toBe(true)
    })

    it('returns false for different strings', () => {
      const ph1 = new PolyHash('hello')
      const ph2 = new PolyHash('world')
      expect(ph1.equals(ph2)).toBe(false)
    })

    it('returns true for empty strings', () => {
      const ph1 = new PolyHash('')
      const ph2 = new PolyHash('')
      expect(ph1.equals(ph2)).toBe(true)
    })

    it('returns false for different lengths', () => {
      const ph1 = new PolyHash('a')
      const ph2 = new PolyHash('ab')
      expect(ph1.equals(ph2)).toBe(false)
    })

    it('works with same options', () => {
      const ph1 = new PolyHash('test', { base: 37 })
      const ph2 = new PolyHash('test', { base: 37 })
      expect(ph1.equals(ph2)).toBe(true)
    })

    it('returns false for different bases', () => {
      const ph1 = new PolyHash('test', { base: 31 })
      const ph2 = new PolyHash('test', { base: 37 })
      expect(ph1.equals(ph2)).toBe(false)
    })

    it('returns true after same append sequence', () => {
      const ph1 = new PolyHash('abc')
      const ph2 = new PolyHash('ab')
      ph2.append('c')
      expect(ph1.equals(ph2)).toBe(true)
    })
  })

  describe('base getter', () => {
    it('returns default base 31', () => {
      expect(new PolyHash('a').base).toBe(31)
    })

    it('returns custom base', () => {
      expect(new PolyHash('a', { base: 53 }).base).toBe(53)
    })
  })

  describe('mod getter', () => {
    it('returns default mod', () => {
      expect(new PolyHash('a').mod).toBe(1_000_000_007)
    })

    it('returns custom mod', () => {
      expect(new PolyHash('a', { mod: 997 }).mod).toBe(997)
    })
  })

  describe('power', () => {
    it('returns 1 for power 0', () => {
      const ph = new PolyHash('abc')
      expect(ph.power(0)).toBe(1)
    })

    it('returns base for power 1', () => {
      const ph = new PolyHash('abc')
      expect(ph.power(1)).toBe(31)
    })

    it('returns base^2 for power 2', () => {
      const ph = new PolyHash('abc')
      expect(ph.power(2)).toBe((31 * 31) % 1_000_000_007)
    })

    it('returns correct value for large power', () => {
      const ph = new PolyHash('abc')
      expect(ph.power(10)).toBe(31 ** 10 % 1_000_000_007)
    })

    it('returns correct value beyond precomputed', () => {
      const ph = new PolyHash('a')
      expect(ph.power(100)).toBeGreaterThan(0)
    })

    it('throws on negative exponent', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.power(-1)).toThrow(RangeError)
    })

    it('works with custom base', () => {
      const ph = new PolyHash('a', { base: 37 })
      expect(ph.power(3)).toBe((37 ** 3) % 1_000_000_007)
    })

    it('works with custom mod', () => {
      const ph = new PolyHash('a', { base: 5, mod: 100 })
      expect(ph.power(3)).toBe((5 ** 3) % 100)
    })
  })

  describe('inversePower', () => {
    it('returns 1 for n=0', () => {
      const ph = new PolyHash('abc')
      expect(ph.inversePower(0)).toBe(1)
    })

    it('returns modular inverse of base for n=1', () => {
      const ph = new PolyHash('abc')
      const inv = ph.inversePower(1)
      expect((31 * inv) % 1_000_000_007).toBe(1)
    })

    it('returns modular inverse of base^2 for n=2', () => {
      const ph = new PolyHash('abc')
      const inv2 = ph.inversePower(2)
      const product = Number((BigInt(961) * BigInt(inv2)) % BigInt(1_000_000_007))
      expect(product).toBe(1)
    })

    it('throws on negative exponent', () => {
      const ph = new PolyHash('abc')
      expect(() => ph.inversePower(-1)).toThrow(RangeError)
    })

    it('verifies power * inversePower = 1', () => {
      const ph = new PolyHash('abc')
      const mod = ph.mod
      for (let n = 0; n < 10; n++) {
        const p = ph.power(n)
        const ip = ph.inversePower(n)
        const product = Number((BigInt(p) * BigInt(ip)) % BigInt(mod))
        expect(product).toBe(1)
      }
    })

    it('works with custom mod', () => {
      const ph = new PolyHash('a', { base: 5, mod: 997 })
      const inv = ph.inversePower(1)
      expect((5 * inv) % 997).toBe(1)
    })
  })

  describe('static doubleHash', () => {
    it('returns two different hashes', () => {
      const result = PolyHash.doubleHash('hello')
      expect(result.hash1).not.toBe(result.hash2)
    })

    it('returns zeros for empty string', () => {
      const result = PolyHash.doubleHash('')
      expect(result.hash1).toBe(0)
      expect(result.hash2).toBe(0)
    })

    it('returns consistent results', () => {
      const r1 = PolyHash.doubleHash('test')
      const r2 = PolyHash.doubleHash('test')
      expect(r1.hash1).toBe(r2.hash1)
      expect(r1.hash2).toBe(r2.hash2)
    })

    it('returns different results for different strings', () => {
      const r1 = PolyHash.doubleHash('abc')
      const r2 = PolyHash.doubleHash('xyz')
      expect(r1.hash1).not.toBe(r2.hash1)
      expect(r1.hash2).not.toBe(r2.hash2)
    })

    it('hash1 matches PolyHash with base 31', () => {
      const result = PolyHash.doubleHash('hello')
      const ph = new PolyHash('hello')
      expect(result.hash1).toBe(ph.hash())
    })

    it('hash2 matches PolyHash with base 37', () => {
      const result = PolyHash.doubleHash('hello')
      const ph = new PolyHash('hello', { base: 37 })
      expect(result.hash2).toBe(ph.hash())
    })

    it('uses custom mod from options', () => {
      const result = PolyHash.doubleHash('abc', { mod: 997 })
      const ph1 = new PolyHash('abc', { base: 31, mod: 997 })
      expect(result.hash1).toBe(ph1.hash())
    })

    it('uses custom base and swaps to different one', () => {
      const result = PolyHash.doubleHash('abc', { base: 53 })
      const ph1 = new PolyHash('abc', { base: 53 })
      const ph2 = new PolyHash('abc', { base: 31 })
      expect(result.hash1).toBe(ph1.hash())
      expect(result.hash2).toBe(ph2.hash())
    })
  })

  describe('integration', () => {
    it('append then hashRange', () => {
      const ph = new PolyHash('ab')
      ph.append('c')
      ph.append('d')
      expect(ph.hashRange(0, 4)).toBe(ph.hash())
      expect(ph.hashRange(2, 4)).toBe((99 * 31 + 100) % 1_000_000_007)
    })

    it('pushFront then hashRange', () => {
      const ph = new PolyHash('bc')
      ph.pushFront('a')
      expect(ph.hashRange(0, 3)).toBe(new PolyHash('abc').hash())
    })

    it('popBack then hashRange', () => {
      const ph = new PolyHash('abcd')
      ph.popBack()
      expect(ph.hashRange(0, 3)).toBe(new PolyHash('abc').hash())
    })

    it('complex sequence of operations', () => {
      const ph = new PolyHash('hello')
      ph.popBack()
      ph.append('!')
      expect(ph.toString()).toBe('hell!')
      expect(ph.hash()).toBe(new PolyHash('hell!').hash())
    })

    it('clear and rebuild', () => {
      const ph = new PolyHash('abc')
      ph.clear()
      ph.append('x')
      ph.append('y')
      expect(ph.hash()).toBe(new PolyHash('xy').hash())
    })

    it('clone after modifications', () => {
      const ph = new PolyHash('ab')
      ph.append('c')
      const cloned = ph.clone()
      ph.append('d')
      expect(cloned.size).toBe(3)
      expect(ph.size).toBe(4)
    })

    it('hashRange consistency with substring hash', () => {
      const ph = new PolyHash('abcdef')
      const sub = ph.substring(2, 5)
      const subHash = new PolyHash(sub)
      expect(ph.hashRange(2, 5)).toBe(subHash.hash())
    })

    it('large string operations', () => {
      const str = 'a'.repeat(1000)
      const ph = new PolyHash(str)
      expect(ph.hash()).toBe(new PolyHash(str).hash())
      expect(ph.hashRange(0, 1000)).toBe(ph.hash())
    })

    it('multiple appends produce correct hash', () => {
      const ph = new PolyHash('')
      for (let i = 0; i < 26; i++) {
        ph.append(String.fromCharCode(97 + i))
      }
      const direct = new PolyHash('abcdefghijklmnopqrstuvwxyz')
      expect(ph.hash()).toBe(direct.hash())
    })

    it('pushFront and append produce same result', () => {
      const ph1 = new PolyHash('bc')
      ph1.pushFront('a')
      const ph2 = new PolyHash('a')
      ph2.append('b')
      ph2.append('c')
      expect(ph1.hash()).toBe(ph2.hash())
    })
  })

  describe('edge cases', () => {
    it('handles unicode characters', () => {
      const ph = new PolyHash('héllo')
      expect(ph.size).toBe(5)
      expect(ph.hash()).toBeGreaterThan(0)
    })

    it('handles numeric characters', () => {
      const ph = new PolyHash('12345')
      expect(ph.hash()).toBeGreaterThan(0)
    })

    it('handles special characters', () => {
      const ph = new PolyHash('!@#$%')
      expect(ph.size).toBe(5)
    })

    it('handles single char string fully', () => {
      const ph = new PolyHash('a')
      expect(ph.size).toBe(1)
      expect(ph.isEmpty).toBe(false)
      expect(ph.hash()).toBe(97)
      expect(ph.hashRange(0, 1)).toBe(97)
      expect(ph.hashPrefix(1)).toBe(97)
      expect(ph.charAt(0)).toBe('a')
      expect(ph.toString()).toBe('a')
      expect(ph.toArray()).toEqual([97])
    })

    it('handles space characters', () => {
      const ph = new PolyHash('a b')
      expect(ph.size).toBe(3)
      expect(ph.charAt(1)).toBe(' ')
    })

    it('handles repeated characters', () => {
      const ph = new PolyHash('aaa')
      expect(ph.hashRange(0, 1)).toBe(ph.hashRange(1, 2))
      expect(ph.hashRange(1, 2)).toBe(ph.hashRange(2, 3))
    })

    it('handles popBack to empty then re-append', () => {
      const ph = new PolyHash('a')
      ph.popBack()
      expect(ph.isEmpty).toBe(true)
      ph.append('b')
      expect(ph.toString()).toBe('b')
      expect(ph.hash()).toBe(98)
    })

    it('handles very large mod', () => {
      const ph = new PolyHash('test', { mod: 1_000_000_009 })
      expect(ph.hash()).toBeGreaterThan(0)
      expect(ph.mod).toBe(1_000_000_009)
    })

    it('handles small mod', () => {
      const ph = new PolyHash('abc', { base: 3, mod: 7 })
      expect(ph.hash()).toBeLessThan(7)
    })

    it('multiple clones are independent', () => {
      const ph = new PolyHash('abc')
      const c1 = ph.clone()
      const c2 = ph.clone()
      c1.append('d')
      c2.append('e')
      expect(ph.size).toBe(3)
      expect(c1.size).toBe(4)
      expect(c2.size).toBe(4)
      expect(c1.toString()).toBe('abcd')
      expect(c2.toString()).toBe('abce')
    })

    it('forEach after clear and append', () => {
      const ph = new PolyHash('abc')
      ph.clear()
      ph.append('x')
      const chars: string[] = []
      ph.forEach((c) => chars.push(c))
      expect(chars).toEqual(['x'])
    })

    it('iterator after complex modifications', () => {
      const ph = new PolyHash('abc')
      ph.popBack()
      ph.append('d')
      ph.pushFront('z')
      expect([...ph]).toEqual(['z', 'a', 'b', 'd'])
    })

    it('equals after different construction paths', () => {
      const ph1 = PolyHash.fromString('test')
      const ph2 = new PolyHash('te')
      ph2.append('s')
      ph2.append('t')
      expect(ph1.equals(ph2)).toBe(true)
    })

    it('hashRange for palindrome', () => {
      const ph = new PolyHash('abba')
      expect(ph.hashRange(0, 2)).not.toBe(ph.hashRange(2, 4))
    })

    it('power and inversePower consistency', () => {
      const ph = new PolyHash('abc')
      const mod = ph.mod
      for (let n = 0; n < 20; n++) {
        const p = ph.power(n)
        const ip = ph.inversePower(n)
        const product = Number((BigInt(p) * BigInt(ip)) % BigInt(mod))
        expect(product).toBe(1)
      }
    })

    it('doubleHash for single character', () => {
      const result = PolyHash.doubleHash('a')
      expect(result.hash1).toBe(97)
      expect(result.hash2).toBe(97)
    })
  })
})
