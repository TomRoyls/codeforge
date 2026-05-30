export class DiscreteSampler {
  private alias: number[]
  private prob: number[]
  private n: number

  constructor(weights: number[]) {
    this.n = weights.length
    this.alias = new Array(this.n).fill(0)
    this.prob = new Array(this.n).fill(0)
    this.buildTable(weights)
  }

  sample(): number {
    const column = Math.floor(Math.random() * this.n)
    return Math.random() < this.prob[column]! ? column : this.alias[column]!
  }

  sampleN(count: number): number[] {
    return Array.from({ length: count }, () => this.sample())
  }

  private buildTable(weights: number[]): void {
    const sum = weights.reduce((a, b) => a + b, 0)
    if (sum === 0) return
    const normalized = weights.map(w => (w / sum) * this.n)
    const small: number[] = []
    const large: number[] = []
    for (let i = 0; i < this.n; i++) {
      if (normalized[i]! < 1) {
        small.push(i)
      } else {
        large.push(i)
      }
    }
    while (small.length > 0 && large.length > 0) {
      const s = small.pop()!
      const l = large.pop()!
      this.prob[s] = normalized[s]!
      this.alias[s] = l
      normalized[l] = normalized[l]! + normalized[s]! - 1
      if (normalized[l]! < 1) {
        small.push(l)
      } else {
        large.push(l)
      }
    }
    while (large.length > 0) {
      this.prob[large.pop()!] = 1
    }
    while (small.length > 0) {
      this.prob[small.pop()!] = 1
    }
  }
}
