export class RingSet2<T> {
  private items: T[] = []
  private capacity: number

  constructor(capacity: number) {
    this.capacity = capacity
  }

  add(item: T): void {
    const idx = this.items.indexOf(item)
    if (idx !== -1) this.items.splice(idx, 1)
    this.items.push(item)
    if (this.items.length > this.capacity) this.items.shift()
  }

  has(item: T): boolean { return this.items.includes(item) }

  remove(item: T): boolean {
    const idx = this.items.indexOf(item)
    if (idx !== -1) { this.items.splice(idx, 1); return true }
    return false
  }

  mostRecent(): T | undefined { return this.items[this.items.length - 1] }
  leastRecent(): T | undefined { return this.items[0] }

  get size(): number { return this.items.length }
  get isEmpty(): boolean { return this.items.length === 0 }

  clear(): void { this.items = [] }

  toArray(): T[] { return [...this.items] }
  toString(): string { return JSON.stringify({ size: this.items.length, capacity: this.capacity }) }
  toJSON(): Record<string, number> { return { size: this.items.length, capacity: this.capacity } }

  clone(): RingSet2<T> {
    const c = new RingSet2<T>(this.capacity)
    c.items = [...this.items]
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RingSet2)) return false
    return this.size === other.size
  }
}
