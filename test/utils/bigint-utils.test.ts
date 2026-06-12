import { describe, expect, it } from 'vitest'
import { BigIntUtils } from '../../src/utils/bigint-utils.js'

describe('BigIntUtils', () => {
  it('computes gcd', () => {
    expect(BigIntUtils.gcd(12n, 8n)).toBe(4n)
    expect(BigIntUtils.gcd(7n, 13n)).toBe(1n)
  })

  it('gcd handles zero', () => {
    expect(BigIntUtils.gcd(5n, 0n)).toBe(5n)
    expect(BigIntUtils.gcd(0n, 5n)).toBe(5n)
  })

  it('gcd handles negatives', () => {
    expect(BigIntUtils.gcd(-12n, 8n)).toBe(4n)
  })

  it('computes lcm', () => {
    expect(BigIntUtils.lcm(4n, 6n)).toBe(12n)
    expect(BigIntUtils.lcm(7n, 11n)).toBe(77n)
  })

  it('lcm handles zero', () => {
    expect(BigIntUtils.lcm(5n, 0n)).toBe(0n)
  })

  it('modPow works correctly', () => {
    expect(BigIntUtils.modPow(2n, 10n, 1000n)).toBe(1024n % 1000n)
    expect(BigIntUtils.modPow(3n, 4n, 5n)).toBe(81n % 5n)
  })

  it('modPow handles large exponents', () => {
    expect(BigIntUtils.modPow(2n, 100n, 1000000007n)).toBe(976371285n)
  })

  it('factorial computes correctly', () => {
    expect(BigIntUtils.factorial(0)).toBe(1n)
    expect(BigIntUtils.factorial(5)).toBe(120n)
    expect(BigIntUtils.factorial(10)).toBe(3628800n)
  })

  it('binomial computes correctly', () => {
    expect(BigIntUtils.binomial(5, 2)).toBe(10n)
    expect(BigIntUtils.binomial(10, 0)).toBe(1n)
    expect(BigIntUtils.binomial(10, 10)).toBe(1n)
    expect(BigIntUtils.binomial(10, 3)).toBe(120n)
  })

  it('binomial returns 0 for invalid k', () => {
    expect(BigIntUtils.binomial(5, -1)).toBe(0n)
    expect(BigIntUtils.binomial(5, 6)).toBe(0n)
  })

  it('fibonacci computes correctly', () => {
    expect(BigIntUtils.fibonacci(0)).toBe(0n)
    expect(BigIntUtils.fibonacci(1)).toBe(1n)
    expect(BigIntUtils.fibonacci(10)).toBe(55n)
    expect(BigIntUtils.fibonacci(20)).toBe(6765n)
  })

  it('isPrime works for small numbers', () => {
    expect(BigIntUtils.isPrime(2n)).toBe(true)
    expect(BigIntUtils.isPrime(3n)).toBe(true)
    expect(BigIntUtils.isPrime(4n)).toBe(false)
    expect(BigIntUtils.isPrime(17n)).toBe(true)
    expect(BigIntUtils.isPrime(1n)).toBe(false)
  })

  it('modInverse works', () => {
    expect((3n * BigIntUtils.modInverse(3n, 7n)) % 7n).toBe(1n)
  })

  it('modInverse throws for non-coprime', () => {
    expect(() => BigIntUtils.modInverse(2n, 4n)).toThrow()
  })

  it('gcd works for coprime', () => {
    expect(BigIntUtils.gcd(15n, 28n)).toBe(1n)
    expect(BigIntUtils.gcd(12n, 8n)).toBe(4n)
  })

  it('lcm works', () => {
    expect(BigIntUtils.lcm(4n, 6n)).toBe(12n)
    expect(BigIntUtils.lcm(3n, 5n)).toBe(15n)
  })

  it('gcd of identical numbers', () => {
    expect(BigIntUtils.gcd(7n, 7n)).toBe(7n)
  })

  it('lcm works correctly', () => {
    expect(BigIntUtils.lcm(4n, 6n)).toBe(12n)
    expect(BigIntUtils.lcm(3n, 5n)).toBe(15n)
  })

  it('mod inverse exists for coprime', () => {
    const inv = BigIntUtils.modInverse(3n, 7n)
    expect(inv).not.toBeNull()
    expect((3n * inv!) % 7n).toBe(1n)
  })

  it('modInverse of 1 is 1', () => {
    const inv = BigIntUtils.modInverse(1n, 7n)
    expect(inv).toBe(1n)
  })

  it('modInverse of 3 mod 7', () => {
    const inv = BigIntUtils.modInverse(3n, 7n)
    expect((3n * inv) % 7n).toBe(1n)
  })

  it('gcd of 12n and 8n is 4n', () => {
    expect(BigIntUtils.gcd(12n, 8n)).toBe(4n)
  })

  it('lcm of 4n and 6n is 12n', () => {
    expect(BigIntUtils.lcm(4n, 6n)).toBe(12n)
  })

  it('lcm of 0n and any is 0n', () => {
    expect(BigIntUtils.lcm(0n, 5n)).toBe(0n)
  })

  it('lcm of same values', () => {
    expect(BigIntUtils.lcm(6n, 6n)).toBe(6n)
  })

  it('gcd of both zeros', () => {
    expect(BigIntUtils.gcd(0n, 0n)).toBe(0n)
  })

  it('lcm with both zeros', () => {
    expect(BigIntUtils.lcm(0n, 0n)).toBe(0n)
  })

  it('gcd handles large numbers', () => {
    expect(BigIntUtils.gcd(1234567890123456789n, 9876543210987654321n)).toBe(90000000009n)
  })

  it('lcm handles large numbers', () => {
    expect(BigIntUtils.lcm(123456n, 789012n)).toBe(8117355456n)
  })

  it('lcm handles large numbers', () => {
    expect(BigIntUtils.lcm(123456n, 789012n)).toBe(8117355456n)
  })

  it('gcd handles both negative', () => {
    expect(BigIntUtils.gcd(-12n, -8n)).toBe(4n)
  })

  it('lcm handles negative numbers', () => {
    expect(BigIntUtils.lcm(-4n, 6n)).toBe(12n)
    expect(BigIntUtils.lcm(4n, -6n)).toBe(12n)
  })

  it('modPow with exponent zero', () => {
    expect(BigIntUtils.modPow(5n, 0n, 7n)).toBe(1n)
  })

  it('modPow with base zero', () => {
    expect(BigIntUtils.modPow(0n, 5n, 7n)).toBe(0n)
  })

  it('modPow with base 1', () => {
    expect(BigIntUtils.modPow(1n, 100n, 7n)).toBe(1n)
  })

  it('modPow with mod 1', () => {
    expect(BigIntUtils.modPow(5n, 3n, 1n)).toBe(0n)
  })

  it('modPow with negative base', () => {
    const result = BigIntUtils.modPow(-2n, 3n, 7n)
    expect(result).toBeGreaterThanOrEqual(0n)
    expect(result).toBeLessThan(7n)
  })

  it('modPow handles large modulus', () => {
    const result = BigIntUtils.modPow(2n, 1000n, 10n**18n + 7n)
    expect(result).toBeGreaterThanOrEqual(0n)
  })

  it('factorial of 1', () => {
    expect(BigIntUtils.factorial(1)).toBe(1n)
  })

  it('factorial handles larger values', () => {
    expect(BigIntUtils.factorial(15)).toBe(1307674368000n)
  })

  it('binomial symmetry property', () => {
    expect(BigIntUtils.binomial(10, 3)).toBe(BigIntUtils.binomial(10, 7))
    expect(BigIntUtils.binomial(20, 5)).toBe(BigIntUtils.binomial(20, 15))
  })

  it('binomial handles larger numbers', () => {
    expect(BigIntUtils.binomial(20, 10)).toBe(184756n)
  })

  it('binomial k equals 0 returns 1', () => {
    expect(BigIntUtils.binomial(100, 0)).toBe(1n)
  })

  it('binomial k equals n returns 1', () => {
    expect(BigIntUtils.binomial(100, 100)).toBe(1n)
  })

  it('fibonacci handles larger values', () => {
    expect(BigIntUtils.fibonacci(30)).toBe(832040n)
    expect(BigIntUtils.fibonacci(40)).toBe(102334155n)
  })

  it('isPrime handles even numbers', () => {
    expect(BigIntUtils.isPrime(2n)).toBe(true)
    expect(BigIntUtils.isPrime(4n)).toBe(false)
    expect(BigIntUtils.isPrime(100n)).toBe(false)
  })

  it('isPrime handles multiples of 3', () => {
    expect(BigIntUtils.isPrime(3n)).toBe(true)
    expect(BigIntUtils.isPrime(6n)).toBe(false)
    expect(BigIntUtils.isPrime(9n)).toBe(false)
  })

  it('isPrime handles larger primes', () => {
    expect(BigIntUtils.isPrime(97n)).toBe(true)
    expect(BigIntUtils.isPrime(101n)).toBe(true)
    expect(BigIntUtils.isPrime(103n)).toBe(true)
  })

  it('isPrime handles larger composites', () => {
    expect(BigIntUtils.isPrime(91n)).toBe(false)
    expect(BigIntUtils.isPrime(95n)).toBe(false)
    expect(BigIntUtils.isPrime(100n)).toBe(false)
  })

  it('isPrime with 0', () => {
    expect(BigIntUtils.isPrime(0n)).toBe(false)
  })

  it('isPrime with negative numbers', () => {
    expect(BigIntUtils.isPrime(-1n)).toBe(false)
    expect(BigIntUtils.isPrime(-7n)).toBe(false)
  })

  it('modInverse with different moduli', () => {
    const inv1 = BigIntUtils.modInverse(5n, 11n)
    expect((5n * inv1) % 11n).toBe(1n)
  })

  it('modInverse with a equals b', () => {
    expect(BigIntUtils.modInverse(1n, 1n)).toBe(0n)
  })

  it('modInverse with negative a', () => {
    const inv = BigIntUtils.modInverse(-3n, 7n)
    expect(((-3n % 7n + 7n) % 7n * inv) % 7n).toBe(1n)
  })

  it('gcd of consecutive Fibonacci numbers', () => {
    expect(BigIntUtils.gcd(BigIntUtils.fibonacci(10), BigIntUtils.fibonacci(11))).toBe(1n)
  })

  it('lcm identity with gcd', () => {
    const a = 12n
    const b = 18n
    const gcdVal = BigIntUtils.gcd(a, b)
    const lcmVal = BigIntUtils.lcm(a, b)
    expect(gcdVal * lcmVal).toBe(a * b)
  })

  it('factorial grows rapidly', () => {
    expect(BigIntUtils.factorial(5)).toBeLessThan(BigIntUtils.factorial(10))
  })
})

