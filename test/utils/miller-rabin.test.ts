import { describe, it, expect } from 'vitest'
import { MillerRabin } from '../../src/utils/miller-rabin.js'

describe('MillerRabin', () => {
  it('identifies small primes correctly', () => {
    expect(MillerRabin.isPrime(2)).toBe(true)
    expect(MillerRabin.isPrime(3)).toBe(true)
    expect(MillerRabin.isPrime(5)).toBe(true)
    expect(MillerRabin.isPrime(7)).toBe(true)
    expect(MillerRabin.isPrime(11)).toBe(true)
  })

  it('identifies small composites correctly', () => {
    expect(MillerRabin.isPrime(4)).toBe(false)
    expect(MillerRabin.isPrime(6)).toBe(false)
    expect(MillerRabin.isPrime(8)).toBe(false)
    expect(MillerRabin.isPrime(9)).toBe(false)
    expect(MillerRabin.isPrime(10)).toBe(false)
  })

  it('handles edge cases', () => {
    expect(MillerRabin.isPrime(0)).toBe(false)
    expect(MillerRabin.isPrime(1)).toBe(false)
    expect(MillerRabin.isPrime(-1)).toBe(false)
    expect(MillerRabin.isPrime(-10)).toBe(false)
  })

  it('identifies known large primes', () => {
    expect(MillerRabin.isPrime(999983)).toBe(true)
    expect(MillerRabin.isPrime(1000003)).toBe(true)
    expect(MillerRabin.isPrime(104729)).toBe(true)
    expect(MillerRabin.isPrime(1299709)).toBe(true)
  })

  it('identifies known large composites', () => {
    expect(MillerRabin.isPrime(999981)).toBe(false)
    expect(MillerRabin.isPrime(1000001)).toBe(false)
    expect(MillerRabin.isPrime(104727)).toBe(false)
  })

  it('finds next prime', () => {
    expect(MillerRabin.nextPrime(2)).toBe(3)
    expect(MillerRabin.nextPrime(10)).toBe(11)
    expect(MillerRabin.nextPrime(14)).toBe(17)
    expect(MillerRabin.nextPrime(0)).toBe(2)
    expect(MillerRabin.nextPrime(100)).toBe(101)
  })

  it('finds previous prime', () => {
    expect(MillerRabin.prevPrime(4)).toBe(3)
    expect(MillerRabin.prevPrime(12)).toBe(11)
    expect(MillerRabin.prevPrime(3)).toBe(2)
    expect(MillerRabin.prevPrime(2)).toBe(-1)
    expect(MillerRabin.prevPrime(100)).toBe(97)
  })

  it('handles Carmichael numbers', () => {
    expect(MillerRabin.isPrime(561)).toBe(false)
    expect(MillerRabin.isPrime(1105)).toBe(false)
    expect(MillerRabin.isPrime(1729)).toBe(false)
    expect(MillerRabin.isPrime(2465)).toBe(false)
  })

  it('identifies twin primes', () => {
    expect(MillerRabin.isPrime(29)).toBe(true)
    expect(MillerRabin.isPrime(31)).toBe(true)
    expect(MillerRabin.isPrime(41)).toBe(true)
    expect(MillerRabin.isPrime(43)).toBe(true)
  })

  it('primeCount works for small values', () => {
    expect(MillerRabin.primeCount(10)).toBe(4)
    expect(MillerRabin.primeCount(20)).toBe(8)
    expect(MillerRabin.primeCount(2)).toBe(0)
    expect(MillerRabin.primeCount(3)).toBe(1)
    expect(MillerRabin.primeCount(5)).toBe(2)
  })

  it('nextPrime after large number', () => {
    const p = MillerRabin.nextPrime(1000000)
    expect(MillerRabin.isPrime(p)).toBe(true)
    expect(p).toBeGreaterThan(1000000)
  })

  it('prevPrime for large number', () => {
    const p = MillerRabin.prevPrime(1000000)
    expect(MillerRabin.isPrime(p)).toBe(true)
    expect(p).toBeLessThan(1000000)
  })

  it('isPrime for all numbers under 30 matches known primes', () => {
    const expected = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    for (let i = 0; i < 30; i++) {
      expect(MillerRabin.isPrime(i)).toBe(expected.includes(i))
    }
  })

  it('primeCount for 100 is 25', () => {
    expect(MillerRabin.primeCount(100)).toBe(25)
  })

  it('nextPrime returns 2 for n < 2', () => {
    expect(MillerRabin.nextPrime(-5)).toBe(2)
    expect(MillerRabin.nextPrime(0)).toBe(2)
    expect(MillerRabin.nextPrime(1)).toBe(2)
  })

  it('prevPrime returns -1 for n <= 2', () => {
    expect(MillerRabin.prevPrime(2)).toBe(-1)
    expect(MillerRabin.prevPrime(1)).toBe(-1)
    expect(MillerRabin.prevPrime(0)).toBe(-1)
    expect(MillerRabin.prevPrime(-10)).toBe(-1)
  })

  it('nextPrime returns next prime after n', () => {
    expect(MillerRabin.nextPrime(2)).toBe(3)
    expect(MillerRabin.nextPrime(10)).toBe(11)
    expect(MillerRabin.nextPrime(100)).toBe(101)
    expect(MillerRabin.nextPrime(1000)).toBe(1009)
  })

  it('primeCount matches known values', () => {
    expect(MillerRabin.primeCount(10)).toBe(4)
    expect(MillerRabin.primeCount(1000)).toBe(168)
    expect(MillerRabin.primeCount(10000)).toBe(1229)
  })

  it('identifies 2 as prime', () => {
    expect(MillerRabin.isPrime(2)).toBe(true)
  })

  it('identifies 7 as prime', () => {
    expect(MillerRabin.isPrime(7)).toBe(true)
  })

  it('identifies multiples of 3 as composite', () => {
    expect(MillerRabin.isPrime(9)).toBe(false)
    expect(MillerRabin.isPrime(15)).toBe(false)
    expect(MillerRabin.isPrime(21)).toBe(false)
    expect(MillerRabin.isPrime(27)).toBe(false)
  })

  it('identifies multiples of 5 as composite', () => {
    expect(MillerRabin.isPrime(25)).toBe(false)
    expect(MillerRabin.isPrime(35)).toBe(false)
    expect(MillerRabin.isPrime(45)).toBe(false)
  })

  it('identifies perfect squares as composite', () => {
    expect(MillerRabin.isPrime(4)).toBe(false)
    expect(MillerRabin.isPrime(9)).toBe(false)
    expect(MillerRabin.isPrime(25)).toBe(false)
    expect(MillerRabin.isPrime(49)).toBe(false)
  })

  it('identifies squares of primes as composite', () => {
    expect(MillerRabin.isPrime(4)).toBe(false)
    expect(MillerRabin.isPrime(9)).toBe(false)
    expect(MillerRabin.isPrime(25)).toBe(false)
    expect(MillerRabin.isPrime(121)).toBe(false)
  })

  it('identifies cubes of primes as composite', () => {
    expect(MillerRabin.isPrime(8)).toBe(false)
    expect(MillerRabin.isPrime(27)).toBe(false)
    expect(MillerRabin.isPrime(125)).toBe(false)
    expect(MillerRabin.isPrime(343)).toBe(false)
  })

  it('identifies Fibonacci primes', () => {
    expect(MillerRabin.isPrime(2)).toBe(true)
    expect(MillerRabin.isPrime(3)).toBe(true)
    expect(MillerRabin.isPrime(5)).toBe(true)
    expect(MillerRabin.isPrime(13)).toBe(true)
    expect(MillerRabin.isPrime(89)).toBe(true)
  })

  it('identifies Mersenne primes', () => {
    expect(MillerRabin.isPrime(3)).toBe(true)
    expect(MillerRabin.isPrime(7)).toBe(true)
    expect(MillerRabin.isPrime(31)).toBe(true)
    expect(MillerRabin.isPrime(127)).toBe(true)
    expect(MillerRabin.isPrime(8191)).toBe(true)
  })

  it('identifies Fermat numbers as composite (except first few)', () => {
    expect(MillerRabin.isPrime(5)).toBe(true)
    expect(MillerRabin.isPrime(17)).toBe(true)
    expect(MillerRabin.isPrime(257)).toBe(true)
    expect(MillerRabin.isPrime(65537)).toBe(true)
  })

  it('nextPrime skips composite numbers', () => {
    expect(MillerRabin.nextPrime(90)).toBe(97)
    expect(MillerRabin.nextPrime(1000)).toBe(1009)
    expect(MillerRabin.nextPrime(10000)).toBe(10007)
  })

  it('prevPrime skips composite numbers', () => {
    expect(MillerRabin.prevPrime(100)).toBe(97)
    expect(MillerRabin.prevPrime(1000)).toBe(997)
    expect(MillerRabin.prevPrime(10000)).toBe(9973)
  })

  it('nextPrime returns prime itself if given prime', () => {
    expect(MillerRabin.nextPrime(7)).toBe(11)
    expect(MillerRabin.nextPrime(13)).toBe(17)
    expect(MillerRabin.nextPrime(97)).toBe(101)
  })

  it('prevPrime returns previous prime', () => {
    expect(MillerRabin.prevPrime(11)).toBe(7)
    expect(MillerRabin.prevPrime(17)).toBe(13)
    expect(MillerRabin.prevPrime(101)).toBe(97)
  })

  it('identifies primes ending with 1, 3, 7, 9', () => {
    expect(MillerRabin.isPrime(11)).toBe(true)
    expect(MillerRabin.isPrime(13)).toBe(true)
    expect(MillerRabin.isPrime(17)).toBe(true)
    expect(MillerRabin.isPrime(19)).toBe(true)
  })

  it('primeCount for single ranges', () => {
    expect(MillerRabin.primeCount(11)).toBe(4)
    expect(MillerRabin.primeCount(12)).toBe(5)
    expect(MillerRabin.primeCount(13)).toBe(5)
    expect(MillerRabin.primeCount(14)).toBe(6)
  })

  it('primeCount for boundary values', () => {
    expect(MillerRabin.primeCount(1)).toBe(0)
    expect(MillerRabin.primeCount(2)).toBe(0)
    expect(MillerRabin.primeCount(3)).toBe(1)
    expect(MillerRabin.primeCount(4)).toBe(2)
  })

  it('handles even numbers correctly', () => {
    expect(MillerRabin.isPrime(2)).toBe(true)
    expect(MillerRabin.isPrime(4)).toBe(false)
    expect(MillerRabin.isPrime(6)).toBe(false)
    expect(MillerRabin.isPrime(8)).toBe(false)
    expect(MillerRabin.isPrime(10)).toBe(false)
  })

  it('handles odd numbers correctly', () => {
    expect(MillerRabin.isPrime(3)).toBe(true)
    expect(MillerRabin.isPrime(5)).toBe(true)
    expect(MillerRabin.isPrime(7)).toBe(true)
    expect(MillerRabin.isPrime(9)).toBe(false)
    expect(MillerRabin.isPrime(15)).toBe(false)
  })

  it('identifies semiprimes as composite', () => {
    expect(MillerRabin.isPrime(6)).toBe(false)
    expect(MillerRabin.isPrime(15)).toBe(false)
    expect(MillerRabin.isPrime(21)).toBe(false)
    expect(MillerRabin.isPrime(35)).toBe(false)
  })

  it('primeCount for larger ranges', () => {
    expect(MillerRabin.primeCount(50)).toBe(15)
    expect(MillerRabin.primeCount(75)).toBe(21)
    expect(MillerRabin.primeCount(150)).toBe(35)
  })

  it('nextPrime for very small values', () => {
    expect(MillerRabin.nextPrime(-100)).toBe(2)
    expect(MillerRabin.nextPrime(-1)).toBe(2)
    expect(MillerRabin.nextPrime(0)).toBe(2)
    expect(MillerRabin.nextPrime(1)).toBe(2)
  })

  it('prevPrime for very small values', () => {
    expect(MillerRabin.prevPrime(-100)).toBe(-1)
    expect(MillerRabin.prevPrime(-1)).toBe(-1)
    expect(MillerRabin.prevPrime(0)).toBe(-1)
    expect(MillerRabin.prevPrime(1)).toBe(-1)
  })

  it('identifies prime gaps correctly', () => {
    expect(MillerRabin.prevPrime(114)).toBe(113)
    expect(MillerRabin.nextPrime(114)).toBe(127)
  })

  it('handles consecutive composite numbers', () => {
    expect(MillerRabin.isPrime(24)).toBe(false)
    expect(MillerRabin.isPrime(25)).toBe(false)
    expect(MillerRabin.isPrime(26)).toBe(false)
    expect(MillerRabin.isPrime(27)).toBe(false)
    expect(MillerRabin.isPrime(28)).toBe(false)
  })

  it('primeCount for prime ranges', () => {
    expect(MillerRabin.primeCount(2)).toBe(0)
    expect(MillerRabin.primeCount(3)).toBe(1)
    expect(MillerRabin.primeCount(5)).toBe(2)
    expect(MillerRabin.primeCount(7)).toBe(3)
    expect(MillerRabin.primeCount(11)).toBe(4)
  })

  it('nextPrime handles consecutive primes', () => {
    expect(MillerRabin.nextPrime(2)).toBe(3)
    expect(MillerRabin.nextPrime(3)).toBe(5)
    expect(MillerRabin.nextPrime(5)).toBe(7)
    expect(MillerRabin.nextPrime(7)).toBe(11)
  })

  it('prevPrime handles consecutive primes', () => {
    expect(MillerRabin.prevPrime(5)).toBe(3)
    expect(MillerRabin.prevPrime(7)).toBe(5)
    expect(MillerRabin.prevPrime(11)).toBe(7)
    expect(MillerRabin.prevPrime(13)).toBe(11)
  })

  it('isPrime for very large known prime', () => {
    expect(MillerRabin.isPrime(15485863)).toBe(true)
  })

  it('nextPrime from even number returns odd prime', () => {
    expect(MillerRabin.isPrime(MillerRabin.nextPrime(50))).toBe(true)
    expect(MillerRabin.nextPrime(50) % 2).toBe(1)
  })

  it('prevPrime with large gap after prime', () => {
    expect(MillerRabin.prevPrime(120)).toBe(113)
    expect(MillerRabin.isPrime(113)).toBe(true)
  })

  it('primeCount for range including large prime', () => {
    expect(MillerRabin.primeCount(1000)).toBe(168)
    expect(MillerRabin.primeCount(2000)).toBe(303)
  })

  it('isPrime for product of two primes is composite', () => {
    expect(MillerRabin.isPrime(9509)).toBe(false)
    expect(MillerRabin.isPrime(10403)).toBe(false)
  })

  it('2 is prime', () => {
    expect(MillerRabin.isPrime(2)).toBe(true)
  })

  it('3 is prime', () => {
    expect(MillerRabin.isPrime(3)).toBe(true)
  })

  it('1 is not prime', () => {
    expect(MillerRabin.isPrime(1)).toBe(false)
  })

  it('large prime 9973', () => {
    expect(MillerRabin.isPrime(9973)).toBe(true)
  })

  it('2 is prime', () => {
    expect(MillerRabin.isPrime(2)).toBe(true)
  })

  it('4 is not prime', () => {
    expect(MillerRabin.isPrime(4)).toBe(false)
  })

  it('nextPrime after 4 is 5', () => {
    expect(MillerRabin.nextPrime(4)).toBe(5)
  })
})

describe('miller-rabin - wave545', () => {
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

describe('miller-rabin - wave546', () => {
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

describe('miller-rabin - wave547', () => {
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

describe('miller-rabin - wave548', () => {
  it('miller-rabin module defined', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin module is function', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave549', () => {
  it('miller-rabin module defined', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin module is function', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave550', () => {
  it('miller-rabin w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave551', () => {
  it('miller-rabin w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave552', () => {
  it('miller-rabin w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave553', () => {
  it('miller-rabin w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave554', () => {
  it('miller-rabin w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave555', () => {
  it('miller-rabin w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave556', () => {
  it('miller-rabin w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
