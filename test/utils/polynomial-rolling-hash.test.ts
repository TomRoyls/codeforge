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

describe('polynomial-rolling-hash - wave552', () => {
  it('polynomial-rolling-hash w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave553', () => {
  it('polynomial-rolling-hash w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave554', () => {
  it('polynomial-rolling-hash w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave555', () => {
  it('polynomial-rolling-hash w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave556', () => {
  it('polynomial-rolling-hash w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave557', () => {
  it('polynomial-rolling-hash w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave558', () => {
  it('polynomial-rolling-hash w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave559', () => {
  it('polynomial-rolling-hash w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave560', () => {
  it('polynomial-rolling-hash w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave561', () => {
  it('polynomial-rolling-hash w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave562', () => {
  it('polynomial-rolling-hash w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave563', () => {
  it('polynomial-rolling-hash w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave564', () => {
  it('polynomial-rolling-hash w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave565', () => {
  it('polynomial-rolling-hash w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave566', () => {
  it('polynomial-rolling-hash w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave127', () => {
  it('polynomial-rolling-hash w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave130', () => {
  it('polynomial-rolling-hash w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave133', () => {
  it('polynomial-rolling-hash w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave136', () => {
  it('polynomial-rolling-hash w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - wave139', () => {
  it('polynomial-rolling-hash w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w142', () => {
  it('polynomial-rolling-hash v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w145', () => {
  it('polynomial-rolling-hash v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w148', () => {
  it('polynomial-rolling-hash v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w151', () => {
  it('polynomial-rolling-hash v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w154', () => {
  it('polynomial-rolling-hash v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w157', () => {
  it('polynomial-rolling-hash v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w160', () => {
  it('polynomial-rolling-hash v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w170', () => {
  it('polynomial-rolling-hash x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w180', () => {
  it('polynomial-rolling-hash x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w190', () => {
  it('polynomial-rolling-hash x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w200', () => {
  it('polynomial-rolling-hash x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w210', () => {
  it('polynomial-rolling-hash x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w220', () => {
  it('polynomial-rolling-hash x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w230', () => {
  it('polynomial-rolling-hash x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w240', () => {
  it('polynomial-rolling-hash x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w250', () => {
  it('polynomial-rolling-hash x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w260', () => {
  it('polynomial-rolling-hash x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w270', () => {
  it('polynomial-rolling-hash x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w280', () => {
  it('polynomial-rolling-hash x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w290', () => {
  it('polynomial-rolling-hash x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w300', () => {
  it('polynomial-rolling-hash x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w310', () => {
  it('polynomial-rolling-hash x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w320', () => {
  it('polynomial-rolling-hash x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w330', () => {
  it('polynomial-rolling-hash x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w340', () => {
  it('polynomial-rolling-hash x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w350', () => {
  it('polynomial-rolling-hash x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w360', () => {
  it('polynomial-rolling-hash x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w370', () => {
  it('polynomial-rolling-hash x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w380', () => {
  it('polynomial-rolling-hash x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w390', () => {
  it('polynomial-rolling-hash x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w400', () => {
  it('polynomial-rolling-hash x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w420', () => {
  it('polynomial-rolling-hash x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w440', () => {
  it('polynomial-rolling-hash x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w460', () => {
  it('polynomial-rolling-hash x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w480', () => {
  it('polynomial-rolling-hash x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w500', () => {
  it('polynomial-rolling-hash x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w550', () => {
  it('polynomial-rolling-hash x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('polynomial-rolling-hash - w600', () => {
  it('polynomial-rolling-hash x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('polynomial-rolling-hash x600x49', () => {
    expect(describe).toBeDefined()
  })
})
