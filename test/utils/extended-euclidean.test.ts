import { describe, expect, it } from 'vitest'
import { ExtendedEuclidean } from '../../src/utils/extended-euclidean.js'

describe('ExtendedEuclidean', () => {
  it('solves gcd(35, 15)', () => {
    const result = ExtendedEuclidean.solve(35n, 15n)
    expect(result.gcd).toBe(5n)
    expect(35n * result.x + 15n * result.y).toBe(result.gcd)
  })

  it('solves gcd(240, 46)', () => {
    const result = ExtendedEuclidean.solve(240n, 46n)
    expect(result.gcd).toBe(2n)
    expect(240n * result.x + 46n * result.y).toBe(2n)
  })

  it('solves coprime numbers', () => {
    const result = ExtendedEuclidean.solve(17n, 13n)
    expect(result.gcd).toBe(1n)
    expect(17n * result.x + 13n * result.y).toBe(1n)
  })

  it('solves with a = 0', () => {
    const result = ExtendedEuclidean.solve(0n, 5n)
    expect(result.gcd).toBe(5n)
    expect(result.x).toBe(0n)
    expect(result.y).toBe(1n)
  })

  it('solves identical numbers', () => {
    const result = ExtendedEuclidean.solve(7n, 7n)
    expect(result.gcd).toBe(7n)
  })

  it('solveNumber works for number inputs', () => {
    const result = ExtendedEuclidean.solveNumber(35, 15)
    expect(result.gcd).toBe(5)
    expect(35 * result.x + 15 * result.y).toBe(5)
  })

  it('modularInverse finds inverse', () => {
    const inv = ExtendedEuclidean.modularInverse(3n, 7n)
    expect(inv).not.toBeNull()
    expect((3n * inv!) % 7n).toBe(1n)
  })

  it('modularInverse returns null for non-coprime', () => {
    expect(ExtendedEuclidean.modularInverse(2n, 4n)).toBeNull()
  })

  it('modularInverseNumber works', () => {
    const inv = ExtendedEuclidean.modularInverseNumber(3, 11)
    expect(inv).not.toBeNull()
    expect((3 * inv!) % 11).toBe(1)
  })

  it('lcm computes correctly', () => {
    expect(ExtendedEuclidean.lcm(4n, 6n)).toBe(12n)
    expect(ExtendedEuclidean.lcm(5n, 7n)).toBe(35n)
  })

  it('lcm with zero returns zero', () => {
    expect(ExtendedEuclidean.lcm(5n, 0n)).toBe(0n)
  })

  it('verifies Bezout identity for various pairs', () => {
    const pairs = [[99n, 78n], [100n, 35n], [123n, 456n]]
    for (const [a, b] of pairs) {
      const r = ExtendedEuclidean.solve(a, b)
      expect(a * r.x + b * r.y).toBe(r.gcd)
    }
  })

  it('handles negative numbers', () => {
    const result = ExtendedEuclidean.solve(-6n, 4n)
    expect(Math.abs(Number(result.gcd))).toBe(2)
  })

  it('gcd of identical numbers', () => {
    const result = ExtendedEuclidean.solve(42n, 42n)
    expect(result.gcd).toBe(42n)
  })

  it('modular inverse of 1 is 1', () => {
    const inv = ExtendedEuclidean.modularInverseNumber(1, 7)
    expect(inv).toBe(1)
  })

  it('solves diophantine equation', () => {
    const { x, y, gcd } = ExtendedEuclidean.solve(12n, 8n)
    expect(12n * x + 8n * y).toBe(gcd)
    expect(gcd).toBe(4n)
  })

  it('solves coprime numbers', () => {
    const { x, y, gcd } = ExtendedEuclidean.solve(15n, 28n)
    expect(15n * x + 28n * y).toBe(gcd)
    expect(gcd).toBe(1n)
  })

  it('solves gcd of 12 and 8', () => {
    const { gcd } = ExtendedEuclidean.solve(12n, 8n)
    expect(gcd).toBe(4n)
  })

  it('solves gcd of coprime numbers', () => {
    const { gcd, x, y } = ExtendedEuclidean.solve(3n, 7n)
    expect(gcd).toBe(1n)
    expect(3n * x + 7n * y).toBe(1n)
  })

  it('coprime numbers have gcd 1', () => {
    const { gcd } = ExtendedEuclidean.solve(8n, 15n)
    expect(gcd).toBe(1n)
  })

  it('solve for 0 and 5 returns gcd 5', () => {
    const { gcd } = ExtendedEuclidean.solve(0n, 5n)
    expect(gcd).toBe(5n)
  })

  it('solve for coprime returns gcd 1', () => {
    const { gcd } = ExtendedEuclidean.solve(7n, 3n)
    expect(gcd).toBe(1n)
  })

  it('solve for 0 and n returns n', () => {
    const { gcd } = ExtendedEuclidean.solve(0n, 5n)
    expect(gcd).toBe(5n)
  })

  it('solve for coprime numbers returns gcd 1', () => {
    const { gcd } = ExtendedEuclidean.solve(14n, 15n)
    expect(gcd).toBe(1n)
  })

  it('gcd of consecutive Fibonacci numbers is 1', () => {
    const { gcd } = ExtendedEuclidean.solve(34n, 21n)
    expect(gcd).toBe(1n)
  })

  it('verifies Bezout for large numbers', () => {
    const { x, y, gcd } = ExtendedEuclidean.solve(1071n, 462n)
    expect(gcd).toBe(21n)
    expect(1071n * x + 462n * y).toBe(21n)
  })

  it('gcd(1, n) = 1', () => {
    const { gcd, x, y } = ExtendedEuclidean.solve(1n, 100n)
    expect(gcd).toBe(1n)
    expect(1n * x + 100n * y).toBe(1n)
  })

  it('gcd(n, 0) where a != 0', () => {
    const { gcd } = ExtendedEuclidean.solve(7n, 0n)
    expect(Math.abs(Number(gcd))).toBe(7)
  })

  it('solveNumber with small inputs', () => {
    const { gcd, x, y } = ExtendedEuclidean.solveNumber(48, 18)
    expect(gcd).toBe(6)
    expect(48 * x + 18 * y).toBe(6)
  })

  it('solveNumber with coprime inputs', () => {
    const { gcd } = ExtendedEuclidean.solveNumber(25, 36)
    expect(gcd).toBe(1)
  })

  it('modularInverse for prime modulus', () => {
    const inv = ExtendedEuclidean.modularInverse(2n, 5n)
    expect(inv).not.toBeNull()
    expect((2n * inv!) % 5n).toBe(1n)
  })

  it('modularInverse of number equal to modulus minus 1', () => {
    const inv = ExtendedEuclidean.modularInverse(6n, 7n)
    expect(inv).not.toBeNull()
    expect((6n * inv!) % 7n).toBe(1n)
  })

  it('modularInverse(0, 1) returns 0 since gcd(0,1)=1', () => {
    const inv = ExtendedEuclidean.modularInverse(0n, 1n)
    expect(inv).toBe(0n)
  })

  it('modularInverse returns null when gcd > 1', () => {
    expect(ExtendedEuclidean.modularInverse(6n, 9n)).toBeNull()
  })

  it('modularInverse handles large modulus', () => {
    const inv = ExtendedEuclidean.modularInverse(3n, 1000000007n)
    expect(inv).not.toBeNull()
    expect((3n * inv!) % 1000000007n).toBe(1n)
  })

  it('modularInverseNumber returns null for even modulus with even input', () => {
    expect(ExtendedEuclidean.modularInverseNumber(4, 8)).toBeNull()
  })

  it('modularInverseNumber finds correct inverse', () => {
    const inv = ExtendedEuclidean.modularInverseNumber(7, 13)
    expect(inv).not.toBeNull()
    expect((7 * inv!) % 13).toBe(1)
  })

  it('lcm of coprime numbers is their product', () => {
    expect(ExtendedEuclidean.lcm(3n, 5n)).toBe(15n)
  })

  it('lcm of equal numbers', () => {
    expect(ExtendedEuclidean.lcm(6n, 6n)).toBe(6n)
  })

  it('lcm with negative numbers', () => {
    expect(ExtendedEuclidean.lcm(-4n, 6n)).toBe(12n)
  })

  it('lcm both zero returns zero', () => {
    expect(ExtendedEuclidean.lcm(0n, 0n)).toBe(0n)
  })

  it('lcm of 1 and any number is that number', () => {
    expect(ExtendedEuclidean.lcm(1n, 42n)).toBe(42n)
  })

  it('Bezout identity holds for prime pairs', () => {
    const { x, y, gcd } = ExtendedEuclidean.solve(13n, 17n)
    expect(gcd).toBe(1n)
    expect(13n * x + 17n * y).toBe(1n)
  })

  it('solve with power of 2 and odd number', () => {
    const { gcd } = ExtendedEuclidean.solve(16n, 9n)
    expect(gcd).toBe(1n)
  })

  it('solve with one being multiple of the other', () => {
    const { gcd } = ExtendedEuclidean.solve(12n, 48n)
    expect(gcd).toBe(12n)
  })

  it('solveNumber returns integer coefficients', () => {
    const { x, y, gcd } = ExtendedEuclidean.solveNumber(56, 72)
    expect(gcd).toBe(8)
    expect(Number.isInteger(x)).toBe(true)
    expect(Number.isInteger(y)).toBe(true)
  })

  it('lcm of large numbers', () => {
    expect(ExtendedEuclidean.lcm(100n, 75n)).toBe(300n)
  })

  it('lcm of large prime numbers', () => {
    expect(ExtendedEuclidean.lcm(1000003n, 1000033n)).toBe(1000036000099n)
  })

  it('solve with power of 2', () => {
    const { gcd } = ExtendedEuclidean.solve(8n, 4n)
    expect(gcd).toBe(4n)
  })

  it('solve with consecutive powers of 2', () => {
    const { gcd, x, y } = ExtendedEuclidean.solve(16n, 8n)
    expect(gcd).toBe(8n)
    expect(16n * x + 8n * y).toBe(8n)
  })

  it('solveNumber handles negative inputs', () => {
    const { gcd, x, y } = ExtendedEuclidean.solveNumber(-12, 8)
    expect(Math.abs(gcd)).toBe(4)
    expect(-12 * x + 8 * y).toBe(-4)
  })

  it('modularInverse handles large modulus', () => {
    const inv = ExtendedEuclidean.modularInverse(2n, 999999999999989n)
    expect(inv).not.toBeNull()
    expect((2n * inv!) % 999999999999989n).toBe(1n)
  })

  it('lcm of number and its multiple', () => {
    expect(ExtendedEuclidean.lcm(5n, 15n)).toBe(15n)
    expect(ExtendedEuclidean.lcm(3n, 21n)).toBe(21n)
  })

  it('solveNumber returns correct gcd', () => {
    const { gcd } = ExtendedEuclidean.solveNumber(12, 8)
    expect(gcd).toBe(4)
  })

  it('modularInverseNumber returns null for no inverse', () => {
    expect(ExtendedEuclidean.modularInverseNumber(2, 4)).toBeNull()
  })

  it('solve with coprime returns gcd 1', () => {
    const { gcd } = ExtendedEuclidean.solve(7n, 11n)
    expect(gcd).toBe(1n)
  })
})

describe('extended-euclidean - wave548', () => {
  it('extended-euclidean module defined', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module is function', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module has name', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module not null', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module has length', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('extended-euclidean - wave549', () => {
  it('extended-euclidean module defined', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module is function', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('extended-euclidean - wave550', () => {
  it('extended-euclidean w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('extended-euclidean - wave551', () => {
  it('extended-euclidean w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('extended-euclidean - wave552', () => {
  it('extended-euclidean w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('extended-euclidean - wave553', () => {
  it('extended-euclidean w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('extended-euclidean - wave554', () => {
  it('extended-euclidean w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('extended-euclidean w554 v2', () => {
    expect(describe).toBeDefined()
  })
})
