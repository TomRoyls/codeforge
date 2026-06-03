import { describe, expect, it } from 'vitest'
import { BigIntUtils } from '../../src/utils/bigint-utils.js'

describe('BigIntUtils', () => {
  it('computes gcd', () => {
    expect(BigIntUtils.gcd(12n, 8n)).toBe(4n)
    expect(BigIntUtils.gcd(7n, 13n)).toBe(1n)
  })

  it('gcd handles zero', () => {
    expect(BigIntUtils.gcd(5n, 0n)).toBe(5n)
    expect(BigIntUtils.gcd(0n, 5n)).toBe(5n)
  })

  it('gcd handles negatives', () => {
    expect(BigIntUtils.gcd(-12n, 8n)).toBe(4n)
  })

  it('computes lcm', () => {
    expect(BigIntUtils.lcm(4n, 6n)).toBe(12n)
    expect(BigIntUtils.lcm(7n, 11n)).toBe(77n)
  })

  it('lcm handles zero', () => {
    expect(BigIntUtils.lcm(5n, 0n)).toBe(0n)
  })

  it('modPow works correctly', () => {
    expect(BigIntUtils.modPow(2n, 10n, 1000n)).toBe(1024n % 1000n)
    expect(BigIntUtils.modPow(3n, 4n, 5n)).toBe(81n % 5n)
  })

  it('modPow handles large exponents', () => {
    expect(BigIntUtils.modPow(2n, 100n, 1000000007n)).toBe(976371285n)
  })

  it('factorial computes correctly', () => {
    expect(BigIntUtils.factorial(0)).toBe(1n)
    expect(BigIntUtils.factorial(5)).toBe(120n)
    expect(BigIntUtils.factorial(10)).toBe(3628800n)
  })

  it('binomial computes correctly', () => {
    expect(BigIntUtils.binomial(5, 2)).toBe(10n)
    expect(BigIntUtils.binomial(10, 0)).toBe(1n)
    expect(BigIntUtils.binomial(10, 10)).toBe(1n)
    expect(BigIntUtils.binomial(10, 3)).toBe(120n)
  })

  it('binomial returns 0 for invalid k', () => {
    expect(BigIntUtils.binomial(5, -1)).toBe(0n)
    expect(BigIntUtils.binomial(5, 6)).toBe(0n)
  })

  it('fibonacci computes correctly', () => {
    expect(BigIntUtils.fibonacci(0)).toBe(0n)
    expect(BigIntUtils.fibonacci(1)).toBe(1n)
    expect(BigIntUtils.fibonacci(10)).toBe(55n)
    expect(BigIntUtils.fibonacci(20)).toBe(6765n)
  })

  it('isPrime works for small numbers', () => {
    expect(BigIntUtils.isPrime(2n)).toBe(true)
    expect(BigIntUtils.isPrime(3n)).toBe(true)
    expect(BigIntUtils.isPrime(4n)).toBe(false)
    expect(BigIntUtils.isPrime(17n)).toBe(true)
    expect(BigIntUtils.isPrime(1n)).toBe(false)
  })

  it('modInverse works', () => {
    expect((3n * BigIntUtils.modInverse(3n, 7n)) % 7n).toBe(1n)
  })

  it('modInverse throws for non-coprime', () => {
    expect(() => BigIntUtils.modInverse(2n, 4n)).toThrow()
  })

  it('gcd works for coprime', () => {
    expect(BigIntUtils.gcd(15n, 28n)).toBe(1n)
    expect(BigIntUtils.gcd(12n, 8n)).toBe(4n)
  })

  it('lcm works', () => {
    expect(BigIntUtils.lcm(4n, 6n)).toBe(12n)
    expect(BigIntUtils.lcm(3n, 5n)).toBe(15n)
  })

  it('gcd of identical numbers', () => {
    expect(BigIntUtils.gcd(7n, 7n)).toBe(7n)
  })

  it('lcm works correctly', () => {
    expect(BigIntUtils.lcm(4n, 6n)).toBe(12n)
    expect(BigIntUtils.lcm(3n, 5n)).toBe(15n)
  })

  it('mod inverse exists for coprime', () => {
    const inv = BigIntUtils.modInverse(3n, 7n)
    expect(inv).not.toBeNull()
    expect((3n * inv!) % 7n).toBe(1n)
  })

  it('modInverse of 1 is 1', () => {
    const inv = BigIntUtils.modInverse(1n, 7n)
    expect(inv).toBe(1n)
  })

  it('modInverse of 3 mod 7', () => {
    const inv = BigIntUtils.modInverse(3n, 7n)
    expect((3n * inv) % 7n).toBe(1n)
  })

  it('gcd of 12n and 8n is 4n', () => {
    expect(BigIntUtils.gcd(12n, 8n)).toBe(4n)
  })

  it('lcm of 4n and 6n is 12n', () => {
    expect(BigIntUtils.lcm(4n, 6n)).toBe(12n)
  })

  it('lcm of 0n and any is 0n', () => {
    expect(BigIntUtils.lcm(0n, 5n)).toBe(0n)
  })
})
