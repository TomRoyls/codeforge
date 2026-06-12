export class RingSet<T> {
  private items: T[] = []
  private maxSize: number
  private index = 0

  constructor(maxSize: number) {
    if (maxSize < 1) throw new RangeError('maxSize must be >= 1')
    this.maxSize = maxSize
  }

  add(value: T): void {
    const existing = this.items.indexOf(value)
    if (existing !== -1) {
      this.items.splice(existing, 1)
    }
    if (this.items.length >= this.maxSize) {
      this.items.shift()
    }
    this.items.push(value)
  }

  has(value: T): boolean {
    return this.items.includes(value)
  }

  delete(value: T): boolean {
    const idx = this.items.indexOf(value)
    if (idx === -1) return false
    this.items.splice(idx, 1)
    return true
  }

  get size(): number {
    return this.items.length
  }

  get capacity(): number {
    return this.maxSize
  }

  get isFull(): boolean {
    return this.items.length >= this.maxSize
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }

  peekOldest(): T | undefined {
    return this.items[0]
  }

  toArray(): T[] {
    return [...this.items]
  }

  clear(): void {
    this.items = []
    this.index = 0
  }

  forEach(callback: (value: T, index: number) => void): void {
    this.items.forEach(callback)
  }

  toString(): string {
    return JSON.stringify(this.items)
  }

  toJSON(): T[] {
    return this.toArray()
  }

  clone(): RingSet<T> {
    const copy = new RingSet<T>(this.maxSize)
    copy.items = [...this.items]
    copy.index = this.index
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RingSet)) return false
    if (this.size !== other.size) return false
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i] !== other.items[i]) return false
    }
    return true
  }
}
