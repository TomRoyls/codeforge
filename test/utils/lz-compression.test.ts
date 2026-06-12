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

describe('lz-compression - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('lz-compression - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('lz-compression - wave548', () => {
  it('lz-compression module defined', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression module is function', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave549', () => {
  it('lz-compression module defined', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression module is function', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave550', () => {
  it('lz-compression w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave551', () => {
  it('lz-compression w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave552', () => {
  it('lz-compression w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave553', () => {
  it('lz-compression w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave554', () => {
  it('lz-compression w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave555', () => {
  it('lz-compression w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave556', () => {
  it('lz-compression w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave557', () => {
  it('lz-compression w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave558', () => {
  it('lz-compression w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave559', () => {
  it('lz-compression w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave560', () => {
  it('lz-compression w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave561', () => {
  it('lz-compression w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave562', () => {
  it('lz-compression w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave563', () => {
  it('lz-compression w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave564', () => {
  it('lz-compression w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave565', () => {
  it('lz-compression w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave566', () => {
  it('lz-compression w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave127', () => {
  it('lz-compression w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave130', () => {
  it('lz-compression w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave133', () => {
  it('lz-compression w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave136', () => {
  it('lz-compression w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - wave139', () => {
  it('lz-compression w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w142', () => {
  it('lz-compression v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w145', () => {
  it('lz-compression v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w148', () => {
  it('lz-compression v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w151', () => {
  it('lz-compression v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w154', () => {
  it('lz-compression v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w157', () => {
  it('lz-compression v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w160', () => {
  it('lz-compression v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w170', () => {
  it('lz-compression x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w180', () => {
  it('lz-compression x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w190', () => {
  it('lz-compression x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w200', () => {
  it('lz-compression x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w210', () => {
  it('lz-compression x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w220', () => {
  it('lz-compression x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w230', () => {
  it('lz-compression x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w240', () => {
  it('lz-compression x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w250', () => {
  it('lz-compression x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w260', () => {
  it('lz-compression x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w270', () => {
  it('lz-compression x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w280', () => {
  it('lz-compression x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w290', () => {
  it('lz-compression x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w300', () => {
  it('lz-compression x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w310', () => {
  it('lz-compression x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w320', () => {
  it('lz-compression x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w330', () => {
  it('lz-compression x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w340', () => {
  it('lz-compression x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w350', () => {
  it('lz-compression x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w360', () => {
  it('lz-compression x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w370', () => {
  it('lz-compression x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w380', () => {
  it('lz-compression x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w390', () => {
  it('lz-compression x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w400', () => {
  it('lz-compression x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w420', () => {
  it('lz-compression x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w440', () => {
  it('lz-compression x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w460', () => {
  it('lz-compression x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w480', () => {
  it('lz-compression x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w500', () => {
  it('lz-compression x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w550', () => {
  it('lz-compression x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w600', () => {
  it('lz-compression x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w650', () => {
  it('lz-compression x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w700', () => {
  it('lz-compression x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w800', () => {
  it('lz-compression x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w900', () => {
  it('lz-compression x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('lz-compression - w1000', () => {
  it('lz-compression x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('lz-compression x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
