import { describe, expect, it } from 'vitest'
import { NTT } from '../../src/utils/ntt.js'

describe('NTT', () => {
  it('transform of single element returns itself', () => {
    const result = NTT.transform([5n])
    expect(result[0]).toBe(5n)
  })

  it('transform of two elements', () => {
    const result = NTT.transform([1n, 2n])
    expect(result.length).toBe(2)
    expect(result[0]).toBe(3n)
    expect(result[1]).toBe(998244352n)
  })

  it('transform and inverse are identity for 4 elements', () => {
    const input = [1n, 2n, 3n, 4n]
    const transformed = NTT.transform(input)
    const inverted = NTT.transform(transformed, 998244353n, 3n, true)
    expect(inverted).toEqual(input)
  })

  it('transform and inverse for 8 elements', () => {
    const input = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n]
    const transformed = NTT.transform(input)
    const inverted = NTT.transform(transformed, 998244353n, 3n, true)
    expect(inverted).toEqual(input)
  })

  it('DC component is sum of input', () => {
    const input = [1n, 2n, 3n, 4n]
    const result = NTT.transform(input)
    expect(result[0]).toBe(10n)
  })

  it('transform preserves length', () => {
    const input = [1n, 2n, 3n, 4n]
    const result = NTT.transform(input)
    expect(result.length).toBe(4)
  })

  it('transform of all zeros', () => {
    const result = NTT.transform([0n, 0n, 0n, 0n])
    expect(result.every(x => x === 0n)).toBe(true)
  })

  it('transform handles power-of-2 input', () => {
    const input = [1n, 0n, 1n, 0n]
    const transformed = NTT.transform(input)
    const inverted = NTT.transform(transformed, 998244353n, 3n, true)
    expect(inverted).toEqual(input)
  })

  it('transform 16 elements round-trip', () => {
    const input = Array.from({ length: 16 }, (_, i) => BigInt(i + 1))
    const transformed = NTT.transform(input)
    const inverted = NTT.transform(transformed, 998244353n, 3n, true)
    expect(inverted).toEqual(input)
  })

  it('transform with custom mod and primitive root', () => {
    const mod = 167772161n
    const root = 3n
    const input = [1n, 2n, 3n, 4n]
    const transformed = NTT.transform(input, mod, root, false)
    const inverted = NTT.transform(transformed, mod, root, true)
    expect(inverted).toEqual(input)
  })

  it('multiplyPolynomials (x+1)(x+1) = x^2+2x+1', () => {
    const result = NTT.multiplyPolynomials([1n, 1n], [1n, 1n])
    expect(result).toEqual([1n, 2n, 1n])
  })

  it('multiplyPolynomials (x+2)(x+3) = x^2+5x+6', () => {
    const result = NTT.multiplyPolynomials([1n, 2n], [1n, 3n])
    expect(result).toEqual([1n, 5n, 6n])
  })

  it('multiplyPolynomials constant multiplication', () => {
    expect(NTT.multiplyPolynomials([5n], [3n])).toEqual([15n])
    expect(NTT.multiplyPolynomials([4n], [7n])).toEqual([28n])
  })

  it('multiplyPolynomials by zero gives zeros', () => {
    const result = NTT.multiplyPolynomials([0n], [1n, 2n])
    expect(result.every(v => v === 0n)).toBe(true)
  })

  it('multiplyPolynomials by one is identity', () => {
    const result = NTT.multiplyPolynomials([1n], [1n, 2n, 3n])
    expect(result).toEqual([1n, 2n, 3n])
  })

  it('multiplyPolynomials larger polynomials', () => {
    const result = NTT.multiplyPolynomials([1n, 1n, 1n], [1n, 1n])
    expect(result).toEqual([1n, 2n, 2n, 1n])
  })

  it('multiplyPolynomials degree-3', () => {
    const result = NTT.multiplyPolynomials([1n, 1n, 1n], [1n, 1n, 1n])
    expect(result).toEqual([1n, 2n, 3n, 2n, 1n])
  })

  it('multiplyPolynomials with large coefficients', () => {
    const result = NTT.multiplyPolynomials([100n, 200n], [300n, 400n])
    expect(result).toEqual([30000n, 100000n, 80000n])
  })

  it('multiplyPolynomials quadratic by constant', () => {
    const result = NTT.multiplyPolynomials([1n, 2n, 1n], [3n])
    expect(result).toEqual([3n, 6n, 3n])
  })

  it('multiplyPolynomials linear by constant', () => {
    const result = NTT.multiplyPolynomials([1n, 1n], [2n])
    expect(result).toEqual([2n, 2n])
  })

  it('multiplyPolynomials zero by anything is zero', () => {
    const result = NTT.multiplyPolynomials([0n, 0n], [1n, 2n, 3n])
    expect(result.every(v => v === 0n)).toBe(true)
  })

  it('multiplyPolynomials x^2 identity', () => {
    const result = NTT.multiplyPolynomials([1n, 0n, 1n], [1n])
    expect(result).toEqual([1n, 0n, 1n])
  })

  it('multiplyPolynomials higher degree', () => {
    const a = [1n, 2n, 3n, 4n]
    const b = [1n, 1n]
    const result = NTT.multiplyPolynomials(a, b)
    expect(result.length).toBe(5)
    expect(result[0]).toBe(1n)
    expect(result[4]).toBe(4n)
  })

  it('multiplyPolynomials (x-1)(x+1) = x^2-1', () => {
    const result = NTT.multiplyPolynomials([1n, 998244352n], [1n, 1n])
    expect(result[0]).toBe(1n)
    expect(result[2]).toBe(998244352n)
  })

  it('transform of [1,0,0,0] is [1,1,1,1]', () => {
    const result = NTT.transform([1n, 0n, 0n, 0n])
    expect(result.every(x => x === 1n)).toBe(true)
  })

  it('inverse transform divides by n', () => {
    const input = [4n, 0n, 0n, 0n]
    const fwd = NTT.transform(input)
    const inv = NTT.transform(fwd, 998244353n, 3n, true)
    expect(inv).toEqual(input)
  })

  it('multiplyPolynomials with negative-like coefficients', () => {
    const mod = 998244353n
    const result = NTT.multiplyPolynomials([mod - 1n], [mod - 1n])
    expect(result[0]).toBe(1n)
  })

  it('multiplyPolynomials degree-4 by degree-3', () => {
    const a = [1n, 0n, 0n, 0n, 1n]
    const b = [1n, 2n, 3n]
    const result = NTT.multiplyPolynomials(a, b)
    expect(result.length).toBe(7)
    expect(result[0]).toBe(1n)
    expect(result[5]).toBe(2n)
    expect(result[6]).toBe(3n)
  })

  it('transform output values are in range [0, mod)', () => {
    const input = [1n, 2n, 3n, 4n]
    const mod = 998244353n
    const result = NTT.transform(input)
    for (const v of result) {
      expect(v >= 0n).toBe(true)
      expect(v < mod).toBe(true)
    }
  })

  it('multiplyPolynomials (x)(x) = x^2', () => {
    const result = NTT.multiplyPolynomials([0n, 1n], [0n, 1n])
    expect(result).toEqual([0n, 0n, 1n])
  })

  it('multiplyPolynomials commutative', () => {
    const a = [1n, 2n, 3n]
    const b = [4n, 5n]
    expect(NTT.multiplyPolynomials(a, b)).toEqual(NTT.multiplyPolynomials(b, a))
  })

  it('multiplyPolynomials (2x+1)(3x+2)', () => {
    const result = NTT.multiplyPolynomials([1n, 2n], [2n, 3n])
    expect(result).toEqual([2n, 7n, 6n])
  })

  it('multiplyPolynomials long polynomials', () => {
    const a = Array.from({ length: 8 }, (_, i) => BigInt(i + 1))
    const b = Array.from({ length: 8 }, (_, i) => BigInt(i + 1))
    const result = NTT.multiplyPolynomials(a, b)
    expect(result.length).toBe(15)
    expect(result[0]).toBe(1n)
  })

  it('transform and inverse with 32 elements', () => {
    const input = Array.from({ length: 32 }, (_, i) => BigInt(i * i))
    const transformed = NTT.transform(input)
    const inverted = NTT.transform(transformed, 998244353n, 3n, true)
    expect(inverted).toEqual(input)
  })

  it('transform of [2,2,2,2]', () => {
    const result = NTT.transform([2n, 2n, 2n, 2n])
    expect(result[0]).toBe(8n)
    expect(result[1]).toBe(0n)
    expect(result[2]).toBe(0n)
    expect(result[3]).toBe(0n)
  })

  it('multiplyPolynomials identity polynomial', () => {
    const result = NTT.multiplyPolynomials([1n], [1n])
    expect(result).toEqual([1n])
  })

  it('transform preserves energy (Plancherel-like)', () => {
    const input = [1n, 2n, 3n, 4n]
    const fwd = NTT.transform(input)
    const back = NTT.transform(fwd, 998244353n, 3n, true)
    expect(back).toEqual(input)
  })

  it('multiplyPolynomials x^3 by x^2 = x^5', () => {
    const a = [0n, 0n, 0n, 1n]
    const b = [0n, 0n, 1n]
    const result = NTT.multiplyPolynomials(a, b)
    expect(result.length).toBe(6)
    expect(result[5]).toBe(1n)
    expect(result.slice(0, 5).every(v => v === 0n)).toBe(true)
  })

  it('transform 64 elements round-trip', () => {
    const input = Array.from({ length: 64 }, (_, i) => BigInt(i % 5))
    const transformed = NTT.transform(input)
    const inverted = NTT.transform(transformed, 998244353n, 3n, true)
    expect(inverted).toEqual(input)
  })

  it('multiplyPolynomials large degrees', () => {
    const n = 16
    const a = Array.from({ length: n }, () => 1n)
    const b = Array.from({ length: n }, () => 1n)
    const result = NTT.multiplyPolynomials(a, b)
    expect(result.length).toBe(2 * n - 1)
    expect(result[0]).toBe(1n)
    expect(result[n - 1]).toBe(BigInt(n))
    expect(result[2 * n - 2]).toBe(1n)
  })

  it('multiplyPolynomials with zero polynomial returns zeros', () => {
    const result = NTT.multiplyPolynomials([1n, 2n], [0n])
    expect(result).toEqual([0n, 0n])
  })

  it('transform of alternating pattern', () => {
    const input = [1n, 0n, 1n, 0n, 1n, 0n, 1n, 0n]
    const transformed = NTT.transform(input)
    const inverted = NTT.transform(transformed, 998244353n, 3n, true)
    expect(inverted).toEqual(input)
  })
})
