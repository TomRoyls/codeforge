import type { RingBufferOptions } from './types.js'

export class RingBuffer<T = unknown> {
  private buffer: (T | undefined)[]
  private _head: number
  private _tail: number
  private _size: number
  private _capacity: number

  constructor(optionsOrCapacity: number | RingBufferOptions) {
    const cap =
      typeof optionsOrCapacity === 'number'
        ? optionsOrCapacity
        : optionsOrCapacity.capacity
    if (!Number.isInteger(cap) || cap < 1) {
      throw new RangeError('Capacity must be a positive integer')
    }
    this._capacity = cap
    this.buffer = new Array<T | undefined>(this._capacity)
    this._head = 0
    this._tail = 0
    this._size = 0
  }

  get capacity(): number {
    return this._capacity
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get isFull(): boolean {
    return this._size === this._capacity
  }

  push(value: T): void {
    this.buffer[this._tail] = value
    this._tail = (this._tail + 1) % this._capacity
    if (this._size === this._capacity) {
      this._head = (this._head + 1) % this._capacity
    } else {
      this._size++
    }
  }

  pop(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot pop from empty buffer')
    }
    this._tail = (this._tail - 1 + this._capacity) % this._capacity
    const value = this.buffer[this._tail]
    this.buffer[this._tail] = undefined
    this._size--
    return value as T
  }

  shift(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot shift from empty buffer')
    }
    const value = this.buffer[this._head]
    this.buffer[this._head] = undefined
    this._head = (this._head + 1) % this._capacity
    this._size--
    return value as T
  }

  unshift(value: T): void {
    this._head = (this._head - 1 + this._capacity) % this._capacity
    this.buffer[this._head] = value
    if (this._size === this._capacity) {
      this._tail = (this._tail - 1 + this._capacity) % this._capacity
    } else {
      this._size++
    }
  }

  get(index: number): T {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    return this.buffer[(this._head + index) % this._capacity] as T
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._size})`)
    }
    this.buffer[(this._head + index) % this._capacity] = value
  }

  peek(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot peek from empty buffer')
    }
    return this.buffer[this._head] as T
  }

  peekBack(): T {
    if (this._size === 0) {
      throw new RangeError('Cannot peekBack from empty buffer')
    }
    const idx = (this._tail - 1 + this._capacity) % this._capacity
    return this.buffer[idx] as T
  }

  clear(): void {
    for (let i = 0; i < this._capacity; i++) {
      this.buffer[i] = undefined
    }
    this._head = 0
    this._tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this._head + i) % this._capacity] as T)
    }
    return result
  }

  forEach(callback: (value: T, index: number, buffer: RingBuffer<T>) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.buffer[(this._head + i) % this._capacity] as T, i, this)
    }
  }

  map<U>(callback: (value: T, index: number, buffer: RingBuffer<T>) => U): U[] {
    const result: U[] = []
    for (let i = 0; i < this._size; i++) {
      result.push(
        callback(this.buffer[(this._head + i) % this._capacity] as T, i, this)
      )
    }
    return result
  }

  filter(predicate: (value: T, index: number, buffer: RingBuffer<T>) => boolean): T[] {
    const result: T[] = []
    for (let i = 0; i < this._size; i++) {
      const val = this.buffer[(this._head + i) % this._capacity] as T
      if (predicate(val, i, this)) {
        result.push(val)
      }
    }
    return result
  }

  reduce<U>(
    callback: (accumulator: U, value: T, index: number, buffer: RingBuffer<T>) => U,
    initialValue: U
  ): U {
    let acc = initialValue
    for (let i = 0; i < this._size; i++) {
      acc = callback(
        acc,
        this.buffer[(this._head + i) % this._capacity] as T,
        i,
        this
      )
    }
    return acc
  }

  resize(newCapacity: number): void {
    if (!Number.isInteger(newCapacity) || newCapacity < 1) {
      throw new RangeError('New capacity must be a positive integer')
    }
    const oldData = this.toArray()
    this._capacity = newCapacity
    this.buffer = new Array<T | undefined>(this._capacity)
    this._head = 0
    this._size = 0
    this._tail = 0
    const start = Math.max(0, oldData.length - newCapacity)
    for (let i = start; i < oldData.length; i++) {
      this.buffer[this._tail] = oldData[i]
      this._tail = (this._tail + 1) % this._capacity
      this._size++
    }
  }

  write(values: T[]): number {
    let written = 0
    for (const v of values) {
      this.push(v)
      written++
    }
    return written
  }

  read(count: number): T[] {
    if (count < 0) {
      throw new RangeError('Count must be non-negative')
    }
    const result: T[] = []
    const toRead = Math.min(count, this._size)
    for (let i = 0; i < toRead; i++) {
      result.push(this.shift())
    }
    return result
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0
    const buf = this
    return {
      next(): IteratorResult<T> {
        if (index >= buf._size) {
          return { done: true, value: undefined }
        }
        const value = buf.buffer[(buf._head + index) % buf._capacity] as T
        index++
        return { done: false, value }
      },
    }
  }

  toString(): string {
    return `RingBuffer({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'RingBuffer', size: this.size, items: this.toArray() }
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
    return 'RingBuffer'
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
