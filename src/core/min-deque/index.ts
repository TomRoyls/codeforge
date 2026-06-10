import type { MinDequeOptions } from './types.js'

type MinMaxNode<T> = {
  value: T
  count: number
}

export class MinDeque<T = unknown> {
  private elements: T[]
  private minDeque: MinMaxNode<T>[]
  private maxDeque: MinMaxNode<T>[]
  private minDequeHead: number
  private maxDequeHead: number
  private head: number
  private tail: number
  private _size: number
  private _capacity: number
  private comparator: (a: T, b: T) => number

  constructor(options?: MinDequeOptions & { comparator?: (a: T, b: T) => number }) {
    this._capacity = Math.max(1, options?.capacity ?? 16)
    this.elements = new Array<T>(this._capacity)
    this.minDeque = []
    this.maxDeque = []
    this.minDequeHead = 0
    this.maxDequeHead = 0
    this.head = 0
    this.tail = 0
    this._size = 0
    this.comparator = options?.comparator ?? ((a, b) => (a as unknown as number) - (b as unknown as number) as unknown as number)
  }

  private grow(): void {
    const newCapacity = this._capacity * 2
    const newElements = new Array<T>(newCapacity)
    for (let i = 0; i < this._size; i++) {
      newElements[i] = this.elements[(this.head + i) % this._capacity]!
    }
    this.elements = newElements
    this.head = 0
    this.tail = this._size
    this._capacity = newCapacity
  }

  private compare(a: T, b: T): number {
    return this.comparator(a, b)
  }

  pushBack(value: T): void {
    if (this._size === this._capacity) this.grow()
    this.elements[this.tail] = value
    this.tail = (this.tail + 1) % this._capacity
    this._size++

    let insertedToMin = false
    for (let i = this.minDeque.length - 1; i >= this.minDequeHead; i--) {
      if (this.compare(this.minDeque[i]!.value, value) > 0) {
        this.minDeque.splice(i, 1)
      } else if (this.compare(this.minDeque[i]!.value, value) === 0) {
        this.minDeque[i]!.count++
        insertedToMin = true
        break
      } else {
        break
      }
    }
    if (!insertedToMin) {
      this.minDeque.push({ value, count: 1 })
    }

    let insertedToMax = false
    for (let i = this.maxDeque.length - 1; i >= this.maxDequeHead; i--) {
      if (this.compare(this.maxDeque[i]!.value, value) < 0) {
        this.maxDeque.splice(i, 1)
      } else if (this.compare(this.maxDeque[i]!.value, value) === 0) {
        this.maxDeque[i]!.count++
        insertedToMax = true
        break
      } else {
        break
      }
    }
    if (!insertedToMax) {
      this.maxDeque.push({ value, count: 1 })
    }
  }

  pushFront(value: T): void {
    if (this._size === this._capacity) this.grow()
    this.head = (this.head - 1 + this._capacity) % this._capacity
    this.elements[this.head] = value
    this._size++

    while (this.minDeque.length > 0 && this.compare(this.minDeque[this.minDeque.length - 1]!.value, value) > 0) {
      this.minDeque.pop()
    }
    if (this.minDeque.length > 0 && this.compare(this.minDeque[this.minDeque.length - 1]!.value, value) === 0) {
      this.minDeque[this.minDeque.length - 1]!.count++
    } else {
      this.minDeque.push({ value, count: 1 })
    }

    while (this.maxDeque.length > 0 && this.compare(this.maxDeque[this.maxDeque.length - 1]!.value, value) < 0) {
      this.maxDeque.pop()
    }
    if (this.maxDeque.length > 0 && this.compare(this.maxDeque[this.maxDeque.length - 1]!.value, value) === 0) {
      this.maxDeque[this.maxDeque.length - 1]!.count++
    } else {
      this.maxDeque.push({ value, count: 1 })
    }
  }

