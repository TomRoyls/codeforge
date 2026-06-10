import type { SegmentTreeOptions, Operation } from './types.js'

const NOOP_COMBINE: unique symbol = Symbol('noop')

export class LazySegmentTree<T, U = T> {
  private _n: number
  private _size: number
  private _tree: T[]
  private _lazy: U[]
  private _hasPending: boolean[]
  private _op: Operation<T, U>

  constructor(arr: T[], options: SegmentTreeOptions<T, U>) {
    this._n = arr.length
    this._size = 1
    while (this._size < this._n) {
      this._size <<= 1
    }

    const lazyApply: Operation<T, U>['lazyApply'] =
      options.lazyApply ?? ((value: T, _lazy: U, _len: number) => value)

    const lazyCombine: Operation<T, U>['lazyCombine'] =
      options.lazyCombine ??
      ((_existing: U, _incoming: U) => _incoming)

    const combine = options.combine ?? ((a: T, b: T) => {
      if ((combine as unknown) === NOOP_COMBINE) return a
      void b
      return a
    })

    this._op = {
      combine,
      identity: options.identity,
      lazyIdentity: options.lazyIdentity,
      lazyApply,
      lazyCombine,
    }

    this._tree = new Array<T>(2 * this._size)
    this._lazy = new Array<U>(2 * this._size)
    this._hasPending = new Array<boolean>(2 * this._size)

    for (let i = 0; i < 2 * this._size; i++) {
      this._tree[i] = this._op.identity
      this._lazy[i] = this._op.lazyIdentity
      this._hasPending[i] = false
    }

    for (let i = 0; i < this._n; i++) {
      this._tree[this._size + i] = arr[i]!
    }

    for (let i = this._size - 1; i >= 1; i--) {
      this._tree[i] = this._op.combine(
        this._tree[2 * i]!,
        this._tree[2 * i + 1]!,
      )
    }
  }

  private _applyLazy(node: number, lazyVal: U, rangeLen: number): void {
    this._tree[node] = this._op.lazyApply(this._tree[node]!, lazyVal, rangeLen)
    if (node < this._size) {
      this._lazy[node] = this._op.lazyCombine(this._lazy[node]!, lazyVal)
      this._hasPending[node] = true
    }
  }

  private _push(node: number, rangeLen: number): void {
    if (!this._hasPending[node]) return
    this._hasPending[node] = false
    const halfRange = rangeLen >> 1
    const lazyVal = this._lazy[node]!
    this._applyLazy(2 * node, lazyVal, halfRange)
    this._applyLazy(2 * node + 1, lazyVal, halfRange)
    this._lazy[node] = this._op.lazyIdentity
  }

  private _queryRange(node: number, nodeLo: number, nodeHi: number, qLo: number, qHi: number): T {
    if (qLo > nodeHi || qHi < nodeLo) return this._op.identity
    if (qLo <= nodeLo && nodeHi <= qHi) return this._tree[node]!
    this._push(node, nodeHi - nodeLo + 1)
    const mid = (nodeLo + nodeHi) >> 1
    const left = this._queryRange(2 * node, nodeLo, mid, qLo, qHi)
    const right = this._queryRange(2 * node + 1, mid + 1, nodeHi, qLo, qHi)
    return this._op.combine(left, right)
  }

  private _updateRange(node: number, nodeLo: number, nodeHi: number, qLo: number, qHi: number, val: U): void {
    if (qLo > nodeHi || qHi < nodeLo) return
    if (qLo <= nodeLo && nodeHi <= qHi) {
      this._applyLazy(node, val, nodeHi - nodeLo + 1)
      return
    }
    this._push(node, nodeHi - nodeLo + 1)
    const mid = (nodeLo + nodeHi) >> 1
    this._updateRange(2 * node, nodeLo, mid, qLo, qHi, val)
    this._updateRange(2 * node + 1, mid + 1, nodeHi, qLo, qHi, val)
    this._tree[node] = this._op.combine(this._tree[2 * node]!, this._tree[2 * node + 1]!)
  }

  private _updatePoint(node: number, nodeLo: number, nodeHi: number, idx: number, val: T): void {
    if (nodeLo === nodeHi) {
      this._tree[node] = val
      return
    }
    this._push(node, nodeHi - nodeLo + 1)
    const mid = (nodeLo + nodeHi) >> 1
    if (idx <= mid) {
      this._updatePoint(2 * node, nodeLo, mid, idx, val)
    } else {
      this._updatePoint(2 * node + 1, mid + 1, nodeHi, idx, val)
    }
    this._tree[node] = this._op.combine(this._tree[2 * node]!, this._tree[2 * node + 1]!)
  }

