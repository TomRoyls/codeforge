export class OrderedSet<T> {
  private readonly items: Map<T, number> = new Map()
  private readonly order: T[] = []

  add(item: T): boolean {
    if (this.items.has(item)) return false
    this.items.set(item, this.order.length)
    this.order.push(item)
    return true
  }

  delete(item: T): boolean {
    if (!this.items.has(item)) return false
    const idx = this.items.get(item)!
    this.items.delete(item)
    this.order[idx] = undefined as T
    return true
  }

  has(item: T): boolean {
    return this.items.has(item)
  }

  at(index: number): T | undefined {
    if (index < 0) index = this.order.length + index
    if (index < 0 || index >= this.order.length) return undefined
    return this.order[index]
  }

  *values(): Generator<T> {
    for (const item of this.order) {
      if (this.items.has(item)) yield item
    }
  }

  toArray(): T[] {
    return [...this.values()]
  }

  clear(): void {
    this.items.clear()
    this.order.length = 0
  }

  get size(): number {
    return this.items.size
  }

  isEmpty(): boolean {
    return this.items.size === 0
  }

  first(): T | undefined {
    for (const item of this.order) {
      if (this.items.has(item)) return item
    }
    return undefined
  }

  last(): T | undefined {
    for (let i = this.order.length - 1; i >= 0; i--) {
      if (this.items.has(this.order[i]!)) return this.order[i]
    }
    return undefined
  }
}
