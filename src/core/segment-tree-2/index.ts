import type { SegmentTree2Options, ForEachCallback } from './types.js'

const defaultMerge = (a: number, b: number): number => a + b
const defaultIdentity = 0

export class SegmentTree2<T> {
  private tree: T[]
  private lazy: T[]
  private _data: T[]
  private _n: number
  private merge: (a: T, b: T) => T
  private identity: T

  constructor(arr: T[], options?: SegmentTree2Options<T>) {
    this._data = arr.slice()
    this._n = arr.length
    this.merge = options?.merge ?? (defaultMerge as unknown as (a: T, b: T) => T)
    this.identity = options?.identity ?? (defaultIdentity as unknown as T)
    const size = this._n === 0 ? 1 : 4 * this._n
    this.tree = new Array<T>(size)
    this.lazy = new Array<T>(size)
    for (let i = 0; i < size; i++) {
      this.tree[i] = this.identity
      this.lazy[i] = this.identity
    }
    if (this._n > 0) {
      this.buildTree(1, 0, this._n - 1)
    }
  }

  private buildTree(node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = this._data[start]!
      return
    }
    const mid = Math.floor((start + end) / 2)
    this.buildTree(node * 2, start, mid)
    this.buildTree(node * 2 + 1, mid + 1, end)
    this.tree[node] = this.merge(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  private pushDown(node: number, start: number, end: number): void {
    if (this.lazy[node] === this.identity) return
    const mid = Math.floor((start + end) / 2)
    const left = node * 2
    const right = node * 2 + 1
    const lazyVal = this.lazy[node]!
    const leftLen = mid - start + 1
    const rightLen = end - mid
    this.lazy[left] = this.merge(this.lazy[left]!, lazyVal)
    this.lazy[right] = this.merge(this.lazy[right]!, lazyVal)
    let leftAccum: T = this.identity
    for (let i = 0; i < leftLen; i++) {
      leftAccum = this.merge(leftAccum, lazyVal)
    }
    this.tree[left] = this.merge(this.tree[left]!, leftAccum)
    let rightAccum: T = this.identity
    for (let i = 0; i < rightLen; i++) {
      rightAccum = this.merge(rightAccum, lazyVal)
    }
    this.tree[right] = this.merge(this.tree[right]!, rightAccum)
    this.lazy[node] = this.identity
  }

  private queryRange(node: number, start: number, end: number, l: number, r: number): T {
    if (r < start || l > end) {
      return this.identity
    }
    if (l <= start && end <= r) {
      return this.tree[node]!
    }
    this.pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    const leftResult = this.queryRange(node * 2, start, mid, l, r)
    const rightResult = this.queryRange(node * 2 + 1, mid + 1, end, l, r)
    return this.merge(leftResult, rightResult)
  }

  private updatePoint(node: number, start: number, end: number, index: number, value: T): void {
    if (start === end) {
      this.tree[node] = value
      this._data[index] = value
      return
    }
    this.pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    if (index <= mid) {
      this.updatePoint(node * 2, start, mid, index, value)
    } else {
      this.updatePoint(node * 2 + 1, mid + 1, end, index, value)
    }
    this.tree[node] = this.merge(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  private updateRange(node: number, start: number, end: number, l: number, r: number, value: T): void {
    if (r < start || l > end) return
    if (l <= start && end <= r) {
      const len = end - start + 1
      let accum: T = this.identity
      for (let i = 0; i < len; i++) {
        accum = this.merge(accum, value)
      }
      this.tree[node] = this.merge(this.tree[node]!, accum)
      this.lazy[node] = this.merge(this.lazy[node]!, value)
      return
    }
    this.pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    this.updateRange(node * 2, start, mid, l, r, value)
    this.updateRange(node * 2 + 1, mid + 1, end, l, r, value)
    this.tree[node] = this.merge(this.tree[node * 2]!, this.tree[node * 2 + 1]!)
  }

  private getPoint(node: number, start: number, end: number, index: number): T {
    if (start === end) {
      return this.tree[node]!
    }
    this.pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    if (index <= mid) {
      return this.getPoint(node * 2, start, mid, index)
    }
    return this.getPoint(node * 2 + 1, mid + 1, end, index)
  }

  private flushAll(node: number, start: number, end: number): void {
    if (start === end) {
      this._data[start] = this.tree[node]!
      return
    }
    this.pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    this.flushAll(node * 2, start, mid)
    this.flushAll(node * 2 + 1, mid + 1, end)
  }

  query(l: number, r: number): T {
    if (this._n === 0) {
      throw new RangeError('Cannot query empty tree')
    }
    if (l < 0 || r > this._n || l >= r) {
      throw new RangeError(`Invalid range [${l}, ${r}) for size ${this._n}`)
    }
    if (l === r) return this.identity
    return this.queryRange(1, 0, this._n - 1, l, r - 1)
  }

  update(index: number, value: T): void {
    if (index < 0 || index >= this._n) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._n})`)
    }
    this.updatePoint(1, 0, this._n - 1, index, value)
  }

  rangeUpdate(l: number, r: number, value: T): void {
    if (this._n === 0) return
    if (l === r) return
    if (l < 0 || r > this._n || l > r) {
      throw new RangeError(`Invalid range [${l}, ${r}) for size ${this._n}`)
    }
    this.updateRange(1, 0, this._n - 1, l, r - 1, value)
  }

  get(index: number): T {
    if (index < 0 || index >= this._n) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this._n})`)
    }
    return this.getPoint(1, 0, this._n - 1, index)
  }

  set(index: number, value: T): void {
    this.update(index, value)
  }

  get size(): number {
    return this._n
  }

  get isEmpty(): boolean {
    return this._n === 0
  }

  toArray(): T[] {
    if (this._n === 0) return []
    this.flushAll(1, 0, this._n - 1)
    return this._data.slice()
  }

  clone(): SegmentTree2<T> {
    const copy = new SegmentTree2<T>([], {
      merge: this.merge,
      identity: this.identity,
    })
    copy._data = this._data.slice()
    copy._n = this._n
    copy.tree = this.tree.slice()
    copy.lazy = this.lazy.slice()
    return copy
  }

  clear(): void {
    this._data = []
    this._n = 0
    this.tree = [this.identity]
    this.lazy = [this.identity]
  }

  static fromArray<U>(arr: U[], options?: SegmentTree2Options<U>): SegmentTree2<U> {
    return new SegmentTree2<U>(arr, options)
  }

  forEach(callback: ForEachCallback<T>): void {
    for (let i = 0; i < this._n; i++) {
      callback(this.getPoint(1, 0, this._n - 1, i), i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._n; i++) {
      yield this.getPoint(1, 0, this._n - 1, i)
    }
  }

  first(): T {
    if (this._n === 0) {
      throw new RangeError('Cannot get first element of empty tree')
    }
    return this.getPoint(1, 0, this._n - 1, 0)
  }

  last(): T {
    if (this._n === 0) {
      throw new RangeError('Cannot get last element of empty tree')
    }
    return this.getPoint(1, 0, this._n - 1, this._n - 1)
  }

  indexOf(value: T): number {
    for (let i = 0; i < this._n; i++) {
      if (this.getPoint(1, 0, this._n - 1, i) === value) {
        return i
      }
    }
    return -1
  }

  indexOfRange(l: number, r: number, value: T): number {
    if (l < 0 || r > this._n || l >= r) {
      throw new RangeError(`Invalid range [${l}, ${r}) for size ${this._n}`)
    }
    for (let i = l; i < r; i++) {
      if (this.getPoint(1, 0, this._n - 1, i) === value) {
        return i
      }
    }
    return -1
  }

  min(): T {
    if (this._n === 0) {
      throw new RangeError('Cannot get min of empty tree')
    }
    let result = this.getPoint(1, 0, this._n - 1, 0)
    for (let i = 1; i < this._n; i++) {
      const val = this.getPoint(1, 0, this._n - 1, i)
      if (val < result) {
        result = val
      }
    }
    return result
  }

  max(): T {
    if (this._n === 0) {
      throw new RangeError('Cannot get max of empty tree')
    }
    let result = this.getPoint(1, 0, this._n - 1, 0)
    for (let i = 1; i < this._n; i++) {
      const val = this.getPoint(1, 0, this._n - 1, i)
      if (val > result) {
        result = val
      }
    }
    return result
  }

  sum(): T {
    if (this._n === 0) return this.identity
    return this.queryRange(1, 0, this._n - 1, 0, this._n - 1)
  }

  prefixSum(n: number): T {
    if (n < 0 || n > this._n) {
      throw new RangeError(`Invalid prefix length ${n} for size ${this._n}`)
    }
    if (n === 0) return this.identity
    return this.queryRange(1, 0, this._n - 1, 0, n - 1)
  }

  build(arr: T[]): void {
    this._data = arr.slice()
    this._n = arr.length
    const size = this._n === 0 ? 1 : 4 * this._n
    this.tree = new Array<T>(size)
    this.lazy = new Array<T>(size)
    for (let i = 0; i < size; i++) {
      this.tree[i] = this.identity
      this.lazy[i] = this.identity
    }
    if (this._n > 0) {
      this.buildTree(1, 0, this._n - 1)
    }
  }

  static from<T>(items: T[]): SegmentTree2<T> {
    return new SegmentTree2<T>(items)
  }

  toString(): string {
    return `SegmentTree2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SegmentTree2', size: this.size, items: this.toArray() }
  }

  static of<T>(...items: T[]): SegmentTree2<T> {
    return SegmentTree2.from(items)
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
    return 'SegmentTree2'
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
}
