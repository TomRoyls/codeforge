export class MillerRabin {
  static isPrime(n: number): boolean {
    if (n < 2) return false
    if (n < 4) return true
    if (n % 2 === 0 || n % 3 === 0) return false

    const bases = n < 3_317_044_064_679_887_385_961_981n
      ? [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]
      : [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]

    let d = n - 1
    let r = 0
    while (d % 2 === 0) {
      d = Math.floor(d / 2)
      r++
    }

    for (const a of bases) {
      if (a >= n) continue
      if (!MillerRabin.witness(n, a, d, r)) return false
    }
    return true
  }

  private static witness(n: number, a: number, d: number, r: number): boolean {
    let x = MillerRabin.modPow(a, d, n)
    if (x === 1 || x === n - 1) return true

    for (let i = 0; i < r - 1; i++) {
      x = MillerRabin.modMul(x, x, n)
      if (x === n - 1) return true
    }
    return false
  }

  private static modPow(base: number, exp: number, mod: number): number {
    let result = 1
    let b = base % mod
    let e = exp
    while (e > 0) {
      if (e & 1) result = MillerRabin.modMul(result, b, mod)
      b = MillerRabin.modMul(b, b, mod)
      e >>= 1
    }
    return result
  }

  private static modMul(a: number, b: number, mod: number): number {
    return Number(BigInt(a) * BigInt(b) % BigInt(mod))
  }

  static nextPrime(n: number): number {
    if (n < 2) return 2
    let candidate = n + 1
    if (candidate % 2 === 0) candidate++
    while (!MillerRabin.isPrime(candidate)) {
      candidate += 2
    }
    return candidate
  }

  static prevPrime(n: number): number {
    if (n <= 2) return -1
    if (n === 3) return 2
    let candidate = n - 1
    if (candidate % 2 === 0) candidate--
    while (candidate >= 2 && !MillerRabin.isPrime(candidate)) {
      candidate -= 2
    }
    return candidate >= 2 ? candidate : -1
  }

  static primeCount(n: number): number {
    let count = 0
    for (let i = 2; i < n; i++) {
      if (MillerRabin.isPrime(i)) count++
    }
    return count
  }
}
