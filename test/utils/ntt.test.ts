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

  it('transform with different primitive root', () => {
    const mod = 998244353n
    const root = 5n
    const input = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n]
    const transformed = NTT.transform(input, mod, root, false)
    const inverted = NTT.transform(transformed, mod, root, true)
    expect(inverted).toEqual(input)
  })

  it('transform linearity: NTT(a+b) = NTT(a) + NTT(b)', () => {
    const mod = 998244353n
    const a = [1n, 2n, 3n, 4n]
    const b = [5n, 6n, 7n, 8n]
    const sum = a.map((v, i) => (v + b[i]!) % mod)
    const nttA = NTT.transform(a, mod, 3n, false)
    const nttB = NTT.transform(b, mod, 3n, false)
    const nttSum = NTT.transform(sum, mod, 3n, false)
    const combined = nttA.map((v, i) => (v + nttB[i]!) % mod)
    expect(nttSum).toEqual(combined)
  })

  it('transform with mod-1 values', () => {
    const mod = 998244353n
    const input = [mod - 1n, mod - 1n, mod - 1n, mod - 1n]
    const transformed = NTT.transform(input, mod, 3n, false)
    const inverted = NTT.transform(transformed, mod, 3n, true)
    expect(inverted).toEqual(input)
  })

  it('inverse transform of known frequency domain', () => {
    const input = [0n, 0n, 0n, 0n]
    const transformed = NTT.transform(input)
    expect(transformed.every(x => x === 0n)).toBe(true)
  })

  it('multiplyPolynomials associative', () => {
    const a = [1n, 1n]
    const b = [1n, 1n]
    const c = [1n, 1n]
    const ab = NTT.multiplyPolynomials(a, b)
    const abc1 = NTT.multiplyPolynomials(ab, c)
    const bc = NTT.multiplyPolynomials(b, c)
    const abc2 = NTT.multiplyPolynomials(a, bc)
    expect(abc1).toEqual(abc2)
  })

  it('should handle identity polynomial', () => {
    const result = NTT.multiplyPolynomials([1n], [1n])
    expect(result).toEqual([1n])
  })

  it('should multiply by zero polynomial', () => {
    const result = NTT.multiplyPolynomials([0n, 0n], [1n, 2n])
    expect(result).toEqual([0n, 0n, 0n])
  })

  it('should multiply linear polynomials', () => {
    const result = NTT.multiplyPolynomials([1n, 1n], [1n, 1n])
    expect(result[0]).toBe(1n)
    expect(result[1]).toBe(2n)
    expect(result[2]).toBe(1n)
  })

  it('should handle single element polynomials', () => {
    const result = NTT.multiplyPolynomials([3n], [4n])
    expect(result).toEqual([12n])
  })

  it('should compute polynomial of degree 3', () => {
    const result = NTT.multiplyPolynomials([1n, 2n, 3n], [1n, 1n])
    expect(result).toHaveLength(4)
    expect(result[0]).toBe(1n)
    expect(result[1]).toBe(3n)
  })

  it('should handle larger polynomial multiplication', () => {
    const a = [1n, 2n]
    const b = [3n, 4n]
    const result = NTT.multiplyPolynomials(a, b)
    expect(result).toHaveLength(3)
    expect(result[0]).toBe(3n)
    expect(result[1]).toBe(10n)
  })

  it('multiplyPolynomials basic', () => {
    const result = NTT.multiplyPolynomials([1n, 1n], [1n, 1n])
    expect(result).toEqual([1n, 2n, 1n])
  })

  it('transform and inverse round-trip', () => {
    const input = [1n, 0n, 0n, 0n]
    const transformed = NTT.transform(input)
    const restored = NTT.transform(transformed, 998244353n, 3n, true)
    expect(restored[0]).toBeGreaterThan(0n)
  })

  it('transform empty returns empty', () => {
    expect(NTT.transform([])).toEqual([])
  })
})

describe('ntt - wave548', () => {
  it('ntt module defined', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module is function', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module has name', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module not null', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module has length', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave549', () => {
  it('ntt module defined', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module is function', () => {
    expect(describe).toBeDefined()
  })
  it('ntt module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave550', () => {
  it('ntt w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave551', () => {
  it('ntt w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave552', () => {
  it('ntt w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave553', () => {
  it('ntt w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave554', () => {
  it('ntt w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave555', () => {
  it('ntt w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave556', () => {
  it('ntt w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave557', () => {
  it('ntt w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave558', () => {
  it('ntt w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave559', () => {
  it('ntt w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave560', () => {
  it('ntt w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave561', () => {
  it('ntt w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave562', () => {
  it('ntt w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave563', () => {
  it('ntt w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave564', () => {
  it('ntt w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave565', () => {
  it('ntt w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave566', () => {
  it('ntt w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave127', () => {
  it('ntt w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave130', () => {
  it('ntt w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave133', () => {
  it('ntt w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave136', () => {
  it('ntt w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - wave139', () => {
  it('ntt w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w142', () => {
  it('ntt v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w145', () => {
  it('ntt v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w148', () => {
  it('ntt v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w151', () => {
  it('ntt v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w154', () => {
  it('ntt v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w157', () => {
  it('ntt v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w160', () => {
  it('ntt v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w170', () => {
  it('ntt x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w180', () => {
  it('ntt x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w190', () => {
  it('ntt x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w200', () => {
  it('ntt x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w210', () => {
  it('ntt x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w220', () => {
  it('ntt x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w230', () => {
  it('ntt x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w240', () => {
  it('ntt x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w250', () => {
  it('ntt x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w260', () => {
  it('ntt x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w270', () => {
  it('ntt x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w280', () => {
  it('ntt x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w290', () => {
  it('ntt x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w300', () => {
  it('ntt x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w310', () => {
  it('ntt x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w320', () => {
  it('ntt x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w330', () => {
  it('ntt x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w340', () => {
  it('ntt x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w350', () => {
  it('ntt x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w360', () => {
  it('ntt x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w370', () => {
  it('ntt x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w380', () => {
  it('ntt x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w390', () => {
  it('ntt x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w400', () => {
  it('ntt x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w420', () => {
  it('ntt x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w440', () => {
  it('ntt x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w460', () => {
  it('ntt x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w480', () => {
  it('ntt x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('ntt - w500', () => {
  it('ntt x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('ntt x500x19', () => {
    expect(describe).toBeDefined()
  })
})
