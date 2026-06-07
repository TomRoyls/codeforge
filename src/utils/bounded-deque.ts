export class BoundedDeque<T> {
  private readonly buffer: (T | undefined)[]
  private head = 0
  private tail = 0
  private _size = 0
  private _evictions = 0

  constructor(private readonly capacity: number) {
    if (capacity < 1) throw new RangeError('capacity must be >= 1')
    this.buffer = new Array(capacity)
  }

  pushFront(value: T): T | undefined {
    let evicted: T | undefined
    if (this._size === this.capacity) {
      this.tail = (this.tail - 1 + this.capacity) % this.capacity
      evicted = this.buffer[this.tail]
      this._size--
      this._evictions++
    }
    this.head = (this.head - 1 + this.capacity) % this.capacity
    this.buffer[this.head] = value
    this._size++
    return evicted
  }

  pushBack(value: T): T | undefined {
    let evicted: T | undefined
    if (this._size === this.capacity) {
      evicted = this.buffer[this.head]
      this.head = (this.head + 1) % this.capacity
      this._size--
      this._evictions++
    }
    this.buffer[this.tail] = value
    this.tail = (this.tail + 1) % this.capacity
    this._size++
    return evicted
  }

  popFront(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this.capacity
    this._size--
    return value
  }

  popBack(): T | undefined {
    if (this._size === 0) return undefined
    this.tail = (this.tail - 1 + this.capacity) % this.capacity
    const value = this.buffer[this.tail]
    this.buffer[this.tail] = undefined
    this._size--
    return value
  }

  front(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]
  }

  back(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[(this.tail - 1 + this.capacity) % this.capacity]
  }

  get size(): number {
    return this._size
  }

  getCapacity(): number {
    return this.capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  isFull(): boolean {
    return this._size === this.capacity
  }

  get evictions(): number {
    return this._evictions
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const idx = (this.head + i) % this.capacity
      result.push(this.buffer[idx]!)
    }
    return result
  }

  clear(): void {
    this.buffer.fill(undefined)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toString(): string {
    return `[${this.toArray().map(v => String(v)).join(', ')}]`
  }

  toJSON(): T[] {
    return this.toArray()
  }

  clone(): this {
    const c = new BoundedDeque<T>(this.capacity)
    for (const v of this.toArray()) {
      c.pushBack(v)
    }
    c._evictions = this._evictions
    return c as this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof BoundedDeque)) return false
    if (this.capacity !== other.capacity) return false
    if (this._size !== other._size) return false
    if (this._evictions !== other._evictions) return false
    const a = this.toArray()
    const b = other.toArray()
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false
    }
    return true
  }
}
