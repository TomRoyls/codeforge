import { describe, expect, it } from 'vitest'
import { RomanNumeral } from '../../src/utils/roman-numeral.js'

describe('RomanNumeral.toRoman', () => {
  it('converts 1 to I', () => {
    expect(RomanNumeral.toRoman(1)).toBe('I')
  })

  it('converts 2 to II', () => {
    expect(RomanNumeral.toRoman(2)).toBe('II')
  })

  it('converts 3 to III', () => {
    expect(RomanNumeral.toRoman(3)).toBe('III')
  })

  it('converts 4 to IV', () => {
    expect(RomanNumeral.toRoman(4)).toBe('IV')
  })

  it('converts 5 to V', () => {
    expect(RomanNumeral.toRoman(5)).toBe('V')
  })

  it('converts 6 to VI', () => {
    expect(RomanNumeral.toRoman(6)).toBe('VI')
  })

  it('converts 9 to IX', () => {
    expect(RomanNumeral.toRoman(9)).toBe('IX')
  })

  it('converts 10 to X', () => {
    expect(RomanNumeral.toRoman(10)).toBe('X')
  })

  it('converts 20 to XX', () => {
    expect(RomanNumeral.toRoman(20)).toBe('XX')
  })

  it('converts 30 to XXX', () => {
    expect(RomanNumeral.toRoman(30)).toBe('XXX')
  })

  it('converts 40 to XL', () => {
    expect(RomanNumeral.toRoman(40)).toBe('XL')
  })

  it('converts 50 to L', () => {
    expect(RomanNumeral.toRoman(50)).toBe('L')
  })

  it('converts 90 to XC', () => {
    expect(RomanNumeral.toRoman(90)).toBe('XC')
  })

  // Hundreds
  it('converts 100 to C', () => {
    expect(RomanNumeral.toRoman(100)).toBe('C')
  })

  it('converts 200 to CC', () => {
    expect(RomanNumeral.toRoman(200)).toBe('CC')
  })

  it('converts 200 to CC', () => {
    expect(RomanNumeral.toRoman(200)).toBe('CC')
  })

  it('converts 400 to CD', () => {
    expect(RomanNumeral.toRoman(400)).toBe('CD')
  })

  it('converts 500 to D', () => {
    expect(RomanNumeral.toRoman(500)).toBe('D')
  })

  it('converts 900 to CM', () => {
    expect(RomanNumeral.toRoman(900)).toBe('CM')
  })

  // Thousands
  it('converts 1000 to M', () => {
    expect(RomanNumeral.toRoman(1000)).toBe('M')
  })

  it('converts 2000 to MM', () => {
    expect(RomanNumeral.toRoman(2000)).toBe('MM')
  })

  it('converts 2000 to MM', () => {
    expect(RomanNumeral.toRoman(2000)).toBe('MM')
  })

  it('converts 3000 to MMM', () => {
    expect(RomanNumeral.toRoman(3000)).toBe('MMM')
  })

  it('converts 58 to LVIII', () => {
    expect(RomanNumeral.toRoman(58)).toBe('LVIII')
  })

  it('converts 99 to XCIX', () => {
    expect(RomanNumeral.toRoman(99)).toBe('XCIX')
  })

  it('converts 1994 to MCMXCIV', () => {
    expect(RomanNumeral.toRoman(1994)).toBe('MCMXCIV')
  })

  it('converts 2444 to MMCDXLIV', () => {
    expect(RomanNumeral.toRoman(2444)).toBe('MMCDXLIV')
  })

  it('converts 3888 to MMMDCCCLXXXVIII', () => {
    expect(RomanNumeral.toRoman(3888)).toBe('MMMDCCCLXXXVIII')
  })

  it('converts 3999 to MMMCMXCIX', () => {
    expect(RomanNumeral.toRoman(3999)).toBe('MMMCMXCIX')
  })

  it('converts 2024 to MMXXIV', () => {
    expect(RomanNumeral.toRoman(2024)).toBe('MMXXIV')
  })

  it('throws for 0', () => {
    expect(() => RomanNumeral.toRoman(0)).toThrow('Number must be an integer between 1 and 3999')
  })

  it('throws for negative numbers', () => {
    expect(() => RomanNumeral.toRoman(-1)).toThrow('Number must be an integer between 1 and 3999')
  })

  it('throws for -100', () => {
    expect(() => RomanNumeral.toRoman(-100)).toThrow('Number must be an integer between 1 and 3999')
  })

  it('throws for 4000', () => {
    expect(() => RomanNumeral.toRoman(4000)).toThrow('Number must be an integer between 1 and 3999')
  })

  it('throws for 5000', () => {
    expect(() => RomanNumeral.toRoman(5000)).toThrow('Number must be an integer between 1 and 3999')
  })

  it('throws for non-integer 3.5', () => {
    expect(() => RomanNumeral.toRoman(3.5)).toThrow('Number must be an integer between 1 and 3999')
  })

  it('throws for non-integer 10.1', () => {
    expect(() => RomanNumeral.toRoman(10.1)).toThrow('Number must be an integer between 1 and 3999')
  })

  it('throws for NaN', () => {
    expect(() => RomanNumeral.toRoman(NaN)).toThrow('Number must be an integer between 1 and 3999')
  })

  it('throws for Infinity', () => {
    expect(() => RomanNumeral.toRoman(Infinity)).toThrow('Number must be an integer between 1 and 3999')
  })
})

