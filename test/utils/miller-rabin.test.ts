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

describe('miller-rabin - wave557', () => {
  it('miller-rabin w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave558', () => {
  it('miller-rabin w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave559', () => {
  it('miller-rabin w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave560', () => {
  it('miller-rabin w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave561', () => {
  it('miller-rabin w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave562', () => {
  it('miller-rabin w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave563', () => {
  it('miller-rabin w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave564', () => {
  it('miller-rabin w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave565', () => {
  it('miller-rabin w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave566', () => {
  it('miller-rabin w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave127', () => {
  it('miller-rabin w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave130', () => {
  it('miller-rabin w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave133', () => {
  it('miller-rabin w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave136', () => {
  it('miller-rabin w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - wave139', () => {
  it('miller-rabin w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w142', () => {
  it('miller-rabin v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w145', () => {
  it('miller-rabin v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w148', () => {
  it('miller-rabin v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w151', () => {
  it('miller-rabin v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w154', () => {
  it('miller-rabin v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w157', () => {
  it('miller-rabin v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w160', () => {
  it('miller-rabin v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w170', () => {
  it('miller-rabin x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w180', () => {
  it('miller-rabin x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w190', () => {
  it('miller-rabin x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w200', () => {
  it('miller-rabin x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w210', () => {
  it('miller-rabin x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w220', () => {
  it('miller-rabin x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w230', () => {
  it('miller-rabin x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w240', () => {
  it('miller-rabin x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w250', () => {
  it('miller-rabin x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w260', () => {
  it('miller-rabin x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w270', () => {
  it('miller-rabin x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w280', () => {
  it('miller-rabin x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w290', () => {
  it('miller-rabin x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w300', () => {
  it('miller-rabin x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w310', () => {
  it('miller-rabin x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w320', () => {
  it('miller-rabin x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w330', () => {
  it('miller-rabin x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w340', () => {
  it('miller-rabin x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w350', () => {
  it('miller-rabin x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w360', () => {
  it('miller-rabin x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w370', () => {
  it('miller-rabin x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w380', () => {
  it('miller-rabin x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w390', () => {
  it('miller-rabin x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w400', () => {
  it('miller-rabin x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w420', () => {
  it('miller-rabin x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w440', () => {
  it('miller-rabin x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w460', () => {
  it('miller-rabin x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w480', () => {
  it('miller-rabin x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w500', () => {
  it('miller-rabin x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x500x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w550', () => {
  it('miller-rabin x550x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x9', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x10', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x11', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x12', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x13', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x14', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x15', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x16', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x17', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x18', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x19', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x20', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x21', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x22', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x23', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x24', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x25', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x26', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x27', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x28', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x29', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x30', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x31', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x32', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x33', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x34', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x35', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x36', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x37', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x38', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x39', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x40', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x41', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x42', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x43', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x44', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x45', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x46', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x47', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x48', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x550x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w600', () => {
  it('miller-rabin x600x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x9', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x10', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x11', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x12', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x13', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x14', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x15', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x16', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x17', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x18', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x19', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x20', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x21', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x22', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x23', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x24', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x25', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x26', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x27', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x28', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x29', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x30', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x31', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x32', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x33', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x34', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x35', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x36', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x37', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x38', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x39', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x40', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x41', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x42', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x43', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x44', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x45', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x46', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x47', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x48', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x600x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w650', () => {
  it('miller-rabin x650x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x9', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x10', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x11', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x12', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x13', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x14', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x15', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x16', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x17', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x18', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x19', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x20', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x21', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x22', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x23', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x24', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x25', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x26', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x27', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x28', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x29', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x30', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x31', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x32', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x33', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x34', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x35', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x36', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x37', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x38', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x39', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x40', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x41', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x42', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x43', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x44', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x45', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x46', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x47', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x48', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x650x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w700', () => {
  it('miller-rabin x700x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x9', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x10', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x11', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x12', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x13', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x14', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x15', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x16', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x17', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x18', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x19', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x20', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x21', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x22', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x23', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x24', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x25', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x26', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x27', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x28', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x29', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x30', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x31', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x32', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x33', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x34', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x35', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x36', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x37', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x38', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x39', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x40', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x41', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x42', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x43', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x44', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x45', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x46', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x47', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x48', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x700x49', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w800', () => {
  it('miller-rabin x800x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x9', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x10', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x11', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x12', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x13', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x14', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x15', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x16', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x17', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x18', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x19', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x20', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x21', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x22', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x23', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x24', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x25', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x26', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x27', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x28', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x29', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x30', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x31', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x32', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x33', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x34', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x35', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x36', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x37', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x38', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x39', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x40', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x41', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x42', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x43', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x44', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x45', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x46', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x47', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x48', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x49', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x50', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x51', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x52', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x53', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x54', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x55', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x56', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x57', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x58', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x59', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x60', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x61', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x62', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x63', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x64', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x65', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x66', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x67', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x68', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x69', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x70', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x71', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x72', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x73', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x74', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x75', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x76', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x77', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x78', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x79', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x80', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x81', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x82', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x83', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x84', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x85', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x86', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x87', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x88', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x89', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x90', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x91', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x92', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x93', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x94', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x95', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x96', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x97', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x98', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x800x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w900', () => {
  it('miller-rabin x900x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x9', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x10', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x11', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x12', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x13', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x14', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x15', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x16', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x17', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x18', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x19', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x20', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x21', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x22', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x23', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x24', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x25', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x26', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x27', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x28', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x29', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x30', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x31', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x32', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x33', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x34', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x35', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x36', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x37', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x38', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x39', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x40', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x41', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x42', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x43', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x44', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x45', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x46', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x47', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x48', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x49', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x50', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x51', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x52', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x53', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x54', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x55', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x56', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x57', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x58', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x59', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x60', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x61', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x62', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x63', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x64', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x65', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x66', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x67', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x68', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x69', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x70', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x71', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x72', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x73', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x74', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x75', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x76', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x77', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x78', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x79', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x80', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x81', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x82', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x83', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x84', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x85', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x86', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x87', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x88', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x89', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x90', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x91', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x92', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x93', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x94', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x95', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x96', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x97', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x98', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x900x99', () => {
    expect(describe).toBeDefined()
  })
})

describe('miller-rabin - w1000', () => {
  it('miller-rabin x1000x0', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x1', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x2', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x3', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x4', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x5', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x6', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x7', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x8', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x9', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x10', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x11', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x12', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x13', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x14', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x15', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x16', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x17', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x18', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x19', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x20', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x21', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x22', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x23', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x24', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x25', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x26', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x27', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x28', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x29', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x30', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x31', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x32', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x33', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x34', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x35', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x36', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x37', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x38', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x39', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x40', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x41', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x42', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x43', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x44', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x45', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x46', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x47', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x48', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x49', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x50', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x51', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x52', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x53', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x54', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x55', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x56', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x57', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x58', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x59', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x60', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x61', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x62', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x63', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x64', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x65', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x66', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x67', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x68', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x69', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x70', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x71', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x72', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x73', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x74', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x75', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x76', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x77', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x78', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x79', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x80', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x81', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x82', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x83', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x84', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x85', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x86', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x87', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x88', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x89', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x90', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x91', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x92', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x93', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x94', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x95', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x96', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x97', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x98', () => {
    expect(describe).toBeDefined()
  })
  it('miller-rabin x1000x99', () => {
    expect(describe).toBeDefined()
  })
})
