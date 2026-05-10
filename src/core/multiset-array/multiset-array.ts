import type { MultisetArrayOptions } from './types.js'
import { DEFAULT_MULTISET_ARRAY_OPTIONS } from './types.js'

export class MultisetArray<T = unknown> {
  private _elements: T[] = []
  private _counts: Map<T, number> = new Map()

  constructor(options?: Partial<MultisetArrayOptions<T>>)
  constructor(initialElements?: Iterable<T>)
  constructor(
    initialElementsOrOptions?: Iterable<T> | Partial<MultisetArrayOptions<T>>
  ) {
    if (initialElementsOrOptions !== undefined) {
      if (
        typeof initialElementsOrOptions === 'object' &&
        initialElementsOrOptions !== null &&
        Symbol.iterator in initialElementsOrOptions
      ) {
        for (const element of initialElementsOrOptions as Iterable<T>) {
          this._elements.push(element)
          const current = this._counts.get(element) ?? 0
          this._counts.set(element, current + 1)
        }
      } else {
        const opts = {
          ...DEFAULT_MULTISET_ARRAY_OPTIONS,
          ...initialElementsOrOptions,
        } as Required<MultisetArrayOptions<T>>
        if (opts.initialElements) {
          for (const element of opts.initialElements) {
            this._elements.push(element)
            const current = this._counts.get(element) ?? 0
            this._counts.set(element, current + 1)
          }
        }
      }
    }
  }

  add(item: T): void {
    this._elements.push(item)
    const current = this._counts.get(item) ?? 0
    this._counts.set(item, current + 1)
  }

  addMany(item: T, count: number): void {
    if (count <= 0) return
    for (let i = 0; i < count; i++) {
      this._elements.push(item)
    }
    const current = this._counts.get(item) ?? 0
    this._counts.set(item, current + count)
  }

  remove(item: T): boolean {
    const current = this._counts.get(item)
    if (current === undefined || current === 0) return false
    const index = this._elements.lastIndexOf(item)
    if (index === -1) return false
    this._elements.splice(index, 1)
    if (current === 1) {
      this._counts.delete(item)
    } else {
      this._counts.set(item, current - 1)
    }
    return true
  }

  removeAll(item: T): number {
    const current = this._counts.get(item)
    if (current === undefined || current === 0) return 0
    const count = current
    this._elements = this._elements.filter((e) => e !== item)
    this._counts.delete(item)
    return count
  }

  get size(): number {
    return this._elements.length
  }

  get uniqueSize(): number {
    return this._counts.size
  }

  clear(): void {
    this._elements = []
    this._counts.clear()
  }

  count(item: T): number {
    return this._counts.get(item) ?? 0
  }

  has(item: T): boolean {
    return this._counts.has(item) && (this._counts.get(item) ?? 0) > 0
  }

  toArray(): T[] {
    return [...this._elements]
  }

  toArrayUnique(): T[] {
    return [...this._counts.keys()]
  }

  forEach(callback: (item: T, count: number) => void): void {
    for (const [item, count] of this._counts) {
      callback(item, count)
    }
  }

  entries(): Array<[T, number]> {
    return [...this._counts.entries()]
  }

  keys(): T[] {
    return [...this._counts.keys()]
  }

  values(): number[] {
    return [...this._counts.values()]
  }

  containsAll(other: MultisetArray<T>): boolean {
    for (const [item, count] of other._counts) {
      if ((this._counts.get(item) ?? 0) < count) return false
    }
    return true
  }

  union(other: MultisetArray<T>): MultisetArray<T> {
    const result = new MultisetArray<T>()
    const allKeys = new Set<T>([
      ...this._counts.keys(),
      ...other._counts.keys(),
    ])
    for (const key of allKeys) {
      const maxCount = Math.max(
        this._counts.get(key) ?? 0,
        other._counts.get(key) ?? 0
      )
      result.addMany(key, maxCount)
    }
    return result
  }

  intersect(other: MultisetArray<T>): MultisetArray<T> {
    const result = new MultisetArray<T>()
    for (const [key, count] of this._counts) {
      const otherCount = other._counts.get(key)
      if (otherCount !== undefined) {
        const minCount = Math.min(count, otherCount)
        if (minCount > 0) {
          result.addMany(key, minCount)
        }
      }
    }
    return result
  }

  isSubsetOf(other: MultisetArray<T>): boolean {
    for (const [item, count] of this._counts) {
      if ((other._counts.get(item) ?? 0) < count) return false
    }
    return true
  }

  equals(other: MultisetArray<T>): boolean {
    if (this._counts.size !== other._counts.size) return false
    for (const [item, count] of this._counts) {
      if (other._counts.get(item) !== count) return false
    }
    return true
  }

  isEmpty(): boolean {
    return this._elements.length === 0
  }
}

export { DEFAULT_MULTISET_ARRAY_OPTIONS } from './types.js'
export type { MultisetArrayOptions } from './types.js'
