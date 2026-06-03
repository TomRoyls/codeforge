import { describe, it, expect } from 'vitest'
import { MillerRabin } from '../../src/utils/miller-rabin.js'

describe('MillerRabin', () => {
  it('identifies small primes correctly', () => {
    expect(MillerRabin.isPrime(2)).toBe(true)
    expect(MillerRabin.isPrime(3)).toBe(true)
    expect(MillerRabin.isPrime(5)).toBe(true)
    expect(MillerRabin.isPrime(7)).toBe(true)
    expect(MillerRabin.isPrime(11)).toBe(true)
  })

  it('identifies small composites correctly', () => {
    expect(MillerRabin.isPrime(4)).toBe(false)
    expect(MillerRabin.isPrime(6)).toBe(false)
    expect(MillerRabin.isPrime(8)).toBe(false)
    expect(MillerRabin.isPrime(9)).toBe(false)
    expect(MillerRabin.isPrime(10)).toBe(false)
  })

  it('handles edge cases', () => {
    expect(MillerRabin.isPrime(0)).toBe(false)
    expect(MillerRabin.isPrime(1)).toBe(false)
    expect(MillerRabin.isPrime(-1)).toBe(false)
  })

  it('identifies known large primes', () => {
    expect(MillerRabin.isPrime(999983)).toBe(true)
    expect(MillerRabin.isPrime(1000003)).toBe(true)
  })

  it('identifies known large composites', () => {
    expect(MillerRabin.isPrime(999981)).toBe(false)
    expect(MillerRabin.isPrime(1000001)).toBe(false)
  })

  it('finds next prime', () => {
    expect(MillerRabin.nextPrime(2)).toBe(3)
    expect(MillerRabin.nextPrime(10)).toBe(11)
    expect(MillerRabin.nextPrime(14)).toBe(17)
    expect(MillerRabin.nextPrime(0)).toBe(2)
  })

  it('finds previous prime', () => {
    expect(MillerRabin.prevPrime(4)).toBe(3)
    expect(MillerRabin.prevPrime(12)).toBe(11)
    expect(MillerRabin.prevPrime(3)).toBe(2)
    expect(MillerRabin.prevPrime(2)).toBe(-1)
  })

  it('handles Carmichael numbers', () => {
    expect(MillerRabin.isPrime(561)).toBe(false)
    expect(MillerRabin.isPrime(1105)).toBe(false)
    expect(MillerRabin.isPrime(1729)).toBe(false)
  })

  it('identifies twin primes', () => {
    expect(MillerRabin.isPrime(29)).toBe(true)
    expect(MillerRabin.isPrime(31)).toBe(true)
    expect(MillerRabin.isPrime(41)).toBe(true)
    expect(MillerRabin.isPrime(43)).toBe(true)
  })

  it('primeCount works for small values', () => {
    expect(MillerRabin.primeCount(10)).toBe(4)
    expect(MillerRabin.primeCount(20)).toBe(8)
    expect(MillerRabin.primeCount(2)).toBe(0)
  })

  it('nextPrime after large number', () => {
    const p = MillerRabin.nextPrime(1000000)
    expect(MillerRabin.isPrime(p)).toBe(true)
    expect(p).toBeGreaterThan(1000000)
  })

  it('prevPrime for large number', () => {
    const p = MillerRabin.prevPrime(1000000)
    expect(MillerRabin.isPrime(p)).toBe(true)
    expect(p).toBeLessThan(1000000)
  })

  it('isPrime for all numbers under 30 matches known primes', () => {
    const expected = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    for (let i = 0; i < 30; i++) {
      expect(MillerRabin.isPrime(i)).toBe(expected.includes(i))
    }
  })

  it('primeCount for 100 is 25', () => {
    expect(MillerRabin.primeCount(100)).toBe(25)
  })

  it('nextPrime returns 2 for n < 2', () => {
    expect(MillerRabin.nextPrime(-5)).toBe(2)
    expect(MillerRabin.nextPrime(0)).toBe(2)
    expect(MillerRabin.nextPrime(1)).toBe(2)
  })

  it('prevPrime returns -1 for n <= 2', () => {
    expect(MillerRabin.prevPrime(2)).toBe(-1)
    expect(MillerRabin.prevPrime(1)).toBe(-1)
  })

  it('nextPrime returns next prime after n', () => {
    expect(MillerRabin.nextPrime(2)).toBe(3)
    expect(MillerRabin.nextPrime(10)).toBe(11)
    expect(MillerRabin.nextPrime(100)).toBe(101)
  })

  it('primeCount matches known values', () => {
    expect(MillerRabin.primeCount(10)).toBe(4)
    expect(MillerRabin.primeCount(1000)).toBe(168)
  })

  it('identifies 2 as prime', () => {
    expect(MillerRabin.isPrime(2n)).toBe(true)
  })

  it('identifies 4 as not prime', () => {
    expect(MillerRabin.isPrime(4)).toBe(false)
  })

  it('identifies 7 as prime', () => {
    expect(MillerRabin.isPrime(7)).toBe(true)
  })

  it('identifies 4 as not prime', () => {
    expect(MillerRabin.isPrime(4)).toBe(false)
  })

  it('identifies 2 as prime', () => {
    expect(MillerRabin.isPrime(2)).toBe(true)
  })
})
