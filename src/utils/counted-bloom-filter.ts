export class CountedBloomFilter {
  private counters: number[]
  private readonly numBits: number
  private readonly numHashes: number

  constructor(expectedItems: number = 1000, falsePositiveRate: number = 0.01) {
    const ln2 = Math.log(2)
    const numBits = Math.ceil(-(expectedItems * Math.log(falsePositiveRate)) / (ln2 * ln2))
    const numHashes = Math.ceil((numBits / expectedItems) * ln2)
    this.numBits = numBits
    this.numHashes = Math.max(numHashes, 1)
    this.counters = new Array<number>(numBits).fill(0)
  }

  private hash(item: string, seed: number): number {
    let h = seed
    for (let i = 0; i < item.length; i++) {
      h = ((h << 5) - h + item.charCodeAt(i) + seed) | 0
    }
    return Math.abs(h) % this.numBits
  }

  add(item: string): void {
    for (let i = 0; i < this.numHashes; i++) {
      const idx = this.hash(item, i)
      this.counters[idx]!++
    }
  }

  remove(item: string): boolean {
    if (!this.contains(item)) return false
    for (let i = 0; i < this.numHashes; i++) {
      const idx = this.hash(item, i)
      if (this.counters[idx]! > 0) this.counters[idx]!--
    }
    return true
  }

  contains(item: string): boolean {
    for (let i = 0; i < this.numHashes; i++) {
      if (this.counters[this.hash(item, i)]! === 0) return false
    }
    return true
  }

  count(item: string): number {
    let minCount = Infinity
    for (let i = 0; i < this.numHashes; i++) {
      const c = this.counters[this.hash(item, i)]!
      if (c < minCount) minCount = c
    }
    return minCount === Infinity ? 0 : minCount
  }
}
