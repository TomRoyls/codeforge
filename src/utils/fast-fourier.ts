export class FastFourierTransform {
  static transform(a: { re: number; im: number }[], invert: boolean = false): { re: number; im: number }[] {
    const n = a.length
    if (n === 1) return [{ re: a[0]!.re, im: a[0]!.im }]
    const result = a.map(x => ({ re: x.re, im: x.im }))
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
      const ang = (2 * Math.PI / len) * (invert ? -1 : 1)
      const wlen = { re: Math.cos(ang), im: Math.sin(ang) }
      for (let i = 0; i < n; i += len) {
        let w = { re: 1, im: 0 }
        for (let j = 0; j < len / 2; j++) {
          const u = result[i + j]!
          const v = FastFourierTransform.mul(result[i + j + len / 2]!, w)
          result[i + j] = { re: u.re + v.re, im: u.im + v.im }
          result[i + j + len / 2] = { re: u.re - v.re, im: u.im - v.im }
          w = FastFourierTransform.mul(w, wlen)
        }
      }
    }
    if (invert) {
      for (let i = 0; i < n; i++) {
        result[i]!.re /= n
        result[i]!.im /= n
      }
    }
    return result
  }

  private static mul(a: { re: number; im: number }, b: { re: number; im: number }): { re: number; im: number } {
    return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }
  }

  static multiplyPolynomials(a: number[], b: number[]): number[] {
    let n = 1
    while (n < a.length + b.length) n <<= 1
    const fa: { re: number; im: number }[] = Array.from({ length: n }, (_, i) => ({
      re: i < a.length ? a[i]! : 0,
      im: 0,
    }))
    const fb: { re: number; im: number }[] = Array.from({ length: n }, (_, i) => ({
      re: i < b.length ? b[i]! : 0,
      im: 0,
    }))
    const ta = FastFourierTransform.transform(fa)
    const tb = FastFourierTransform.transform(fb)
    const fc = ta.map((a, i) => FastFourierTransform.mul(a, tb[i]!))
    const result = FastFourierTransform.transform(fc, true)
    const c: number[] = []
    for (let i = 0; i < a.length + b.length - 1; i++) {
      c.push(Math.round(result[i]!.re))
    }
    return c
  }
}
