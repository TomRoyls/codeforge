export class MoveToFrontList<T> {
  private items: T[] = []

  add(item: T): void {
    const idx = this.items.indexOf(item)
    if (idx >= 0) this.items.splice(idx, 1)
    this.items.unshift(item)
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.items.length) return undefined
    const item = this.items[index]!
    if (index > 0) {
      this.items.splice(index, 1)
      this.items.unshift(item)
    }
    return item
  }

  find(predicate: (item: T) => boolean): T | undefined {
    const idx = this.items.findIndex(predicate)
    if (idx < 0) return undefined
    return this.get(idx)
  }

  has(item: T): boolean {
    return this.items.includes(item)
  }

  remove(item: T): boolean {
    const idx = this.items.indexOf(item)
    if (idx < 0) return false
    this.items.splice(idx, 1)
    return true
  }

  get size(): number { return this.items.length }
  get isEmpty(): boolean { return this.items.length === 0 }

  clear(): void { this.items = [] }

  toArray(): T[] { return [...this.items] }
  toString(): string { return JSON.stringify(this.items) }
  toJSON(): T[] { return this.toArray() }

  clone(): MoveToFrontList<T> {
    const copy = new MoveToFrontList<T>()
    copy.items = [...this.items]
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof MoveToFrontList)) return false
    if (this.size !== other.size) return false
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i] !== other.items[i]) return false
    }
    return true
  }
}
