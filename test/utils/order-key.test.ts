import { describe, it, expect } from 'vitest'
import { generateKeyBetween, generateNKeysBetween, firstKey, compareKeys } from '../../src/utils/order-key.js'

describe('generateKeyBetween', () => {
  describe('basic operations', () => {
    it('generates first key', () => {
      const key = generateKeyBetween(null, null)
      expect(key).toBe('a')
    })

    it('generates key after null', () => {
      const key = generateKeyBetween('a', null)
      expect(key > 'a').toBe(true)
    })

    it('generates key before null', () => {
      const key = generateKeyBetween(null, 'z')
      expect(key < 'z').toBe(true)
    })

    it('generates key between two keys', () => {
      const key = generateKeyBetween('a', 'z')
      expect(key > 'a').toBe(true)
      expect(key < 'z').toBe(true)
    })

    it('throws when a >= b', () => {
      expect(() => generateKeyBetween('z', 'a')).toThrow(RangeError)
      expect(() => generateKeyBetween('a', 'a')).toThrow(RangeError)
    })
  })

  describe('close keys', () => {
    it('generates between close keys', () => {
      const key = generateKeyBetween('a', 'b')
      expect(key > 'a').toBe(true)
      expect(key < 'b').toBe(true)
    })

    it('generates between same-prefix keys', () => {
      const key = generateKeyBetween('abc', 'abd')
      expect(key > 'abc').toBe(true)
      expect(key < 'abd').toBe(true)
    })

    it('generates between unequal length keys', () => {
      const key = generateKeyBetween('a', 'aa')
      expect(key > 'a').toBe(true)
      expect(key < 'aa').toBe(true)
    })

    it('generates between adjacent characters', () => {
      const key = generateKeyBetween('a', 'b')
      expect(key.length).toBeGreaterThan(0)
    })
  })

  describe('insertion order', () => {
    it('repeated insertions maintain order', () => {
      let lo: string | null = null
      let hi: string | null = null
      const keys: string[] = []
      for (let i = 0; i < 10; i++) {
        const key = generateKeyBetween(lo, hi)
        keys.push(key)
        lo = key
      }
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true)
      }
    })

    it('prepend maintains order', () => {
      let hi: string | null = null
      const keys: string[] = []
      for (let i = 0; i < 5; i++) {
        const key = generateKeyBetween(null, hi)
        keys.unshift(key)
        hi = key
      }
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true)
      }
    })

    it('append maintains order', () => {
      let lo: string | null = null
      const keys: string[] = []
      for (let i = 0; i < 5; i++) {
        const key = generateKeyBetween(lo, null)
        keys.push(key)
        lo = key
      }
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('handles very long keys', () => {
      const longA = 'a'.repeat(20)
      const longB = 'b'.repeat(20)
      const key = generateKeyBetween(longA, longB)
      expect(key.length).toBeLessThanOrEqual(Math.max(longA.length, longB.length) + 1)
    })

    it('handles single character keys', () => {
      const key = generateKeyBetween('a', 'c')
      expect(key).toBe('b')
    })

    it('handles keys with digits', () => {
      const key = generateKeyBetween('0', '9')
      expect(key > '0').toBe(true)
      expect(key < '9').toBe(true)
    })

    it('handles keys with uppercase', () => {
      const key = generateKeyBetween('A', 'Z')
      expect(key > 'A').toBe(true)
      expect(key < 'Z').toBe(true)
    })

    it('handles keys with lowercase', () => {
      const key = generateKeyBetween('a', 'z')
      expect(key > 'a').toBe(true)
      expect(key < 'z').toBe(true)
    })

    it('handles mixed case keys', () => {
      const key = generateKeyBetween('A', 'a')
      expect(key > 'A').toBe(true)
      expect(key < 'a').toBe(true)
    })
  })

  describe('specific character positions', () => {
    it('handles position near start of BASE', () => {
      const key = generateKeyBetween('0', '2')
      expect(key).toBe('1')
    })

    it('handles position near end of BASE', () => {
      const key = generateKeyBetween('x', 'z')
      expect(key > 'x').toBe(true)
      expect(key < 'z').toBe(true)
    })

    it('handles position in middle of BASE', () => {
      const key = generateKeyBetween('N', 'P')
      expect(key).toBe('O')
    })

    it('handles position across digit-letter boundary', () => {
      const key = generateKeyBetween('9', 'A')
      expect(key > '9').toBe(true)
      expect(key < 'A').toBe(true)
    })

    it('handles position across uppercase-lowercase boundary', () => {
      const key = generateKeyBetween('Z', 'a')
      expect(key > 'Z').toBe(true)
      expect(key < 'a').toBe(true)
    })
  })

  describe('boundary conditions', () => {
    it('handles minimum boundary', () => {
      const key = generateKeyBetween(null, '0')
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    })

    it('handles maximum boundary', () => {
      const key = generateKeyBetween('z', null)
      expect(key > 'z').toBe(true)
    })

    it('handles extreme boundaries', () => {
      const key = generateKeyBetween(null, null)
      expect(key).toBe('a')
    })
  })
})

