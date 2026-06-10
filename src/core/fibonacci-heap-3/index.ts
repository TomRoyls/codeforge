import type { FibonacciHeap3Node, FibonacciHeap3Options } from './types.js'

export class FibonacciHeap3<T = number> {
  private min: FibonacciHeap3Node<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(options?: FibonacciHeap3Options<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  insert(value: T): FibonacciHeap3Node<T> {
    const node = this.createNode(value)
    if (this.min === null) {
      this.min = node
    } else {
      this.insertIntoRootList(node)
      if (this.compare(node.value, this.min.value) < 0) {
        this.min = node
      }
    }
    this._size++
    return node
  }

  extractMin(): T {
    if (this.min === null) {
      throw new Error('Heap is empty')
    }
    const z = this.min
    if (z.child !== null) {
      let child = z.child
      const children: FibonacciHeap3Node<T>[] = []
      let start = child
      do {
        children.push(child)
        child = child.right
      } while (child !== start)
      for (const c of children) {
        this.insertIntoRootList(c)
        c.parent = null
      }
    }
    this.removeFromRootList(z)
    if (z === z.right) {
      this.min = null
    } else {
      this.min = z.right
      this.consolidate()
    }
    this._size--
    return z.value
  }

  peek(): T {
    if (this.min === null) {
      throw new Error('Heap is empty')
    }
    return this.min.value
  }

  merge(other: FibonacciHeap3<T>): void {
    if (other === this) return
    if (other.min === null) return
    if (this.min === null) {
      this.min = other.min
    } else {
      this.concatenateRootLists(this.min, other.min)
      if (this.compare(other.min.value, this.min.value) < 0) {
        this.min = other.min
      }
    }
    this._size += other._size
    other.min = null
    other._size = 0
  }

  decreaseKey(node: FibonacciHeap3Node<T>, newValue: T): FibonacciHeap3Node<T> {
    if (this.min === null) {
      throw new Error('Heap is empty')
    }
    if (this.compare(newValue, node.value) > 0) {
      throw new Error('New value is greater than current value')
    }
    node.value = newValue
    const parent = node.parent
    if (parent !== null && this.compare(node.value, parent.value) < 0) {
      this.cut(node, parent)
      this.cascadingCut(parent)
    }
    if (this.compare(node.value, this.min.value) <= 0) {
      this.min = node
    }
    return node
  }

  update(node: FibonacciHeap3Node<T>, newValue: T): FibonacciHeap3Node<T> {
    if (this.min === null) {
      throw new Error('Heap is empty')
    }
    const cmp = this.compare(newValue, node.value)
    if (cmp < 0) {
      return this.decreaseKey(node, newValue)
    }
    if (cmp > 0) {
      this.delete(node)
      return this.insert(newValue)
    }
    return node
  }

  delete(node: FibonacciHeap3Node<T>): void {
    const parent = node.parent
    this.cutNodeFromParent(node)
    if (parent !== null) {
      this.cascadingCut(parent)
    }
    this.min = node
    this.extractMin()
  }

  deleteNode(node: FibonacciHeap3Node<T>): void {
    this.delete(node)
  }

  bulkInsert(values: T[]): FibonacciHeap3Node<T>[] {
    const nodes: FibonacciHeap3Node<T>[] = []
    for (const value of values) {
      nodes.push(this.insert(value))
    }
    return nodes
  }

  getTimeComplexity(): { insert: string; extractMin: string; peek: string; merge: string; decreaseKey: string; deleteNode: string; bulkInsert: string } {
    return {
      insert: 'O(1) amortized',
      extractMin: 'O(log n) amortized',
      peek: 'O(1)',
      merge: 'O(1)',
      decreaseKey: 'O(1) amortized',
      deleteNode: 'O(log n) amortized',
      bulkInsert: 'O(k)',
    }
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.min = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    if (this.min === null) return result
    const visited = new Set<FibonacciHeap3Node<T>>()
    const stack: FibonacciHeap3Node<T>[] = [this.min]
    while (stack.length > 0) {
      const node = stack.pop()!
      if (visited.has(node)) continue
      visited.add(node)
      result.push(node.value)
      if (node.child !== null) {
        stack.push(node.child)
      }
      let right = node.right
      while (right !== node) {
        if (visited.has(right)) break
        visited.add(right)
        result.push(right.value)
        if (right.child !== null) {
          stack.push(right.child)
        }
        right = right.right
      }
    }
    return result
  }

  toSortedArray(): T[] {
    const cloned = this.clone()
    const result: T[] = []
    while (!cloned.isEmpty) {
      result.push(cloned.extractMin())
    }
    return result
  }

  contains(value: T): boolean {
    if (this.min === null) return false
    return this.findNode(this.min, value, new Set()) !== null
  }

  clone(): FibonacciHeap3<T> {
    const cloned = new FibonacciHeap3<T>({ comparator: this.compare })
    if (this.min === null) return cloned
    const items = this.toArray()
    for (const item of items) {
      cloned.insert(item)
    }
    return cloned
  }

  static fromArray<U>(items: U[], options?: FibonacciHeap3Options<U>): FibonacciHeap3<U> {
    const heap = new FibonacciHeap3<U>(options)
    for (let i = 0; i < items.length; i++) {
      heap.insert(items[i]!)
    }
    return heap
  }

  static merge<U>(a: FibonacciHeap3<U>, b: FibonacciHeap3<U>): FibonacciHeap3<U> {
    const result = a.clone()
    result.merge(b.clone())
    return result
  }

  forEach(callback: (item: T) => void): void {
    if (this.min === null) return
    const visited = new Set<FibonacciHeap3Node<T>>()
    let current: FibonacciHeap3Node<T> = this.min
    do {
      if (visited.has(current)) break
      visited.add(current)
      this.forEachInTree(current, callback, visited)
      current = current.right
    } while (current !== this.min)
  }

  *[Symbol.iterator](): Iterator<T> {
    const items = this.toArray()
    for (let i = 0; i < items.length; i++) {
      yield items[i]!
    }
  }

  private createNode(value: T): FibonacciHeap3Node<T> {
    const node: FibonacciHeap3Node<T> = {
      value,
      degree: 0,
      parent: null,
      child: null,
      left: null!,
      right: null!,
      mark: false,
    }
    node.left = node
    node.right = node
    return node
  }

  private insertIntoRootList(node: FibonacciHeap3Node<T>): void {
    if (this.min === null) {
      this.min = node
      return
    }
    node.left = this.min
    node.right = this.min.right
    this.min.right.left = node
    this.min.right = node
  }

  private removeFromRootList(node: FibonacciHeap3Node<T>): void {
    node.left.right = node.right
    node.right.left = node.left
  }

  private concatenateRootLists(a: FibonacciHeap3Node<T>, b: FibonacciHeap3Node<T>): void {
    const aRight = a.right
    const bLeft = b.left
    a.right = b
    b.left = a
    aRight.left = bLeft
    bLeft.right = aRight
  }

  private consolidate(): void {
    if (this.min === null) return
    const maxDegree = Math.floor(Math.log2(this._size)) + 2
    const A: (FibonacciHeap3Node<T> | null)[] = new Array(maxDegree + 1).fill(null)

    const rootList = this.getRootList()
    for (const w of rootList) {
      let x = w
      let d = x.degree
      while (d < A.length && A[d] !== null) {
        let y = A[d]!
        if (this.compare(x.value, y.value) > 0) {
          const temp = x
          x = y
          y = temp
        }
        this.heapLink(y, x)
        A[d] = null
        d++
      }
      if (d >= A.length) {
        const newSize = d + 2
        while (A.length < newSize) A.push(null)
      }
      A[d] = x
    }
    this.min = null
    for (let i = 0; i < A.length; i++) {
      if (A[i] !== null) {
        const node = A[i]!
        if (this.min === null) {
          node.left = node
          node.right = node
          this.min = node
        } else {
          this.insertIntoRootList(node)
          if (this.compare(node.value, this.min.value) < 0) {
            this.min = node
          }
        }
      }
    }
  }

  private heapLink(y: FibonacciHeap3Node<T>, x: FibonacciHeap3Node<T>): void {
    this.removeFromRootList(y)
    y.left = y
    y.right = y
    if (x.child === null) {
      x.child = y
    } else {
      const child = x.child
      y.left = child
      y.right = child.right
      child.right.left = y
      child.right = y
    }
    y.parent = x
    x.degree++
    y.mark = false
  }

  private cut(x: FibonacciHeap3Node<T>, y: FibonacciHeap3Node<T>): void {
    if (x.right === x) {
      y.child = null
    } else {
      if (y.child === x) {
        y.child = x.right
      }
      x.left.right = x.right
      x.right.left = x.left
    }
    y.degree--
    x.left = x
    x.right = x
    this.insertIntoRootList(x)
    x.parent = null
    x.mark = false
  }

  private cascadingCut(y: FibonacciHeap3Node<T>): void {
    let current = y
    while (current.parent !== null) {
      if (!current.mark) {
        current.mark = true
        break
      }
      const parent = current.parent
      this.cut(current, parent)
      current = parent
    }
  }

  private getRootList(): FibonacciHeap3Node<T>[] {
    const result: FibonacciHeap3Node<T>[] = []
    if (this.min === null) return result
    let current = this.min
    do {
      result.push(current)
      current = current.right
    } while (current !== this.min)
    return result
  }

  private findNode(
    start: FibonacciHeap3Node<T>,
    value: T,
    visited: Set<FibonacciHeap3Node<T>>
  ): FibonacciHeap3Node<T> | null {
    let current = start
    do {
      if (visited.has(current)) break
      visited.add(current)
      if (this.compare(current.value, value) === 0) return current
      if (current.child !== null) {
        const found = this.findNode(current.child, value, visited)
        if (found !== null) return found
      }
      current = current.right
    } while (current !== start)
    return null
  }

  private forEachInTree(
    node: FibonacciHeap3Node<T>,
    callback: (item: T) => void,
    visited: Set<FibonacciHeap3Node<T>>
  ): void {
    callback(node.value)
    if (node.child !== null && !visited.has(node.child)) {
      let child = node.child
      do {
        if (visited.has(child)) break
        visited.add(child)
        this.forEachInTree(child, callback, visited)
        child = child.right
      } while (child !== node.child)
    }
  }

  private cutNodeFromParent(node: FibonacciHeap3Node<T>): void {
    const parent = node.parent
    if (parent === null) return
    if (node.right === node) {
      parent.child = null
    } else {
      if (parent.child === node) {
        parent.child = node.right
      }
      node.left.right = node.right
      node.right.left = node.left
    }
    parent.degree--
    node.left = node
    node.right = node
    this.insertIntoRootList(node)
    node.parent = null
    node.mark = false
  }

  toString(): string {
    return `${FibonacciHeap3}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'FibonacciHeap3', size: this.size, items: this.toArray() }
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

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }


  static empty<T>(): FibonacciHeap3<T> {
    return new FibonacciHeap3<T>()
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
    return 'FibonacciHeap3'
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
}

export type { FibonacciHeap3Options, FibonacciHeap3Node } from './types.js'
