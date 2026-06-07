export class HeavyHitters<T> {
  private readonly k: number
  private readonly counters: Map<T, number>

  constructor(k: number) {
    if (k < 1) throw new RangeError('k must be >= 1')
    this.k = k
    this.counters = new Map()
  }

  add(item: T, count: number = 1): void {
    if (count <= 0) return
    const current = this.counters.get(item)
    if (current !== undefined) {
      this.counters.set(item, current + count)
    } else if (this.counters.size < this.k) {
      this.counters.set(item, count)
    } else {
      const entries = [...this.counters.entries()]
      for (const [key, val] of entries) {
        const newVal = val - count
        if (newVal <= 0) {
          this.counters.delete(key)
        } else {
          this.counters.set(key, newVal)
        }
      }
      if (this.counters.size < this.k) {
        this.counters.set(item, count)
      }
    }
  }

  getHitters(): Map<T, number> {
    return new Map(this.counters)
  }

  getItems(): T[] {
    return [...this.counters.keys()]
  }

  getCount(item: T): number {
    return this.counters.get(item) ?? 0
  }

  get size(): number {
    return this.counters.size
  }

  clear(): void {
    this.counters.clear()
  }

  toString(): string {
    return `HeavyHitters(${this.k}, ${this.counters.size})`
  }

  toJSON(): unknown {
    return [...this.counters.entries()]
  }

  clone(): HeavyHitters<T> {
    const copy = new HeavyHitters<T>(this.k)
    for (const [k, v] of this.counters) {
      copy.counters.set(k, v)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof HeavyHitters)) return false
    if (this.k !== other.k) return false
    if (this.counters.size !== other.counters.size) return false
    for (const [k, v] of this.counters) {
      if (other.counters.get(k) !== v) return false
    }
    return true
  }
}
