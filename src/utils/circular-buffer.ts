export class CircularBuffer<T> {
  private readonly buffer: (T | undefined)[]
  private readPtr: number = 0
  private writePtr: number = 0
  private _size: number = 0
  private readonly _capacity: number

  constructor(capacity: number) {
    if (capacity < 1) {
      throw new RangeError(`Capacity must be > 0, got ${capacity}`)
    }
    this._capacity = capacity
    this.buffer = new Array(capacity).fill(undefined)
  }

  write(value: T): T | undefined {
    let overwritten: T | undefined
    if (this._size === this._capacity) {
      overwritten = this.buffer[this.readPtr]
      this.readPtr = (this.readPtr + 1) % this._capacity
    } else {
      this._size++
    }
    this.buffer[this.writePtr] = value
    this.writePtr = (this.writePtr + 1) % this._capacity
    return overwritten
  }

  read(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.buffer[this.readPtr]
    this.buffer[this.readPtr] = undefined
    this.readPtr = (this.readPtr + 1) % this._capacity
    this._size--
    return value
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.readPtr]
  }

  peekNewest(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[(this.writePtr - 1 + this._capacity) % this._capacity]
  }

  isFull(): boolean {
    return this._size === this._capacity
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.buffer.fill(undefined)
    this.readPtr = 0
    this.writePtr = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this.readPtr + i) % this._capacity]!)
    }
    return result
  }

  toArrayNewest(): T[] {
    const result: T[] = []
    for (let i = this._size - 1; i >= 0; i--) {
      result.push(this.buffer[(this.readPtr + i) % this._capacity]!)
    }
    return result
  }
}
