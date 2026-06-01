import { describe, expect, it } from 'vitest'
import { Narcissistic } from '../../src/utils/narcissistic.js'

describe('Narcissistic', () => {
  it('detects single digit narcissistic numbers', () => {
    for (let i = 0; i <= 9; i++) {
      expect(Narcissistic.isNarcissistic(i)).toBe(true)
    }
  })

  it('detects 153 as narcissistic', () => {
    expect(Narcissistic.isNarcissistic(153)).toBe(true)
  })

  it('detects 370 as narcissistic', () => {
    expect(Narcissistic.isNarcissistic(370)).toBe(true)
  })

  it('detects 9474 as narcissistic', () => {
    expect(Narcissistic.isNarcissistic(9474)).toBe(true)
  })

  it('rejects non-narcissistic', () => {
    expect(Narcissistic.isNarcissistic(10)).toBe(false)
    expect(Narcissistic.isNarcissistic(100)).toBe(false)
  })

  it('rejects negative', () => {
    expect(Narcissistic.isNarcissistic(-153)).toBe(false)
  })

  it('generates narcissistic numbers up to 1000', () => {
    const result = Narcissistic.generate(1000)
    expect(result).toContain(1)
    expect(result).toContain(153)
    expect(result).toContain(370)
    expect(result).toContain(371)
    expect(result).toContain(407)
  })

  it('digitPowerSum computes correctly', () => {
    expect(Narcissistic.digitPowerSum(153)).toBe(153)
    expect(Narcissistic.digitPowerSum(123)).toBe(36)
  })

  it('next finds next narcissistic number', () => {
    expect(Narcissistic.next(9)).toBe(153)
    expect(Narcissistic.next(152)).toBe(153)
  })

  it('isPerfectDigitalInvariant with fixed power', () => {
    expect(Narcissistic.isPerfectDigitalInvariant(1634, 4)).toBe(true)
    expect(Narcissistic.isPerfectDigitalInvariant(8208, 4)).toBe(true)
    expect(Narcissistic.isPerfectDigitalInvariant(1234, 4)).toBe(false)
  })

  it('countDigits returns correct count', () => {
    expect(Narcissistic.countDigits(0)).toBe(1)
    expect(Narcissistic.countDigits(153)).toBe(3)
    expect(Narcissistic.countDigits(9474)).toBe(4)
  })

  it('generate up to 100 includes all single digits', () => {
    const result = Narcissistic.generate(100)
    expect(result.filter(n => n < 10).length).toBe(10)
  })

  it('generate up to 10000 includes 9474', () => {
    const result = Narcissistic.generate(10000)
    expect(result).toContain(9474)
  })

  it('0 is narcissistic', () => {
    expect(Narcissistic.isNarcissistic(0)).toBe(true)
  })

  it('isPerfectDigitalInvariant 3-digit Armstrong', () => {
    expect(Narcissistic.isPerfectDigitalInvariant(371, 3)).toBe(true)
  })

  it('generate up to 1000 includes known values', () => {
    const result = Narcissistic.generate(1000)
    expect(result).toContain(153)
    expect(result).toContain(370)
    expect(result).toContain(371)
    expect(result).toContain(407)
  })
})
