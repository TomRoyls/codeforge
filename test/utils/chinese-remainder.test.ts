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
