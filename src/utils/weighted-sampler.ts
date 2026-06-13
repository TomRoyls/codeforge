export class WeightedSampler<T> {
  private entries: Array<{ item: T; weight: number; cumulative: number }> = []
  private totalWeight = 0

  add(item: T, weight: number): void {
    if (weight <= 0) return
    this.totalWeight += weight
    this.entries.push({ item, weight, cumulative: this.totalWeight })
  }

  sample(): T | undefined {
    if (this.entries.length === 0) return undefined
    const r = Math.random() * this.totalWeight
    let lo = 0, hi = this.entries.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.entries[mid]!.cumulative < r) lo = mid + 1
      else hi = mid
    }
    return this.entries[lo]!.item
  }

  sampleN(n: number): T[] {
    const result: T[] = []
    for (let i = 0; i < n; i++) {
      const s = this.sample()
      if (s !== undefined) result.push(s)
    }
    return result
  }

  get size(): number {
    return this.entries.length
  }

  get isEmpty(): boolean {
    return this.entries.length === 0
  }

  get total(): number {
    return this.totalWeight
  }

  probabilityOf(item: T): number {
    const entry = this.entries.find((e) => e.item === item)
    return entry ? entry.weight / this.totalWeight : 0
  }

  clear(): void {
    this.entries = []
    this.totalWeight = 0
  }

  toArray(): Array<[T, number]> {
    return this.entries.map((e) => [e.item, e.weight])
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): Array<[T, number]> {
    return this.toArray()
  }

  clone(): WeightedSampler<T> {
    const copy = new WeightedSampler<T>()
    for (const { item, weight } of this.entries) copy.add(item, weight)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof WeightedSampler)) return false
    return this.size === other.size && this.totalWeight === other.totalWeight
  }
}
