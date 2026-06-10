import type { BoundedPriorityQueueOptions, Comparator } from './types.js'

const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class BoundedPriorityQueue<T> {
  private _heap: T[]
  private readonly _capacity: number
  private readonly _comparator: Comparator<T>

  constructor(capacity: number, options?: BoundedPriorityQueueOptions<T>) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error('capacity must be a positive integer')
    }
    this._capacity = capacity
    this._comparator = options?.comparator ?? defaultComparator
    this._heap = []
  }

  private _parent(i: number): number {
    return (i - 1) >> 1
  }

  private _leftChild(i: number): number {
    return (i << 1) + 1
  }

  private _rightChild(i: number): number {
    return (i << 1) + 2
  }

  private _swap(i: number, j: number): void {
    const tmp = this._heap[i]!
    this._heap[i] = this._heap[j]!
    this._heap[j] = tmp
  }

  private _bubbleUp(i: number): void {
    while (i > 0) {
      const p = this._parent(i)
      if (this._comparator(this._heap[i]!, this._heap[p]!) < 0) {
        this._swap(i, p)
        i = p
      } else {
        break
      }
    }
  }

  private _sinkDown(i: number): void {
    const n = this._heap.length
    while (true) {
      let smallest = i
      const left = this._leftChild(i)
      const right = this._rightChild(i)
      if (left < n && this._comparator(this._heap[left]!, this._heap[smallest]!) < 0) {
        smallest = left
      }
      if (right < n && this._comparator(this._heap[right]!, this._heap[smallest]!) < 0) {
        smallest = right
      }
      if (smallest === i) break
      this._swap(i, smallest)
      i = smallest
    }
  }

  enqueue(value: T): T | undefined {
    return this.push(value)
  }

  push(value: T): T | undefined {
    if (this._heap.length < this._capacity) {
      this._heap.push(value)
      this._bubbleUp(this._heap.length - 1)
      return undefined
    }
    if (this._comparator(value, this._heap[0]!) <= 0) {
      return value
    }
    const evicted = this._heap[0]!
    this._heap[0] = value
    this._sinkDown(0)
    return evicted
  }

  dequeue(): T {
    return this.pop()
  }

  pop(): T {
    if (this._heap.length === 0) {
      throw new Error('pop called on empty queue')
    }
    const result = this._heap[0]!
    const last = this._heap.pop()!
    if (this._heap.length > 0) {
      this._heap[0] = last
      this._sinkDown(0)
    }
    return result
  }

  peek(): T {
    if (this._heap.length === 0) {
      throw new Error('peek called on empty queue')
    }
    return this._heap[0]!
  }

  get size(): number {
    return this._heap.length
  }

  get isEmpty(): boolean {
    return this._heap.length === 0
  }

  get isFull(): boolean {
    return this._heap.length === this._capacity
  }

  get capacity(): number {
    return this._capacity
  }

  clear(): void {
    this._heap = []
  }

  toArray(): T[] {
    const sorted = [...this._heap]
    sorted.sort(this._comparator)
    return sorted
  }

  contains(value: T): boolean {
    for (let i = 0; i < this._heap.length; i++) {
      if (this._comparator(this._heap[i]!, value) === 0) return true
    }
    return false
  }

  merge(other: BoundedPriorityQueue<T>): void {
    if (other === this) return
    const source = other.toArray()
    for (const item of source) {
      this.push(item)
    }
    other.clear()
  }

  *[Symbol.iterator](): Iterator<T> {
    const sorted = this.toArray()
    for (const item of sorted) {
      yield item
    }
  }

  toString(): string {
    return `${BoundedPriorityQueue}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'BoundedPriorityQueue', size: this.size, items: this.toArray() }
  }

  map<R>(fn: (item: T) => R): R[] {
    return this.toArray().map(fn)
  }

  filter(fn: (item: T) => boolean): T[] {
    return this.toArray().filter(fn)
  }

  reduce<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduce(fn, initial)
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

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }


  drainN(n: number): T[] {
    const result: T[] = []
    for (let i = 0; i < n && this.size > 0; i++) {
      result.push(this.pop()!)
    }
    return result
  }

  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
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

  groupBy<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
  }

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
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


  tap(fn: (collection: BoundedPriorityQueue<T>) => void): BoundedPriorityQueue<T> {
    fn(this)
    return this
  }

  equals(other: BoundedPriorityQueue<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  zip<U>(other: Iterable<U>): [T, U][] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: [T, U][] = []
    for (let i = 0; i < len; i++) {
      result.push([a[i]!, b[i]!])
    }
    return result
  }

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }


  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: Iterable<T>): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
  }

  difference(other: Iterable<T>): T[] {
    const exclude = new Set(other)
    return this.toArray().filter(item => !exclude.has(item))
  }

  union(other: Iterable<T>): T[] {
    const set = new Set<T>([...this.toArray(), ...other])
    return [...set]
  }

  pluck<K extends keyof T>(key: K): T[K][] {
    return this.toArray().map(item => item[key])
  }

  nth(n: number): T | undefined {
    return this.at(n - 1)
  }

  head(): T | undefined {
    return this.first()
  }

  tail(): T[] {
    return this.skip(1)
  }

  reduceRight<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduceRight(fn, initial)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  countBy<K>(keyFn: (item: T) => K): Map<K, number> {
    const counts = new Map<K, number>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }


  toReversed(): T[] {
    return [...this.toArray()].reverse()
  }
}

export type { BoundedPriorityQueueOptions, Comparator } from './types.js'
