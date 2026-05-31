import { describe, expect, it } from 'vitest'
import { NTT } from '../../src/utils/ntt.js'

describe('NTT', () => {
  it('transform of single element returns itself', () => {
    const result = NTT.transform([5n])
    expect(result[0]).toBe(5n)
  })

  it('transform and inverse are identity', () => {
    const input = [1n, 2n, 3n, 4n]
    const transformed = NTT.transform(input)
    const inverted = NTT.transform(transformed, 998244353n, 3n, true)
    expect(inverted).toEqual(input)
  })

  it('DC component is sum of input', () => {
    const input = [1n, 2n, 3n, 4n]
    const result = NTT.transform(input)
    expect(result[0]).toBe(10n)
  })

  it('multiplyPolynomials (x+1)(x+1) = x^2+2x+1', () => {
    const result = NTT.multiplyPolynomials([1n, 1n], [1n, 1n])
    expect(result).toEqual([1n, 2n, 1n])
  })

  it('multiplyPolynomials (x+2)(x+3)', () => {
    const result = NTT.multiplyPolynomials([1n, 2n], [1n, 3n])
    expect(result).toEqual([1n, 5n, 6n])
  })

  it('multiplyPolynomials with zero', () => {
    const result = NTT.multiplyPolynomials([0n], [1n, 2n])
    expect(result.length).toBe(2)
    expect(result.every(x => x === 0n)).toBe(true)
  })

  it('multiplyPolynomials larger polynomials', () => {
    const result = NTT.multiplyPolynomials([1n, 1n, 1n], [1n, 1n])
    expect(result).toEqual([1n, 2n, 2n, 1n])
  })

  it('handles power-of-2 length', () => {
    const input = [1n, 0n, 1n, 0n]
    const transformed = NTT.transform(input)
    const inverted = NTT.transform(transformed, 998244353n, 3n, true)
    expect(inverted).toEqual(input)
  })

  it('multiplyPolynomials with large coefficients', () => {
    const result = NTT.multiplyPolynomials([100n, 200n], [300n, 400n])
    expect(result).toEqual([30000n, 100000n, 80000n])
  })

  it('transform of 8 elements and inverse', () => {
    const input = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n]
    const transformed = NTT.transform(input)
    const inverted = NTT.transform(transformed, 998244353n, 3n, true)
    expect(inverted).toEqual(input)
  })

  it('multiplyPolynomials degree-3', () => {
    const result = NTT.multiplyPolynomials([1n, 1n, 1n], [1n, 1n, 1n])
    expect(result).toEqual([1n, 2n, 3n, 2n, 1n])
  })

  it('multiplyPolynomials linear', () => {
    const result = NTT.multiplyPolynomials([1n, 1n], [1n, 1n])
    expect(result).toEqual([1n, 2n, 1n])
  })
})
