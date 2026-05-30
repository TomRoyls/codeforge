import { describe, it, expect } from 'vitest'
import { hash64, fnv1a } from '../src/utils/hash-utils.js'

describe('hash-utils', () => {
  describe('hash64', () => {
    it('returns a non-negative integer', () => {
      const h = hash64('hello', 0)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(h)).toBe(true)
    })

    it('produces different hashes for different inputs', () => {
      expect(hash64('hello', 0)).not.toBe(hash64('world', 0))
    })

    it('produces different hashes for different seeds', () => {
      expect(hash64('hello', 0)).not.toBe(hash64('hello', 42))
    })

    it('is deterministic', () => {
      const h1 = hash64('test', 123)
      const h2 = hash64('test', 123)
      expect(h1).toBe(h2)
    })

    it('handles empty string', () => {
      const h = hash64('', 0)
      expect(typeof h).toBe('number')
      expect(Number.isFinite(h)).toBe(true)
    })

    it('handles unicode strings', () => {
      const h = hash64('日本語テスト', 0)
      expect(typeof h).toBe('number')
      expect(Number.isFinite(h)).toBe(true)
    })

    it('distributes reasonably across inputs', () => {
      const hashes = new Set<number>()
      for (let i = 0; i < 100; i++) {
        hashes.add(hash64(`item-${i}`, 0))
      }
      expect(hashes.size).toBeGreaterThan(90)
    })
  })

  describe('fnv1a', () => {
    it('returns a non-negative integer', () => {
      const h = fnv1a('hello', 0)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(h)).toBe(true)
    })

    it('produces different hashes for different inputs', () => {
      expect(fnv1a('hello', 0)).not.toBe(fnv1a('world', 0))
    })

    it('produces different hashes for different seeds', () => {
      expect(fnv1a('hello', 0)).not.toBe(fnv1a('hello', 1))
    })

    it('is deterministic', () => {
      expect(fnv1a('test', 0)).toBe(fnv1a('test', 0))
    })

    it('handles empty string', () => {
      expect(typeof fnv1a('', 0)).toBe('number')
    })

    it('distributes reasonably across inputs', () => {
      const hashes = new Set<number>()
      for (let i = 0; i < 100; i++) {
        hashes.add(fnv1a(`item-${i}`, 0))
      }
      expect(hashes.size).toBeGreaterThan(90)
    })
  })

  describe('hash64 vs fnv1a', () => {
    it('produces different results for same input', () => {
      expect(hash64('hello', 0)).not.toBe(fnv1a('hello', 0))
    })
  })
})
