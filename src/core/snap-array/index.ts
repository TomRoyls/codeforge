import type { Snapshot } from './types.js'

export class SnapArray<T> {
  private readonly data: readonly T[]

  constructor(arr?: T[]) {
    this.data = arr ? [...arr] : []
  }

  get(index: number): T {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`)
    }
    return this.data[index]!
  }

  set(index: number, value: T): SnapArray<T> {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`)
    }
    const newData = [...this.data]
    newData[index] = value
    return new SnapArray(newData)
  }

  push(value: T): SnapArray<T> {
    return new SnapArray([...this.data, value])
  }

  pop(): [SnapArray<T>, T] {
    if (this.data.length === 0) {
      throw new RangeError('Cannot pop from empty array')
    }
    const popped = this.data[this.data.length - 1]!
    const newData = this.data.slice(0, -1)
    return [new SnapArray(newData), popped]
  }

  insert(index: number, value: T): SnapArray<T> {
    if (index < 0 || index > this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length}]`)
    }
    const newData = [...this.data.slice(0, index), value, ...this.data.slice(index)]
    return new SnapArray(newData)
  }

  remove(index: number): SnapArray<T> {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`)
    }
    const newData = [...this.data.slice(0, index), ...this.data.slice(index + 1)]
    return new SnapArray(newData)
  }

  get length(): number {
    return this.data.length
  }

  get isEmpty(): boolean {
    return this.data.length === 0
  }

  toArray(): T[] {
    return [...this.data]
  }

  clone(): SnapArray<T> {
    return new SnapArray([...this.data])
  }

  snapshot(): Snapshot<T> {
    return { data: this.data }
  }

  restore(snap: Snapshot<T>): SnapArray<T> {
    return new SnapArray([...snap.data])
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this.data.length; i++) {
      callback(this.data[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.data.length; i++) {
      yield this.data[i]!
    }
  }

  map<U>(fn: (value: T, index: number) => U): SnapArray<U> {
    const result: U[] = []
    for (let i = 0; i < this.data.length; i++) {
      result.push(fn(this.data[i]!, i))
    }
    return new SnapArray(result)
  }

  filter(predicate: (value: T, index: number) => boolean): SnapArray<T> {
    const result: T[] = []
    for (let i = 0; i < this.data.length; i++) {
      if (predicate(this.data[i]!, i)) {
        result.push(this.data[i]!)
      }
    }
    return new SnapArray(result)
  }

  reduce<U>(fn: (accumulator: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue
    for (let i = 0; i < this.data.length; i++) {
      acc = fn(acc, this.data[i]!, i)
    }
    return acc
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    for (let i = 0; i < this.data.length; i++) {
      if (predicate(this.data[i]!, i)) {
        return this.data[i]
      }
    }
    return undefined
  }

  findIndex(predicate: (value: T, index: number) => boolean): number {
    for (let i = 0; i < this.data.length; i++) {
      if (predicate(this.data[i]!, i)) {
        return i
      }
    }
    return -1
  }

  every(predicate: (value: T, index: number) => boolean): boolean {
    for (let i = 0; i < this.data.length; i++) {
      if (!predicate(this.data[i]!, i)) {
        return false
      }
    }
    return true
  }

  some(predicate: (value: T, index: number) => boolean): boolean {
    for (let i = 0; i < this.data.length; i++) {
      if (predicate(this.data[i]!, i)) {
        return true
      }
    }
    return false
  }

  indexOf(value: T): number {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] === value) {
        return i
      }
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  slice(start?: number, end?: number): SnapArray<T> {
    return new SnapArray(this.data.slice(start, end))
  }

  concat(other: SnapArray<T> | T[]): SnapArray<T> {
    const otherData = other instanceof SnapArray ? other.data : other
    return new SnapArray([...this.data, ...otherData])
  }

  reverse(): SnapArray<T> {
    return new SnapArray([...this.data].reverse())
  }

  sort(comparator?: (a: T, b: T) => number): SnapArray<T> {
    return new SnapArray([...this.data].sort(comparator))
  }

  join(separator?: string): string {
    return this.data.join(separator)
  }

  first(): T {
    if (this.data.length === 0) {
      throw new RangeError('Cannot get first element of empty array')
    }
    return this.data[0]!
  }

  last(): T {
    if (this.data.length === 0) {
      throw new RangeError('Cannot get last element of empty array')
    }
    return this.data[this.data.length - 1]!
  }

  static fromArray<U>(arr: U[]): SnapArray<U> {
    return new SnapArray(arr)
  }

  toString(): string {
    return `SnapArray({ size: ${this.data.length} })`
  }

  toJSON() {
    return { type: 'SnapArray', items: this.toArray() }
  }



  static empty<T>(): SnapArray<T> {
    return new SnapArray<T>()
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

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }
}
