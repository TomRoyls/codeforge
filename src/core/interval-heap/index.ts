import type { Comparator, IntervalHeapOptions, IntervalNode } from './types.js'

const defaultComparator: Comparator<unknown> = (a, b): number => {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

export class IntervalHeap<T> {
  private _nodes: IntervalNode<T>[] = []
  private readonly _comparator: Comparator<T>

  constructor(options?: IntervalHeapOptions<T>) {
    this._comparator = (options?.comparator ?? defaultComparator) as Comparator<T>
    if (options?.initialValues) {
      for (const val of options.initialValues) {
        this.insert(val)
      }
    }
  }

  private _fixNode(i: number): void {
    const node = this._nodes[i]!
    if (node.max !== null && this._comparator(node.max, node.min) < 0) {
      const tmp = node.min
      node.min = node.max
      node.max = tmp
    }
  }

  private _effMax(i: number): T {
    const node = this._nodes[i]!
    return node.max !== null ? node.max : node.min
  }

  private _elementCount(): number {
    let count = 0
    for (const node of this._nodes) {
      count++
      if (node.max !== null) count++
    }
    return count
  }

  private _bubbleUp(idx: number): void {
    while (idx > 0) {
      const pi = (idx - 1) >> 1
      const node = this._nodes[idx]!
      const parent = this._nodes[pi]!
      let swapped = false

      if (this._comparator(node.min, parent.min) < 0) {
        const tmp = node.min
        node.min = parent.min
        parent.min = tmp
        this._fixNode(idx)
        this._fixNode(pi)
        swapped = true
      }

      const nMax = this._effMax(idx)
      const pMax = this._effMax(pi)

      if (this._comparator(nMax, pMax) > 0) {
        if (node.max !== null && parent.max !== null) {
          const tmp = node.max
          node.max = parent.max
          parent.max = tmp
        } else if (node.max === null && parent.max !== null) {
          const tmp = node.min
          node.min = parent.max
          parent.max = tmp
        } else if (node.max !== null && parent.max === null) {
          const tmp = node.max
          node.max = parent.min
          parent.min = tmp
        }
        this._fixNode(idx)
        this._fixNode(pi)
        swapped = true
      }

      if (!swapped) break
      idx = pi
    }
  }

  private _popLastElement(): T {
    const last = this._nodes[this._nodes.length - 1]!
    if (last.max !== null) {
      const val = last.max
      last.max = null
      return val
    }
    this._nodes.pop()
    return last.min
  }

  private _trickleDownMin(idx: number): void {
    const len = this._nodes.length
    while (idx < len) {
      let smallest = idx
      const left = 2 * idx + 1
      const right = 2 * idx + 2
      if (left < len && this._comparator(this._nodes[left]!.min, this._nodes[smallest]!.min) < 0) {
        smallest = left
      }
      if (right < len && this._comparator(this._nodes[right]!.min, this._nodes[smallest]!.min) < 0) {
        smallest = right
      }
      if (smallest === idx) break
      const node = this._nodes[idx]!
      const child = this._nodes[smallest]!
      const tmp = node.min
      node.min = child.min
      child.min = tmp
      this._fixNode(idx)
      this._fixNode(smallest)
      idx = smallest
    }
  }

  private _trickleDownMax(idx: number): void {
    const len = this._nodes.length
    while (idx < len) {
      let largest = idx
      const left = 2 * idx + 1
      const right = 2 * idx + 2
      if (left < len && this._comparator(this._effMax(left), this._effMax(largest)) > 0) {
        largest = left
      }
      if (right < len && this._comparator(this._effMax(right), this._effMax(largest)) > 0) {
        largest = right
      }
      if (largest === idx) break

      const node = this._nodes[idx]!
      const child = this._nodes[largest]!

      if (node.max !== null && child.max !== null) {
        const tmp = node.max
        node.max = child.max
        child.max = tmp
      } else if (node.max !== null && child.max === null) {
        const tmp = node.max
        node.max = child.min
        child.min = tmp
      } else if (node.max === null && child.max !== null) {
        const tmp = node.min
        node.min = child.max
        child.max = tmp
      }

      this._fixNode(idx)
      this._fixNode(largest)
      idx = largest
    }
  }

  private _trickleDown(idx: number): void {
    this._trickleDownMin(idx)
    this._trickleDownMax(idx)
  }

  insert(value: T): void {
    const len = this._nodes.length
    if (len > 0) {
      const last = this._nodes[len - 1]!
      if (last.max === null) {
        if (this._comparator(value, last.min) < 0) {
          last.max = last.min
          last.min = value
        } else {
          last.max = value
        }
        this._bubbleUp(len - 1)
        return
      }
    }
    this._nodes.push({ min: value, max: null })
    this._bubbleUp(this._nodes.length - 1)
  }

  getMin(): T {
    if (this._nodes.length === 0) {
      throw new Error('getMin called on empty heap')
    }
    return this._nodes[0]!.min
  }

  getMax(): T {
    if (this._nodes.length === 0) {
      throw new Error('getMax called on empty heap')
    }
    return this._effMax(0)
  }

  deleteMin(): T {
    if (this._nodes.length === 0) {
      throw new Error('deleteMin called on empty heap')
    }
    const result = this._nodes[0]!.min
    if (this._elementCount() === 1) {
      this._nodes = []
      return result
    }
    const replacement = this._popLastElement()
    this._nodes[0]!.min = replacement
    this._fixNode(0)
    this._trickleDown(0)
    return result
  }

  deleteMax(): T {
    if (this._nodes.length === 0) {
      throw new Error('deleteMax called on empty heap')
    }
    const first = this._nodes[0]!
    if (first.max === null) {
      return this.deleteMin()
    }
    const result = first.max
    if (this._elementCount() === 2) {
      first.max = null
      return result
    }
    const replacement = this._popLastElement()
    first.max = replacement
    this._fixNode(0)
    this._trickleDown(0)
    return result
  }

  replaceMin(value: T): T {
    if (this._nodes.length === 0) {
      throw new Error('replaceMin called on empty heap')
    }
    const old = this._nodes[0]!.min
    this._nodes[0]!.min = value
    this._fixNode(0)
    this._trickleDown(0)
    return old
  }

  replaceMax(value: T): T {
    if (this._nodes.length === 0) {
      throw new Error('replaceMax called on empty heap')
    }
    const first = this._nodes[0]!
    if (first.max === null) {
      const old = first.min
      first.min = value
      this._fixNode(0)
      this._trickleDown(0)
      return old
    }
    const old = first.max
    first.max = value
    this._fixNode(0)
    this._trickleDown(0)
    return old
  }

  get size(): number {
    return this._elementCount()
  }

  get isEmpty(): boolean {
    return this._nodes.length === 0
  }

  clear(): void {
    this._nodes = []
  }

  toArray(): T[] {
    const result: T[] = []
    for (const node of this._nodes) {
      result.push(node.min)
      if (node.max !== null) result.push(node.max)
    }
    result.sort(this._comparator)
    return result
  }

  contains(value: T): boolean {
    for (const node of this._nodes) {
      if (this._comparator(node.min, value) === 0) return true
      if (node.max !== null && this._comparator(node.max, value) === 0) return true
    }
    return false
  }

  merge(other: IntervalHeap<T>): void {
    if (other === this) return
    const source = other.toArray()
    for (const item of source) {
      this.insert(item)
    }
    other.clear()
  }

  *[Symbol.iterator](): Iterator<T> {
    const sorted = this.toArray()
    for (const item of sorted) {
      yield item
    }
  }

  toString(): string {
    return `${IntervalHeap}({ size: ${this.size} })`
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'IntervalHeap', size: this.size, items: this.toArray() }
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

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }



  static from<T>(items: T[]): IntervalHeap<T> {
    const instance = new IntervalHeap<T>()
    for (const item of items) {
      instance.insert(item)
    }
    return instance
  }

  static of<T>(...items: T[]): IntervalHeap<T> {
    return IntervalHeap.from(items)
  }

  static empty<T>(): IntervalHeap<T> {
    return new IntervalHeap<T>()
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
    return 'IntervalHeap'
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
}

export type { Comparator, IntervalHeapOptions, IntervalNode } from './types.js'