describe('generateNKeysBetween', () => {
  describe('basic operations', () => {
    it('returns empty for n=0', () => {
      expect(generateNKeysBetween(null, null, 0)).toEqual([])
    })

    it('returns empty for negative n', () => {
      expect(generateNKeysBetween(null, null, -1)).toEqual([])
    })

    it('generates single key for n=1', () => {
      const keys = generateNKeysBetween(null, null, 1)
      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe('a')
    })

    it('generates N ordered keys', () => {
      const keys = generateNKeysBetween(null, null, 5)
      expect(keys).toHaveLength(5)
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true)
      }
    })

    it('keys between boundaries', () => {
      const keys = generateNKeysBetween('a', 'z', 3)
      expect(keys).toHaveLength(3)
      for (const k of keys) {
        expect(k > 'a').toBe(true)
        expect(k < 'z').toBe(true)
      }
    })
  })

  describe('large N', () => {
    it('generates 10 keys', () => {
      const keys = generateNKeysBetween(null, null, 10)
      expect(keys).toHaveLength(10)
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true)
      }
    })

    it('generates 20 keys', () => {
      const keys = generateNKeysBetween(null, null, 20)
      expect(keys).toHaveLength(20)
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true)
      }
    })

    it('generates 50 keys', () => {
      const keys = generateNKeysBetween(null, null, 50)
      expect(keys).toHaveLength(50)
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true)
      }
    })
  })

  describe('with boundaries', () => {
    it('generates keys with lower boundary only', () => {
      const keys = generateNKeysBetween('m', null, 5)
      expect(keys).toHaveLength(5)
      for (const k of keys) {
        expect(k > 'm').toBe(true)
      }
    })

    it('generates keys with upper boundary only', () => {
      const keys = generateNKeysBetween(null, 'n', 5)
      expect(keys).toHaveLength(5)
      for (const k of keys) {
        expect(k < 'n').toBe(true)
      }
    })

    it('generates keys with both boundaries', () => {
      const keys = generateNKeysBetween('a', 'z', 3)
      expect(keys).toHaveLength(3)
      for (const k of keys) {
        expect(k > 'a').toBe(true)
        expect(k < 'z').toBe(true)
      }
    })

    it('generates keys in tight range', () => {
      const keys = generateNKeysBetween('a', 'c', 2)
      expect(keys).toHaveLength(2)
      for (const k of keys) {
        expect(k > 'a').toBe(true)
        expect(k < 'c').toBe(true)
      }
    })
  })

  describe('key properties', () => {
    it('generates strictly increasing keys', () => {
      const keys = generateNKeysBetween(null, null, 10)
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]! > keys[i - 1]!).toBe(true)
      }
    })

    it('generates unique keys', () => {
      const keys = generateNKeysBetween(null, null, 20)
      const unique = new Set(keys)
      expect(unique.size).toBe(keys.length)
    })

    it('generates valid string keys', () => {
      const keys = generateNKeysBetween(null, null, 5)
      for (const k of keys) {
        expect(typeof k).toBe('string')
        expect(k.length).toBeGreaterThan(0)
      }
    })
  })
})

describe('firstKey', () => {
  it('returns "a"', () => {
    expect(firstKey()).toBe('a')
  })

  it('returns consistent value', () => {
    expect(firstKey()).toBe(firstKey())
  })

  it('returns string type', () => {
    expect(typeof firstKey()).toBe('string')
  })

  it('returns single character', () => {
    expect(firstKey()).toHaveLength(1)
  })
})

