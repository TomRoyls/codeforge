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

  it('handles two coprime moduli', () => {
    const result = ChineseRemainderTheorem.solve([2, 3], [3, 5])
    expect(result).not.toBeNull()
    expect(result!.remainder % 3).toBe(2)
    expect(result!.remainder % 5).toBe(3)
  })

  it('handles single modulus', () => {
    const result = ChineseRemainderTheorem.solve([4], [7])
    expect(result).not.toBeNull()
    expect(result!.remainder % 7).toBe(4)
  })

  it('solves trivial single modulus 1', () => {
    const result = ChineseRemainderTheorem.solve([0], [1])
    expect(result).not.toBeNull()
  })

  it('solves x=2 mod 3, x=3 mod 5', () => {
    const result = ChineseRemainderTheorem.solve([2, 3], [3, 5])
    expect(result).not.toBeNull()
    expect(result!.remainder % 3).toBe(2)
    expect(result!.remainder % 5).toBe(3)
  })

  it('solve with coprime moduli', () => {
    const result = ChineseRemainderTheorem.solve([0], [7])
    expect(result).not.toBeNull()
    expect(result!.remainder % 7).toBe(0)
  })

  it('solve with coprime moduli', () => {
    const result = ChineseRemainderTheorem.solve([2, 3], [3, 5])
    expect(result).not.toBeNull()
    expect(result!.remainder % 3).toBe(2)
    expect(result!.remainder % 5).toBe(3)
  })

  it('solve with coprime moduli', () => {
    const result = ChineseRemainderTheorem.solve([1, 1], [2, 3])
    expect(result).not.toBeNull()
    expect(result!.remainder % 2).toBe(1)
  })
})
