import { describe, expect, it } from 'vitest'
import { HuffmanCoding } from '../../src/utils/huffman-coding.js'

describe('HuffmanCoding', () => {
  describe('encode', () => {
    it('encodes a string to binary string', () => {
      const { encoded } = HuffmanCoding.encode('abracadabra')
      expect(typeof encoded).toBe('string')
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('returns tree for decoding', () => {
      const { tree } = HuffmanCoding.encode('abc')
      expect(tree).not.toBeNull()
    })

    it('handles empty string', () => {
      const { encoded, tree } = HuffmanCoding.encode('')
      expect(encoded).toBe('')
    })

    it('handles single character', () => {
      const { encoded, tree } = HuffmanCoding.encode('a')
      expect(HuffmanCoding.decode(encoded, tree)).toBe('a')
    })

    it('handles repeated single character', () => {
      const { encoded, tree } = HuffmanCoding.encode('aaaaa')
      expect(HuffmanCoding.decode(encoded, tree)).toBe('aaaaa')
    })

    it('handles two characters', () => {
      const { encoded, tree } = HuffmanCoding.encode('ab')
      expect(HuffmanCoding.decode(encoded, tree)).toBe('ab')
    })

    it('handles all unique characters', () => {
      const { encoded, tree } = HuffmanCoding.encode('abcde')
      expect(HuffmanCoding.decode(encoded, tree)).toBe('abcde')
    })

    it('encoded is shorter than raw bits for repeated data', () => {
      const { encoded } = HuffmanCoding.encode('aaaaabbbbb')
      expect(encoded.length).toBeLessThan(10 * 8)
    })

    it('handles spaces and special characters', () => {
      const data = 'hello world!'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles numeric string', () => {
      const data = '1122334455'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })
  })

  describe('decode', () => {
    it('round-trips abracadabra', () => {
      const { encoded, tree } = HuffmanCoding.encode('abracadabra')
      expect(HuffmanCoding.decode(encoded, tree)).toBe('abracadabra')
    })

    it('round-trips long string', () => {
      const data = 'the quick brown fox jumps over the lazy dog'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('round-trips repeated word', () => {
      const data = 'hello hello hello'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('decodes empty with null tree', () => {
      expect(HuffmanCoding.decode('', null)).toBe('')
    })

    it('round-trips single repeated char', () => {
      const data = 'zzzzzzzzzz'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })
  })

  describe('compressionRatio', () => {
    it('returns ratio between 0 and 1 for repeated data', () => {
      const ratio = HuffmanCoding.compressionRatio('aaaaabbbbb')
      expect(ratio).toBeGreaterThan(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })

    it('returns 1 or less for unique characters', () => {
      const ratio = HuffmanCoding.compressionRatio('abcdef')
      expect(ratio).toBeGreaterThan(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })

    it('returns 1 for empty string (no compression)', () => {
      expect(HuffmanCoding.compressionRatio('')).toBe(1)
    })

    it('better ratio for highly repetitive data', () => {
      const repetitive = HuffmanCoding.compressionRatio('a'.repeat(100))
      const diverse = HuffmanCoding.compressionRatio('abcdefghijklmnopqrstuvwxyz')
      expect(repetitive).toBeLessThan(diverse)
    })
  })

  describe('buildFrequencyTable', () => {
    it('counts characters correctly', () => {
      const freq = HuffmanCoding.buildFrequencyTable('aab')
      expect(freq.get('a')).toBe(2)
      expect(freq.get('b')).toBe(1)
    })

    it('returns empty map for empty string', () => {
      const freq = HuffmanCoding.buildFrequencyTable('')
      expect(freq.size).toBe(0)
    })

    it('counts single character', () => {
      const freq = HuffmanCoding.buildFrequencyTable('x')
      expect(freq.get('x')).toBe(1)
      expect(freq.size).toBe(1)
    })

    it('counts spaces', () => {
      const freq = HuffmanCoding.buildFrequencyTable('a a')
      expect(freq.get(' ')).toBe(1)
      expect(freq.get('a')).toBe(2)
    })

    it('handles all unique characters', () => {
      const freq = HuffmanCoding.buildFrequencyTable('abc')
      expect(freq.size).toBe(3)
      expect(freq.get('a')).toBe(1)
      expect(freq.get('b')).toBe(1)
      expect(freq.get('c')).toBe(1)
    })

    it('handles repeated characters', () => {
      const freq = HuffmanCoding.buildFrequencyTable('aaa')
      expect(freq.size).toBe(1)
      expect(freq.get('a')).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('handles unicode characters', () => {
      const data = 'café 日本語'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles very long string', () => {
      const data = 'abc'.repeat(1000)
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles string with only two distinct chars', () => {
      const data = 'abababab'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles newline characters', () => {
      const data = 'line1\nline2\nline3'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })
  })
})
