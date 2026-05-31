export class CircularSuffix {
  private sa: number[]

  private constructor(sa: number[]) {
    this.sa = sa
  }

  static build(s: string): CircularSuffix {
    const n = s.length
    const sa: number[] = Array.from({ length: n }, (_, i) => i)
    sa.sort((a, b) => {
      for (let k = 0; k < n; k++) {
        const ca = s[(a + k) % n]!
        const cb = s[(b + k) % n]!
        if (ca < cb) return -1
        if (ca > cb) return 1
      }
      return 0
    })
    return new CircularSuffix(sa)
  }

  suffixArray(): number[] {
    return [...this.sa]
  }

  rank(i: number): number {
    return this.sa.indexOf(i)
  }

  index(r: number): number {
    return this.sa[r]!
  }

  get length(): number {
    return this.sa.length
  }
}
