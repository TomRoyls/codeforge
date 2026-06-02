import { describe, expect, it } from 'vitest'
import { CRT } from '../../src/utils/chinese-remainder.js'

describe('CRT', () => {
  describe('solve', () => {
    it('solves simple x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)', () => {
      const result = CRT.solve([2, 3, 2], [3, 5, 7])
      expect(result).not.toBeNull()
      expect(result!.remainder).toBe(23)
      expect(result!.modulus).toBe(105)
    })

    it('solves x ≡ 0 (mod 3), x ≡ 3 (mod 4)', () => {
      const result = CRT.solve([0, 3], [3, 4])
      expect(result).not.toBeNull()
      expect(result!.remainder).toBe(3)
      expect(result!.modulus).toBe(12)
    })

    it('handles single congruence', () => {
      const result = CRT.solve([3], [7])
      expect(result).not.toBeNull()
      expect(result!.remainder).toBe(3)
      expect(result!.modulus).toBe(7)
    })

    it('returns null for inconsistent system', () => {
      const result = CRT.solve([1, 2], [2, 4])
      expect(result).toBeNull()
    })

    it('returns null for empty arrays', () => {
      expect(CRT.solve([], [])).toBeNull()
    })

    it('returns null for mismatched lengths', () => {
      expect(CRT.solve([1, 2], [3])).toBeNull()
    })

    it('solves coprime moduli', () => {
      const result = CRT.solve([1, 2, 3], [5, 7, 9])
      expect(result).not.toBeNull()
      expect(result!.remainder % 5).toBe(1)
      expect(result!.remainder % 7).toBe(2)
      expect(result!.remainder % 9).toBe(3)
    })
  })

  describe('gcd', () => {
    it('computes gcd of 12 and 8', () => {
      expect(CRT.gcd(12, 8)).toBe(4)
    })

    it('gcd of coprime numbers is 1', () => {
      expect(CRT.gcd(7, 11)).toBe(1)
    })

    it('gcd of equal numbers', () => {
      expect(CRT.gcd(5, 5)).toBe(5)
    })

    it('handles negative numbers', () => {
      expect(CRT.gcd(-12, 8)).toBe(4)
    })
  })

  describe('lcm', () => {
    it('computes lcm of 4 and 6', () => {
      expect(CRT.lcm(4, 6)).toBe(12)
    })

    it('lcm of coprime numbers is product', () => {
      expect(CRT.lcm(3, 5)).toBe(15)
    })
  })

  describe('modInverse', () => {
    it('finds modular inverse of 3 mod 7', () => {
      expect(CRT.modInverse(3, 7)).toBe(5)
    })

    it('returns null when inverse does not exist', () => {
      expect(CRT.modInverse(2, 4)).toBeNull()
    })

    it('inverse of 1 is 1', () => {
      expect(CRT.modInverse(1, 7)).toBe(1)
    })

    it('inverse of 7 mod 11', () => {
      const inv = CRT.modInverse(7, 11)
      expect(inv).not.toBeNull()
      expect((7 * inv!) % 11).toBe(1)
    })
  })

  describe('solve edge cases', () => {
    it('handles two identical moduli', () => {
      const result = CRT.solve([1, 1], [5, 5])
      expect(result).not.toBeNull()
      expect(result!.remainder).toBe(1)
      expect(result!.modulus).toBe(5)
    })

    it('solves with large moduli', () => {
      const result = CRT.solve([1, 2], [997, 991])
      expect(result).not.toBeNull()
      expect(result!.remainder % 997).toBe(1)
      expect(result!.remainder % 991).toBe(2)
    })

    it('solve x=1 mod 3, x=2 mod 5', () => {
      const result = CRT.solve([1, 2], [3, 5])
      expect(result).not.toBeNull()
      expect(result!.remainder % 3).toBe(1)
      expect(result!.remainder % 5).toBe(2)
    })
  })
})
