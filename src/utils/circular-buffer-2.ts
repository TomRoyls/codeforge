export class CircularBuffer2<T> {
  private buffer: (T | undefined)[]
  private head = 0
  private count = 0

  constructor(capacity: number) {
    this.buffer = new Array(capacity).fill(undefined)
  }

  write(item: T): void {
    const idx = (this.head + this.count) % this.buffer.length
    this.buffer[idx] = item
    if (this.count < this.buffer.length) this.count++
    else this.head = (this.head + 1) % this.buffer.length
  }

  read(): T | undefined {
    if (this.count === 0) return undefined
    const item = this.buffer[this.head]
    this.head = (this.head + 1) % this.buffer.length
    this.count--
    return item
  }

  peek(): T | undefined {
    return this.count === 0 ? undefined : this.buffer[this.head]
  }

  get capacity(): number { return this.buffer.length }
  get size(): number { return this.count }
  get isEmpty(): boolean { return this.count === 0 }
  get isFull(): boolean { return this.count === this.buffer.length }

  clear(): void { this.buffer.fill(undefined); this.head = 0; this.count = 0 }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.count; i++) result.push(this.buffer[(this.head + i) % this.buffer.length]!)
    return result
  }

  toString(): string { return JSON.stringify({ size: this.count, capacity: this.buffer.length }) }
  toJSON(): Record<string, number> { return { size: this.count, capacity: this.buffer.length } }

  clone(): CircularBuffer2<T> {
    const c = new CircularBuffer2<T>(this.buffer.length)
    c.buffer = [...this.buffer]
    c.head = this.head
    c.count = this.count
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof CircularBuffer2)) return false
    return this.count === other.count && this.capacity === other.capacity
  }
}
