export class WeightedRandom<T> {
  private items: Array<{ item: T; weight: number; cumulative: number }> = []
  private totalWeight = 0

  add(item: T, weight: number): void {
    if (weight <= 0) return
    this.totalWeight += weight
    this.items.push({ item, weight, cumulative: this.totalWeight })
  }

  sample(): T | undefined {
    if (this.items.length === 0) return undefined
    const r = Math.random() * this.totalWeight
    for (const entry of this.items) {
      if (r <= entry.cumulative) return entry.item
    }
    return this.items[this.items.length - 1]!.item
  }

  sampleN(count: number): T[] {
    const result: T[] = []
    for (let i = 0; i < count; i++) {
      const s = this.sample()
      if (s !== undefined) result.push(s)
    }
    return result
  }

  get size(): number { return this.items.length }
  get isEmpty(): boolean { return this.items.length === 0 }
  get total(): number { return this.totalWeight }

  clear(): void { this.items = []; this.totalWeight = 0 }

  toArray(): Array<{ item: T; weight: number }> {
    return this.items.map(({ item, weight }) => ({ item, weight }))
  }

  toString(): string { return JSON.stringify({ items: this.size, totalWeight: this.totalWeight }) }
  toJSON(): Record<string, number> { return { items: this.size, totalWeight: this.totalWeight } }

  clone(): WeightedRandom<T> {
    const c = new WeightedRandom<T>()
    for (const { item, weight } of this.items) c.add(item, weight)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof WeightedRandom)) return false
    return this.size === other.size
  }
}
