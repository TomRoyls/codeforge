export class RingArray2<T> {
  private data: (T | undefined)[]
  private start = 0
  private count = 0
  private cap: number

  constructor(capacity: number) {
    this.cap = Math.max(1, capacity)
    this.data = new Array(this.cap)
  }

  enqueue(value: T): void {
    if (this.count < this.cap) {
      const idx = (this.start + this.count) % this.cap
      this.data[idx] = value
      this.count++
    } else {
      this.data[this.start] = value
      this.start = (this.start + 1) % this.cap
    }
  }

  dequeue(): T | undefined {
    if (this.count === 0) return undefined
    const value = this.data[this.start]
    this.data[this.start] = undefined
    this.start = (this.start + 1) % this.cap
    this.count--
    return value
  }

  front(): T | undefined {
    return this.count === 0 ? undefined : this.data[this.start]
  }

  back(): T | undefined {
    if (this.count === 0) return undefined
    return this.data[(this.start + this.count - 1) % this.cap]
  }

  rotate(): void {
    if (this.count > 0) {
      const front = this.data[this.start]
      this.data[this.start] = undefined
      const end = (this.start + this.count - 1) % this.cap
      this.start = (this.start + 1) % this.cap
      this.data[(end + 1) % this.cap] = front
    }
  }

  get size(): number { return this.count }
  get capacity(): number { return this.cap }
  get isEmpty(): boolean { return this.count === 0 }
  get isFull(): boolean { return this.count === this.cap }

  clear(): void {
    this.data = new Array(this.cap)
    this.start = 0; this.count = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.count; i++) {
      result.push(this.data[(this.start + i) % this.cap] as T)
    }
    return result
  }

  toString(): string { return JSON.stringify({ size: this.count, capacity: this.cap }) }
  toJSON(): Record<string, number> { return { size: this.count, capacity: this.cap } }
  clone(): RingArray2<T> {
    const c = new RingArray2<T>(this.cap)
    for (const v of this.toArray()) c.enqueue(v)
    return c
  }
  equals(other: unknown): boolean { return other instanceof RingArray2 }
}
