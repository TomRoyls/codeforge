export class Sieve {
  readonly isPrime: boolean[]
  readonly primes: number[]
  readonly smallestFactor: number[]

  constructor(n: number) {
    this.isPrime = new Array(n + 1).fill(true)
    this.smallestFactor = new Array(n + 1).fill(0)
    this.primes = []

    if (n >= 0) this.isPrime[0] = false
    if (n >= 1) this.isPrime[1] = false

    for (let i = 2; i <= n; i++) {
      if (this.isPrime[i]) {
        this.primes.push(i)
        this.smallestFactor[i] = i
      }
      for (let j = 0; j < this.primes.length; j++) {
        const p = this.primes[j]!
        if (i * p > n) break
        this.isPrime[i * p] = false
        this.smallestFactor[i * p] = p
        if (i % p === 0) break
      }
    }
  }

  factorize(n: number): Map<number, number> {
    const factors = new Map<number, number>()
    let x = n
    while (x > 1) {
      const p = this.smallestFactor[x]!
      let count = 0
      while (x % p === 0) {
        x = Math.floor(x / p)
        count++
      }
      factors.set(p, count)
    }
    return factors
  }

  countDivisors(n: number): number {
    const factors = this.factorize(n)
    let result = 1
    for (const count of factors.values()) {
      result *= count + 1
    }
    return result
  }

  sumDivisors(n: number): number {
    const factors = this.factorize(n)
    let result = 1
    for (const [prime, exp] of factors) {
      let sum = 0
      let power = 1
      for (let i = 0; i <= exp; i++) {
        sum += power
        power *= prime
      }
      result *= sum
    }
    return result
  }

  eulerTotient(n: number): number {
    const factors = this.factorize(n)
    let result = n
    for (const p of factors.keys()) {
      result = Math.floor(result / p) * (p - 1)
    }
    return result
  }
}
