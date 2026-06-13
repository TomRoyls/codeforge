export class RingBuffer3<T> {
  private buffer: (T | undefined)[]
  private head = 0
  private tail = 0
  private count = 0
  readonly capacity: number

  constructor(capacity: number) {
    this.capacity = capacity
    this.buffer = new Array(capacity).fill(undefined)
  }

  push(item: T): void {
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this.capacity
    if (this.count < this.capacity) this.count++
    else this.head = (this.head + 1) % this.capacity
  }

  shift(): T | undefined {
    if (this.count === 0) return undefined
    const item = this.buffer[this.head]
    this.head = (this.head + 1) % this.capacity
    this.count--
    return item
  }

  peek(): T | undefined {
    return this.count === 0 ? undefined : this.buffer[this.head]
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.count) return undefined
    return this.buffer[(this.head + index) % this.capacity]
  }

  get size(): number { return this.count }
  get isEmpty(): boolean { return this.count === 0 }
  get isFull(): boolean { return this.count === this.capacity }

  clear(): void {
    this.buffer.fill(undefined)
    this.head = 0
    this.tail = 0
    this.count = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.count; i++) {
      result.push(this.buffer[(this.head + i) % this.capacity]!)
    }
    return result
  }

  toString(): string { return JSON.stringify({ size: this.count, capacity: this.capacity }) }
  toJSON(): Record<string, number> { return { size: this.count, capacity: this.capacity } }

  clone(): RingBuffer3<T> {
    const c = new RingBuffer3<T>(this.capacity)
    for (const item of this.toArray()) c.push(item)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RingBuffer3)) return false
    return this.count === other.count && this.capacity === other.capacity
  }
}
