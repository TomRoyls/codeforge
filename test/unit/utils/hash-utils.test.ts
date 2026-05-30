import { describe, expect, it } from 'vitest'
import { hash64, fnv1a } from '../../../src/utils/hash-utils.js'

describe('hash64', () => {
  it('returns a number', () => {
    const result = hash64('test', 0)
    expect(typeof result).toBe('number')
  })

  it('returns deterministic hash for same input', () => {
    const hash1 = hash64('hello', 0)
    const hash2 = hash64('hello', 0)
    expect(hash1).toBe(hash2)
  })

  it('returns different hash for different inputs', () => {
    const hash1 = hash64('hello', 0)
    const hash2 = hash64('world', 0)
    expect(hash1).not.toBe(hash2)
  })

  it('returns different hash for different seeds', () => {
    const hash1 = hash64('hello', 0)
    const hash2 = hash64('hello', 42)
    expect(hash1).not.toBe(hash2)
  })

  it('handles empty string', () => {
    const hash = hash64('', 0)
    expect(typeof hash).toBe('number')
  })

  it('returns deterministic hash for empty string', () => {
    const hash1 = hash64('', 0)
    const hash2 = hash64('', 0)
    expect(hash1).toBe(hash2)
  })

  it('handles single character', () => {
    const hash = hash64('a', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles unicode characters', () => {
    const hash = hash64('hello 世界', 0)
    expect(typeof hash).toBe('number')
  })

  it('returns deterministic hash for unicode', () => {
    const hash1 = hash64('hello 世界', 0)
    const hash2 = hash64('hello 世界', 0)
    expect(hash1).toBe(hash2)
  })

  it('handles emoji', () => {
    const hash = hash64('test 😀', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles long strings', () => {
    const longStr = 'a'.repeat(10000)
    const hash = hash64(longStr, 0)
    expect(typeof hash).toBe('number')
  })

  it('returns deterministic hash for long strings', () => {
    const longStr = 'a'.repeat(10000)
    const hash1 = hash64(longStr, 0)
    const hash2 = hash64(longStr, 0)
    expect(hash1).toBe(hash2)
  })

  it('handles seed 0', () => {
    const hash = hash64('test', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles non-zero seed', () => {
    const hash = hash64('test', 12345)
    expect(typeof hash).toBe('number')
  })

  it('handles negative seed', () => {
    const hash = hash64('test', -1)
    expect(typeof hash).toBe('number')
  })

  it('returns unsigned 32-bit value', () => {
    const hash = hash64('test', 0)
    expect(hash).toBeGreaterThanOrEqual(0)
    expect(hash).toBeLessThan(Math.pow(2, 32))
  })

  it('returns unsigned 32-bit for large input', () => {
    const largeStr = 'x'.repeat(1000)
    const hash = hash64(largeStr, 0)
    expect(hash).toBeGreaterThanOrEqual(0)
    expect(hash).toBeLessThan(Math.pow(2, 32))
  })

  it('handles strings with special characters', () => {
    const hash = hash64('test!@#$%^&*()', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles strings with newlines', () => {
    const hash = hash64('test\nline', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles strings with tabs', () => {
    const hash = hash64('test\ttab', 0)
    expect(typeof hash).toBe('number')
  })

  it('different seeds produce different hashes for same input', () => {
    const baseStr = 'hello world'
    const hashes = new Set()
    for (let i = 0; i < 10; i++) {
      hashes.add(hash64(baseStr, i))
    }
    expect(hashes.size).toBeGreaterThan(1)
  })

  it('case sensitivity: different case produces different hash', () => {
    const hash1 = hash64('hello', 0)
    const hash2 = hash64('HELLO', 0)
    expect(hash1).not.toBe(hash2)
  })

  it('handles numeric string', () => {
    const hash = hash64('12345', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles whitespace only', () => {
    const hash = hash64('   ', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles mixed unicode and ascii', () => {
    const hash = hash64('abc123世界!@#', 0)
    expect(typeof hash).toBe('number')
  })
})

describe('fnv1a', () => {
  it('returns a number', () => {
    const result = fnv1a('test', 0)
    expect(typeof result).toBe('number')
  })

  it('returns deterministic hash for same input', () => {
    const hash1 = fnv1a('hello', 0)
    const hash2 = fnv1a('hello', 0)
    expect(hash1).toBe(hash2)
  })

  it('returns different hash for different inputs', () => {
    const hash1 = fnv1a('hello', 0)
    const hash2 = fnv1a('world', 0)
    expect(hash1).not.toBe(hash2)
  })

  it('returns different hash for different seeds', () => {
    const hash1 = fnv1a('hello', 0)
    const hash2 = fnv1a('hello', 42)
    expect(hash1).not.toBe(hash2)
  })

  it('handles empty string', () => {
    const hash = fnv1a('', 0)
    expect(typeof hash).toBe('number')
  })

  it('returns deterministic hash for empty string', () => {
    const hash1 = fnv1a('', 0)
    const hash2 = fnv1a('', 0)
    expect(hash1).toBe(hash2)
  })

  it('handles single character', () => {
    const hash = fnv1a('a', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles unicode characters', () => {
    const hash = fnv1a('hello 世界', 0)
    expect(typeof hash).toBe('number')
  })

  it('returns deterministic hash for unicode', () => {
    const hash1 = fnv1a('hello 世界', 0)
    const hash2 = fnv1a('hello 世界', 0)
    expect(hash1).toBe(hash2)
  })

  it('handles emoji', () => {
    const hash = fnv1a('test 😀', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles long strings', () => {
    const longStr = 'a'.repeat(10000)
    const hash = fnv1a(longStr, 0)
    expect(typeof hash).toBe('number')
  })

  it('returns deterministic hash for long strings', () => {
    const longStr = 'a'.repeat(10000)
    const hash1 = fnv1a(longStr, 0)
    const hash2 = fnv1a(longStr, 0)
    expect(hash1).toBe(hash2)
  })

  it('handles seed 0', () => {
    const hash = fnv1a('test', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles non-zero seed', () => {
    const hash = fnv1a('test', 12345)
    expect(typeof hash).toBe('number')
  })

  it('handles negative seed', () => {
    const hash = fnv1a('test', -1)
    expect(typeof hash).toBe('number')
  })

  it('returns unsigned 32-bit value', () => {
    const hash = fnv1a('test', 0)
    expect(hash).toBeGreaterThanOrEqual(0)
    expect(hash).toBeLessThan(Math.pow(2, 32))
  })

  it('returns unsigned 32-bit for large input', () => {
    const largeStr = 'x'.repeat(1000)
    const hash = fnv1a(largeStr, 0)
    expect(hash).toBeGreaterThanOrEqual(0)
    expect(hash).toBeLessThan(Math.pow(2, 32))
  })

  it('handles strings with special characters', () => {
    const hash = fnv1a('test!@#$%^&*()', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles strings with newlines', () => {
    const hash = fnv1a('test\nline', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles strings with tabs', () => {
    const hash = fnv1a('test\ttab', 0)
    expect(typeof hash).toBe('number')
  })

  it('different seeds produce different hashes for same input', () => {
    const baseStr = 'hello world'
    const hashes = new Set()
    for (let i = 0; i < 10; i++) {
      hashes.add(fnv1a(baseStr, i))
    }
    expect(hashes.size).toBeGreaterThan(1)
  })

  it('case sensitivity: different case produces different hash', () => {
    const hash1 = fnv1a('hello', 0)
    const hash2 = fnv1a('HELLO', 0)
    expect(hash1).not.toBe(hash2)
  })

  it('handles numeric string', () => {
    const hash = fnv1a('12345', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles whitespace only', () => {
    const hash = fnv1a('   ', 0)
    expect(typeof hash).toBe('number')
  })

  it('handles mixed unicode and ascii', () => {
    const hash = fnv1a('abc123世界!@#', 0)
    expect(typeof hash).toBe('number')
  })

  it('hash64 and fnv1a produce different hashes for same input', () => {
    const input = 'hello world'
    const seed = 0
    expect(hash64(input, seed)).not.toBe(fnv1a(input, seed))
  })
})