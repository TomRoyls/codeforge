import { describe, it, expect } from 'vitest'
import { Sieve } from '../../src/utils/sieve.js'

describe('Sieve', () => {
  it('generates correct primes up to 10', () => {
    const sieve = new Sieve(10)
    expect(sieve.primes).toEqual([2, 3, 5, 7])
  })

  it('generates correct primes up to 30', () => {
    const sieve = new Sieve(30)
    expect(sieve.primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29])
  })

  it('handles n=1 (no primes)', () => {
    const sieve = new Sieve(1)
    expect(sieve.primes).toEqual([])
  })

  it('handles n=2 (single prime)', () => {
    const sieve = new Sieve(2)
    expect(sieve.primes).toEqual([2])
  })

  it('handles n=0', () => {
    const sieve = new Sieve(0)
    expect(sieve.primes).toEqual([])
  })

  it('isPrime array is correct', () => {
    const sieve = new Sieve(20)
    expect(sieve.isPrime[2]).toBe(true)
    expect(sieve.isPrime[3]).toBe(true)
    expect(sieve.isPrime[4]).toBe(false)
    expect(sieve.isPrime[5]).toBe(true)
    expect(sieve.isPrime[6]).toBe(false)
    expect(sieve.isPrime[7]).toBe(true)
    expect(sieve.isPrime[9]).toBe(false)
    expect(sieve.isPrime[11]).toBe(true)
    expect(sieve.isPrime[15]).toBe(false)
  })

  it('factorizes numbers correctly', () => {
    const sieve = new Sieve(100)
    expect(sieve.factorize(12)).toEqual(new Map([[2, 2], [3, 1]]))
    expect(sieve.factorize(60)).toEqual(new Map([[2, 2], [3, 1], [5, 1]]))
    expect(sieve.factorize(7)).toEqual(new Map([[7, 1]]))
  })

  it('factorizes prime numbers', () => {
    const sieve = new Sieve(50)
    expect(sieve.factorize(13)).toEqual(new Map([[13, 1]]))
  })

  it('factorizes power of 2', () => {
    const sieve = new Sieve(64)
    expect(sieve.factorize(64)).toEqual(new Map([[2, 6]]))
  })

  it('countDivisors works', () => {
    const sieve = new Sieve(100)
    expect(sieve.countDivisors(1)).toBe(1)
    expect(sieve.countDivisors(6)).toBe(4)
    expect(sieve.countDivisors(12)).toBe(6)
    expect(sieve.countDivisors(28)).toBe(6)
  })

  it('sumDivisors works', () => {
    const sieve = new Sieve(100)
    expect(sieve.sumDivisors(6)).toBe(12)
    expect(sieve.sumDivisors(12)).toBe(28)
    expect(sieve.sumDivisors(1)).toBe(1)
  })

  it('eulerTotient works', () => {
    const sieve = new Sieve(100)
    expect(sieve.eulerTotient(1)).toBe(1)
    expect(sieve.eulerTotient(6)).toBe(2)
    expect(sieve.eulerTotient(7)).toBe(6)
    expect(sieve.eulerTotient(10)).toBe(4)
    expect(sieve.eulerTotient(12)).toBe(4)
  })

  it('smallestFactor is correct', () => {
    const sieve = new Sieve(20)
    expect(sieve.smallestFactor[2]).toBe(2)
    expect(sieve.smallestFactor[6]).toBe(2)
    expect(sieve.smallestFactor[9]).toBe(3)
    expect(sieve.smallestFactor[15]).toBe(3)
  })

  it('countDivisors for larger number', () => {
    const sieve = new Sieve(500)
    expect(sieve.countDivisors(496)).toBe(10)
  })

  it('factorize 1 returns empty map', () => {
    const sieve = new Sieve(10)
    expect(sieve.factorize(1)).toEqual(new Map())
  })

  it('generates primes up to 100 correctly', () => {
    const sieve = new Sieve(100)
    expect(sieve.primes.length).toBe(25)
    expect(sieve.primes[0]).toBe(2)
    expect(sieve.primes[24]).toBe(97)
  })

  it('isPrime property works for small numbers', () => {
    const sieve = new Sieve(20)
    expect(sieve.isPrime[2]).toBe(true)
    expect(sieve.isPrime[4]).toBe(false)
    expect(sieve.isPrime[7]).toBe(true)
  })

  it('primesUpTo returns correct list', () => {
    const sieve = new Sieve(10)
    expect(sieve.primes).toEqual([2, 3, 5, 7])
  })

  it('primesUpTo 2 returns [2]', () => {
    const sieve = new Sieve(2)
    expect(sieve.primes).toEqual([2])
  })

  it('primesUpTo 10 returns correct primes', () => {
    const sieve = new Sieve(10)
    expect(sieve.primes.length).toBe(4)
  })

  it('primesUpTo 2 returns [2]', () => {
    const sieve = new Sieve(2)
    expect(sieve.primes).toEqual([2])
  })

  it('primesUpTo 10 returns correct count', () => {
    const sieve = new Sieve(10)
    expect(sieve.primes.length).toBe(4)
  })

  it('sieve of 2 returns one prime', () => {
    const sieve = new Sieve(2)
    expect(sieve.primes).toEqual([2])
  })

  it('sieve of 10 returns 4 primes', () => {
    const sieve = new Sieve(10)
    expect(sieve.primes.length).toBe(4)
  })
})
