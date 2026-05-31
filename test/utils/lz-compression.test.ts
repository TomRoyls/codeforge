import { describe, expect, it } from 'vitest'
import { LZCompression } from '../../src/utils/lz-compression.js'

describe('LZCompression', () => {
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

  it('compressionRatio returns valid ratio', () => {
    const ratio = LZCompression.compressRatio('aaaaabbbbb')
    expect(ratio).toBeGreaterThan(0)
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
})
