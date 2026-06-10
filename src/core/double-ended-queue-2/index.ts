import type { DequeOptions } from './types.js'

const DEFAULT_CAPACITY = 16

export class Deque<T> {
  private buffer: (T | undefined)[]
  private head = 0
  private tail = 0
  private _size = 0
  private mask: number

  constructor(options?: DequeOptions) {
    const cap = options?.capacity ?? DEFAULT_CAPACITY
    const capacity = nextPow2(Math.max(cap, 1))
    this.buffer = new Array<T | undefined>(capacity)
    this.mask = capacity - 1
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  pushFront(value: T): void {
    if (this._size === this.buffer.length) this.grow()
    this.head = (this.head - 1) & this.mask
    this.buffer[this.head] = value
    this._size++
  }

  pushBack(value: T): void {
    if (this._size === this.buffer.length) this.grow()
    this.buffer[this.tail] = value
    this.tail = (this.tail + 1) & this.mask
    this._size++
  }

  popFront(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.buffer[this.head]!
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) & this.mask
    this._size--
    return value
  }

  popBack(): T | undefined {
    if (this._size === 0) return undefined
    this.tail = (this.tail - 1) & this.mask
    const value = this.buffer[this.tail]!
    this.buffer[this.tail] = undefined
    this._size--
    return value
  }

