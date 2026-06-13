export class RingBufferTyped {
  private buffer: Float64Array
  private head = 0
  private count = 0

  constructor(capacity: number) {
    this.buffer = new Float64Array(capacity)
  }

  push(value: number): void {
    this.buffer[this.head] = value
    this.head = (this.head + 1) % this.buffer.length
    if (this.count < this.buffer.length) this.count++
  }

  get(index: number): number | undefined {
    if (index < 0 || index >= this.count) return undefined
    const start = this.count < this.buffer.length ? 0 : this.head
    return this.buffer[(start + index) % this.buffer.length]
  }

  get capacity(): number { return this.buffer.length }
  get size(): number { return this.count }
  get isEmpty(): boolean { return this.count === 0 }
  get isFull(): boolean { return this.count === this.buffer.length }

  sum(): number {
    let s = 0
    for (let i = 0; i < this.count; i++) s += this.get(i)!
    return s
  }

  avg(): number { return this.count === 0 ? 0 : this.sum() / this.count }

  clear(): void { this.buffer.fill(0); this.head = 0; this.count = 0 }

  toArray(): number[] {
    const result: number[] = []
    for (let i = 0; i < this.count; i++) result.push(this.get(i)!)
    return result
  }

  toString(): string { return JSON.stringify({ size: this.count, capacity: this.capacity }) }
  toJSON(): Record<string, number> { return { size: this.count, capacity: this.capacity } }

  clone(): RingBufferTyped {
    const c = new RingBufferTyped(this.capacity)
    c.buffer = new Float64Array(this.buffer)
    c.head = this.head
    c.count = this.count
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RingBufferTyped)) return false
    return this.capacity === other.capacity
  }
}
