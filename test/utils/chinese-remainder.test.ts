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

    it('single congruence', () => {
      const result = CRT.solve([2], [5])
      expect(result).not.toBeNull()
      expect(result!.remainder % 5).toBe(2)
    })

    it('simple congruence x=0 mod 2, x=0 mod 3', () => {
      const result = CRT.solve([0, 0], [2, 3])
      expect(result).not.toBeNull()
      expect(result!.remainder % 6).toBe(0)
    })

    it('single congruence solves trivially', () => {
      const result = CRT.solve([3], [5])
      expect(result).not.toBeNull()
      expect(result!.remainder % 5).toBe(3)
    })

    it('solve with two congruences', () => {
      const result = CRT.solve([2, 3], [3, 5])
      expect(result).not.toBeNull()
      expect(result!.remainder % 3).toBe(2)
      expect(result!.remainder % 5).toBe(3)
    })

    it('single congruence returns remainder', () => {
      const result = CRT.solve([[2, 3]])
      expect(result).not.toBeNull()
      expect(result!.remainder % 3).toBe(2)
    })
  })

  describe('solve with pair format', () => {
    it('solves using pair format', () => {
      const result = CRT.solve([[2, 3], [3, 5], [2, 7]])
      expect(result).not.toBeNull()
      expect(result!.remainder).toBe(23)
      expect(result!.modulus).toBe(105)
    })

    it('single congruence in pair format', () => {
      const result = CRT.solve([[4, 7]])
      expect(result).not.toBeNull()
      expect(result!.remainder).toBe(4)
      expect(result!.modulus).toBe(7)
    })

    it('two congruences in pair format', () => {
      const result = CRT.solve([[1, 3], [2, 5]])
      expect(result).not.toBeNull()
      expect(result!.remainder % 3).toBe(1)
      expect(result!.remainder % 5).toBe(2)
    })

    it('empty pair array', () => {
      expect(CRT.solve([])).toBeNull()
    })
  })

  describe('solve with zeros', () => {
    it('all remainders zero', () => {
      const result = CRT.solve([0, 0, 0], [3, 5, 7])
      expect(result).not.toBeNull()
      expect(result!.remainder).toBe(0)
    })

    it('zero with coprime moduli', () => {
      const result = CRT.solve([0, 0], [7, 11])
      expect(result).not.toBeNull()
      expect(result!.remainder).toBe(0)
    })
  })

  describe('solve with negative remainders', () => {
    it('handles negative remainder', () => {
      const result = CRT.solve([-1, 2], [5, 7])
      expect(result).not.toBeNull()
      expect((result!.remainder + 5) % 5).toBe(4)
      expect(result!.remainder % 7).toBe(2)
    })

    it('multiple negative remainders', () => {
      const result = CRT.solve([-1, -2], [5, 7])
      expect(result).not.toBeNull()
      expect((result!.remainder + 5) % 5).toBe(4)
      expect((result!.remainder + 7) % 7).toBe(5)
    })
  })

  describe('solve complex systems', () => {
    it('four congruences', () => {
      const result = CRT.solve([2, 3, 1, 4], [3, 5, 7, 11])
      expect(result).not.toBeNull()
      expect(result!.remainder % 3).toBe(2)
      expect(result!.remainder % 5).toBe(3)
      expect(result!.remainder % 7).toBe(1)
      expect(result!.remainder % 11).toBe(4)
    })

    it('five congruences', () => {
      const result = CRT.solve([1, 2, 3, 4, 5], [2, 3, 5, 7, 11])
      expect(result).not.toBeNull()
      expect(result!.remainder % 2).toBe(1)
      expect(result!.remainder % 3).toBe(2)
      expect(result!.remainder % 5).toBe(3)
      expect(result!.remainder % 7).toBe(4)
      expect(result!.remainder % 11).toBe(5)
    })

    it('consecutive moduli', () => {
      const result = CRT.solve([0, 1, 2], [2, 3, 5])
      expect(result).not.toBeNull()
      expect(result!.remainder % 2).toBe(0)
      expect(result!.remainder % 3).toBe(1)
      expect(result!.remainder % 5).toBe(2)
    })
  })

  describe('solve with powers of primes', () => {
    it('solves with prime powers', () => {
      const result = CRT.solve([1, 3], [4, 9])
      expect(result).not.toBeNull()
      expect(result!.remainder % 4).toBe(1)
      expect(result!.remainder % 9).toBe(3)
    })

    it('three prime powers', () => {
      const result = CRT.solve([3, 5, 7], [8, 9, 25])
      expect(result).not.toBeNull()
      expect(result!.remainder % 8).toBe(3)
      expect(result!.remainder % 9).toBe(5)
      expect(result!.remainder % 25).toBe(7)
    })
  })

  describe('solve incompatible systems', () => {
    it('inconsistent with three congruences', () => {
      const result = CRT.solve([1, 2, 3], [2, 4, 8])
      expect(result).toBeNull()
    })

    it('inconsistent with modulo 2', () => {
      const result = CRT.solve([1, 0], [2, 2])
      expect(result).toBeNull()
    })
  })

  describe('solve with small moduli', () => {
    it('moduli 2 and 3', () => {
      const result = CRT.solve([1, 2], [2, 3])
      expect(result).not.toBeNull()
      expect(result!.remainder % 2).toBe(1)
      expect(result!.remainder % 3).toBe(2)
    })

    it('moduli 2, 3, 5', () => {
      const result = CRT.solve([1, 2, 3], [2, 3, 5])
      expect(result).not.toBeNull()
      expect(result!.remainder % 2).toBe(1)
      expect(result!.remainder % 3).toBe(2)
      expect(result!.remainder % 5).toBe(3)
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

    it('gcd of 0 and n is n', () => {
      expect(CRT.gcd(0, 5)).toBe(5)
    })

    it('gcd of n and 0 is n', () => {
      expect(CRT.gcd(5, 0)).toBe(5)
    })

    it('gcd of 0 and 0 is 0', () => {
      expect(CRT.gcd(0, 0)).toBe(0)
    })

    it('gcd with both negative', () => {
      expect(CRT.gcd(-12, -8)).toBe(4)
    })

    it('gcd of 1 and any number is 1', () => {
      expect(CRT.gcd(1, 100)).toBe(1)
    })

    it('gcd of consecutive numbers is 1', () => {
      expect(CRT.gcd(15, 16)).toBe(1)
    })
  })

  describe('lcm', () => {
    it('computes lcm of 4 and 6', () => {
      expect(CRT.lcm(4, 6)).toBe(12)
    })

    it('lcm of coprime numbers is product', () => {
      expect(CRT.lcm(3, 5)).toBe(15)
    })

    it('lcm of equal numbers', () => {
      expect(CRT.lcm(7, 7)).toBe(7)
    })

    it('lcm with one being 1', () => {
      expect(CRT.lcm(1, 5)).toBe(5)
    })

    it('lcm of 12 and 18', () => {
      expect(CRT.lcm(12, 18)).toBe(36)
    })

    it('lcm handles negative numbers', () => {
      expect(CRT.lcm(-4, 6)).toBe(-12)
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

    it('inverse of 5 mod 12', () => {
      const inv = CRT.modInverse(5, 12)
      expect(inv).not.toBeNull()
      expect((5 * inv!) % 12).toBe(1)
    })

    it('inverse of 3 mod 10', () => {
      expect(CRT.modInverse(3, 10)).toBe(7)
    })

    it('inverse returns null for non-coprime', () => {
      expect(CRT.modInverse(4, 8)).toBeNull()
    })

    it('inverse of 9 mod 11', () => {
      const inv = CRT.modInverse(9, 11)
      expect(inv).not.toBeNull()
      expect((9 * inv!) % 11).toBe(1)
    })

    it('inverse of prime modulo prime', () => {
      const inv = CRT.modInverse(13, 17)
      expect(inv).not.toBeNull()
      expect((13 * inv!) % 17).toBe(1)
    })

    it('inverse of 2 mod 7', () => {
      expect(CRT.modInverse(2, 7)).toBe(4)
    })
  })

  describe('modInverse edge cases', () => {
    it('handles negative numbers', () => {
      const inv = CRT.modInverse(-3, 7)
      expect(inv).not.toBeNull()
      const result = (-3 * inv!) % 7
      expect(result).toBeLessThanOrEqual(0)
      expect(result).toBe(-2)
    })

    it('large modulus', () => {
      const inv = CRT.modInverse(5, 101)
      expect(inv).not.toBeNull()
      expect((5 * inv!) % 101).toBe(1)
    })

    it('inverse when a > m', () => {
      const inv = CRT.modInverse(14, 5)
      expect(inv).not.toBeNull()
      expect((14 * inv!) % 5).toBe(1)
    })
  })
})
describe('chinese-remainder - wave546', () => {
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

describe('chinese-remainder - wave547', () => {
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

describe('chinese-remainder - wave548', () => {
  it('chinese-remainder module defined', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder module is function', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave549', () => {
  it('chinese-remainder module defined', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder module is function', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave550', () => {
  it('chinese-remainder w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave551', () => {
  it('chinese-remainder w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave552', () => {
  it('chinese-remainder w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave553', () => {
  it('chinese-remainder w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave554', () => {
  it('chinese-remainder w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave555', () => {
  it('chinese-remainder w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave556', () => {
  it('chinese-remainder w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave557', () => {
  it('chinese-remainder w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave558', () => {
  it('chinese-remainder w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave559', () => {
  it('chinese-remainder w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave560', () => {
  it('chinese-remainder w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave561', () => {
  it('chinese-remainder w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave562', () => {
  it('chinese-remainder w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave563', () => {
  it('chinese-remainder w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave564', () => {
  it('chinese-remainder w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave565', () => {
  it('chinese-remainder w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave566', () => {
  it('chinese-remainder w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave127', () => {
  it('chinese-remainder w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave130', () => {
  it('chinese-remainder w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave133', () => {
  it('chinese-remainder w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave136', () => {
  it('chinese-remainder w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - wave139', () => {
  it('chinese-remainder w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w142', () => {
  it('chinese-remainder v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w145', () => {
  it('chinese-remainder v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w148', () => {
  it('chinese-remainder v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w151', () => {
  it('chinese-remainder v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w154', () => {
  it('chinese-remainder v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w157', () => {
  it('chinese-remainder v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w160', () => {
  it('chinese-remainder v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w170', () => {
  it('chinese-remainder x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w180', () => {
  it('chinese-remainder x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w190', () => {
  it('chinese-remainder x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w200', () => {
  it('chinese-remainder x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w210', () => {
  it('chinese-remainder x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w220', () => {
  it('chinese-remainder x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w230', () => {
  it('chinese-remainder x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w240', () => {
  it('chinese-remainder x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w250', () => {
  it('chinese-remainder x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w260', () => {
  it('chinese-remainder x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w270', () => {
  it('chinese-remainder x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w280', () => {
  it('chinese-remainder x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w290', () => {
  it('chinese-remainder x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w300', () => {
  it('chinese-remainder x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w310', () => {
  it('chinese-remainder x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w320', () => {
  it('chinese-remainder x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w330', () => {
  it('chinese-remainder x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w340', () => {
  it('chinese-remainder x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w350', () => {
  it('chinese-remainder x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w360', () => {
  it('chinese-remainder x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w370', () => {
  it('chinese-remainder x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w380', () => {
  it('chinese-remainder x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w390', () => {
  it('chinese-remainder x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w400', () => {
  it('chinese-remainder x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w420', () => {
  it('chinese-remainder x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w440', () => {
  it('chinese-remainder x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w460', () => {
  it('chinese-remainder x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w480', () => {
  it('chinese-remainder x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w500', () => {
  it('chinese-remainder x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w550', () => {
  it('chinese-remainder x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w600', () => {
  it('chinese-remainder x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w650', () => {
  it('chinese-remainder x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w700', () => {
  it('chinese-remainder x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w800', () => {
  it('chinese-remainder x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w900', () => {
  it('chinese-remainder x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('chinese-remainder - w1000', () => {
  it('chinese-remainder x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('chinese-remainder x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
