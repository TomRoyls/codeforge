import type { OrderedHashSetOptions, ForEachCallback } from './types.js'

interface LinkedNode<T> {
  value: T
  prev: LinkedNode<T> | null
  next: LinkedNode<T> | null
}

export class OrderedHashSet<T> {
  private _map: Map<number, LinkedNode<T>>
  private head: LinkedNode<T> | null
  private tail: LinkedNode<T> | null
  private _size: number
  private hashFn: (value: T) => number

  constructor(options?: OrderedHashSetOptions<T>) {
    this._map = new Map()
    this.head = null
    this.tail = null
    this._size = 0
    this.hashFn = options?.hash ?? ((value: T) => this.defaultHash(value))
  }

  private defaultHash(value: T): number {
    if (value === null) return 0
    if (value === undefined) return 0
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      let h = 0
      for (let i = 0; i < value.length; i++) {
        h = ((h << 5) - h + value.charCodeAt(i)) | 0
      }
      return h
    }
    if (typeof value === 'boolean') return value ? 1 : 0
    const obj = value as Record<string, unknown>
    if (typeof obj.hashCode === 'function') {
      return obj.hashCode() as number
    }
    return String(value).length > 0
      ? String(value).split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
      : 0
  }

  private getHash(value: T): number {
    return this.hashFn(value)
  }

  add(value: T): boolean {
    const hash = this.getHash(value)
    if (this._map.has(hash)) {
      return false
    }
    const node: LinkedNode<T> = { value, prev: this.tail, next: null }
    if (this.tail) {
      this.tail.next = node
    } else {
      this.head = node
    }
    this.tail = node
    this._map.set(hash, node)
    this._size++
    return true
  }

  delete(value: T): boolean {
    const hash = this.getHash(value)
    const node = this._map.get(hash)
    if (!node) {
      return false
    }
    if (node.prev) {
      node.prev.next = node.next
    } else {
      this.head = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    } else {
      this.tail = node.prev
    }
    this._map.delete(hash)
    this._size--
    return true
  }

  has(value: T): boolean {
    return this._map.has(this.getHash(value))
  }

  contains(value: T): boolean {
    return this.has(value)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._map.clear()
    this.head = null
    this.tail = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.head
    while (current) {
      result.push(current.value)
      current = current.next
    }
    return result
  }

  clone(): OrderedHashSet<T> {
    const copy = new OrderedHashSet<T>({ hash: this.hashFn })
    let current = this.head
    while (current) {
      copy.add(current.value)
      current = current.next
    }
    return copy
  }

  static fromArray<U>(arr: U[], options?: OrderedHashSetOptions<U>): OrderedHashSet<U> {
    const set = new OrderedHashSet<U>(options)
    for (const item of arr) {
      set.add(item)
    }
    return set
  }

  forEach(callback: ForEachCallback<T>): void {
    let current = this.head
    let index = 0
    while (current) {
      callback(current.value, index)
      current = current.next
      index++
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    let current = this.head
    while (current) {
      yield current.value
      current = current.next
    }
  }

  first(): T {
    if (!this.head) {
      throw new RangeError('Set is empty')
    }
    return this.head.value
  }

  last(): T {
    if (!this.tail) {
      throw new RangeError('Set is empty')
    }
    return this.tail.value
  }

  union(other: OrderedHashSet<T>): OrderedHashSet<T> {
    const result = this.clone()
    for (const value of other) {
      result.add(value)
    }
    return result
  }

  intersection(other: OrderedHashSet<T>): OrderedHashSet<T> {
    const result = new OrderedHashSet<T>({ hash: this.hashFn })
    for (const value of this) {
      if (other.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  difference(other: OrderedHashSet<T>): OrderedHashSet<T> {
    const result = new OrderedHashSet<T>({ hash: this.hashFn })
    for (const value of this) {
      if (!other.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  symmetricDifference(other: OrderedHashSet<T>): OrderedHashSet<T> {
    const result = new OrderedHashSet<T>({ hash: this.hashFn })
    for (const value of this) {
      if (!other.has(value)) {
        result.add(value)
      }
    }
    for (const value of other) {
      if (!this.has(value)) {
        result.add(value)
      }
    }
    return result
  }

  isSubsetOf(other: OrderedHashSet<T>): boolean {
    if (this._size > other.size) return false
    for (const value of this) {
      if (!other.has(value)) return false
    }
    return true
  }

  isSupersetOf(other: OrderedHashSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  isDisjointFrom(other: OrderedHashSet<T>): boolean {
    for (const value of this) {
      if (other.has(value)) return false
    }
    return true
  }

  equals(other: OrderedHashSet<T>): boolean {
    if (this._size !== other.size) return false
    for (const value of this) {
      if (!other.has(value)) return false
    }
    return true
  }

  filter(predicate: (value: T, index: number) => boolean): OrderedHashSet<T> {
    const result = new OrderedHashSet<T>({ hash: this.hashFn })
    let index = 0
    for (const value of this) {
      if (predicate(value, index)) {
        result.add(value)
      }
      index++
    }
    return result
  }

  map<U>(fn: (value: T, index: number) => U): OrderedHashSet<U> {
    const result = new OrderedHashSet<U>()
    let index = 0
    for (const value of this) {
      result.add(fn(value, index))
      index++
    }
    return result
  }

  every(predicate: (value: T, index: number) => boolean): boolean {
    let index = 0
    for (const value of this) {
      if (!predicate(value, index)) return false
      index++
    }
    return true
  }

  some(predicate: (value: T, index: number) => boolean): boolean {
    let index = 0
    for (const value of this) {
      if (predicate(value, index)) return true
      index++
    }
    return false
  }

  reduce<U>(fn: (accumulator: U, value: T, index: number) => U, initial: U): U {
    let acc = initial
    let index = 0
    for (const value of this) {
      acc = fn(acc, value, index)
      index++
    }
    return acc
  }

  join(separator?: string): string {
    const sep = separator ?? ','
    let result = ''
    let first = true
    for (const value of this) {
      if (!first) result += sep
      result += String(value)
      first = false
    }
    return result
  }

  at(index: number): T {
    if (index < 0) {
      index = this._size + index
    }
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    let current = this.head
    let i = 0
    while (current && i < index) {
      current = current.next
      i++
    }
    return current!.value
  }

  indexOf(value: T): number {
    let current = this.head
    let index = 0
    while (current) {
      if (this.getHash(current.value) === this.getHash(value)) {
        return index
      }
      current = current.next
      index++
    }
    return -1
  }

  toString(): string {
    return `OrderedHashSet({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'OrderedHashSet', size: this.size, items: this.toArray() }
  }
}
