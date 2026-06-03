import { describe, expect, it } from 'vitest'
import { NumberTheory } from '../../src/utils/number-theory.js'

describe('NumberTheory', () => {
  it('gcd computes correctly', () => {
    expect(NumberTheory.gcd(12, 8)).toBe(4)
    expect(NumberTheory.gcd(17, 13)).toBe(1)
  })

  it('gcd handles zero', () => {
    expect(NumberTheory.gcd(5, 0)).toBe(5)
    expect(NumberTheory.gcd(0, 5)).toBe(5)
  })

  it('lcm computes correctly', () => {
    expect(NumberTheory.lcm(4, 6)).toBe(12)
    expect(NumberTheory.lcm(5, 7)).toBe(35)
  })

  it('lcm with zero', () => {
    expect(NumberTheory.lcm(5, 0)).toBe(0)
  })

  it('isPrime detects primes', () => {
    expect(NumberTheory.isPrime(2)).toBe(true)
    expect(NumberTheory.isPrime(17)).toBe(true)
    expect(NumberTheory.isPrime(4)).toBe(false)
    expect(NumberTheory.isPrime(1)).toBe(false)
  })

  it('factorial computes correctly', () => {
    expect(NumberTheory.factorial(0)).toBe(1n)
    expect(NumberTheory.factorial(5)).toBe(120n)
    expect(NumberTheory.factorial(10)).toBe(3628800n)
  })

  it('factorial throws for negative', () => {
    expect(() => NumberTheory.factorial(-1)).toThrow()
  })

  it('binomialCoefficient computes correctly', () => {
    expect(NumberTheory.binomialCoefficient(5, 2)).toBe(10n)
    expect(NumberTheory.binomialCoefficient(10, 3)).toBe(120n)
    expect(NumberTheory.binomialCoefficient(5, 0)).toBe(1n)
  })

  it('binomialCoefficient returns 0 for invalid k', () => {
    expect(NumberTheory.binomialCoefficient(5, -1)).toBe(0n)
    expect(NumberTheory.binomialCoefficient(5, 6)).toBe(0n)
  })

  it('fibonacci computes correctly', () => {
    expect(NumberTheory.fibonacci(0)).toBe(0n)
    expect(NumberTheory.fibonacci(1)).toBe(1n)
    expect(NumberTheory.fibonacci(10)).toBe(55n)
    expect(NumberTheory.fibonacci(20)).toBe(6765n)
  })

  it('eulerTotient computes correctly', () => {
    expect(NumberTheory.eulerTotient(1)).toBe(1)
    expect(NumberTheory.eulerTotient(6)).toBe(2)
    expect(NumberTheory.eulerTotient(9)).toBe(6)
    expect(NumberTheory.eulerTotient(12)).toBe(4)
  })

  it('mobius function', () => {
    expect(NumberTheory.mobius(1)).toBe(1)
    expect(NumberTheory.mobius(6)).toBe(1)
    expect(NumberTheory.mobius(30)).toBe(-1)
    expect(NumberTheory.mobius(4)).toBe(0)
  })

  it('divisorCount', () => {
    expect(NumberTheory.divisorCount(12)).toBe(6)
    expect(NumberTheory.divisorCount(7)).toBe(2)
    expect(NumberTheory.divisorCount(1)).toBe(1)
  })

  it('sumOfDivisors', () => {
    expect(NumberTheory.sumOfDivisors(6)).toBe(12)
    expect(NumberTheory.sumOfDivisors(12)).toBe(28)
    expect(NumberTheory.sumOfDivisors(1)).toBe(1)
  })

  it('gcd handles negatives', () => {
    expect(NumberTheory.gcd(-12, 8)).toBe(4)
  })

  it('lcm works', () => {
    expect(NumberTheory.lcm(4, 6)).toBe(12)
    expect(NumberTheory.lcm(3, 5)).toBe(15)
  })

  it('gcd of prime numbers is 1', () => {
    expect(NumberTheory.gcd(7, 13)).toBe(1)
    expect(NumberTheory.gcd(17, 23)).toBe(1)
  })

  it('lcm of 4 and 6 is 12', () => {
    expect(NumberTheory.lcm(4, 6)).toBe(12)
  })

  it('gcd of 12 and 8 is 4', () => {
    expect(NumberTheory.gcd(12, 8)).toBe(4)
  })

  it('lcm of 4 and 6 is 12', () => {
    expect(NumberTheory.lcm(4, 6)).toBe(12)
  })

  it('gcd of 12 and 8 is 4', () => {
    expect(NumberTheory.gcd(12, 8)).toBe(4)
  })

  it('lcm of 4 and 6 is 12', () => {
    expect(NumberTheory.lcm(4, 6)).toBe(12)
  })
})
