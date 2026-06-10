import type { Comparator, SortedArraySetOptions, SortedArraySetStats } from './types.js'
import { DEFAULT_COMPARATOR } from './types.js'

export class SortedArraySet<T = unknown> {
  private _data: T[]
  private _comparator: Comparator<T>

  constructor(options?: SortedArraySetOptions<T>) {
    this._comparator = options?.comparator ?? (DEFAULT_COMPARATOR as Comparator<T>)
    this._data = []
  }

  add(value: T): boolean {
    const idx = this.binarySearch(value)
    if (idx >= 0) return false
    const insertAt = -(idx + 1)
    this._data.splice(insertAt, 0, value)
    return true
  }

  delete(value: T): boolean {
    const idx = this.binarySearch(value)
    if (idx < 0) return false
    this._data.splice(idx, 1)
    return true
  }

  has(value: T): boolean {
    return this.binarySearch(value) >= 0
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._data.length) return undefined
    return this._data[index]
  }

  indexOf(value: T): number {
    const idx = this.binarySearch(value)
    return idx >= 0 ? idx : -1
  }

  floor(value: T): T | undefined {
    let lo = 0
    let hi = this._data.length - 1
    let result: T | undefined
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this._comparator(this._data[mid]!, value)
      if (cmp <= 0) {
        result = this._data[mid]
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return result
  }

  ceiling(value: T): T | undefined {
    let lo = 0
    let hi = this._data.length - 1
    let result: T | undefined
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this._comparator(this._data[mid]!, value)
      if (cmp >= 0) {
        result = this._data[mid]
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    return result
  }

  lower(value: T): T | undefined {
    let lo = 0
    let hi = this._data.length - 1
    let result: T | undefined
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this._comparator(this._data[mid]!, value)
      if (cmp < 0) {
        result = this._data[mid]
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return result
  }

  higher(value: T): T | undefined {
    let lo = 0
    let hi = this._data.length - 1
    let result: T | undefined
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this._comparator(this._data[mid]!, value)
      if (cmp > 0) {
        result = this._data[mid]
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    return result
  }

  range(from: T, to: T): T[] {
    if (this._data.length === 0) return []
    if (this._comparator(from, to) > 0) return []
    const lo = this.lowerBoundIndex(from)
    const hi = this.upperBoundIndex(to)
    return this._data.slice(lo, hi)
  }

  get size(): number {
    return this._data.length
  }

  isEmpty(): boolean {
    return this._data.length === 0
  }

  clear(): void {
    this._data.length = 0
  }

  get min(): T | undefined {
    return this._data.length > 0 ? this._data[0] : undefined
  }

  get max(): T | undefined {
    return this._data.length > 0 ? this._data[this._data.length - 1] : undefined
  }

  toArray(): T[] {
    return this._data.slice()
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._data.length; i++) {
      callback(this._data[i]!, i)
    }
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const data = this._data
    return {
      next: () => {
        if (index < data.length) {
          const value = data[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<T>
      },
    }
  }

  union(other: SortedArraySet<T>): SortedArraySet<T> {
    const result = new SortedArraySet<T>({ comparator: this._comparator })
    let i = 0
    let j = 0
    while (i < this._data.length || j < other._data.length) {
      if (i >= this._data.length) {
        result._data.push(other._data[j]!)
        j++
      } else if (j >= other._data.length) {
        result._data.push(this._data[i]!)
        i++
      } else {
        const cmp = this._comparator(this._data[i]!, other._data[j]!)
        if (cmp < 0) {
          result._data.push(this._data[i]!)
          i++
        } else if (cmp > 0) {
          result._data.push(other._data[j]!)
          j++
        } else {
          result._data.push(this._data[i]!)
          i++
          j++
        }
      }
    }
    return result
  }

  intersection(other: SortedArraySet<T>): SortedArraySet<T> {
    const result = new SortedArraySet<T>({ comparator: this._comparator })
    let i = 0
    let j = 0
    while (i < this._data.length && j < other._data.length) {
      const cmp = this._comparator(this._data[i]!, other._data[j]!)
      if (cmp < 0) {
        i++
      } else if (cmp > 0) {
        j++
      } else {
        result._data.push(this._data[i]!)
        i++
        j++
      }
    }
    return result
  }

  difference(other: SortedArraySet<T>): SortedArraySet<T> {
    const result = new SortedArraySet<T>({ comparator: this._comparator })
    let i = 0
    let j = 0
    while (i < this._data.length) {
      if (j >= other._data.length) {
        result._data.push(this._data[i]!)
        i++
      } else {
        const cmp = this._comparator(this._data[i]!, other._data[j]!)
        if (cmp < 0) {
          result._data.push(this._data[i]!)
          i++
        } else if (cmp > 0) {
          j++
        } else {
          i++
          j++
        }
      }
    }
    return result
  }

  symmetricDifference(other: SortedArraySet<T>): SortedArraySet<T> {
    const result = new SortedArraySet<T>({ comparator: this._comparator })
    let i = 0
    let j = 0
    while (i < this._data.length || j < other._data.length) {
      if (i >= this._data.length) {
        result._data.push(other._data[j]!)
        j++
      } else if (j >= other._data.length) {
        result._data.push(this._data[i]!)
        i++
      } else {
        const cmp = this._comparator(this._data[i]!, other._data[j]!)
        if (cmp < 0) {
          result._data.push(this._data[i]!)
          i++
        } else if (cmp > 0) {
          result._data.push(other._data[j]!)
          j++
        } else {
          i++
          j++
        }
      }
    }
    return result
  }

  isSubsetOf(other: SortedArraySet<T>): boolean {
    if (this._data.length === 0) return true
    let i = 0
    let j = 0
    while (i < this._data.length && j < other._data.length) {
      const cmp = this._comparator(this._data[i]!, other._data[j]!)
      if (cmp < 0) return false
      if (cmp > 0) {
        j++
      } else {
        i++
        j++
      }
    }
    return i === this._data.length
  }

  isSupersetOf(other: SortedArraySet<T>): boolean {
    return other.isSubsetOf(this)
  }

  stats(): SortedArraySetStats {
    return {
      size: this._data.length,
      min: this._data.length > 0 ? this._data[0] : undefined,
      max: this._data.length > 0 ? this._data[this._data.length - 1] : undefined,
    }
  }

  private binarySearch(value: T): number {
    let lo = 0
    let hi = this._data.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this._comparator(this._data[mid]!, value)
      if (cmp < 0) lo = mid + 1
      else if (cmp > 0) hi = mid - 1
      else return mid
    }
    return -(lo + 1)
  }

  private lowerBoundIndex(value: T): number {
    let lo = 0
    let hi = this._data.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this._comparator(this._data[mid]!, value) < 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  private upperBoundIndex(value: T): number {
    let lo = 0
    let hi = this._data.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this._comparator(this._data[mid]!, value) <= 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  toString(): string {
    return `SortedArraySet({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SortedArraySet', size: this.size, items: this.toArray() }
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
    return 'SortedArraySet'
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
}

export type { Comparator, SortedArraySetOptions, SortedArraySetStats } from './types.js'
export { DEFAULT_COMPARATOR } from './types.js'
