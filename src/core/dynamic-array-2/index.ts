import type { DynamicArrayOptions, GrowthStrategy, EqualityComparator } from './types.js'

export class DynamicArray<T> {
  private buffer: (T | undefined)[]
  private _size = 0
  private _capacity: number
  private _growthFactor: number
  private _growthStrategy: GrowthStrategy
  private _fibA = 1
  private _fibB = 1
  private _equals: EqualityComparator<T>

  constructor(options?: DynamicArrayOptions<T>) {
    this._capacity = Math.max(0, options?.initialCapacity ?? 8)
    this._growthFactor = options?.growthFactor ?? 2
    this._growthStrategy = options?.growthStrategy ?? 'geometric'
    this._equals = options?.equals ?? ((a: T, b: T) => a === b)
    this.buffer = new Array<T | undefined>(this._capacity)
  }

  private computeNewCapacity(): number {
    switch (this._growthStrategy) {
      case 'geometric':
        return Math.max(1, Math.ceil(this._capacity * this._growthFactor))
      case 'fixed': {
        const inc = Math.max(1, Math.floor(this._growthFactor))
        return this._capacity + inc
      }
      case 'linear': {
        const inc2 = Math.max(1, Math.floor(this._growthFactor))
        return this._capacity + inc2
      }
      case 'fibonacci': {
        const next = this._fibA + this._fibB
        this._fibA = this._fibB
        this._fibB = next
        return this._capacity + Math.max(1, next)
      }
    }
  }

