import { describe, expect, it } from 'vitest'
import { ChineseRemainderTheorem } from '../../src/utils/crt.js'

describe('ChineseRemainderTheorem', () => {
  it('solves simple CRT problem', () => {
    const result = ChineseRemainderTheorem.solve([2, 3, 2], [3, 5, 7])
    expect(result).not.toBeNull()
    expect(result!.remainder).toBe(23)
    expect(result!.modulus).toBe(105)
  })

  it('solves two equations', () => {
    const result = ChineseRemainderTheorem.solve([1, 2], [3, 5])
    expect(result).not.toBeNull()
    expect(result!.remainder % 3).toBe(1)
    expect(result!.remainder % 5).toBe(2)
  })

  it('handles single equation', () => {
    const result = ChineseRemainderTheorem.solve([3], [7])
    expect(result).toEqual({ remainder: 3, modulus: 7 })
  })

  it('returns null for empty input', () => {
    expect(ChineseRemainderTheorem.solve([], [])).toBeNull()
  })

  it('returns null for incompatible moduli', () => {
    expect(ChineseRemainderTheorem.solve([1, 2], [2, 4])).toBeNull()
  })

  it('solves all zeros', () => {
    const result = ChineseRemainderTheorem.solve([0, 0], [3, 5])
    expect(result).not.toBeNull()
    expect(result!.remainder).toBe(0)
  })

  it('modularInverse finds inverse', () => {
    const inv = ChineseRemainderTheorem.modularInverse(3, 7)
    expect(inv).not.toBeNull()
    expect((3 * inv!) % 7).toBe(1)
  })

  it('modularInverse returns null for non-coprime', () => {
    expect(ChineseRemainderTheorem.modularInverse(2, 4)).toBeNull()
  })

  it('lcm computes correctly', () => {
    expect(ChineseRemainderTheorem.lcm(12, 18)).toBe(36)
  })

  it('lcm of coprime numbers is product', () => {
    expect(ChineseRemainderTheorem.lcm(7, 11)).toBe(77)
  })

  it('solves with larger moduli', () => {
    const result = ChineseRemainderTheorem.solve([0, 3, 4], [5, 11, 13])
    expect(result).not.toBeNull()
    expect(result!.remainder % 5).toBe(0)
    expect(result!.remainder % 11).toBe(3)
    expect(result!.remainder % 13).toBe(4)
  })

  it('handles moderate numbers', () => {
    const result = ChineseRemainderTheorem.solve([1, 2], [97, 89])
    expect(result).not.toBeNull()
    expect(result!.remainder % 97).toBe(1)
    expect(result!.remainder % 89).toBe(2)
  })

  it('handles two same moduli', () => {
    const result = ChineseRemainderTheorem.solve([1, 1], [3, 3])
    expect(result).not.toBeNull()
    expect(result!.remainder % 3).toBe(1)
  })

  it('handles single congruence', () => {
    const result = ChineseRemainderTheorem.solve([7], [11])
    expect(result).not.toBeNull()
    expect(result!.remainder % 11).toBe(7)
  })

  it('handles congruence of zero', () => {
    const result = ChineseRemainderTheorem.solve([0, 0], [3, 5])
    expect(result).not.toBeNull()
    expect(result!.remainder % 3).toBe(0)
    expect(result!.remainder % 5).toBe(0)
    expect(result!.remainder).toBe(0)
  })

  it('solves with tuple input format', () => {
    const result = ChineseRemainderTheorem.solve([[2, 3], [3, 5]])
    expect(result).not.toBeNull()
    expect(result!.remainder % 3).toBe(2)
    expect(result!.remainder % 5).toBe(3)
  })

  it('solves with single tuple input', () => {
    const result = ChineseRemainderTheorem.solve([[7, 11]])
    expect(result).not.toBeNull()
    expect(result!.remainder).toBe(7)
    expect(result!.modulus).toBe(11)
  })

  it('solves three congruences with tuples', () => {
    const result = ChineseRemainderTheorem.solve([[2, 3], [3, 5], [2, 7]])
    expect(result).not.toBeNull()
    expect(result!.remainder % 3).toBe(2)
    expect(result!.remainder % 5).toBe(3)
    expect(result!.remainder % 7).toBe(2)
  })

  it('handles negative remainders', () => {
    const result = ChineseRemainderTheorem.solve([-1, 2], [3, 5])
    expect(result).not.toBeNull()
    const r = result!.remainder
    expect(((r % 3) + 3) % 3).toBe(2)
    expect(r % 5).toBe(2)
  })

  it('handles all negative remainders', () => {
    const result = ChineseRemainderTheorem.solve([-2, -3], [7, 11])
    expect(result).not.toBeNull()
    const r = result!.remainder
    expect(((r % 7) + 7) % 7).toBe(5)
    expect(((r % 11) + 11) % 11).toBe(8)
  })

  it('handles large prime moduli', () => {
    const result = ChineseRemainderTheorem.solve([3, 5], [1000003, 1000033])
    expect(result).not.toBeNull()
    expect(result!.remainder % 1000003).toBe(3)
    expect(result!.remainder % 1000033).toBe(5)
  })

  it('handles powers of 2 with coprime values', () => {
    const result = ChineseRemainderTheorem.solve([1, 1], [8, 9])
    expect(result).not.toBeNull()
    expect(result!.remainder % 8).toBe(1)
    expect(result!.remainder % 9).toBe(1)
  })

  it('modularInverse handles a=1', () => {
    const inv = ChineseRemainderTheorem.modularInverse(1, 7)
    expect(inv).toBe(1)
  })

  it('modularInverse handles a=mod-1', () => {
    const inv = ChineseRemainderTheorem.modularInverse(6, 7)
    expect(inv).toBe(6)
    expect((6 * inv) % 7).toBe(1)
  })

  it('modularInverse returns 0 for modulus 1', () => {
    const inv = ChineseRemainderTheorem.modularInverse(1, 1)
    expect(inv).toBe(0)
  })

  it('modularInverse handles a=1', () => {
    const inv = ChineseRemainderTheorem.modularInverse(1, 7)
    expect(inv).toBe(1)
  })

  it('lcm handles powers of 2', () => {
    expect(ChineseRemainderTheorem.lcm(8, 16)).toBe(16)
  })

  it('lcm handles negative numbers', () => {
    expect(ChineseRemainderTheorem.lcm(-12, 18)).toBe(36)
  })

  it('lcm handles same numbers', () => {
    expect(ChineseRemainderTheorem.lcm(15, 15)).toBe(15)
  })

  it('lcm handles one and other number', () => {
    expect(ChineseRemainderTheorem.lcm(1, 100)).toBe(100)
  })

  it('solves four congruences', () => {
    const result = ChineseRemainderTheorem.solve([1, 2, 3, 4], [2, 3, 5, 7])
    expect(result).not.toBeNull()
    expect(result!.remainder % 2).toBe(1)
    expect(result!.remainder % 3).toBe(2)
    expect(result!.remainder % 5).toBe(3)
    expect(result!.remainder % 7).toBe(4)
  })

  it('solves five congruences', () => {
    const result = ChineseRemainderTheorem.solve([1, 2, 3, 4, 5], [2, 3, 5, 7, 11])
    expect(result).not.toBeNull()
    expect(result!.remainder % 2).toBe(1)
    expect(result!.remainder % 3).toBe(2)
    expect(result!.remainder % 5).toBe(3)
    expect(result!.remainder % 7).toBe(4)
    expect(result!.remainder % 11).toBe(5)
  })

  it('handles congruences with same remainder', () => {
    const result = ChineseRemainderTheorem.solve([5, 5], [7, 9])
    expect(result).not.toBeNull()
    expect(result!.remainder % 7).toBe(5)
    expect(result!.remainder % 9).toBe(5)
  })

  it('returns null for mismatched array lengths', () => {
    expect(ChineseRemainderTheorem.solve([1, 2], [3])).toBeNull()
    expect(ChineseRemainderTheorem.solve([1], [3, 5])).toBeNull()
  })

  it('handles single congruence with tuple format', () => {
    const result = ChineseRemainderTheorem.solve([[4, 7]])
    expect(result).not.toBeNull()
    expect(result!.remainder).toBe(4)
    expect(result!.modulus).toBe(7)
  })

  it('handles empty tuple array', () => {
    const result = ChineseRemainderTheorem.solve([])
    expect(result).toBeNull()
  })

  it('handles remainder equal to modulus-1', () => {
    const result = ChineseRemainderTheorem.solve([2, 4], [3, 5])
    expect(result).not.toBeNull()
    expect(result!.remainder % 3).toBe(2)
    expect(result!.remainder % 5).toBe(4)
  })

  it('handles multiple same moduli', () => {
    const result = ChineseRemainderTheorem.solve([1, 1, 1], [3, 3, 3])
    expect(result).not.toBeNull()
    expect(result!.remainder % 3).toBe(1)
  })

  it('lcm of two consecutive numbers', () => {
    expect(ChineseRemainderTheorem.lcm(14, 15)).toBe(210)
  })

  it('modularInverse with a equals modulus', () => {
    const inv = ChineseRemainderTheorem.modularInverse(7, 7)
    expect(inv).toBeNull()
  })

  it('solves with small and large moduli', () => {
    const result = ChineseRemainderTheorem.solve([1, 100], [2, 1009])
    expect(result).not.toBeNull()
    expect(result!.remainder % 2).toBe(1)
    expect(result!.remainder % 1009).toBe(100)
  })

  it('handles equal remainders with coprime moduli', () => {
    const result = ChineseRemainderTheorem.solve([5, 5, 5], [7, 11, 13])
    expect(result).not.toBeNull()
    expect(result!.remainder % 7).toBe(5)
    expect(result!.remainder % 11).toBe(5)
    expect(result!.remainder % 13).toBe(5)
  })

  it('handles remainders that are multiples', () => {
    const result = ChineseRemainderTheorem.solve([0, 0, 0], [3, 5, 7])
    expect(result).not.toBeNull()
    expect(result!.remainder).toBe(0)
  })

  it('solves consecutive moduli 2,3,4,5', () => {
    const result = ChineseRemainderTheorem.solve([1, 2, 3, 4], [2, 3, 4, 5])
    expect(result).not.toBeNull()
    expect(result!.remainder % 2).toBe(1)
    expect(result!.remainder % 3).toBe(2)
    expect(result!.remainder % 4).toBe(3)
    expect(result!.remainder % 5).toBe(4)
  })

  it('handles very small prime moduli', () => {
    const result = ChineseRemainderTheorem.solve([1, 1, 1], [2, 3, 5])
    expect(result).not.toBeNull()
    expect(result!.remainder % 2).toBe(1)
    expect(result!.remainder % 3).toBe(1)
    expect(result!.remainder % 5).toBe(1)
  })
})
