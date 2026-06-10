import type { SegmentTreePointOptions, ForEachCallback } from './types.js'

const defaultOperation = (a: number, b: number): number => a + b
const defaultIdentity = 0

export class SegmentTreePoint<T> {
  private tree: T[]
  private _data: T[]
  private _n: number
  private operation: (a: T, b: T) => T
  private identity: T

  constructor(values: T[], options?: SegmentTreePointOptions<T>) {
    this._data = values.slice()
    this._n = values.length
    this.operation = options?.operation ?? (defaultOperation as unknown as (a: T, b: T) => T)
    this.identity = options?.identity ?? (defaultIdentity as unknown as T)
    const size = this._n === 0 ? 1 : 4 * this._n
    this.tree = new Array<T>(size)
    for (let i = 0; i < size; i++) {
      this.tree[i] = this.identity
    }
    if (this._n > 0) {
      this.build(1, 0, this._n - 1)
    }
  }

  private build(node: number, lo: number, hi: number): void {
    if (lo === hi) {
      this.tree[node] = this._data[lo]!
      return
    }
    const mid = Math.floor((lo + hi) / 2)
    this.build(node * 2, lo, mid)
    this.build(node * 2 + 1, mid + 1, hi)
    this.tree[node] = this.operation(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  private updateNode(node: number, lo: number, hi: number, index: number, value: T): void {
    if (lo === hi) {
      this.tree[node] = value
      this._data[index] = value
      return
    }
    const mid = Math.floor((lo + hi) / 2)
    if (index <= mid) {
      this.updateNode(node * 2, lo, mid, index, value)
    } else {
      this.updateNode(node * 2 + 1, mid + 1, hi, index, value)
    }
    this.tree[node] = this.operation(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  private queryNode(node: number, lo: number, hi: number, qLo: number, qHi: number): T {
    if (qLo > hi || qHi < lo) {
      return this.identity
    }
    if (qLo <= lo && hi <= qHi) {
      return this.tree[node]!
    }
    const mid = Math.floor((lo + hi) / 2)
    const left = this.queryNode(node * 2, lo, mid, qLo, qHi)
    const right = this.queryNode(node * 2 + 1, mid + 1, hi, qLo, qHi)
    return this.operation(left, right)
  }

  private getPoint(node: number, lo: number, hi: number, index: number): T {
    if (lo === hi) {
      return this.tree[node]!
    }
    const mid = Math.floor((lo + hi) / 2)
    if (index <= mid) {
      return this.getPoint(node * 2, lo, mid, index)
    }
    return this.getPoint(node * 2 + 1, mid + 1, hi, index)
  }

  update(index: number, value: T): void {
    if (index < 0 || index >= this._n) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._n})`)
    }
    this.updateNode(1, 0, this._n - 1, index, value)
  }

  query(lo: number, hi: number): T {
    if (this._n === 0) {
      throw new RangeError('Cannot query empty tree')
    }
    if (lo < 0 || hi >= this._n || lo > hi) {
      throw new RangeError(`Invalid range [${lo}, ${hi}] for size ${this._n}`)
    }
    return this.queryNode(1, 0, this._n - 1, lo, hi)
  }

  queryAll(): T {
    if (this._n === 0) {
      return this.identity
    }
    return this.queryNode(1, 0, this._n - 1, 0, this._n - 1)
  }

  pointQuery(index: number): T {
    if (index < 0 || index >= this._n) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._n})`)
    }
    return this.getPoint(1, 0, this._n - 1, index)
  }

  get size(): number {
    return this._n
  }

  get isEmpty(): boolean {
    return this._n === 0
  }

  toArray(): T[] {
    return this._data.slice()
  }

  forEach(callback: ForEachCallback<T>): void {
    for (let i = 0; i < this._n; i++) {
      callback(this._data[i]!, i)
    }
  }

  clone(): SegmentTreePoint<T> {
    const copy = new SegmentTreePoint<T>([], {
      operation: this.operation,
      identity: this.identity,
    })
    copy._data = this._data.slice()
    copy._n = this._n
    copy.tree = this.tree.slice()
    return copy
  }

  clear(): void {
    this._data = []
    this._n = 0
    this.tree = [this.identity]
  }

  static sum(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => a + b,
      identity: 0,
    })
  }

  static min(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => Math.min(a, b),
      identity: Infinity,
    })
  }

  static max(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => Math.max(a, b),
      identity: -Infinity,
    })
  }

  static gcd(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => {
        let x = Math.abs(a)
        let y = Math.abs(b)
        while (y !== 0) {
          const t = y
          y = x % y
          x = t
        }
        return x
      },
      identity: 0,
    })
  }

  static xor(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => (a ^ b) >>> 0,
      identity: 0,
    })
  }

  static product(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => a * b,
      identity: 1,
    })
  }

  static bitwiseOr(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => a | b,
      identity: 0,
    })
  }

  static bitwiseAnd(values: number[]): SegmentTreePoint<number> {
    return new SegmentTreePoint(values, {
      operation: (a, b) => a & b,
      identity: ~0 >>> 0,
    })
  }

  static fromArray<U>(values: U[], options?: SegmentTreePointOptions<U>): SegmentTreePoint<U> {
    return new SegmentTreePoint<U>(values, options)
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  static from<T>(items: T[]): SegmentTreePoint<T> {
    return new SegmentTreePoint<T>(items)
  }

  toString(): string {
    return `SegmentTreePoint({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SegmentTreePoint', size: this.size, items: this.toArray() }
  }

  static of<T>(...items: T[]): SegmentTreePoint<T> {
    return SegmentTreePoint.from(items)
  }

  merge(other: SegmentTreePoint<T>): SegmentTreePoint<T> {
    return SegmentTreePoint.from([...this.toArray(), ...other.toArray()])
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
    return 'SegmentTreePoint'
  }
}
