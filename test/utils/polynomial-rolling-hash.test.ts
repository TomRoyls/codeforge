import { describe, expect, it } from 'vitest'
import { PolynomialRollingHash } from '../../src/utils/polynomial-rolling-hash.js'

describe('PolynomialRollingHash', () => {
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

  it('hashes empty string', () => {
    expect(PolynomialRollingHash.hash('')).toBe(0n)
  })

  it('hashes array', () => {
    const h = PolynomialRollingHash.hashArray([1, 2, 3])
    expect(h > 0n).toBe(true)
  })

  it('same array same hash', () => {
    expect(PolynomialRollingHash.hashArray([1, 2, 3])).toBe(PolynomialRollingHash.hashArray([1, 2, 3]))
  })

  it('areEqual returns true for same strings', () => {
    expect(PolynomialRollingHash.areEqual('test', 'test')).toBe(true)
  })

  it('areEqual returns false for different strings', () => {
    expect(PolynomialRollingHash.areEqual('abc', 'def')).toBe(false)
  })

  it('areEqual returns false for different lengths', () => {
    expect(PolynomialRollingHash.areEqual('ab', 'abc')).toBe(false)
  })

  it('handles long strings', () => {
    const s = 'a'.repeat(10000)
    expect(PolynomialRollingHash.hash(s) > 0n).toBe(true)
  })

  it('hashes single character', () => {
    const h = PolynomialRollingHash.hash('a')
    expect(h > 0n).toBe(true)
    expect(typeof h).toBe('bigint')
  })

  it('hash consistency across calls', () => {
    const h1 = PolynomialRollingHash.hash('test')
    const h2 = PolynomialRollingHash.hash('test')
    expect(h1).toBe(h2)
  })

  it('different strings different hashes', () => {
    const h1 = PolynomialRollingHash.hash('abc')
    const h2 = PolynomialRollingHash.hash('xyz')
    expect(h1).not.toBe(h2)
  })

  it('empty string hash is consistent', () => {
    const h = PolynomialRollingHash.hash('')
    expect(typeof h).toBe('bigint')
  })

  it('single character hash is positive', () => {
    const h = PolynomialRollingHash.hash('a')
    expect(h > 0n).toBe(true)
  })

  it('hash is deterministic across calls', () => {
    const h1 = PolynomialRollingHash.hash('hello')
    const h2 = PolynomialRollingHash.hash('hello')
    expect(h1).toBe(h2)
  })
})
