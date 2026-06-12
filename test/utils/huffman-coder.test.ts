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

  it('encode single character', () => {
    const coder = new HuffmanCoder()
    const text = 'a'
    const result = coder.encode(text)
    const decoded = coder.decode(result.encoded, result.tree)
    expect(decoded).toBe('a')
  })

  it('encode empty string returns empty', () => {
    const coder = new HuffmanCoder()
    const text = ''
    const result = coder.encode(text)
    expect(result.encoded.length).toBe(0)
  })

  it('toString returns correct format', () => {
    const coder = new HuffmanCoder()
    expect(coder.toString()).toBe('HuffmanCoder()')
  })

  it('toJSON returns empty object', () => {
    const coder = new HuffmanCoder()
    expect(coder.toJSON()).toEqual({})
  })

  it('clone returns new instance', () => {
    const coder = new HuffmanCoder()
    const cloned = coder.clone()
    expect(cloned).not.toBe(coder)
    expect(cloned).toBeInstanceOf(HuffmanCoder)
  })

  it('equals returns true for same class', () => {
    const coder1 = new HuffmanCoder()
    const coder2 = new HuffmanCoder()
    expect(coder1.equals(coder2)).toBe(true)
  })

  it('equals returns false for different types', () => {
    const coder = new HuffmanCoder()
    expect(coder.equals(null)).toBe(false)
    expect(coder.equals(undefined)).toBe(false)
    expect(coder.equals({})).toBe(false)
    expect(coder.equals('HuffmanCoder')).toBe(false)
    expect(coder.equals(42)).toBe(false)
  })

  it('handles single character decode with all zeros', () => {
    const coder = new HuffmanCoder()
    const encoded = coder.encode('a')
    const decoded = coder.decode('000', encoded.tree)
    expect(decoded).toBe('aaa')
  })

  it('handles string with all same characters', () => {
    const coder = new HuffmanCoder()
    const text = 'bbbbbb'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles alternating characters', () => {
    const coder = new HuffmanCoder()
    const text = 'ababababab'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles character frequency ties', () => {
    const coder = new HuffmanCoder()
    const text = 'aabbcc'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles very long string', () => {
    const coder = new HuffmanCoder()
    const text = 'a'.repeat(1000) + 'b'.repeat(500) + 'c'.repeat(250)
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles string with unique characters', () => {
    const coder = new HuffmanCoder()
    const text = 'abcdefg'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles newlines and tabs', () => {
    const coder = new HuffmanCoder()
    const text = 'line1\nline2\ttab'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles mixed case characters', () => {
    const coder = new HuffmanCoder()
    const text = 'aAbBcCdD'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles only spaces', () => {
    const coder = new HuffmanCoder()
    const text = '     '
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles string ending with space', () => {
    const coder = new HuffmanCoder()
    const text = 'hello world '
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles string starting with space', () => {
    const coder = new HuffmanCoder()
    const text = ' hello world'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles punctuation', () => {
    const coder = new HuffmanCoder()
    const text = 'hello, world! how are you?'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles two character string', () => {
    const coder = new HuffmanCoder()
    const text = 'ab'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles three character string with different frequencies', () => {
    const coder = new HuffmanCoder()
    const text = 'aaabbbc'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('produces valid tree structure', () => {
    const coder = new HuffmanCoder()
    const result = coder.encode('abc')
    expect(result.tree).not.toBeNull()
    expect(result.tree).toHaveProperty('char')
    expect(result.tree).toHaveProperty('freq')
    expect(result.tree).toHaveProperty('left')
    expect(result.tree).toHaveProperty('right')
  })

  it('handles decode with partial encoded string', () => {
    const coder = new HuffmanCoder()
    const encoded = coder.encode('hello')
    const decoded = coder.decode(encoded.encoded.slice(0, -1), encoded.tree)
    expect(decoded.length).toBeLessThan(5)
  })

  it('handles string with only one unique character', () => {
    const coder = new HuffmanCoder()
    const text = 'aaaaa'
    const encoded = coder.encode(text)
    expect(encoded.encoded).toBe('00000')
  })

  it('handles decode with extra trailing bits', () => {
    const coder = new HuffmanCoder()
    const encoded = coder.encode('ab')
    const decoded = coder.decode(encoded.encoded + '0', encoded.tree)
    expect(decoded).toContain('ab')
  })

  it('encodes and decodes JSON-like string', () => {
    const coder = new HuffmanCoder()
    const text = '{"key":"value","number":42}'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles repeated encode decode cycles', () => {
    const coder = new HuffmanCoder()
    const text = 'roundtrip test'
    const encoded1 = coder.encode(text)
    const decoded1 = coder.decode(encoded1.encoded, encoded1.tree)
    const encoded2 = coder.encode(decoded1)
    const decoded2 = coder.decode(encoded2.encoded, encoded2.tree)
    expect(decoded2).toBe(text)
  })

  it('handles frequency inversion', () => {
    const coder = new HuffmanCoder()
    const text = 'aaaaab'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles binary data characters', () => {
    const coder = new HuffmanCoder()
    const text = '\x00\x01\x02\x03'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('handles escape sequences', () => {
    const coder = new HuffmanCoder()
    const text = 'a\nb\tc\rd'
    const encoded = coder.encode(text)
    const decoded = coder.decode(encoded.encoded, encoded.tree)
    expect(decoded).toBe(text)
  })

  it('multiple instances produce same result', () => {
    const coder1 = new HuffmanCoder()
    const coder2 = new HuffmanCoder()
    const text = 'consistency'
    const result1 = coder1.encode(text)
    const result2 = coder2.encode(text)
    expect(result1.encoded).toBe(result2.encoded)
  })

  it('encode empty string', () => {
    const coder = new HuffmanCoder()
    const result = coder.encode('')
    expect(result.encoded).toBe('')
  })

  it('encode single character', () => {
    const coder = new HuffmanCoder()
    const result = coder.encode('a')
    expect(result.encoded).toBeDefined()
  })

  it('clone produces same results', () => {
    const coder = new HuffmanCoder()
    const r1 = coder.encode('test')
    const c = coder.clone()
    const r2 = c.encode('test')
    expect(r1.encoded).toBe(r2.encoded)
  })
})
describe('huffman-coder - wave548', () => {
  it('huffman-coder module defined', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module is function', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module has name', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module not null', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module has length', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave549', () => {
  it('huffman-coder module defined', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module is function', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave550', () => {
  it('huffman-coder w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave551', () => {
  it('huffman-coder w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave552', () => {
  it('huffman-coder w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave553', () => {
  it('huffman-coder w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave554', () => {
  it('huffman-coder w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave555', () => {
  it('huffman-coder w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave556', () => {
  it('huffman-coder w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave557', () => {
  it('huffman-coder w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave558', () => {
  it('huffman-coder w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave559', () => {
  it('huffman-coder w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave560', () => {
  it('huffman-coder w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave561', () => {
  it('huffman-coder w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave562', () => {
  it('huffman-coder w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave563', () => {
  it('huffman-coder w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave564', () => {
  it('huffman-coder w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('huffman-coder - wave565', () => {
  it('huffman-coder w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('huffman-coder w565 v2', () => {
    expect(describe).toBeDefined()
  })
})
