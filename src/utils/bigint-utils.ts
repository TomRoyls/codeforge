export class BigIntUtils {
  static gcd(a: bigint, b: bigint): bigint {
    a = a < 0n ? -a : a
    b = b < 0n ? -b : b
    while (b > 0n) {
      const t = b
      b = a % b
      a = t
    }
    return a
  }

  static lcm(a: bigint, b: bigint): bigint {
    if (a === 0n || b === 0n) return 0n
    return (a < 0n ? -a : a) / BigIntUtils.gcd(a, b) * (b < 0n ? -b : b)
  }

  static modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    if (mod === 1n) return 0n
    let result = 1n
    base = ((base % mod) + mod) % mod
    while (exp > 0n) {
      if (exp & 1n) result = (result * base) % mod
      exp >>= 1n
      base = (base * base) % mod
    }
    return result
  }

  static factorial(n: number): bigint {
    let result = 1n
    for (let i = 2; i <= n; i++) result *= BigInt(i)
    return result
  }

  static binomial(n: number, k: number): bigint {
    if (k < 0 || k > n) return 0n
    if (k === 0 || k === n) return 1n
    k = Math.min(k, n - k)
    let result = 1n
    for (let i = 0; i < k; i++) {
      result = result * BigInt(n - i) / BigInt(i + 1)
    }
    return result
  }

  static fibonacci(n: number): bigint {
    if (n <= 1) return BigInt(n)
    let a = 0n
    let b = 1n
    for (let i = 2; i <= n; i++) {
      const t = a + b
      a = b
      b = t
    }
    return b
  }

  static isPrime(n: bigint): boolean {
    if (n < 2n) return false
    if (n < 4n) return true
    if (n % 2n === 0n || n % 3n === 0n) return false
    let i = 5n
    while (i * i <= n) {
      if (n % i === 0n || n % (i + 2n) === 0n) return false
      i += 6n
    }
    return true
  }

  static modInverse(a: bigint, m: bigint): bigint {
    const ext = BigIntUtils.extendedGcd(((a % m) + m) % m, m)
    if (ext.gcd !== 1n) throw new Error('Modular inverse does not exist')
    return ((ext.x % m) + m) % m
  }

  private static extendedGcd(a: bigint, b: bigint): { gcd: bigint; x: bigint; y: bigint } {
    if (b === 0n) return { gcd: a, x: 1n, y: 0n }
    const result = BigIntUtils.extendedGcd(b, a % b)
    return { gcd: result.gcd, x: result.y, y: result.x - (a / b) * result.y }
  }
}
