const INITIAL_CAPACITY = 8

export class Deque<T> {
  private buffer: (T | undefined)[]
  private head: number = 0
  private tail: number = 0
  private _size: number = 0
  private _capacity: number

  constructor(initialCapacity: number = INITIAL_CAPACITY) {
    this._capacity = Math.max(1, initialCapacity)
    this.buffer = new Array(this._capacity).fill(undefined)
  }

  pushFront(value: T): void {
    this.growIfNeeded()
    this.head = (this.head - 1 + this._capacity) % this._capacity
    this.buffer[this.head] = value
    this._size++
  }

  pushBack(value: T): void {
    this.growIfNeeded()
    this.buffer[this.tail] = value
    this.tail = (this.tail + 1) % this._capacity
    this._size++
  }

  popFront(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    return value
  }

  popBack(): T | undefined {
    if (this._size === 0) return undefined
    this.tail = (this.tail - 1 + this._capacity) % this._capacity
    const value = this.buffer[this.tail]
    this.buffer[this.tail] = undefined
    this._size--
    return value
  }

  peekFront(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]
  }

  peekBack(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]
  }

  get size(): number {
    return this._size
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
      result.push(this.buffer[(this.head + i) % this._capacity]!)
    }
    return result
  }

  static fromArray<T>(arr: T[]): Deque<T> {
    const deque = new Deque<T>(Math.max(INITIAL_CAPACITY, arr.length))
    for (const item of arr) {
      deque.pushBack(item)
    }
    return deque
  }

  private growIfNeeded(): void {
    if (this._size < this._capacity) return
    const newCapacity = this._capacity * 2
    const newBuffer = new Array<T | undefined>(newCapacity).fill(undefined)
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[(this.head + i) % this._capacity]
    }
    this.buffer = newBuffer
    this.head = 0
    this.tail = this._size
    this._capacity = newCapacity
  }
}
