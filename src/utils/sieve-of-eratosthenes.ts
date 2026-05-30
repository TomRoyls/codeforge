export class SieveOfEratosthenes {
  static primesUpTo(n: number): number[] {
    if (n < 2) return []
    const isPrime = new Uint8Array(n + 1).fill(1)
    isPrime[0] = 0
    isPrime[1] = 0
    for (let i = 2; i * i <= n; i++) {
      if (isPrime[i]) {
        for (let j = i * i; j <= n; j += i) {
          isPrime[j] = 0
        }
      }
    }
    const primes: number[] = []
    for (let i = 2; i <= n; i++) {
      if (isPrime[i]) primes.push(i)
    }
    return primes
  }

  static isPrime(n: number): boolean {
    if (n < 2) return false
    if (n < 4) return true
    if (n % 2 === 0 || n % 3 === 0) return false
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false
    }
    return true
  }

  static primeCount(n: number): number {
    return SieveOfEratosthenes.primesUpTo(n).length
  }

  static nthPrime(n: number): number {
    if (n < 1) throw new Error('n must be >= 1')
    const estimate = Math.max(30, Math.floor(n * (Math.log(n) + Math.log(Math.log(n)))))
    const primes = SieveOfEratosthenes.primesUpTo(estimate)
    if (primes.length >= n) return primes[n - 1]!
    return SieveOfEratosthenes.primesUpTo(estimate * 2)[n - 1]!
  }

  static primeFactors(n: number): Map<number, number> {
    const factors = new Map<number, number>()
    if (n < 2) return factors
    let d = 2
    while (d * d <= n) {
      while (n % d === 0) {
        factors.set(d, (factors.get(d) ?? 0) + 1)
        n /= d
      }
      d++
    }
    if (n > 1) factors.set(n, 1)
    return factors
  }

  static eulerTotient(n: number): number {
    let result = n
    let p = 2
    let temp = n
    while (p * p <= temp) {
      if (temp % p === 0) {
        while (temp % p === 0) temp /= p
        result -= result / p
      }
      p++
    }
    if (temp > 1) result -= result / temp
    return Math.floor(result)
  }

  static segmentedSieve(lo: number, hi: number): number[] {
    if (hi < 2 || lo > hi) return []
    const limit = Math.floor(Math.sqrt(hi)) + 1
    const basePrimes = SieveOfEratosthenes.primesUpTo(limit)
    const range = hi - lo + 1
    const isPrime = new Uint8Array(range).fill(1)
    if (lo === 0) { isPrime[0] = 0; if (range > 1) isPrime[1] = 0 }
    if (lo === 1) isPrime[0] = 0
    for (const p of basePrimes) {
      const start = Math.max(p * p, Math.ceil(lo / p) * p)
      for (let j = start - lo; j < range; j += p) {
        isPrime[j] = 0
      }
    }
    const primes: number[] = []
    for (let i = 0; i < range; i++) {
      if (isPrime[i]) primes.push(lo + i)
    }
    return primes
  }
}
