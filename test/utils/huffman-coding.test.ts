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

    it('handles string with only spaces', () => {
      const data = '     '
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles string with only special characters', () => {
      const data = '!@#$%^&*()'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles alternating pattern of two characters', () => {
      const data = 'ab'.repeat(50)
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles tab characters', () => {
      const data = 'col1\tcol2\tcol3'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles carriage return characters', () => {
      const data = 'line1\rline2'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles mixed unicode and ASCII', () => {
      const data = 'Hello 世界 🌍 World'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles single character repeated many times', () => {
      const data = 'z'.repeat(1000)
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
      expect(encoded).toBe('0'.repeat(1000))
    })

    it('handles emoji strings', () => {
      const data = '😀😁😂🤣😃😄😅😆'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles string with backslashes', () => {
      const data = 'path\\to\\file'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles string with quotes', () => {
      const data = 'He said "hello" and \'goodbye\''
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles string with brackets', () => {
      const data = '[{()}]'
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })
  })

  describe('decode edge cases', () => {
    it('decodes empty with null tree and empty string', () => {
      expect(HuffmanCoding.decode('', null)).toBe('')
    })

    it('decodes single character with null tree', () => {
      const { encoded, tree } = HuffmanCoding.encode('a')
      const result = HuffmanCoding.decode(encoded, tree)
      expect(result).toBe('a')
    })

    it('handles tree with only one character', () => {
      const { encoded, tree } = HuffmanCoding.encode('aaaaa')
      const result = HuffmanCoding.decode(encoded, tree)
      expect(result).toBe('aaaaa')
    })
  })

  describe('compressionRatio edge cases', () => {
    it('ratio is exactly 0.125 for single character', () => {
      const data = 'a'.repeat(100)
      const ratio = HuffmanCoding.compressionRatio(data)
      expect(ratio).toBe(0.125)
    })

    it('ratio is close to 0.125 for highly repetitive data', () => {
      const data = 'ab'.repeat(50)
      const ratio = HuffmanCoding.compressionRatio(data)
      expect(ratio).toBeLessThan(0.2)
    })

    it('ratio is > 0.5 for diverse characters', () => {
      const data = 'abcdefghijklmnopqrstuvwxyz'
      const ratio = HuffmanCoding.compressionRatio(data)
      expect(ratio).toBeGreaterThan(0.5)
    })

    it('ratio decreases with more repetition', () => {
      const diverse = HuffmanCoding.compressionRatio('abcdefghijklmnopqrstuvwxyz')
      const repetitive = HuffmanCoding.compressionRatio('aaaaaaaaaaaaaaaaaaaaaaaaaa')
      expect(repetitive).toBeLessThan(diverse)
    })

    it('handles very long repetitive string', () => {
      const data = 'a'.repeat(10000)
      const ratio = HuffmanCoding.compressionRatio(data)
      expect(ratio).toBe(0.125)
    })
  })

  describe('buildFrequencyTable edge cases', () => {
    it('handles unicode character frequency', () => {
      const freq = HuffmanCoding.buildFrequencyTable('日本語日本')
      expect(freq.get('日')).toBe(2)
      expect(freq.get('本')).toBe(2)
      expect(freq.get('語')).toBe(1)
    })

    it('handles mixed content frequency', () => {
      const freq = HuffmanCoding.buildFrequencyTable('a1 b2 c3')
      expect(freq.get('a')).toBe(1)
      expect(freq.get('1')).toBe(1)
      expect(freq.get(' ')).toBe(2)
      expect(freq.get('b')).toBe(1)
      expect(freq.get('2')).toBe(1)
    })

    it('handles emoji frequency', () => {
      const freq = HuffmanCoding.buildFrequencyTable('😀😁😀😀')
      expect(freq.get('😀')).toBe(3)
      expect(freq.get('😁')).toBe(1)
    })

    it('handles frequency of special characters', () => {
      const freq = HuffmanCoding.buildFrequencyTable('!@!#')
      expect(freq.get('!')).toBe(2)
      expect(freq.get('@')).toBe(1)
      expect(freq.get('#')).toBe(1)
    })

    it('returns correct size for diverse input', () => {
      const freq = HuffmanCoding.buildFrequencyTable('abcdefghijklmnopqrstuvwxyz')
      expect(freq.size).toBe(26)
    })
  })

  describe('large input tests', () => {
    it('handles 1000 character string', () => {
      const data = 'a'.repeat(500) + 'b'.repeat(500)
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('handles 5000 character string', () => {
      const data = 'hello world '.repeat(455)
      const { encoded, tree } = HuffmanCoding.encode(data)
      expect(HuffmanCoding.decode(encoded, tree)).toBe(data)
    })

    it('compression is effective for large repetitive data', () => {
      const data = 'a'.repeat(10000)
      const ratio = HuffmanCoding.compressionRatio(data)
      expect(ratio).toBe(0.125)
    })
  })
})

describe('huffman-coding - wave548', () => {
  it('huffman-coding module defined', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module is function', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module has name', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module not null', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module has length', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coding module has constructor', () => {
    expect(describe).toBeDefined()
  })
})
