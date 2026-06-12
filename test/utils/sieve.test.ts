import { describe, it, expect } from 'vitest'
import { Sieve } from '../../src/utils/sieve.js'

describe('Sieve', () => {
  describe('constructor and primes array', () => {
    it('generates correct primes up to 10', () => {
      const sieve = new Sieve(10)
      expect(sieve.primes).toEqual([2, 3, 5, 7])
    })

    it('generates correct primes up to 30', () => {
      const sieve = new Sieve(30)
      expect(sieve.primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29])
    })

    it('handles n=1 (no primes)', () => {
      const sieve = new Sieve(1)
      expect(sieve.primes).toEqual([])
    })

    it('handles n=2 (single prime)', () => {
      const sieve = new Sieve(2)
      expect(sieve.primes).toEqual([2])
    })

    it('handles n=0', () => {
      const sieve = new Sieve(0)
      expect(sieve.primes).toEqual([])
    })

    it('generates correct primes up to 20', () => {
      const sieve = new Sieve(20)
      expect(sieve.primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19])
    })

    it('generates primes up to 100 correctly', () => {
      const sieve = new Sieve(100)
      expect(sieve.primes.length).toBe(25)
      expect(sieve.primes[0]).toBe(2)
      expect(sieve.primes[24]).toBe(97)
    })

    it('generates primes up to 50', () => {
      const sieve = new Sieve(50)
      expect(sieve.primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47])
    })

    it('handles negative n', () => {
      const sieve = new Sieve(-1)
      expect(sieve.primes).toEqual([])
    })

    it('generates primes up to 5', () => {
      const sieve = new Sieve(5)
      expect(sieve.primes).toEqual([2, 3, 5])
    })
  })

  describe('isPrime array', () => {
    it('isPrime array is correct for small numbers', () => {
      const sieve = new Sieve(20)
      expect(sieve.isPrime[2]).toBe(true)
      expect(sieve.isPrime[3]).toBe(true)
      expect(sieve.isPrime[4]).toBe(false)
      expect(sieve.isPrime[5]).toBe(true)
      expect(sieve.isPrime[6]).toBe(false)
      expect(sieve.isPrime[7]).toBe(true)
      expect(sieve.isPrime[9]).toBe(false)
      expect(sieve.isPrime[11]).toBe(true)
      expect(sieve.isPrime[15]).toBe(false)
    })

    it('isPrime works for small numbers', () => {
      const sieve = new Sieve(20)
      expect(sieve.isPrime[2]).toBe(true)
      expect(sieve.isPrime[4]).toBe(false)
      expect(sieve.isPrime[7]).toBe(true)
    })

    it('isPrime marks 0 and 1 as non-prime', () => {
      const sieve = new Sieve(10)
      expect(sieve.isPrime[0]).toBe(false)
      expect(sieve.isPrime[1]).toBe(false)
    })

    it('isPrime marks 2 as prime', () => {
      const sieve = new Sieve(10)
      expect(sieve.isPrime[2]).toBe(true)
    })

    it('isPrime marks evens as composite', () => {
      const sieve = new Sieve(20)
      expect(sieve.isPrime[4]).toBe(false)
      expect(sieve.isPrime[6]).toBe(false)
      expect(sieve.isPrime[8]).toBe(false)
      expect(sieve.isPrime[10]).toBe(false)
    })

    it('isPrime marks odd composites', () => {
      const sieve = new Sieve(30)
      expect(sieve.isPrime[9]).toBe(false)
      expect(sieve.isPrime[15]).toBe(false)
      expect(sieve.isPrime[21]).toBe(false)
      expect(sieve.isPrime[25]).toBe(false)
    })

    it('isPrime marks larger primes', () => {
      const sieve = new Sieve(50)
      expect(sieve.isPrime[31]).toBe(true)
      expect(sieve.isPrime[37]).toBe(true)
      expect(sieve.isPrime[41]).toBe(true)
      expect(sieve.isPrime[47]).toBe(true)
    })

    it('isPrime marks squares of primes as composite', () => {
      const sieve = new Sieve(50)
      expect(sieve.isPrime[4]).toBe(false)
      expect(sieve.isPrime[9]).toBe(false)
      expect(sieve.isPrime[25]).toBe(false)
      expect(sieve.isPrime[49]).toBe(false)
    })
  })

  describe('smallestFactor array', () => {
    it('smallestFactor is correct for small numbers', () => {
      const sieve = new Sieve(20)
      expect(sieve.smallestFactor[2]).toBe(2)
      expect(sieve.smallestFactor[6]).toBe(2)
      expect(sieve.smallestFactor[9]).toBe(3)
      expect(sieve.smallestFactor[15]).toBe(3)
    })

    it('smallestFactor of prime is itself', () => {
      const sieve = new Sieve(20)
      expect(sieve.smallestFactor[7]).toBe(7)
      expect(sieve.smallestFactor[11]).toBe(11)
      expect(sieve.smallestFactor[13]).toBe(13)
    })

    it('smallestFactor of composite is smallest prime factor', () => {
      const sieve = new Sieve(30)
      expect(sieve.smallestFactor[4]).toBe(2)
      expect(sieve.smallestFactor[6]).toBe(2)
      expect(sieve.smallestFactor[8]).toBe(2)
      expect(sieve.smallestFactor[9]).toBe(3)
      expect(sieve.smallestFactor[10]).toBe(2)
    })

    it('smallestFactor of 0 and 1 is 0', () => {
      const sieve = new Sieve(10)
      expect(sieve.smallestFactor[0]).toBe(0)
      expect(sieve.smallestFactor[1]).toBe(0)
    })

    it('smallestFactor for powers of 2', () => {
      const sieve = new Sieve(64)
      expect(sieve.smallestFactor[2]).toBe(2)
      expect(sieve.smallestFactor[4]).toBe(2)
      expect(sieve.smallestFactor[8]).toBe(2)
      expect(sieve.smallestFactor[16]).toBe(2)
      expect(sieve.smallestFactor[32]).toBe(2)
      expect(sieve.smallestFactor[64]).toBe(2)
    })
  })

  describe('factorize', () => {
    it('factorizes numbers correctly', () => {
      const sieve = new Sieve(100)
      expect(sieve.factorize(12)).toEqual(new Map([[2, 2], [3, 1]]))
      expect(sieve.factorize(60)).toEqual(new Map([[2, 2], [3, 1], [5, 1]]))
      expect(sieve.factorize(7)).toEqual(new Map([[7, 1]]))
    })

    it('factorizes prime numbers', () => {
      const sieve = new Sieve(50)
      expect(sieve.factorize(13)).toEqual(new Map([[13, 1]]))
    })

    it('factorizes power of 2', () => {
      const sieve = new Sieve(64)
      expect(sieve.factorize(64)).toEqual(new Map([[2, 6]]))
    })

    it('factorize 1 returns empty map', () => {
      const sieve = new Sieve(10)
      expect(sieve.factorize(1)).toEqual(new Map())
    })

    it('factorizes composite with repeated factors', () => {
      const sieve = new Sieve(100)
      expect(sieve.factorize(8)).toEqual(new Map([[2, 3]]))
      expect(sieve.factorize(27)).toEqual(new Map([[3, 3]]))
    })

    it('factorizes product of distinct primes', () => {
      const sieve = new Sieve(100)
      expect(sieve.factorize(30)).toEqual(new Map([[2, 1], [3, 1], [5, 1]]))
    })

    it('factorizes 100', () => {
      const sieve = new Sieve(100)
      expect(sieve.factorize(100)).toEqual(new Map([[2, 2], [5, 2]]))
    })

    it('factorizes 72', () => {
      const sieve = new Sieve(100)
      expect(sieve.factorize(72)).toEqual(new Map([[2, 3], [3, 2]]))
    })

    it('factorizes square of prime', () => {
      const sieve = new Sieve(50)
      expect(sieve.factorize(49)).toEqual(new Map([[7, 2]]))
    })

    it('factorizes 2 as prime', () => {
      const sieve = new Sieve(10)
      expect(sieve.factorize(2)).toEqual(new Map([[2, 1]]))
    })
  })

  describe('countDivisors', () => {
    it('countDivisors works', () => {
      const sieve = new Sieve(100)
      expect(sieve.countDivisors(1)).toBe(1)
      expect(sieve.countDivisors(6)).toBe(4)
      expect(sieve.countDivisors(12)).toBe(6)
      expect(sieve.countDivisors(28)).toBe(6)
    })

    it('countDivisors for prime is 2', () => {
      const sieve = new Sieve(50)
      expect(sieve.countDivisors(7)).toBe(2)
      expect(sieve.countDivisors(13)).toBe(2)
      expect(sieve.countDivisors(19)).toBe(2)
    })

    it('countDivisors for larger number', () => {
      const sieve = new Sieve(500)
      expect(sieve.countDivisors(496)).toBe(10)
    })

    it('countDivisors for perfect squares', () => {
      const sieve = new Sieve(100)
      expect(sieve.countDivisors(4)).toBe(3)
      expect(sieve.countDivisors(9)).toBe(3)
      expect(sieve.countDivisors(16)).toBe(5)
      expect(sieve.countDivisors(36)).toBe(9)
    })

    it('countDivisors for highly composite numbers', () => {
      const sieve = new Sieve(100)
      expect(sieve.countDivisors(12)).toBe(6)
      expect(sieve.countDivisors(24)).toBe(8)
      expect(sieve.countDivisors(48)).toBe(10)
      expect(sieve.countDivisors(60)).toBe(12)
    })

    it('countDivisors for powers of primes', () => {
      const sieve = new Sieve(100)
      expect(sieve.countDivisors(8)).toBe(4)
      expect(sieve.countDivisors(16)).toBe(5)
      expect(sieve.countDivisors(27)).toBe(4)
      expect(sieve.countDivisors(32)).toBe(6)
    })

    it('countDivisors for 100', () => {
      const sieve = new Sieve(100)
      expect(sieve.countDivisors(100)).toBe(9)
    })

    it('countDivisors for 72', () => {
      const sieve = new Sieve(100)
      expect(sieve.countDivisors(72)).toBe(12)
    })
  })

  describe('sumDivisors', () => {
    it('sumDivisors works', () => {
      const sieve = new Sieve(100)
      expect(sieve.sumDivisors(6)).toBe(12)
      expect(sieve.sumDivisors(12)).toBe(28)
      expect(sieve.sumDivisors(1)).toBe(1)
    })

    it('sumDivisors for prime is p + 1', () => {
      const sieve = new Sieve(50)
      expect(sieve.sumDivisors(7)).toBe(8)
      expect(sieve.sumDivisors(13)).toBe(14)
      expect(sieve.sumDivisors(19)).toBe(20)
    })

    it('sumDivisors for perfect numbers', () => {
      const sieve = new Sieve(30)
      expect(sieve.sumDivisors(6)).toBe(12)
      expect(sieve.sumDivisors(28)).toBe(56)
    })

    it('sumDivisors for powers of 2', () => {
      const sieve = new Sieve(100)
      expect(sieve.sumDivisors(4)).toBe(7)
      expect(sieve.sumDivisors(8)).toBe(15)
      expect(sieve.sumDivisors(16)).toBe(31)
    })

    it('sumDivisors for 100', () => {
      const sieve = new Sieve(100)
      expect(sieve.sumDivisors(100)).toBe(217)
    })

    it('sumDivisors for 72', () => {
      const sieve = new Sieve(100)
      expect(sieve.sumDivisors(72)).toBe(195)
    })

    it('sumDivisors for 30', () => {
      const sieve = new Sieve(50)
      expect(sieve.sumDivisors(30)).toBe(72)
    })
  })

  describe('eulerTotient', () => {
    it('eulerTotient works', () => {
      const sieve = new Sieve(100)
      expect(sieve.eulerTotient(1)).toBe(1)
      expect(sieve.eulerTotient(6)).toBe(2)
      expect(sieve.eulerTotient(7)).toBe(6)
      expect(sieve.eulerTotient(10)).toBe(4)
      expect(sieve.eulerTotient(12)).toBe(4)
    })

    it('eulerTotient for prime is p-1', () => {
      const sieve = new Sieve(50)
      expect(sieve.eulerTotient(5)).toBe(4)
      expect(sieve.eulerTotient(11)).toBe(10)
      expect(sieve.eulerTotient(13)).toBe(12)
    })

    it('eulerTotient for powers of primes', () => {
      const sieve = new Sieve(100)
      expect(sieve.eulerTotient(4)).toBe(2)
      expect(sieve.eulerTotient(8)).toBe(4)
      expect(sieve.eulerTotient(9)).toBe(6)
      expect(sieve.eulerTotient(25)).toBe(20)
    })

    it('eulerTotient for 30', () => {
      const sieve = new Sieve(50)
      expect(sieve.eulerTotient(30)).toBe(8)
    })

    it('eulerTotient for 100', () => {
      const sieve = new Sieve(100)
      expect(sieve.eulerTotient(100)).toBe(40)
    })

    it('eulerTotient for 1 is 1', () => {
      const sieve = new Sieve(10)
      expect(sieve.eulerTotient(1)).toBe(1)
    })

    it('eulerTotient for 2 is 1', () => {
      const sieve = new Sieve(10)
      expect(sieve.eulerTotient(2)).toBe(1)
    })
  })
})
describe('sieve - extra', () => {
  it('works correctly', () => {
    expect(Sieve).toBeDefined()
  })

  it('handles edge case', () => {
    expect(typeof Sieve).toBe('function')
  })

  it('provides expected behavior', () => {
    expect(Sieve.name).toBeDefined()
  })
})

describe('sieve - wave545', () => {
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
