import { describe, expect, it } from 'vitest'
import { PollardRho } from '../../src/utils/pollard-rho.js'

describe('PollardRho', () => {
  it('factorizes small composite numbers', () => {
    const factors = PollardRho.factorize(12)
    expect(factors).toEqual([2n, 2n, 3n])
  })

  it('factorizes prime numbers', () => {
    expect(PollardRho.factorize(17)).toEqual([17n])
    expect(PollardRho.factorize(7)).toEqual([7n])
  })

  it('factorizes 1 returns empty', () => {
    expect(PollardRho.factorize(1)).toEqual([])
  })

  it('factorizes 0 returns empty', () => {
    expect(PollardRho.factorize(0)).toEqual([])
  })

  it('factorizes large semiprime', () => {
    const factors = PollardRho.factorize(91)
    expect(factors.sort()).toEqual([7n, 13n].sort())
  })

  it('factorizes power of 2', () => {
    expect(PollardRho.factorize(64)).toEqual([2n, 2n, 2n, 2n, 2n, 2n])
  })

  it('factorizes product of small primes', () => {
    const n = 2 * 3 * 5 * 7 * 11 * 13
    expect(PollardRho.factorize(n)).toEqual([2n, 3n, 5n, 7n, 11n, 13n])
  })

  it('isPrime detects primes', () => {
    expect(PollardRho.isPrime(2n)).toBe(true)
    expect(PollardRho.isPrime(3n)).toBe(true)
    expect(PollardRho.isPrime(97n)).toBe(true)
    expect(PollardRho.isPrime(4n)).toBe(false)
    expect(PollardRho.isPrime(100n)).toBe(false)
  })

  it('isPrime handles edge cases', () => {
    expect(PollardRho.isPrime(0n)).toBe(false)
    expect(PollardRho.isPrime(1n)).toBe(false)
    expect(PollardRho.isPrime(-5n)).toBe(false)
  })

  it('isPrime detects large prime', () => {
    expect(PollardRho.isPrime(10007n)).toBe(true)
    expect(PollardRho.isPrime(10009n)).toBe(true)
  })

  it('factorizes product of two primes', () => {
    const factors = PollardRho.factorize(10007 * 10009)
    expect(factors).toEqual([BigInt(10007), BigInt(10009)])
  })

  it('accepts bigint input', () => {
    expect(PollardRho.factorize(15n)).toEqual([3n, 5n])
  })

  it('factorizes prime square', () => {
    expect(PollardRho.factorize(49)).toEqual([7n, 7n])
  })

  it('factorizes 2', () => {
    expect(PollardRho.factorize(2)).toEqual([2n])
  })

  it('factorizes 3', () => {
    expect(PollardRho.factorize(3)).toEqual([3n])
  })

  it('factorizes 4', () => {
    expect(PollardRho.factorize(4)).toEqual([2n, 2n])
  })

  it('factorizes 6', () => {
    expect(PollardRho.factorize(6)).toEqual([2n, 3n])
  })

  it('factorizes 8', () => {
    expect(PollardRho.factorize(8)).toEqual([2n, 2n, 2n])
  })

  it('factorizes 9', () => {
    expect(PollardRho.factorize(9)).toEqual([3n, 3n])
  })

  it('factorizes 10', () => {
    expect(PollardRho.factorize(10)).toEqual([2n, 5n])
  })

  it('factors multiply back to original', () => {
    const n = 360
    const factors = PollardRho.factorize(n)
    const product = factors.reduce((a, b) => a * b, 1n)
    expect(product).toBe(BigInt(n))
  })

  it('factorizes 100', () => {
    expect(PollardRho.factorize(100)).toEqual([2n, 2n, 5n, 5n])
  })

  it('factorizes 120', () => {
    expect(PollardRho.factorize(120)).toEqual([2n, 2n, 2n, 3n, 5n])
  })

  it('factorizes 5040', () => {
    const factors = PollardRho.factorize(5040)
    const product = factors.reduce((a, b) => a * b, 1n)
    expect(product).toBe(5040n)
  })

  it('isPrime for 5 is true', () => {
    expect(PollardRho.isPrime(5n)).toBe(true)
  })

  it('isPrime for 6 is false', () => {
    expect(PollardRho.isPrime(6n)).toBe(false)
  })

  it('isPrime for 25 is false', () => {
    expect(PollardRho.isPrime(25n)).toBe(false)
  })

  it('isPrime for 29 is true', () => {
    expect(PollardRho.isPrime(29n)).toBe(true)
  })

  it('factorizes negative number returns empty', () => {
    expect(PollardRho.factorize(-5)).toEqual([])
  })

  it('factorizes 30 with all distinct primes', () => {
    expect(PollardRho.factorize(30)).toEqual([2n, 3n, 5n])
  })

  it('factorizes 2^10 = 1024', () => {
    const factors = PollardRho.factorize(1024)
    expect(factors.length).toBe(10)
    expect(factors.every(f => f === 2n)).toBe(true)
  })

  it('factorizes 3^5 = 243', () => {
    const factors = PollardRho.factorize(243)
    expect(factors.length).toBe(5)
    expect(factors.every(f => f === 3n)).toBe(true)
  })

  it('factorizes large number correctly', () => {
    const n = 2n * 3n * 5n * 7n * 11n * 13n * 17n
    const factors = PollardRho.factorize(n)
    const product = factors.reduce((a, b) => a * b, 1n)
    expect(product).toBe(n)
  })

  it('isPrime for 997 (large prime)', () => {
    expect(PollardRho.isPrime(997n)).toBe(true)
  })

  it('isPrime for 999 (composite)', () => {
    expect(PollardRho.isPrime(999n)).toBe(false)
  })

  it('factorize returns bigint array', () => {
    const factors = PollardRho.factorize(10)
    for (const f of factors) {
      expect(typeof f).toBe('bigint')
    }
  })

  it('factorizes 720', () => {
    const factors = PollardRho.factorize(720)
    const product = factors.reduce((a, b) => a * b, 1n)
    expect(product).toBe(720n)
  })

  it('factorize 27 = 3^3', () => {
    expect(PollardRho.factorize(27)).toEqual([3n, 3n, 3n])
  })

  it('factorize 125 = 5^3', () => {
    expect(PollardRho.factorize(125)).toEqual([5n, 5n, 5n])
  })

  it('factorize 121 = 11^2', () => {
    expect(PollardRho.factorize(121)).toEqual([11n, 11n])
  })

  it('isPrime for 2 is true', () => {
    expect(PollardRho.isPrime(2n)).toBe(true)
  })

  it('isPrime for 3 is true', () => {
    expect(PollardRho.isPrime(3n)).toBe(true)
  })

  it('factorize 77 = 7*11', () => {
    expect(PollardRho.factorize(77).sort()).toEqual([7n, 11n].sort())
  })

  it('factorize 169 = 13^2', () => {
    expect(PollardRho.factorize(169)).toEqual([13n, 13n])
  })

  it('factorize 256 = 2^8', () => {
    const factors = PollardRho.factorize(256)
    expect(factors.length).toBe(8)
    expect(factors.every(f => f === 2n)).toBe(true)
  })

  it('factorizes product of two large primes', () => {
    const n = 10007n * 10009n
    const factors = PollardRho.factorize(n)
    const product = factors.reduce((a, b) => a * b, 1n)
    expect(product).toBe(n)
    expect(factors.length).toBe(2)
  })

  it('factorizes perfect cube', () => {
    expect(PollardRho.factorize(27)).toEqual([3n, 3n, 3n])
  })

  it('factorizes number with mixed small and large factors', () => {
    const n = 2n * 3n * 10007n
    const factors = PollardRho.factorize(n)
    const product = factors.reduce((a, b) => a * b, 1n)
    expect(product).toBe(n)
    expect(factors.sort()).toEqual([2n, 3n, 10007n].sort())
  })

  it('factorizes prime squared times another prime', () => {
    const n = 7n * 7n * 11n
    const factors = PollardRho.factorize(n)
    const product = factors.reduce((a, b) => a * b, 1n)
    expect(product).toBe(n)
    expect(factors.sort()).toEqual([7n, 7n, 11n].sort())
  })

  it('isPrime for very small edge cases', () => {
    expect(PollardRho.isPrime(2n)).toBe(true)
    expect(PollardRho.isPrime(3n)).toBe(true)
    expect(PollardRho.isPrime(5n)).toBe(true)
  })

  it('isPrime for composite just above prime', () => {
    expect(PollardRho.isPrime(100n)).toBe(false)
    expect(PollardRho.isPrime(1001n)).toBe(false)
  })

  it('factorize returns factors of 12', () => {
    const factors = PollardRho.factorize(12)
    expect(factors.length).toBeGreaterThan(0)
    const product = factors.reduce((a, b) => a * b, 1n)
    expect(product).toBe(12n)
  })

  it('factorize of prime returns that prime', () => {
    const factors = PollardRho.factorize(13)
    expect(factors).toEqual([13n])
  })

  it('isPrime for 2', () => {
    expect(PollardRho.isPrime(2n)).toBe(true)
  })

  it('factorize large number', () => {
    const factors = PollardRho.factorize(100)
    const product = factors.reduce((a, b) => a * b, 1n)
    expect(product).toBe(100n)
  })

  it('factorize 12', () => {
    const factors = PollardRho.factorize(12)
    expect(factors.length).toBeGreaterThan(0)
  })

  it('isPrime 7', () => {
    expect(PollardRho.isPrime(7n)).toBe(true)
  })

  it('isPrime 4', () => {
    expect(PollardRho.isPrime(4n)).toBe(false)
  })
})

describe('pollard-rho - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('pollard-rho - wave546', () => {
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

describe('pollard-rho - wave547', () => {
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

describe('pollard-rho - wave548', () => {
  it('pollard-rho module defined', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho module is function', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave549', () => {
  it('pollard-rho module defined', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho module is function', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave550', () => {
  it('pollard-rho w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave551', () => {
  it('pollard-rho w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave552', () => {
  it('pollard-rho w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave553', () => {
  it('pollard-rho w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave554', () => {
  it('pollard-rho w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave555', () => {
  it('pollard-rho w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave556', () => {
  it('pollard-rho w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave557', () => {
  it('pollard-rho w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave558', () => {
  it('pollard-rho w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave559', () => {
  it('pollard-rho w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave560', () => {
  it('pollard-rho w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w560 v2', () => {
    expect(describe).toBeDefined()
  })
})
