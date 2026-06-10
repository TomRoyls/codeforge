import type { MedianHeapOptions } from './types.js'

export class MedianHeap<T = number> {
  private lowerHalf: T[] = []
  private upperHalf: T[] = []
  private compare: (a: T, b: T) => number
  private _size = 0

  constructor(options?: MedianHeapOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  insert(value: T): void {
    if (this._size === 0) {
      this.lowerHalfPush(value)
    } else if (
      this.compare(value, this.lowerHalfPeek()!) <= 0
    ) {
      this.lowerHalfPush(value)
    } else {
      this.upperHalfPush(value)
    }
    this.rebalance()
    this._size++
  }

  median(): T {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    if (this._size % 2 === 1) {
      return this.lowerHalfPeek()!
    }
    const lower = this.lowerHalfPeek()!
    const upper = this.upperHalfPeek()!
    return this.avg(lower, upper)
  }

  remove(value: T): boolean {
    if (this._size === 0) return false

    let found = false

    for (let i = 0; i < this.lowerHalf.length; i++) {
      if (this.compare(this.lowerHalf[i]!, value) === 0) {
        this.lowerHalfRemoveAt(i)
        found = true
        break
      }
    }

    if (!found) {
      for (let i = 0; i < this.upperHalf.length; i++) {
        if (this.compare(this.upperHalf[i]!, value) === 0) {
          this.upperHalfRemoveAt(i)
          found = true
          break
        }
      }
    }

    if (found) {
      this._size--
      this.rebalance()
    }
    return found
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.lowerHalf = []
    this.upperHalf = []
    this._size = 0
  }

  toArray(): T[] {
    const lower = [...this.lowerHalf].sort((a, b) => this.compare(a, b))
    const upper = [...this.upperHalf].sort((a, b) => this.compare(a, b))
    return [...lower, ...upper]
  }

  clone(): MedianHeap<T> {
    const cloned = new MedianHeap<T>({ comparator: this.compare })
    cloned.lowerHalf = [...this.lowerHalf]
    cloned.upperHalf = [...this.upperHalf]
    cloned._size = this._size
    return cloned
  }

  static fromArray<U>(items: U[], options?: MedianHeapOptions<U>): MedianHeap<U> {
    const heap = new MedianHeap<U>(options)
    for (let i = 0; i < items.length; i++) {
      heap.insert(items[i]!)
    }
    return heap
  }

  forEach(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      yield arr[i]!
    }
  }

  contains(value: T): boolean {
    for (let i = 0; i < this.lowerHalf.length; i++) {
      if (this.compare(this.lowerHalf[i]!, value) === 0) return true
    }
    for (let i = 0; i < this.upperHalf.length; i++) {
      if (this.compare(this.upperHalf[i]!, value) === 0) return true
    }
    return false
  }

  min(): T {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    const sortedLower = [...this.lowerHalf].sort((a, b) => this.compare(a, b))
    const sortedUpper = [...this.upperHalf].sort((a, b) => this.compare(a, b))
    if (sortedLower.length === 0) return sortedUpper[0]!
    if (sortedUpper.length === 0) return sortedLower[0]!
    return this.compare(sortedLower[0]!, sortedUpper[0]!) <= 0
      ? sortedLower[0]!
      : sortedUpper[0]!
  }

  max(): T {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    const sortedLower = [...this.lowerHalf].sort((a, b) => this.compare(a, b))
    const sortedUpper = [...this.upperHalf].sort((a, b) => this.compare(a, b))
    if (sortedLower.length === 0) return sortedUpper[sortedUpper.length - 1]!
    if (sortedUpper.length === 0) return sortedLower[sortedLower.length - 1]!
    return this.compare(
      sortedLower[sortedLower.length - 1]!,
      sortedUpper[sortedUpper.length - 1]!,
    ) >= 0
      ? sortedLower[sortedLower.length - 1]!
      : sortedUpper[sortedUpper.length - 1]!
  }

  lowerMedian(): T {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    return this.lowerHalfPeek()!
  }

  upperMedian(): T {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    if (this._size % 2 === 1) {
      return this.lowerHalfPeek()!
    }
    return this.upperHalfPeek()!
  }

  private avg(a: T, b: T): T {
    if (typeof a === 'number' && typeof b === 'number') {
      return ((a + b) / 2) as T
    }
    return a
  }

