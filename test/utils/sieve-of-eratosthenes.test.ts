import { describe, expect, it } from 'vitest'
import { SieveOfEratosthenes } from '../../src/utils/sieve-of-eratosthenes.js'

describe('SieveOfEratosthenes', () => {
  it('finds primes up to 10', () => {
    expect(SieveOfEratosthenes.primesUpTo(10)).toEqual([2, 3, 5, 7])
  })

  it('finds primes up to 30', () => {
    expect(SieveOfEratosthenes.primesUpTo(30)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29])
  })

  it('returns empty for n < 2', () => {
    expect(SieveOfEratosthenes.primesUpTo(1)).toEqual([])
    expect(SieveOfEratosthenes.primesUpTo(0)).toEqual([])
  })

  it('returns [2] for n = 2', () => {
    expect(SieveOfEratosthenes.primesUpTo(2)).toEqual([2])
  })

  it('isPrime detects primes correctly', () => {
    expect(SieveOfEratosthenes.isPrime(2)).toBe(true)
    expect(SieveOfEratosthenes.isPrime(3)).toBe(true)
    expect(SieveOfEratosthenes.isPrime(4)).toBe(false)
    expect(SieveOfEratosthenes.isPrime(17)).toBe(true)
    expect(SieveOfEratosthenes.isPrime(1)).toBe(false)
    expect(SieveOfEratosthenes.isPrime(0)).toBe(false)
  })

  it('primeCount returns correct count', () => {
    expect(SieveOfEratosthenes.primeCount(10)).toBe(4)
    expect(SieveOfEratosthenes.primeCount(100)).toBe(25)
  })

  it('nthPrime returns correct primes', () => {
    expect(SieveOfEratosthenes.nthPrime(1)).toBe(2)
    expect(SieveOfEratosthenes.nthPrime(4)).toBe(7)
    expect(SieveOfEratosthenes.nthPrime(10)).toBe(29)
    expect(SieveOfEratosthenes.nthPrime(25)).toBe(97)
  })

  it('nthPrime throws for n < 1', () => {
    expect(() => SieveOfEratosthenes.nthPrime(0)).toThrow()
  })

  it('primeFactors decomposes correctly', () => {
    const factors = SieveOfEratosthenes.primeFactors(12)
    expect(factors.get(2)).toBe(2)
    expect(factors.get(3)).toBe(1)
  })

  it('primeFactors of prime is itself', () => {
    const factors = SieveOfEratosthenes.primeFactors(13)
    expect(factors.get(13)).toBe(1)
    expect(factors.size).toBe(1)
  })

  it('primeFactors of 1 is empty', () => {
    expect(SieveOfEratosthenes.primeFactors(1).size).toBe(0)
  })

  it('eulerTotient computes correctly', () => {
    expect(SieveOfEratosthenes.eulerTotient(1)).toBe(1)
    expect(SieveOfEratosthenes.eulerTotient(6)).toBe(2)
    expect(SieveOfEratosthenes.eulerTotient(9)).toBe(6)
    expect(SieveOfEratosthenes.eulerTotient(12)).toBe(4)
  })

  it('segmentedSieve finds primes in range', () => {
    expect(SieveOfEratosthenes.segmentedSieve(10, 20)).toEqual([11, 13, 17, 19])
  })

  it('segmentedSieve handles range starting at 0', () => {
    expect(SieveOfEratosthenes.segmentedSieve(0, 10)).toEqual([2, 3, 5, 7])
  })

  it('segmentedSieve returns empty for invalid range', () => {
    expect(SieveOfEratosthenes.segmentedSieve(20, 10)).toEqual([])
  })

  it('primeFactors of 360', () => {
    const f = SieveOfEratosthenes.primeFactors(360)
    expect(f.get(2)).toBe(3)
    expect(f.get(3)).toBe(2)
    expect(f.get(5)).toBe(1)
  })

  it('factorizes composite correctly', () => {
    const factors = SieveOfEratosthenes.primeFactors(12)
    expect(factors.get(2)).toBe(2)
    expect(factors.get(3)).toBe(1)
  })

  it('isPrime for small primes', () => {
    expect(SieveOfEratosthenes.isPrime(2)).toBe(true)
    expect(SieveOfEratosthenes.isPrime(3)).toBe(true)
    expect(SieveOfEratosthenes.isPrime(4)).toBe(false)
  })
})