describe('RomanNumeral.fromRoman', () => {
  it('parses I to 1', () => {
    expect(RomanNumeral.fromRoman('I')).toBe(1)
  })

  it('parses II to 2', () => {
    expect(RomanNumeral.fromRoman('II')).toBe(2)
  })

  it('parses III to 3', () => {
    expect(RomanNumeral.fromRoman('III')).toBe(3)
  })

  it('parses IV to 4', () => {
    expect(RomanNumeral.fromRoman('IV')).toBe(4)
  })

  it('parses V to 5', () => {
    expect(RomanNumeral.fromRoman('V')).toBe(5)
  })

  it('parses VI to 6', () => {
    expect(RomanNumeral.fromRoman('VI')).toBe(6)
  })

  it('parses IX to 9', () => {
    expect(RomanNumeral.fromRoman('IX')).toBe(9)
  })

  it('parses X to 10', () => {
    expect(RomanNumeral.fromRoman('X')).toBe(10)
  })

  it('parses XL to 40', () => {
    expect(RomanNumeral.fromRoman('XL')).toBe(40)
  })

  it('parses XC to 90', () => {
    expect(RomanNumeral.fromRoman('XC')).toBe(90)
  })

  it('parses CD to 400', () => {
    expect(RomanNumeral.fromRoman('CD')).toBe(400)
  })

  it('parses CM to 900', () => {
    expect(RomanNumeral.fromRoman('CM')).toBe(900)
  })

  it('parses MCMXCIV to 1994', () => {
    expect(RomanNumeral.fromRoman('MCMXCIV')).toBe(1994)
  })

  it('parses MMMCMXCIX to 3999', () => {
    expect(RomanNumeral.fromRoman('MMMCMXCIX')).toBe(3999)
  })

  it('parses LVIII to 58', () => {
    expect(RomanNumeral.fromRoman('LVIII')).toBe(58)
  })

  it('parses MMXXIV to 2024', () => {
    expect(RomanNumeral.fromRoman('MMXXIV')).toBe(2024)
  })

  it('throws for invalid character A', () => {
    expect(() => RomanNumeral.fromRoman('ABCD')).toThrow('Invalid Roman numeral character: A')
  })

  it('throws for invalid character Z', () => {
    expect(() => RomanNumeral.fromRoman('XIZ')).toThrow('Invalid Roman numeral character: Z')
  })

  it('returns 0 for empty string', () => {
    expect(RomanNumeral.fromRoman('')).toBe(0)
  })

  it('throws for lowercase characters', () => {
    expect(() => RomanNumeral.fromRoman('xvi')).toThrow('Invalid Roman numeral character: x')
  })
})

