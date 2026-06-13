export class CryptoUtils2 {
  static xor(a: Uint8Array, b: Uint8Array): Uint8Array {
    const result = new Uint8Array(Math.min(a.length, b.length))
    for (let i = 0; i < result.length; i++) result[i] = a[i] ^ b[i]
    return result
  }

  static rotateLeft(value: number, shift: number, bits = 32): number {
    const mask = bits === 32 ? 0xFFFFFFFF : (1 << bits) - 1
    shift = shift % bits
    return (((value << shift) | (value >>> (bits - shift))) & mask) >>> 0
  }

  static rotateRight(value: number, shift: number, bits = 32): number {
    const mask = bits === 32 ? 0xFFFFFFFF : (1 << bits) - 1
    shift = shift % bits
    return (((value >>> shift) | (value << (bits - shift))) & mask) >>> 0
  }

  static popcount(n: number): number {
    let count = 0
    n = n >>> 0
    while (n) { count += n & 1; n = n >>> 1 }
    return count
  }

  static sha256Padding(messageLength: number): number {
    const bitLen = messageLength * 8
    const mod = bitLen % 512
    if (mod < 448) return 448 - mod
    return 512 - mod + 448
  }

  static modPow(base: number, exp: number, mod: number): number {
    let result = 1n
    let b = BigInt(base) % BigInt(mod)
    let e = BigInt(exp)
    const m = BigInt(mod)
    while (e > 0n) {
      if (e & 1n) result = (result * b) % m
      e = e >> 1n
      b = (b * b) % m
    }
    return Number(result)
  }

  static gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b)
    while (b) { [a, b] = [b, a % b] }
    return a
  }

  static modInverse(a: number, m: number): number {
    const result = CryptoUtils2.extendedGcd(((a % m) + m) % m, m)
    if (!result || result.gcd !== 1) return -1
    return ((result.x % m) + m) % m
  }

  private static extendedGcd(a: number, b: number): { x: number; y: number; gcd: number } | null {
    if (b === 0) return { x: 1, y: 0, gcd: a }
    const prev = CryptoUtils2.extendedGcd(b, a % b)
    if (!prev) return null
    return { x: prev.y, y: prev.x - Math.floor(a / b) * prev.y, gcd: prev.gcd }
  }

  toArray(): number[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): CryptoUtils2 { return new CryptoUtils2() }
  equals(other: unknown): boolean { return other instanceof CryptoUtils2 }
}
