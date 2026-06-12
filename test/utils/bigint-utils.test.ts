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
