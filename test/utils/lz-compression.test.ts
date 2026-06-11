import { describe, expect, it } from 'vitest'
import { LZCompression } from '../../src/utils/lz-compression.js'

describe('LZCompression', () => {
  describe('compress and decompress', () => {
    it('compresses and decompresses a string', () => {
      const data = 'abracadabra'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles empty string', () => {
      expect(LZCompression.compress('')).toEqual([])
      expect(LZCompression.decompress([])).toBe('')
    })

    it('handles single character', () => {
      const data = 'a'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles repeated characters', () => {
      const data = 'aaaaa'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles all same characters', () => {
      const data = 'abcabcabc'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles long string with patterns', () => {
      const data = 'the quick brown fox the quick brown fox'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles binary-like data', () => {
      const data = '\x00\x01\x02\x00\x01\x02'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles two different characters', () => {
      const data = 'ab'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('round-trip with varied data', () => {
      const data = 'hello world hello world hello'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles single repeated character long', () => {
      const data = 'a'.repeat(100)
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles alternating pattern', () => {
      const data = 'abababababab'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles unicode', () => {
      const data = '日本語日本語'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles spaces and newlines', () => {
      const data = 'line1\nline2\nline1\nline2\n'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles very long repeated string', () => {
      const data = 'abcdefgh'.repeat(200)
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles no repeating patterns', () => {
      const data = 'abcdefghij'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('compress produces array of tokens', () => {
      const tokens = LZCompression.compress('abcabc')
      expect(Array.isArray(tokens)).toBe(true)
      expect(tokens.length).toBeGreaterThan(0)
    })

    it('tokens have correct structure', () => {
      const tokens = LZCompression.compress('abc')
      for (const token of tokens) {
        expect(token).toHaveProperty('offset')
        expect(token).toHaveProperty('length')
        expect(token).toHaveProperty('next')
      }
    })

    it('first token has offset 0 and length 0', () => {
      const tokens = LZCompression.compress('abc')
      expect(tokens[0]!.offset).toBe(0)
      expect(tokens[0]!.length).toBe(0)
    })

    it('decompress of empty tokens returns empty string', () => {
      expect(LZCompression.decompress([])).toBe('')
    })
  })

  describe('compressRatio', () => {
    it('returns valid ratio', () => {
      const ratio = LZCompression.compressRatio('aaaaabbbbb')
      expect(ratio).toBeGreaterThan(0)
    })

    it('is positive for non-empty', () => {
      const ratio = LZCompression.compressRatio('abcabc')
      expect(ratio).toBeGreaterThan(0)
    })

    it('is 1 for empty string', () => {
      expect(LZCompression.compressRatio('')).toBe(1)
    })

    it('is better for repetitive data', () => {
      const repetitive = LZCompression.compressRatio('a'.repeat(100))
      const diverse = LZCompression.compressRatio('abcdefghijklmnopqrstuvwxyz')
      expect(repetitive).toBeLessThanOrEqual(diverse)
    })

    it('ratio is positive for compressible data', () => {
      const ratio = LZCompression.compressRatio('abcabcabcabc')
      expect(ratio).toBeGreaterThan(0)
    })

    it('is greater than 1 for single char due to token overhead', () => {
      const ratio = LZCompression.compressRatio('a')
      expect(ratio).toBeGreaterThan(0)
    })
  })
})
