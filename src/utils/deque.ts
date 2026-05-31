export class Deque<T> {
  private head: number = 0
  private tail: number = 0
  private data: (T | undefined)[]
  private _size: number = 0

  constructor(initialCapacity: number = 16) {
    this.data = new Array(initialCapacity)
  }

  pushBack(value: T): void {
    this.ensureCapacity()
    this.data[this.tail] = value
    this.tail = (this.tail + 1) % this.data.length
    this._size++
  }

  pushFront(value: T): void {
    this.ensureCapacity()
    this.head = (this.head - 1 + this.data.length) % this.data.length
    this.data[this.head] = value
    this._size++
  }

  popBack(): T | undefined {
    if (this._size === 0) return undefined
    this.tail = (this.tail - 1 + this.data.length) % this.data.length
    const value = this.data[this.tail]
    this.data[this.tail] = undefined
    this._size--
    return value
  }

  popFront(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.data[this.head]
    this.data[this.head] = undefined
    this.head = (this.head + 1) % this.data.length
    this._size--
    return value
  }

  front(): T | undefined {
    return this._size === 0 ? undefined : this.data[this.head]
  }

  back(): T | undefined {
    if (this._size === 0) return undefined
    const idx = (this.tail - 1 + this.data.length) % this.data.length
    return this.data[idx]
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.data[(this.head + i) % this.data.length]!)
    }
    return result
  }

  clear(): void {
    this.data = new Array(16)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  private ensureCapacity(): void {
    if (this._size < this.data.length) return
    const newData = new Array(this.data.length * 2)
    for (let i = 0; i < this._size; i++) {
      newData[i] = this.data[(this.head + i) % this.data.length]
    }
    this.data = newData
    this.head = 0
    this.tail = this._size
  }
}
