export class CircularDeque<T> {
  private buffer: (T | undefined)[]
  private head: number = 0
  private tail: number = 0
  private _size: number = 0

  constructor(capacity: number = 16) {
    this.buffer = new Array(capacity).fill(undefined)
  }

  pushFront(val: T): void {
    if (this._size === this.buffer.length) {
      this.grow()
    }
    this.head = (this.head - 1 + this.buffer.length) % this.buffer.length
    this.buffer[this.head] = val
    this._size++
  }

  pushBack(val: T): void {
    if (this._size === this.buffer.length) {
      this.grow()
    }
    this.buffer[this.tail] = val
    this.tail = (this.tail + 1) % this.buffer.length
    this._size++
  }

  popFront(): T | undefined {
    if (this._size === 0) return undefined
    const item = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this.buffer.length
    this._size--
    return item
  }

  popBack(): T | undefined {
    if (this._size === 0) return undefined
    this.tail = (this.tail - 1 + this.buffer.length) % this.buffer.length
    const item = this.buffer[this.tail]
    this.buffer[this.tail] = undefined
    this._size--
    return item
  }

  front(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]
  }

  back(): T | undefined {
    if (this._size === 0) return undefined
    const idx = (this.tail - 1 + this.buffer.length) % this.buffer.length
    return this.buffer[idx]
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    const idx = (this.head + index) % this.buffer.length
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

  clear(): void {
    this.buffer.fill(undefined)
    this.head = 0
    this.tail = 0
    this._size = 0
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

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    return {
      next: (): IteratorResult<T> => {
        if (index < this._size) {
          const idx = (this.head + index) % this.buffer.length
          const item = this.buffer[idx]
          index++
          return { done: false, value: item as T }
        }
        return { done: true, value: undefined as T }
      }
    }
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