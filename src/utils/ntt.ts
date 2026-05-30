export class NTT {
  private static modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let result = 1n
    let b = base % mod
    let e = exp
    while (e > 0n) {
      if (e & 1n) result = (result * b) % mod
      e >>= 1n
      b = (b * b) % mod
    }
    return result
  }

  static transform(a: bigint[], mod: bigint = 998244353n, primitiveRoot: bigint = 3n, invert: boolean = false): bigint[] {
    const n = a.length
    const result = [...a]
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1
      while (j & bit) { j ^= bit; bit >>= 1 }
      j ^= bit
      if (i < j) {
        const tmp = result[i]!
        result[i] = result[j]!
        result[j] = tmp
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const w = invert
        ? NTT.modPow(primitiveRoot, mod - 1n - (mod - 1n) / BigInt(len), mod)
        : NTT.modPow(primitiveRoot, (mod - 1n) / BigInt(len), mod)
      for (let i = 0; i < n; i += len) {
        let wn = 1n
        for (let j = 0; j < len / 2; j++) {
          const u = result[i + j]!
          const v = (result[i + j + len / 2]! * wn) % mod
          result[i + j] = (u + v) % mod
          result[i + j + len / 2] = (u - v + mod) % mod
          wn = (wn * w) % mod
        }
      }
    }
    if (invert) {
      const nInv = NTT.modPow(BigInt(n), mod - 2n, mod)
      for (let i = 0; i < n; i++) {
        result[i] = (result[i]! * nInv) % mod
      }
    }
    return result
  }

  static multiplyPolynomials(a: bigint[], b: bigint[], mod: bigint = 998244353n, primitiveRoot: bigint = 3n): bigint[] {
    let n = 1
    while (n < a.length + b.length) n <<= 1
    const fa = [...a, ...new Array<bigint>(n - a.length).fill(0n)]
    const fb = [...b, ...new Array<bigint>(n - b.length).fill(0n)]
    const ta = NTT.transform(fa, mod, primitiveRoot)
    const tb = NTT.transform(fb, mod, primitiveRoot)
    const fc = ta.map((v, i) => (v * tb[i]!) % mod)
    const result = NTT.transform(fc, mod, primitiveRoot, true)
    return result.slice(0, a.length + b.length - 1)
  }
}