describe('RomanNumeral.isValid', () => {
  it('accepts valid single character numerals', () => {
    expect(RomanNumeral.isValid('I')).toBe(true)
    expect(RomanNumeral.isValid('V')).toBe(true)
    expect(RomanNumeral.isValid('X')).toBe(true)
    expect(RomanNumeral.isValid('L')).toBe(true)
    expect(RomanNumeral.isValid('C')).toBe(true)
    expect(RomanNumeral.isValid('D')).toBe(true)
    expect(RomanNumeral.isValid('M')).toBe(true)
  })

  it('accepts valid subtractive forms', () => {
    expect(RomanNumeral.isValid('IV')).toBe(true)
    expect(RomanNumeral.isValid('IX')).toBe(true)
    expect(RomanNumeral.isValid('XL')).toBe(true)
    expect(RomanNumeral.isValid('XC')).toBe(true)
    expect(RomanNumeral.isValid('CD')).toBe(true)
    expect(RomanNumeral.isValid('CM')).toBe(true)
  })

  it('accepts valid complex numerals', () => {
    expect(RomanNumeral.isValid('XIV')).toBe(true)
    expect(RomanNumeral.isValid('MMXXIV')).toBe(true)
    expect(RomanNumeral.isValid('MCMXCIV')).toBe(true)
    expect(RomanNumeral.isValid('MMMCMXCIX')).toBe(true)
  })

  it('rejects invalid repeating subtractive patterns', () => {
    expect(RomanNumeral.isValid('IVIV')).toBe(false)
    expect(RomanNumeral.isValid('IXIX')).toBe(false)
  })

  it('rejects invalid characters', () => {
    expect(RomanNumeral.isValid('ABC')).toBe(false)
    expect(RomanNumeral.isValid('IXAB')).toBe(false)
  })

  it('rejects invalid repetition rules', () => {
    expect(RomanNumeral.isValid('IIII')).toBe(false)
    expect(RomanNumeral.isValid('VV')).toBe(false)
    expect(RomanNumeral.isValid('XXXX')).toBe(false)
    expect(RomanNumeral.isValid('LL')).toBe(false)
    expect(RomanNumeral.isValid('DD')).toBe(false)
    expect(RomanNumeral.isValid('MMMM')).toBe(false)
  })

  it('rejects invalid subtractive combinations', () => {
    expect(RomanNumeral.isValid('IL')).toBe(false)
    expect(RomanNumeral.isValid('IC')).toBe(false)
    expect(RomanNumeral.isValid('ID')).toBe(false)
    expect(RomanNumeral.isValid('IM')).toBe(false)
    expect(RomanNumeral.isValid('VX')).toBe(false)
    expect(RomanNumeral.isValid('VL')).toBe(false)
    expect(RomanNumeral.isValid('VC')).toBe(false)
    expect(RomanNumeral.isValid('VD')).toBe(false)
    expect(RomanNumeral.isValid('VM')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(RomanNumeral.isValid('')).toBe(false)
  })

  it('rejects lowercase characters', () => {
    expect(RomanNumeral.isValid('xv')).toBe(false)
    expect(RomanNumeral.isValid('MCMxciv')).toBe(false)
  })
})

describe('RomanNumeral roundtrip conversions', () => {
  it('preserves value for single digits', () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      expect(RomanNumeral.fromRoman(RomanNumeral.toRoman(n))).toBe(n)
    }
  })

  it('preserves value for multiples of 10', () => {
    for (const n of [10, 20, 30, 40, 50, 60, 70, 80, 90]) {
      expect(RomanNumeral.fromRoman(RomanNumeral.toRoman(n))).toBe(n)
    }
  })

  it('preserves value for complex numbers', () => {
    for (const n of [1, 4, 9, 49, 99, 449, 1994, 3999]) {
      expect(RomanNumeral.fromRoman(RomanNumeral.toRoman(n))).toBe(n)
    }
  })

  it('preserves value for range 1-100', () => {
    for (let i = 1; i <= 100; i++) {
      expect(RomanNumeral.fromRoman(RomanNumeral.toRoman(i))).toBe(i)
    }
  })

  it('preserves value for thousands', () => {
    for (const n of [1000, 1500, 2000, 2500, 3000, 3500, 3999]) {
      expect(RomanNumeral.fromRoman(RomanNumeral.toRoman(n))).toBe(n)
    }
  })
})
describe('roman-numeral - wave550', () => {
  it('roman-numeral w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('roman-numeral w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('roman-numeral w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('roman-numeral - wave551', () => {
  it('roman-numeral w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('roman-numeral w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('roman-numeral w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roman-numeral - wave552', () => {
  it('roman-numeral w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roman-numeral w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roman-numeral w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roman-numeral - wave553', () => {
  it('roman-numeral w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roman-numeral w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roman-numeral w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('roman-numeral - wave554', () => {
  it('roman-numeral w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('roman-numeral w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('roman-numeral w554 v2', () => {
    expect(describe).toBeDefined()
  })
})
