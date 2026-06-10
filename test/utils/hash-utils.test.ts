import { describe, it, expect } from 'vitest'
import { hash64, fnv1a } from '../../src/utils/hash-utils.js'

// ─── hash64 ───────────────────────────────────────────────
describe('hash64', () => {
  it('returns consistent hashes', () => {
    expect(hash64('hello', 0)).toBe(hash64('hello', 0))
  })

  it('returns different hashes for different inputs', () => {
    expect(hash64('hello', 0)).not.toBe(hash64('world', 0))
  })

  it('respects seed', () => {
    expect(hash64('hello', 0)).not.toBe(hash64('hello', 1))
  })

  it('handles empty string', () => {
    const h = hash64('', 0)
    expect(typeof h).toBe('number')
    expect(Number.isFinite(h)).toBe(true)
  })

  it('handles unicode', () => {
    const h = hash64('日本語', 42)
    expect(typeof h).toBe('number')
  })

  it('distributes well', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 100; i++) {
      seen.add(hash64(`item-${i}`, 0))
    }
    expect(seen.size).toBeGreaterThan(90)
  })
})

// ─── fnv1a ────────────────────────────────────────────────
describe('fnv1a', () => {
  it('returns consistent hashes', () => {
    expect(fnv1a('test', 0)).toBe(fnv1a('test', 0))
  })

  it('returns different hashes for different inputs', () => {
    expect(fnv1a('a', 0)).not.toBe(fnv1a('b', 0))
  })

  it('respects seed', () => {
    expect(fnv1a('test', 0)).not.toBe(fnv1a('test', 1))
  })

  it('handles empty string', () => {
    const h = fnv1a('', 0)
    expect(typeof h).toBe('number')
    expect(Number.isFinite(h)).toBe(true)
  })

  it('handles unicode', () => {
    const h = fnv1a('🎉emoji', 0)
    expect(typeof h).toBe('number')
    expect(Number.isFinite(h)).toBe(true)
  })

  it('distributes well across seeds', () => {
    const seen = new Set<number>()
    for (let seed = 0; seed < 100; seed++) {
      seen.add(fnv1a('constant', seed))
    }
    expect(seen.size).toBeGreaterThan(90)
  })

  it('returns unsigned 32-bit values', () => {
    for (let i = 0; i < 50; i++) {
      const h = fnv1a(`input-${i}`, i)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(0xFFFFFFFF)
    }
  })

  it('handles long strings', () => {
    const longStr = 'a'.repeat(10000)
    const h = fnv1a(longStr, 0)
    expect(typeof h).toBe('number')
    expect(Number.isFinite(h)).toBe(true)
  })
})

describe('hash64 - additional', () => {
  it('handles long strings', () => {
    const longStr = 'x'.repeat(10000)
    const h = hash64(longStr, 0)
    expect(Number.isFinite(h)).toBe(true)
  })

  it('returns finite number for various seeds', () => {
    for (let seed = 0; seed < 10; seed++) {
      const h = hash64('test', seed)
      expect(Number.isFinite(h)).toBe(true)
    }
  })

  it('hash64 is deterministic', () => {
    const h1 = hash64('hello', 42)
    const h2 = hash64('hello', 42)
    expect(h1).toBe(h2)
  })

  it('fnv1a is deterministic', () => {
    const h1 = fnv1a('hello', 0)
    const h2 = fnv1a('hello', 0)
    expect(h1).toBe(h2)
  })

  it('different seeds produce different hashes', () => {
    const h1 = hash64('test', 0)
    const h2 = hash64('test', 999)
    expect(h1).not.toBe(h2)
  })

  it('same input same seed produces same hash', () => {
    const h1 = hash64('hello', 42)
    const h2 = hash64('hello', 42)
    expect(h1).toBe(h2)
  })

  it('hash64 different strings differ', () => {
    const h1 = hash64('hello', 42)
    const h2 = hash64('world', 42)
    expect(h1).not.toBe(h2)
  })

  it('hash64 is deterministic', () => {
    const h1 = hash64('test', 0)
    const h2 = hash64('test', 0)
    expect(h1).toBe(h2)
  })

  it('different inputs produce different hashes', () => {
    const h1 = hash64('foo', 0)
    const h2 = hash64('bar', 0)
    expect(h1).not.toBe(h2)
  })

  it('same input same output', () => {
    const h1 = hash64('foo', 0)
    const h2 = hash64('foo', 0)
    expect(h1).toBe(h2)
  })

  it('hash64 returns unsigned values', () => {
    for (let i = 0; i < 50; i++) {
      const h = hash64(`input-${i}`, i)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(Number.isFinite(h)).toBe(true)
    }
  })

  it('hash64 avalanche: small input change causes large hash change', () => {
    const h1 = hash64('hello', 0)
    const h2 = hash64('hellp', 0)
    expect(h1).not.toBe(h2)
    const diff = Math.abs(h1 - h2)
    expect(diff).toBeGreaterThan(1000)
  })

  it('hash64 distributes across 1000 inputs', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 1000; i++) {
      seen.add(hash64(`key-${i}`, 0))
    }
    expect(seen.size).toBeGreaterThan(990)
  })

  it('hash64 handles special characters', () => {
    expect(() => hash64('\n\t\r\0', 0)).not.toThrow()
    expect(() => hash64('foo\x00bar', 0)).not.toThrow()
  })

  it('fnv1a avalanche: small change causes different hash', () => {
    const h1 = fnv1a('test', 0)
    const h2 = fnv1a('tset', 0)
    expect(h1).not.toBe(h2)
  })

  it('fnv1a distributes across many seeds', () => {
    const seen = new Set<number>()
    for (let seed = 0; seed < 200; seed++) {
      seen.add(fnv1a('constant-input', seed))
    }
    expect(seen.size).toBeGreaterThan(190)
  })

  it('fnv1a handles special characters', () => {
    expect(() => fnv1a('\x00\x01\x02', 0)).not.toThrow()
    expect(Number.isFinite(fnv1a('\n\n\n', 0))).toBe(true)
  })

  it('both functions return numbers for single char', () => {
    expect(typeof hash64('a', 0)).toBe('number')
    expect(typeof fnv1a('a', 0)).toBe('number')
  })

  it('both functions handle seed 0 consistently', () => {
    for (let i = 0; i < 10; i++) {
      expect(hash64(`test-${i}`, 0)).toBe(hash64(`test-${i}`, 0))
      expect(fnv1a(`test-${i}`, 0)).toBe(fnv1a(`test-${i}`, 0))
    }
  })

  it('fnv1a handles very long string', () => {
    const longStr = 'abcdefgh'.repeat(10000)
    const h = fnv1a(longStr, 42)
    expect(Number.isFinite(h)).toBe(true)
    expect(h).toBeGreaterThanOrEqual(0)
  })
})
