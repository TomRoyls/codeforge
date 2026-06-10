import type { Deque2Options } from './types.js'

export class Deque2<T = unknown> {
  private buffer: (T | undefined)[]
  private head: number
  private tail: number
  private _size: number
  private _capacity: number

  constructor(options?: Deque2Options) {
    this._capacity = Math.max(1, options?.initialCapacity ?? 16)
    this.buffer = new Array<T | undefined>(this._capacity)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  private grow(): void {
    const newCapacity = this._capacity * 2
    const newBuffer = new Array<T | undefined>(newCapacity)
    for (let i = 0; i < this._size; i++) {
      newBuffer[i] = this.buffer[(this.head + i) % this._capacity]
    }
    this.buffer = newBuffer
    this.head = 0
    this.tail = this._size
    this._capacity = newCapacity
  }

  pushFront(value: T): void {
    if (this._size === this._capacity) this.grow()
    this.head = (this.head - 1 + this._capacity) % this._capacity
    this.buffer[this.head] = value
    this._size++
  }

  unshift(value: T): void {
    this.pushFront(value)
  }

  pushBack(value: T): void {
    if (this._size === this._capacity) this.grow()
    this.buffer[this.tail] = value
    this.tail = (this.tail + 1) % this._capacity
    this._size++
  }

  push(value: T): void {
    this.pushBack(value)
  }

  popFront(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot popFront from empty deque')
    }
    const value = this.buffer[this.head]
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    return value as T
  }

  shift(): T {
    return this.popFront()
  }

