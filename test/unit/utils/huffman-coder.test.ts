import { describe, it, expect } from 'vitest'
import { HuffmanCoder } from '../../../src/utils/huffman-coder.js'

describe('HuffmanCoder', () => {
  describe('encode', () => {
    it('encodes a simple string', () => {
      const coder = new HuffmanCoder()
      const result = coder.encode('aabbbc')
      expect(result.encoded.length).toBeGreaterThan(0)
      expect(result.tree).not.toBeNull()
    })

    it('handles empty string', () => {
      const coder = new HuffmanCoder()
      const result = coder.encode('')
      expect(result.encoded).toBe('')
      expect(result.tree).toBeNull()
    })

    it('handles single character', () => {
      const coder = new HuffmanCoder()
      const result = coder.encode('aaaa')
      expect(result.encoded).toBe('0000')
    })

    it('produces shorter encoding for repeated chars', () => {
      const coder = new HuffmanCoder()
      const result = coder.encode('aaaaab')
      const countA = (result.encoded.match(/./g) ?? []).length
      expect(countA).toBeLessThan(6 * 8)
    })

    it('handles all unique characters', () => {
      const coder = new HuffmanCoder()
      const result = coder.encode('abcdef')
      expect(result.encoded.length).toBeGreaterThan(0)
    })
  })

  describe('decode', () => {
    it('round-trips a string', () => {
      const coder = new HuffmanCoder()
      const original = 'hello world'
      const { encoded, tree } = coder.encode(original)
      const decoded = coder.decode(encoded, tree)
      expect(decoded).toBe(original)
    })

    it('round-trips repeated characters', () => {
      const coder = new HuffmanCoder()
      const original = 'aaabbbccc'
      const { encoded, tree } = coder.encode(original)
      const decoded = coder.decode(encoded, tree)
      expect(decoded).toBe(original)
    })

    it('handles empty decode', () => {
      const coder = new HuffmanCoder()
      expect(coder.decode('', null)).toBe('')
    })

    it('handles single character decode', () => {
      const coder = new HuffmanCoder()
      const { encoded, tree } = coder.encode('xxxxx')
      const decoded = coder.decode(encoded, tree)
      expect(decoded).toBe('xxxxx')
    })

    it('round-trips long text', () => {
      const coder = new HuffmanCoder()
      const original = 'the quick brown fox jumps over the lazy dog'
      const { encoded, tree } = coder.encode(original)
      const decoded = coder.decode(encoded, tree)
      expect(decoded).toBe(original)
    })

    it('round-trips binary-ish data', () => {
      const coder = new HuffmanCoder()
      const original = '0101010100011'
      const { encoded, tree } = coder.encode(original)
      const decoded = coder.decode(encoded, tree)
      expect(decoded).toBe(original)
    })
  })

  describe('compression ratio', () => {
    it('compresses repetitive text', () => {
      const coder = new HuffmanCoder()
      const original = 'a'.repeat(100)
      const { encoded } = coder.encode(original)
      expect(encoded.length).toBeLessThan(original.length * 8)
    })
  })
})
