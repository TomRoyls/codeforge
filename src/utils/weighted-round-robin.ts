export class WeightedRoundRobin<T> {
  private items: Array<{ item: T; weight: number }> = []
  private currentIndex = 0
  private currentWeight = 0
  private maxWeight = 0
  private gcd = 0

  add(item: T, weight: number): void {
    if (weight <= 0) return
    this.items.push({ item, weight })
    this.maxWeight = Math.max(this.maxWeight, weight)
    this.gcd = this.computeGcd()
  }

  next(): T | undefined {
    if (this.items.length === 0) return undefined
    while (true) {
      this.currentIndex = (this.currentIndex + 1) % this.items.length
      if (this.currentIndex === 0) {
        this.currentWeight -= this.gcd
        if (this.currentWeight <= 0) this.currentWeight = this.maxWeight
      }
      if (this.items[this.currentIndex]!.weight >= this.currentWeight) {
        return this.items[this.currentIndex]!.item
      }
    }
  }

  get size(): number { return this.items.length }
  get isEmpty(): boolean { return this.items.length === 0 }

  clear(): void { this.items = []; this.currentIndex = 0; this.currentWeight = 0; this.maxWeight = 0; this.gcd = 0 }

  toArray(): Array<{ item: T; weight: number }> { return [...this.items] }
  toString(): string { return JSON.stringify({ size: this.size }) }
  toJSON(): Record<string, number> { return { size: this.size } }

  clone(): WeightedRoundRobin<T> {
    const c = new WeightedRoundRobin<T>()
    c.items = this.items.map((e) => ({ ...e }))
    c.maxWeight = this.maxWeight
    c.gcd = this.gcd
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof WeightedRoundRobin)) return false
    return this.size === other.size
  }

  private computeGcd(): number {
    if (this.items.length === 0) return 0
    let g = this.items[0]!.weight
    for (let i = 1; i < this.items.length; i++) {
      let a = g, b = this.items[i]!.weight
      while (b) { [a, b] = [b, a % b] }
      g = a
    }
    return g
  }
}
