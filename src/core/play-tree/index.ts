import type { PlayTreeNode, CompareFunction, PlayTreeOptions } from './types.js'

export class PlayTree<T> {
  private root: PlayTreeNode<T> | null = null
  private _size: number = 0
  private compare: CompareFunction<T>

  constructor(options?: PlayTreeOptions<T>) {
    this.compare =
      options?.comparator ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private splay(value: T): void {
    if (this.root === null) return

    const header: PlayTreeNode<T> = {
      value,
      left: null,
      right: null,
    }
    let leftMax = header
    let rightMin = header
    let node: PlayTreeNode<T> = this.root!

    while (true) {
      const cmp = this.compare(value, node!.value)
      if (cmp < 0) {
        if (node!.left === null) break
        if (this.compare(value, node!.left!.value) < 0) {
          const temp = node!.left!
          node!.left = temp.right
          temp.right = node
          node = temp
          if (node!.left === null) break
        }
        rightMin.left = node
        rightMin = node
        node = node!.left!
      } else if (cmp > 0) {
        if (node!.right === null) break
        if (this.compare(value, node!.right!.value) > 0) {
          const temp = node!.right!
          node!.right = temp.left
          temp.left = node
          node = temp
          if (node!.right === null) break
        }
        leftMax.right = node
        leftMax = node
        node = node!.right!
      } else {
        break
      }
    }

    leftMax.right = node!.left
    rightMin.left = node!.right
    node!.left = header.right
    node!.right = header.left
    this.root = node
  }

  insert(value: T): void {
    if (this.root === null) {
      this.root = { value, left: null, right: null }
      this._size++
      return
    }

    this.splay(value)

    const cmp = this.compare(value, this.root!.value)
    if (cmp === 0) return

    const newNode: PlayTreeNode<T> = { value, left: null, right: null }
    if (cmp < 0) {
      newNode.right = this.root
      newNode.left = this.root!.left
      this.root!.left = null
    } else {
      newNode.left = this.root
      newNode.right = this.root!.right
      this.root!.right = null
    }
    this.root = newNode
    this._size++
  }

  delete(value: T): boolean {
    if (this.root === null) return false

    this.splay(value)
    if (this.compare(value, this.root!.value) !== 0) return false

    if (this.root!.left === null) {
      this.root = this.root!.right
    } else {
      const rightSubtree = this.root!.right
      this.root = this.root!.left
      this.splay(value)
      this.root!.right = rightSubtree
    }

    this._size--
    return true
  }

  has(value: T): boolean {
    if (this.root === null) return false
    this.splay(value)
    return this.compare(value, this.root!.value) === 0
  }

  contains(value: T): boolean {
    return this.has(value)
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

  private inOrderTraversal(node: PlayTreeNode<T> | null, result: T[]): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push(node.value)
    this.inOrderTraversal(node.right, result)
  }

  toArray(): T[] {
    const result: T[] = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  toArraySorted(): T[] {
    return this.toArray()
  }

  clone(): PlayTree<T> {
    const result = new PlayTree<T>({ comparator: this.compare })
    const all = this.toArray()
    for (const value of all) {
      result.insert(value)
    }
    return result
  }

  static fromArray<T>(arr: T[], options?: PlayTreeOptions<T>): PlayTree<T> {
    const tree = new PlayTree<T>(options)
    for (const value of arr) {
      tree.insert(value)
    }
    return tree
  }

  min(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.left !== null) {
      node = node.left
    }
    return node.value
  }

  max(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) {
      node = node.right
    }
    return node.value
  }

  forEach(callback: (value: T, tree: PlayTree<T>) => void): void {
    const all = this.toArray()
    for (const value of all) {
      callback(value, this)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const stack: PlayTreeNode<T>[] = []
    let current = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield current.value
      current = current.right
    }
  }

  lowerBound(value: T): T | undefined {
    let result: PlayTreeNode<T> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp <= 0) {
        result = node
        node = node.left
      } else {
        node = node.right
      }
    }
    return result ? result.value : undefined
  }

  upperBound(value: T): T | undefined {
    let result: PlayTreeNode<T> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp < 0) {
        result = node
        node = node.left
      } else {
        node = node.right
      }
    }
    return result ? result.value : undefined
  }

  predecessor(value: T): T | undefined {
    let result: PlayTreeNode<T> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp > 0) {
        result = node
        node = node.right
      } else {
        node = node.left
      }
    }
    return result ? result.value : undefined
  }

  successor(value: T): T | undefined {
    let result: PlayTreeNode<T> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp < 0) {
        result = node
        node = node.left
      } else {
        node = node.right
      }
    }
    return result ? result.value : undefined
  }

  rank(value: T): number {
    const all = this.toArray()
    let count = 0
    for (const v of all) {
      if (this.compare(v, value) < 0) {
        count++
      } else {
        break
      }
    }
    return count
  }

  select(k: number): T | undefined {
    if (k < 0 || k >= this._size) return undefined
    const all = this.toArray()
    return all[k]
  }

  split(value: T): [PlayTree<T>, PlayTree<T>] {
    const left = new PlayTree<T>({ comparator: this.compare })
    const right = new PlayTree<T>({ comparator: this.compare })
    for (const v of this) {
      if (this.compare(v, value) <= 0) {
        left.insert(v)
      } else {
        right.insert(v)
      }
    }
    return [left, right]
  }

  merge(other: PlayTree<T>): void {
    for (const v of other) {
      this.insert(v)
    }
  }

  rangeQuery(lo: T, hi: T): T[] {
    const result: T[] = []
    for (const v of this) {
      const cmpLo = this.compare(v, lo)
      if (cmpLo >= 0) {
        const cmpHi = this.compare(v, hi)
        if (cmpHi <= 0) {
          result.push(v)
        } else {
          break
        }
      }
    }
    return result
  }

  first(): T | undefined {
    return this.min()
  }

  last(): T | undefined {
    return this.max()
  }

  count(): number {
    return this._size
  }

  private computeDepth(node: PlayTreeNode<T> | null): number {
    if (node === null) return 0
    const leftDepth = this.computeDepth(node.left)
    const rightDepth = this.computeDepth(node.right)
    return 1 + Math.max(leftDepth, rightDepth)
  }

  depth(): number {
    return this.computeDepth(this.root)
  }

  toString(): string {
    return `PlayTree({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'PlayTree', size: this.size, items: this.toArray() }
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
    return 'PlayTree'
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
}

export type { PlayTreeNode, CompareFunction, PlayTreeOptions } from './types.js'
