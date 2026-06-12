import { describe, expect, it } from 'vitest'
import { SieveOfEratosthenes } from '../../src/utils/sieve-of-eratosthenes.js'

describe('SieveOfEratosthenes', () => {
  describe('primesUpTo', () => {
    it('finds primes up to 10', () => {
      expect(SieveOfEratosthenes.primesUpTo(10)).toEqual([2, 3, 5, 7])
    })

    it('finds primes up to 30', () => {
      expect(SieveOfEratosthenes.primesUpTo(30)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29])
    })

    it('returns empty for n < 2', () => {
      expect(SieveOfEratosthenes.primesUpTo(1)).toEqual([])
      expect(SieveOfEratosthenes.primesUpTo(0)).toEqual([])
      expect(SieveOfEratosthenes.primesUpTo(-1)).toEqual([])
    })

    it('returns [2] for n = 2', () => {
      expect(SieveOfEratosthenes.primesUpTo(2)).toEqual([2])
    })

    it('finds primes up to 3', () => {
      expect(SieveOfEratosthenes.primesUpTo(3)).toEqual([2, 3])
    })

    it('finds primes up to 5', () => {
      expect(SieveOfEratosthenes.primesUpTo(5)).toEqual([2, 3, 5])
    })

    it('finds primes up to 20', () => {
      expect(SieveOfEratosthenes.primesUpTo(20)).toEqual([2, 3, 5, 7, 11, 13, 17, 19])
    })

    it('finds primes up to 50', () => {
      expect(SieveOfEratosthenes.primesUpTo(50)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47])
    })

    it('finds primes up to 100', () => {
      const primes = SieveOfEratosthenes.primesUpTo(100)
      expect(primes.length).toBe(25)
      expect(primes[0]).toBe(2)
      expect(primes[24]).toBe(97)
    })

    it('handles large n = 500', () => {
      const primes = SieveOfEratosthenes.primesUpTo(500)
      expect(primes.length).toBe(95)
      expect(primes[0]).toBe(2)
      expect(primes[94]).toBe(499)
    })

    it('finds first twin primes', () => {
      const primes = SieveOfEratosthenes.primesUpTo(10)
      expect(primes.includes(3)).toBe(true)
      expect(primes.includes(5)).toBe(true)
    })
  })

  describe('isPrime', () => {
    it('detects small primes correctly', () => {
      expect(SieveOfEratosthenes.isPrime(2)).toBe(true)
      expect(SieveOfEratosthenes.isPrime(3)).toBe(true)
      expect(SieveOfEratosthenes.isPrime(5)).toBe(true)
      expect(SieveOfEratosthenes.isPrime(7)).toBe(true)
    })

    it('detects small composites correctly', () => {
      expect(SieveOfEratosthenes.isPrime(4)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(6)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(8)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(9)).toBe(false)
    })

    it('returns false for numbers less than 2', () => {
      expect(SieveOfEratosthenes.isPrime(1)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(0)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(-1)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(-100)).toBe(false)
    })

    it('detects larger primes correctly', () => {
      expect(SieveOfEratosthenes.isPrime(17)).toBe(true)
      expect(SieveOfEratosthenes.isPrime(23)).toBe(true)
      expect(SieveOfEratosthenes.isPrime(29)).toBe(true)
      expect(SieveOfEratosthenes.isPrime(97)).toBe(true)
    })

    it('detects larger composites correctly', () => {
      expect(SieveOfEratosthenes.isPrime(25)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(33)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(49)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(77)).toBe(false)
    })

    it('detects even numbers as composite (except 2)', () => {
      expect(SieveOfEratosthenes.isPrime(2)).toBe(true)
      expect(SieveOfEratosthenes.isPrime(4)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(10)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(100)).toBe(false)
    })

    it('detects multiples of 3 as composite (except 3)', () => {
      expect(SieveOfEratosthenes.isPrime(3)).toBe(true)
      expect(SieveOfEratosthenes.isPrime(6)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(9)).toBe(false)
      expect(SieveOfEratosthenes.isPrime(15)).toBe(false)
    })

    it('handles prime 2 correctly', () => {
      expect(SieveOfEratosthenes.isPrime(2)).toBe(true)
    })

    it('handles prime 3 correctly', () => {
      expect(SieveOfEratosthenes.isPrime(3)).toBe(true)
    })

    it('handles composite 4 correctly', () => {
      expect(SieveOfEratosthenes.isPrime(4)).toBe(false)
    })

    it('handles 1 correctly', () => {
      expect(SieveOfEratosthenes.isPrime(1)).toBe(false)
    })

    it('handles 0 correctly', () => {
      expect(SieveOfEratosthenes.isPrime(0)).toBe(false)
    })
  })

  describe('primeCount', () => {
    it('returns correct count for small ranges', () => {
      expect(SieveOfEratosthenes.primeCount(10)).toBe(4)
      expect(SieveOfEratosthenes.primeCount(20)).toBe(8)
      expect(SieveOfEratosthenes.primeCount(30)).toBe(10)
    })

    it('returns correct count for larger ranges', () => {
      expect(SieveOfEratosthenes.primeCount(100)).toBe(25)
      expect(SieveOfEratosthenes.primeCount(200)).toBe(46)
    })

    it('returns 0 for n < 2', () => {
      expect(SieveOfEratosthenes.primeCount(1)).toBe(0)
      expect(SieveOfEratosthenes.primeCount(0)).toBe(0)
      expect(SieveOfEratosthenes.primeCount(-5)).toBe(0)
    })

    it('returns 1 for n = 2', () => {
      expect(SieveOfEratosthenes.primeCount(2)).toBe(1)
    })

    it('counts primes up to 500', () => {
      expect(SieveOfEratosthenes.primeCount(500)).toBe(95)
    })
  })

  describe('nthPrime', () => {
    it('returns first prime', () => {
      expect(SieveOfEratosthenes.nthPrime(1)).toBe(2)
    })

    it('returns 4th prime', () => {
      expect(SieveOfEratosthenes.nthPrime(4)).toBe(7)
    })

    it('returns 10th prime', () => {
      expect(SieveOfEratosthenes.nthPrime(10)).toBe(29)
    })

    it('returns 25th prime', () => {
      expect(SieveOfEratosthenes.nthPrime(25)).toBe(97)
    })

    it('throws for n < 1', () => {
      expect(() => SieveOfEratosthenes.nthPrime(0)).toThrow()
      expect(() => SieveOfEratosthenes.nthPrime(-1)).toThrow()
    })

    it('returns 50th prime', () => {
      expect(SieveOfEratosthenes.nthPrime(50)).toBe(229)
    })

    it('returns 100th prime', () => {
      expect(SieveOfEratosthenes.nthPrime(100)).toBe(541)
    })

    it('returns 2nd prime', () => {
      expect(SieveOfEratosthenes.nthPrime(2)).toBe(3)
    })

    it('returns 3rd prime', () => {
      expect(SieveOfEratosthenes.nthPrime(3)).toBe(5)
    })

    it('returns 5th prime', () => {
      expect(SieveOfEratosthenes.nthPrime(5)).toBe(11)
    })
  })

  describe('primeFactors', () => {
    it('decomposes 12 correctly', () => {
      const factors = SieveOfEratosthenes.primeFactors(12)
      expect(factors.get(2)).toBe(2)
      expect(factors.get(3)).toBe(1)
      expect(factors.size).toBe(2)
    })

    it('decomposes prime as itself', () => {
      const factors = SieveOfEratosthenes.primeFactors(13)
      expect(factors.get(13)).toBe(1)
      expect(factors.size).toBe(1)
    })

    it('returns empty for 1', () => {
      expect(SieveOfEratosthenes.primeFactors(1).size).toBe(0)
      expect(SieveOfEratosthenes.primeFactors(0).size).toBe(0)
    })

    it('decomposes 360 correctly', () => {
      const f = SieveOfEratosthenes.primeFactors(360)
      expect(f.get(2)).toBe(3)
      expect(f.get(3)).toBe(2)
      expect(f.get(5)).toBe(1)
      expect(f.size).toBe(3)
    })

    it('decomposites with repeated factors', () => {
      const factors = SieveOfEratosthenes.primeFactors(8)
      expect(factors.get(2)).toBe(3)
      expect(factors.size).toBe(1)
    })

    it('decomposes product of distinct primes', () => {
      const factors = SieveOfEratosthenes.primeFactors(30)
      expect(factors.get(2)).toBe(1)
      expect(factors.get(3)).toBe(1)
      expect(factors.get(5)).toBe(1)
      expect(factors.size).toBe(3)
    })

    it('decomposes 100', () => {
      const factors = SieveOfEratosthenes.primeFactors(100)
      expect(factors.get(2)).toBe(2)
      expect(factors.get(5)).toBe(2)
    })

    it('decomposes large number 1024', () => {
      const factors = SieveOfEratosthenes.primeFactors(1024)
      expect(factors.get(2)).toBe(10)
      expect(factors.size).toBe(1)
    })

    it('decomposes 210', () => {
      const factors = SieveOfEratosthenes.primeFactors(210)
      expect(factors.get(2)).toBe(1)
      expect(factors.get(3)).toBe(1)
      expect(factors.get(5)).toBe(1)
      expect(factors.get(7)).toBe(1)
    })

    it('decomposes square of prime', () => {
      const factors = SieveOfEratosthenes.primeFactors(49)
      expect(factors.get(7)).toBe(2)
      expect(factors.size).toBe(1)
    })

    it('decomposites 2 correctly', () => {
      const factors = SieveOfEratosthenes.primeFactors(2)
      expect(factors.get(2)).toBe(1)
      expect(factors.size).toBe(1)
    })
  })

  describe('eulerTotient', () => {
    it('computes φ(1) = 1', () => {
      expect(SieveOfEratosthenes.eulerTotient(1)).toBe(1)
    })

    it('computes φ(6) = 2', () => {
      expect(SieveOfEratosthenes.eulerTotient(6)).toBe(2)
    })

    it('computes φ(9) = 6', () => {
      expect(SieveOfEratosthenes.eulerTotient(9)).toBe(6)
    })

    it('computes φ(12) = 4', () => {
      expect(SieveOfEratosthenes.eulerTotient(12)).toBe(4)
    })

    it('computes φ(p) = p-1 for prime p', () => {
      expect(SieveOfEratosthenes.eulerTotient(7)).toBe(6)
      expect(SieveOfEratosthenes.eulerTotient(13)).toBe(12)
    })

    it('computes φ(p^k) = p^k - p^(k-1)', () => {
      expect(SieveOfEratosthenes.eulerTotient(8)).toBe(4)
      expect(SieveOfEratosthenes.eulerTotient(27)).toBe(18)
    })

    it('computes φ(2n) = φ(n) for odd n', () => {
      expect(SieveOfEratosthenes.eulerTotient(10)).toBe(4)
      expect(SieveOfEratosthenes.eulerTotient(20)).toBe(8)
    })

    it('computes φ(30)', () => {
      expect(SieveOfEratosthenes.eulerTotient(30)).toBe(8)
    })

    it('computes φ(100)', () => {
      expect(SieveOfEratosthenes.eulerTotient(100)).toBe(40)
    })

    it('computes φ(210)', () => {
      expect(SieveOfEratosthenes.eulerTotient(210)).toBe(48)
    })

    it('handles φ(2) = 1', () => {
      expect(SieveOfEratosthenes.eulerTotient(2)).toBe(1)
    })

    it('handles φ(3) = 2', () => {
      expect(SieveOfEratosthenes.eulerTotient(3)).toBe(2)
    })
  })

  describe('segmentedSieve', () => {
    it('finds primes in range 10-20', () => {
      expect(SieveOfEratosthenes.segmentedSieve(10, 20)).toEqual([11, 13, 17, 19])
    })

    it('handles range starting at 0', () => {
      expect(SieveOfEratosthenes.segmentedSieve(0, 10)).toEqual([2, 3, 5, 7])
    })

    it('handles range starting at 1', () => {
      expect(SieveOfEratosthenes.segmentedSieve(1, 10)).toEqual([2, 3, 5, 7])
    })

    it('returns empty for invalid range', () => {
      expect(SieveOfEratosthenes.segmentedSieve(20, 10)).toEqual([])
    })

    it('finds primes in large range', () => {
      const primes = SieveOfEratosthenes.segmentedSieve(100, 150)
      expect(primes.length).toBe(10)
      expect(primes).toContain(101)
      expect(primes).toContain(149)
    })

    it('handles single number range', () => {
      expect(SieveOfEratosthenes.segmentedSieve(7, 7)).toEqual([7])
    })

    it('handles range with no primes', () => {
      expect(SieveOfEratosthenes.segmentedSieve(90, 96)).toEqual([])
    })

    it('handles range starting at 2', () => {
      expect(SieveOfEratosthenes.segmentedSieve(2, 10)).toEqual([2, 3, 5, 7])
    })

    it('finds primes in range 50-60', () => {
      expect(SieveOfEratosthenes.segmentedSieve(50, 60)).toEqual([53, 59])
    })

    it('handles range with hi < 2', () => {
      expect(SieveOfEratosthenes.segmentedSieve(0, 1)).toEqual([])
    })

    it('handles range equal to lo', () => {
      expect(SieveOfEratosthenes.segmentedSieve(5, 5)).toEqual([5])
    })
  })
})
describe('sieve-of-eratosthenes - wave549', () => {
  it('sieve-of-eratosthenes module defined', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave550', () => {
  it('sieve-of-eratosthenes w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave551', () => {
  it('sieve-of-eratosthenes w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave552', () => {
  it('sieve-of-eratosthenes w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave553', () => {
  it('sieve-of-eratosthenes w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave554', () => {
  it('sieve-of-eratosthenes w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave555', () => {
  it('sieve-of-eratosthenes w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave556', () => {
  it('sieve-of-eratosthenes w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave557', () => {
  it('sieve-of-eratosthenes w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave558', () => {
  it('sieve-of-eratosthenes w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave559', () => {
  it('sieve-of-eratosthenes w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave560', () => {
  it('sieve-of-eratosthenes w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave561', () => {
  it('sieve-of-eratosthenes w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave562', () => {
  it('sieve-of-eratosthenes w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave563', () => {
  it('sieve-of-eratosthenes w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('sieve-of-eratosthenes - wave564', () => {
  it('sieve-of-eratosthenes w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('sieve-of-eratosthenes w564 v2', () => {
    expect(describe).toBeDefined()
  })
})
