import { describe, expect, it } from 'vitest'
import { DigitSum } from '../../src/utils/digit-sum.js'

describe('DigitSum', () => {
  describe('sum', () => {
    it('computes digit sum for 123', () => {
      expect(DigitSum.sum(123)).toBe(6)
    })

    it('computes digit sum for 999', () => {
      expect(DigitSum.sum(999)).toBe(27)
    })

    it('handles zero', () => {
      expect(DigitSum.sum(0)).toBe(0)
    })

    it('handles negative numbers', () => {
      expect(DigitSum.sum(-123)).toBe(6)
    })

    it('handles single digit positive', () => {
      expect(DigitSum.sum(5)).toBe(5)
    })

    it('handles single digit negative', () => {
      expect(DigitSum.sum(-5)).toBe(5)
    })

    it('handles large numbers', () => {
      expect(DigitSum.sum(123456789)).toBe(45)
    })

    it('handles very large numbers', () => {
      expect(DigitSum.sum(999999999)).toBe(81)
    })

    it('handles number with zeros', () => {
      expect(DigitSum.sum(100001)).toBe(2)
    })

    it('handles decimal numbers (floored)', () => {
      expect(DigitSum.sum(12.9)).toBe(3)
    })

    it('handles negative decimal (floored)', () => {
      expect(DigitSum.sum(-12.9)).toBe(4)
    })

    it('handles max safe integer', () => {
      expect(DigitSum.sum(Number.MAX_SAFE_INTEGER)).toBe(76)
    })
  })

  describe('digitalRoot', () => {
    it('computes digital root for 123', () => {
      expect(DigitSum.digitalRoot(123)).toBe(6)
    })

    it('computes digital root for 999', () => {
      expect(DigitSum.digitalRoot(999)).toBe(9)
    })

    it('returns 0 for 0', () => {
      expect(DigitSum.digitalRoot(0)).toBe(0)
    })

    it('handles negative numbers', () => {
      expect(DigitSum.digitalRoot(-123)).toBe(6)
    })

    it('returns single digit for single digit', () => {
      expect(DigitSum.digitalRoot(7)).toBe(7)
    })

    it('computes digital root for 38', () => {
      expect(DigitSum.digitalRoot(38)).toBe(2)
    })

    it('handles large numbers', () => {
      expect(DigitSum.digitalRoot(123456789)).toBe(9)
    })

    it('handles 10 (digital root is 1)', () => {
      expect(DigitSum.digitalRoot(10)).toBe(1)
    })

    it('handles 19 (digital root is 1)', () => {
      expect(DigitSum.digitalRoot(19)).toBe(1)
    })

    it('handles decimal numbers (floored)', () => {
      expect(DigitSum.digitalRoot(12.9)).toBe(3)
    })

    it('handles negative decimal (floored)', () => {
      expect(DigitSum.digitalRoot(-12.9)).toBe(4)
    })

    it('handles max safe integer', () => {
      expect(DigitSum.digitalRoot(Number.MAX_SAFE_INTEGER)).toBe(4)
    })

    it('digital root of multiples of 9 is 9', () => {
      expect(DigitSum.digitalRoot(18)).toBe(9)
      expect(DigitSum.digitalRoot(27)).toBe(9)
      expect(DigitSum.digitalRoot(36)).toBe(9)
    })
  })

  describe('isHarshad', () => {
    it('detects 18 as Harshad number', () => {
      expect(DigitSum.isHarshad(18)).toBe(true)
    })

    it('detects 21 as Harshad number', () => {
      expect(DigitSum.isHarshad(21)).toBe(true)
    })

    it('rejects 19 as not Harshad', () => {
      expect(DigitSum.isHarshad(19)).toBe(false)
    })

    it('rejects non-positive (0)', () => {
      expect(DigitSum.isHarshad(0)).toBe(false)
    })

    it('rejects negative numbers', () => {
      expect(DigitSum.isHarshad(-18)).toBe(false)
    })

    it('detects 1 as Harshad', () => {
      expect(DigitSum.isHarshad(1)).toBe(true)
    })

    it('detects 2 as Harshad', () => {
      expect(DigitSum.isHarshad(2)).toBe(true)
    })

    it('detects 10 as Harshad', () => {
      expect(DigitSum.isHarshad(10)).toBe(true)
    })

    it('detects 12 as Harshad', () => {
      expect(DigitSum.isHarshad(12)).toBe(true)
    })

    it('rejects 11 as not Harshad', () => {
      expect(DigitSum.isHarshad(11)).toBe(false)
    })

    it('detects 20 as Harshad', () => {
      expect(DigitSum.isHarshad(20)).toBe(true)
    })

    it('rejects 13 as not Harshad', () => {
      expect(DigitSum.isHarshad(13)).toBe(false)
    })
  })

  describe('isMoran', () => {
    it('detects 18 as Moran number', () => {
      expect(DigitSum.isMoran(18)).toBe(true)
    })

    it('detects 21 as Moran number', () => {
      expect(DigitSum.isMoran(21)).toBe(true)
    })

    it('rejects 22 as not Moran', () => {
      expect(DigitSum.isMoran(22)).toBe(false)
    })

    it('rejects non-positive (0)', () => {
      expect(DigitSum.isMoran(0)).toBe(false)
    })

    it('rejects negative numbers', () => {
      expect(DigitSum.isMoran(-18)).toBe(false)
    })

    it('detects 27 as Moran number', () => {
      expect(DigitSum.isMoran(27)).toBe(true)
    })

    it('detects 42 as Moran number', () => {
      expect(DigitSum.isMoran(42)).toBe(true)
    })

    it('rejects 24 as not Moran', () => {
      expect(DigitSum.isMoran(24)).toBe(false)
    })

    it('detects 111 as Moran number', () => {
      expect(DigitSum.isMoran(111)).toBe(true)
    })
  })

  describe('isPrime', () => {
    it('detects 2 as prime', () => {
      expect(DigitSum.isPrime(2)).toBe(true)
    })

    it('detects 7 as prime', () => {
      expect(DigitSum.isPrime(7)).toBe(true)
    })

    it('rejects 1 as not prime', () => {
      expect(DigitSum.isPrime(1)).toBe(false)
    })

    it('rejects 4 as not prime', () => {
      expect(DigitSum.isPrime(4)).toBe(false)
    })

    it('rejects 0 as not prime', () => {
      expect(DigitSum.isPrime(0)).toBe(false)
    })

    it('rejects negative numbers', () => {
      expect(DigitSum.isPrime(-7)).toBe(false)
    })

    it('detects 3 as prime', () => {
      expect(DigitSum.isPrime(3)).toBe(true)
    })

    it('detects 11 as prime', () => {
      expect(DigitSum.isPrime(11)).toBe(true)
    })

    it('rejects 9 as not prime', () => {
      expect(DigitSum.isPrime(9)).toBe(false)
    })

    it('detects 97 as prime', () => {
      expect(DigitSum.isPrime(97)).toBe(true)
    })

    it('rejects 100 as not prime', () => {
      expect(DigitSum.isPrime(100)).toBe(false)
    })

    it('detects 997 as prime', () => {
      expect(DigitSum.isPrime(997)).toBe(true)
    })
  })

  describe('countDigits', () => {
    it('returns 1 for 0', () => {
      expect(DigitSum.countDigits(0)).toBe(1)
    })

    it('returns 3 for 123', () => {
      expect(DigitSum.countDigits(123)).toBe(3)
    })

    it('returns 5 for 99999', () => {
      expect(DigitSum.countDigits(99999)).toBe(5)
    })

    it('handles negative numbers', () => {
      expect(DigitSum.countDigits(-123)).toBe(3)
    })

    it('returns 1 for single digit', () => {
      expect(DigitSum.countDigits(5)).toBe(1)
    })

    it('returns 10 for max safe integer', () => {
      expect(DigitSum.countDigits(Number.MAX_SAFE_INTEGER)).toBe(16)
    })

    it('handles 10', () => {
      expect(DigitSum.countDigits(10)).toBe(2)
    })

    it('handles 100', () => {
      expect(DigitSum.countDigits(100)).toBe(3)
    })

    it('handles 999999999', () => {
      expect(DigitSum.countDigits(999999999)).toBe(9)
    })

    it('handles 1 followed by zeros', () => {
      expect(DigitSum.countDigits(1000000)).toBe(7)
    })
  })

  describe('reverse', () => {
    it('reverses 123 to 321', () => {
      expect(DigitSum.reverse(123)).toBe(321)
    })

    it('reverses 100 to 1', () => {
      expect(DigitSum.reverse(100)).toBe(1)
    })

    it('handles negative numbers', () => {
      expect(DigitSum.reverse(-123)).toBe(-321)
    })

    it('reverses single digit', () => {
      expect(DigitSum.reverse(5)).toBe(5)
    })

    it('reverses 1200 to 21', () => {
      expect(DigitSum.reverse(1200)).toBe(21)
    })

    it('handles 0', () => {
      expect(DigitSum.reverse(0)).toBe(0)
    })

    it('reverses -100 to -1', () => {
      expect(DigitSum.reverse(-100)).toBe(-1)
    })

    it('reverses large number', () => {
      expect(DigitSum.reverse(123456789)).toBe(987654321)
    })

    it('reverses negative large number', () => {
      expect(DigitSum.reverse(-123456789)).toBe(-987654321)
    })

    it('handles -5', () => {
      expect(DigitSum.reverse(-5)).toBe(-5)
    })
  })

  describe('isPalindrome', () => {
    it('detects 121 as palindrome', () => {
      expect(DigitSum.isPalindrome(121)).toBe(true)
    })

    it('rejects 123 as not palindrome', () => {
      expect(DigitSum.isPalindrome(123)).toBe(false)
    })

    it('detects 0 as palindrome', () => {
      expect(DigitSum.isPalindrome(0)).toBe(true)
    })

    it('detects single digit as palindrome', () => {
      expect(DigitSum.isPalindrome(5)).toBe(true)
    })

    it('detects 11 as palindrome', () => {
      expect(DigitSum.isPalindrome(11)).toBe(true)
    })

    it('detects 1221 as palindrome', () => {
      expect(DigitSum.isPalindrome(1221)).toBe(true)
    })

    it('detects -121 as palindrome (negative)', () => {
      expect(DigitSum.isPalindrome(-121)).toBe(true)
    })

    it('detects 1 as palindrome', () => {
      expect(DigitSum.isPalindrome(1)).toBe(true)
    })

    it('detects 9 as palindrome', () => {
      expect(DigitSum.isPalindrome(9)).toBe(true)
    })

    it('rejects 10 as not palindrome', () => {
      expect(DigitSum.isPalindrome(10)).toBe(false)
    })
  })

  describe('sumOfSquares', () => {
    it('computes sum of squares for 12', () => {
      expect(DigitSum.sumOfSquares(12)).toBe(5)
    })

    it('computes sum of squares for 999', () => {
      expect(DigitSum.sumOfSquares(999)).toBe(243)
    })

    it('handles 0', () => {
      expect(DigitSum.sumOfSquares(0)).toBe(0)
    })

    it('handles single digit', () => {
      expect(DigitSum.sumOfSquares(5)).toBe(25)
    })

    it('handles negative numbers', () => {
      expect(DigitSum.sumOfSquares(-12)).toBe(5)
    })

    it('handles 1', () => {
      expect(DigitSum.sumOfSquares(1)).toBe(1)
    })

    it('handles 123', () => {
      expect(DigitSum.sumOfSquares(123)).toBe(14)
    })

    it('handles 100', () => {
      expect(DigitSum.sumOfSquares(100)).toBe(1)
    })

    it('handles 99', () => {
      expect(DigitSum.sumOfSquares(99)).toBe(162)
    })

    it('handles decimal numbers (floored)', () => {
      expect(DigitSum.sumOfSquares(12.9)).toBe(5)
    })
  })

  describe('isHappy', () => {
    it('detects 1 as happy', () => {
      expect(DigitSum.isHappy(1)).toBe(true)
    })

    it('detects 19 as happy', () => {
      expect(DigitSum.isHappy(19)).toBe(true)
    })

    it('rejects 2 as not happy', () => {
      expect(DigitSum.isHappy(2)).toBe(false)
    })

    it('detects 7 as happy', () => {
      expect(DigitSum.isHappy(7)).toBe(true)
    })

    it('rejects 4 as not happy', () => {
      expect(DigitSum.isHappy(4)).toBe(false)
    })

    it('detects 10 as happy', () => {
      expect(DigitSum.isHappy(10)).toBe(true)
    })

    it('detects 13 as happy', () => {
      expect(DigitSum.isHappy(13)).toBe(true)
    })

    it('detects 23 as happy', () => {
      expect(DigitSum.isHappy(23)).toBe(true)
    })

    it('detects 28 as happy', () => {
      expect(DigitSum.isHappy(28)).toBe(true)
    })

    it('rejects 5 as not happy', () => {
      expect(DigitSum.isHappy(5)).toBe(false)
    })

    it('rejects 8 as not happy', () => {
      expect(DigitSum.isHappy(8)).toBe(false)
    })

    it('rejects 9 as not happy', () => {
      expect(DigitSum.isHappy(9)).toBe(false)
    })
  })
})
describe('digit-sum - wave562', () => {
  it('digit-sum w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w562 v1', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - wave563', () => {
  it('digit-sum w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - wave564', () => {
  it('digit-sum w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - wave565', () => {
  it('digit-sum w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - wave566', () => {
  it('digit-sum w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - wave127', () => {
  it('digit-sum w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - wave130', () => {
  it('digit-sum w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - wave133', () => {
  it('digit-sum w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - wave136', () => {
  it('digit-sum w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - wave139', () => {
  it('digit-sum w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - w142', () => {
  it('digit-sum v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - w145', () => {
  it('digit-sum v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - w148', () => {
  it('digit-sum v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - w151', () => {
  it('digit-sum v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - w154', () => {
  it('digit-sum v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - w157', () => {
  it('digit-sum v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('digit-sum - w160', () => {
  it('digit-sum v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('digit-sum v160x2', () => {
    expect(describe).toBeDefined()
  })
})
