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
})
