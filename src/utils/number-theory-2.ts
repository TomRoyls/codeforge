export class NumberTheory2 {
  static gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b)
    while (b) { [a, b] = [b, a % b] }
    return a
  }

  static lcm(a: number, b: number): number {
    if (a === 0 || b === 0) return 0
    return Math.abs(a * b) / NumberTheory2.gcd(a, b)
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

  static factorize(n: number): Array<[number, number]> {
    const factors: Array<[number, number]> = []
    for (let d = 2; d * d <= n; d++) {
      let count = 0
      while (n % d === 0) { count++; n = Math.floor(n / d) }
      if (count > 0) factors.push([d, count])
    }
    if (n > 1) factors.push([n, 1])
    return factors
  }

  static sieve(n: number): number[] {
    const isComp = new Array(n + 1).fill(false)
    const primes: number[] = []
    for (let i = 2; i <= n; i++) {
      if (!isComp[i]) {
        primes.push(i)
        for (let j = i * i; j <= n; j += i) isComp[j] = true
      }
    }
    return primes
  }

  static eulerPhi(n: number): number {
    let result = n
    let m = n
    for (let p = 2; p * p <= m; p++) {
      if (m % p === 0) {
        while (m % p === 0) m = Math.floor(m / p)
        result = Math.floor(result / p) * (p - 1)
      }
    }
    if (m > 1) result = Math.floor(result / m) * (m - 1)
    return result
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): NumberTheory2 { return new NumberTheory2() }
  equals(other: unknown): boolean { return other instanceof NumberTheory2 }
}
