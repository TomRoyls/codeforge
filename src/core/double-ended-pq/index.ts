import type { DoubleEndedPQOptions } from './types.js'
import { DEFAULT_COMPARATOR } from './types.js'

export class DoubleEndedPQ<T = number> {
  private heap: T[] = []
  private compare: (a: T, b: T) => number

  constructor(options?: DoubleEndedPQOptions<T>) {
    this.compare = options?.comparator ?? DEFAULT_COMPARATOR
  }

  push(item: T): void {
    this.heap.push(item)
    if (this.heap.length > 1) {
      this.bubbleUp(this.heap.length - 1)
    }
  }

  popMin(): T {
    if (this.heap.length === 0) {
      throw new Error('DoubleEndedPQ is empty')
    }
    const min = this.heap[0]!
    this.removeAt(0)
    return min
  }

  popMax(): T {
    if (this.heap.length === 0) {
      throw new Error('DoubleEndedPQ is empty')
    }
    const maxIndex = this.findMaxIndex()
    const max = this.heap[maxIndex]!
    this.removeAt(maxIndex)
    return max
  }

  peekMin(): T {
    if (this.heap.length === 0) {
      throw new Error('DoubleEndedPQ is empty')
    }
    return this.heap[0]!
  }

  peekMax(): T {
    if (this.heap.length === 0) {
      throw new Error('DoubleEndedPQ is empty')
    }
    const maxIndex = this.findMaxIndex()
    return this.heap[maxIndex]!
  }

  size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  clear(): void {
    this.heap = []
  }

  toArray(): T[] {
    return [...this.heap]
  }

  toSortedArray(): T[] {
    const sorted = [...this.heap]
    sorted.sort(this.compare)
    return sorted
  }

