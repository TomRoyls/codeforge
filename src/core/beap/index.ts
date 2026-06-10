import type { BeapOptions } from './types.js'

export class Beap<T = number> {
  private heap: T[] = []
  private compare: (a: T, b: T) => number

  constructor(options?: BeapOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  insert(value: T): void {
    this.heap.push(value)
    this.bubbleUp(this.heap.length - 1)
  }

  extractMin(): T {
    if (this.heap.length === 0) {
      throw new Error('Beap is empty')
    }
    const min = this.heap[0]!
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.bubbleDown(0)
    }
    return min
  }

  peek(): T {
    if (this.heap.length === 0) {
      throw new Error('Beap is empty')
    }
    return this.heap[0]!
  }

  contains(value: T): boolean {
    const n = this.heap.length
    if (n === 0) return false
    const h = this.height
    for (let row = h; row >= 0; row--) {
      const start = this.rowStart(row)
      const end = Math.min(start + row, n - 1)
      for (let col = end; col >= start; col--) {
        if (this.compare(this.heap[col]!, value) === 0) return true
      }
    }
    return false
  }

  delete(value: T): boolean {
    const idx = this.heap.findIndex((v) => this.compare(v, value) === 0)
    if (idx === -1) return false
    const last = this.heap.pop()!
    if (idx < this.heap.length) {
      this.heap[idx] = last
      if (idx > 0) {
        const parents = this.getParents(idx)
        const smaller = this.smallerParent(parents)
        if (smaller !== -1 && this.compare(this.heap[idx]!, this.heap[smaller]!) < 0) {
          this.bubbleUp(idx)
        } else {
          this.bubbleDown(idx)
        }
      } else {
        this.bubbleDown(idx)
      }
    }
    return true
  }

  get size(): number {
    return this.heap.length
  }

  get isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap = []
  }

  toArray(): T[] {
    return [...this.heap]
  }

  clone(): Beap<T> {
    const cloned = new Beap<T>({ comparator: this.compare })
    cloned.heap = [...this.heap]
    return cloned
  }

  static fromArray<U>(items: U[], options?: BeapOptions<U>): Beap<U> {
    const beap = new Beap<U>(options)
    for (let i = 0; i < items.length; i++) {
      beap.insert(items[i]!)
    }
    return beap
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.heap.length; i++) {
      callback(this.heap[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.heap.length; i++) {
      yield this.heap[i]!
    }
  }

  toSortedArray(): T[] {
    const cloned = this.clone()
    const result: T[] = []
    while (!cloned.isEmpty) {
      result.push(cloned.extractMin())
    }
    return result
  }

  get height(): number {
    return this.rowOf(this.heap.length - 1)
  }

  private rowOf(index: number): number {
    const n = index + 1
    return Math.ceil((Math.sqrt(8 * n + 1) - 1) / 2) - 1
  }

  private rowStart(row: number): number {
    return (row * (row + 1)) / 2
  }

  private getParents(index: number): [number, number] {
    const row = this.rowOf(index)
    const col = index - this.rowStart(row)
    const parentRowStart = this.rowStart(row - 1)
    const left = col > 0 ? parentRowStart + col - 1 : -1
    const right = col < row ? parentRowStart + col : -1
    return [left, right]
  }

  private getChildren(index: number): number[] {
    const row = this.rowOf(index)
    const col = index - this.rowStart(row)
    const childRowStart = this.rowStart(row + 1)
    const left = childRowStart + col
    const right = childRowStart + col + 1
    const children: number[] = []
    if (left < this.heap.length) children.push(left)
    if (right < this.heap.length) children.push(right)
    return children
  }

  private smallerParent(parents: [number, number]): number {
    if (parents[0] === -1 && parents[1] === -1) return -1
    if (parents[0] === -1) return parents[1]
    if (parents[1] === -1) return parents[0]
    if (this.compare(this.heap[parents[0]]!, this.heap[parents[1]]!) <= 0) {
      return parents[0]
    }
    return parents[1]
  }

  private bubbleUp(index: number): void {
    let current = index
    while (current > 0) {
      const parents = this.getParents(current)
      let smaller = this.smallerParent(parents)
      if (smaller === -1) break
      if (this.compare(this.heap[current]!, this.heap[smaller]!) < 0) {
        this.swap(current, smaller)
        current = smaller
      } else {
        break
      }
    }
  }

  private bubbleDown(index: number): void {
    let current = index
    while (true) {
      const children = this.getChildren(current)
      if (children.length === 0) break
      let smaller = children[0]!
      if (children.length > 1 && this.compare(this.heap[children[1]!]!, this.heap[smaller]!) < 0) {
        smaller = children[1]!
      }
      if (this.compare(this.heap[current]!, this.heap[smaller]!) > 0) {
        this.swap(current, smaller)
        current = smaller
      } else {
        break
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
  }

  has(value: T): boolean {
    return this.contains(value)
  }

toString(): string {
    return `${Beap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }
  toJSON() {
    return { type: 'Beap', size: this.size, items: this.toArray() }
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

  tap(fn: (collection: Beap<T>) => void): Beap<T> {
    fn(this)
    return this
  }

  equals(other: Beap<T>): boolean {
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

  static empty<T>(): Beap<T> {
    return new Beap<T>()
  }
}

export type { BeapOptions

} from './types.js'
