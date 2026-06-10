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
}
