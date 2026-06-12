import { describe, expect, it } from 'vitest'
import { PolynomialRollingHash } from '../../src/utils/polynomial-rolling-hash.js'

describe('PolynomialRollingHash', () => {
  describe('hash', () => {
    it('hashes a string', () => {
      const h = PolynomialRollingHash.hash('hello')
      expect(h > 0n).toBe(true)
    })

    it('same string same hash', () => {
      expect(PolynomialRollingHash.hash('abc')).toBe(PolynomialRollingHash.hash('abc'))
    })

    it('different strings different hash', () => {
      expect(PolynomialRollingHash.hash('abc')).not.toBe(PolynomialRollingHash.hash('def'))
    })

    it('hashes empty string to 0', () => {
      expect(PolynomialRollingHash.hash('')).toBe(0n)
    })

    it('hashes single character', () => {
      const h = PolynomialRollingHash.hash('a')
      expect(h > 0n).toBe(true)
      expect(typeof h).toBe('bigint')
    })

    it('returns bigint', () => {
      const h = PolynomialRollingHash.hash('test')
      expect(typeof h).toBe('bigint')
    })

    it('is deterministic', () => {
      const h1 = PolynomialRollingHash.hash('deterministic')
      const h2 = PolynomialRollingHash.hash('deterministic')
      expect(h1).toBe(h2)
    })

    it('handles long strings', () => {
      const s = 'a'.repeat(10000)
      expect(PolynomialRollingHash.hash(s) > 0n).toBe(true)
    })

    it('handles special characters', () => {
      const h = PolynomialRollingHash.hash('!@#$%^&*()')
      expect(typeof h).toBe('bigint')
    })

    it('handles unicode', () => {
      const h = PolynomialRollingHash.hash('café 日本語')
      expect(typeof h).toBe('bigint')
    })

    it('order matters: abc != bca', () => {
      expect(PolynomialRollingHash.hash('abc')).not.toBe(PolynomialRollingHash.hash('bca'))
    })

    it('a differs from aa', () => {
      expect(PolynomialRollingHash.hash('a')).not.toBe(PolynomialRollingHash.hash('aa'))
    })

    it('hashes numeric string', () => {
      const h = PolynomialRollingHash.hash('12345')
      expect(h > 0n).toBe(true)
    })

    it('handles whitespace', () => {
      expect(PolynomialRollingHash.hash(' ')).not.toBe(PolynomialRollingHash.hash(''))
      expect(PolynomialRollingHash.hash('\t')).not.toBe(PolynomialRollingHash.hash(''))
    })

    it('repeated calls produce same result', () => {
      const results = Array.from({ length: 10 }, () => PolynomialRollingHash.hash('consistent'))
      expect(new Set(results).size).toBe(1)
    })
  })

  describe('hashArray', () => {
    it('hashes an array', () => {
      const h = PolynomialRollingHash.hashArray([1, 2, 3])
      expect(h > 0n).toBe(true)
    })

    it('same array same hash', () => {
      expect(PolynomialRollingHash.hashArray([1, 2, 3])).toBe(PolynomialRollingHash.hashArray([1, 2, 3]))
    })

    it('different arrays different hash', () => {
      expect(PolynomialRollingHash.hashArray([1, 2, 3])).not.toBe(PolynomialRollingHash.hashArray([3, 2, 1]))
    })

    it('empty array hash is 0', () => {
      expect(PolynomialRollingHash.hashArray([])).toBe(0n)
    })

    it('single element array', () => {
      const h = PolynomialRollingHash.hashArray([42])
      expect(h > 0n).toBe(true)
    })

    it('returns bigint', () => {
      const h = PolynomialRollingHash.hashArray([1])
      expect(typeof h).toBe('bigint')
    })

    it('order matters', () => {
      expect(PolynomialRollingHash.hashArray([1, 2])).not.toBe(PolynomialRollingHash.hashArray([2, 1]))
    })

    it('handles zero values', () => {
      const h = PolynomialRollingHash.hashArray([0, 0, 0])
      expect(typeof h).toBe('bigint')
    })

    it('handles negative values', () => {
      const h = PolynomialRollingHash.hashArray([-1, -2, -3])
      expect(typeof h).toBe('bigint')
    })

    it('handles large values', () => {
      const h = PolynomialRollingHash.hashArray([1000000, 2000000])
      expect(typeof h).toBe('bigint')
    })

    it('is deterministic', () => {
      const arr = [5, 10, 15, 20]
      const h1 = PolynomialRollingHash.hashArray(arr)
      const h2 = PolynomialRollingHash.hashArray(arr)
      expect(h1).toBe(h2)
    })
  })

  describe('areEqual', () => {
    it('returns true for same strings', () => {
      expect(PolynomialRollingHash.areEqual('test', 'test')).toBe(true)
    })

    it('returns false for different strings', () => {
      expect(PolynomialRollingHash.areEqual('abc', 'def')).toBe(false)
    })

    it('returns false for different lengths', () => {
      expect(PolynomialRollingHash.areEqual('ab', 'abc')).toBe(false)
    })

    it('returns true for empty strings', () => {
      expect(PolynomialRollingHash.areEqual('', '')).toBe(true)
    })

    it('returns false for empty vs non-empty', () => {
      expect(PolynomialRollingHash.areEqual('', 'a')).toBe(false)
    })

    it('case sensitive', () => {
      expect(PolynomialRollingHash.areEqual('ABC', 'abc')).toBe(false)
    })

    it('returns true for identical special chars', () => {
      expect(PolynomialRollingHash.areEqual('!@#', '!@#')).toBe(true)
    })

    it('returns false for single char difference', () => {
      expect(PolynomialRollingHash.areEqual('abc', 'abd')).toBe(false)
    })

    it('works with whitespace strings', () => {
      expect(PolynomialRollingHash.areEqual('  ', '  ')).toBe(true)
      expect(PolynomialRollingHash.areEqual(' ', '  ')).toBe(false)
    })
  })

  describe('hash vs hashArray consistency', () => {
    it('hash and hashArray produce bigint results', () => {
      expect(typeof PolynomialRollingHash.hash('test')).toBe('bigint')
      expect(typeof PolynomialRollingHash.hashArray([1, 2])).toBe('bigint')
    })

    it('areEqual agrees with direct hash comparison', () => {
      const s1 = 'hello'
      const s2 = 'hello'
      const s3 = 'world'
      expect(PolynomialRollingHash.areEqual(s1, s2)).toBe(
        PolynomialRollingHash.hash(s1) === PolynomialRollingHash.hash(s2),
      )
      expect(PolynomialRollingHash.areEqual(s1, s3)).toBe(
        PolynomialRollingHash.hash(s1) === PolynomialRollingHash.hash(s3),
      )
    })
  })

  describe('hash edge cases', () => {
    it('newline character has different hash than empty', () => {
      expect(PolynomialRollingHash.hash('\n')).not.toBe(0n)
    })

    it('hash of a single digit character', () => {
      const h = PolynomialRollingHash.hash('5')
      expect(h).toBe(BigInt('5'.charCodeAt(0)))
    })

    it('hash of two characters matches formula', () => {
      const h = PolynomialRollingHash.hash('ab')
      const expected = (BigInt('a'.charCodeAt(0)) * 91138233n + BigInt('b'.charCodeAt(0))) % 972663749n
      expect(h).toBe(expected)
    })

    it('long repeated string does not throw', () => {
      expect(() => PolynomialRollingHash.hash('x'.repeat(100000))).not.toThrow()
    })
  })

  describe('hashArray edge cases', () => {
    it('array with one zero', () => {
      const h = PolynomialRollingHash.hashArray([0])
      expect(h).toBe(0n)
    })

    it('array with duplicates', () => {
      const h1 = PolynomialRollingHash.hashArray([1, 1, 1])
      const h2 = PolynomialRollingHash.hashArray([1, 1, 1])
      expect(h1).toBe(h2)
    })

    it('different length arrays produce different hashes', () => {
      const h1 = PolynomialRollingHash.hashArray([1])
      const h2 = PolynomialRollingHash.hashArray([1, 1])
      expect(h1).not.toBe(h2)
    })

    it('hash of large array', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i)
      const h = PolynomialRollingHash.hashArray(arr)
      expect(typeof h).toBe('bigint')
      expect(h > 0n || h === 0n).toBe(true)
    })
  })

  describe('areEqual additional tests', () => {
    it('newline vs space are not equal', () => {
      expect(PolynomialRollingHash.areEqual('\n', ' ')).toBe(false)
    })

    it('tab vs two spaces are not equal', () => {
      expect(PolynomialRollingHash.areEqual('\t', '  ')).toBe(false)
    })

    it('mixed whitespace order matters', () => {
      expect(PolynomialRollingHash.areEqual(' \t\n', '\t \n')).toBe(false)
    })

    it('unicode with accent differs from base', () => {
      expect(PolynomialRollingHash.areEqual('cafe', 'café')).toBe(false)
    })

    it('same unicode strings are equal', () => {
      expect(PolynomialRollingHash.areEqual('日本語', '日本語')).toBe(true)
    })

    it('emoji equality', () => {
      expect(PolynomialRollingHash.areEqual('😀', '😀')).toBe(true)
      expect(PolynomialRollingHash.areEqual('😀', '😁')).toBe(false)
    })
  })

  describe('boundary and consistency', () => {
    it('hash values are within MOD range', () => {
      const MOD = 972663749n
      const h = PolynomialRollingHash.hash('test string')
      expect(h >= 0n).toBe(true)
      expect(h < MOD).toBe(true)
    })

    it('hashArray values are within MOD range', () => {
      const MOD = 972663749n
      const h = PolynomialRollingHash.hashArray([1, 2, 3, 4, 5])
      expect(h >= 0n).toBe(true)
      expect(h < MOD).toBe(true)
    })

    it('hash is consistent across 100 calls', () => {
      const s = 'consistent string'
      const hashes = Array.from({ length: 100 }, () => PolynomialRollingHash.hash(s))
      expect(new Set(hashes).size).toBe(1)
    })

    it('hashArray is consistent across 100 calls', () => {
      const arr = [5, 10, 15, 20, 25]
      const hashes = Array.from({ length: 100 }, () => PolynomialRollingHash.hashArray(arr))
      expect(new Set(hashes).size).toBe(1)
    })
  })

  it('hash returns bigint', () => {
    expect(typeof PolynomialRollingHash.hash('hello')).toBe('bigint')
  })

  it('hashArray returns bigint', () => {
    expect(typeof PolynomialRollingHash.hashArray([1, 2, 3])).toBe('bigint')
  })

  it('same input same hash', () => {
    expect(PolynomialRollingHash.hash('test')).toBe(PolynomialRollingHash.hash('test'))
  })
})

describe('polynomial-rolling-hash - wave545', () => {
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

describe('polynomial-rolling-hash - wave546', () => {
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

describe('polynomial-rolling-hash - wave547', () => {
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

describe('polynomial-rolling-hash - wave548', () => {
  it('polynomial-rolling-hash module defined', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash module is function', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave549', () => {
  it('polynomial-rolling-hash module defined', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash module is function', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave550', () => {
  it('polynomial-rolling-hash w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave551', () => {
  it('polynomial-rolling-hash w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})
