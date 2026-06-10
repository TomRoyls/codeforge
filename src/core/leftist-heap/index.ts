import type { Comparator, ForEachCallback, LeftistHeapOptions, LeftistHeapNode } from './types.js'

const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class LeftistHeap<T> {
  private _root: LeftistHeapNode<T> | null
  private _size: number
  private readonly _comparator: Comparator<T>

  constructor()
  constructor(elements: T[])
  constructor(options: LeftistHeapOptions<T>)
  constructor(elements: T[], options: LeftistHeapOptions<T>)
  constructor(arg1?: T[] | LeftistHeapOptions<T>, arg2?: LeftistHeapOptions<T>) {
    let elements: T[] | undefined
    let comparator: Comparator<T> | undefined

    if (Array.isArray(arg1)) {
      elements = arg1
      comparator = arg2?.comparator
    } else if (arg1 !== undefined) {
      elements = arg1.elements
      comparator = arg1.comparator
    }

    this._comparator = comparator ?? defaultComparator
    this._root = null
    this._size = 0

    if (elements) {
      for (const el of elements) {
        this.insert(el)
      }
    }
  }

  private static _npl<T>(node: LeftistHeapNode<T> | null): number {
    return node === null ? 0 : node.npl
  }

  private _mergeNodes(a: LeftistHeapNode<T> | null, b: LeftistHeapNode<T> | null): LeftistHeapNode<T> | null {
    if (a === null) return b
    if (b === null) return a

    if (this._comparator(a.value, b.value) > 0) {
      const tmp = a
      a = b
      b = tmp
    }

    a.right = this._mergeNodes(a.right, b)

    if (LeftistHeap._npl(a.left) < LeftistHeap._npl(a.right)) {
      const tmp = a.left
      a.left = a.right
      a.right = tmp
    }

    a.npl = LeftistHeap._npl(a.right) + 1
    return a
  }

  insert(value: T): void {
    const node: LeftistHeapNode<T> = { value, left: null, right: null, npl: 1 }
    this._root = this._mergeNodes(this._root, node)
    this._size++
  }

  extractMin(): T {
    if (this._root === null) {
      throw new Error('extractMin called on empty heap')
    }
    const min = this._root.value
    this._root = this._mergeNodes(this._root.left, this._root.right)
    this._size--
    return min
  }

  peek(): T {
    if (this._root === null) {
      throw new Error('peek called on empty heap')
    }
    return this._root.value
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._root = null
    this._size = 0
  }

  merge(other: LeftistHeap<T>): LeftistHeap<T> {
    const result = new LeftistHeap<T>({ comparator: this._comparator })
    result._root = this._cloneNode(this._root)
    result._size = this._size
    const otherClone = this._cloneNode(other._root)
    result._root = this._mergeNodes(result._root, otherClone)
    result._size = this._size + other._size
    return result
  }

  toArray(): T[] {
    const result: T[] = []
    const temp = new LeftistHeap<T>({ comparator: this._comparator })
    temp._root = this._cloneNode(this._root)
    temp._size = this._size
    while (!temp.isEmpty()) {
      result.push(temp.extractMin())
    }
    return result
  }

  toSortedArray(): T[] {
    return this.toArray()
  }

  contains(value: T): boolean {
    return this._containsIn(this._root, value)
  }

  private _containsIn(node: LeftistHeapNode<T> | null, value: T): boolean {
    if (node === null) return false
    const cmp = this._comparator(node.value, value)
    if (cmp === 0) return true
    if (cmp > 0) return false
    return this._containsIn(node.left, value) || this._containsIn(node.right, value)
  }

  decreaseKey(oldValue: T, newValue: T): void {
    if (this._comparator(newValue, oldValue) > 0) {
      throw new Error('newValue must be less than or equal to oldValue')
    }
    const node = this._findNode(this._root, oldValue)
    if (node === null) {
      throw new Error('value not found in heap')
    }
    node.value = newValue
    this._root = this._rebuild(this._root)
  }

  delete(value: T): boolean {
    if (!this.contains(value)) return false
    const elements = this.toArray()
    this.clear()
    let removed = false
    for (const el of elements) {
      if (!removed && this._comparator(el, value) === 0) {
        removed = true
        continue
      }
      this.insert(el)
    }
    return true
  }

  clone(): LeftistHeap<T> {
    const result = new LeftistHeap<T>({ comparator: this._comparator })
    result._root = this._cloneNode(this._root)
    result._size = this._size
    return result
  }

  forEach(callback: ForEachCallback<T>): void {
    let idx = 0
    this._inOrder(this._root, (val) => {
      callback(val, idx++)
    })
  }

  private _inOrder(node: LeftistHeapNode<T> | null, fn: (val: T) => void): void {
    if (node === null) return
    this._inOrder(node.left, fn)
    fn(node.value)
    this._inOrder(node.right, fn)
  }

  *[Symbol.iterator](): Iterator<T> {
    const temp = new LeftistHeap<T>({ comparator: this._comparator })
    temp._root = this._cloneNode(this._root)
    temp._size = this._size
    while (!temp.isEmpty()) {
      yield temp.extractMin()
    }
  }

   static fromArray<U>(elements: U[], options?: { comparator?: Comparator<U> }): LeftistHeap<U> {
     const comparator = typeof options === 'function' ? options : options?.comparator
     return new LeftistHeap<U>({ elements, comparator })
   }

  static merge<U>(a: LeftistHeap<U>, b: LeftistHeap<U>): LeftistHeap<U> {
    return a.merge(b)
  }

  private _cloneNode(node: LeftistHeapNode<T> | null): LeftistHeapNode<T> | null {
    if (node === null) return null
    return {
      value: node.value,
      left: this._cloneNode(node.left),
      right: this._cloneNode(node.right),
      npl: node.npl,
    }
  }

  private _findNode(node: LeftistHeapNode<T> | null, value: T): LeftistHeapNode<T> | null {
    if (node === null) return null
    if (this._comparator(node.value, value) === 0) return node
    if (this._comparator(node.value, value) > 0) return null
    const left = this._findNode(node.left, value)
    if (left !== null) return left
    return this._findNode(node.right, value)
  }

  private _rebuild(node: LeftistHeapNode<T> | null): LeftistHeapNode<T> | null {
    if (node === null) return null
    const elements: T[] = []
    this._collectAll(node, elements)
    return this._buildFrom(elements, 0, elements.length)
  }

  private _collectAll(node: LeftistHeapNode<T> | null, out: T[]): void {
    if (node === null) return
    out.push(node.value)
    this._collectAll(node.left, out)
    this._collectAll(node.right, out)
  }

  private _buildFrom(elements: T[], start: number, end: number): LeftistHeapNode<T> | null {
    if (start >= end) return null
    let root: LeftistHeapNode<T> | null = null
    for (let i = start; i < end; i++) {
      const node: LeftistHeapNode<T> = { value: elements[i]!, left: null, right: null, npl: 1 }
      root = this._mergeNodes(root, node)
    }
    return root
  }

  isValid(): boolean {
    if (this._root === null) return true
    return this._isValidNode(this._root)
  }

  private _isValidNode(node: LeftistHeapNode<T>): boolean {
    const leftNpl = LeftistHeap._npl(node.left)
    const rightNpl = LeftistHeap._npl(node.right)

    if (leftNpl < rightNpl) return false

    const expectedNpl = Math.min(leftNpl, rightNpl) + 1
    if (node.npl !== expectedNpl) return false

    if (node.left !== null) {
      if (this._comparator(node.value, node.left.value) > 0) return false
      if (!this._isValidNode(node.left)) return false
    }

    if (node.right !== null) {
      if (this._comparator(node.value, node.right.value) > 0) return false
      if (!this._isValidNode(node.right)) return false
    }

    return true
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `LeftistHeap({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'LeftistHeap', size: this.size, items: this.toArray() }
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

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  static empty<T>(): LeftistHeap<T> {
    return new LeftistHeap<T>()
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
    return 'LeftistHeap'
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
}
