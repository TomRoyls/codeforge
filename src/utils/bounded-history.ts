export class BoundedHistory<T> {
  private items: T[] = []
  private maxSize: number

  constructor(maxSize: number) {
    if (maxSize < 1) throw new RangeError('maxSize must be >= 1')
    this.maxSize = maxSize
  }

  push(item: T): void {
    if (this.items.length >= this.maxSize) {
      this.items.shift()
    }
    this.items.push(item)
  }

  get latest(): T | undefined {
    return this.items[this.items.length - 1]
  }

  get oldest(): T | undefined {
    return this.items[0]
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

  at(index: number): T | undefined {
    if (index < 0 || index >= this.items.length) return undefined
    return this.items[index]
  }

  slice(start: number, end?: number): T[] {
    return this.items.slice(start, end)
  }

  contains(predicate: (item: T) => boolean): boolean {
    return this.items.some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate)
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate)
  }

  reduce<U>(fn: (acc: U, item: T) => U, initial: U): U {
    return this.items.reduce(fn, initial)
  }

  clear(): void {
    this.items = []
  }

  toArray(): T[] {
    return [...this.items]
  }

  toString(): string {
    return JSON.stringify(this.items)
  }

  toJSON(): T[] {
    return this.toArray()
  }

  clone(): BoundedHistory<T> {
    const copy = new BoundedHistory<T>(this.maxSize)
    copy.items = [...this.items]
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BoundedHistory)) return false
    if (this.items.length !== other.items.length) return false
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i] !== other.items[i]) return false
    }
    return true
  }
}
