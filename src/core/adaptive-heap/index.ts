import type { Comparator, AdaptiveHeapOptions, AdaptiveHeapStats } from './types.js'

function defaultComparator<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class AdaptiveHeap<T> {
  private heap: T[] = []
  private cmp: Comparator<T>
  private accesses: Map<T, number> = new Map()
  private totalAccesses: number = 0

  constructor(options?: AdaptiveHeapOptions<T>) {
    this.cmp = options?.comparator ?? defaultComparator
  }

  get size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  push(value: T): void {
    this.heap.push(value)
    this.bubbleUp(this.heap.length - 1)
  }

  peek(): T | undefined {
    if (this.heap.length === 0) return undefined
    const val = this.heap[0]!
    this.recordAccess(val)
    return val
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]!
    this.recordAccess(top)
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.trickleDown(0)
    }
    return top
  }

  clear(): void {
    this.heap.length = 0
    this.accesses.clear()
    this.totalAccesses = 0
  }

  toArray(): T[] {
    return [...this.heap]
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.cmp(this.heap[i]!, value) === 0) return true
    }
    return false
  }

  remove(value: T): boolean {
    const index = this.heap.findIndex((v) => this.cmp(v, value) === 0)
    if (index === -1) return false
    this.removeAt(index)
    return true
  }

  update(oldValue: T, newValue: T): boolean {
    const index = this.heap.findIndex((v) => this.cmp(v, oldValue) === 0)
    if (index === -1) return false
    const oldAccess = this.accesses.get(this.heap[index]!) ?? 0
    this.accesses.delete(this.heap[index]!)
    this.heap[index] = newValue
    this.accesses.set(newValue, oldAccess)
    this.bubbleUp(index)
    this.trickleDown(index)
    return true
  }

  decreaseKey(value: T, newValue: T): boolean {
    const index = this.heap.findIndex((v) => this.cmp(v, value) === 0)
    if (index === -1) return false
    if (this.cmp(newValue, this.heap[index]!) >= 0) return false
    const oldAccess = this.accesses.get(this.heap[index]!) ?? 0
    this.accesses.delete(this.heap[index]!)
    this.heap[index] = newValue
    this.accesses.set(newValue, oldAccess)
    this.bubbleUp(index)
    return true
  }

  increaseKey(value: T, newValue: T): boolean {
    const index = this.heap.findIndex((v) => this.cmp(v, value) === 0)
    if (index === -1) return false
    if (this.cmp(newValue, this.heap[index]!) <= 0) return false
    const oldAccess = this.accesses.get(this.heap[index]!) ?? 0
    this.accesses.delete(this.heap[index]!)
    this.heap[index] = newValue
    this.accesses.set(newValue, oldAccess)
    this.trickleDown(index)
    return true
  }

  stats(): AdaptiveHeapStats {
    const n = this.heap.length
    let height = 0
    if (n > 0) {
      height = Math.floor(Math.log2(n)) + 1
    }
    return { size: n, height, totalAccesses: this.totalAccesses }
  }

  clone(): AdaptiveHeap<T> {
    const h = new AdaptiveHeap<T>({ comparator: this.cmp })
    h.heap = [...this.heap]
    h.accesses = new Map(this.accesses)
    h.totalAccesses = this.totalAccesses
    return h
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.heap.length; i++) {
      yield this.heap[i]!
    }
  }

  static from<T>(arr: T[], options?: AdaptiveHeapOptions<T>): AdaptiveHeap<T> {
    const h = new AdaptiveHeap<T>(options)
    for (const item of arr) {
      h.push(item)
    }
    return h
  }

  private parent(index: number): number {
    return (index - 1) >> 1
  }

  private leftChild(index: number): number {
    return 2 * index + 1
  }

  private rightChild(index: number): number {
    return 2 * index + 2
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const pi = this.parent(index)
      if (this.shouldPromote(index, pi)) {
        this.swap(index, pi)
        index = pi
      } else {
        break
      }
    }
  }

  private trickleDown(index: number): void {
    const n = this.heap.length
    while (true) {
      let target = index
      const left = this.leftChild(index)
      const right = this.rightChild(index)

      if (left < n && this.shouldPromote(left, target)) {
        target = left
      }
      if (right < n && this.shouldPromote(right, target)) {
        target = right
      }

      if (target === index) break

      this.swap(index, target)
      index = target
    }
  }

  private shouldPromote(childIndex: number, parentIndex: number): boolean {
    const child = this.heap[childIndex]!
    const parent = this.heap[parentIndex]!
    const cmpResult = this.cmp(child, parent)
    if (cmpResult < 0) return true
    if (cmpResult > 0) return false
    const childAccess = this.accesses.get(child) ?? 0
    const parentAccess = this.accesses.get(parent) ?? 0
    return childAccess > parentAccess
  }

  private removeAt(index: number): void {
    if (index === this.heap.length - 1) {
      const removed = this.heap.pop()!
      this.accesses.delete(removed)
      return
    }
    const removed = this.heap[index]!
    this.accesses.delete(removed)
    const last = this.heap.pop()!
    this.heap[index] = last
    this.bubbleUp(index)
    this.trickleDown(index)
  }

  private swap(i: number, j: number): void {
    const tmp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = tmp
  }

  private recordAccess(value: T): void {
    const count = (this.accesses.get(value) ?? 0) + 1
    this.accesses.set(value, count)
    this.totalAccesses++
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `${AdaptiveHeap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'AdaptiveHeap', size: this.size, items: this.toArray() }
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
    return this.heap.every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.heap.some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.heap.find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.heap.findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.heap.includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.heap
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.heap.join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.heap.slice(start, end)
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
    const arr = this.heap
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  max(): T | undefined {
    const arr = this.heap
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }

  take(n: number): T[] {
    return this.heap.slice(0, n)
  }

  skip(n: number): T[] {
    return this.heap.slice(n)
  }

  tap(fn: (collection: AdaptiveHeap<T>) => void): AdaptiveHeap<T> {
    fn(this)
    return this
  }

  equals(other: AdaptiveHeap<T>): boolean {
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

  static empty<T>(): AdaptiveHeap<T> {
    return new AdaptiveHeap<T>()
  }

  static of<T>(...items: T[]): AdaptiveHeap<T> {
    return AdaptiveHeap.from(items)
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.heap.lastIndexOf(item)
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

  merge(other: AdaptiveHeap<T>): AdaptiveHeap<T> {
    return AdaptiveHeap.from([...this.toArray(), ...other.toArray()])
  }
}
