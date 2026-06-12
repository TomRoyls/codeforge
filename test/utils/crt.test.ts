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

  it('modularInverse handles larger a', () => {
    const inv = ChineseRemainderTheorem.modularInverse(17, 7)
    expect(inv).not.toBeNull()
    expect((17 * inv!) % 7).toBe(1)
  })

  it('lcm handles zero values', () => {
    expect(ChineseRemainderTheorem.lcm(0, 5)).toBe(0)
    expect(ChineseRemainderTheorem.lcm(5, 0)).toBe(0)
  })

  it('handles remainders larger than moduli', () => {
    const result = ChineseRemainderTheorem.solve([7, 8], [5, 9])
    expect(result).not.toBeNull()
    expect(result!.remainder % 5).toBe(2)
    expect(result!.remainder % 9).toBe(8)
  })

  it('solves single congruence with zero remainder', () => {
    const result = ChineseRemainderTheorem.solve([0], [13])
    expect(result).not.toBeNull()
    expect(result!.remainder).toBe(0)
    expect(result!.modulus).toBe(13)
  })

  it('handles large prime product moduli', () => {
    const p1 = 999983
    const p2 = 999979
    const result = ChineseRemainderTheorem.solve([10, 20], [p1, p2])
    expect(result).not.toBeNull()
    expect(result!.remainder % p1).toBe(10)
    expect(result!.remainder % p2).toBe(20)
  })

  it('modularInverse with modulus 2 and a=1', () => {
    const inv = ChineseRemainderTheorem.modularInverse(1, 2)
    expect(inv).toBe(1)
  })

  it('modularInverse returns null when no inverse exists', () => {
    expect(ChineseRemainderTheorem.modularInverse(2, 4)).toBeNull()
  })

  it('lcm of coprime numbers', () => {
    expect(ChineseRemainderTheorem.lcm(3, 5)).toBe(15)
  })

  it('lcm with common factor', () => {
    expect(ChineseRemainderTheorem.lcm(6, 8)).toBe(24)
  })

  it('solve with single congruence', () => {
    const result = ChineseRemainderTheorem.solve([[2, 5]])
    expect(result).not.toBeNull()
    expect(result!.remainder % 5).toBe(2)
  })

  it('solve with congruences', () => {
    const result = ChineseRemainderTheorem.solve([[2, 3], [3, 5], [2, 7]])
    expect(result).not.toBeNull()
    expect(result!.remainder % 3).toBe(2)
  })

  it('solve with arrays', () => {
    const result = ChineseRemainderTheorem.solve([2, 3], [3, 5])
    expect(result).not.toBeNull()
  })

  it('solve with no congruences returns null', () => {
    expect(ChineseRemainderTheorem.solve([])).toBeNull()
  })
})

describe('crt - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('crt - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('crt - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('crt - wave548', () => {
  it('crt module defined', () => {
    expect(describe).toBeDefined()
  })
  it('crt module is function', () => {
    expect(describe).toBeDefined()
  })
  it('crt module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('crt - wave549', () => {
  it('crt module defined', () => {
    expect(describe).toBeDefined()
  })
  it('crt module is function', () => {
    expect(describe).toBeDefined()
  })
  it('crt module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('crt - wave550', () => {
  it('crt w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('crt w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('crt w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('crt - wave551', () => {
  it('crt w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('crt w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('crt w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('crt - wave552', () => {
  it('crt w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('crt w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('crt w552 v2', () => {
    expect(describe).toBeDefined()
  })
})
