import { describe, expect, it } from 'vitest'
import { BurrowsWheeler, bwtDecode, bwtEncode } from '../../src/core/burrows-wheeler/index.js'

// ─── bwtEncode ───

describe('BurrowsWheeler', () => {
  describe('bwtEncode', () => {
    it('returns empty result for empty string', () => {
      const result = bwtEncode('')
      expect(result.transformed).toBe('')
      expect(result.originalIndex).toBe(0)
    })

    it('encodes a single character', () => {
      const result = bwtEncode('a')
      expect(result.transformed.length).toBe(2)
      expect(typeof result.originalIndex).toBe('number')
    })

    it('encodes "banana"', () => {
      const result = bwtEncode('banana')
      expect(result.transformed).toBeDefined()
      expect(result.originalIndex).toBeGreaterThanOrEqual(0)
    })

    it('produces a reversible encoding', () => {
      const original = 'hello'
      const { transformed, originalIndex } = bwtEncode(original)
      const decoded = bwtDecode(transformed, originalIndex)
      expect(decoded).toBe(original)
    })

    it('produces a reversible encoding for longer strings', () => {
      const original = 'abracadabra'
      const { transformed, originalIndex } = bwtEncode(original)
      const decoded = bwtDecode(transformed, originalIndex)
      expect(decoded).toBe(original)
    })

    it('handles repeated characters', () => {
      const original = 'aaaa'
      const { transformed, originalIndex } = bwtEncode(original)
      const decoded = bwtDecode(transformed, originalIndex)
      expect(decoded).toBe(original)
    })

    it('handles string with special characters', () => {
      const original = 'abc!@#'
      const { transformed, originalIndex } = bwtEncode(original)
      const decoded = bwtDecode(transformed, originalIndex)
      expect(decoded).toBe(original)
    })
  })

  // ─── bwtDecode ───

  describe('bwtDecode', () => {
    it('returns empty string for empty transformed', () => {
      expect(bwtDecode('', 0)).toBe('')
    })

    it('round-trips "banana"', () => {
      const original = 'banana'
      const { transformed, originalIndex } = bwtEncode(original)
      expect(bwtDecode(transformed, originalIndex)).toBe('banana')
    })

    it('round-trips single character', () => {
      const original = 'x'
      const { transformed, originalIndex } = bwtEncode(original)
      expect(bwtDecode(transformed, originalIndex)).toBe('x')
    })

    it('round-trips string with spaces', () => {
      const original = 'hello world'
      const { transformed, originalIndex } = bwtEncode(original)
      expect(bwtDecode(transformed, originalIndex)).toBe('hello world')
    })

    it('round-trips numeric string', () => {
      const original = '12345'
      const { transformed, originalIndex } = bwtEncode(original)
      expect(bwtDecode(transformed, originalIndex)).toBe('12345')
    })
  })

  // ─── BurrowsWheeler.encode ───

  describe('BurrowsWheeler.encode', () => {
    it('returns the same result as bwtEncode', () => {
      const input = 'teststring'
      const functional = bwtEncode(input)
      const staticResult = BurrowsWheeler.encode(input)
      expect(staticResult.transformed).toBe(functional.transformed)
      expect(staticResult.originalIndex).toBe(functional.originalIndex)
    })

    it('handles empty string', () => {
      const result = BurrowsWheeler.encode('')
      expect(result.transformed).toBe('')
      expect(result.originalIndex).toBe(0)
    })
  })

  // ─── BurrowsWheeler.decode ───

  describe('BurrowsWheeler.decode', () => {
    it('returns the same result as bwtDecode', () => {
      const { transformed, originalIndex } = bwtEncode('decode')
      expect(BurrowsWheeler.decode(transformed, originalIndex)).toBe('decode')
    })

    it('handles empty string', () => {
      expect(BurrowsWheeler.decode('', 0)).toBe('')
    })
  })

  // ─── BurrowsWheeler.getTransforms ───

  describe('BurrowsWheeler.getTransforms', () => {
    it('returns all rotations of the string with sentinel', () => {
      const transforms = BurrowsWheeler.getTransforms('ab')
      expect(transforms).toHaveLength(3)
      expect(transforms).toContain('ab$')
      expect(transforms).toContain('b$a')
      expect(transforms).toContain('$ab')
    })

    it('returns single sentinel for empty string', () => {
      const transforms = BurrowsWheeler.getTransforms('')
      expect(transforms).toEqual(['$'])
    })

    it('returns correct count for single char', () => {
      const transforms = BurrowsWheeler.getTransforms('a')
      expect(transforms).toHaveLength(2)
    })

    it('returns correct count for longer strings', () => {
      const transforms = BurrowsWheeler.getTransforms('abc')
      expect(transforms).toHaveLength(4)
    })
  })

  // ─── Round-trip Integrity ───

  describe('round-trip integrity', () => {
    it('round-trips a string of all same characters', () => {
      const original = 'zzzzz'
      const { transformed, originalIndex } = bwtEncode(original)
      expect(bwtDecode(transformed, originalIndex)).toBe(original)
    })

    it('round-trips a single character string', () => {
      const original = 'm'
      const { transformed, originalIndex } = bwtEncode(original)
      expect(bwtDecode(transformed, originalIndex)).toBe(original)
    })

    it('round-trips a two-character string', () => {
      const original = 'ab'
      const { transformed, originalIndex } = bwtEncode(original)
      expect(bwtDecode(transformed, originalIndex)).toBe(original)
    })
  })
})
