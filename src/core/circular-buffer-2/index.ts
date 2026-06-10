import type { CircularBufferOptions } from './types.js'

export class CircularBuffer<T> {
  private buffer: (T | undefined)[]
  private head = 0
  private tail = 0
  private _size = 0
  private _capacity: number
  private _overwrite: boolean

  constructor(options: CircularBufferOptions) {
    this._capacity = Math.max(Math.floor(options.capacity), 1)
    this._overwrite = options.overwrite ?? false
    this.buffer = new Array<T | undefined>(this._capacity)
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

  push(value: T): void {
    if (this._size === this._capacity) {
      if (!this._overwrite) throw new Error('CircularBuffer is full')
      this.buffer[this.tail] = value
      this.tail = (this.tail + 1) % this._capacity
      this.head = this.tail
      return
    }
    this.buffer[this.tail] = value
    this.tail = (this.tail + 1) % this._capacity
    this._size++
  }

  pop(): T | undefined {
    if (this._size === 0) return undefined
    this.tail = (this.tail - 1 + this._capacity) % this._capacity
    const value = this.buffer[this.tail]!
    this.buffer[this.tail] = undefined
    this._size--
    return value
  }

  shift(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.buffer[this.head]!
    this.buffer[this.head] = undefined
    this.head = (this.head + 1) % this._capacity
    this._size--
    return value
  }

  unshift(value: T): void {
    if (this._size === this._capacity) {
      if (!this._overwrite) throw new Error('CircularBuffer is full')
      this.head = (this.head - 1 + this._capacity) % this._capacity
      this.tail = (this.tail - 1 + this._capacity) % this._capacity
      this.buffer[this.head] = value
      return
    }
    this.head = (this.head - 1 + this._capacity) % this._capacity
    this.buffer[this.head] = value
    this._size++
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    return this.buffer[(this.head + index) % this._capacity]!
  }

  set(index: number, value: T): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    const pos = (this.head + index) % this._capacity
    const old = this.buffer[pos]!
    this.buffer[pos] = value
    return old
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[this.head]!
  }

  peekLast(): T | undefined {
    if (this._size === 0) return undefined
    return this.buffer[(this.tail - 1 + this._capacity) % this._capacity]!
  }

  clear(): void {
    for (let i = 0; i < this._size; i++) {
      this.buffer[(this.head + i) % this._capacity] = undefined
    }
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this.head + i) % this._capacity]!)
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
      callback(this.buffer[(this.head + i) % this._capacity]!, i)
    }
  }

  map<U>(callback: (value: T, index: number) => U): CircularBuffer<U> {
    const result = new CircularBuffer<U>({ capacity: this._capacity, overwrite: this._overwrite })
    for (let i = 0; i < this._size; i++) {
      result.push(callback(this.buffer[(this.head + i) % this._capacity]!, i))
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): CircularBuffer<T> {
    const result = new CircularBuffer<T>({ capacity: this._capacity, overwrite: this._overwrite })
    for (let i = 0; i < this._size; i++) {
      const val = this.buffer[(this.head + i) % this._capacity]!
      if (predicate(val, i)) {
        result.push(val)
      }
    }
    return result
  }

  write(values: readonly T[]): number {
    let written = 0
    for (const value of values) {
      if (this._size === this._capacity && !this._overwrite) break
      this.push(value)
      written++
    }
    return written
  }

  read(count: number): T[] {
    const result: T[] = []
    const n = Math.min(count, this._size)
    for (let i = 0; i < n; i++) {
      const value = this.shift()!
      result.push(value)
    }
    return result
  }

  get available(): number {
    return this._size
  }

  get remaining(): number {
    return this._capacity - this._size
  }

  resize(newCapacity: number): void {
    newCapacity = Math.max(Math.floor(newCapacity), 1)
    if (newCapacity === this._capacity) return
    const newBuffer = new Array<T | undefined>(newCapacity)
    const count = Math.min(this._size, newCapacity)
    for (let i = 0; i < count; i++) {
      newBuffer[i] = this.buffer[(this.head + i) % this._capacity]
    }
    this.buffer = newBuffer
    this.head = 0
    this.tail = count % newCapacity
    this._size = count
    this._capacity = newCapacity
  }

  clone(): CircularBuffer<T> {
    const result = new CircularBuffer<T>({ capacity: this._capacity, overwrite: this._overwrite })
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this.head + i) % this._capacity]!)
    }
    return result
  }

  equals(other: CircularBuffer<T>): boolean {
    if (this._size !== other._size) return false
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) % this._capacity] !== other.buffer[(other.head + i) % other._capacity]) return false
    }
    return true
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this.buffer[(this.head + i) % this._capacity] === value) return i
    }
    return -1
  }

  lastIndexOf(value: T): number {
    for (let i = this._size - 1; i >= 0; i--) {
      if (this.buffer[(this.head + i) % this._capacity] === value) return i
    }
    return -1
  }

  reverse(): CircularBuffer<T> {
    const len = this._size
    for (let i = 0; i < (len >> 1); i++) {
      const a = (this.head + i) % this._capacity
      const b = (this.head + len - 1 - i) % this._capacity
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
      const a = (this.head + left) % this._capacity
      const b = (this.head + right) % this._capacity
      const tmp = this.buffer[a]
      this.buffer[a] = this.buffer[b]
      this.buffer[b] = tmp
      left++
      right--
    }
  }

  toString(): string {
    const items = this.toArray().map(String).join(', ')
    return `CircularBuffer(${this._size}/${this._capacity}) [${items}]`
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this.buffer[(this.head + i) % this._capacity]!
    }
  }

  static from<T>(arr: T[], options?: CircularBufferOptions): CircularBuffer<T> {
    const cap = Math.max(arr.length, options?.capacity ?? 0)
    const buf = new CircularBuffer<T>({ capacity: cap, overwrite: options?.overwrite })
    for (const item of arr) {
      buf.push(item)
    }
    return buf
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'CircularBuffer', size: this.size, items: this.toArray() }
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

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
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

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  tap(fn: (collection: CircularBuffer<T>) => void): CircularBuffer<T> {
    fn(this)
    return this
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

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  static of<T>(...items: T[]): CircularBuffer<T> {
    return CircularBuffer.from(items)
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: Iterable<T>): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
  }

  difference(other: Iterable<T>): T[] {
    const exclude = new Set(other)
    return this.toArray().filter(item => !exclude.has(item))
  }

  union(other: Iterable<T>): T[] {
    const set = new Set<T>([...this.toArray(), ...other])
    return [...set]
  }

  merge(other: CircularBuffer<T>): CircularBuffer<T> {
    return CircularBuffer.from([...this.toArray(), ...other.toArray()])
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

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
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

  sum(this: { toArray(): number[] }): number {
    return this.toArray().reduce((a, b) => a + b, 0)
  }

  average(this: { toArray(): number[] }): number {
    const arr = this.toArray()
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
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
}
