export class ShuffleBag<T> {
  private items: T[] = []
  private cursor = 0

  add(item: T, count = 1): void {
    for (let i = 0; i < count; i++) this.items.push(item)
  }

  next(): T | undefined {
    if (this.items.length === 0) return undefined
    if (this.cursor >= this.items.length) {
      this.shuffle()
      this.cursor = 0
    }
    return this.items[this.cursor++]!
  }

  private shuffle(): void {
    for (let i = this.items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.items[i], this.items[j]] = [this.items[j]!, this.items[i]!]
    }
  }

  get size(): number { return this.items.length }
  get isEmpty(): boolean { return this.items.length === 0 }
  get remaining(): number { return this.items.length - this.cursor }

  clear(): void { this.items = []; this.cursor = 0 }

  toArray(): T[] { return [...this.items] }
  toString(): string { return JSON.stringify({ size: this.size, remaining: this.remaining }) }
  toJSON(): Record<string, number> { return { size: this.size, remaining: this.remaining } }

  clone(): ShuffleBag<T> {
    const c = new ShuffleBag<T>()
    c.items = [...this.items]
    c.cursor = this.cursor
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ShuffleBag)) return false
    return this.size === other.size
  }
}
