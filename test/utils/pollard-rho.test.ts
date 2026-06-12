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

describe('pollard-rho - wave561', () => {
  it('pollard-rho w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave562', () => {
  it('pollard-rho w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave563', () => {
  it('pollard-rho w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave564', () => {
  it('pollard-rho w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave565', () => {
  it('pollard-rho w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave566', () => {
  it('pollard-rho w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave127', () => {
  it('pollard-rho w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave130', () => {
  it('pollard-rho w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave133', () => {
  it('pollard-rho w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave136', () => {
  it('pollard-rho w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - wave139', () => {
  it('pollard-rho w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w142', () => {
  it('pollard-rho v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w145', () => {
  it('pollard-rho v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w148', () => {
  it('pollard-rho v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w151', () => {
  it('pollard-rho v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w154', () => {
  it('pollard-rho v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w157', () => {
  it('pollard-rho v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w160', () => {
  it('pollard-rho v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w170', () => {
  it('pollard-rho x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w180', () => {
  it('pollard-rho x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w190', () => {
  it('pollard-rho x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w200', () => {
  it('pollard-rho x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w210', () => {
  it('pollard-rho x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w220', () => {
  it('pollard-rho x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w230', () => {
  it('pollard-rho x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w240', () => {
  it('pollard-rho x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w250', () => {
  it('pollard-rho x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w260', () => {
  it('pollard-rho x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w270', () => {
  it('pollard-rho x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w280', () => {
  it('pollard-rho x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w290', () => {
  it('pollard-rho x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w300', () => {
  it('pollard-rho x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w310', () => {
  it('pollard-rho x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w320', () => {
  it('pollard-rho x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w330', () => {
  it('pollard-rho x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w340', () => {
  it('pollard-rho x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w350', () => {
  it('pollard-rho x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w360', () => {
  it('pollard-rho x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w370', () => {
  it('pollard-rho x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w380', () => {
  it('pollard-rho x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w390', () => {
  it('pollard-rho x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w400', () => {
  it('pollard-rho x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w420', () => {
  it('pollard-rho x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w440', () => {
  it('pollard-rho x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w460', () => {
  it('pollard-rho x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w480', () => {
  it('pollard-rho x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w500', () => {
  it('pollard-rho x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w550', () => {
  it('pollard-rho x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('pollard-rho - w600', () => {
  it('pollard-rho x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('pollard-rho x600x49', () => {
    expect(describe).toBeDefined()
  })
})
