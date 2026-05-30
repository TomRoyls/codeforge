export class WeightedRandom {
  private items: string[] = []
  private weights: number[] = []
  private alias: number[] = []
  private prob: number[] = []
  private built = false

  get size(): number {
    return this.items.length
  }

  get totalWeight(): number {
    return this.weights.reduce((sum, w) => sum + w, 0)
  }

  add(item: string, weight: number): void {
    if (weight <= 0) {
      throw new Error('Weight must be greater than 0')
    }
    if (this.built) {
      throw new Error('Cannot add items after build() is called')
    }
    this.items.push(item)
    this.weights.push(weight)
  }

  build(): void {
    if (this.items.length === 0) {
      throw new Error('Cannot build empty sampler')
    }
    this.built = false
    const n = this.size
    this.alias = new Array(n).fill(0)
    this.prob = new Array(n).fill(0)

    const totalWeight = this.totalWeight
    const scaledProb: number[] = []

    for (let i = 0; i < n; i++) {
      scaledProb[i] = (this.weights[i]! / totalWeight) * n
    }

    const small: number[] = []
    const large: number[] = []

    for (let i = 0; i < n; i++) {
      if (scaledProb[i]! < 1) {
        small.push(i)
      } else {
        large.push(i)
      }
    }

    while (small.length > 0 && large.length > 0) {
      const s = small.pop()!
      const l = large.pop()!
      this.prob[s] = scaledProb[s]!
      this.alias[s] = l
      scaledProb[l] = scaledProb[l]! + scaledProb[s]! - 1
      if (scaledProb[l]! < 1) {
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

    this.built = true
  }

  sample(): string {
    if (!this.built) {
      throw new Error('Must call build() before sample()')
    }
    if (this.size === 0) {
      throw new Error('Cannot sample from empty sampler')
    }
    const column = Math.floor(Math.random() * this.size)
    return Math.random() < this.prob[column]! ? this.items[column]! : this.items[this.alias[column]!]!
  }

  sampleMultiple(count: number): string[] {
    const result: string[] = []
    for (let i = 0; i < count; i++) {
      result.push(this.sample())
    }
    return result
  }

  probability(item: string): number {
    if (!this.built) {
      throw new Error('Must call build() before probability()')
    }
    const index = this.items.indexOf(item)
    if (index === -1) {
      return 0
    }
    return this.weights[index]! / this.totalWeight
  }

  clear(): void {
    this.items = []
    this.weights = []
    this.alias = []
    this.prob = []
    this.built = false
  }
}
