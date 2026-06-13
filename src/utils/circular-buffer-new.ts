export class CircularBufferNew<T> {
  private data: (T | undefined)[]
  private head = 0
  private tail = 0
  private _size = 0
  private capacity: number

  constructor(capacity: number) {
    this.capacity = capacity
    this.data = new Array(capacity)
  }

  push(item: T): T | undefined {
    const overwritten = this._size === this.capacity ? this.data[this.tail] : undefined
    this.data[this.tail] = item
    this.tail = (this.tail + 1) % this.capacity
    if (this._size === this.capacity) {
      this.head = (this.head + 1) % this.capacity
    } else {
      this._size++
    }
    return overwritten
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined
    this.tail = (this.tail - 1 + this.capacity) % this.capacity
    const item = this.data[this.tail]
    this.data[this.tail] = undefined
    this._size--
    return item
  }

  shift(): T | undefined {
    if (this._size === 0) return undefined
    const item = this.data[this.head]
    this.data[this.head] = undefined
    this.head = (this.head + 1) % this.capacity
    this._size--
    return item
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    return this.data[(this.head + index) % this.capacity]
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get isFull(): boolean {
    return this._size === this.capacity
  }

  peekFirst(): T | undefined {
    return this._size > 0 ? this.data[this.head] : undefined
  }

  peekLast(): T | undefined {
    return this._size > 0 ? this.data[(this.tail - 1 + this.capacity) % this.capacity] : undefined
  }

  clear(): void {
    this.data = new Array(this.capacity)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.data[(this.head + i) % this.capacity] as T)
    }
    return result
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): T[] {
    return this.toArray()
  }

  clone(): CircularBufferNew<T> {
    const copy = new CircularBufferNew<T>(this.capacity)
    copy.data = [...this.data]
    copy.head = this.head
    copy.tail = this.tail
    copy._size = this._size
    return copy as CircularBufferNew<T>
  }

  equals(other: unknown): boolean {
    if (!(other instanceof CircularBufferNew)) return false
    if (this._size !== other._size) return false
    for (let i = 0; i < this._size; i++) {
      if (this.get(i) !== other.get(i)) return false
    }
    return true
  }
}
