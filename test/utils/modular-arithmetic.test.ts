import { describe, expect, it } from 'vitest'
import { ModularArithmetic } from '../../src/utils/modular-arithmetic.js'

describe('ModularArithmetic', () => {
  describe('mod', () => {
    it('handles positive numbers', () => {
      expect(ModularArithmetic.mod(7, 5)).toBe(2)
    })

    it('handles negative numbers', () => {
      expect(ModularArithmetic.mod(-3, 5)).toBe(2)
    })

    it('returns 0 for exact multiples', () => {
      expect(ModularArithmetic.mod(10, 5)).toBe(0)
    })
  })

  describe('add', () => {
    it('adds and takes mod', () => {
      expect(ModularArithmetic.add(3, 4, 5)).toBe(2)
    })

    it('handles wrapping', () => {
      expect(ModularArithmetic.add(6, 7, 10)).toBe(3)
      expect(ModularArithmetic.add(0, 0, 7)).toBe(0)
    })
  })

  describe('sub', () => {
    it('subtracts and takes mod', () => {
      expect(ModularArithmetic.sub(3, 7, 5)).toBe(1)
    })

    it('handles underflow', () => {
      expect(ModularArithmetic.sub(2, 5, 7)).toBe(4)
    })
  })

  describe('mul', () => {
    it('multiplies and takes mod', () => {
      expect(ModularArithmetic.mul(3, 4, 5)).toBe(2)
    })

    it('handles large products', () => {
      expect(ModularArithmetic.mul(100000, 100000, 7)).toBe(ModularArithmetic.mod(10000000000 % 7, 7))
    })

    it('handles zero', () => {
      expect(ModularArithmetic.mul(0, 5, 7)).toBe(0)
    })
  })

  describe('pow', () => {
    it('computes power mod', () => {
      expect(ModularArithmetic.pow(2, 10, 1000)).toBe(24)
    })

    it('handles power of 0', () => {
      expect(ModularArithmetic.pow(5, 0, 7)).toBe(1)
    })

    it('handles power of 1', () => {
      expect(ModularArithmetic.pow(3, 1, 7)).toBe(3)
    })

    it('handles large exponents via Fermat', () => {
      expect(ModularArithmetic.pow(2, 10, 1000000007)).toBe(1024)
    })
  })

  describe('extendedGcd', () => {
    it('computes gcd of coprime numbers', () => {
      const result = ModularArithmetic.extendedGcd(35, 15)
      expect(result.gcd).toBe(5)
    })

    it('satisfies Bezout identity', () => {
      const { gcd, x, y } = ModularArithmetic.extendedGcd(35, 15)
      expect(35 * x + 15 * y).toBe(gcd)
    })

    it('handles gcd with 0', () => {
      const result = ModularArithmetic.extendedGcd(0, 5)
      expect(result.gcd).toBe(5)
    })
  })

  describe('modInverse', () => {
    it('finds inverse of coprime numbers', () => {
      const inv = ModularArithmetic.modInverse(3, 7)
      expect(inv).not.toBeNull()
      expect(ModularArithmetic.mul(3, inv!, 7)).toBe(1)
    })

    it('returns null for non-coprime', () => {
      expect(ModularArithmetic.modInverse(2, 4)).toBeNull()
    })

    it('finds inverse of 1', () => {
      expect(ModularArithmetic.modInverse(1, 5)).toBe(1)
    })

    it('verifies inverse of larger numbers', () => {
      const inv = ModularArithmetic.modInverse(17, 43)
      expect(inv).not.toBeNull()
      expect(ModularArithmetic.mul(17, inv!, 43)).toBe(1)
    })
  })

  describe('modDiv', () => {
    it('divides via modular inverse', () => {
      const result = ModularArithmetic.modDiv(6, 3, 7)
      expect(result).not.toBeNull()
      expect(result).toBe(2)
    })

    it('returns null when divisor has no inverse', () => {
      expect(ModularArithmetic.modDiv(1, 2, 4)).toBeNull()
    })
  })

  describe('factorial', () => {
    it('computes small factorial', () => {
      expect(ModularArithmetic.factorial(5, 1000000007)).toBe(120)
    })

    it('computes factorial mod', () => {
      expect(ModularArithmetic.factorial(10, 7)).toBe(0)
    })

    it('factorial of 0 is 1', () => {
      expect(ModularArithmetic.factorial(0, 7)).toBe(1)
    })
  })

  describe('nCr', () => {
    it('computes small combination', () => {
      expect(ModularArithmetic.nCr(5, 2, 1000000007)).toBe(10)
    })

    it('handles edge cases', () => {
      expect(ModularArithmetic.nCr(5, 0, 1000000007)).toBe(1)
      expect(ModularArithmetic.nCr(5, 5, 1000000007)).toBe(1)
    })

    it('returns 0 for invalid r', () => {
      expect(ModularArithmetic.nCr(5, -1, 1000000007)).toBe(0)
      expect(ModularArithmetic.nCr(5, 6, 1000000007)).toBe(0)
    })

    it('computes C(10,3)', () => {
      expect(ModularArithmetic.nCr(10, 3, 1000000007)).toBe(120)
    })
  })
})
