export interface BinomialNode<T> {
  value: T
  degree: number
  parent: BinomialNode<T> | null
  child: BinomialNode<T> | null
  sibling: BinomialNode<T> | null
}

export interface BinomialHeapOptions<T = unknown> {
  comparator?: (a: T, b: T) => number
}

export const DEFAULT_BINOMIAL_HEAP_OPTIONS: BinomialHeapOptions = {}

export class BinomialHeap4<T = unknown> {
  private head: BinomialNode<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(options?: Partial<BinomialHeapOptions<T>>) {
    const opts = { ...DEFAULT_BINOMIAL_HEAP_OPTIONS, ...options }
    if (opts.comparator) {
      const cmp = opts.comparator
      this.compare = (a: T, b: T) => cmp(a, b)
    } else {
      this.compare = (a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      }
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  insert(value: T): BinomialNode<T> {
    const node: BinomialNode<T> = {
      value,
      degree: 0,
      parent: null,
      child: null,
      sibling: null,
    }
    this.head = this.unionRoots(this.head, node)
    this._size++
    return node
  }

  extractMin(): T | null {
    if (this.head === null) return null

    const { prev: minPrev, node: minNode } = this.findMinNodeWithPrev()

    if (minPrev !== null) {
      minPrev.sibling = minNode.sibling
    } else {
      this.head = minNode.sibling
    }

    const childList = this.reverseChildList(minNode.child)
    if (childList !== null) {
      this.head = this.unionRoots(this.head, childList)
    }
    this._size--

    return minNode.value
  }

  findMin(): T | null {
    if (this.head === null) return null
    const minNode = this.findMinNode()
    return minNode.value
  }

  find(value: T): BinomialNode<T> | null {
    return this.findNodeByValue(this.head, value)
  }

  delete(node: BinomialNode<T>): void {
    const parent = this.findParent(this.head, node)
    if (parent === null && this.head !== node) return

    let current = node
    while (current.parent !== null) {
      const temp = current.value
      current.value = current.parent.value
      current.parent.value = temp
      current = current.parent
    }

    if (current === this.head) {
      this.head = current.sibling
    } else {
      let prev = this.head
      while (prev !== null && prev.sibling !== current) {
        prev = prev.sibling
      }
      if (prev !== null) {
        prev.sibling = current.sibling
      }
    }

    const childList = this.reverseChildList(current.child)
    if (childList !== null) {
      this.head = this.unionRoots(this.head, childList)
    }
    this._size--
  }

  decreaseKey(node: BinomialNode<T>, newValue: T): void {
    if (this.compare(newValue, node.value) > 0) return
    node.value = newValue
    this.bubbleUp(node)
  }

  update(oldValue: T, newValue: T): boolean {
    const node = this.findNodeByValue(this.head, oldValue)
    if (node === null) return false
    this.decreaseKey(node, newValue)
    return true
  }

  bulkInsert(values: T[]): void {
    for (const value of values) {
      this.insert(value)
    }
  }

  merge(other: BinomialHeap4<T>): BinomialHeap4<T> {
    const merged = new BinomialHeap4<T>({ comparator: this.compare as (a: unknown, b: unknown) => number })
    merged.head = this.unionRoots(this.cloneTree(this.head), this.cloneTree(other.head))
    merged._size = this._size + other._size
    return merged
  }

  toArray(): T[] {
    const result: T[] = []
    this.collectValues(this.head, result)
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    const values = this.toArray()
    for (let i = 0; i < values.length; i++) {
      callback(values[i]!, i)
    }
  }

  clear(): void {
    this.head = null
    this._size = 0
  }

  getTimeComplexity(): string {
    return `insert: O(1), extractMin: O(log n), findMin: O(log n), decreaseKey: O(log n), delete: O(log n), merge: O(log n), toArray: O(n), forEach: O(n), find: O(n), update: O(n), bulkInsert: O(m)`
  }

  private findMinNode(): BinomialNode<T> {
    let min: BinomialNode<T> = this.head!
    let current: BinomialNode<T> | null = this.head!.sibling
    while (current !== null) {
      if (this.compare(current.value, min.value) < 0) {
        min = current
      }
      current = current.sibling
    }
    return min
  }

  private findMinNodeWithPrev(): { prev: BinomialNode<T> | null; node: BinomialNode<T> } {
    let minPrev: BinomialNode<T> | null = null
    let minNode: BinomialNode<T> = this.head!
    let prev: BinomialNode<T> | null = null
    let current: BinomialNode<T> | null = this.head!
    while (current !== null) {
      if (this.compare(current.value, minNode.value) < 0) {
        minNode = current
        minPrev = prev
      }
      prev = current
      current = current.sibling
    }
    return { prev: minPrev, node: minNode }
  }

  private unionRoots(h1: BinomialNode<T> | null, h2: BinomialNode<T> | null): BinomialNode<T> | null {
    if (h1 === null) return h2
    if (h2 === null) return h1

    let head: BinomialNode<T>
    let tail: BinomialNode<T>
    let a: BinomialNode<T> | null = h1
    let b: BinomialNode<T> | null = h2

    if (a.degree <= b.degree) {
      head = a
      a = a.sibling
    } else {
      head = b
      b = b.sibling
    }
    tail = head

    while (a !== null && b !== null) {
      if (a.degree <= b.degree) {
        tail.sibling = a
        a = a.sibling
      } else {
        tail.sibling = b
        b = b.sibling
      }
      tail = tail.sibling!
    }

    tail.sibling = a !== null ? a : b

    return this.consolidate(head)
  }

  private consolidate(head: BinomialNode<T>): BinomialNode<T> {
    if (head.sibling === null) return head

    let prev: BinomialNode<T> | null = null
    let current: BinomialNode<T> = head
    let next: BinomialNode<T> | null = current.sibling

    while (next !== null) {
      const mergeNext = next.sibling !== null && next.sibling.degree === current.degree
      if (current.degree !== next.degree) {
        prev = current
        current = next
        next = current.sibling
      } else if (mergeNext) {
        prev = current
        current = next
        next = current.sibling
      } else {
        if (this.compare(current.value, next.value) <= 0) {
          current.sibling = next.sibling
          this.linkTrees(current, next)
        } else {
          if (prev === null) {
            head = next
          } else {
            prev.sibling = next
          }
          this.linkTrees(next, current)
          current = next
        }
        next = current.sibling
      }
    }

    return head
  }

  private linkTrees(parent: BinomialNode<T>, child: BinomialNode<T>): void {
    child.parent = parent
    child.sibling = parent.child
    parent.child = child
    parent.degree++
  }

  private reverseChildList(node: BinomialNode<T> | null): BinomialNode<T> | null {
    if (node === null) return null
    let prev: BinomialNode<T> | null = null
    let current: BinomialNode<T> | null = node
    while (current !== null) {
      const next: BinomialNode<T> | null = current.sibling
      current.sibling = prev
      current.parent = null
      prev = current
      current = next
    }
    return prev
  }

  private bubbleUp(node: BinomialNode<T>): void {
    let current = node
    while (current.parent !== null) {
      if (this.compare(current.value, current.parent.value) < 0) {
        const temp = current.value
        current.value = current.parent.value
        current.parent.value = temp
        current = current.parent
      } else {
        break
      }
    }
  }

  private findNodeByValue(root: BinomialNode<T> | null, value: T): BinomialNode<T> | null {
    let current = root
    while (current !== null) {
      if (current.value === value) return current
      const childResult = this.findNodeByValue(current.child, value)
      if (childResult !== null) return childResult
      current = current.sibling
    }
    return null
  }

  private findParent(root: BinomialNode<T> | null, node: BinomialNode<T>): BinomialNode<T> | null {
    if (root === null || root === node) return null
    let current: BinomialNode<T> | null = root
    while (current !== null) {
      if (current.child === node) return current
      const childParent = this.findParent(current.child, node)
      if (childParent !== null) return childParent
      if (current.sibling === node) return current
      const siblingParent = this.findParent(current.sibling, node)
      if (siblingParent !== null) return siblingParent
      current = null
    }
    return null
  }

  private collectValues(root: BinomialNode<T> | null, result: T[]): void {
    let current = root
    while (current !== null) {
      result.push(current.value)
      this.collectValues(current.child, result)
      current = current.sibling
    }
  }

  private cloneTree(root: BinomialNode<T> | null): BinomialNode<T> | null {
    if (root === null) return null
    const node: BinomialNode<T> = {
      value: root.value,
      degree: root.degree,
      parent: null,
      child: this.cloneTree(root.child),
      sibling: this.cloneTree(root.sibling),
    }
    if (node.child !== null) {
      this.setParent(node.child, node)
    }
    return node
  }

  private setParent(child: BinomialNode<T>, parent: BinomialNode<T>): void {
    let current: BinomialNode<T> | null = child
    while (current !== null) {
      current.parent = parent
      current = current.sibling
    }
  }


  *[Symbol.iterator](): IterableIterator<T> {
    for (const val of this.toArray()) {
      yield val;
    }
  }

  toString(): string {
    return `${BinomialHeap4}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'BinomialHeap4', size: this.size, items: this.toArray() }
  }

  map<R>(fn: (item: T) => R): R[] {
    return this.toArray().map(fn)
  }

  filter(fn: (item: T) => boolean): T[] {
    return this.toArray().filter(fn)
  }

  reduce<R>(fn: (acc: R, item: T) => R, initial: R): R {
    return this.toArray().reduce(fn, initial)
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
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


  tap(fn: (collection: BinomialHeap4<T>) => void): BinomialHeap4<T> {
    fn(this)
    return this
  }

  equals(other: BinomialHeap4<T>): boolean {
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

  static empty<T>(): BinomialHeap4<T> {
    return new BinomialHeap4<T>()
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

  static from<T>(items: T[]): BinomialHeap4<T> {
    const instance = new BinomialHeap4<T>()
    for (const item of items) {
      instance.insert(item)
    }
    return instance
  }

  static of<T>(...items: T[]): BinomialHeap4<T> {
    return BinomialHeap4.from(items)
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

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }












  get [Symbol.toStringTag](): string {
    return 'BinomialHeap4'
  }

  indexOf(item: T, fromIndex: number = 0): number {
    return this.toArray().indexOf(item, fromIndex)
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
}
