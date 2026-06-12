export class SparseArray<T> {
  private data = new Map<number, T>()
  private _length: number

  constructor(length: number) {
    if (length < 0) throw new RangeError('length must be >= 0')
    this._length = length
  }

  get(index: number): T | undefined {
    this.validateIndex(index)
    return this.data.get(index)
  }

  set(index: number, value: T): void {
    this.validateIndex(index)
    this.data.set(index, value)
  }

  delete(index: number): boolean {
    if (index < 0) throw new RangeError('index must be >= 0')
    return this.data.delete(index)
  }

  has(index: number): boolean {
    this.validateIndex(index)
    return this.data.has(index)
  }

  get length(): number {
    return this._length
  }

  get density(): number {
    return this.data.size / (this._length || 1)
  }

  get nonEmptyCount(): number {
    return this.data.size
  }

  get sparseRatio(): number {
    return 1 - this.density
  }

  indices(): number[] {
    return Array.from(this.data.keys()).sort((a, b) => a - b)
  }

  values(): T[] {
    return this.indices().map((i) => this.data.get(i) as T)
  }

  entries(): Array<[number, T]> {
    return this.indices().map((i) => [i, this.data.get(i) as T])
  }

  fill(value: T): void {
    for (let i = 0; i < this._length; i++) {
      this.data.set(i, value)
    }
  }

  resize(length: number): void {
    if (length < 0) throw new RangeError('length must be >= 0')
    this._length = length
    for (const key of this.data.keys()) {
      if (key >= length) this.data.delete(key)
    }
  }

  compact(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._length; i++) {
      if (this.data.has(i)) {
        result.push(this.data.get(i) as T)
      }
    }
    return result
  }

  toArray(): (T | undefined)[] {
    const result: (T | undefined)[] = new Array(this._length).fill(undefined)
    for (const [key, value] of this.data) {
      result[key] = value
    }
    return result
  }

  toString(): string {
    return JSON.stringify(this.toArray())
  }

  toJSON(): (T | undefined)[] {
    return this.toArray()
  }

  clone(): SparseArray<T> {
    const copy = new SparseArray<T>(this._length)
    for (const [key, value] of this.data) {
      copy.data.set(key, value)
    }
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SparseArray)) return false
    if (this._length !== other._length) return false
    if (this.data.size !== other.data.size) return false
    for (const [key, value] of this.data) {
      if (other.data.get(key) !== value) return false
    }
    return true
  }

  private validateIndex(index: number): void {
    if (index < 0 || index >= this._length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._length})`)
    }
  }
}
