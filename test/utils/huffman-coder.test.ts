import { describe, it, expect } from 'vitest'
import { HuffmanCoder } from '../../src/utils/huffman-coder.js'

describe('HuffmanCoder', () => {
  it('encodes empty string', () => {
    const coder = new HuffmanCoder()
    const result = coder.encode('')
    expect(result.encoded).toBe('')
    expect(result.tree).toBeNull()
  })

  it('decodes empty string with null tree', () => {
    const coder = new HuffmanCoder()
    const decoded = coder.decode('', null)
    expect(decoded).toBe('')
  })

  it('encodes single character', () => {
    const coder = new HuffmanCoder()
    const result = coder.encode('a')
    expect(result.encoded).toBe('0')
    expect(result.tree).not.toBeNull()
    expect(result.tree!.char).toBe('a')
  })

  it('decodes single character', () => {
    const coder = new HuffmanCoder()
    const encoded = coder.encode('a')
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe('a')
  })

  it('encodes simple string with two characters', () => {
    const coder = new HuffmanCoder()
    const result = coder.encode('ab')
    expect(result.encoded.length).toBeGreaterThan(0)
    expect(result.tree).not.toBeNull()
  })

  it('decodes simple string with two characters', () => {
    const coder = new HuffmanCoder()
    const encoded = coder.encode('ab')
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe('ab')
  })

  it('encodes string with repeated characters', () => {
    const coder = new HuffmanCoder()
    const result = coder.encode('aaabbc')
    expect(result.encoded.length).toBeGreaterThan(0)
    expect(result.tree).not.toBeNull()
  })

  it('decodes string with repeated characters', () => {
    const coder = new HuffmanCoder()
    const encoded = coder.encode('aaabbc')
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe('aaabbc')
  })

  it('encodes longer text', () => {
    const coder = new HuffmanCoder()
    const text = 'hello world'
    const result = coder.encode(text)
    expect(result.encoded.length).toBeGreaterThan(0)
    expect(result.tree).not.toBeNull()
  })

  it('decodes longer text', () => {
    const coder = new HuffmanCoder()
    const text = 'hello world'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('produces shorter encoded length than original for repeated patterns', () => {
    const coder = new HuffmanCoder()
    const text = 'aaaaabbbbbcccccdddddeeeee'
    const encoded = coder.encode(text)
    const originalBits = text.length * 8
    expect(encoded.encoded.length).toBeLessThan(originalBits)
  })

  it('handles special characters', () => {
    const coder = new HuffmanCoder()
    const text = '!@#$%^&*()'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles whitespace characters', () => {
    const coder = new HuffmanCoder()
    const text = 'a b c d e'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles numeric strings', () => {
    const coder = new HuffmanCoder()
    const text = '1234567890'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles unicode characters', () => {
    const coder = new HuffmanCoder()
    const text = 'héllo wørld'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('roundtrips complex text', () => {
    const coder = new HuffmanCoder()
    const text = 'The quick brown fox jumps over the lazy dog. 1234567890 !@#$%'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('decodes with null tree returns empty string', () => {
    const coder = new HuffmanCoder()
    const decoded = coder.decode('101010', null)
    expect(decoded).toBe('')
  })

  it('decodes empty encoded with valid tree returns empty string', () => {
    const coder = new HuffmanCoder()
    const encoded = coder.encode('a')
    const decoded = coder.decode('', encoded.tree)
    expect(decoded).toBe('')
  })

  it('repeatedly encodes same string', () => {
    const coder = new HuffmanCoder()
    const text = 'test string'
    const result1 = coder.encode(text)
    const result2 = coder.encode(text)
    expect(result1.encoded).toBe(result2.encoded)
  })

  it('handles single character repeated many times', () => {
    const coder = new HuffmanCoder()
    const text = 'a'.repeat(100)
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('encode returns object with encoded and tree', () => {
    const coder = new HuffmanCoder()
    const text = 'abc'
    const result = coder.encode(text)
    expect(result).toHaveProperty('encoded')
    expect(result).toHaveProperty('tree')
  })

  it('decode recovers original', () => {
    const coder = new HuffmanCoder()
    const text = 'abc'
    const result = coder.encode(text)
    const decoded = coder.decode(result.encoded, result.tree)
    expect(decoded).toBe(text)
  })
})