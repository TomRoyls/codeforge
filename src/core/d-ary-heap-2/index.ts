import type { Comparator, DAryHeapOptions, DAryHeapStats } from './types.js'

function defaultComparator<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class DAryHeap<T> {
  private heap: T[] = []
  private cmp: Comparator<T>
  private branchingFactor: number

  constructor(options?: DAryHeapOptions<T>) {
    this.cmp = options?.comparator ?? defaultComparator
    this.branchingFactor = options?.d ?? 4
    if (this.branchingFactor < 2) {
      this.branchingFactor = 2
    }
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
    return this.heap[0]!
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]!
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.trickleDown(0)
    }
    return top
  }

  clear(): void {
    this.heap.length = 0
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

  replace(value: T): T | undefined {
    if (this.heap.length === 0) {
      this.push(value)
      return undefined
    }
    const old = this.heap[0]!
    this.heap[0] = value
    this.trickleDown(0)
    return old
  }

  update(oldValue: T, newValue: T): boolean {
    const index = this.heap.findIndex((v) => this.cmp(v, oldValue) === 0)
    if (index === -1) return false
    this.heap[index] = newValue
    const cmpResult = this.cmp(newValue, oldValue)
    if (cmpResult < 0) {
      this.bubbleUp(index)
    } else if (cmpResult > 0) {
      this.trickleDown(index)
    }
    return true
  }

  stats(): DAryHeapStats {
    const n = this.heap.length
    let height = 0
    if (n > 0) {
      height = Math.ceil(Math.log(n * (this.branchingFactor - 1) + 1) / Math.log(this.branchingFactor))
    }
    return { size: n, height, d: this.branchingFactor }
  }

  clone(): DAryHeap<T> {
    const h = new DAryHeap<T>({ d: this.branchingFactor, comparator: this.cmp })
    h.heap = [...this.heap]
    return h
  }

  merge(other: DAryHeap<T>): void {
    if (other === this) {
      const copy = [...other.heap];
      for (const item of copy) {
        this.push(item);
      }
      return;
    }
    for (let i = 0; i < other.heap.length; i++) {
      this.push(other.heap[i]!)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.heap.length; i++) {
      yield this.heap[i]!
    }
  }

  static from<T>(arr: T[], options?: DAryHeapOptions<T>): DAryHeap<T> {
    const h = new DAryHeap<T>(options)
    for (const item of arr) {
      h.push(item)
    }
    return h
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / this.branchingFactor)
  }

  private firstChild(index: number): number {
    return this.branchingFactor * index + 1
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const p = this.parent(index)
      if (this.cmp(this.heap[index]!, this.heap[p]!) < 0) {
        this.swap(index, p)
        index = p
      } else {
        break
      }
    }
  }

  private trickleDown(index: number): void {
    const n = this.heap.length
    while (true) {
      const first = this.firstChild(index)
      if (first >= n) break
      let smallest = first
      const last = Math.min(first + this.branchingFactor, n)
      for (let c = first + 1; c < last; c++) {
        if (this.cmp(this.heap[c]!, this.heap[smallest]!) < 0) {
          smallest = c
        }
      }
      if (this.cmp(this.heap[smallest]!, this.heap[index]!) < 0) {
        this.swap(index, smallest)
        index = smallest
      } else {
        break
      }
    }
  }

  private removeAt(index: number): void {
    if (index === this.heap.length - 1) {
      this.heap.pop()
      return
    }
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

  toString(): string {
    return `${DAryHeap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
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
    return { type: 'DAryHeap', size: this.size, items: this.toArray() }
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

  tap(fn: (collection: DAryHeap<T>) => void): DAryHeap<T> {
    fn(this)
    return this
  }

  equals(other: DAryHeap<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  static empty<T>(): DAryHeap<T> {
    return new DAryHeap<T>()
  }

  static of<T>(...items: T[]): DAryHeap<T> {
    return DAryHeap.from(items)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
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
}
