export class DifferenceArray {
  private diff: number[]
  private n: number

  constructor(size: number) {
    this.n = size
    this.diff = new Array(size + 1).fill(0)
  }

  rangeAdd(l: number, r: number, val: number): void {
    if (l < 0 || r >= this.n || l > r) return
    this.diff[l]! += val
    this.diff[r + 1]! -= val
  }

  pointAdd(idx: number, val: number): void {
    this.rangeAdd(idx, idx, val)
  }

  toArray(): number[] {
    const result = new Array(this.n).fill(0)
    let prefix = 0
    for (let i = 0; i < this.n; i++) {
      prefix += this.diff[i]!
      result[i] = prefix
    }
    return result
  }

  get(idx: number): number {
    let sum = 0
    for (let i = 0; i <= idx; i++) {
      sum += this.diff[i]!
    }
    return sum
  }

  get length(): number {
    return this.n
  }
}
