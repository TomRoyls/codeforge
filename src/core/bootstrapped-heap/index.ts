import type { BootstrappedHeapOptions, BootstrappedHeapNode } from './types.js'

interface Tree<T> {
  root: BootstrappedHeapNode<T>
  children: InnerHeap<T>
  rank: number
}

interface InnerHeap<T> {
  trees: Tree<T>[]
  size: number
}

export class BootstrappedHeap<T = number> {
  private trees: Tree<T>[] = []
  private _size = 0
  private compare: (a: T, b: T) => number
  private nextId = 0

  constructor(options?: BootstrappedHeapOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  insert(value: T): BootstrappedHeapNode<T> {
    const node = this.createNode(value)
    const singleton: Tree<T> = {
      root: node,
      children: { trees: [], size: 0 },
      rank: 0,
    }
    node.tree = singleton
    this.trees = this.linkTree(this.trees, singleton)
    this._size++
    return node
  }

  extractMin(): T {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    const minTree = this.findMinTree()
    const minValue = minTree.root.value
    const childTrees = minTree.children.trees
    this.trees = this.trees.filter((t) => t !== minTree)
    for (const child of childTrees) {
      child.root.tree = child
      this.trees = this.linkTree(this.trees, child)
    }
    this._size--
    return minValue
  }

  peek(): T {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    return this.findMinTree().root.value
  }

  merge(other: BootstrappedHeap<T>): void {
    if (other === this) return
    if (other._size === 0) return
    for (const tree of other.trees) {
      this.trees = this.linkTree(this.trees, tree)
    }
    this._size += other._size
    other.trees = []
    other._size = 0
  }

  decreaseKey(node: BootstrappedHeapNode<T>, newValue: T): void {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    if (this.compare(newValue, node.value) > 0) {
      throw new Error('New value is greater than current value')
    }
    node.value = newValue
  }

  delete(node: BootstrappedHeapNode<T>): void {
    if (this._size === 0) {
      throw new Error('Heap is empty')
    }
    const tree = node.tree
    if (!tree) return
    const found = this.removeTreeFromForest(this.trees, tree)
    if (!found) {
      this.removeFromParent(this.trees, tree)
    }
    for (const child of tree.children.trees) {
      child.root.tree = child
      this.trees = this.linkTree(this.trees, child)
    }
    this._size--
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.trees = []
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    this.collectValues(this.trees, result)
    return result
  }

  contains(value: T): boolean {
    return this.findValue(this.trees, value)
  }

  clone(): BootstrappedHeap<T> {
    const cloned = new BootstrappedHeap<T>({ comparator: this.compare })
    const items = this.toSortedArray()
    for (const item of items) {
      cloned.insert(item)
    }
    return cloned
  }

  static fromArray<U>(items: U[], options?: BootstrappedHeapOptions<U>): BootstrappedHeap<U> {
    const heap = new BootstrappedHeap<U>(options)
    for (let i = 0; i < items.length; i++) {
      heap.insert(items[i]!)
    }
    return heap
  }

  static merge<U>(a: BootstrappedHeap<U>, b: BootstrappedHeap<U>): BootstrappedHeap<U> {
    const result = a.clone()
    result.merge(b.clone())
    return result
  }

  forEach(callback: (item: T) => void): void {
    const items = this.toArray()
    for (let i = 0; i < items.length; i++) {
      callback(items[i]!)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const items = this.toArray()
    for (let i = 0; i < items.length; i++) {
      yield items[i]!
    }
  }

  toSortedArray(): T[] {
    const cloned = new BootstrappedHeap<T>({ comparator: this.compare })
    cloned.trees = this.deepCloneTrees(this.trees)
    cloned._size = this._size
    const result: T[] = []
    while (!cloned.isEmpty) {
      result.push(cloned.extractMin())
    }
    return result
  }

  private createNode(value: T): BootstrappedHeapNode<T> {
    return {
      value,
      id: this.nextId++,
      tree: null,
    }
  }

  private linkTree(existing: Tree<T>[], newTree: Tree<T>): Tree<T>[] {
    const result = [...existing]
    let current = newTree
    let idx = result.findIndex((t) => t.rank === current.rank)
    while (idx !== -1) {
      const matched = result[idx]!
      result.splice(idx, 1)
      current = this.linkPair(matched, current)
      idx = result.findIndex((t) => t.rank === current.rank)
    }
    result.push(current)
    return result
  }

  private linkPair(a: Tree<T>, b: Tree<T>): Tree<T> {
    if (this.compare(a.root.value, b.root.value) <= 0) {
      a.children.trees.push(b)
      a.children.size += b.children.size + 1
      a.rank = a.rank + 1
      return a
    }
    b.children.trees.push(a)
    b.children.size += a.children.size + 1
    b.rank = b.rank + 1
    return b
  }

  private findMinTree(): Tree<T> {
    let minTree = this.trees[0]!
    for (let i = 1; i < this.trees.length; i++) {
      if (this.compare(this.trees[i]!.root.value, minTree.root.value) < 0) {
        minTree = this.trees[i]!
      }
    }
    return minTree
  }

  private collectValues(trees: Tree<T>[], result: T[]): void {
    for (const tree of trees) {
      result.push(tree.root.value)
      this.collectValues(tree.children.trees, result)
    }
  }

  private findValue(trees: Tree<T>[], value: T): boolean {
    for (const tree of trees) {
      if (this.compare(tree.root.value, value) === 0) return true
      if (this.findValue(tree.children.trees, value)) return true
    }
    return false
  }

  private removeTreeFromForest(trees: Tree<T>[], target: Tree<T>): boolean {
    const idx = trees.indexOf(target)
    if (idx !== -1) {
      trees.splice(idx, 1)
      return true
    }
    for (const tree of trees) {
      if (this.removeTreeFromForest(tree.children.trees, target)) {
        this.recalculateRank(tree)
        return true
      }
    }
    return false
  }

  private removeFromParent(trees: Tree<T>[], target: Tree<T>): void {
    for (const tree of trees) {
      const idx = tree.children.trees.indexOf(target)
      if (idx !== -1) {
        tree.children.trees.splice(idx, 1)
        tree.children.size--
        this.recalculateRank(tree)
        return
      }
      this.removeFromParent(tree.children.trees, target)
    }
  }

  private recalculateRank(tree: Tree<T>): void {
    let maxChildRank = -1
    for (const child of tree.children.trees) {
      if (child.rank > maxChildRank) {
        maxChildRank = child.rank
      }
    }
    tree.rank = maxChildRank + 1
  }

  private deepCloneTrees(trees: Tree<T>[]): Tree<T>[] {
    return trees.map((tree) => {
      const node: BootstrappedHeapNode<T> = {
        value: tree.root.value,
        id: tree.root.id,
        tree: null,
      }
      const cloned: Tree<T> = {
        root: node,
        children: {
          trees: this.deepCloneTrees(tree.children.trees),
          size: tree.children.size,
        },
        rank: tree.rank,
      }
      node.tree = cloned
      return cloned
    })
  }

  toString(): string {
    return `${BootstrappedHeap}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'BootstrappedHeap', size: this.size, items: this.toArray() }
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

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    const seen = new Set<T>()
    const result: T[] = []
    for (const item of this.toArray()) {
      if (!seen.has(item)) {
        seen.add(item)
        result.push(item)
      }
    }
    return result
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

  groupBy<K>(keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
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

  tap(fn: (collection: BootstrappedHeap<T>) => void): BootstrappedHeap<T> {
    fn(this)
    return this
  }

  equals(other: BootstrappedHeap<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
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

  chunk(size: number): T[][] {
    const arr = this.toArray()
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  flatMap<U>(fn: (item: T) => U[]): U[] {
    const result: U[] = []
    for (const item of this.toArray()) {
      result.push(...fn(item))
    }
    return result
  }

  static empty<T>(): BootstrappedHeap<T> {
    return new BootstrappedHeap<T>()
  }

  isSorted(): boolean {
    const arr = this.toArray()
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1]! > arr[i]!) return false
    }
    return true
  }

  lastIndexOf(item: T): number {
    return this.toArray().lastIndexOf(item)
  }

  compact(): T[] {
    return this.toArray().filter((item): item is T => item != null)
  }

  without(...items: T[]): T[] {
    const exclude = new Set(items)
    return this.toArray().filter(item => !exclude.has(item))
  }

  intersects(other: Iterable<T>): boolean {
    const set = new Set(other)
    return this.toArray().some(item => set.has(item))
  }

  difference(other: Iterable<T>): T[] {
    const exclude = new Set(other)
    return this.toArray().filter(item => !exclude.has(item))
  }

  union(other: Iterable<T>): T[] {
    const set = new Set<T>([...this.toArray(), ...other])
    return [...set]
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

  reduceRight<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduceRight(fn, initial)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  countBy<K>(keyFn: (item: T) => K): Map<K, number> {
    const counts = new Map<K, number>()
    for (const item of this.toArray()) {
      const key = keyFn(item)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }


  toReversed(): T[] {
    return [...this.toArray()].reverse()
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

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
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

  sum(this: { toArray(): number[] }): number {
    return this.toArray().reduce((a, b) => a + b, 0)
  }

  average(this: { toArray(): number[] }): number {
    const arr = this.toArray()
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
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


  pipe<U>(transform: (items: T[]) => U[]): U[] {
    return transform(this.toArray())
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

  none(predicate: (item: T) => boolean): boolean {
    return !this.some(predicate)
  }

  any(predicate: (item: T) => boolean): boolean {
    return this.some(predicate)
  }

  all(predicate: (item: T) => boolean): boolean {
    return this.every(predicate)
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

  sampleN(n: number): T[] {
    return this.shuffle().slice(0, n)
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

  toSet(): Set<T> {
    return new Set(this.toArray())
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

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }












  get [Symbol.toStringTag](): string {
    return 'BootstrappedHeap'
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

export type { BootstrappedHeapOptions, BootstrappedHeapNode } from './types.js'
