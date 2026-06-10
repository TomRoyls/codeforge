import type { DynamicFenwickOptions } from './types.js'
import { DEFAULT_DYNAMIC_FENWICK_OPTIONS } from './types.js'

export class DynamicFenwick<T = number> {
  private tree: T[] = []
  private values: T[] = []
  private _size: number = 0
  private combiner: (a: T, b: T) => T
  private subtractor: (a: T, b: T) => T
  private identity: T

  constructor(options?: Partial<DynamicFenwickOptions<T>>) {
    const defaults = DEFAULT_DYNAMIC_FENWICK_OPTIONS as unknown as DynamicFenwickOptions<T>
    const opts: DynamicFenwickOptions<T> = { ...defaults, ...options }
    this.combiner = opts.combiner
    this.identity = opts.identity
    this.subtractor = opts.subtractor
  }

  update(index: number, delta: T): void {
    this.validateIndex(index)
    const newDelta = delta
    this.values[index] = this.combiner(this.values[index]!, newDelta)
    let i = index + 1
    while (i <= this._size) {
      this.tree[i] = this.combiner(this.tree[i]!, newDelta)
      i += this.lsb(i)
    }
  }

  query(index: number): T {
    return this.prefixSum(index)
  }

  prefixSum(index: number): T {
    if (this._size === 0) {
      return this.identity
    }
    if (index < 0) {
      return this.identity
    }
    const clampedIndex = Math.min(index, this._size - 1)
    let sum = this.identity
    let i = clampedIndex + 1
    while (i > 0) {
      sum = this.combiner(sum, this.tree[i]!)
      i -= this.lsb(i)
    }
    return sum
  }

  rangeQuery(lo: number, hi: number): T {
    if (lo > hi) {
      return this.identity
    }
    if (lo <= 0) {
      return this.prefixSum(hi)
    }
    return this.subtractor(this.prefixSum(hi), this.prefixSum(lo - 1))
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Insert index ${index} out of bounds [0, ${this._size}]`)
    }
    this.values.splice(index, 0, value)
    this._size++
    this.rebuild()
  }

  remove(index: number): T {
    this.validateIndex(index)
    const removed = this.values[index]!
    this.values.splice(index, 1)
    this._size--
    if (this._size === 0) {
      this.tree = []
    } else {
      this.rebuild()
    }
    return removed
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.tree = []
    this.values = []
    this._size = 0
  }

  toArray(): T[] {
    return [...this.values]
  }

  total(): T {
    if (this._size === 0) {
      return this.identity
    }
    return this.prefixSum(this._size - 1)
  }

  get(index: number): T {
    this.validateIndex(index)
    return this.values[index]!
  }

  set(index: number, value: T): void {
    this.validateIndex(index)
    const current = this.values[index]!
    const delta = this.subtractor(value, current)
    this.values[index] = value
    let i = index + 1
    while (i <= this._size) {
      this.tree[i] = this.combiner(this.tree[i]!, delta)
      i += this.lsb(i)
    }
  }

  private rebuild(): void {
    this.tree = new Array<T>(this._size + 1).fill(this.identity)
    for (let i = 0; i < this._size; i++) {
      const idx = i + 1
      this.tree[idx] = this.combiner(this.tree[idx]!, this.values[i]!)
      const parent = idx + this.lsb(idx)
      if (parent <= this._size) {
        this.tree[parent] = this.combiner(this.tree[parent]!, this.tree[idx]!)
      }
    }
  }

  private lsb(i: number): number {
    return i & (-i)
  }

  private validateIndex(index: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size - 1}]`)
    }
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  toString(): string {
    return `${DynamicFenwick}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'DynamicFenwick', items: this.toArray() }
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

  reverse(): T[] {
    return this.toArray().reverse()
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

}

export { DEFAULT_DYNAMIC_FENWICK_OPTIONS } from './types.js'
export type { DynamicFenwickOptions } from './types.js'
