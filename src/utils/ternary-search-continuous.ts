export class TernarySearchContinuous {
  static minimize(f: (x: number) => number, lo: number, hi: number, iterations: number = 200): number {
    for (let i = 0; i < iterations; i++) {
      const m1 = lo + (hi - lo) / 3
      const m2 = hi - (hi - lo) / 3
      if (f(m1) < f(m2)) {
        hi = m2
      } else {
        lo = m1
      }
    }
    return (lo + hi) / 2
  }

  static maximize(f: (x: number) => number, lo: number, hi: number, iterations: number = 200): number {
    return TernarySearchContinuous.minimize((x) => -f(x), lo, hi, iterations)
  }
}
