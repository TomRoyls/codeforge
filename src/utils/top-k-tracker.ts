export class TopKTracker<T> {
  private counts = new Map<T, number>()
  private k: number

  constructor(k = 10) {
    this.k = k
  }

  add(item: T, count = 1): void {
    this.counts.set(item, (this.counts.get(item) ?? 0) + count)
  }

  top(): Array<[T, number]> {
    return Array.from(this.counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.k)
  }

  get size(): number {
    return this.counts.size
  }

  get isEmpty(): boolean {
    return this.counts.size === 0
  }

  count(item: T): number {
    return this.counts.get(item) ?? 0
  }

  has(item: T): boolean {
    return (this.counts.get(item) ?? 0) > 0
  }

  merge(other: TopKTracker<T>): void {
    for (const [item, count] of other.counts) {
      this.add(item, count)
    }
  }

  clear(): void {
    this.counts.clear()
  }

  toArray(): Array<[T, number]> {
    return this.top()
  }

  toString(): string {
    return JSON.stringify(this.top())
  }

  toJSON(): Array<[T, number]> {
    return this.top()
  }

  clone(): TopKTracker<T> {
    const copy = new TopKTracker<T>(this.k)
    copy.counts = new Map(this.counts)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TopKTracker)) return false
    return this.size === other.size
  }
}