  contains(item: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, item) === 0) {
        return true
      }
    }
    return false
  }

  remove(item: T): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      if (this.compare(this.heap[i]!, item) === 0) {
        this.removeAt(i)
        return true
      }
    }
    return false
  }

  clone(): DoubleEndedPQ<T> {
    const cloned = new DoubleEndedPQ<T>({ comparator: this.compare })
    cloned.heap = [...this.heap]
    return cloned
  }

  static fromArray<U>(items: U[], options?: DoubleEndedPQOptions<U>): DoubleEndedPQ<U> {
    const pq = new DoubleEndedPQ<U>(options)
    for (const item of items) {
      pq.push(item)
    }
    return pq
  }

  forEach(callback: (item: T) => void): void {
    for (let i = 0; i < this.heap.length; i++) {
      callback(this.heap[i]!)
    }
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const heap = this.heap
    return {
      next(): IteratorResult<T> {
        if (index < heap.length) {
          return { value: heap[index++]!, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  private findMaxIndex(): number {
    if (this.heap.length === 1) return 0
    if (this.heap.length === 2) return 1
    return this.compare(this.heap[1]!, this.heap[2]!) > 0 ? 1 : 2
  }

  private removeAt(index: number): void {
    const last = this.heap.pop()
    if (index >= this.heap.length || last === undefined) {
      return
    }
    this.heap[index] = last
    this.bubbleUp(index)
    this.trickleDown(index)
  }

  private isMinLevel(index: number): boolean {
    let level = 0
    let i = index + 1
    while (i > 1) {
      i >>= 1
      level++
    }
    return level % 2 === 0
  }

  private parentIndex(index: number): number {
    return Math.floor((index - 1) / 2)
  }

  private grandparentIndex(index: number): number {
    return Math.floor((Math.floor((index - 1) / 2) - 1) / 2)
  }

  private bubbleUp(index: number): void {
    if (this.isMinLevel(index)) {
      if (index > 0) {
        const p = this.parentIndex(index)
        if (this.compare(this.heap[index]!, this.heap[p]!) > 0) {
          this.swap(index, p)
          this.bubbleUpMax(p)
          return
        }
      }
      this.bubbleUpMin(index)
    } else {
      if (index > 0) {
        const p = this.parentIndex(index)
        if (this.compare(this.heap[index]!, this.heap[p]!) < 0) {
          this.swap(index, p)
          this.bubbleUpMin(p)
          return
        }
      }
      this.bubbleUpMax(index)
    }
  }

  private bubbleUpMin(index: number): void {
    while (index > 2) {
      const gp = this.grandparentIndex(index)
      if (gp >= 0 && this.compare(this.heap[index]!, this.heap[gp]!) < 0) {
        this.swap(index, gp)
        index = gp
      } else {
        break
      }
    }
  }

  private bubbleUpMax(index: number): void {
    while (index > 2) {
      const gp = this.grandparentIndex(index)
      if (gp >= 0 && this.compare(this.heap[index]!, this.heap[gp]!) > 0) {
        this.swap(index, gp)
        index = gp
      } else {
        break
      }
    }
  }

  private trickleDown(index: number): void {
    if (this.isMinLevel(index)) {
      this.trickleDownMin(index)
    } else {
      this.trickleDownMax(index)
    }
  }

  private trickleDownMin(index: number): void {
    while (2 * index + 1 < this.heap.length) {
      const m = this.indexOfSmallestDescendant(index)
      if (this.isGrandchild(index, m)) {
        if (this.compare(this.heap[m]!, this.heap[index]!) < 0) {
          this.swap(index, m)
          const p = this.parentIndex(m)
          if (p >= 0 && this.compare(this.heap[m]!, this.heap[p]!) > 0) {
            this.swap(m, p)
          }
          index = m
        } else {
          break
        }
      } else {
        if (this.compare(this.heap[m]!, this.heap[index]!) < 0) {
          this.swap(index, m)
        }
        break
      }
    }
  }

  private trickleDownMax(index: number): void {
    while (2 * index + 1 < this.heap.length) {
      const m = this.indexOfLargestDescendant(index)
      if (this.isGrandchild(index, m)) {
        if (this.compare(this.heap[m]!, this.heap[index]!) > 0) {
          this.swap(index, m)
          const p = this.parentIndex(m)
          if (p >= 0 && this.compare(this.heap[m]!, this.heap[p]!) < 0) {
            this.swap(m, p)
          }
          index = m
        } else {
          break
        }
      } else {
        if (this.compare(this.heap[m]!, this.heap[index]!) > 0) {
          this.swap(index, m)
        }
        break
      }
    }
  }

  private indexOfSmallestDescendant(index: number): number {
    const fc = 2 * index + 1
    let smallest = fc
    if (fc + 1 < this.heap.length && this.compare(this.heap[fc + 1]!, this.heap[smallest]!) < 0) {
      smallest = fc + 1
    }
    for (let gc = 4 * index + 3; gc <= 4 * index + 6; gc++) {
      if (gc < this.heap.length && this.compare(this.heap[gc]!, this.heap[smallest]!) < 0) {
        smallest = gc
      }
    }
    return smallest
  }

  private indexOfLargestDescendant(index: number): number {
    const fc = 2 * index + 1
    let largest = fc
    if (fc + 1 < this.heap.length && this.compare(this.heap[fc + 1]!, this.heap[largest]!) > 0) {
      largest = fc + 1
    }
    for (let gc = 4 * index + 3; gc <= 4 * index + 6; gc++) {
      if (gc < this.heap.length && this.compare(this.heap[gc]!, this.heap[largest]!) > 0) {
        largest = gc
      }
    }
    return largest
  }

  private isGrandchild(index: number, candidate: number): boolean {
    return candidate >= 4 * index + 3 && candidate <= 4 * index + 6
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!
    this.heap[i] = this.heap[j]!
    this.heap[j] = temp
  }

  toString(): string {
    return `${DoubleEndedPQ}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  has(item: T): boolean {
    return this.contains(item)
  }

  toJSON() {
    return { type: 'DoubleEndedPQ', items: this.toArray() }
  }

  peek(): T {
    return this.peekMin()
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

  static empty<T>(): DoubleEndedPQ<T> {
    return new DoubleEndedPQ<T>()
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
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

  shuffle(): T[] {
    const arr = [...this.toArray()]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = arr[i]!
      arr[i] = arr[j]!
      arr[j] = tmp
    }
    return arr
  }

  sample(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr[Math.floor(Math.random() * arr.length)]
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

  interleave(other: T[]): T[] {
    const a = this.toArray()
    const result: T[] = []
    const maxLen = Math.max(a.length, other.length)
    for (let i = 0; i < maxLen; i++) {
      if (i < a.length) result.push(a[i]!)
      if (i < other.length) result.push(other[i]!)
    }
    return result
  }

  toMap<K, V>(keyFn: (item: T) => K, valueFn: (item: T) => V): Map<K, V> {
    const map = new Map<K, V>()
    for (const item of this.toArray()) {
      map.set(keyFn(item), valueFn(item))
    }
    return map
  }

  groupBy<K>(keyFn: (item: T) => K): Record<string, T[]> {
    const groups: Record<string, T[]> = {}
    for (const item of this.toArray()) {
      const key = String(keyFn(item))
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    }
    return groups
  }

  groupByMap<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      const group = groups.get(key)
      if (group) {
        group.push(item)
      } else {
        groups.set(key, [item])
      }
    }
    return groups
  }

  sum(this: { toArray(): number[] }): number {
    return this.toArray().reduce((a, b) => a + b, 0)
  }

  average(this: { toArray(): number[] }): number {
    const arr = this.toArray()
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
  }

  reduceWhile<U>(
    predicate: (acc: U) => boolean,
    reducer: (acc: U, item: T) => U,
    initialValue: U
  ): U {
    let acc = initialValue
    for (const item of this.toArray()) {
      if (!predicate(acc)) break
      acc = reducer(acc, item)
    }
    return acc
  }

  minBy<K>(keyFn: (item: T) => K): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    let minItem = arr[0]!
    let minKey = keyFn(minItem)
    for (let i = 1; i < arr.length; i++) {
      const item = arr[i]!
      const key = keyFn(item)
      if (key < minKey) {
        minKey = key
        minItem = item
      }
    }
    return minItem
  }

  maxBy<K>(keyFn: (item: T) => K): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    let maxItem = arr[0]!
    let maxKey = keyFn(maxItem)
    for (let i = 1; i < arr.length; i++) {
      const item = arr[i]!
      const key = keyFn(item)
      if (key > maxKey) {
        maxKey = key
        maxItem = item
      }
    }
    return maxItem
  }

  span(predicate: (item: T) => boolean): [T[], T[]] {
    const arr = this.toArray()
    let i = 0
    while (i < arr.length && predicate(arr[i]!)) {
      i++
    }
    return [arr.slice(0, i), arr.slice(i)]
  }

  breakWhen(predicate: (item: T) => boolean): [T[], T[]] {
    return this.span(item => !predicate(item))
  }

  scan<U>(reducer: (acc: U, item: T) => U, initialValue: U): U[] {
    const result: U[] = []
    let acc = initialValue
    for (const item of this.toArray()) {
      acc = reducer(acc, item)
      result.push(acc)
    }
    return result
  }

  flatten(depth: number = 1): T[] {
    const flat = (arr: T[], d: number): T[] => {
      const result: T[] = []
      for (const item of arr) {
        if (Array.isArray(item) && d > 0) {
          result.push(...flat(item as unknown as T[], d - 1))
        } else {
          result.push(item)
        }
      }
      return result
    }
    return flat(this.toArray(), depth)
  }

  get [Symbol.toStringTag](): string {
    return 'DoubleEndedPQ'
  }

  map<U>(fn: (item: T, index: number) => U): U[] {
    return this.toArray().map(fn)
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.toArray().filter(predicate)
  }

  reduce<U>(reducer: (acc: U, item: T) => U, initialValue: U): U {
    return this.toArray().reduce(reducer, initialValue)
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  reduceRight<U>(reducer: (acc: U, item: T) => U, initialValue: U): U {
    return this.toArray().reduceRight(reducer, initialValue)
  }
}

export { DEFAULT_COMPARATOR } from './types.js'
export type { DoubleEndedPQOptions } from './types.js'
