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

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: T[]): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
  }

  difference(other: T[]): T[] {
    const set = new Set(other)
    return this.toArray().filter(item => !set.has(item))
  }

  union(other: T[]): T[] {
    return [...new Set([...this.toArray(), ...other])]
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

  intersperse(separator: T): T[] {
    const arr = this.toArray()
    if (arr.length <= 1) return [...arr]
    const result: T[] = []
    for (let i = 0; i < arr.length; i++) {
      if (i > 0) result.push(separator)
      result.push(arr[i]!)
    }
    return result
  }

  prepend(item: T): T[] {
    return [item, ...this.toArray()]
  }

  append(item: T): T[] {
    return [...this.toArray(), item]
  }

  zipWith<U, R>(other: Iterable<U>, fn: (a: T, b: U) => R): R[] {
    const a = this.toArray()
    const b = Array.from(other)
    const len = Math.min(a.length, b.length)
    const result: R[] = []
    for (let i = 0; i < len; i++) {
      result.push(fn(a[i]!, b[i]!))
    }
    return result
  }

  rotate(n: number): T[] {
    const arr = this.toArray()
    if (arr.length === 0) return []
    const k = ((n % arr.length) + arr.length) % arr.length
    return [...arr.slice(k), ...arr.slice(0, k)]
  }

  dot(this: { toArray(): number[] }, other: number[]): number {
    const a = this.toArray()
    const len = Math.min(a.length, other.length)
    let sum = 0
    for (let i = 0; i < len; i++) {
      sum += a[i]! * other[i]!
    }
    return sum
  }

  sliding(size: number, step = 1): T[][] {
    const arr = this.toArray()
    if (size <= 0 || step <= 0) return []
    const result: T[][] = []
    for (let i = 0; i + size <= arr.length; i += step) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  adjacentPairs(): [T, T][] {
    const arr = this.toArray()
    const result: [T, T][] = []
    for (let i = 0; i + 1 < arr.length; i++) {
      result.push([arr[i]!, arr[i + 1]!])
    }
    return result
  }

  transpose<U>(this: { toArray(): U[][] }): U[][] {
    const matrix = this.toArray()
    if (matrix.length === 0) return []
    const cols = Math.max(...matrix.map(r => r.length))
    const result: U[][] = []
    for (let c = 0; c < cols; c++) {
      const row: U[] = []
      for (let r = 0; r < matrix.length; r++) {
        if (c < matrix[r]!.length) {
          row.push(matrix[r]![c]!)
        }
      }
      result.push(row)
    }
    return result
  }

  countWhere(predicate: (item: T, index: number) => boolean): number {
    return this.toArray().filter(predicate).length
  }

  associate<K, V>(fn: (item: T, index: number) => [K, V]): Map<K, V> {
    const result = new Map<K, V>()
    this.toArray().forEach((item, i) => {
      const [k, v] = fn(item, i)
      result.set(k, v)
    })
    return result
  }

  indexBy<K>(keyFn: (item: T) => K): Map<K, T> {
    const result = new Map<K, T>()
    this.toArray().forEach(item => {
      result.set(keyFn(item), item)
    })
    return result
  }

  takeWhile(predicate: (item: T, index: number) => boolean): T[] {
    const arr = this.toArray()
    const result: T[] = []
    for (let i = 0; i < arr.length; i++) {
      if (!predicate(arr[i]!, i)) break
      result.push(arr[i]!)
    }
    return result
  }

  dropWhile(predicate: (item: T, index: number) => boolean): T[] {
    const arr = this.toArray()
    let i = 0
    while (i < arr.length && predicate(arr[i]!, i)) {
      i++
    }
    return arr.slice(i)
  }

  gather(): T[][] {
    const arr = this.toArray()
    if (arr.length === 0) return []
    const result: T[][] = [[arr[0]!]]
    for (let i = 1; i < arr.length; i++) {
      const last = result[result.length - 1]!
      if (arr[i] === last[last.length - 1]) {
        last.push(arr[i]!)
      } else {
        result.push([arr[i]!])
      }
    }
    return result
  }

  splitWhen(predicate: (item: T, index: number) => boolean): [T[], T[]] {
    const arr = this.toArray()
    const idx = arr.findIndex(predicate)
    if (idx === -1) return [[...arr], []]
    return [arr.slice(0, idx), arr.slice(idx)]
  }

  satisfies<S extends T>(guard: (item: T) => item is S): this is { toArray(): S[] } {
    return this.every(guard)
  }

  fill(value: T, count: number): T[] {
    const arr = this.toArray()
    const pad = Array(Math.max(0, count)).fill(value) as T[]
    return [...arr, ...pad]
  }

  padStart(value: T, minLength: number): T[] {
    const arr = this.toArray()
    if (arr.length >= minLength) return [...arr]
    const pad = Array(minLength - arr.length).fill(value) as T[]
    return [...pad, ...arr]
  }

  takeRight(n: number): T[] {
    const arr = this.toArray()
    return arr.slice(Math.max(0, arr.length - n))
  }

  dropRight(n: number): T[] {
    const arr = this.toArray()
    return arr.slice(0, Math.max(0, arr.length - n))
  }

  firstOrDefault(defaultValue: T): T {
    const arr = this.toArray()
    return arr.length > 0 ? arr[0]! : defaultValue
  }

  lastOrDefault(defaultValue: T): T {
    const arr = this.toArray()
    return arr.length > 0 ? arr[arr.length - 1]! : defaultValue
  }

  elementAt(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 && index < arr.length ? arr[index]! : undefined
  }

  elementAtOrDefault(index: number, defaultValue: T): T {
    const arr = this.toArray()
    return index >= 0 && index < arr.length ? arr[index]! : defaultValue
  }

  indexedForEach(fn: (item: T, index: number) => void): void {
    this.toArray().forEach((item, i) => fn(item, i))
  }

  occurrencesOf(value: T): number {
    return this.toArray().filter(item => item === value).length
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

  unzip<K, V>(this: { toArray(): [K, V][] }): [K[], V[]] {
    const pairs = this.toArray()
    const keys: K[] = []
    const values: V[] = []
    for (const [k, v] of pairs) {
      keys.push(k)
      values.push(v)
    }
    return [keys, values]
  }

  memoize<R>(fn: (items: T[]) => R): () => R {
    let cached: R | undefined
    let computed = false
    return () => {
      if (!computed) {
        cached = fn(this.toArray())
        computed = true
      }
      return cached as R
    }
  }

  flattenDeep(this: { toArray(): any[] }): any[] {
    const result: any[] = []
    const stack = [...this.toArray()].reverse()
    while (stack.length > 0) {
      const item = stack.pop()!
      if (Array.isArray(item)) {
        stack.push(...item.reverse())
      } else {
        result.push(item)
      }
    }
    return result
  }

  cartesianProduct<U>(other: Iterable<U>): [T, U][] {
    const a = this.toArray()
    const b = Array.from(other)
    const result: [T, U][] = []
    for (const x of a) {
      for (const y of b) {
        result.push([x, y])
      }
    }
    return result
  }

  indexOf(item: T): number {
    return this.toArray().indexOf(item)
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
  }

  swap(i: number, j: number): T[] {
    const arr = [...this.toArray()]
    if (i < 0 || i >= arr.length || j < 0 || j >= arr.length || i === j) return arr
    const temp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = temp
    return arr
  }

  sumBy(fn: (item: T) => number): number {
    return this.toArray().reduce((acc, item) => acc + fn(item), 0)
  }

  averageBy(fn: (item: T) => number): number {
    const arr = this.toArray()
    if (arr.length === 0) return 0
    return this.sumBy(fn) / arr.length
  }
}

export type { MedianHeapOptions } from './types.js'
