export class SortedList<T> {
  private items: T[] = []
  private _size: number = 0

  constructor(private readonly comparator: (a: T, b: T) => number = defaultComparator as never) {}

  insert(item: T): void {
    const idx = this.lowerBound(item)
    this.items.splice(idx, 0, item)
    this._size++
  }

  get(index: number): T {
    if (index < 0 || index >= this._size) throw new RangeError(`Index out of bounds: ${index}`)
    return this.items[index] as T
  }

  remove(index: number): T {
    if (index < 0 || index >= this._size) throw new RangeError(`Index out of bounds: ${index}`)
    const item = this.items.splice(index, 1)[0] as T
    this._size--
    return item
  }

  removeItem(item: T): boolean {
    const idx = this.indexOf(item)
    if (idx === -1) return false
    this.items.splice(idx, 1)
    this._size--
    return true
  }

  indexOf(item: T): number {
    let lo = 0
    let hi = this._size
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this.comparator(this.items[mid] as T, item)
      if (cmp < 0) lo = mid + 1
      else hi = mid
    }
    if (lo < this._size && this.comparator(this.items[lo] as T, item) === 0) return lo
    return -1
  }

  contains(item: T): boolean {
    return this.indexOf(item) !== -1
  }

  min(): T | undefined {
    return this._size === 0 ? undefined : this.items[0]
  }

  max(): T | undefined {
    return this._size === 0 ? undefined : this.items[this._size - 1]
  }

  lowerBound(item: T): number {
    let lo = 0
    let hi = this._size
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.comparator(this.items[mid] as T, item) < 0) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  upperBound(item: T): number {
    let lo = 0
    let hi = this._size
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.comparator(this.items[mid] as T, item) <= 0) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  rangeCount(min: T, max: T): number {
    return this.upperBound(max) - this.lowerBound(min)
  }

  slice(start?: number, end?: number): T[] {
    return this.items.slice(start, end)
  }

  clear(): void {
    this.items = []
    this._size = 0
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  *entries(): Generator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this.items[i] as T
    }
  }
}

function defaultComparator(a: number, b: number): number {
  return a - b
}
