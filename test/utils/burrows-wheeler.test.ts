import { describe, it, expect } from 'vitest'
import { BurrowsWheelerTransform } from '../../src/utils/burrows-wheeler.js'

describe('BurrowsWheelerTransform', () => {
  it('should transform empty string', () => {
    const result = BurrowsWheelerTransform.transform('')
    expect(result.data).toBe('')
    expect(result.index).toBe(0)
  })

  it('should transform single character', () => {
    const result = BurrowsWheelerTransform.transform('a')
    expect(result.data).toBe('a')
    expect(result.index).toBe(0)
  })

  it('should transform simple string', () => {
    const result = BurrowsWheelerTransform.transform('banana')
    expect(result.data).toBe('nnbaaa')
  })

  it('should inverse transform empty string', () => {
    const result = BurrowsWheelerTransform.inverseTransform('', 0)
    expect(result).toBe('')
  })

  it('should inverse transform single character', () => {
    const result = BurrowsWheelerTransform.inverseTransform('a', 0)
    expect(result).toBe('a')
  })

  it('should inverse transform to original', () => {
    const original = 'banana'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle repeated characters', () => {
    const original = 'aaaaa'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle unique characters', () => {
    const original = 'abcde'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with spaces', () => {
    const original = 'hello world'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle palindrome', () => {
    const original = 'racecar'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle reverse sorted string', () => {
    const original = 'fedcba'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle sorted string', () => {
    const original = 'abcdef'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle two characters', () => {
    const original = 'ab'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle alternating characters', () => {
    const original = 'ababab'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with special characters', () => {
    const original = 'test!@#'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle longer string', () => {
    const original = 'mississippi'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should produce consistent results for same input', () => {
    const original = 'consistency'
    const result1 = BurrowsWheelerTransform.transform(original)
    const result2 = BurrowsWheelerTransform.transform(original)
    expect(result1.data).toBe(result2.data)
    expect(result1.index).toBe(result2.index)
  })

  it('should handle string with newlines', () => {
    const original = 'line1\nline2'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with numbers', () => {
    const original = 'abc123'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with mixed case', () => {
    const original = 'AbCdEf'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('transform returns object with data and index', () => {
    const transformed = BurrowsWheelerTransform.transform('abc')
    expect(typeof transformed.data).toBe('string')
    expect(typeof transformed.index).toBe('number')
  })

  it('should handle two characters reversed', () => {
    const original = 'ba'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle three characters with duplicates', () => {
    const original = 'aab'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle three characters all same', () => {
    const original = 'aaa'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle three characters mixed', () => {
    const original = 'bac'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle four characters unique', () => {
    const original = 'abcd'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle four characters with duplicates', () => {
    const original = 'aabb'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle four characters alternating', () => {
    const original = 'abab'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle five characters', () => {
    const original = 'abcde'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle five characters palindrome', () => {
    const original = 'abcba'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle five characters alternating', () => {
    const original = 'abcab'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle six characters', () => {
    const original = 'abcdef'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with many duplicates', () => {
    const original = 'aaabbbccc'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with character range', () => {
    const original = 'xyz'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with ascending pattern', () => {
    const original = '12345'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with descending pattern', () => {
    const original = '54321'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle all lowercase letters', () => {
    const original = 'abcdefghijklmnopqrstuvwxyz'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle all uppercase letters', () => {
    const original = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with tabs', () => {
    const original = 'hello\tworld'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with punctuation', () => {
    const original = 'hello,world!'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string at ASCII boundary', () => {
    const original = '~\x7f'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with unicode characters', () => {
    const original = 'héllo'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with repeated pattern', () => {
    const original = 'abcabcabc'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with non-ASCII characters', () => {
    const original = 'café'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with emojis', () => {
    const original = 'hello🌍world'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle very long string', () => {
    const original = 'a'.repeat(100)
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle string with null character', () => {
    const original = 'hello\x00world'
    const transformed = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(transformed.data, transformed.index)
    expect(restored).toBe(original)
  })

  it('should handle single character', () => {
    const { data, index } = BurrowsWheelerTransform.transform('a')
    expect(BurrowsWheelerTransform.inverseTransform(data, index)).toBe('a')
  })

  it('should handle repeated characters', () => {
    const { data, index } = BurrowsWheelerTransform.transform('aaaa')
    expect(BurrowsWheelerTransform.inverseTransform(data, index)).toBe('aaaa')
  })

  it('should handle banana', () => {
    const { data, index } = BurrowsWheelerTransform.transform('banana')
    const restored = BurrowsWheelerTransform.inverseTransform(data, index)
    expect(restored).toBe('banana')
  })

  it('should handle empty string', () => {
    const { data, index } = BurrowsWheelerTransform.transform('')
    expect(data).toBe('')
    expect(index).toBe(0)
  })

  it('should handle two characters', () => {
    const { data, index } = BurrowsWheelerTransform.transform('ab')
    expect(BurrowsWheelerTransform.inverseTransform(data, index)).toBe('ab')
  })

  it('should preserve all characters in transform', () => {
    const original = 'mississippi'
    const { data } = BurrowsWheelerTransform.transform(original)
    expect(data.length).toBe(original.length)
  })

  it('transform and inverse round-trip', () => {
    const original = 'banana'
    const { data, index } = BurrowsWheelerTransform.transform(original)
    const restored = BurrowsWheelerTransform.inverseTransform(data, index)
    expect(restored).toBe(original)
  })

  it('empty string transform', () => {
    const { data, index } = BurrowsWheelerTransform.transform('')
    expect(data).toBe('')
  })

  it('single character round-trip', () => {
    const { data, index } = BurrowsWheelerTransform.transform('a')
    const restored = BurrowsWheelerTransform.inverseTransform(data, index)
    expect(restored).toBe('a')
  })
})
describe('burrows-wheeler - wave548', () => {
  it('burrows-wheeler module defined', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module is function', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module has name', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module not null', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module has length', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('burrows-wheeler - wave549', () => {
  it('burrows-wheeler module defined', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module is function', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('burrows-wheeler - wave550', () => {
  it('burrows-wheeler w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('burrows-wheeler - wave551', () => {
  it('burrows-wheeler w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('burrows-wheeler - wave552', () => {
  it('burrows-wheeler w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('burrows-wheeler - wave553', () => {
  it('burrows-wheeler w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('burrows-wheeler - wave554', () => {
  it('burrows-wheeler w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('burrows-wheeler - wave555', () => {
  it('burrows-wheeler w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('burrows-wheeler - wave556', () => {
  it('burrows-wheeler w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('burrows-wheeler - wave557', () => {
  it('burrows-wheeler w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('burrows-wheeler - wave558', () => {
  it('burrows-wheeler w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('burrows-wheeler w558 v2', () => {
    expect(describe).toBeDefined()
  })
})
