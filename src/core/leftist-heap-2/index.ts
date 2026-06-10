import type {
  Comparator,
  ForEachCallback,
  LeftistHeapOptions,
  LeftistHeapNode,
  LeftistHeapHandle,
} from './types.js'

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

  private static _rank<T>(node: LeftistHeapNode<T> | null): number {
    return node === null ? 0 : node.rank
  }

  private _mergeNodes(
    a: LeftistHeapNode<T> | null,
    b: LeftistHeapNode<T> | null,
  ): LeftistHeapNode<T> | null {
    if (a === null) return b
    if (b === null) return a

    if (this._comparator(a.value, b.value) > 0) {
      const tmp = a
      a = b
      b = tmp
    }

    a.right = this._mergeNodes(a.right, b)

    if (LeftistHeap._rank(a.left) < LeftistHeap._rank(a.right)) {
      const tmp = a.left
      a.left = a.right
      a.right = tmp
    }

    a.rank = LeftistHeap._rank(a.right) + 1
    return a
  }

  insert(value: T): LeftistHeapHandle<T> {
    const handle: LeftistHeapHandle<T> = { value }
    const node: LeftistHeapNode<T> = {
      value,
      left: null,
      right: null,
      rank: 1,
      handle,
    }
    this._root = this._mergeNodes(this._root, node)
    this._size++
    return handle
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

  decreaseKey(handle: LeftistHeapHandle<T>, newValue: T): void {
    if (this._comparator(newValue, handle.value) > 0) {
      throw new Error('newValue must be less than or equal to oldValue')
    }
    const node = this._findNodeByHandle(this._root, handle)
    if (node === null) {
      throw new Error('handle not found in heap')
    }
    node.value = newValue
    handle.value = newValue
    this._root = this._rebuildPreservingHandles(this._root)
  }

  delete(handle: LeftistHeapHandle<T>): boolean {
    const node = this._findNodeByHandle(this._root, handle)
    if (node === null) return false
    const remaining: LeftistHeapNode<T>[] = []
    this._collectNodesExcept(this._root, node.handle, remaining)
    this._size = remaining.length
    this._root = this._mergeAllNodes(remaining)
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

  static fromArray<U>(elements: U[], comparator?: Comparator<U>): LeftistHeap<U> {
    return new LeftistHeap<U>({ elements, comparator })
  }

  static merge<U>(a: LeftistHeap<U>, b: LeftistHeap<U>): LeftistHeap<U> {
    return a.merge(b)
  }

  private _cloneNode(node: LeftistHeapNode<T> | null): LeftistHeapNode<T> | null {
    if (node === null) return null
    const clonedHandle: LeftistHeapHandle<T> = { value: node.value }
    return {
      value: node.value,
      left: this._cloneNode(node.left),
      right: this._cloneNode(node.right),
      rank: node.rank,
      handle: clonedHandle,
    }
  }

  private _findNodeByHandle(
    node: LeftistHeapNode<T> | null,
    handle: LeftistHeapHandle<T>,
  ): LeftistHeapNode<T> | null {
    if (node === null) return null
    if (node.handle === handle) return node
    const left = this._findNodeByHandle(node.left, handle)
    if (left !== null) return left
    return this._findNodeByHandle(node.right, handle)
  }

  private _collectNodesExcept(
    node: LeftistHeapNode<T> | null,
    exclude: LeftistHeapHandle<T>,
    out: LeftistHeapNode<T>[],
  ): void {
    if (node === null) return
    const left = node.left
    const right = node.right
    if (node.handle !== exclude) {
      node.left = null
      node.right = null
      node.rank = 1
      out.push(node)
    }
    this._collectNodesExcept(left, exclude, out)
    this._collectNodesExcept(right, exclude, out)
  }

  private _rebuildPreservingHandles(node: LeftistHeapNode<T> | null): LeftistHeapNode<T> | null {
    if (node === null) return null
    const nodes: LeftistHeapNode<T>[] = []
    this._collectAllNodes(node, nodes)
    return this._mergeAllNodes(nodes)
  }

  private _collectAllNodes(
    node: LeftistHeapNode<T> | null,
    out: LeftistHeapNode<T>[],
  ): void {
    if (node === null) return
    out.push(node)
    this._collectAllNodes(node.left, out)
    this._collectAllNodes(node.right, out)
  }

  private _mergeAllNodes(nodes: LeftistHeapNode<T>[]): LeftistHeapNode<T> | null {
    for (const n of nodes) {
      n.left = null
      n.right = null
      n.rank = 1
    }
    let root: LeftistHeapNode<T> | null = null
    for (const n of nodes) {
      root = this._mergeNodes(root, n)
    }
    return root
  }

  isValid(): boolean {
    if (this._root === null) return true
    return this._isValidNode(this._root)
  }

  private _isValidNode(node: LeftistHeapNode<T>): boolean {
    const leftRank = LeftistHeap._rank(node.left)
    const rightRank = LeftistHeap._rank(node.right)

    if (leftRank < rightRank) return false

    const expectedRank = Math.min(leftRank, rightRank) + 1
    if (node.rank !== expectedRank) return false

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
}
