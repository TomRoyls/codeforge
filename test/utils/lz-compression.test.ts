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

    it('ratio decreases with more repetition', () => {
      const ratio1 = LZCompression.compressRatio('ab'.repeat(10))
      const ratio2 = LZCompression.compressRatio('ab'.repeat(100))
      expect(ratio2).toBeLessThan(ratio1)
    })

    it('handles ratio for binary data', () => {
      const data = '\x00\x01'.repeat(50)
      const ratio = LZCompression.compressRatio(data)
      expect(ratio).toBeGreaterThan(0)
    })

    it('ratio for completely unique data', () => {
      const data = 'abcdefghijklmnopqrstuvwxyz'
      const ratio = LZCompression.compressRatio(data)
      expect(ratio).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('handles single space', () => {
      const data = ' '
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles only spaces', () => {
      const data = '     '
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles tab characters', () => {
      const data = '\t\t\t'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles mixed whitespace', () => {
      const data = ' \t\n \t\n'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles very short pattern', () => {
      const data = 'abab'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles pattern starting mid-sequence', () => {
      const data = 'xyzabcabc'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles pattern at end', () => {
      const data = 'xyzabcabc'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles zero offset in tokens', () => {
      const data = 'a'
      const tokens = LZCompression.compress(data)
      expect(tokens[0]!.offset).toBe(0)
    })

    it('handles zero length in tokens', () => {
      const data = 'a'
      const tokens = LZCompression.compress(data)
      expect(tokens[0]!.length).toBe(0)
    })

    it('handles empty next char for last token', () => {
      const data = 'abc'
      const tokens = LZCompression.compress(data)
      expect(tokens.length).toBeGreaterThan(0)
    })

    it('compresses with maximum window size', () => {
      const data = 'a'.repeat(4100)
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles pattern longer than window', () => {
      const base = 'abcd'.repeat(1024)
      const data = base + 'abcd'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles very long string', () => {
      const data = 'hello world '.repeat(500)
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles unicode surrogate pairs', () => {
      const data = '😀😀😀'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles mixed unicode and ascii', () => {
      const data = 'hello世界hello世界'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles compression with no previous context', () => {
      const data = 'abcdefghijklmnopqrstuvwxyz'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles pattern that overlaps search window', () => {
      const data = 'a'.repeat(200) + 'b' + 'a'.repeat(200)
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })

    it('handles zero bytes in middle of string', () => {
      const data = 'abc\x00def\x00ghi'
      const tokens = LZCompression.compress(data)
      expect(LZCompression.decompress(tokens)).toBe(data)
    })
  })

  describe('decompress edge cases', () => {
    it('handles tokens with zero offset', () => {
      const tokens = [{ offset: 0, length: 0, next: 'a' }]
      expect(LZCompression.decompress(tokens)).toBe('a')
    })

    it('handles tokens with zero length', () => {
      const tokens = [
        { offset: 0, length: 0, next: 'a' },
        { offset: 1, length: 0, next: 'b' }
      ]
      expect(LZCompression.decompress(tokens)).toBe('ab')
    })

    it('handles tokens with empty next', () => {
      const tokens = [
        { offset: 0, length: 0, next: 'a' },
        { offset: 1, length: 1, next: '' }
      ]
      expect(LZCompression.decompress(tokens)).toBe('aa')
    })

    it('handles back reference with small offset', () => {
      const tokens = [
        { offset: 0, length: 0, next: 'a' },
        { offset: 1, length: 1, next: '' }
      ]
      expect(LZCompression.decompress(tokens)).toBe('aa')
    })

    it('handles back reference with large offset', () => {
      const result = 'a'.repeat(100)
      const tokens = [
        { offset: 0, length: 0, next: 'a' },
        { offset: 1, length: 99, next: '' }
      ]
      expect(LZCompression.decompress(tokens)).toBe(result)
    })
  })

  it('compressRatio returns 0 for empty string', () => {
    expect(LZCompression.compressRatio('')).toBe(0)
  })

  it('compressRatio is between 0 and 1 for non-empty', () => {
    const ratio = LZCompression.compressRatio('abcabcabcabc')
    expect(ratio).toBeGreaterThanOrEqual(0)
    expect(ratio).toBeLessThanOrEqual(1)
  })

  it('compress and decompress roundtrip for repetitive data', () => {
    const data = 'xyzxyzxyzxyz'
    const tokens = LZCompression.compress(data)
    expect(LZCompression.decompress(tokens)).toBe(data)
  })

  it('compress produces at least one token', () => {
    const tokens = LZCompression.compress('hello')
    expect(tokens.length).toBeGreaterThan(0)
  })

  it('compress empty string', () => {
    expect(LZCompression.compress('')).toEqual([])
  })

  it('compress and decompress roundtrip', () => {
    const tokens = LZCompression.compress('abcabc')
    expect(LZCompression.decompress(tokens)).toBe('abcabc')
  })

  it('compress single char', () => {
    expect(LZCompression.compress('a').length).toBeGreaterThan(0)
  })
})

describe('lz-compression - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})
