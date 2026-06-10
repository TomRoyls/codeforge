import type { ChunkedArrayOptions } from './types.js'
import { DEFAULT_CHUNK_SIZE } from './types.js'

export class ChunkedArray<T = unknown> {
  private chunks: T[][] = []
  private _chunkSize: number
  private _length: number = 0

  constructor(chunkSize?: number)
  constructor(options?: Partial<ChunkedArrayOptions>)
  constructor(chunkSizeOrOptions?: number | Partial<ChunkedArrayOptions>) {
    if (typeof chunkSizeOrOptions === 'number') {
      this._chunkSize = Math.max(1, chunkSizeOrOptions)
    } else if (chunkSizeOrOptions && typeof chunkSizeOrOptions === 'object') {
      this._chunkSize = Math.max(1, chunkSizeOrOptions.chunkSize ?? DEFAULT_CHUNK_SIZE)
    } else {
      this._chunkSize = DEFAULT_CHUNK_SIZE
    }
  }

  private locate(index: number): { ci: number; ei: number } {
    let remaining = index
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunkLen = this.chunks[ci]!.length
      if (remaining < chunkLen) {
        return { ci, ei: remaining }
      }
      remaining -= chunkLen
    }
    const ci = Math.floor(index / this._chunkSize)
    const ei = index % this._chunkSize
    return { ci, ei }
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined
    const { ci, ei } = this.locate(index)
    return this.chunks[ci]![ei]
  }

  set(index: number, value: T): void {
    if (index < 0 || index >= this._length) {
      throw new RangeError(
        `Index ${index} out of bounds for ChunkedArray of size ${this._length}`
      )
    }
    const { ci, ei } = this.locate(index)
    this.chunks[ci]![ei] = value
  }

  push(value: T): number {
    const { ci } = this.locate(this._length)
    if (ci >= this.chunks.length) {
      this.chunks.push([value])
    } else {
      this.chunks[ci]!.push(value)
    }
    this._length++
    return this._length
  }

  pop(): T | undefined {
    if (this._length === 0) return undefined
    this._length--
    const { ci } = this.locate(this._length)
    const chunk = this.chunks[ci]!
    const value = chunk.pop()!
    if (chunk.length === 0) {
      this.chunks.splice(ci, 1)
    }
    return value
  }

  unshift(value: T): number {
    if (this.chunks.length === 0) {
      this.chunks.push([value])
    } else {
      const first = this.chunks[0]!
      if (first.length < this._chunkSize) {
        first.unshift(value)
      } else {
        this.chunks.unshift([value])
      }
    }
    this._length++
    return this._length
  }

  shift(): T | undefined {
    if (this._length === 0) return undefined
    const first = this.chunks[0]!
    const value = first.shift()!
    this._length--
    if (first.length === 0) {
      this.chunks.splice(0, 1)
    } else {
      this.rebalanceForward(0)
    }
    return value
  }

  insert(index: number, value: T): void {
    if (index < 0 || index > this._length) {
      throw new RangeError(
        `Index ${index} out of bounds for insert on ChunkedArray of size ${this._length}`
      )
    }
    if (index === 0) {
      this.unshift(value)
      return
    }
    if (index === this._length) {
      this.push(value)
      return
    }
    const { ci, ei } = this.locate(index)
    const chunk = this.chunks[ci]!
    if (chunk.length < this._chunkSize) {
      chunk.splice(ei, 0, value)
    } else {
      const right = chunk.splice(ei)
      chunk.push(value)
      this.chunks.splice(ci + 1, 0, right)
    }
    this._length++
  }

  delete(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined
    if (index === 0) return this.shift()
    if (index === this._length - 1) return this.pop()
    const { ci, ei } = this.locate(index)
    const chunk = this.chunks[ci]!
    const removed = chunk.splice(ei, 1)[0]!
    this._length--
    if (chunk.length === 0) {
      this.chunks.splice(ci, 1)
    }
    return removed
  }

  get size(): number {
    return this._length
  }

  isEmpty(): boolean {
    return this._length === 0
  }

  clear(): void {
    this.chunks = []
    this._length = 0
  }

  indexOf(value: T): number {
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        if (chunk[ei] === value) {
          return ci * this._chunkSize + ei
        }
      }
    }
    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  toArray(): T[] {
    const result: T[] = []
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        result.push(chunk[ei]!)
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        callback(chunk[ei]!, idx)
        idx++
      }
    }
  }

  map<U>(callback: (value: T, index: number) => U): ChunkedArray<U> {
    const result = new ChunkedArray<U>(this._chunkSize)
    let idx = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        result.push(callback(chunk[ei]!, idx))
        idx++
      }
    }
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): ChunkedArray<T> {
    const result = new ChunkedArray<T>(this._chunkSize)
    let idx = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        if (predicate(chunk[ei]!, idx)) {
          result.push(chunk[ei]!)
        }
        idx++
      }
    }
    return result
  }

  reduce<U>(callback: (acc: U, value: T, index: number) => U, initialValue: U): U {
    let acc = initialValue
    let idx = 0
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        acc = callback(acc, chunk[ei]!, idx)
        idx++
      }
    }
    return acc
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let ci = 0; ci < this.chunks.length; ci++) {
      const chunk = this.chunks[ci]!
      for (let ei = 0; ei < chunk.length; ei++) {
        yield chunk[ei]!
      }
    }
  }

  get chunkCount(): number {
    return this.chunks.length
  }

  get chunkSize(): number {
    return this._chunkSize
  }

  private rebalanceForward(startCi: number): void {
    let ci = startCi
    while (ci < this.chunks.length - 1) {
      const current = this.chunks[ci]!
      const next = this.chunks[ci + 1]!
      if (current.length === 0) {
        this.chunks.splice(ci, 1)
        continue
      }
      const needed = this._chunkSize - current.length
      if (needed > 0 && next.length > 0) {
        const take = Math.min(needed, next.length)
        for (let i = 0; i < take; i++) {
          current.push(next.shift()!)
        }
        if (next.length === 0) {
          this.chunks.splice(ci + 1, 1)
        }
      }
      ci++
    }
  }

  toString(): string {
    return `${ChunkedArray}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'ChunkedArray', size: this.size, items: this.toArray() }
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


  tap(fn: (collection: ChunkedArray<T>) => void): ChunkedArray<T> {
    fn(this)
    return this
  }

  equals(other: ChunkedArray<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
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

  static empty<T>(): ChunkedArray<T> {
    return new ChunkedArray<T>()
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
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

  pluck<K extends keyof T>(key: K): T[K][] {
    return this.toArray().map(item => item[key])
  }

  reduceRight<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduceRight(fn, initial)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
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

  countBy<K>(keyFn: (item: T) => K): Map<K, number> {
    const counts = new Map<K, number>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }

  pipe<U>(transform: (items: T[]) => U[]): U[] {
    return transform(this.toArray())
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

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
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

  sampleN(n: number): T[] {
    return this.shuffle().slice(0, n)
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

  toSet(): Set<T> {
    return new Set(this.toArray())
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












  get [Symbol.toStringTag](): string {
    return 'ChunkedArray'
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

  contains(value: T): boolean {
    return this.includes(value)
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

export { DEFAULT_CHUNK_SIZE } from './types.js'
export type { ChunkedArrayOptions } from './types.js'
