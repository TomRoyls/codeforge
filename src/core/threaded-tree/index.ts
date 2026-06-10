import type { ThreadedTreeOptions } from './types.js'

export type { ThreadedTreeOptions } from './types.js'

class ThreadedNode<T> {
  value: T
  left: ThreadedNode<T> | null = null
  right: ThreadedNode<T> | null = null
  leftThread = true
  rightThread = true

  constructor(value: T) {
    this.value = value
  }
}

export class ThreadedTree<T> {
  private root: ThreadedNode<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(options?: ThreadedTreeOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  private leftmost(node: ThreadedNode<T>): ThreadedNode<T> {
    let cur = node
    while (!cur.leftThread && cur.left !== null) {
      cur = cur.left
    }
    return cur
  }

  private rightmost(node: ThreadedNode<T>): ThreadedNode<T> {
    let cur = node
    while (!cur.rightThread && cur.right !== null) {
      cur = cur.right
    }
    return cur
  }

  private inOrderSuccessor(node: ThreadedNode<T>): ThreadedNode<T> | null {
    if (node.rightThread) return node.right
    if (node.right !== null) return this.leftmost(node.right)
    return null
  }

  private inOrderPredecessor(node: ThreadedNode<T>): ThreadedNode<T> | null {
    if (node.leftThread) return node.left
    if (node.left !== null) return this.rightmost(node.left)
    return null
  }

  insert(value: T): void {
    if (this.root === null) {
      this.root = new ThreadedNode(value)
      this._size++
      return
    }

    let current = this.root
    while (true) {
      const cmp = this.compare(value, current.value)
      if (cmp === 0) return

      if (cmp < 0) {
        if (current.leftThread || current.left === null) {
          const node = new ThreadedNode(value)
          node.left = current.left
          node.leftThread = current.leftThread
          node.right = current
          node.rightThread = true
          current.left = node
          current.leftThread = false
          this._size++
          return
        }
        current = current.left
      } else {
        if (current.rightThread || current.right === null) {
          const node = new ThreadedNode(value)
          node.right = current.right
          node.rightThread = current.rightThread
          node.left = current
          node.leftThread = true
          current.right = node
          current.rightThread = false
          this._size++
          return
        }
        current = current.right
      }
    }
  }

  remove(value: T): boolean {
    let parent: ThreadedNode<T> | null = null
    let current: ThreadedNode<T> | null = this.root
    let isLeftChild = false

    while (current !== null) {
      const cmp = this.compare(value, current.value)
      if (cmp === 0) break
      parent = current
      if (cmp < 0) {
        if (current.leftThread) return false
        current = current.left
        isLeftChild = true
      } else {
        if (current.rightThread) return false
        current = current.right
        isLeftChild = false
      }
    }

    if (current === null) return false

    if (!current.leftThread && !current.rightThread && current.left !== null && current.right !== null) {
      const successor = this.leftmost(current.right)
      const successorValue = successor.value
      this.remove(successorValue)
      current.value = successorValue
      return true
    }

    if (!current.leftThread && current.left !== null) {
      const child = current.left
      const rm = this.rightmost(child)
      rm.right = current.right

      if (parent === null) {
        this.root = child
      } else if (isLeftChild) {
        parent.left = child
      } else {
        parent.right = child
      }
      this._size--
      return true
    }

    if (!current.rightThread && current.right !== null) {
      const child = current.right
      const lm = this.leftmost(child)
      lm.left = current.left

      if (parent === null) {
        this.root = child
      } else if (isLeftChild) {
        parent.left = child
      } else {
        parent.right = child
      }
      this._size--
      return true
    }

    if (parent === null) {
      this.root = null
    } else if (isLeftChild) {
      parent.left = current.left
      parent.leftThread = true
    } else {
      parent.right = current.right
      parent.rightThread = true
    }
    this._size--
    return true
  }

  contains(value: T): boolean {
    return this.findNode(value) !== null
  }

  private findNode(value: T): ThreadedNode<T> | null {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(value, current.value)
      if (cmp === 0) return current
      if (cmp < 0) {
        if (current.leftThread) return null
        current = current.left
      } else {
        if (current.rightThread) return null
        current = current.right
      }
    }
    return null
  }

  min(): T | undefined {
    if (this.root === null) return undefined
    return this.leftmost(this.root).value
  }

  max(): T | undefined {
    if (this.root === null) return undefined
    return this.rightmost(this.root).value
  }

  predecessor(value: T): T | undefined {
    const node = this.findNode(value)
    if (node === null) return undefined
    const pred = this.inOrderPredecessor(node)
    return pred?.value
  }

  successor(value: T): T | undefined {
    const node = this.findNode(value)
    if (node === null) return undefined
    const succ = this.inOrderSuccessor(node)
    return succ?.value
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  toArray(): T[] {
    return this.toArraySorted()
  }

  toArraySorted(): T[] {
    const result: T[] = []
    if (this.root === null) return result
    let current: ThreadedNode<T> | null = this.leftmost(this.root)
    while (current !== null) {
      result.push(current.value)
      current = this.inOrderSuccessor(current)
    }
    return result
  }

  forEach(callback: (value: T) => void): void {
    if (this.root === null) return
    let current: ThreadedNode<T> | null = this.leftmost(this.root)
    while (current !== null) {
      callback(current.value)
      current = this.inOrderSuccessor(current)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    if (this.root === null) return
    let current: ThreadedNode<T> | null = this.leftmost(this.root)
    while (current !== null) {
      yield current.value
      current = this.inOrderSuccessor(current)
    }
  }

  clone(): ThreadedTree<T> {
    const cloned = new ThreadedTree<T>({ comparator: this.compare })
    for (const v of this) {
      cloned.insert(v)
    }
    return cloned
  }

  static fromArray<U>(arr: U[], comparator?: (a: U, b: U) => number): ThreadedTree<U> {
    const tree = new ThreadedTree<U>(comparator ? { comparator } : undefined)
    for (const v of arr) {
      tree.insert(v)
    }
    return tree
  }

  first(): T | undefined {
    return this.min()
  }

  last(): T | undefined {
    return this.max()
  }

  lowerBound(value: T): T | undefined {
    let result: T | undefined
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(current.value, value)
      if (cmp >= 0) {
        result = current.value
        if (current.leftThread) break
        current = current.left
      } else {
        if (current.rightThread) break
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
        if (current.leftThread) break
        current = current.left
      } else {
        if (current.rightThread) break
        current = current.right
      }
    }
    return result
  }

  count(lo: T, hi: T): number {
    let c = 0
    if (this.root === null) return 0
    let current: ThreadedNode<T> | null = this.leftmost(this.root)
    while (current !== null) {
      const cmpLo = this.compare(current.value, lo)
      const cmpHi = this.compare(current.value, hi)
      if (cmpLo >= 0 && cmpHi <= 0) c++
      if (cmpHi > 0) break
      current = this.inOrderSuccessor(current)
    }
    return c
  }

  inOrderTraversal(callback: (value: T) => void): void {
    this.forEach(callback)
  }

  reverseTraversal(callback: (value: T) => void): void {
    if (this.root === null) return
    let current: ThreadedNode<T> | null = this.rightmost(this.root)
    while (current !== null) {
      callback(current.value)
      current = this.inOrderPredecessor(current)
    }
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'ThreadedTree', size: this.size, items: this.toArray() }
  }

  toString(): string {
    return `ThreadedTree({ size: ${this.size} })`
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

  get [Symbol.toStringTag](): string {
    return 'ThreadedTree'
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
}