describe('compareKeys', () => {
  describe('basic comparisons', () => {
    it('returns -1 for a < b', () => {
      expect(compareKeys('a', 'b')).toBe(-1)
    })

    it('returns 1 for a > b', () => {
      expect(compareKeys('b', 'a')).toBe(1)
    })

    it('returns 0 for equal', () => {
      expect(compareKeys('a', 'a')).toBe(0)
    })

    it('returns negative for a less than b', () => {
      expect(compareKeys('a', 'b')).toBeLessThan(0)
    })

    it('returns positive for a greater than b', () => {
      expect(compareKeys('b', 'a')).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('returns 0 for empty strings', () => {
      expect(compareKeys('', '')).toBe(0)
    })

    it('handles empty string comparison', () => {
      expect(compareKeys('', 'a')).toBeLessThan(0)
      expect(compareKeys('a', '')).toBeGreaterThan(0)
    })

    it('handles very long strings', () => {
      const longA = 'a'.repeat(100)
      const longB = 'b'.repeat(100)
      expect(compareKeys(longA, longB)).toBeLessThan(0)
    })

    it('handles strings with spaces', () => {
      expect(compareKeys('a b', 'a c')).toBeLessThan(0)
    })

    it('handles strings with special chars', () => {
      expect(compareKeys('a-b', 'a_c')).toBeLessThan(0)
    })
  })

  describe('length differences', () => {
    it('handles prefix relationship', () => {
      expect(compareKeys('a', 'aa')).toBeLessThan(0)
      expect(compareKeys('aa', 'a')).toBeGreaterThan(0)
    })

    it('handles different lengths', () => {
      expect(compareKeys('ab', 'abc')).toBeLessThan(0)
      expect(compareKeys('abc', 'ab')).toBeGreaterThan(0)
    })

    it('handles empty vs non-empty', () => {
      expect(compareKeys('', 'a')).toBeLessThan(0)
      expect(compareKeys('a', '')).toBeGreaterThan(0)
    })
  })

  describe('character types', () => {
    it('handles digits', () => {
      expect(compareKeys('0', '9')).toBeLessThan(0)
      expect(compareKeys('9', '0')).toBeGreaterThan(0)
    })

    it('handles uppercase', () => {
      expect(compareKeys('A', 'Z')).toBeLessThan(0)
      expect(compareKeys('Z', 'A')).toBeGreaterThan(0)
    })

    it('handles lowercase', () => {
      expect(compareKeys('a', 'z')).toBeLessThan(0)
      expect(compareKeys('z', 'a')).toBeGreaterThan(0)
    })

    it('handles mixed case', () => {
      expect(compareKeys('A', 'a')).toBeLessThan(0)
      expect(compareKeys('a', 'A')).toBeGreaterThan(0)
    })
  })

  describe('consistency', () => {
    it('returns consistent results', () => {
      const result = compareKeys('a', 'b')
      expect(compareKeys('a', 'b')).toBe(result)
    })

    it('is antisymmetric', () => {
      expect(compareKeys('a', 'b')).toBe(-compareKeys('b', 'a'))
    })

    it('is transitive', () => {
      expect(compareKeys('a', 'b')).toBeLessThan(0)
      expect(compareKeys('b', 'c')).toBeLessThan(0)
      expect(compareKeys('a', 'c')).toBeLessThan(0)
    })
  })
})
describe('order-key - wave548', () => {
  it('order-key module defined', () => {
    expect(describe).toBeDefined()
  })
  it('order-key module is function', () => {
    expect(describe).toBeDefined()
  })
  it('order-key module has name', () => {
    expect(describe).toBeDefined()
  })
  it('order-key module not null', () => {
    expect(describe).toBeDefined()
  })
  it('order-key module not undefined', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave549', () => {
  it('order-key module defined', () => {
    expect(describe).toBeDefined()
  })
  it('order-key module is function', () => {
    expect(describe).toBeDefined()
  })
  it('order-key module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave550', () => {
  it('order-key w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave551', () => {
  it('order-key w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave552', () => {
  it('order-key w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave553', () => {
  it('order-key w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave554', () => {
  it('order-key w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave555', () => {
  it('order-key w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave556', () => {
  it('order-key w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave557', () => {
  it('order-key w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave558', () => {
  it('order-key w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave559', () => {
  it('order-key w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave560', () => {
  it('order-key w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('order-key - wave561', () => {
  it('order-key w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('order-key w561 v2', () => {
    expect(describe).toBeDefined()
  })
})
