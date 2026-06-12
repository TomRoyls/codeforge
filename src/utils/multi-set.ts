export class MultiSet<T> {
  private counts = new Map<T, number>()
  private _size = 0

  add(value: T, count = 1): void {
    const current = this.counts.get(value) ?? 0
    this.counts.set(value, current + count)
    this._size += count
  }

  remove(value: T, count = 1): boolean {
    const current = this.counts.get(value)
    if (current === undefined || current < count) return false
    const newVal = current - count
    if (newVal === 0) {
      this.counts.delete(value)
    } else {
      this.counts.set(value, newVal)
    }
    this._size -= count
    return true
  }

  count(value: T): number {
    return this.counts.get(value) ?? 0
  }

  has(value: T): boolean {
    return (this.counts.get(value) ?? 0) > 0
  }

  get uniqueSize(): number {
    return this.counts.size
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  mode(): T | undefined {
    let maxCount = 0
    let mode: T | undefined
    for (const [value, count] of this.counts) {
      if (count > maxCount) {
        maxCount = count
        mode = value
      }
    }
    return mode
  }

  entries(): Array<[T, number]> {
    return Array.from(this.counts.entries())
  }

  sorted(descending = false): Array<[T, number]> {
    const e = this.entries()
    return e.sort((a, b) => (descending ? b[1] - a[1] : a[1] - b[1]))
  }

  clear(): void {
    this.counts.clear()
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (const [value, count] of this.counts) {
      for (let i = 0; i < count; i++) result.push(value)
    }
    return result
  }

  toString(): string {
    return JSON.stringify(Object.fromEntries(this.counts))
  }

  toJSON(): Record<string, number> {
    return Object.fromEntries(this.counts)
  }

  clone(): MultiSet<T> {
    const copy = new MultiSet<T>()
    copy.counts = new Map(this.counts)
    copy._size = this._size
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof MultiSet)) return false
    if (this._size !== other._size) return false
    if (this.counts.size !== other.counts.size) return false
    for (const [key, val] of this.counts) {
      if (other.counts.get(key) !== val) return false
    }
    return true
  }
}
