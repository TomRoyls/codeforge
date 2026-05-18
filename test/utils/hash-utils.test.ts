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
  })
})
