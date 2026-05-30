export class RingBufferQueue<T> {
  private buffer: (T | undefined)[]
  private head: number = 0
  private tail: number = 0
  private _size: number = 0

  constructor(capacity: number = 16) {
    this.buffer = new Array(capacity).fill(undefined)
  }

  enqueue(item: T): boolean {
    if (this._size === this.buffer.length) {
      this.grow()
    }
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this.buffer.length
    this._size++
    return true
  }

  dequeue(): T | undefined {
    if (this._size === 0) return undefined
    const item = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this.buffer.length
    this._size--
    return item
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]
  }

  peekLast(): T | undefined {
    if (this._size === 0) return undefined
    const idx = (this.tail - 1 + this.buffer.length) % this.buffer.length
    return this.buffer[idx]
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this.buffer.length
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  isFull(): boolean {
    return this._size === this.buffer.length
  }

  clear(): void {
    this.buffer.fill(undefined)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      const idx = (this.head + i) % this.buffer.length
      const item = this.buffer[idx]
      if (item !== undefined) callback(item, i)
    }
  }

  drain(): T[] {
    const result = this.toArray()
    this.clear()
    return result
  }

  contains(predicate: (item: T) => boolean): boolean {
    for (let i = 0; i < this._size; i++) {
      const idx = (this.head + i) % this.buffer.length
      const item = this.buffer[idx]
      if (item !== undefined && predicate(item)) return true
    }
    return false
  }

  compact(): void {
    if (this._size === 0) {
      this.buffer = new Array(16).fill(undefined)
      this.head = 0
      this.tail = 0
      return
    }
    const minCapacity = Math.max(16, this._size)
    if (this.buffer.length <= minCapacity) return
    const newBuffer = new Array(minCapacity).fill(undefined)
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[(this.head + i) % this.buffer.length]
    }
    this.buffer = newBuffer
    this.head = 0
    this.tail = this._size
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const idx = (this.head + i) % this.buffer.length
      const item = this.buffer[idx]
      if (item !== undefined) result.push(item)
    }
    return result
  }

  private grow(): void {
    const newBuffer = new Array(this.buffer.length * 2).fill(undefined)
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[(this.head + i) % this.buffer.length]
    }
    this.buffer = newBuffer
    this.head = 0
    this.tail = this._size
  }
}
