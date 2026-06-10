import type { TreapSetOptions } from './types.js'

export type { TreapSetOptions } from './types.js'

class TreapNode<T> {
  value: T
  priority: number
  left: TreapNode<T> | null = null
  right: TreapNode<T> | null = null
  size: number = 1

  constructor(value: T, priority: number) {
    this.value = value
    this.priority = priority
  }
}

function updateSize<T>(node: TreapNode<T>): void {
  node.size = 1 + (node.left?.size ?? 0) + (node.right?.size ?? 0)
}

export class TreapSet<T> {
  private root: TreapNode<T> | null = null
  private _size: number = 0
  private compare: (a: T, b: T) => number

  constructor(options?: TreapSetOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  private randomPriority(): number {
    return Math.floor(Math.random() * 2147483647)
  }

  private rotateRight(node: TreapNode<T>): TreapNode<T> {
    const left = node.left!
    node.left = left.right
    left.right = node
    updateSize(node)
    updateSize(left)
    return left
  }

  private rotateLeft(node: TreapNode<T>): TreapNode<T> {
    const right = node.right!
    node.right = right.left
    right.left = node
    updateSize(node)
    updateSize(right)
    return right
  }

  private insertNode(
    node: TreapNode<T> | null,
    value: T,
    priority: number,
  ): TreapNode<T> {
    if (node === null) {
      return new TreapNode(value, priority)
    }
    const cmp = this.compare(value, node.value)
    if (cmp === 0) {
      return node
    }
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value, priority)
      if (node.left!.priority > node.priority) {
        node = this.rotateRight(node)
      }
    } else {
      node.right = this.insertNode(node.right, value, priority)
      if (node.right!.priority > node.priority) {
        node = this.rotateLeft(node)
      }
    }
    updateSize(node)
    return node
  }

  add(value: T): void {
    const before = this._size
    this.root = this.insertNode(this.root, value, this.randomPriority())
    if (this.root) {
      this._size = this.root.size
    }
    if (this._size === before) {
      return
    }
  }

  private deleteNode(node: TreapNode<T> | null, value: T): TreapNode<T> | null {
    if (node === null) return null
    const cmp = this.compare(value, node.value)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, value)
      if (node) updateSize(node)
      return node
    }
    if (cmp > 0) {
      node.right = this.deleteNode(node.right, value)
      if (node) updateSize(node)
      return node
    }
    if (node.left === null) return node.right
    if (node.right === null) return node.left
    if (node.left.priority > node.right.priority) {
      node = this.rotateRight(node)
      node.right = this.deleteNode(node.right, value)
    } else {
      node = this.rotateLeft(node)
      node.left = this.deleteNode(node.left, value)
    }
    updateSize(node)
    return node
  }

  delete(value: T): boolean {
    if (!this.has(value)) return false
    this.root = this.deleteNode(this.root, value)
    this._size = this.root?.size ?? 0
    return true
  }

  has(value: T): boolean {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(value, current.value)
      if (cmp === 0) return true
      current = cmp < 0 ? current.left : current.right
    }
    return false
  }

  min(): T | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.left !== null) {
      current = current.left
    }
    return current.value
  }

  max(): T | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.right !== null) {
      current = current.right
    }
    return current.value
  }

  predecessor(value: T): T | undefined {
    let result: T | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.value, value)
      if (cmp < 0) {
        result = current.value
        current = current.right
      } else {
        current = current.left
      }
    }
    return result
  }

  successor(value: T): T | undefined {
    let result: T | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.value, value)
      if (cmp > 0) {
        result = current.value
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  lowerBound(value: T): T | undefined {
    let result: T | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.value, value)
      if (cmp >= 0) {
        result = current.value
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  upperBound(value: T): T | undefined {
    let result: T | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.value, value)
      if (cmp > 0) {
        result = current.value
        current = current.left
      } else {
        current = current.right
      }
    }
    return result
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    this.inOrder(this.root, result)
    return result
  }

  toArraySorted(): T[] {
    return this.toArray()
  }

  private inOrder(node: TreapNode<T> | null, result: T[]): void {
    if (node === null) return
    this.inOrder(node.left, result)
    result.push(node.value)
    this.inOrder(node.right, result)
  }

  forEach(callback: (value: T) => void): void {
    this.inOrderForEach(this.root, callback)
  }

  private inOrderForEach(node: TreapNode<T> | null, callback: (value: T) => void): void {
    if (node === null) return
    this.inOrderForEach(node.left, callback)
    callback(node.value)
    this.inOrderForEach(node.right, callback)
  }

  *[Symbol.iterator](): Iterator<T> {
    yield* this.inOrderGenerator(this.root)
  }

  private *inOrderGenerator(node: TreapNode<T> | null): Generator<T> {
    if (node === null) return
    yield* this.inOrderGenerator(node.left)
    yield node.value
    yield* this.inOrderGenerator(node.right)
  }

  clone(): TreapSet<T> {
    const cloned = new TreapSet<T>({ comparator: this.compare })
    cloned.root = this.cloneNode(this.root)
    cloned._size = this._size
    return cloned
  }

  private cloneNode(node: TreapNode<T> | null): TreapNode<T> | null {
    if (node === null) return null
    const copy = new TreapNode(node.value, node.priority)
    copy.size = node.size
    copy.left = this.cloneNode(node.left)
    copy.right = this.cloneNode(node.right)
    return copy
  }

  static fromArray<T>(items: T[], options?: TreapSetOptions<T>): TreapSet<T> {
    const set = new TreapSet<T>(options)
    for (const item of items) {
      set.add(item)
    }
    return set
  }

  rank(value: T): number {
    return this.rankNode(this.root, value)
  }

  private rankNode(node: TreapNode<T> | null, value: T): number {
    if (node === null) return 0
    const cmp = this.compare(value, node.value)
    if (cmp === 0) {
      return node.left?.size ?? 0
    }
    if (cmp < 0) {
      return this.rankNode(node.left, value)
    }
    return (node.left?.size ?? 0) + 1 + this.rankNode(node.right, value)
  }

  select(k: number): T | undefined {
    if (k < 0 || k >= this._size) return undefined
    return this.selectNode(this.root!, k)
  }

  private selectNode(node: TreapNode<T>, k: number): T {
    const leftSize = node.left?.size ?? 0
    if (k < leftSize) {
      return this.selectNode(node.left!, k)
    }
    if (k === leftSize) {
      return node.value
    }
    return this.selectNode(node.right!, k - leftSize - 1)
  }

  split(value: T): [TreapSet<T>, TreapSet<T>] {
    const leftSet = new TreapSet<T>({ comparator: this.compare })
    const rightSet = new TreapSet<T>({ comparator: this.compare })
    const cloned = this.cloneNode(this.root)
    const [leftRoot, rightRoot] = this.splitNode(cloned, value)
    leftSet.root = leftRoot
    rightSet.root = rightRoot
    leftSet._size = leftRoot?.size ?? 0
    rightSet._size = rightRoot?.size ?? 0
    return [leftSet, rightSet]
  }

  private splitNode(
    node: TreapNode<T> | null,
    value: T,
  ): [TreapNode<T> | null, TreapNode<T> | null] {
    if (node === null) return [null, null]
    const cmp = this.compare(value, node.value)
    if (cmp <= 0) {
      const [left, right] = this.splitNode(node.left, value)
      node.left = right
      if (node) updateSize(node)
      return [left, node]
    }
    const [left, right] = this.splitNode(node.right, value)
    node.right = left
    if (node) updateSize(node)
    return [node, right]
  }

  merge(other: TreapSet<T>): TreapSet<T> {
    const result = new TreapSet<T>({ comparator: this.compare })
    const aClone = this.cloneNode(this.root)
    const bClone = this.cloneNode(other.root)
    result.root = this.mergeNodes(aClone, bClone)
    result._size = result.root?.size ?? 0
    return result
  }

  private mergeNodes(
    a: TreapNode<T> | null,
    b: TreapNode<T> | null,
  ): TreapNode<T> | null {
    if (a === null) return b
    if (b === null) return a
    if (a.priority > b.priority) {
      a.right = this.mergeNodes(a.right, b)
      updateSize(a)
      return a
    }
    b.left = this.mergeNodes(a, b.left)
    updateSize(b)
    return b
  }

  count(lo: T, hi: T): number {
    return this._size - this.countLess(lo) - this.countGreater(hi)
  }

  private countLess(value: T): number {
    let count = 0
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.value, value)
      if (cmp < 0) {
        count += (current.left?.size ?? 0) + 1
        current = current.right
      } else {
        current = current.left
      }
    }
    return count
  }

  private countGreater(value: T): number {
    let count = 0
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.value, value)
      if (cmp > 0) {
        count += (current.right?.size ?? 0) + 1
        current = current.left
      } else {
        current = current.right
      }
    }
    return count
  }

  first(): T | undefined {
    return this.min()
  }

  last(): T | undefined {
    return this.max()
  }

  union(other: TreapSet<T>): TreapSet<T> {
    const result = new TreapSet<T>({ comparator: this.compare })
    this.forEach(item => result.add(item))
    other.forEach(item => result.add(item))
    return result
  }

  intersection(other: TreapSet<T>): TreapSet<T> {
    const result = new TreapSet<T>({ comparator: this.compare })
    this.forEach(item => {
      if (other.has(item)) {
        result.add(item)
      }
    })
    return result
  }

  difference(other: TreapSet<T>): TreapSet<T> {
    const result = new TreapSet<T>({ comparator: this.compare })
    this.forEach(item => {
      if (!other.has(item)) {
        result.add(item)
      }
    })
    return result
  }

  isSubsetOf(other: TreapSet<T>): boolean {
    let result = true
    this.forEach(item => {
      if (!other.has(item)) result = false
    })
    return result
  }

  isSupersetOf(other: TreapSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  toJSON() {
    return { type: 'TreapSet', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `TreapSet({ size: ${this.size} })`
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
}
