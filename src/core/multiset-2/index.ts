import type { MultisetEntry, MultisetOptions } from './types.js'

export class Multiset<T> {
  private map: Map<T, number> = new Map()
  private _size: number = 0

  constructor(options?: MultisetOptions<T>) {
    if (options?.entries) {
      for (const [value, count] of options.entries) {
        if (count > 0) {
          this.map.set(value, count)
          this._size += count
        }
      }
    }
    if (options?.elements) {
      for (const el of options.elements) {
        this.add(el)
      }
    }
  }

  get size(): number {
    return this._size
  }

  get uniqueSize(): number {
    return this.map.size
  }

  add(value: T, count: number = 1): void {
    if (count <= 0) return
    const current = this.map.get(value) ?? 0
    this.map.set(value, current + count)
    this._size += count
  }

  delete(value: T, count: number = 1): boolean {
    const current = this.map.get(value)
    if (current === undefined) return false
    if (count <= 0) return false
    if (count >= current) {
      this._size -= current
      this.map.delete(value)
    } else {
      this.map.set(value, current - count)
      this._size -= count
    }
    return true
  }

  count(value: T): number {
    return this.map.get(value) ?? 0
  }

  has(value: T): boolean {
    return this.map.has(value)
  }

  clear(): void {
    this.map.clear()
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (const [value, cnt] of this.map) {
      for (let i = 0; i < cnt; i++) {
        result.push(value)
      }
    }
    return result
  }

  forEach(callback: (value: T, count: number, multiset: Multiset<T>) => void): void {
    for (const [value, cnt] of this.map) {
      callback(value, cnt, this)
    }
  }

  *entries(): Iterator<MultisetEntry<T>> {
    for (const entry of this.map) {
      yield entry
    }
  }

  *values(): IterableIterator<T> {
    for (const [value, cnt] of this.map) {
      for (let i = 0; i < cnt; i++) {
        yield value
      }
    }
  }

  *uniqueValues(): IterableIterator<T> {
    for (const key of this.map.keys()) {
      yield key
    }
  }

  union(other: Multiset<T>): Multiset<T> {
    const result = new Multiset<T>()
    for (const [value, cnt] of this.map) {
      result.map.set(value, cnt)
    }
    result._size = this._size
    for (const [value, cnt] of other.map) {
      const current = result.map.get(value) ?? 0
      const maxCount = Math.max(current, cnt)
      if (current === 0) {
        result._size += maxCount
      } else {
        result._size += maxCount - current
      }
      result.map.set(value, maxCount)
    }
    return result
  }

  intersection(other: Multiset<T>): Multiset<T> {
    const result = new Multiset<T>()
    for (const [value, cnt] of this.map) {
      const otherCount = other.map.get(value)
      if (otherCount !== undefined) {
        const minCount = Math.min(cnt, otherCount)
        result.map.set(value, minCount)
        result._size += minCount
      }
    }
    return result
  }

  sum(other: Multiset<T>): Multiset<T> {
    const result = new Multiset<T>()
    for (const [value, cnt] of this.map) {
      result.map.set(value, cnt)
    }
    result._size = this._size
    for (const [value, cnt] of other.map) {
      const current = result.map.get(value) ?? 0
      result.map.set(value, current + cnt)
      result._size += cnt
    }
    return result
  }

  isSubsetOf(other: Multiset<T>): boolean {
    for (const [value, cnt] of this.map) {
      const otherCount = other.map.get(value) ?? 0
      if (cnt > otherCount) return false
    }
    return true
  }

  isSupersetOf(other: Multiset<T>): boolean {
    return other.isSubsetOf(this)
  }

  equals(other: Multiset<T>): boolean {
    if (this.map.size !== other.map.size) return false
    for (const [value, cnt] of this.map) {
      const otherCount = other.map.get(value)
      if (otherCount !== cnt) return false
    }
    return true
  }

  clone(): Multiset<T> {
    const result = new Multiset<T>()
    for (const [value, cnt] of this.map) {
      result.map.set(value, cnt)
    }
    result._size = this._size
    return result
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  set(value: T, count: number): void {
    const current = this.map.get(value) ?? 0
    if (count <= 0) {
      if (current > 0) {
        this.map.delete(value)
        this._size -= current
      }
    } else {
      this.map.set(value, count)
      this._size += count - current
    }
  }

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.values()
  }

  static from<T>(elements: T[]): Multiset<T> {
    return new Multiset<T>({ elements })
  }

  static fromEntries<T>(entries: MultisetEntry<T>[]): Multiset<T> {
    return new Multiset<T>({ entries })
  }

  toString(): string {
    return `Multiset({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'Multiset', size: this.size, items: this.toArray() }
  }

  static of<T>(...items: T[]): Multiset<T> {
    return Multiset.from(items)
  }

  merge(other: Multiset<T>): Multiset<T> {
    return Multiset.from([...this.toArray(), ...other.toArray()])
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
    return 'Multiset'
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

}
