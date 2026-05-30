export class RangeUpdatePointQuery {
  private readonly diff: number[]
  readonly length: number

  constructor(n: number) {
    this.length = n
    this.diff = new Array(n + 1).fill(0)
  }

  addRange(l: number, r: number, val: number): void {
    if (l < 0 || r >= this.length || l > r) return
    this.diff[l]! += val
    this.diff[r + 1]! -= val
  }

  addPoint(idx: number, val: number): void {
    this.addRange(idx, idx, val)
  }

  get(idx: number): number {
    if (idx < 0 || idx >= this.length) return 0
    let sum = 0
    for (let i = 0; i <= idx; i++) {
      sum += this.diff[i]!
    }
    return sum
  }

  build(): number[] {
    const result = new Array(this.length).fill(0)
    let running = 0
    for (let i = 0; i < this.length; i++) {
      running += this.diff[i]!
      result[i] = running
    }
    return result
  }

  reset(): void {
    this.diff.fill(0)
  }
}
