import type { ResizableArrayOptions } from './types.js'

export class ResizableArray<T> {
  private buffer: (T | undefined)[]
  private _length: number = 0
  private _capacity: number
  private growthFactor: number
  private shrinkThreshold: number

  constructor(initialCapacity: number = 8, options?: ResizableArrayOptions) {
    this._capacity = Math.max(1, Math.floor(initialCapacity))
    this.growthFactor = options?.growthFactor ?? 2
    this.shrinkThreshold = options?.shrinkThreshold ?? 0.25
    this.buffer = new Array<T | undefined>(this._capacity)
  }

  private grow(): void {
    const newCapacity = Math.max(this._capacity + 1, Math.floor(this._capacity * this.growthFactor))
    this.resizeBuffer(newCapacity)
  }

  private shrink(): void {
    const newCapacity = Math.max(1, Math.floor(this._capacity / this.growthFactor))
    if (newCapacity < this._capacity) {
      this.resizeBuffer(newCapacity)
    }
  }

  private resizeBuffer(newCapacity: number): void {
    const newBuffer = new Array<T | undefined>(newCapacity)
    for (let i = 0; i < this._length; i++) {
      newBuffer[i] = this.buffer[i]
    }
    this.buffer = newBuffer
    this._capacity = newCapacity
  }

  private checkShrink(): void {
    if (this._capacity > 1 && this._length / this._capacity < this.shrinkThreshold) {
      this.shrink()
    }
  }

  push(item: T): void {
    if (this._length >= this._capacity) {
      this.grow()
    }
    this.buffer[this._length] = item
    this._length++
  }

  pop(): T {
    if (this._length === 0) {
      throw new RangeError('Cannot pop from empty array')
    }
    this._length--
    const value = this.buffer[this._length]
    this.buffer[this._length] = undefined
    this.checkShrink()
    return value as T
  }

