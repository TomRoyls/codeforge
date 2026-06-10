import type { SqrtDecompositionOptions, ForEachCallback } from './types.js'

const defaultOptions: SqrtDecompositionOptions<number> = {
  operation: (a, b) => a + b,
  identity: 0,
}

export class SqrtDecomposition<T> {
  private data: T[]
  private blocks: T[]
  private lazy: T[]
  private _blockSize: number
  private _blockCount: number
  private op: (a: T, b: T) => T
  private identity: T

  constructor(array: T[], options?: SqrtDecompositionOptions<T>) {
    const resolved = options ?? (defaultOptions as unknown as SqrtDecompositionOptions<T>)
    this.op = resolved.operation
    this.identity = resolved.identity
    this.data = array.slice()
    const n = this.data.length
    this._blockSize = n === 0 ? 1 : Math.ceil(Math.sqrt(n))
    this._blockCount = n === 0 ? 0 : Math.ceil(n / this._blockSize)
    this.blocks = []
    this.lazy = []
    this.buildBlocks()
  }

  private buildBlocks(): void {
    this.blocks = new Array(this._blockCount).fill(undefined) as T[]
    this.lazy = new Array(this._blockCount).fill(undefined) as T[]
    for (let b = 0; b < this._blockCount; b++) {
      this.blocks[b] = this.identity
      this.lazy[b] = this.identity
    }
    for (let i = 0; i < this.data.length; i++) {
      const b = Math.floor(i / this._blockSize)
      this.blocks[b] = this.op(this.blocks[b]!, this.data[i]!)
    }
  }

  private pushLazy(blockIndex: number): void {
    const lazyVal = this.lazy[blockIndex]
    if (lazyVal === this.identity) return
    const start = blockIndex * this._blockSize
    const end = Math.min(start + this._blockSize, this.data.length)
    for (let i = start; i < end; i++) {
      this.data[i] = this.op(this.data[i]!, lazyVal!)
    }
    this.lazy[blockIndex] = this.identity
  }

  private blockElementCount(blockIndex: number): number {
    const start = blockIndex * this._blockSize
    const end = Math.min(start + this._blockSize, this.data.length)
    return end - start
  }

  rangeQuery(from: number, to: number): T {
    if (from < 0 || to < 0 || from >= this.data.length || to >= this.data.length) {
      throw new RangeError(`Range [${from}, ${to}] out of bounds [0, ${this.data.length})`)
    }
    if (from > to) {
      throw new RangeError(`Invalid range: from (${from}) > to (${to})`)
    }
    let result = this.identity
    const firstBlock = Math.floor(from / this._blockSize)
    const lastBlock = Math.floor(to / this._blockSize)

    if (firstBlock === lastBlock) {
      for (let i = from; i <= to; i++) {
        result = this.op(result, this.op(this.data[i]!, this.lazy[firstBlock]!))
      }
      return result
    }

    for (let i = from; i < (firstBlock + 1) * this._blockSize && i <= to; i++) {
      result = this.op(result, this.op(this.data[i]!, this.lazy[firstBlock]!))
    }

    for (let b = firstBlock + 1; b < lastBlock; b++) {
      const count = this.blockElementCount(b)
      let blockResult: T = this.blocks[b]!
      for (let k = 0; k < count; k++) {
        blockResult = this.op(blockResult, this.lazy[b]!)
      }
      result = this.op(result, blockResult)
    }

    for (let i = lastBlock * this._blockSize; i <= to; i++) {
      result = this.op(result, this.op(this.data[i]!, this.lazy[lastBlock]!))
    }

    return result
  }

