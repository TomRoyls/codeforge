export class FrequencyTable<T> {
  private counts = new Map<T, number>()
  private total = 0

  add(value: T, count = 1): void {
    const current = this.counts.get(value) ?? 0
    this.counts.set(value, current + count)
    this.total += count
  }

  get(value: T): number {
    return this.counts.get(value) ?? 0
  }

  has(value: T): boolean {
    return this.counts.has(value)
  }

  delete(value: T): boolean {
    const count = this.counts.get(value)
    if (count === undefined) return false
    this.total -= count
    this.counts.delete(value)
    return true
  }

  get size(): number {
    return this.counts.size
  }

  get totalCount(): number {
    return this.total
  }

  frequency(value: T): number {
    if (this.total === 0) return 0
    return (this.counts.get(value) ?? 0) / this.total
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

  min(): T | undefined {
    let minCount = Infinity
    let result: T | undefined
    for (const [value, count] of this.counts) {
      if (count < minCount) {
        minCount = count
        result = value
      }
    }
    return result
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
    this.total = 0
  }

  toArray(): Array<[T, number]> {
    return this.entries()
  }

  toString(): string {
    return JSON.stringify(Object.fromEntries(this.counts))
  }

  toJSON(): Record<string, number> {
    return Object.fromEntries(this.counts)
  }

  clone(): FrequencyTable<T> {
    const copy = new FrequencyTable<T>()
    for (const [value, count] of this.counts) {
      copy.counts.set(value, count)
    }
    copy.total = this.total
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof FrequencyTable)) return false
    if (this.size !== other.size) return false
    if (this.total !== other.total) return false
    for (const [key, val] of this.counts) {
      if (other.counts.get(key) !== val) return false
    }
    return true
  }

  merge(other: FrequencyTable<T>): void {
    for (const [value, count] of other.counts) {
      this.add(value, count)
    }
  }
}
