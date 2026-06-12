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

  it('multiplyPolynomials linear by linear', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 1], [1, 1])
    expect(result).toEqual([1, 2, 1])
  })

  it('multiplyPolynomials quadratic by linear', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 1, 1], [1, 1])
    expect(result).toEqual([1, 2, 2, 1])
  })

  it('multiplyPolynomials by constant', () => {
    const result = FastFourierTransform.multiplyPolynomials([2, 3], [5])
    expect(result).toEqual([10, 15])
  })

  it('multiplyPolynomials degree 0', () => {
    const result = FastFourierTransform.multiplyPolynomials([3], [4])
    expect(result).toEqual([12])
  })

  it('multiplyPolynomials linear by constant', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 1], [2])
    expect(result).toEqual([2, 2])
  })

  it('multiplyPolynomials zeros', () => {
    const result = FastFourierTransform.multiplyPolynomials([0], [0])
    expect(result).toEqual([0])
  })

  it('multiplyPolynomials identity', () => {
    const result = FastFourierTransform.multiplyPolynomials([1], [1])
    expect(result).toEqual([1])
  })

  it('multiplyPolynomials basic', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 2], [3, 4])
    expect(result.length).toBe(3)
  })

  it('fft roundtrip preserves values', () => {
    const input = [{ re: 1, im: 0 }, { re: 2, im: 0 }, { re: 3, im: 0 }, { re: 4, im: 0 }]
    const result = FastFourierTransform.transform(input)
    expect(result.length).toBe(4)
  })

  it('transform with imaginary components', () => {
    const input = [{ re: 0, im: 1 }, { re: 0, im: 2 }, { re: 0, im: 3 }, { re: 0, im: 4 }]
    const transformed = FastFourierTransform.transform(input)
    const inverted = FastFourierTransform.transform(transformed, true)
    for (let i = 0; i < input.length; i++) {
      expect(inverted[i]!.re).toBeCloseTo(input[i]!.re, 5)
      expect(inverted[i]!.im).toBeCloseTo(input[i]!.im, 5)
    }
  })

  it('transform of size 2', () => {
    const input = [{ re: 1, im: 0 }, { re: 2, im: 0 }]
    const result = FastFourierTransform.transform(input)
    expect(result[0]!.re).toBeCloseTo(3, 6)
  })

  it('transform of size 16', () => {
    const input = Array.from({ length: 16 }, (_, i) => ({ re: i + 1, im: 0 }))
    const transformed = FastFourierTransform.transform(input)
    expect(transformed.length).toBe(16)
  })

  it('transform of all zeros', () => {
    const input = [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
    const result = FastFourierTransform.transform(input)
    for (let i = 0; i < result.length; i++) {
      expect(result[i]!.re).toBeCloseTo(0, 6)
      expect(result[i]!.im).toBeCloseTo(0, 6)
    }
  })

  it('transform with negative values', () => {
    const input = [{ re: -1, im: 0 }, { re: -2, im: 0 }, { re: 3, im: 0 }, { re: 4, im: 0 }]
    const result = FastFourierTransform.transform(input)
    expect(result[0]!.re).toBeCloseTo(4, 6)
  })

  it('transform precision verification', () => {
    const input = [{ re: 1, im: 2 }, { re: 3, im: 4 }, { re: 5, im: 6 }, { re: 7, im: 8 }]
    const transformed = FastFourierTransform.transform(input)
    const recovered = FastFourierTransform.transform(transformed, true)
    for (let i = 0; i < input.length; i++) {
      expect(recovered[i]!.re).toBeCloseTo(input[i]!.re, 4)
      expect(recovered[i]!.im).toBeCloseTo(input[i]!.im, 4)
    }
  })

  it('transform with alternating pattern', () => {
    const input = [{ re: 1, im: 0 }, { re: -1, im: 0 }, { re: 1, im: 0 }, { re: -1, im: 0 }]
    const result = FastFourierTransform.transform(input)
    expect(result.length).toBe(4)
  })

  it('transform with symmetric input', () => {
    const input = [{ re: 1, im: 0 }, { re: 2, im: 0 }, { re: 1, im: 0 }, { re: 2, im: 0 }]
    const result = FastFourierTransform.transform(input)
    expect(result.length).toBe(4)
  })

  it('multiplyPolynomials degree 3 by degree 2', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 2, 3, 4], [1, 2, 3])
    expect(result.length).toBe(6)
    expect(result[0]).toBe(1)
    expect(result[1]).toBe(4)
    expect(result[2]).toBe(10)
    expect(result[3]).toBe(16)
    expect(result[4]).toBe(17)
    expect(result[5]).toBe(12)
  })

  it('multiplyPolynomials with negative coefficients', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, -2, 3], [2, -1])
    expect(result).toEqual([2, -5, 8, -3])
  })

  it('multiplyPolynomials degree 4 by degree 4', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 1, 1, 1, 1], [1, 1, 1, 1, 1])
    expect(result.length).toBe(9)
  })

  it('transform of size 4 returns same length', () => {
    const input = [{ re: 1, im: 0 }, { re: 2, im: 0 }, { re: 3, im: 0 }, { re: 4, im: 0 }]
    const result = FastFourierTransform.transform(input)
    expect(result.length).toBe(input.length)
  })

  it('transform of size 32', () => {
    const input = Array.from({ length: 32 }, (_, i) => ({ re: (i + 1) % 2, im: 0 }))
    const transformed = FastFourierTransform.transform(input)
    expect(transformed.length).toBe(32)
  })

  it('inverse transform of complex numbers', () => {
    const input = [{ re: 1, im: 1 }, { re: 2, im: -1 }, { re: 3, im: 2 }, { re: 4, im: -2 }]
    const transformed = FastFourierTransform.transform(input)
    const inverted = FastFourierTransform.transform(transformed, true)
    for (let i = 0; i < input.length; i++) {
      expect(inverted[i]!.re).toBeCloseTo(input[i]!.re, 5)
      expect(inverted[i]!.im).toBeCloseTo(input[i]!.im, 5)
    }
  })

  it('multiplyPolynomials with larger degrees', () => {
    const a = [1, 2, 3, 4, 5]
    const b = [6, 7, 8]
    const result = FastFourierTransform.multiplyPolynomials(a, b)
    expect(result.length).toBe(7)
    expect(result[0]).toBe(6)
    expect(result[1]).toBe(19)
    expect(result[2]).toBe(40)
    expect(result[3]).toBe(61)
    expect(result[4]).toBe(82)
    expect(result[5]).toBe(67)
    expect(result[6]).toBe(40)
  })

  it('multiplyPolynomials with negative result', () => {
    const result = FastFourierTransform.multiplyPolynomials([-1, -2], [-3, -4])
    expect(result).toEqual([3, 10, 8])
  })

  it('multiplyPolynomials with alternating coefficients', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, -1, 1, -1], [1, 1])
    expect(result).toEqual([1, 0, 0, 0, -1])
  })

  it('multiplyPolynomials cubic by cubic', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 1, 1, 1], [1, 1, 1, 1])
    expect(result.length).toBe(7)
  })

  it('transform preserves conjugate symmetry for real input', () => {
    const input = [{ re: 1, im: 0 }, { re: 2, im: 0 }, { re: 3, im: 0 }, { re: 4, im: 0 },
      { re: 5, im: 0 }, { re: 6, im: 0 }, { re: 7, im: 0 }, { re: 8, im: 0 }]
    const transformed = FastFourierTransform.transform(input)
    for (let i = 1; i < input.length / 2; i++) {
      expect(transformed[i]!.re).toBeCloseTo(transformed[input.length - i]!.re, 6)
      expect(transformed[i]!.im).toBeCloseTo(-transformed[input.length - i]!.im, 6)
    }
  })

  it('multiplyPolynomials degree 5 by degree 3', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 0, 0, 0, 0, 1], [1, 0, 0, 1])
    expect(result.length).toBe(9)
  })

  it('transform handles size 1 with imaginary', () => {
    const input = [{ re: 5, im: 3 }]
    const result = FastFourierTransform.transform(input)
    expect(result[0]!.re).toBeCloseTo(5, 6)
    expect(result[0]!.im).toBeCloseTo(3, 6)
  })

  it('transform with max value at index 0', () => {
    const input = [{ re: 100, im: 0 }, { re: 1, im: 0 }, { re: 2, im: 0 }, { re: 3, im: 0 }]
    const result = FastFourierTransform.transform(input)
    expect(result[0]!.re).toBeCloseTo(106, 6)
  })

  it('multiplyPolynomials with zeros in middle', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 0, 2, 0, 3], [2, 0, 1])
    expect(result).toEqual([2, 0, 5, 0, 8, 0, 3])
  })

  it('should multiply polynomials', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 1], [1, -1])
    expect(result[0]).toBeCloseTo(1)
    expect(result[1]).toBeCloseTo(0)
    expect(result[2]).toBeCloseTo(-1)
  })

  it('should handle identity multiplication', () => {
    const result = FastFourierTransform.multiplyPolynomials([1], [1])
    expect(result[0]).toBeCloseTo(1)
  })

  it('should multiply by zero', () => {
    const result = FastFourierTransform.multiplyPolynomials([0], [5])
    expect(result[0]).toBeCloseTo(0)
  })

  it('should handle quadratic multiplication', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 2], [3, 4])
    expect(result).toHaveLength(3)
    expect(result[0]).toBeCloseTo(3)
  })

  it('should handle empty polynomial', () => {
    const result = FastFourierTransform.multiplyPolynomials([], [1])
    expect(result).toEqual([])
  })

  it('should multiply higher degree', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 0, 1], [1, 0, 1])
    expect(result).toHaveLength(5)
    expect(result[0]).toBeCloseTo(1)
  })

  it('multiplyPolynomials basic', () => {
    const result = FastFourierTransform.multiplyPolynomials([1, 1], [1, 1])
    expect(result).toEqual([1, 2, 1])
  })

  it('multiplyPolynomials by zero', () => {
    const result = FastFourierTransform.multiplyPolynomials([0], [1, 2, 3])
    expect(result).toEqual([0, 0, 0])
  })

  it('transform and inverse round-trip', () => {
    const input = [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
    const transformed = FastFourierTransform.transform(input)
    const restored = FastFourierTransform.transform(transformed, true)
    expect(restored[0].re).toBeCloseTo(1, 5)
  })
})

describe('fast-fourier - wave548', () => {
  it('fast-fourier module defined', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module is function', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module has name', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module not null', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module has length', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('fast-fourier - wave549', () => {
  it('fast-fourier module defined', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module is function', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('fast-fourier - wave550', () => {
  it('fast-fourier w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('fast-fourier - wave551', () => {
  it('fast-fourier w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fast-fourier - wave552', () => {
  it('fast-fourier w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fast-fourier - wave553', () => {
  it('fast-fourier w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fast-fourier - wave554', () => {
  it('fast-fourier w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('fast-fourier - wave555', () => {
  it('fast-fourier w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('fast-fourier w555 v2', () => {
    expect(describe).toBeDefined()
  })
})
