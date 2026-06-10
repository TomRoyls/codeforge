import type { RandomizedQueueOptions as RandomizedQueueOptionsType } from './types.js'

export type { RandomizedQueueOptions, RandomizedQueueStats } from './types.js'
export { DEFAULT_RANDOMIZED_QUEUE_OPTIONS } from './types.js'

export class RandomizedQueue<T> {
  private items: T[] = []

  constructor(items?: readonly T[], _options?: RandomizedQueueOptionsType) {
    if (items) {
      for (const item of items) {
        this.items.push(item)
      }
    }
  }

  enqueue(value: T): void {
    this.items.push(value)
  }

  push(value: T): void {
    this.enqueue(value)
  }

  dequeue(): T {
    if (this.items.length === 0) {
      throw new Error('Cannot dequeue from empty queue')
    }
    const idx = Math.floor(Math.random() * this.items.length)
    const item = this.items[idx]!
    const lastIdx = this.items.length - 1
    if (idx !== lastIdx) {
      this.items[idx] = this.items[lastIdx]!
    }
    this.items.pop()
    return item
  }

  sample(): T {
    if (this.items.length === 0) {
      throw new Error('Cannot sample from empty queue')
    }
    const idx = Math.floor(Math.random() * this.items.length)
    return this.items[idx]!
  }

  peek(): T {
    if (this.items.length === 0) {
      throw new Error('Cannot peek from empty queue')
    }
    return this.items[0]!
  }

  peekBack(): T {
    if (this.items.length === 0) {
      throw new Error('Cannot peekBack from empty queue')
    }
    return this.items[this.items.length - 1]!
  }

  get size(): number {
    return this.items.length
  }

  get isEmpty(): boolean {
    return this.items.length === 0
  }

  clear(): void {
    this.items = []
  }

  toArray(): T[] {
    return this.items.slice()
  }

  clone(): RandomizedQueue<T> {
    const copy = new RandomizedQueue<T>()
    copy.items = this.items.slice()
    return copy
  }

  static fromArray<U>(arr: readonly U[]): RandomizedQueue<U> {
    return new RandomizedQueue<U>(arr)
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.items.length; i++) {
      callback(this.items[i]!, i)
    }
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const arr = this.items
    const len = arr.length
    return {
      next(): IteratorResult<T> {
        if (index < len) {
          return { value: arr[index++]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  contains(value: T): boolean {
    return this.items.includes(value)
  }

  indexOf(value: T): number {
    return this.items.indexOf(value)
  }

  remove(value: T): boolean {
    const idx = this.items.indexOf(value)
    if (idx === -1) {
      return false
    }
    const lastIdx = this.items.length - 1
    if (idx !== lastIdx) {
      this.items[idx] = this.items[lastIdx]!
    }
    this.items.pop()
    return true
  }

  removeAt(index: number): T {
    if (index < 0 || index >= this.items.length) {
      throw new RangeError(`Index ${index} out of bounds for queue of size ${this.items.length}`)
    }
    const item = this.items[index++]!
    const lastIdx = this.items.length - 1
    if (index !== lastIdx) {
      this.items[index] = this.items[lastIdx]!
    }
    this.items.pop()
    return item
  }

  shuffle(): void {
    for (let i = this.items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = this.items[i]!
      this.items[i] = this.items[j]!
      this.items[j] = tmp
    }
  }

  random(n?: number): T[] {
    if (this.items.length === 0) {
      return []
    }
    if (n === undefined) {
      const idx = Math.floor(Math.random() * this.items.length)
      return [this.items[idx]!]
    }
    const count = Math.min(n, this.items.length)
    const indices: number[] = []
    for (let i = 0; i < this.items.length; i++) {
      indices.push(i)
    }
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = indices[i]!
      indices[i] = indices[j]!
      indices[j] = tmp
    }
    const result: T[] = []
    for (let i = 0; i < count; i++) {
      result.push(this.items[indices[i]!]!)
    }
    return result
  }

  at(index: number): T {
    if (index < 0 || index >= this.items.length) {
      throw new RangeError(`Index ${index} out of bounds for queue of size ${this.items.length}`)
    }
    return this.items[index++]!
  }

  first(): T {
    if (this.items.length === 0) {
      throw new Error('Cannot get first element from empty queue')
    }
    return this.items[0]!
  }

  last(): T {
    if (this.items.length === 0) {
      throw new Error('Cannot get last element from empty queue')
    }
    return this.items[this.items.length - 1]!
  }

  count(): number {
    return this.items.length
  }

  toString(): string {
    return `RandomizedQueue(${this.items.length}) [${this.items.map(String).join(', ')}]`
  }

  join(separator?: string): string {
    return this.items.map(String).join(separator ?? ',')
  }

  getStats(): import('./types.js').RandomizedQueueStats {
    return {
      size: this.items.length,
      capacity: this.items.length,
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'RandomizedQueue', size: this.size, items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
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

  unique(): T[] {
    return [...new Set(this.toArray())]
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  max(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  equals(other: T[]): boolean {
    const a = this.toArray()
    if (a.length !== other.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== other[i]) return false
    }
    return true
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
  }

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  toReversed(): T[] {
    return [...this.toArray()].reverse()
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  toSpliced(start: number, deleteCount?: number): T[] {
    const arr = this.toArray()
    arr.splice(start, deleteCount ?? arr.length - start)
    return arr
  }

  with(index: number, value: T): T[] {
    const arr = [...this.toArray()]
    arr[index] = value
    return arr
  }

  toSet(): Set<T> {
    return new Set(this.toArray())
  }

  filterMap<U>(fn: (item: T) => U | undefined): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      const mapped = fn(item)
      if (mapped !== undefined) {
        result.push(mapped)
      }
    }
    return result
  }

  pipe<U>(transform: (items: T[]) => U[]): U[] {
    return transform(this.toArray())
  }

  distinctBy<K>(keyFn: (item: T) => K): T[] {
    const seen = new Set<K>()
    const result: T[] = []
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!seen.has(key)) {
        seen.add(key)
        result.push(item)
      }
    }
    return result
  }

  countBy<K>(keyFn: (item: T) => K): Map<K, number> {
    const counts = new Map<K, number>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }

  frequency(item: T): number {
    let count = 0
    for (const element of this.toArray()) {
      if (element === item) count++
    }
    return count
  }
}
