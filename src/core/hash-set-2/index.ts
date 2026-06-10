import type { EqualityComparator, HashFunction, HashSetOptions, HashSetStats } from './types.js'

const DEFAULT_INITIAL_CAPACITY = 16
const DEFAULT_LOAD_FACTOR = 0.75
const MIN_CAPACITY = 4

function defaultHash<T>(value: T): number {
  if (typeof value === 'string') {
    let h = 0
    for (let i = 0; i < value.length; i++) {
      h = (31 * h + value.charCodeAt(i)) | 0
    }
    return h
  }
  if (typeof value === 'number') {
    return value | 0
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }
  if (value === null || value === undefined) {
    return 0
  }
  return String(value)
    .split('')
    .reduce((h, c) => (31 * h + c.charCodeAt(0)) | 0, 0)
}

function defaultEquals<T>(a: T, b: T): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    if (a === b) return true
    return Number.isNaN(a) && Number.isNaN(b)
  }
  return a === b
}

export class HashSet<T> {
  private buckets: (T | undefined)[]
  private state: ('empty' | 'occupied' | 'deleted')[]
  private _size = 0
  private hashFn: HashFunction<T>
  private eq: EqualityComparator<T>
  private maxLoadFactor: number
  private _collisions = 0

  constructor(options?: HashSetOptions<T>) {
    const cap = options?.initialCapacity ?? DEFAULT_INITIAL_CAPACITY
    this.buckets = new Array(Math.max(MIN_CAPACITY, cap)).fill(undefined)
    this.state = new Array(this.buckets.length).fill('empty')
    this.hashFn = options?.hashFunction ?? defaultHash
    this.eq = options?.equals ?? defaultEquals
    this.maxLoadFactor = options?.loadFactor ?? DEFAULT_LOAD_FACTOR
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  add(value: T): boolean {
    if (this._size + 1 > this.buckets.length * this.maxLoadFactor) {
      this.resize(this.buckets.length * 2)
    }
    const idx = this.probeInsert(value)
    if (this.state[idx] === 'occupied' && this.eq(this.buckets[idx]!, value)) {
      return false
    }
    this.buckets[idx] = value
    this.state[idx] = 'occupied'
    this._size++
    return true
  }

  has(value: T): boolean {
    const idx = this.probeFind(value)
    return idx !== -1
  }

  delete(value: T): boolean {
    const idx = this.probeFind(value)
    if (idx === -1) return false
    this.state[idx] = 'deleted'
    this.buckets[idx] = undefined
    this._size--
    return true
  }

  clear(): void {
    this.buckets.fill(undefined)
    this.state.fill('empty')
    this._size = 0
    this._collisions = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        result.push(this.buckets[i]!)
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        callback(this.buckets[i]!, idx)
        idx++
      }
    }
  }

  *values(): Generator<T> {
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        yield this.buckets[i]!
      }
    }
  }

  union(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>({
      hashFunction: this.hashFn,
      equals: this.eq,
      loadFactor: this.maxLoadFactor,
    })
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        result.add(this.buckets[i]!)
      }
    }
    for (let i = 0; i < other.buckets.length; i++) {
      if (other.state[i] === 'occupied') {
        result.add(other.buckets[i]!)
      }
    }
    return result
  }

  intersection(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>({
      hashFunction: this.hashFn,
      equals: this.eq,
      loadFactor: this.maxLoadFactor,
    })
    const [smaller, larger] =
      this._size <= other._size ? [this, other] : [other, this]
    for (let i = 0; i < smaller.buckets.length; i++) {
      if (smaller.state[i] === 'occupied') {
        const val = smaller.buckets[i]!
        if (larger.has(val)) {
          result.add(val)
        }
      }
    }
    return result
  }

  difference(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>({
      hashFunction: this.hashFn,
      equals: this.eq,
      loadFactor: this.maxLoadFactor,
    })
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        const val = this.buckets[i]!
        if (!other.has(val)) {
          result.add(val)
        }
      }
    }
    return result
  }

  symmetricDifference(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>({
      hashFunction: this.hashFn,
      equals: this.eq,
      loadFactor: this.maxLoadFactor,
    })
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        const val = this.buckets[i]!
        if (!other.has(val)) {
          result.add(val)
        }
      }
    }
    for (let i = 0; i < other.buckets.length; i++) {
      if (other.state[i] === 'occupied') {
        const val = other.buckets[i]!
        if (!this.has(val)) {
          result.add(val)
        }
      }
    }
    return result
  }

  isSubsetOf(other: HashSet<T>): boolean {
    if (this._size > other._size) return false
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        if (!other.has(this.buckets[i]!)) return false
      }
    }
    return true
  }

  isSupersetOf(other: HashSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  equals(other: HashSet<T>): boolean {
    if (this._size !== other._size) return false
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        if (!other.has(this.buckets[i]!)) return false
      }
    }
    return true
  }

  stats(): HashSetStats {
    return {
      size: this._size,
      capacity: this.buckets.length,
      loadFactor: this._size / this.buckets.length,
      buckets: this.buckets.length,
      collisions: this._collisions,
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        yield this.buckets[i]!
      }
    }
  }

  static from<T>(arr: T[], options?: HashSetOptions<T>): HashSet<T> {
    const set = new HashSet<T>(options)
    for (const item of arr) {
      set.add(item)
    }
    return set
  }

  private hashIndex(value: T): number {
    const h = this.hashFn(value)
    return ((h % this.buckets.length) + this.buckets.length) % this.buckets.length
  }

  private probeFind(value: T): number {
    const start = this.hashIndex(value)
    let firstDeleted = -1
    for (let i = 0; i < this.buckets.length; i++) {
      const idx = (start + i) % this.buckets.length
      if (this.state[idx] === 'empty') {
        return firstDeleted !== -1 ? -1 : -1
      }
      if (this.state[idx] === 'deleted') {
        if (firstDeleted === -1) firstDeleted = idx
        continue
      }
      if (this.state[idx] === 'occupied' && this.eq(this.buckets[idx]!, value)) {
        return idx
      }
    }
    return -1
  }

  private probeInsert(value: T): number {
    const start = this.hashIndex(value)
    let firstDeleted = -1
    for (let i = 0; i < this.buckets.length; i++) {
      const idx = (start + i) % this.buckets.length
      if (this.state[idx] === 'empty') {
        return firstDeleted !== -1 ? firstDeleted : idx
      }
      if (this.state[idx] === 'deleted') {
        if (firstDeleted === -1) firstDeleted = idx
        continue
      }
      if (this.state[idx] === 'occupied' && this.eq(this.buckets[idx]!, value)) {
        return idx
      }
      if (i > 0) this._collisions++
    }
    return firstDeleted !== -1 ? firstDeleted : start
  }

  private resize(newCapacity: number): void {
    const oldBuckets = this.buckets
    const oldState = this.state
    const cap = Math.max(MIN_CAPACITY, newCapacity)
    this.buckets = new Array(cap).fill(undefined)
    this.state = new Array(cap).fill('empty')
    this._collisions = 0
    for (let i = 0; i < oldBuckets.length; i++) {
      if (oldState[i] === 'occupied') {
        const value = oldBuckets[i]!
        const start = this.hashIndex(value)
        let placed = false
        for (let j = 0; j < this.buckets.length; j++) {
          const idx = (start + j) % this.buckets.length
          if (this.state[idx] === 'empty') {
            this.buckets[idx] = value
            this.state[idx] = 'occupied'
            placed = true
            break
          }
        }
        if (!placed) {
          this.buckets[start] = value
          this.state[start] = 'occupied'
        }
      }
    }
  }

  toString(): string {
    return `${HashSet}({ size: ${this.size} })`
  }

  clone(): HashSet<T> {
    return HashSet.from(this.toArray())
  }

  toJSON() {
    return { type: 'HashSet', size: this.size, items: this.toArray() }
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

  static of<T>(...items: T[]): HashSet<T> {
    return HashSet.from(items)
  }

  merge(other: HashSet<T>): HashSet<T> {
    return HashSet.from([...this.toArray(), ...other.toArray()])
  }

  static empty<T>(): HashSet<T> {
    return new HashSet<T>()
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

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
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
    return 'HashSet'
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
}
