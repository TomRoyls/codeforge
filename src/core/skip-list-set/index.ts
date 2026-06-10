import type { SkipListSetOptions } from './types.js'
import { DEFAULT_SKIP_LIST_SET_OPTIONS } from './types.js'

interface SkipListNode<T> {
  value: T
  forward: (SkipListNode<T> | null)[]
  span: number[]
}

export class SkipListSet<T = number> {
  private head: SkipListNode<T>
  private _size: number = 0
  private _level: number = 1
  private _maxLevel: number
  private _comparator: (a: T, b: T) => number

  constructor(options?: SkipListSetOptions<T>) {
    const opts = { ...DEFAULT_SKIP_LIST_SET_OPTIONS, ...options }
    this._maxLevel = opts.maxLevel
    this._comparator = opts.comparator
    this.head = this.createSentinel()
  }

  private createSentinel(): SkipListNode<T> {
    return {
      value: null as T,
      forward: new Array<SkipListNode<T> | null>(this._maxLevel).fill(null),
      span: new Array<number>(this._maxLevel).fill(0),
    }
  }

  private createNode(value: T, level: number): SkipListNode<T> {
    return {
      value,
      forward: new Array<SkipListNode<T> | null>(level).fill(null),
      span: new Array<number>(level).fill(0),
    }
  }

  private randomLevel(): number {
    let lvl = 1
    while (lvl < this._maxLevel && Math.random() < 0.5) {
      lvl++
    }
    return lvl
  }

  get maxLevel(): number {
    return this._maxLevel
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  add(value: T): boolean {
    const update: (SkipListNode<T> | null)[] = new Array(this._maxLevel).fill(null)
    const rank: number[] = new Array(this._maxLevel).fill(0)
    let current: SkipListNode<T> = this.head

    for (let i = this._level - 1; i >= 0; i--) {
      rank[i] = i === this._level - 1 ? 0 : (rank[i + 1] ?? 0)
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) >= 0) break
        rank[i] = (rank[i] ?? 0) + (current.span[i] ?? 0)
        current = f
      }
      update[i] = current
    }

    const next = current.forward[0] ?? null
    if (next !== null && this._comparator(next.value, value) === 0) {
      return false
    }

    const newLevel = this.randomLevel()
    if (newLevel > this._level) {
      for (let i = this._level; i < newLevel; i++) {
        rank[i] = 0
        update[i] = this.head
        this.head.span[i] = this._size
      }
      this._level = newLevel
    }

    const newNode = this.createNode(value, newLevel)

    for (let i = 0; i < newLevel; i++) {
      const u = update[i]!
      newNode.forward[i] = u.forward[i] ?? null
      u.forward[i] = newNode

      newNode.span[i] = (u.span[i] ?? 0) - ((rank[0] ?? 0) - (rank[i] ?? 0))
      u.span[i] = ((rank[0] ?? 0) - (rank[i] ?? 0)) + 1
    }

    for (let i = newLevel; i < this._level; i++) {
      const u = update[i]!
      if (u.span[i] !== undefined) {
        u.span[i] = (u.span[i] ?? 0) + 1
      }
    }

    this._size++
    return true
  }

  delete(value: T): boolean {
    const update: (SkipListNode<T> | null)[] = new Array(this._maxLevel).fill(null)
    let current: SkipListNode<T> = this.head

    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) >= 0) break
        current = f
      }
      update[i] = current
    }

    const target = (update[0]?.forward[0] ?? null) as SkipListNode<T> | null
    if (target === null || this._comparator(target.value, value) !== 0) {
      return false
    }

    for (let i = 0; i < this._level; i++) {
      const u = update[i]!
      if (u.forward[i] === target) {
        u.span[i] = (u.span[i] ?? 0) + (target.span[i] ?? 0) - 1
        u.forward[i] = target.forward[i] ?? null
      } else {
        if (u.span[i] !== undefined) {
          u.span[i] = (u.span[i] ?? 0) - 1
        }
      }
    }

    while (this._level > 1 && this.head.forward[this._level - 1] === null) {
      this._level--
    }

    this._size--
    return true
  }

  has(value: T): boolean {
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) > 0) break
        if (this._comparator(f.value, value) === 0) return true
        current = f
      }
    }
    return false
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined
    let current: SkipListNode<T> = this.head
    let remaining = index + 1
    for (let i = this._level - 1; i >= 0; i--) {
      while (current.forward[i] !== null && (current.span[i] ?? 0) <= remaining) {
        remaining -= current.span[i] ?? 0
        current = current.forward[i]!
      }
    }
    return current.value
  }

  indexOf(value: T): number {
    let current: SkipListNode<T> = this.head
    let rank = 0
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) >= 0) break
        rank += current.span[i] ?? 0
        current = f
      }
    }
    const next = current.forward[0] ?? null
    if (next !== null && this._comparator(next.value, value) === 0) {
      return rank
    }
    return -1
  }

  floor(value: T): T | undefined {
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) > 0) break
        current = f
      }
    }
    if (current === this.head) return undefined
    const c = this._comparator(current.value, value)
    if (c <= 0) return current.value
    return undefined
  }

  ceiling(value: T): T | undefined {
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) >= 0) break
        current = f
      }
    }
    const next = current.forward[0] ?? null
    if (next !== null && this._comparator(next.value, value) >= 0) {
      return next.value
    }
    return undefined
  }

  lower(value: T): T | undefined {
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) >= 0) break
        current = f
      }
    }
    if (current === this.head) return undefined
    if (this._comparator(current.value, value) < 0) return current.value
    return undefined
  }

  higher(value: T): T | undefined {
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, value) > 0) break
        current = f
      }
    }
    const next = current.forward[0] ?? null
    if (next !== null && this._comparator(next.value, value) > 0) {
      return next.value
    }
    return undefined
  }

  *range(lo: T, hi: T): Generator<T, void, unknown> {
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (true) {
        const f = current.forward[i] ?? null
        if (f === null || this._comparator(f.value, lo) >= 0) break
        current = f
      }
    }
    let node = current.forward[0] ?? null
    while (node !== null && this._comparator(node.value, lo) < 0) {
      node = node.forward[0] ?? null
    }
    while (node !== null && this._comparator(node.value, hi) <= 0) {
      yield node.value
      node = node.forward[0] ?? null
    }
  }

  min(): T | undefined {
    const first = this.head.forward[0]
    return first !== null && first !== undefined ? first.value : undefined
  }

  max(): T | undefined {
    if (this._size === 0) return undefined
    let current: SkipListNode<T> = this.head
    for (let i = this._level - 1; i >= 0; i--) {
      while (current.forward[i] !== null) {
        current = current.forward[i]!
      }
    }
    return current.value
  }

  toArray(): T[] {
    const result: T[] = []
    let node = this.head.forward[0]
    while (node !== null && node !== undefined) {
      result.push(node.value)
      node = node.forward[0]
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let node = this.head.forward[0]
    let idx = 0
    while (node !== null && node !== undefined) {
      callback(node.value, idx)
      node = node.forward[0]
      idx++
    }
  }

  clear(): void {
    this.head = this.createSentinel()
    this._size = 0
    this._level = 1
  }

  *[Symbol.iterator](): Generator<T, void, unknown> {
    let node = this.head.forward[0]
    while (node !== null && node !== undefined) {
      yield node.value
      node = node.forward[0]
    }
  }

  values(): Generator<T, void, unknown> {
    return this[Symbol.iterator]()
  }

  toString(): string {
    return `SkipListSet({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'SkipListSet', size: this.size, items: this.toArray() }
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
    return 'SkipListSet'
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
}