  get(index: number): T {
    if (index < 0 || index >= this._length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._length})`)
    }
    return this.buffer[index] as T
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._length})`)
    }
    this.buffer[index] = value
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._length}]`)
    }
    if (this._length >= this._capacity) {
      this.grow()
    }
    for (let i = this._length; i > index; i--) {
      this.buffer[i] = this.buffer[i - 1]
    }
    this.buffer[index] = value
    this._length++
  }

  removeAt(index: number): T {
    if (index < 0 || index >= this._length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._length})`)
    }
    const value = this.buffer[index] as T
    for (let i = index; i < this._length - 1; i++) {
      this.buffer[i] = this.buffer[i + 1]
    }
    this._length--
    this.buffer[this._length] = undefined
    this.checkShrink()
    return value
  }

  first(): T {
    if (this._length === 0) {
      throw new RangeError('Array is empty')
    }
    return this.buffer[0] as T
  }

  last(): T {
    if (this._length === 0) {
      throw new RangeError('Array is empty')
    }
    return this.buffer[this._length - 1] as T
  }

  indexOf(item: T): number {
    for (let i = 0; i < this._length; i++) {
      if (this.buffer[i] === item) return i
    }
    return -1
  }

  lastIndexOf(item: T): number {
    for (let i = this._length - 1; i >= 0; i--) {
      if (this.buffer[i] === item) return i
    }
    return -1
  }

  includes(item: T): boolean {
    return this.indexOf(item) !== -1
  }

  slice(start?: number, end?: number): ResizableArray<T> {
    const len = this._length
    let s = start ?? 0
    let e = end ?? len
    if (s < 0) s = Math.max(0, len + s)
    if (e < 0) e = Math.max(0, len + e)
    s = Math.min(s, len)
    e = Math.min(e, len)
    const result = new ResizableArray<T>(Math.max(1, e - s), {
      growthFactor: this.growthFactor,
      shrinkThreshold: this.shrinkThreshold,
    })
    for (let i = s; i < e; i++) {
      result.push(this.buffer[i] as T)
    }
    return result
  }

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    const len = this._length
    let s = start
    if (s < 0) s = Math.max(0, len + s)
    s = Math.min(s, len)
    const dc = deleteCount ?? (len - s)
    const actualDelete = Math.min(dc, len - s)
    const removed: T[] = []
    for (let i = 0; i < actualDelete; i++) {
      removed.push(this.buffer[s + i] as T)
    }
    const tailLen = len - s - actualDelete
    const newLen = len - actualDelete + items.length
    while (newLen > this._capacity) {
      this.grow()
    }
    if (items.length !== actualDelete) {
      const diff = items.length - actualDelete
      if (diff > 0) {
        for (let i = tailLen - 1; i >= 0; i--) {
          this.buffer[s + items.length + i] = this.buffer[s + actualDelete + i]
        }
      } else {
        for (let i = 0; i < tailLen; i++) {
          this.buffer[s + items.length + i] = this.buffer[s + actualDelete + i]
        }
      }
    }
    for (let i = 0; i < items.length; i++) {
      this.buffer[s + i] = items[i]
    }
    this._length = newLen
    if (this._length < len) {
      for (let i = this._length; i < len; i++) {
        this.buffer[i] = undefined
      }
      this.checkShrink()
    }
    return removed
  }

  reverse(): void {
    let left = 0
    let right = this._length - 1
    while (left < right) {
      const tmp = this.buffer[left]
      this.buffer[left] = this.buffer[right]
      this.buffer[right] = tmp
      left++
      right--
    }
  }

  sort(comparator?: (a: T, b: T) => number): void {
    const arr = this.toArray()
    arr.sort(comparator)
    for (let i = 0; i < arr.length; i++) {
      this.buffer[i] = arr[i]
    }
  }

  fill(value: T, start?: number, end?: number): void {
    const len = this._length
    let s = start ?? 0
    let e = end ?? len
    if (s < 0) s = Math.max(0, len + s)
    if (e < 0) e = Math.max(0, len + e)
    s = Math.min(s, len)
    e = Math.min(e, len)
    for (let i = s; i < e; i++) {
      this.buffer[i] = value
    }
  }

  map<U>(fn: (item: T, index: number) => U): ResizableArray<U> {
    const result = new ResizableArray<U>(Math.max(1, this._length))
    for (let i = 0; i < this._length; i++) {
      result.push(fn(this.buffer[i] as T, i))
    }
    return result
  }

  filter(fn: (item: T, index: number) => boolean): ResizableArray<T> {
    const result = new ResizableArray<T>(Math.max(1, this._length), {
      growthFactor: this.growthFactor,
      shrinkThreshold: this.shrinkThreshold,
    })
    for (let i = 0; i < this._length; i++) {
      if (fn(this.buffer[i] as T, i)) {
        result.push(this.buffer[i] as T)
      }
    }
    return result
  }

  reduce<U>(fn: (acc: U, item: T, index: number) => U, initial: U): U {
    let acc = initial
    for (let i = 0; i < this._length; i++) {
      acc = fn(acc, this.buffer[i] as T, i)
    }
    return acc
  }

  forEach(fn: (item: T, index: number) => void): void {
    for (let i = 0; i < this._length; i++) {
      fn(this.buffer[i] as T, i)
    }
  }

  find(fn: (item: T, index: number) => boolean): T | undefined {
    for (let i = 0; i < this._length; i++) {
      if (fn(this.buffer[i] as T, i)) {
        return this.buffer[i] as T
      }
    }
    return undefined
  }

  findIndex(fn: (item: T, index: number) => boolean): number {
    for (let i = 0; i < this._length; i++) {
      if (fn(this.buffer[i] as T, i)) {
        return i
      }
    }
    return -1
  }

  every(fn: (item: T, index: number) => boolean): boolean {
    for (let i = 0; i < this._length; i++) {
      if (!fn(this.buffer[i] as T, i)) return false
    }
    return true
  }

  some(fn: (item: T, index: number) => boolean): boolean {
    for (let i = 0; i < this._length; i++) {
      if (fn(this.buffer[i] as T, i)) return true
    }
    return false
  }

  join(separator: string = ','): string {
    if (this._length === 0) return ''
    let result = String(this.buffer[0])
    for (let i = 1; i < this._length; i++) {
      result += separator + String(this.buffer[i])
    }
    return result
  }

  concat(...arrays: ResizableArray<T>[]): ResizableArray<T> {
    let totalLen = this._length
    for (const arr of arrays) {
      totalLen += arr.length
    }
    const result = new ResizableArray<T>(Math.max(1, totalLen), {
      growthFactor: this.growthFactor,
      shrinkThreshold: this.shrinkThreshold,
    })
    for (let i = 0; i < this._length; i++) {
      result.push(this.buffer[i] as T)
    }
    for (const arr of arrays) {
      for (let i = 0; i < arr.length; i++) {
        result.push(arr.get(i))
      }
    }
    return result
  }

  toArray(): T[] {
    const result: T[] = new Array<T>(this._length)
    for (let i = 0; i < this._length; i++) {
      result[i] = this.buffer[i] as T
    }
    return result
  }

  static fromArray<U>(arr: U[]): ResizableArray<U> {
    const result = new ResizableArray<U>(Math.max(1, arr.length))
    for (const item of arr) {
      result.push(item)
    }
    return result
  }

  get length(): number {
    return this._length
  }

  get capacity(): number {
    return this._capacity
  }

  get utilization(): number {
    return this._capacity === 0 ? 0 : this._length / this._capacity
  }

  trimToSize(): void {
    if (this._length === 0) {
      this.resizeBuffer(1)
    } else if (this._length < this._capacity) {
      this.resizeBuffer(this._length)
    }
  }

  ensureCapacity(min: number): void {
    if (min > this._capacity) {
      this.resizeBuffer(min)
    }
  }

  clear(): void {
    for (let i = 0; i < this._length; i++) {
      this.buffer[i] = undefined
    }
    this._length = 0
  }

  isEmpty(): boolean {
    return this._length === 0
  }

  clone(): ResizableArray<T> {
    const result = new ResizableArray<T>(this._capacity, {
      growthFactor: this.growthFactor,
      shrinkThreshold: this.shrinkThreshold,
    })
    for (let i = 0; i < this._length; i++) {
      result.push(this.buffer[i] as T)
    }
    return result
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const length = this._length
    const buffer = this.buffer
    return {
      next(): IteratorResult<T> {
        if (index < length) {
          return { value: buffer[index++] as T, done: false }
        }
        return { value: undefined as unknown as T, done: true }
      },
    }
  }

  toString(): string {
    return `ResizableArray()`
  }

  toJSON() {
    return { type: 'ResizableArray', items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }


  count(predicate: (item: T) => boolean): number {
    return this.toArray().filter(predicate).length
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
    return 'ResizableArray'
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
    const arr = this.toArray()
    const i = n - 1
    return i >= 0 && i < arr.length ? arr[i] : undefined
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

  contains(item: T): boolean {
    return this.includes(item)
  }

  get size(): number {
    return this.length
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
}
