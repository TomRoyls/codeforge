export class BoundedBuffer2<T> {
  private buffer: (T | undefined)[]
  private head = 0
  private tail = 0
  private _size = 0
  private capacity: number

  constructor(capacity: number) {
    this.capacity = Math.max(1, capacity)
    this.buffer = new Array(this.capacity)
  }

  push(value: T): void {
    if (this._size === this.capacity) {
      this.buffer[this.head] = value
      this.head = (this.head + 1) % this.capacity
      this.tail = (this.tail + 1) % this.capacity
    } else {
      this.buffer[this.tail] = value
      this.tail = (this.tail + 1) % this.capacity
      this._size++
    }
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined
    this.tail = (this.tail - 1 + this.capacity) % this.capacity
    const value = this.buffer[this.tail]
    this.buffer[this.tail] = undefined
    this._size--
    return value
  }

  shift(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this.capacity
    this._size--
    return value
  }

  peek(): T | undefined {
    return this._size === 0 ? undefined : this.buffer[this.head]
  }

  peekLast(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[(this.tail - 1 + this.capacity) % this.capacity]
  }

  get size(): number { return this._size }
  get isFull(): boolean { return this._size === this.capacity }
  get isEmpty(): boolean { return this._size === 0 }

  clear(): void {
    this.buffer = new Array(this.capacity)
    this.head = 0; this.tail = 0; this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this.head + i) % this.capacity] as T)
    }
    return result
  }

  toString(): string { return JSON.stringify({ size: this._size, capacity: this.capacity }) }
  toJSON(): Record<string, number> { return { size: this._size, capacity: this.capacity } }
  clone(): BoundedBuffer2<T> {
    const c = new BoundedBuffer2<T>(this.capacity)
    for (const v of this.toArray()) c.push(v)
    return c
  }
  equals(other: unknown): boolean { return other instanceof BoundedBuffer2 }
}
