import { describe, expect, it } from 'vitest'
import { DigitSum } from '../../src/utils/digit-sum.js'

describe('DigitSum', () => {
  it('computes digit sum', () => {
    expect(DigitSum.sum(123)).toBe(6)
    expect(DigitSum.sum(999)).toBe(27)
  })

  it('handles zero', () => {
    expect(DigitSum.sum(0)).toBe(0)
  })

  it('handles negative', () => {
    expect(DigitSum.sum(-123)).toBe(6)
  })

  it('computes digital root', () => {
    expect(DigitSum.digitalRoot(123)).toBe(6)
    expect(DigitSum.digitalRoot(999)).toBe(9)
    expect(DigitSum.digitalRoot(0)).toBe(0)
  })

  it('isHarshad detects Harshad numbers', () => {
    expect(DigitSum.isHarshad(18)).toBe(true)
    expect(DigitSum.isHarshad(21)).toBe(true)
    expect(DigitSum.isHarshad(19)).toBe(false)
  })

  it('countDigits returns digit count', () => {
    expect(DigitSum.countDigits(0)).toBe(1)
    expect(DigitSum.countDigits(123)).toBe(3)
    expect(DigitSum.countDigits(99999)).toBe(5)
  })

  it('reverse reverses digits', () => {
    expect(DigitSum.reverse(123)).toBe(321)
    expect(DigitSum.reverse(100)).toBe(1)
    expect(DigitSum.reverse(-123)).toBe(-321)
  })

  it('isPalindrome detects palindromic numbers', () => {
    expect(DigitSum.isPalindrome(121)).toBe(true)
    expect(DigitSum.isPalindrome(123)).toBe(false)
    expect(DigitSum.isPalindrome(0)).toBe(true)
  })

  it('isPrime detects primes', () => {
    expect(DigitSum.isPrime(2)).toBe(true)
    expect(DigitSum.isPrime(7)).toBe(true)
    expect(DigitSum.isPrime(1)).toBe(false)
    expect(DigitSum.isPrime(4)).toBe(false)
  })

  it('sumOfSquares computes sum of digit squares', () => {
    expect(DigitSum.sumOfSquares(12)).toBe(5)
    expect(DigitSum.sumOfSquares(999)).toBe(243)
  })

  it('isHappy detects happy numbers', () => {
    expect(DigitSum.isHappy(1)).toBe(true)
    expect(DigitSum.isHappy(19)).toBe(true)
    expect(DigitSum.isHappy(2)).toBe(false)
  })

  it('isMoran detects Moran numbers', () => {
    expect(DigitSum.isMoran(18)).toBe(true)
    expect(DigitSum.isMoran(21)).toBe(true)
    expect(DigitSum.isMoran(22)).toBe(false)
  })

  it('handles large numbers', () => {
    expect(DigitSum.sum(123456789)).toBe(45)
    expect(DigitSum.digitalRoot(123456789)).toBe(9)
  })

  it('isHarshad rejects non-positive', () => {
    expect(DigitSum.isHarshad(0)).toBe(false)
    expect(DigitSum.isHarshad(-18)).toBe(false)
  })

  it('countDigits handles negative', () => {
    expect(DigitSum.countDigits(-123)).toBe(3)
  })

  it('isHappy handles 7 (happy) and 4 (unhappy)', () => {
    expect(DigitSum.isHappy(7)).toBe(true)
    expect(DigitSum.isHappy(4)).toBe(false)
  })

  it('isHappy 1 is happy', () => {
    expect(DigitSum.isHappy(1)).toBe(true)
  })

  it('isHappy 7 is happy', () => {
    expect(DigitSum.isHappy(7)).toBe(true)
  })

  it('isHappy 2 is not happy', () => {
    expect(DigitSum.isHappy(2)).toBe(false)
  })
})
