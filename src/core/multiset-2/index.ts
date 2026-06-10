import type { MultisetEntry, MultisetOptions } from './types.js'

export class Multiset<T> {
  private map: Map<T, number> = new Map()
  private _size: number = 0

  constructor(options?: MultisetOptions<T>) {
    if (options?.entries) {
      for (const [value, count] of options.entries) {
        if (count > 0) {
          this.map.set(value, count)
          this._size += count
        }
      }
    }
    if (options?.elements) {
      for (const el of options.elements) {
        this.add(el)
      }
    }
  }

  get size(): number {
    return this._size
  }

  get uniqueSize(): number {
    return this.map.size
  }

  add(value: T, count: number = 1): void {
    if (count <= 0) return
    const current = this.map.get(value) ?? 0
    this.map.set(value, current + count)
    this._size += count
  }

  delete(value: T, count: number = 1): boolean {
    const current = this.map.get(value)
    if (current === undefined) return false
    if (count <= 0) return false
    if (count >= current) {
      this._size -= current
      this.map.delete(value)
    } else {
      this.map.set(value, current - count)
      this._size -= count
    }
    return true
  }

  count(value: T): number {
    return this.map.get(value) ?? 0
  }

  has(value: T): boolean {
    return this.map.has(value)
  }

  clear(): void {
    this.map.clear()
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (const [value, cnt] of this.map) {
      for (let i = 0; i < cnt; i++) {
        result.push(value)
      }
    }
    return result
  }

  forEach(callback: (value: T, count: number, multiset: Multiset<T>) => void): void {
    for (const [value, cnt] of this.map) {
      callback(value, cnt, this)
    }
  }

  *entries(): Iterator<MultisetEntry<T>> {
    for (const entry of this.map) {
      yield entry
    }
  }

  *values(): IterableIterator<T> {
    for (const [value, cnt] of this.map) {
      for (let i = 0; i < cnt; i++) {
        yield value
      }
    }
  }

  *uniqueValues(): IterableIterator<T> {
    for (const key of this.map.keys()) {
      yield key
    }
  }

  union(other: Multiset<T>): Multiset<T> {
    const result = new Multiset<T>()
    for (const [value, cnt] of this.map) {
      result.map.set(value, cnt)
    }
    result._size = this._size
    for (const [value, cnt] of other.map) {
      const current = result.map.get(value) ?? 0
      const maxCount = Math.max(current, cnt)
      if (current === 0) {
        result._size += maxCount
      } else {
        result._size += maxCount - current
      }
      result.map.set(value, maxCount)
    }
    return result
  }

  intersection(other: Multiset<T>): Multiset<T> {
    const result = new Multiset<T>()
    for (const [value, cnt] of this.map) {
      const otherCount = other.map.get(value)
      if (otherCount !== undefined) {
        const minCount = Math.min(cnt, otherCount)
        result.map.set(value, minCount)
        result._size += minCount
      }
    }
    return result
  }

  sum(other: Multiset<T>): Multiset<T> {
    const result = new Multiset<T>()
    for (const [value, cnt] of this.map) {
      result.map.set(value, cnt)
    }
    result._size = this._size
    for (const [value, cnt] of other.map) {
      const current = result.map.get(value) ?? 0
      result.map.set(value, current + cnt)
      result._size += cnt
    }
    return result
  }

  isSubsetOf(other: Multiset<T>): boolean {
    for (const [value, cnt] of this.map) {
      const otherCount = other.map.get(value) ?? 0
      if (cnt > otherCount) return false
    }
    return true
  }

  isSupersetOf(other: Multiset<T>): boolean {
    return other.isSubsetOf(this)
  }

  equals(other: Multiset<T>): boolean {
    if (this.map.size !== other.map.size) return false
    for (const [value, cnt] of this.map) {
      const otherCount = other.map.get(value)
      if (otherCount !== cnt) return false
    }
    return true
  }

  clone(): Multiset<T> {
    const result = new Multiset<T>()
    for (const [value, cnt] of this.map) {
      result.map.set(value, cnt)
    }
    result._size = this._size
    return result
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  set(value: T, count: number): void {
    const current = this.map.get(value) ?? 0
    if (count <= 0) {
      if (current > 0) {
        this.map.delete(value)
        this._size -= current
      }
    } else {
      this.map.set(value, count)
      this._size += count - current
    }
  }

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.values()
  }

  static from<T>(elements: T[]): Multiset<T> {
    return new Multiset<T>({ elements })
  }

  static fromEntries<T>(entries: MultisetEntry<T>[]): Multiset<T> {
    return new Multiset<T>({ entries })
  }

  toString(): string {
    return `Multiset({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'Multiset', size: this.size, items: this.toArray() }
  }

  static of<T>(...items: T[]): Multiset<T> {
    return Multiset.from(items)
  }

  merge(other: Multiset<T>): Multiset<T> {
    return Multiset.from([...this.toArray(), ...other.toArray()])
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }
}
