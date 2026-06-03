import { describe, it, expect } from 'vitest'
import { generateKeyBetween, generateNKeysBetween, firstKey, compareKeys } from '../../src/utils/order-key.js'

describe('generateKeyBetween', () => {
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
})

describe('generateNKeysBetween', () => {
  it('returns empty for n=0', () => {
    expect(generateNKeysBetween(null, null, 0)).toEqual([])
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

describe('firstKey', () => {
  it('returns "a"', () => {
    expect(firstKey()).toBe('a')
  })
})

describe('compareKeys', () => {
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

  it('returns 0 for equal strings', () => {
    expect(compareKeys('x', 'x')).toBe(0)
  })

  it('returns negative for smaller string', () => {
    expect(compareKeys('a', 'b')).toBeLessThan(0)
  })

  it('returns positive for larger string', () => {
    expect(compareKeys('b', 'a')).toBeGreaterThan(0)
  })

  it('returns 0 for equal strings', () => {
    expect(compareKeys('a', 'a')).toBe(0)
  })

  it('returns negative for a < b', () => {
    expect(compareKeys('a', 'b')).toBeLessThan(0)
  })
})
