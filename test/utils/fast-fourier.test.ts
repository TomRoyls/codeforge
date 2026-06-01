import { describe, expect, it } from 'vitest'
import { FastFourierTransform } from '../../src/utils/fast-fourier.js'

describe('FastFourierTransform', () => {
  it('transform of single element returns itself', () => {
    const result = FastFourierTransform.transform([{ re: 5, im: 0 }])
    expect(result[0]!.re).toBeCloseTo(5, 6)
  })

  it('transform and inverse are identity', () => {
    const input = [{ re: 1, im: 0 }, { re: 2, im: 0 }, { re: 3, im: 0 }, { re: 4, im: 0 }]
    const transformed = FastFourierTransform.transform(input)
    const inverted = FastFourierTransform.transform(transformed, true)
    for (let i = 0; i < input.length; i++) {
      expect(inverted[i]!.re).toBeCloseTo(input[i]!.re, 6)
      expect(inverted[i]!.im).toBeCloseTo(input[i]!.im, 6)
    }
  })

  it('DC component is sum of input', () => {
    const input = [{ re: 1, im: 0 }, { re: 2, im: 0 }, { re: 3, im: 0 }, { re: 4, im: 0 }]
    const result = FastFourierTransform.transform(input)
    expect(result[0]!.re).toBeCloseTo(10, 6)
  })

  it('multiplyPolynomials (x+1)(x+1) = x^2+2x+1', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 1], [1, 1])
    expect(result).toEqual([1, 2, 1])
  })

  it('multiplyPolynomials (x+2)(x+3) = x^2+5x+6', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 2], [1, 3])
    expect(result).toEqual([1, 5, 6])
  })

  it('multiplyPolynomials with zero polynomial', () => {
    const result = FastFourierTransform.multiplyPolynomials([0], [1, 2, 3])
    expect(result.length).toBe(3)
    expect(result.every(x => x === 0)).toBe(true)
  })

  it('multiplyPolynomials (2x+3)(x-1) = 2x^2+x-3', () => {
    const result = FastFourierTransform.multiplyPolynomials([3, 2], [-1, 1])
    expect(result).toEqual([-3, 1, 2])
  })

  it('handles larger polynomial multiplication', () => {
    const a = [1, 1, 1]
    const b = [1, 1]
    const result = FastFourierTransform.multiplyPolynomials(a, b)
    expect(result).toEqual([1, 2, 2, 1])
  })

  it('transform of constant array has nonzero DC only', () => {
    const input = [{ re: 3, im: 0 }, { re: 3, im: 0 }, { re: 3, im: 0 }, { re: 3, im: 0 }]
    const result = FastFourierTransform.transform(input)
    expect(result[0]!.re).toBeCloseTo(12, 6)
    for (let i = 1; i < result.length; i++) {
      expect(Math.abs(result[i]!.re)).toBeLessThan(1e-6)
    }
  })

  it('transform of 8-point signal preserves energy', () => {
    const input = [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 },
      { re: 1, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }]
    const transformed = FastFourierTransform.transform(input)
    let energyIn = 0
    let energyOut = 0
    for (const x of input) energyIn += x.re * x.re + x.im * x.im
    for (const x of transformed) energyOut += x.re * x.re + x.im * x.im
    expect(energyOut / input.length).toBeCloseTo(energyIn, 4)
  })

  it('multiplyPolynomials (x^2+1)(x^2-1) = x^4-1', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 0, 1], [-1, 0, 1])
    expect(result).toEqual([-1, 0, 0, 0, 1])
  })

  it('inverse transform recovers original', () => {
    const input = [{ re: 1, im: 0 }, { re: 2, im: 0 }, { re: 3, im: 0 }, { re: 4, im: 0 }]
    const transformed = FastFourierTransform.transform(input)
    const recovered = FastFourierTransform.transform(transformed, true)
    for (let i = 0; i < input.length; i++) {
      expect(recovered[i]!.re).toBeCloseTo(input[i]!.re, 6)
    }
  })

  it('multiplyPolynomials by zero', () => {
    const result = FastFourierTransform.multiplyPolynomials([0, 0], [1, 2, 3])
    expect(result.every(v => v === 0)).toBe(true)
  })

  it('multiplyPolynomials by one', () => {
    const result = FastFourierTransform.multiplyPolynomials([1], [1, 2, 3])
    expect(result).toEqual([1, 2, 3])
  })

  it('multiplyPolynomials degree zero by degree zero', () => {
    const result = FastFourierTransform.multiplyPolynomials([3], [4])
    expect(result).toEqual([12])
  })
})
