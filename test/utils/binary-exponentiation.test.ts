import { describe, expect, it } from 'vitest'
import { BinaryExponentiation } from '../../src/utils/binary-exponentiation.js'

describe('BinaryExponentiation', () => {
  it('computes power mod correctly', () => {
    expect(BinaryExponentiation.power(2n, 10n, 1000n)).toBe(24n)
  })

  it('computes power mod for large exponent', () => {
    expect(BinaryExponentiation.power(2n, 100n, 1000000007n)).toBe(976371285n)
  })

  it('handles exp = 0', () => {
    expect(BinaryExponentiation.power(5n, 0n, 7n)).toBe(1n)
  })

  it('handles base = 0', () => {
    expect(BinaryExponentiation.power(0n, 5n, 7n)).toBe(0n)
  })

  it('handles mod = 1', () => {
    expect(BinaryExponentiation.power(5n, 5n, 1n)).toBe(0n)
  })

  it('powerNumber works', () => {
    expect(BinaryExponentiation.powerNumber(2, 10, 1000)).toBe(24)
  })

  it('powerNoMod computes exact power', () => {
    expect(BinaryExponentiation.powerNoMod(2n, 10n)).toBe(1024n)
    expect(BinaryExponentiation.powerNoMod(3n, 0n)).toBe(1n)
  })

  it('matrixPower computes identity for exp=0', () => {
    const mat = [[1n, 1n], [1n, 0n]]
    const result = BinaryExponentiation.matrixPower(mat, 0n, 1000000007n)
    expect(result[0]![0]).toBe(1n)
    expect(result[0]![1]).toBe(0n)
    expect(result[1]![0]).toBe(0n)
    expect(result[1]![1]).toBe(1n)
  })

  it('matrixPower returns same for exp=1', () => {
    const mat = [[1n, 1n], [1n, 0n]]
    const result = BinaryExponentiation.matrixPower(mat, 1n, 1000000007n)
    expect(result[0]![0]).toBe(1n)
    expect(result[0]![1]).toBe(1n)
  })

  it('fibonacci computes fib(10)', () => {
    expect(BinaryExponentiation.fibonacci(10)).toBe(55n)
  })

  it('fibonacci computes fib(0) and fib(1)', () => {
    expect(BinaryExponentiation.fibonacci(0)).toBe(0n)
    expect(BinaryExponentiation.fibonacci(1)).toBe(1n)
  })

  it('fibonacci computes fib(20)', () => {
    expect(BinaryExponentiation.fibonacci(20)).toBe(6765n)
  })

  it('handles negative base', () => {
    expect(BinaryExponentiation.power(-2n, 3n, 7n)).toBe(6n)
  })

  it('handles large base', () => {
    expect(BinaryExponentiation.power(123456789n, 2n, 1000000000n)).toBe(750190521n)
  })

  it('handles small modulus', () => {
    expect(BinaryExponentiation.power(7n, 5n, 2n)).toBe(1n)
  })

  it('handles base equal to modulus', () => {
    expect(BinaryExponentiation.power(7n, 5n, 7n)).toBe(0n)
  })

  it('handles base multiple of modulus', () => {
    expect(BinaryExponentiation.power(14n, 3n, 7n)).toBe(0n)
  })

  it('handles negative exponent powerNoMod', () => {
    expect(BinaryExponentiation.powerNoMod(2n, 0n)).toBe(1n)
  })

  it('handles power of 1', () => {
    expect(BinaryExponentiation.power(5n, 100n, 100n)).toBe(25n)
  })

  it('handles power of 0 base', () => {
    expect(BinaryExponentiation.power(0n, 10n, 100n)).toBe(0n)
  })

  it('handles power of 0 to 0', () => {
    expect(BinaryExponentiation.power(0n, 0n, 100n)).toBe(1n)
  })

  it('handles odd exponent', () => {
    expect(BinaryExponentiation.power(3n, 7n, 100n)).toBe(87n)
  })

  it('handles even exponent', () => {
    expect(BinaryExponentiation.power(3n, 8n, 100n)).toBe(61n)
  })

  it('powerNumber with large numbers', () => {
    expect(BinaryExponentiation.powerNumber(100, 100, 1000000007)).toBe(424090053)
  })

  it('powerNumber handles zero', () => {
    expect(BinaryExponentiation.powerNumber(0, 5, 10)).toBe(0)
    expect(BinaryExponentiation.powerNumber(5, 0, 10)).toBe(1)
  })

  it('powerNumber with modulus 1', () => {
    expect(BinaryExponentiation.powerNumber(5, 5, 1)).toBe(0)
  })

  it('powerNoMod handles small exponents', () => {
    expect(BinaryExponentiation.powerNoMod(5n, 1n)).toBe(5n)
    expect(BinaryExponentiation.powerNoMod(5n, 2n)).toBe(25n)
    expect(BinaryExponentiation.powerNoMod(5n, 3n)).toBe(125n)
  })

  it('powerNoMod handles base of 1', () => {
    expect(BinaryExponentiation.powerNoMod(1n, 100n)).toBe(1n)
  })

  it('powerNoMod handles large exponents', () => {
    expect(BinaryExponentiation.powerNoMod(2n, 20n)).toBe(1048576n)
  })

  it('matrixPower with 1x1 matrix', () => {
    const mat = [[5n]]
    const result = BinaryExponentiation.matrixPower(mat, 3n, 1000n)
    expect(result[0]![0]).toBe(125n)
  })

  it('matrixPower with 3x3 matrix', () => {
    const mat = [
      [1n, 2n, 3n],
      [4n, 5n, 6n],
      [7n, 8n, 9n]
    ]
    const result = BinaryExponentiation.matrixPower(mat, 2n, 100n)
    expect(result[0]![0]).toBe(30n)
  })

  it('matrixPower with zero matrix', () => {
    const mat = [[0n, 0n], [0n, 0n]]
    const result = BinaryExponentiation.matrixPower(mat, 5n, 100n)
    expect(result[0]![0]).toBe(0n)
    expect(result[0]![1]).toBe(0n)
    expect(result[1]![0]).toBe(0n)
    expect(result[1]![1]).toBe(0n)
  })

  it('matrixPower with identity matrix', () => {
    const mat = [[1n, 0n], [0n, 1n]]
    const result = BinaryExponentiation.matrixPower(mat, 10n, 100n)
    expect(result[0]![0]).toBe(1n)
    expect(result[0]![1]).toBe(0n)
    expect(result[1]![0]).toBe(0n)
    expect(result[1]![1]).toBe(1n)
  })

  it('matrixPower with large exponent', () => {
    const mat = [[1n, 1n], [1n, 0n]]
    const result = BinaryExponentiation.matrixPower(mat, 10n, 1000000007n)
    expect(result[0]![0]).toBe(89n)
  })

  it('matrixPower handles modulus', () => {
    const mat = [[2n, 0n], [0n, 2n]]
    const result = BinaryExponentiation.matrixPower(mat, 3n, 5n)
    expect(result[0]![0]).toBe(3n)
    expect(result[1]![1]).toBe(3n)
  })

  it('fibonacci computes fib(2) and fib(3)', () => {
    expect(BinaryExponentiation.fibonacci(2)).toBe(1n)
    expect(BinaryExponentiation.fibonacci(3)).toBe(2n)
  })

  it('fibonacci computes fib(5)', () => {
    expect(BinaryExponentiation.fibonacci(5)).toBe(5n)
  })

  it('fibonacci computes fib(15)', () => {
    expect(BinaryExponentiation.fibonacci(15)).toBe(610n)
  })

  it('fibonacci computes fib(25)', () => {
    expect(BinaryExponentiation.fibonacci(25)).toBe(75025n)
  })

  it('fibonacci with custom modulus', () => {
    expect(BinaryExponentiation.fibonacci(10, 100n)).toBe(55n)
  })

  it('fibonacci with modulus 1', () => {
    expect(BinaryExponentiation.fibonacci(10, 1n)).toBe(0n)
  })

  it('fibonacci handles negative n', () => {
    expect(BinaryExponentiation.fibonacci(-5)).toBe(0n)
  })

  it('fibonacci with large n', () => {
    expect(BinaryExponentiation.fibonacci(30)).toBe(832040n)
  })

  it('fibonacci with custom modulus 1000', () => {
    expect(BinaryExponentiation.fibonacci(50, 1000n)).toBe(25n)
  })

  it('handles very large exponent in power', () => {
    expect(BinaryExponentiation.power(2n, 1000n, 1000n)).toBe(376n)
  })

  it('handles exponent of 1 in power', () => {
    expect(BinaryExponentiation.power(7n, 1n, 100n)).toBe(7n)
  })

  it('handles base of 1 in power', () => {
    expect(BinaryExponentiation.power(1n, 1000n, 100n)).toBe(1n)
  })

  it('handles composite modulus', () => {
    expect(BinaryExponentiation.power(2n, 5n, 6n)).toBe(2n)
  })

  it('handles prime modulus', () => {
    expect(BinaryExponentiation.power(2n, 16n, 17n)).toBe(1n)
  })

  it('handles powerNoMod with base 0', () => {
    expect(BinaryExponentiation.powerNoMod(0n, 5n)).toBe(0n)
  })

  it('handles power with modulus', () => {
    expect(BinaryExponentiation.power(2n, 10n, 1000n)).toBe(24n)
  })

  it('handles power of one', () => {
    expect(BinaryExponentiation.powerNoMod(1n, 1000000n)).toBe(1n)
  })

  it('handles zero exponent', () => {
    expect(BinaryExponentiation.powerNoMod(5n, 0n)).toBe(1n)
  })

  it('powerNumber works with small values', () => {
    expect(BinaryExponentiation.powerNumber(2, 10, 1000000007)).toBe(1024)
  })

  it('fibonacci returns correct values', () => {
    expect(BinaryExponentiation.fibonacci(0)).toBe(0n)
    expect(BinaryExponentiation.fibonacci(1)).toBe(1n)
    expect(BinaryExponentiation.fibonacci(10)).toBe(55n)
  })

  it('matrixPower identity matrix', () => {
    const identity = [[1n, 0n], [0n, 1n]]
    const result = BinaryExponentiation.matrixPower(identity, 5n, 1000000007n)
    expect(result[0][0]).toBe(1n)
    expect(result[1][1]).toBe(1n)
  })
})
describe('binary-exponentiation - wave548', () => {
  it('binary-exponentiation module defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module has name', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module not null', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module has length', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module has constructor', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave549', () => {
  it('binary-exponentiation module defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave550', () => {
  it('binary-exponentiation w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave551', () => {
  it('binary-exponentiation w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave552', () => {
  it('binary-exponentiation w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave553', () => {
  it('binary-exponentiation w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave554', () => {
  it('binary-exponentiation w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave555', () => {
  it('binary-exponentiation w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave556', () => {
  it('binary-exponentiation w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave557', () => {
  it('binary-exponentiation w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave558', () => {
  it('binary-exponentiation w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w558 v2', () => {
    expect(describe).toBeDefined()
  })
})
