import { describe, expect, it } from 'vitest'
import { PollardRho } from '../../src/utils/pollard-rho.js'

describe('PollardRho', () => {
  it('factorizes small composite numbers', () => {
    const factors = PollardRho.factorize(12)
    expect(factors).toEqual([2n, 2n, 3n])
  })

  it('factorizes prime numbers', () => {
    const factors = PollardRho.factorize(17)
    expect(factors).toEqual([17n])
  })

  it('factorizes 1 returns empty', () => {
    expect(PollardRho.factorize(1)).toEqual([])
  })

  it('factorizes 0 returns empty', () => {
    expect(PollardRho.factorize(0)).toEqual([])
  })

  it('factorizes large semiprime', () => {
    const factors = PollardRho.factorize(91)
    expect(factors.sort()).toEqual([7n, 13n].sort())
  })

  it('factorizes power of 2', () => {
    expect(PollardRho.factorize(64)).toEqual([2n, 2n, 2n, 2n, 2n, 2n])
  })

  it('factorizes large number', () => {
    const n = 2 * 3 * 5 * 7 * 11 * 13
    const factors = PollardRho.factorize(n)
    expect(factors).toEqual([2n, 3n, 5n, 7n, 11n, 13n])
  })

  it('isPrime detects primes', () => {
    expect(PollardRho.isPrime(2n)).toBe(true)
    expect(PollardRho.isPrime(3n)).toBe(true)
    expect(PollardRho.isPrime(4n)).toBe(false)
    expect(PollardRho.isPrime(97n)).toBe(true)
  })

  it('isPrime handles edge cases', () => {
    expect(PollardRho.isPrime(0n)).toBe(false)
    expect(PollardRho.isPrime(1n)).toBe(false)
    expect(PollardRho.isPrime(-5n)).toBe(false)
  })

  it('factorizes product of two primes', () => {
    const factors = PollardRho.factorize(10007 * 10009)
    expect(factors).toEqual([BigInt(10007), BigInt(10009)])
  })

  it('accepts bigint input', () => {
    expect(PollardRho.factorize(15n)).toEqual([3n, 5n])
  })

  it('factorizes prime square', () => {
    expect(PollardRho.factorize(49)).toEqual([7n, 7n])
  })

  it('factorizes 2', () => {
    expect(PollardRho.factorize(2)).toEqual([2n])
  })

  it('factorizes 3', () => {
    expect(PollardRho.factorize(3)).toEqual([3n])
  })
})
