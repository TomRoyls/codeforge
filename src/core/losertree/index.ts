import type { Comparator, ForEachCallback, LoserTreeOptions } from './types.js'

const SENTINEL_INDEX = -1

const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class LoserTree<T = number> {
  private _k: number
  private _comparator: Comparator<T>
  private _tree: number[]
  private _runs: (T[])[]
  private _cursors: number[]
  private _initialized: boolean

  constructor(k: number, comparator?: Comparator<T>)
  constructor(k: number, options?: LoserTreeOptions<T>)
  constructor(k: number, arg?: Comparator<T> | LoserTreeOptions<T>) {
    if (k < 1) {
      throw new Error('k must be at least 1')
    }
    this._k = k
    if (typeof arg === 'function') {
      this._comparator = arg
    } else {
      this._comparator = arg?.comparator ?? defaultComparator
    }
    this._tree = new Array<number>(k).fill(SENTINEL_INDEX)
    this._runs = []
    this._cursors = new Array<number>(k).fill(0)
    this._initialized = false
  }

  initialize(runs: T[][]): void {
    if (runs.length !== this._k) {
      throw new Error(`Expected ${this._k} runs, got ${runs.length}`)
    }
    this._runs = runs.map(r => [...r])
    this._cursors = new Array<number>(this._k).fill(0)
    this._tree = new Array<number>(this._k).fill(SENTINEL_INDEX)
    this._buildTree()
    this._initialized = true
  }

  private _firstBeats(a: T | undefined, b: T | undefined): boolean {
    if (a === undefined && b === undefined) return true
    if (a === undefined) return false
    if (b === undefined) return true
    return this._comparator(a, b) <= 0
  }

  private _buildTree(): void {
    const winner = new Array<number>(this._k).fill(SENTINEL_INDEX)

    for (let i = 0; i < this._k; i++) {
      let current = i
      let parent = (i + this._k) >> 1

      while (parent > 0) {
        if (winner[parent] === SENTINEL_INDEX) {
          winner[parent] = current
          break
        }

        const other = winner[parent]!
        const cv = this._peekAt(current)
        const ov = this._peekAt(other)

        if (this._firstBeats(cv, ov)) {
          this._tree[parent] = other
          winner[parent] = current
        } else {
          this._tree[parent] = current
          winner[parent] = other
        }

        current = winner[parent]!
        parent >>= 1
      }

      if (parent === 0) {
        this._tree[0] = current
      }
    }
  }

  private _adjust(leafIndex: number): void {
    let current = leafIndex
    let parent = (current + this._k) >> 1
    while (parent > 0) {
      const stored = this._tree[parent]!
      if (stored === SENTINEL_INDEX) {
        this._tree[parent] = current
      } else {
        const cv = this._peekAt(current)
        const sv = this._peekAt(stored)
        if (this._firstBeats(cv, sv)) {
          this._tree[parent] = stored
        } else {
          this._tree[parent] = current
          current = stored
        }
      }
      parent >>= 1
    }
    this._tree[0] = current
  }

  private _peekAt(runIndex: number): T | undefined {
    const run = this._runs[runIndex]
    if (run === undefined) return undefined
    const cursor = this._cursors[runIndex]!
    if (cursor >= run.length) return undefined
    return run[cursor]
  }

  private _advanceRun(runIndex: number): void {
    this._cursors[runIndex] = this._cursors[runIndex]! + 1
  }

  private _winnerIndex(): number {
    if (!this._initialized) {
      throw new Error('LoserTree not initialized. Call initialize() first.')
    }
    return this._tree[0]!
  }

  next(): T | undefined {
    if (!this._initialized) {
      throw new Error('LoserTree not initialized. Call initialize() first.')
    }
    const winner = this._winnerIndex()
    const val = this._peekAt(winner)
    if (val === undefined) return undefined
    this._advanceRun(winner)
    this._adjust(winner)
    return val
  }

  replaceMin(newElement: T): T | undefined {
    if (!this._initialized) {
      throw new Error('LoserTree not initialized. Call initialize() first.')
    }
    const winner = this._winnerIndex()
    const oldVal = this._peekAt(winner)
    this._runs[winner]![this._cursors[winner]!] = newElement
    this._adjust(winner)
    return oldVal
  }

  get isEmpty(): boolean {
    if (!this._initialized) return true
    const winner = this._tree[0]!
    return this._peekAt(winner) === undefined
  }

  peek(): T | undefined {
    if (!this._initialized) return undefined
    const winner = this._tree[0]!
    return this._peekAt(winner)
  }

  get size(): number {
    return this._k
  }

  get totalElements(): number {
    if (!this._initialized) return 0
    let total = 0
    for (let i = 0; i < this._k; i++) {
      const run = this._runs[i]
      if (run !== undefined) {
        total += Math.max(0, run.length - this._cursors[i]!)
      }
    }
    return total
  }

  get exhaustedRuns(): number {
    if (!this._initialized) return this._k
    let count = 0
    for (let i = 0; i < this._k; i++) {
      const run = this._runs[i]
      if (run === undefined || this._cursors[i]! >= run.length) {
        count++
      }
    }
    return count
  }

  static merge<U>(sortedArrays: U[][], comparator?: Comparator<U>): U[] {
    const k = sortedArrays.length
    if (k === 0) return []
    if (k === 1) return [...sortedArrays[0]!]
    const tree = new LoserTree<U>(k, comparator)
    tree.initialize(sortedArrays)
    const result: U[] = []
    while (!tree.isEmpty) {
      const val = tree.next()
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  update(index: number, value: T): void {
    if (!this._initialized) {
      throw new Error('LoserTree not initialized. Call initialize() first.')
    }
    if (index < 0 || index >= this._k) {
      throw new Error(`Index ${index} out of range [0, ${this._k})`)
    }
    const run = this._runs[index]!
    const cursor = this._cursors[index]!
    const wasExhausted = cursor >= run.length
    if (wasExhausted) {
      run.push(value)
      this._tree = new Array<number>(this._k).fill(SENTINEL_INDEX)
      this._buildTree()
    } else {
      run[cursor] = value
      this._adjust(index)
    }
  }

  reset(runs: T[][]): void {
    this.initialize(runs)
  }

  toArray(): T[] {
    if (!this._initialized) return []
    const result: T[] = []
    const savedCursors = [...this._cursors]
    const savedTree = [...this._tree]
    while (!this.isEmpty) {
      const val = this.next()
      if (val !== undefined) {
        result.push(val)
      }
    }
    this._cursors = savedCursors
    this._tree = savedTree
    return result
  }

  clone(): LoserTree<T> {
    const copy = new LoserTree<T>(this._k, this._comparator)
    if (this._initialized) {
      const runsCopy = this._runs.map((run, idx) => {
        return run.slice(this._cursors[idx]!)
      })
      copy.initialize(runsCopy)
    }
    return copy
  }

  forEach(callback: ForEachCallback<T>): void {
    if (!this._initialized) return
    let idx = 0
    const savedCursors = [...this._cursors]
    const savedTree = [...this._tree]
    while (!this.isEmpty) {
      const val = this.next()
      if (val !== undefined) {
        callback(val, idx++)
      }
    }
    this._cursors = savedCursors
    this._tree = savedTree
  }

  *[Symbol.iterator](): Iterator<T> {
    if (!this._initialized) return
    const savedCursors = [...this._cursors]
    const savedTree = [...this._tree]
    while (!this.isEmpty) {
      const val = this.next()
      if (val !== undefined) {
        yield val
      }
    }
    this._cursors = savedCursors
    this._tree = savedTree
  }

  toString(): string {
    return `LoserTree({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'LoserTree', size: this.size, items: this.toArray() }
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
    return 'LoserTree'
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
}

export type { Comparator, ForEachCallback, LoserTreeOptions } from './types.js'