  front(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]!
  }

  back(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[(this.tail - 1) & this.mask]!
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    return this.buffer[(this.head + index) & this.mask]!
  }

  set(index: number, value: T): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    const pos = (this.head + index) & this.mask
    const old = this.buffer[pos]!
    this.buffer[pos] = value
    return old
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._size) return
    if (index === 0) {
      this.pushFront(value)
      return
    }
    if (index === this._size) {
      this.pushBack(value)
      return
    }
    if (this._size === this.buffer.length) this.grow()
    const pos = (this.head + index) & this.mask
    const mid = this._size >> 1
    if (index <= mid) {
      const newHead = (this.head - 1) & this.mask
      for (let i = 0; i < index; i++) {
        const from = (this.head + i) & this.mask
        const to = (newHead + i) & this.mask
        this.buffer[to] = this.buffer[from]
      }
      this.buffer[pos === this.head ? newHead : (pos - 1) & this.mask] = value
      this.head = newHead
    } else {
      for (let i = this._size; i > index; i--) {
        const from = (this.head + i - 1) & this.mask
        const to = (this.head + i) & this.mask
        this.buffer[to] = this.buffer[from]
      }
      this.buffer[pos] = value
      this.tail = (this.tail + 1) & this.mask
    }
    this._size++
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    if (index === 0) return this.popFront()
    if (index === this._size - 1) return this.popBack()
    const pos = (this.head + index) & this.mask
    const removed = this.buffer[pos]!
    const mid = this._size >> 1
    if (index <= mid) {
      for (let i = index; i > 0; i--) {
        const from = (this.head + i - 1) & this.mask
        const to = (this.head + i) & this.mask
        this.buffer[to] = this.buffer[from]
      }
      this.buffer[this.head] = undefined
      this.head = (this.head + 1) & this.mask
    } else {
      for (let i = index; i < this._size - 1; i++) {
        const from = (this.head + i + 1) & this.mask
        const to = (this.head + i) & this.mask
        this.buffer[to] = this.buffer[from]
      }
      this.tail = (this.tail - 1) & this.mask
      this.buffer[this.tail] = undefined
    }
    this._size--
    return removed
  }

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this.buffer[(this.head + i) & this.mask] = undefined
    }
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this.head + i) & this.mask]!)
    }
    return result
  }

  fromArray(arr: T[]): void {
    this.clear()
    for (const item of arr) {
      this.pushBack(item)
    }
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.buffer[(this.head + i) & this.mask]!, i)
    }
  }

  map<U>(callback: (value: T, index: number) => U): Deque<U> {
    const result = new Deque<U>({ capacity: this._size })
    for (let i = 0; i < this._size; i++) {
      result.pushBack(callback(this.buffer[(this.head + i) & this.mask]!, i))
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): Deque<T> {
    const result = new Deque<T>({ capacity: this._size })
    for (let i = 0; i < this._size; i++) {
      const val = this.buffer[(this.head + i) & this.mask]!
      if (predicate(val, i)) {
        result.pushBack(val)
      }
    }
    return result
  }

  reduce<U>(callback: (acc: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue
    for (let i = 0; i < this._size; i++) {
      acc = callback(acc, this.buffer[(this.head + i) & this.mask]!, i)
    }
    return acc
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    for (let i = 0; i < this._size; i++) {
      const val = this.buffer[(this.head + i) & this.mask]!
      if (predicate(val, i)) return val
    }
    return undefined
  }

  findIndex(predicate: (value: T, index: number) => boolean): number {
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.buffer[(this.head + i) & this.mask]!, i)) return i
    }
    return -1
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) & this.mask] === value) return i
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  slice(start = 0, end?: number): Deque<T> {
    const s = start < 0 ? Math.max(0, this._size + start) : Math.min(start, this._size)
    const e = end === undefined ? this._size : (end < 0 ? Math.max(0, this._size + end) : Math.min(end, this._size))
    const result = new Deque<T>({ capacity: Math.max(e - s, 1) })
    for (let i = s; i < e; i++) {
      result.pushBack(this.buffer[(this.head + i) & this.mask]!)
    }
    return result
  }

  concat(other: Deque<T>): Deque<T> {
    const result = new Deque<T>({ capacity: this._size + other._size })
    for (let i = 0; i < this._size; i++) {
      result.pushBack(this.buffer[(this.head + i) & this.mask]!)
    }
    for (let i = 0; i < other._size; i++) {
      result.pushBack(other.buffer[(other.head + i) & other.mask]!)
    }
    return result
  }

  reverse(): Deque<T> {
    const len = this._size
    for (let i = 0; i < (len >> 1); i++) {
      const a = (this.head + i) & this.mask
      const b = (this.head + len - 1 - i) & this.mask
      const tmp = this.buffer[a]
      this.buffer[a] = this.buffer[b]
      this.buffer[b] = tmp
    }
    return this
  }

  rotate(n: number): void {
    if (this._size <= 1) return
    const k = ((n % this._size) + this._size) % this._size
    if (k === 0) return
    this.reverse()
    this.reverseRange(0, this._size - k)
    this.reverseRange(this._size - k, this._size)
  }

  private reverseRange(lo: number, hi: number): void {
    let left = lo
    let right = hi - 1
    while (left < right) {
      const a = (this.head + left) & this.mask
      const b = (this.head + right) & this.mask
      const tmp = this.buffer[a]
      this.buffer[a] = this.buffer[b]
      this.buffer[b] = tmp
      left++
      right--
    }
  }

  equals(other: Deque<T>): boolean {
    if (this._size !== other._size) return false
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) & this.mask] !== other.buffer[(other.head + i) & other.mask]) return false
    }
    return true
  }

  clone(): Deque<T> {
    const result = new Deque<T>({ capacity: this._size })
    for (let i = 0; i < this._size; i++) {
      result.pushBack(this.buffer[(this.head + i) & this.mask]!)
    }
    return result
  }

  every(predicate: (value: T, index: number) => boolean): boolean {
    for (let i = 0; i < this._size; i++) {
      if (!predicate(this.buffer[(this.head + i) & this.mask]!, i)) return false
    }
    return true
  }

  some(predicate: (value: T, index: number) => boolean): boolean {
    for (let i = 0; i < this._size; i++) {
      if (predicate(this.buffer[(this.head + i) & this.mask]!, i)) return true
    }
    return false
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this.buffer[(this.head + i) & this.mask]!
    }
  }

  private grow(): void {
    const newLen = this.buffer.length << 1
    const newBuf = new Array<T | undefined>(newLen)
    for (let i = 0; i < this._size; i++) {
      newBuf[i] = this.buffer[(this.head + i) & this.mask]
    }
    this.buffer = newBuf
    this.mask = newLen - 1
    this.head = 0
    this.tail = this._size
  }

  static from<T>(arr: T[], options?: DequeOptions): Deque<T> {
    const d = new Deque<T>({ capacity: Math.max(arr.length, options?.capacity ?? 0) })
    for (const item of arr) {
      d.pushBack(item)
    }
    return d
  }

  toString(): string {
    return `${Deque}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'Deque', size: this.size, items: this.toArray() }
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
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

  static empty<T>(): Deque<T> {
    return new Deque<T>()
  }

  static of<T>(...items: T[]): Deque<T> {
    return Deque.from(items)
  }

  merge(other: Deque<T>): Deque<T> {
    return Deque.from([...this.toArray(), ...other.toArray()])
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
    return 'Deque'
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

}

function nextPow2(n: number): number {
  let v = n - 1
  v |= v >> 1
  v |= v >> 2
  v |= v >> 4
  v |= v >> 8
  v |= v >> 16
  return v + 1
}