  private _getPoint(node: number, nodeLo: number, nodeHi: number, idx: number): T {
    if (nodeLo === nodeHi) return this._tree[node]!
    this._push(node, nodeHi - nodeLo + 1)
    const mid = (nodeLo + nodeHi) >> 1
    if (idx <= mid) {
      return this._getPoint(2 * node, nodeLo, mid, idx)
    }
    return this._getPoint(2 * node + 1, mid + 1, nodeHi, idx)
  }

  queryRange(left: number, right: number): T {
    if (this._n === 0) return this._op.identity
    const lo = Math.max(0, left)
    const hi = Math.min(this._n - 1, right)
    if (lo > hi) return this._op.identity
    return this._queryRange(1, 0, this._size - 1, lo, hi)
  }

  updateRange(left: number, right: number, value: U): void {
    if (this._n === 0) return
    const lo = Math.max(0, left)
    const hi = Math.min(this._n - 1, right)
    if (lo > hi) return
    this._updateRange(1, 0, this._size - 1, lo, hi, value)
  }

  updatePoint(index: number, value: T): void {
    if (index < 0 || index >= this._n) return
    this._updatePoint(1, 0, this._size - 1, index, value)
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._n) return undefined
    return this._getPoint(1, 0, this._size - 1, index)
  }

  get size(): number {
    return this._n
  }

  get isEmpty(): boolean {
    return this._n === 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._n; i++) {
      result.push(this._getPoint(1, 0, this._size - 1, i))
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._n; i++) {
      callback(this._getPoint(1, 0, this._size - 1, i), i)
    }
  }

  min(): T | undefined {
    if (this._n === 0) return undefined
    let result = this._getPoint(1, 0, this._size - 1, 0)!
    for (let i = 1; i < this._n; i++) {
      const val = this._getPoint(1, 0, this._size - 1, i)!
      if (val < result) result = val
    }
    return result
  }

  max(): T | undefined {
    if (this._n === 0) return undefined
    let result = this._getPoint(1, 0, this._size - 1, 0)!
    for (let i = 1; i < this._n; i++) {
      const val = this._getPoint(1, 0, this._size - 1, i)!
      if (val > result) result = val
    }
    return result
  }

  sum(): T {
    if (this._n === 0) return this._op.identity
    return this._tree[1]!
  }

  build(arr: T[]): void {
    this._n = arr.length
    this._size = 1
    while (this._size < this._n) {
      this._size <<= 1
    }
    this._tree = new Array<T>(2 * this._size)
    this._lazy = new Array<U>(2 * this._size)
    this._hasPending = new Array<boolean>(2 * this._size)

    for (let i = 0; i < 2 * this._size; i++) {
      this._tree[i] = this._op.identity
      this._lazy[i] = this._op.lazyIdentity
      this._hasPending[i] = false
    }

    for (let i = 0; i < this._n; i++) {
      this._tree[this._size + i] = arr[i]!
    }

    for (let i = this._size - 1; i >= 1; i--) {
      this._tree[i] = this._op.combine(this._tree[2 * i]!, this._tree[2 * i + 1]!)
    }
  }

  static sumTree(arr: number[]): LazySegmentTree<number, number> {
    return new LazySegmentTree(arr, {
      identity: 0,
      lazyIdentity: 0,
      combine: (a, b) => a + b,
      lazyApply: (value, lazy, len) => value + lazy * len,
      lazyCombine: (existing, incoming) => existing + incoming,
    })
  }

  static minTree(arr: number[]): LazySegmentTree<number, number> {
    return new LazySegmentTree(arr, {
      identity: Infinity,
      lazyIdentity: 0,
      combine: (a, b) => Math.min(a, b),
      lazyApply: (value, lazy, _len) => value + lazy,
      lazyCombine: (existing, incoming) => existing + incoming,
    })
  }

  static maxTree(arr: number[]): LazySegmentTree<number, number> {
    return new LazySegmentTree(arr, {
      identity: -Infinity,
      lazyIdentity: 0,
      combine: (a, b) => Math.max(a, b),
      lazyApply: (value, lazy, _len) => value + lazy,
      lazyCombine: (existing, incoming) => existing + incoming,
    })
  }

  static gcdTree(arr: number[]): LazySegmentTree<number, number> {
    function gcd(a: number, b: number): number {
      a = Math.abs(a)
      b = Math.abs(b)
      while (b !== 0) {
        const t = b
        b = a % b
        a = t
      }
      return a
    }
    return new LazySegmentTree(arr, {
      identity: 0,
      lazyIdentity: 0,
      combine: gcd,
      lazyApply: (value, lazy, _len) => value + lazy,
      lazyCombine: (existing, incoming) => existing + incoming,
    })
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


  toString(): string {
    return `LazySegmentTree({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'LazySegmentTree', size: this.size, items: this.toArray() }
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

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
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
    return 'LazySegmentTree'
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
}
