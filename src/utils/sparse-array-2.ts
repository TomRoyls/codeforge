export class SparseArray2<T> {
  private data = new Map<number, T>()
  private maxIndex = -1

  set(index: number, value: T): void {
    this.data.set(index, value)
    if (index > this.maxIndex) this.maxIndex = index
  }

  get(index: number): T | undefined { return this.data.get(index) }

  has(index: number): boolean { return this.data.has(index) }

  delete(index: number): boolean { return this.data.delete(index) }

  get length(): number { return this.maxIndex + 1 }
  get nonEmptyCount(): number { return this.data.size }
  get isEmpty(): boolean { return this.data.size === 0 }

  clear(): void { this.data.clear(); this.maxIndex = -1 }

  toArray(): (T | undefined)[] {
    const result: (T | undefined)[] = new Array(this.maxIndex + 1).fill(undefined)
    for (const [i, v] of this.data) result[i] = v
    return result
  }

  toString(): string { return JSON.stringify({ set: this.data.size, max: this.maxIndex }) }
  toJSON(): Record<string, number> { return { set: this.data.size, max: this.maxIndex } }

  clone(): SparseArray2<T> {
    const c = new SparseArray2<T>()
    for (const [k, v] of this.data) c.set(k, v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SparseArray2)) return false
    return this.data.size === other.data.size
  }
}