  pointUpdate(index: number, value: T): void {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`)
    }
    const blockIndex = Math.floor(index / this._blockSize)
    this.pushLazy(blockIndex)
    this.data[index] = value
    this.recomputeBlock(blockIndex)
  }

  rangeUpdate(from: number, to: number, delta: T): void {
    if (from < 0 || to < 0 || from >= this.data.length || to >= this.data.length) {
      throw new RangeError(`Range [${from}, ${to}] out of bounds [0, ${this.data.length})`)
    }
    if (from > to) {
      throw new RangeError(`Invalid range: from (${from}) > to (${to})`)
    }
    const firstBlock = Math.floor(from / this._blockSize)
    const lastBlock = Math.floor(to / this._blockSize)

    if (firstBlock === lastBlock) {
      this.pushLazy(firstBlock)
      for (let i = from; i <= to; i++) {
        this.data[i] = this.op(this.data[i]!, delta)
      }
      this.recomputeBlock(firstBlock)
      return
    }

    this.pushLazy(firstBlock)
    for (let i = from; i < (firstBlock + 1) * this._blockSize; i++) {
      this.data[i] = this.op(this.data[i]!, delta)
    }
    this.recomputeBlock(firstBlock)

    for (let b = firstBlock + 1; b < lastBlock; b++) {
      this.lazy[b] = this.op(this.lazy[b]!, delta)
    }

    this.pushLazy(lastBlock)
    for (let i = lastBlock * this._blockSize; i <= to; i++) {
      this.data[i] = this.op(this.data[i]!, delta)
    }
    this.recomputeBlock(lastBlock)
  }

  private recomputeBlock(blockIndex: number): void {
    const start = blockIndex * this._blockSize
    const end = Math.min(start + this._blockSize, this.data.length)
    this.blocks[blockIndex] = this.identity
    for (let i = start; i < end; i++) {
      this.blocks[blockIndex] = this.op(this.blocks[blockIndex]!, this.data[i]!)
    }
  }

  get(index: number): T {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`)
    }
    const blockIndex = Math.floor(index / this._blockSize)
    return this.op(this.data[index]!, this.lazy[blockIndex]!)
  }

  set(index: number, value: T): void {
    this.pointUpdate(index, value)
  }

  get size(): number {
    return this.data.length
  }

  get isEmpty(): boolean {
    return this.data.length === 0
  }

  clear(): void {
    this.data = []
    this.blocks = []
    this.lazy = []
    this._blockSize = 1
    this._blockCount = 0
  }

  toArray(): T[] {
    const result: T[] = new Array(this.data.length) as T[]
    for (let i = 0; i < this.data.length; i++) {
      const blockIndex = Math.floor(i / this._blockSize)
      result[i] = this.op(this.data[i]!, this.lazy[blockIndex]!)
    }
    return result
  }

  clone(): SqrtDecomposition<T> {
    const copy = new SqrtDecomposition<T>([], { operation: this.op, identity: this.identity })
    copy.data = this.data.slice()
    copy.blocks = this.blocks.slice()
    copy.lazy = this.lazy.slice()
    copy._blockSize = this._blockSize
    copy._blockCount = this._blockCount
    return copy
  }

  push(item: T): void {
    this.data.push(item)
    const n = this.data.length
    const newBlockCount = n === 0 ? 0 : Math.ceil(n / this._blockSize)
    if (newBlockCount > this._blockCount) {
      this._blockCount = newBlockCount
      this.blocks.push(this.identity)
      this.lazy.push(this.identity)
    }
    const blockIndex = Math.floor((n - 1) / this._blockSize)
    this.blocks[blockIndex] = this.op(this.blocks[blockIndex]!, item)
  }

  pop(): T {
    if (this.data.length === 0) {
      throw new RangeError('Cannot pop from empty structure')
    }
    const lastBlockIndex = Math.floor((this.data.length - 1) / this._blockSize)
    this.pushLazy(lastBlockIndex)
    const value = this.data.pop()!
    const n = this.data.length
    const newBlockCount = n === 0 ? 0 : Math.ceil(n / this._blockSize)
    if (newBlockCount < this._blockCount) {
      this._blockCount = newBlockCount
      this.blocks.pop()
      this.lazy.pop()
    } else {
      this.recomputeBlock(lastBlockIndex)
    }
    return value
  }

  static fromArray<U>(items: U[], options?: SqrtDecompositionOptions<U>): SqrtDecomposition<U> {
    return new SqrtDecomposition<U>(items, options)
  }

  forEach(callback: ForEachCallback<T>): void {
    for (let i = 0; i < this.data.length; i++) {
      const blockIndex = Math.floor(i / this._blockSize)
      callback(this.op(this.data[i]!, this.lazy[blockIndex]!), i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.data.length; i++) {
      const blockIndex = Math.floor(i / this._blockSize)
      yield this.op(this.data[i]!, this.lazy[blockIndex]!)
    }
  }

  rebuild(): void {
    const n = this.data.length
    for (let b = 0; b < this._blockCount; b++) {
      this.pushLazy(b)
    }
    this._blockSize = n === 0 ? 1 : Math.ceil(Math.sqrt(n))
    this._blockCount = n === 0 ? 0 : Math.ceil(n / this._blockSize)
    this.buildBlocks()
  }

  get blockCount(): number {
    return this._blockCount
  }

  get blockSize(): number {
    return this._blockSize
  }

  static from<T>(items: T[]): SqrtDecomposition<T> {
    return new SqrtDecomposition<T>(items)
  }

  toString(): string {
    return `SqrtDecomposition({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SqrtDecomposition', size: this.size, items: this.toArray() }
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }

  static of<T>(...items: T[]): SqrtDecomposition<T> {
    return SqrtDecomposition.from(items)
  }

  merge(other: SqrtDecomposition<T>): SqrtDecomposition<T> {
    return SqrtDecomposition.from([...this.toArray(), ...other.toArray()])
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

  get [Symbol.toStringTag](): string {
    return 'SqrtDecomposition'
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

  contains(item: T): boolean {
    return this.includes(item)
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

  indexOf(item: T): number {
    return this.toArray().indexOf(item)
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
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
    return !this.isEmpty
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

  combinations(k: number): T[][] {
    const arr = this.toArray()
    if (k <= 0 || k > arr.length) return []
    if (k === 1) return arr.map(item => [item])
    const result: T[][] = []
    const combine = (start: number, current: T[]) => {
      if (current.length === k) {
        result.push([...current])
        return
      }
      for (let i = start; i < arr.length; i++) {
        current.push(arr[i]!)
        combine(i + 1, current)
        current.pop()
      }
    }
    combine(0, [])
    return result
  }

  powerSet(): T[][] {
    const arr = this.toArray()
    if (arr.length > 16) return [[], [...arr]]
    const result: T[][] = []
    const n = 1 << arr.length
    for (let mask = 0; mask < n; mask++) {
      const subset: T[] = []
      for (let i = 0; i < arr.length; i++) {
        if (mask & (1 << i)) {
          subset.push(arr[i]!)
        }
      }
      result.push(subset)
    }
    return result
  }

  enumerate(): [number, T][] {
    return this.toArray().map((item, i) => [i, item] as [number, T])
  }

  isSorted(comparator?: (a: T, b: T) => number): boolean {
    const arr = this.toArray()
    const cmp = comparator ?? ((a: T, b: T) => a < b ? -1 : a > b ? 1 : 0)
    for (let i = 1; i < arr.length; i++) {
      if (cmp(arr[i - 1]!, arr[i]!) > 0) return false
    }
    return true
  }

  palindrome(): boolean {
    const arr = this.toArray()
    for (let i = 0; i < arr.length / 2; i++) {
      if (arr[i] !== arr[arr.length - 1 - i]) return false
    }
    return true
  }

  isStrictlyIncreasing(this: { toArray(): number[] }): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! >= arr[i]!) return false
    }
    return true
  }

  isStrictlyDecreasing(this: { toArray(): number[] }): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! <= arr[i]!) return false
    }
    return true
  }

  replaceAt(index: number, value: T): T[] {
    const arr = [...this.toArray()]
    if (index >= 0 && index < arr.length) {
      arr[index] = value
    }
    return arr
  }

  repeatEach(n: number): T[] {
    const result: T[] = []
    for (const item of this.toArray()) {
      for (let i = 0; i < n; i++) {
        result.push(item)
      }
    }
    return result
  }

  removeAt(index: number): T[] {
    return this.toArray().filter((_, i) => i !== index)
  }

  insertAt(index: number, value: T): T[] {
    const arr = this.toArray()
    return [...arr.slice(0, index), value, ...arr.slice(index)]
  }

  removeFirst(): T[] {
    return this.toArray().slice(1)
  }

  removeLast(): T[] {
    return this.toArray().slice(0, -1)
  }
}
