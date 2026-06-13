export class CircularDeque<T> {
  private buffer: (T | undefined)[]
  private head = 0
  private tail = 0
  private count = 0

  constructor(capacity: number) {
    this.buffer = new Array(capacity).fill(undefined)
  }

  pushFront(item: T): boolean {
    if (this.count === this.buffer.length) return false
    this.head = (this.head - 1 + this.buffer.length) % this.buffer.length
    this.buffer[this.head] = item
    this.count++
    return true
  }

  pushBack(item: T): boolean {
    if (this.count === this.buffer.length) return false
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this.buffer.length
    this.count++
    return true
  }

  popFront(): T | undefined {
    if (this.count === 0) return undefined
    const item = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this.buffer.length
    this.count--
    return item
  }

  popBack(): T | undefined {
    if (this.count === 0) return undefined
    this.tail = (this.tail - 1 + this.buffer.length) % this.buffer.length
    const item = this.buffer[this.tail]
    this.buffer[this.tail] = undefined
    this.count--
    return item
  }

  peekFront(): T | undefined { return this.count === 0 ? undefined : this.buffer[this.head] }
  peekBack(): T | undefined { return this.count === 0 ? undefined : this.buffer[(this.tail - 1 + this.buffer.length) % this.buffer.length] }

  get size(): number { return this.count }
  get capacity(): number { return this.buffer.length }
  get isEmpty(): boolean { return this.count === 0 }
  get isFull(): boolean { return this.count === this.buffer.length }

  clear(): void { this.buffer.fill(undefined); this.head = 0; this.tail = 0; this.count = 0 }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.count; i++) result.push(this.buffer[(this.head + i) % this.buffer.length]!)
    return result
  }

  toString(): string { return JSON.stringify({ size: this.count, capacity: this.buffer.length }) }
  toJSON(): Record<string, number> { return { size: this.count, capacity: this.buffer.length } }

  clone(): CircularDeque<T> {
    const c = new CircularDeque<T>(this.buffer.length)
    c.buffer = [...this.buffer]
    c.head = this.head; c.tail = this.tail; c.count = this.count
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof CircularDeque)) return false
    return this.count === other.count && this.capacity === other.capacity
  }
}
