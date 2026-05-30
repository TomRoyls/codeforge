export class NumberTheory {
  static gcd(a: number, b: number): number {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b !== 0) {
      const t = b
      b = a % b
      a = t
    }
    return a
  }

  static lcm(a: number, b: number): number {
    if (a === 0 || b === 0) return 0
    return Math.abs(a) / NumberTheory.gcd(a, b) * Math.abs(b)
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

  static factorial(n: number): bigint {
    if (n < 0) throw new Error('Negative factorial')
    let result = 1n
    for (let i = 2; i <= n; i++) result *= BigInt(i)
    return result
  }

  static binomialCoefficient(n: number, k: number): bigint {
    if (k < 0 || k > n) return 0n
    if (k === 0 || k === n) return 1n
    if (k > n - k) k = n - k
    let result = 1n
    for (let i = 0; i < k; i++) {
      result = result * BigInt(n - i) / BigInt(i + 1)
    }
    return result
  }

  static fibonacci(n: number): bigint {
    if (n < 0) throw new Error('Negative fibonacci')
    if (n <= 1) return BigInt(n)
    let a = 0n
    let b = 1n
    for (let i = 2; i <= n; i++) {
      const tmp = a + b
      a = b
      b = tmp
    }
    return b
  }

  static eulerTotient(n: number): number {
    let result = n
    let temp = n
    for (let p = 2; p * p <= temp; p++) {
      if (temp % p === 0) {
        while (temp % p === 0) temp /= p
        result -= result / p
      }
    }
    if (temp > 1) result -= result / temp
    return Math.floor(result)
  }

  static mobius(n: number): number {
    if (n === 1) return 1
    let count = 0
    let temp = n
    for (let p = 2; p * p <= temp; p++) {
      if (temp % p === 0) {
        temp /= p
        count++
        if (temp % p === 0) return 0
      }
    }
    if (temp > 1) count++
    return count % 2 === 0 ? 1 : -1
  }

  static divisorCount(n: number): number {
    if (n <= 0) return 0
    let count = 1
    let temp = n
    for (let p = 2; p * p <= temp; p++) {
      let exp = 0
      while (temp % p === 0) { temp /= p; exp++ }
      if (exp > 0) count *= (exp + 1)
    }
    if (temp > 1) count *= 2
    return count
  }

  static sumOfDivisors(n: number): number {
    if (n <= 0) return 0
    let sum = 1
    let temp = n
    for (let p = 2; p * p <= temp; p++) {
      let exp = 0
      let pPow = 1
      while (temp % p === 0) { temp /= p; exp++; pPow *= p }
      if (exp > 0) {
        let s = 0
        let pw = 1
        for (let i = 0; i <= exp; i++) { s += pw; pw *= p }
        sum *= s
      }
    }
    if (temp > 1) sum *= (1 + temp)
    return sum
  }
}
