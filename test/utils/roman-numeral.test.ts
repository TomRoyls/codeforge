import { describe, expect, it } from 'vitest'
import { RomanNumeral } from '../../src/utils/roman-numeral.js'

describe('RomanNumeral', () => {
  it('converts 1 to I', () => {
    expect(RomanNumeral.toRoman(1)).toBe('I')
  })

  it('converts 4 to IV', () => {
    expect(RomanNumeral.toRoman(4)).toBe('IV')
  })

  it('converts 9 to IX', () => {
    expect(RomanNumeral.toRoman(9)).toBe('IX')
  })

  it('converts 58 to LVIII', () => {
    expect(RomanNumeral.toRoman(58)).toBe('LVIII')
  })

  it('converts 1994 to MCMXCIV', () => {
    expect(RomanNumeral.toRoman(1994)).toBe('MCMXCIV')
  })

  it('converts 3999', () => {
    expect(RomanNumeral.toRoman(3999)).toBe('MMMCMXCIX')
  })

  it('parses I to 1', () => {
    expect(RomanNumeral.fromRoman('I')).toBe(1)
  })

  it('parses IV to 4', () => {
    expect(RomanNumeral.fromRoman('IV')).toBe(4)
  })

  it('parses MCMXCIV to 1994', () => {
    expect(RomanNumeral.fromRoman('MCMXCIV')).toBe(1994)
  })

  it('roundtrip preserves value', () => {
    for (const n of [1, 4, 9, 49, 99, 449, 1994, 3999]) {
      expect(RomanNumeral.fromRoman(RomanNumeral.toRoman(n))).toBe(n)
    }
  })

  it('throws for 0', () => {
    expect(() => RomanNumeral.toRoman(0)).toThrow()
  })

  it('throws for negative', () => {
    expect(() => RomanNumeral.toRoman(-1)).toThrow()
  })

  it('throws for >3999', () => {
    expect(() => RomanNumeral.toRoman(4000)).toThrow()
  })

  it('throws for non-integer', () => {
    expect(() => RomanNumeral.toRoman(3.5)).toThrow()
  })

  it('isValid accepts valid numerals', () => {
    expect(RomanNumeral.isValid('XIV')).toBe(true)
    expect(RomanNumeral.isValid('MMXXIV')).toBe(true)
  })

  it('isValid rejects invalid numerals', () => {
    expect(RomanNumeral.isValid('IIII')).toBe(false)
    expect(RomanNumeral.isValid('ABC')).toBe(false)
  })

  it('handles 40 and 90', () => {
    expect(RomanNumeral.toRoman(40)).toBe('XL')
    expect(RomanNumeral.toRoman(90)).toBe('XC')
  })

  it('handles 1', () => {
    expect(RomanNumeral.toRoman(1)).toBe('I')
  })

  it('handles 4', () => {
    expect(RomanNumeral.toRoman(4)).toBe('IV')
  })

  it('handles 9', () => {
    expect(RomanNumeral.toRoman(9)).toBe('IX')
  })
})