  popBack(): T | undefined {
    if (this._size === 0) return undefined
    this.tail = (this.tail - 1 + this._capacity) % this._capacity
    const value = this.elements[this.tail]!
    this.elements[this.tail] = undefined as unknown as T
    this._size--

    if (this.minDeque.length > this.minDequeHead && this.minDeque[this.minDequeHead]!.value === value) {
      this.minDeque[this.minDequeHead]!.count--
      if (this.minDeque[this.minDequeHead]!.count === 0) {
        this.minDequeHead++
      }
    } else if (this.minDeque.length > this.minDequeHead && this.minDeque[this.minDeque.length - 1]!.value === value) {
      this.minDeque[this.minDeque.length - 1]!.count--
      if (this.minDeque[this.minDeque.length - 1]!.count === 0) {
        this.minDeque.pop()
      }
    }

    if (this.maxDeque.length > this.maxDequeHead && this.maxDeque[this.maxDequeHead]!.value === value) {
      this.maxDeque[this.maxDequeHead]!.count--
      if (this.maxDeque[this.maxDequeHead]!.count === 0) {
        this.maxDequeHead++
      }
    } else if (this.maxDeque.length > this.maxDequeHead && this.maxDeque[this.maxDeque.length - 1]!.value === value) {
      this.maxDeque[this.maxDeque.length - 1]!.count--
      if (this.maxDeque[this.maxDeque.length - 1]!.count === 0) {
        this.maxDeque.pop()
      }
    }

    return value
  }

  popFront(): T | undefined {
    if (this._size === 0) return undefined
    const value = this.elements[this.head]!
    this.elements[this.head] = undefined as unknown as T
    this.head = (this.head + 1) % this._capacity
    this._size--

    const minFront = this.minDeque.length > this.minDequeHead ? this.minDeque[this.minDequeHead] : undefined
    if (minFront && minFront.value === value) {
      minFront.count--
      if (minFront.count === 0) {
        this.minDequeHead++
      }
    }

    const maxFront = this.maxDeque.length > this.maxDequeHead ? this.maxDeque[this.maxDequeHead] : undefined
    if (maxFront && maxFront.value === value) {
      maxFront.count--
      if (maxFront.count === 0) {
        this.maxDequeHead++
      }
    }

    return value
  }

  min(): T | undefined {
    if (this._size === 0 || this.minDeque.length === this.minDequeHead) return undefined
    return this.minDeque[this.minDequeHead]!.value
  }

  max(): T | undefined {
    if (this._size === 0 || this.maxDeque.length === this.maxDequeHead) return undefined
    return this.maxDeque[this.maxDequeHead]!.value
  }

  front(): T | undefined {
    if (this._size === 0) return undefined
    return this.elements[this.head]
  }

  back(): T | undefined {
    if (this._size === 0) return undefined
    return this.elements[(this.tail - 1 + this._capacity) % this._capacity]
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.elements = new Array<T>(this._capacity)
    this.minDeque = []
    this.maxDeque = []
    this.minDequeHead = 0
    this.maxDequeHead = 0
    this.head = 0
    this.tail = 0
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = new Array(this._size)
    for (let i = 0; i < this._size; i++) {
      result[i] = this.elements[(this.head + i) % this._capacity]!
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      callback(this.elements[(this.head + i) % this._capacity]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this._size; i++) {
      yield this.elements[(this.head + i) % this._capacity]!
    }
  }

  static slidingWindowMin<U>(arr: U[], windowSize: number): U[] {
    if (windowSize <= 0 || windowSize > arr.length) return []
    const result: U[] = []
    const dq = new MinDeque<U>({ capacity: windowSize })
    
    for (let i = 0; i < arr.length; i++) {
      dq.pushBack(arr[i]!)
      if (i >= windowSize - 1) {
        result.push(dq.min()!)
        dq.popFront()
      }
    }
    
    return result
  }

  static slidingWindowMax<U>(arr: U[], windowSize: number): U[] {
    if (windowSize <= 0 || windowSize > arr.length) return []
    const result: U[] = []
    const dq = new MinDeque<U>({ capacity: windowSize })
    
    for (let i = 0; i < arr.length; i++) {
      dq.pushBack(arr[i]!)
      if (i >= windowSize - 1) {
        result.push(dq.max()!)
        dq.popFront()
      }
    }
    
    return result
  }

  toString(): string {
    return `MinDeque({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'MinDeque', size: this.size, items: this.toArray() }
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
    return 'MinDeque'
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
}

export type { MinDequeOptions } from './types.js'