  popBack(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot popBack from empty deque')
    }
    this.tail = (this.tail - 1 + this._capacity) % this._capacity
    const value = this.buffer[this.tail]
    this.buffer[this.tail] = undefined
    this._size--
    return value as T
  }

  pop(): T {
    return this.popBack()
  }

  peekFront(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]
  }

  front(): T | undefined {
    return this.peekFront()
  }

  peekBack(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]
  }

  back(): T | undefined {
    return this.peekBack()
  }

  get(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    return this.buffer[(this.head + index) % this._capacity] as T
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    this.buffer[(this.head + index) % this._capacity] = value
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get capacity(): number {
    return this._capacity
  }

  clear(): void {
    this.buffer = new Array<T | undefined>(this._capacity)
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = new Array(this._size)
    for (let i = 0; i < this._size; i++) {
      result[i] = this.buffer[(this.head + i) % this._capacity] as T
    }
    return result
  }

  clone(): Deque2<T> {
    const copy = new Deque2<T>({ initialCapacity: this._capacity })
    for (let i = 0; i < this._size; i++) {
      copy.pushBack(this.buffer[(this.head + i) % this._capacity] as T)
    }
    return copy
  }

  static fromArray<U>(arr: U[]): Deque2<U> {
    const deque = new Deque2<U>({ initialCapacity: Math.max(16, arr.length) })
    for (const item of arr) {
      deque.pushBack(item)
    }
    return deque
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.buffer[(this.head + i) % this._capacity] as T, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this.buffer[(this.head + i) % this._capacity] as T
    }
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) % this._capacity] === value) return i
    }
    return -1
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  insertAt(index: number, value: T): void {
    if (index < 0 || index > this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size}]`)
    }
    if (index === 0) {
      this.pushFront(value)
      return
    }
    if (index === this._size) {
      this.pushBack(value)
      return
    }
    if (this._size === this._capacity) this.grow()
    if (index <= this._size / 2) {
      this.head = (this.head - 1 + this._capacity) % this._capacity
      for (let i = 0; i < index; i++) {
        const from = (this.head + i + 1) % this._capacity
        const to = (this.head + i) % this._capacity
        this.buffer[to] = this.buffer[from]
      }
    } else {
      for (let i = this._size; i > index; i--) {
        const from = (this.head + i - 1) % this._capacity
        const to = (this.head + i) % this._capacity
        this.buffer[to] = this.buffer[from]
      }
      this.tail = (this.tail + 1) % this._capacity
    }
    this.buffer[(this.head + index) % this._capacity] = value
    this._size++
  }

  removeAt(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    const value = this.buffer[(this.head + index) % this._capacity] as T
    if (index === 0) {
      this.buffer[this.head] = undefined
      this.head = (this.head + 1) % this._capacity
    } else if (index === this._size - 1) {
      this.tail = (this.tail - 1 + this._capacity) % this._capacity
      this.buffer[this.tail] = undefined
    } else if (index < this._size / 2) {
      for (let i = index; i > 0; i--) {
        const to = (this.head + i) % this._capacity
        const from = (this.head + i - 1) % this._capacity
        this.buffer[to] = this.buffer[from]
      }
      this.buffer[this.head] = undefined
      this.head = (this.head + 1) % this._capacity
    } else {
      for (let i = index; i < this._size - 1; i++) {
        const to = (this.head + i) % this._capacity
        const from = (this.head + i + 1) % this._capacity
        this.buffer[to] = this.buffer[from]
      }
      this.tail = (this.tail - 1 + this._capacity) % this._capacity
      this.buffer[this.tail] = undefined
    }
    this._size--
    return value
  }

  rotate(n: number): void {
    if (this._size <= 1) return
    const effective = ((n % this._size) + this._size) % this._size
    if (effective === 0) return
    this.reverseRange(0, effective - 1)
    this.reverseRange(effective, this._size - 1)
    this.reverseRange(0, this._size - 1)
  }

  private reverseRange(lo: number, hi: number): void {
    while (lo < hi) {
      const a = (this.head + lo) % this._capacity
      const b = (this.head + hi) % this._capacity
      const tmp = this.buffer[a]
      this.buffer[a] = this.buffer[b]
      this.buffer[b] = tmp
      lo++
      hi--
    }
  }

  reverse(): void {
    if (this._size <= 1) return
    for (let i = 0; i < Math.floor(this._size / 2); i++) {
      const left = (this.head + i) % this._capacity
      const right = (this.head + this._size - 1 - i) % this._capacity
      const temp = this.buffer[left]
      this.buffer[left] = this.buffer[right]
      this.buffer[right] = temp
    }
  }

  slice(start: number = 0, end?: number): Deque2<T> {
    const s = start < 0 ? Math.max(0, this._size + start) : Math.min(start, this._size)
    const e = end === undefined ? this._size : (end < 0 ? Math.max(0, this._size + end) : Math.min(end, this._size))
    const result = new Deque2<T>({ initialCapacity: Math.max(16, e - s) })
    for (let i = s; i < e; i++) {
      result.pushBack(this.buffer[(this.head + i) % this._capacity] as T)
    }
    return result
  }

  concat(other: Deque2<T>): Deque2<T> {
    const result = new Deque2<T>({ initialCapacity: Math.max(16, this._size + other.size) })
    for (let i = 0; i < this._size; i++) {
      result.pushBack(this.buffer[(this.head + i) % this._capacity] as T)
    }
    for (let i = 0; i < other.size; i++) {
      result.pushBack(other.get(i))
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): Deque2<T> {
    const result = new Deque2<T>()
    for (let i = 0; i < this._size; i++) {
      const val = this.buffer[(this.head + i) % this._capacity] as T
      if (predicate(val, i)) {
        result.pushBack(val)
      }
    }
    return result
  }

  map<U>(fn: (value: T, index: number) => U): Deque2<U> {
    const result = new Deque2<U>({ initialCapacity: this._capacity })
    for (let i = 0; i < this._size; i++) {
      result.pushBack(fn(this.buffer[(this.head + i) % this._capacity] as T, i))
    }
    return result
  }

  reduce<U>(fn: (accumulator: U, value: T, index: number) => U, initial: U): U {
    let acc = initial
    for (let i = 0; i < this._size; i++) {
      acc = fn(acc, this.buffer[(this.head + i) % this._capacity] as T, i)
    }
    return acc
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    for (let i = 0; i < this._size; i++) {
      const val = this.buffer[(this.head + i) % this._capacity] as T
      if (predicate(val, i)) return val
    }
    return undefined
  }

  findIndex(predicate: (value: T, index: number) => boolean): number {
    for (let i = 0; i < this._size; i++) {
      const val = this.buffer[(this.head + i) % this._capacity] as T
      if (predicate(val, i)) return i
    }
    return -1
  }

  every(predicate: (value: T, index: number) => boolean): boolean {
    for (let i = 0; i < this._size; i++) {
      if (!predicate(this.buffer[(this.head + i) % this._capacity] as T, i)) return false
    }
    return true
  }

  some(predicate: (value: T, index: number) => boolean): boolean {
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.buffer[(this.head + i) % this._capacity] as T, i)) return true
    }
    return false
  }

  join(separator: string = ','): string {
    if (this._size === 0) return ''
    let result = String(this.buffer[this.head])
    for (let i = 1; i < this._size; i++) {
      result += separator + String(this.buffer[(this.head + i) % this._capacity])
    }
    return result
  }

  toString(): string {
    return `${Deque2}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'Deque2', size: this.size, items: this.toArray() }
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
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

  tap(fn: (collection: Deque2<T>) => void): Deque2<T> {
    fn(this)
    return this
  }

  static empty<T>(): Deque2<T> {
    return new Deque2<T>()
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
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
    return 'Deque2'
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
}

export type { Deque2Options } from './types.js'