  private grow(): void {
    const newCap = this.computeNewCapacity()
    this._capacity = newCap
    const newBuffer = new Array<T | undefined>(this._capacity)
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[i]
    }
    this.buffer = newBuffer
  }

  push(value: T): void {
    if (this._size >= this._capacity) {
      this.grow()
    }
    this.buffer[this._size] = value
    this._size++
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined
    this._size--
    const val = this.buffer[this._size]
    this.buffer[this._size] = undefined
    return val
  }

  shift(): T | undefined {
    if (this._size === 0) return undefined
    const val = this.buffer[0]
    for (let i = 0; i < this._size - 1; i++) {
      this.buffer[i] = this.buffer[i + 1]
    }
    this._size--
    this.buffer[this._size] = undefined
    return val
  }

  unshift(value: T): void {
    if (this._size >= this._capacity) {
      this.grow()
    }
    for (let i = this._size; i > 0; i--) {
      this.buffer[i] = this.buffer[i - 1]
    }
    this.buffer[0] = value
    this._size++
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    return this.buffer[index]!
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) return
    this.buffer[index] = value
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._size) return
    if (this._size >= this._capacity) {
      this.grow()
    }
    for (let i = this._size; i > index; i--) {
      this.buffer[i] = this.buffer[i - 1]
    }
    this.buffer[index] = value
    this._size++
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    const val = this.buffer[index]!
    for (let i = index; i < this._size - 1; i++) {
      this.buffer[i] = this.buffer[i + 1]
    }
    this._size--
    this.buffer[this._size] = undefined
    return val
  }

  get size(): number {
    return this._size
  }

  get capacity(): number {
    return this._capacity
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  isFull(): boolean {
    return this._size === this._capacity
  }

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this.buffer[i] = undefined
    }
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[i]!)
    }
    return result
  }

  fromArray(arr: T[]): void {
    this.clear()
    for (const item of arr) {
      this.push(item)
    }
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.buffer[i]!, i)
    }
  }

  map<U>(callback: (value: T, index: number) => U): DynamicArray<U> {
    const result = new DynamicArray<U>({ initialCapacity: this._size })
    for (let i = 0; i < this._size; i++) {
      result.push(callback(this.buffer[i]!, i))
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): DynamicArray<T> {
    const result = new DynamicArray<T>()
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.buffer[i]!, i)) {
        result.push(this.buffer[i]!)
      }
    }
    return result
  }

  reduce<U>(callback: (acc: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue
    for (let i = 0; i < this._size; i++) {
      acc = callback(acc, this.buffer[i]!, i)
    }
    return acc
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.buffer[i]!, i)) {
        return this.buffer[i]!
      }
    }
    return undefined
  }

  findIndex(predicate: (value: T, index: number) => boolean): number {
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.buffer[i]!, i)) {
        return i
      }
    }
    return -1
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this._equals(this.buffer[i]!, value)) {
        return i
      }
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  slice(start?: number, end?: number): DynamicArray<T> {
    const s = start ?? 0
    const e = end ?? this._size
    const lo = Math.max(0, s < 0 ? this._size + s : s)
    const hi = Math.min(this._size, e < 0 ? this._size + e : e)
    const result = new DynamicArray<T>({ initialCapacity: Math.max(0, hi - lo) })
    for (let i = lo; i < hi; i++) {
      result.push(this.buffer[i]!)
    }
    return result
  }

  concat(other: DynamicArray<T>): DynamicArray<T> {
    const totalSize = this._size + other.size
    const result = new DynamicArray<T>({ initialCapacity: totalSize })
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[i]!)
    }
    for (let i = 0; i < other.size; i++) {
      const val = other.get(i)
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  splice(start: number, deleteCount?: number, ...items: T[]): DynamicArray<T> {
    const s = start < 0 ? Math.max(0, this._size + start) : Math.min(start, this._size)
    const dc = deleteCount ?? this._size - s
    const actualDelete = Math.min(dc, this._size - s)

    const removed = new DynamicArray<T>({ initialCapacity: actualDelete })
    for (let i = 0; i < actualDelete; i++) {
      removed.push(this.buffer[s + i]!)
    }

    const tail: T[] = []
    for (let i = s + actualDelete; i < this._size; i++) {
      tail.push(this.buffer[i]!)
    }

    this._size = s
    for (const item of items) {
      this.push(item)
    }
    for (const t of tail) {
      this.push(t)
    }

    return removed
  }

  join(separator?: string): string {
    if (this._size === 0) return ''
    const sep = separator ?? ','
    let result = String(this.buffer[0])
    for (let i = 1; i < this._size; i++) {
      result += sep + String(this.buffer[i])
    }
    return result
  }

  toString(): string {
    return this.join(',')
  }

  reverse(): void {
    let lo = 0
    let hi = this._size - 1
    while (lo < hi) {
      const tmp = this.buffer[lo]
      this.buffer[lo] = this.buffer[hi]
      this.buffer[hi] = tmp
      lo++
      hi--
    }
  }

  sort(compare?: (a: T, b: T) => number): void {
    if (this._size <= 1) return
    const arr = this.toArray()
    if (compare) {
      arr.sort(compare)
    } else {
      arr.sort()
    }
    for (let i = 0; i < arr.length; i++) {
      this.buffer[i] = arr[i]!
    }
  }

  clone(): DynamicArray<T> {
    const result = new DynamicArray<T>({
      initialCapacity: this._capacity,
      growthFactor: this._growthFactor,
      growthStrategy: this._growthStrategy,
      equals: this._equals,
    })
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[i]!)
    }
    return result
  }

  equals(other: DynamicArray<T>): boolean {
    if (this._size !== other.size) return false
    for (let i = 0; i < this._size; i++) {
      if (!this._equals(this.buffer[i]!, other.get(i)!)) {
        return false
      }
    }
    return true
  }

  contains(value: T): boolean {
    return this.includes(value)
  }

  get first(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[0]!
  }

  get last(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this._size - 1]!
  }

  resize(capacity: number): void {
    if (capacity < 0) return
    if (capacity < this._size) {
      for (let i = capacity; i < this._size; i++) {
        this.buffer[i] = undefined
      }
      this._size = capacity
    }
    this._capacity = capacity
    const newBuffer = new Array<T | undefined>(this._capacity)
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[i]
    }
    this.buffer = newBuffer
  }

  trimToSize(): void {
    this.resize(this._size)
  }

  ensureCapacity(minCapacity: number): void {
    if (this._capacity >= minCapacity) return
    this.resize(minCapacity)
  }

  compact(): void {
    this.trimToSize()
  }

  get growthFactor(): number {
    return this._growthFactor
  }

  [Symbol.iterator](): Iterator<T> {
    let idx = 0
    return {
      next: () => {
        if (idx < this._size) {
          const value = this.buffer[idx]!
          idx++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<T>
      },
    }
  }

  static from<T>(items: Iterable<T>, options?: DynamicArrayOptions<T>): DynamicArray<T> {
    const arr = new DynamicArray<T>(options)
    for (const item of items) {
      arr.push(item)
    }
    return arr
  }

  static of<T>(...items: T[]): DynamicArray<T> {
    return DynamicArray.from(items)
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'DynamicArray', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
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

  static empty<T>(): DynamicArray<T> {
    return new DynamicArray<T>()
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
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
    return 'DynamicArray'
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
    const arr = this.toArray()
    return arr.length > 0 ? arr[0] : undefined
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

  move(fromIndex: number, toIndex: number): T[] {
    const arr = this.toArray()
    if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) return [...arr]
    const item = arr[fromIndex]!
    const result = arr.filter((_, i) => i !== fromIndex)
    result.splice(toIndex, 0, item)
    return result
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

  distinctUntilChanged(): T[] {
    const arr = this.toArray()
    if (arr.length === 0) return []
    const result: T[] = [arr[0]!]
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i - 1]) {
        result.push(arr[i]!)
      }
    }
    return result
  }

  nonEmpty(): boolean {
    return !this.isEmpty()
  }

  reject(predicate: (item: T, index: number) => boolean): T[] {
    return this.toArray().filter((item, i) => !predicate(item, i))
  }

  compactMap<U>(fn: (item: T, index: number) => U | null | undefined): U[] {
    const result: U[] = []
    this.toArray().forEach((item, i) => {
      const mapped = fn(item, i)
      if (mapped != null) {
        result.push(mapped)
      }
    })
    return result
  }

  chunkWhen(predicate: (prev: T, curr: T) => boolean): T[][] {
    const arr = this.toArray()
    if (arr.length === 0) return []
    const result: T[][] = [[arr[0]!]]
    for (let i = 1; i < arr.length; i++) {
      if (predicate(arr[i - 1]!, arr[i]!)) {
        result.push([arr[i]!])
      } else {
        result[result.length - 1]!.push(arr[i]!)
      }
    }
    return result
  }

  permute(): T[][] {
    const arr = this.toArray()
    if (arr.length === 0) return [[]]
    if (arr.length > 8) return [arr]
    const result: T[][] = []
    const used = new Array(arr.length).fill(false)
    const permuteHelper = (current: number[]) => {
      if (current.length === arr.length) {
        result.push(current.map(i => arr[i]!))
        return
      }
      for (let i = 0; i < arr.length; i++) {
        if (used[i]) continue
        used[i] = true
        permuteHelper([...current, i])
        used[i] = false
      }
    }
    permuteHelper([])
    return result
  }
}
