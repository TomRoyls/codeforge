export class FixedRing<T> {
  private data: (T | undefined)[]
  private head = 0
  private _size = 0

  constructor(private capacity: number) {
    this.data = new Array(capacity)
  }

  push(item: T): void {
    this.data[(this.head + this._size) % this.capacity] = item
    if (this._size < this.capacity) {
      this._size++
    } else {
      this.head = (this.head + 1) % this.capacity
    }
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    return this.data[(this.head + index) % this.capacity]
  }

  get size(): number { return this._size }
  get isEmpty(): boolean { return this._size === 0 }
  get isFull(): boolean { return this._size === this.capacity }

  first(): T | undefined { return this._size > 0 ? this.data[this.head] : undefined }
  last(): T | undefined {
    return this._size > 0 ? this.data[(this.head + this._size - 1) % this.capacity] : undefined
  }

  clear(): void {
    this.data = new Array(this.capacity)
    this.head = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.data[(this.head + i) % this.capacity] as T)
    }
    return result
  }

  toString(): string { return JSON.stringify(this.toArray()) }
  toJSON(): T[] { return this.toArray() }

  clone(): FixedRing<T> {
    const copy = new FixedRing<T>(this.capacity)
    copy.data = [...this.data]
    copy.head = this.head
    copy._size = this._size
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof FixedRing)) return false
    if (this._size !== other._size) return false
    for (let i = 0; i < this._size; i++) {
      if (this.get(i) !== other.get(i)) return false
    }
    return true
  }
}