  private rebalance(): void {
    const lowerLen = this.lowerHalf.length
    const upperLen = this.upperHalf.length
    if (lowerLen > upperLen + 1) {
      const val = this.lowerHalfPop()!
      this.upperHalfPush(val)
    } else if (upperLen > lowerLen) {
      const val = this.upperHalfPop()!
      this.lowerHalfPush(val)
    }
  }

  private lowerHalfPush(value: T): void {
    this.lowerHalf.push(value)
    this.lowerHalfSiftUp(this.lowerHalf.length - 1)
  }

  private lowerHalfPop(): T | undefined {
    if (this.lowerHalf.length === 0) return undefined
    const top = this.lowerHalf[0]!
    const last = this.lowerHalf.pop()!
    if (this.lowerHalf.length > 0) {
      this.lowerHalf[0] = last
      this.lowerHalfSiftDown(0)
    }
    return top
  }

  private lowerHalfPeek(): T | undefined {
    return this.lowerHalf[0]
  }

  private lowerHalfSiftUp(index: number): void {
    const arr = this.lowerHalf
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (this.compare(arr[index]!, arr[parent]!) > 0) {
        const tmp = arr[index]!
        arr[index] = arr[parent]!
        arr[parent] = tmp
        index = parent
      } else {
        break
      }
    }
  }

  private lowerHalfSiftDown(index: number): void {
    const arr = this.lowerHalf
    const len = arr.length
    while (true) {
      let largest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < len && this.compare(arr[left]!, arr[largest]!) > 0) {
        largest = left
      }
      if (right < len && this.compare(arr[right]!, arr[largest]!) > 0) {
        largest = right
      }
      if (largest !== index) {
        const tmp = arr[index]!
        arr[index] = arr[largest]!
        arr[largest] = tmp
        index = largest
      } else {
        break
      }
    }
  }

  private upperHalfPush(value: T): void {
    this.upperHalf.push(value)
    this.upperHalfSiftUp(this.upperHalf.length - 1)
  }

  private upperHalfPop(): T | undefined {
    if (this.upperHalf.length === 0) return undefined
    const top = this.upperHalf[0]!
    const last = this.upperHalf.pop()!
    if (this.upperHalf.length > 0) {
      this.upperHalf[0] = last
      this.upperHalfSiftDown(0)
    }
    return top
  }

  private upperHalfPeek(): T | undefined {
    return this.upperHalf[0]
  }

  private upperHalfSiftUp(index: number): void {
    const arr = this.upperHalf
    while (index > 0) {
      const parent = (index - 1) >> 1
      if (this.compare(arr[index]!, arr[parent]!) < 0) {
        const tmp = arr[index]!
        arr[index] = arr[parent]!
        arr[parent] = tmp
        index = parent
      } else {
        break
      }
    }
  }

  private upperHalfSiftDown(index: number): void {
    const arr = this.upperHalf
    const len = arr.length
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      if (left < len && this.compare(arr[left]!, arr[smallest]!) < 0) {
        smallest = left
      }
      if (right < len && this.compare(arr[right]!, arr[smallest]!) < 0) {
        smallest = right
      }
      if (smallest !== index) {
        const tmp = arr[index]!
        arr[index] = arr[smallest]!
        arr[smallest] = tmp
        index = smallest
      } else {
        break
      }
    }
  }

  private lowerHalfRemoveAt(index: number): void {
    const last = this.lowerHalf.pop()!
    if (index >= this.lowerHalf.length) return
    if (this.lowerHalf.length > 0) {
      this.lowerHalf[index] = last
      const parent = (index - 1) >> 1
      if (index > 0 && this.compare(this.lowerHalf[index]!, this.lowerHalf[parent]!) > 0) {
        this.lowerHalfSiftUp(index)
      } else {
        this.lowerHalfSiftDown(index)
      }
    }
  }

  private upperHalfRemoveAt(index: number): void {
    const last = this.upperHalf.pop()!
    if (index >= this.upperHalf.length) return
    if (this.upperHalf.length > 0) {
      this.upperHalf[index] = last
      const parent = (index - 1) >> 1
      if (index > 0 && this.compare(this.upperHalf[index]!, this.upperHalf[parent]!) < 0) {
        this.upperHalfSiftUp(index)
      } else {
        this.upperHalfSiftDown(index)
      }
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `MedianHeap({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'MedianHeap', size: this.size, items: this.toArray() }
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

  count(predicate: (item: T) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
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

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  get [Symbol.toStringTag](): string {
    return 'MedianHeap'
  }
}

export type { MedianHeapOptions } from './types.js'
