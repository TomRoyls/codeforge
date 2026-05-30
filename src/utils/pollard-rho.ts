export class PollardRho {
  private static gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
      const t = b
      b = a % b
      a = t
    }
    return a < 0n ? -a : a
  }

  private static pollardRho(n: bigint): bigint {
    if (n % 2n === 0n) return 2n
    for (let c = 1n; c < n; c++) {
      let x = 2n
      let y = 2n
      let d = 1n
      const f = (v: bigint): bigint => (v * v + c) % n
      while (d === 1n) {
        x = f(x)
        y = f(f(y))
        d = PollardRho.gcd(x > y ? x - y : y - x, n)
      }
      if (d !== n) return d
    }
    return n
  }

  static factorize(n: number | bigint): bigint[] {
    let num = BigInt(n)
    if (num <= 1n) return []
    const factors: bigint[] = []
    const stack: bigint[] = [num]
    while (stack.length > 0) {
      const current = stack.pop()!
      if (current <= 1n) continue
      if (PollardRho.isPrime(current)) {
        factors.push(current)
        continue
      }
      const d = PollardRho.pollardRho(current)
      stack.push(d)
      stack.push(current / d)
    }
    return factors.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  }

  static isPrime(n: bigint): boolean {
    if (n < 2n) return false
    if (n < 4n) return true
    if (n % 2n === 0n || n % 3n === 0n) return false
    const bases = [2n, 3n, 5n, 7n, 11n, 13n]
    for (const a of bases) {
      if (a >= n) continue
      let d = n - 1n
      let r = 0
      while (d % 2n === 0n) { d /= 2n; r++ }
      let x = PollardRho.modPow(a, d, n)
      if (x === 1n || x === n - 1n) continue
      let composite = true
      for (let i = 0; i < r - 1; i++) {
        x = (x * x) % n
        if (x === n - 1n) { composite = false; break }
      }
      if (composite) return false
    }
    return true
  }

  private static modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let result = 1n
    let b = base % mod
    let e = exp
    while (e > 0n) {
      if (e % 2n === 1n) result = (result * b) % mod
      e /= 2n
      b = (b * b) % mod
    }
    return result
  }
}
