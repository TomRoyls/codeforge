import type { OrderedSetOptions, OrderedSetStats } from './types.js'

export class OrderedSet<T> {
  private set: Set<T> = new Set()
  private order: T[] = []

  constructor(_options?: Partial<OrderedSetOptions>) {
    void _options
  }

  add(value: T): boolean {
    if (this.set.has(value)) {
      return false
    }
    this.set.add(value)
    this.order.push(value)
    return true
  }

  delete(value: T): boolean {
    if (!this.set.has(value)) {
      return false
    }
    this.set.delete(value)
    const idx = this.order.indexOf(value)
    if (idx !== -1) {
      this.order.splice(idx, 1)
    }
    return true
  }

  has(value: T): boolean {
    return this.set.has(value)
  }

  get first(): T | undefined {
    return this.order[0]
  }

  get last(): T | undefined {
    return this.order[this.order.length - 1]
  }

  forEach(callback: (value: T) => void): void {
    for (const value of this.order) {
      callback(value)
    }
  }

  toArray(): T[] {
    return [...this.order]
  }

  get size(): number {
    return this.set.size
  }

  isEmpty(): boolean {
    return this.set.size === 0
  }

  clear(): void {
    this.set.clear()
    this.order.length = 0
  }

  clone(): OrderedSet<T> {
    const copy = new OrderedSet<T>()
    for (const value of this.order) {
      copy.set.add(value)
      copy.order.push(value)
    }
    return copy
  }

  static from<T>(iterable: Iterable<T>, options?: Partial<OrderedSetOptions>): OrderedSet<T> {
    const set = new OrderedSet<T>(options)
    for (const value of iterable) {
      set.add(value)
    }
    return set
  }

  indexOf(value: T): number {
    if (!this.set.has(value)) {
      return -1
    }
    return this.order.indexOf(value)
  }

  atIndex(index: number): T | undefined {
    if (index < 0 || index >= this.order.length) {
      return undefined
    }
    return this.order[index]
  }

  moveToFront(value: T): boolean {
    if (!this.set.has(value)) {
      return false
    }
    const idx = this.order.indexOf(value)
    if (idx <= 0) {
      return true
    }
    this.order.splice(idx, 1)
    this.order.unshift(value)
    return true
  }

  moveToBack(value: T): boolean {
    if (!this.set.has(value)) {
      return false
    }
    const idx = this.order.indexOf(value)
    if (idx === -1 || idx === this.order.length - 1) {
      return true
    }
    this.order.splice(idx, 1)
    this.order.push(value)
    return true
  }

  union(other: OrderedSet<T>): OrderedSet<T> {
    const result = new OrderedSet<T>()
    for (const value of this.order) {
      result.add(value)
    }
    for (const value of other.order) {
      result.add(value)
    }
    return result
  }

  intersection(other: OrderedSet<T>): OrderedSet<T> {
    const result = new OrderedSet<T>()
    for (const value of this.order) {
      if (other.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  difference(other: OrderedSet<T>): OrderedSet<T> {
    const result = new OrderedSet<T>()
    for (const value of this.order) {
      if (!other.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  symmetricDifference(other: OrderedSet<T>): OrderedSet<T> {
    const result = new OrderedSet<T>()
    for (const value of this.order) {
      if (!other.has(value)) {
        result.add(value)
      }
    }
    for (const value of other.order) {
      if (!this.set.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  isSubsetOf(other: OrderedSet<T>): boolean {
    for (const value of this.order) {
      if (!other.has(value)) {
        return false
      }
    }
    return true
  }

  isSupersetOf(other: OrderedSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  stats(): OrderedSetStats {
    return {
      size: this.set.size,
      capacity: this.set.size,
    }
  }
}

export type { OrderedSetOptions, OrderedSetStats } from './types.js'
export { DEFAULT_ORDERED_SET_OPTIONS } from './types.js'
