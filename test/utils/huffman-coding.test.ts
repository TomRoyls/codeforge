import { describe, expect, it } from 'vitest'
import { HuffmanCoding } from '../../src/utils/huffman-coding.js'

describe('HuffmanCoding', () => {
  it('encodes and decodes a string', () => {
    const { encoded, tree } = HuffmanCoding.encode('abracadabra')
    expect(HuffmanCoding.decode(encoded, tree)).toBe('abracadabra')
  })

  it('handles single character string', () => {
    const { encoded, tree } = HuffmanCoding.encode('aaaaa')
    expect(HuffmanCoding.decode(encoded, tree)).toBe('aaaaa')
  })

  it('handles empty string', () => {
    const { encoded, tree } = HuffmanCoding.encode('')
    expect(encoded).toBe('')
    expect(HuffmanCoding.decode('', tree)).toBe('')
  })

  it('handles two characters', () => {
    const { encoded, tree } = HuffmanCoding.encode('aabb')
    expect(HuffmanCoding.decode(encoded, tree)).toBe('aabb')
  })

  it('encoded string is shorter than original for repeated chars', () => {
    const { encoded } = HuffmanCoding.encode('aaaaabbbbb')
    const originalBits = 10 * 8
    expect(encoded.length).toBeLessThan(originalBits)
  })

  it('compressionRatio is between 0 and 1 for repeated data', () => {
    const ratio = HuffmanCoding.compressionRatio('aaaaabbbbb')
    expect(ratio).toBeGreaterThan(0)
    expect(ratio).toBeLessThanOrEqual(1)
  })

  it('buildFrequencyTable counts correctly', () => {
    const freq = HuffmanCoding.buildFrequencyTable('aab')
    expect(freq.get('a')).toBe(2)
    expect(freq.get('b')).toBe(1)
  })

  it('handles all unique characters', () => {
    const { encoded, tree } = HuffmanCoding.encode('abcde')
    expect(HuffmanCoding.decode(encoded, tree)).toBe('abcde')
  })

  it('handles single character', () => {
    const { encoded, tree } = HuffmanCoding.encode('x')
    expect(HuffmanCoding.decode(encoded, tree)).toBe('x')
  })

  it('round-trip with long string', () => {
    const data = 'the quick brown fox jumps over the lazy dog'
    const { encoded, tree } = HuffmanCoding.encode(data)
    expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
  })

  it('handles repeated same word', () => {
    const data = 'hello hello hello'
    const { encoded, tree } = HuffmanCoding.encode(data)
    expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
  })

  it('handles single character', () => {
    const data = 'a'
    const { encoded, tree } = HuffmanCoding.encode(data)
    expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
  })

  it('handles two distinct characters', () => {
    const data = 'ab'
    const { encoded, tree } = HuffmanCoding.encode(data)
    expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
  })

  it('handles all same characters', () => {
    const data = 'aaaa'
    const { encoded, tree } = HuffmanCoding.encode(data)
    expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
  })

  it('handles numeric string', () => {
    const data = '112233'
    const { encoded, tree } = HuffmanCoding.encode(data)
    expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
  })

  it('handles single character string', () => {
    const data = 'aaaa'
    const { encoded, tree } = HuffmanCoding.encode(data)
    expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
  })

  it('handles single character', () => {
    const data = 'a'
    const { encoded, tree } = HuffmanCoding.encode(data)
    expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
  })

  it('encode and decode repeated characters', () => {
    const data = 'aaaa'
    const { encoded, tree } = HuffmanCoding.encode(data)
    expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
  })

  it('single character roundtrip', () => {
    const data = 'a'
    const { encoded, tree } = HuffmanCoding.encode(data)
    expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
  })
})
