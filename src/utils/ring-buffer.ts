export interface RingBufferOptions {
  capacity: number
  allowOverwrite?: boolean
}

export class RingBuffer<T> {
  private readonly buffer: (T | undefined)[]
  private head: number = 0
  private tail: number = 0
  private _size: number = 0
  private readonly _capacity: number
  private readonly allowOverwrite: boolean

  constructor(options: RingBufferOptions | number) {
    if (typeof options === 'number') {
      this._capacity = options
      this.allowOverwrite = true
    } else {
      this._capacity = options.capacity
      this.allowOverwrite = options.allowOverwrite ?? true
    }
    if (this._capacity < 1) {
      throw new RangeError(`Capacity must be >= 1, got ${this._capacity}`)
    }
    this.buffer = new Array(this._capacity).fill(undefined)
  }

  push(value: T): boolean {
    if (this._size === this._capacity) {
      if (!this.allowOverwrite) return false
      this.buffer[this.head] = value
      this.head = (this.head + 1) % this._capacity
      this.tail = (this.tail + 1) % this._capacity
      return true
    }
    this.buffer[this.tail] = value
    this.tail = (this.tail + 1) % this._capacity
    this._size++
    return true
  }

  shift(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    return value
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined
    this.tail = (this.tail - 1 + this._capacity) % this._capacity
    const value = this.buffer[this.tail]
    this.buffer[this.tail] = undefined
    this._size--
    return value
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    return this.buffer[(this.head + index) % this._capacity]
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]
  }

  peekLast(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]
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

  isFull(): boolean {
    return this._size === this._capacity
  }

  clear(): void {
    this.buffer.fill(undefined)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this.head + i) % this._capacity]!)
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.buffer[(this.head + i) % this._capacity]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this.buffer[(this.head + i) % this._capacity]!
    }
  }

  static fromArray<T>(items: T[], options?: Omit<RingBufferOptions, 'capacity'> & { capacity?: number }): RingBuffer<T> {
    const capacity = options?.capacity ?? items.length
    const rb = new RingBuffer<T>({ ...options, capacity })
    for (const item of items) {
      rb.push(item)
    }
    return rb
  }
}