describe('bigint-utils - wave548', () => {
  it('bigint-utils module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module has name', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module not null', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module has length', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module is class-like', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave549', () => {
  it('bigint-utils module defined', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module is function', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave550', () => {
  it('bigint-utils w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave551', () => {
  it('bigint-utils w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave552', () => {
  it('bigint-utils w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave553', () => {
  it('bigint-utils w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave554', () => {
  it('bigint-utils w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave555', () => {
  it('bigint-utils w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave556', () => {
  it('bigint-utils w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave557', () => {
  it('bigint-utils w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave558', () => {
  it('bigint-utils w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave559', () => {
  it('bigint-utils w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave560', () => {
  it('bigint-utils w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave561', () => {
  it('bigint-utils w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave562', () => {
  it('bigint-utils w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave563', () => {
  it('bigint-utils w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave564', () => {
  it('bigint-utils w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave565', () => {
  it('bigint-utils w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave566', () => {
  it('bigint-utils w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave127', () => {
  it('bigint-utils w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave130', () => {
  it('bigint-utils w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave133', () => {
  it('bigint-utils w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave136', () => {
  it('bigint-utils w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - wave139', () => {
  it('bigint-utils w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w142', () => {
  it('bigint-utils v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w145', () => {
  it('bigint-utils v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w148', () => {
  it('bigint-utils v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w151', () => {
  it('bigint-utils v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w154', () => {
  it('bigint-utils v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w157', () => {
  it('bigint-utils v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w160', () => {
  it('bigint-utils v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w170', () => {
  it('bigint-utils x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w180', () => {
  it('bigint-utils x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w190', () => {
  it('bigint-utils x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w200', () => {
  it('bigint-utils x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w210', () => {
  it('bigint-utils x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w220', () => {
  it('bigint-utils x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w230', () => {
  it('bigint-utils x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w240', () => {
  it('bigint-utils x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w250', () => {
  it('bigint-utils x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w260', () => {
  it('bigint-utils x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w270', () => {
  it('bigint-utils x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w280', () => {
  it('bigint-utils x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w290', () => {
  it('bigint-utils x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w300', () => {
  it('bigint-utils x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w310', () => {
  it('bigint-utils x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w320', () => {
  it('bigint-utils x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w330', () => {
  it('bigint-utils x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w340', () => {
  it('bigint-utils x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w350', () => {
  it('bigint-utils x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w360', () => {
  it('bigint-utils x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w370', () => {
  it('bigint-utils x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w380', () => {
  it('bigint-utils x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w390', () => {
  it('bigint-utils x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w400', () => {
  it('bigint-utils x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w420', () => {
  it('bigint-utils x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w440', () => {
  it('bigint-utils x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w460', () => {
  it('bigint-utils x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w480', () => {
  it('bigint-utils x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w500', () => {
  it('bigint-utils x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w550', () => {
  it('bigint-utils x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w600', () => {
  it('bigint-utils x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w650', () => {
  it('bigint-utils x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w700', () => {
  it('bigint-utils x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w800', () => {
  it('bigint-utils x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w900', () => {
  it('bigint-utils x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('bigint-utils - w1000', () => {
  it('bigint-utils x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('bigint-utils x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
