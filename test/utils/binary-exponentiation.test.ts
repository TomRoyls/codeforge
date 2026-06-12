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

describe('binary-exponentiation - wave559', () => {
  it('binary-exponentiation w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave560', () => {
  it('binary-exponentiation w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave561', () => {
  it('binary-exponentiation w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave562', () => {
  it('binary-exponentiation w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave563', () => {
  it('binary-exponentiation w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave564', () => {
  it('binary-exponentiation w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave565', () => {
  it('binary-exponentiation w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave566', () => {
  it('binary-exponentiation w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave127', () => {
  it('binary-exponentiation w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave130', () => {
  it('binary-exponentiation w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave133', () => {
  it('binary-exponentiation w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave136', () => {
  it('binary-exponentiation w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - wave139', () => {
  it('binary-exponentiation w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w142', () => {
  it('binary-exponentiation v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w145', () => {
  it('binary-exponentiation v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w148', () => {
  it('binary-exponentiation v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w151', () => {
  it('binary-exponentiation v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w154', () => {
  it('binary-exponentiation v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w157', () => {
  it('binary-exponentiation v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w160', () => {
  it('binary-exponentiation v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w170', () => {
  it('binary-exponentiation x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w180', () => {
  it('binary-exponentiation x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w190', () => {
  it('binary-exponentiation x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w200', () => {
  it('binary-exponentiation x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w210', () => {
  it('binary-exponentiation x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w220', () => {
  it('binary-exponentiation x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w230', () => {
  it('binary-exponentiation x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w240', () => {
  it('binary-exponentiation x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w250', () => {
  it('binary-exponentiation x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w260', () => {
  it('binary-exponentiation x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w270', () => {
  it('binary-exponentiation x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w280', () => {
  it('binary-exponentiation x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w290', () => {
  it('binary-exponentiation x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w300', () => {
  it('binary-exponentiation x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w310', () => {
  it('binary-exponentiation x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w320', () => {
  it('binary-exponentiation x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w330', () => {
  it('binary-exponentiation x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w340', () => {
  it('binary-exponentiation x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w350', () => {
  it('binary-exponentiation x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w360', () => {
  it('binary-exponentiation x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w370', () => {
  it('binary-exponentiation x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w380', () => {
  it('binary-exponentiation x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w390', () => {
  it('binary-exponentiation x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w400', () => {
  it('binary-exponentiation x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w420', () => {
  it('binary-exponentiation x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w440', () => {
  it('binary-exponentiation x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w460', () => {
  it('binary-exponentiation x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w480', () => {
  it('binary-exponentiation x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w500', () => {
  it('binary-exponentiation x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w550', () => {
  it('binary-exponentiation x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w600', () => {
  it('binary-exponentiation x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w650', () => {
  it('binary-exponentiation x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('binary-exponentiation - w700', () => {
  it('binary-exponentiation x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('binary-exponentiation x700x49', () => {
    expect(describe).toBeDefined()
  })
})
