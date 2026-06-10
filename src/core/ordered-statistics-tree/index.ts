import type { CompareFunction, OSTNode } from './types.js'

export class OrderedStatisticsTree<T> {
  private root: OSTNode<T> | null = null
  private compare: CompareFunction<T>

  constructor(comparator?: CompareFunction<T>) {
    this.compare = comparator ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private nodeSize(node: OSTNode<T> | null): number {
    return node === null ? 0 : node.size
  }

  private nodeHeight(node: OSTNode<T> | null): number {
    return node === null ? 0 : node.height
  }

  private updateNode(node: OSTNode<T>): void {
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
    node.height = 1 + Math.max(this.nodeHeight(node.left), this.nodeHeight(node.right))
  }

  private balanceFactor(node: OSTNode<T>): number {
    return this.nodeHeight(node.left) - this.nodeHeight(node.right)
  }

  private rotateRight(y: OSTNode<T>): OSTNode<T> {
    const x = y.left!
    y.left = x.right
    x.right = y
    this.updateNode(y)
    this.updateNode(x)
    return x
  }

  private rotateLeft(x: OSTNode<T>): OSTNode<T> {
    const y = x.right!
    x.right = y.left
    y.left = x
    this.updateNode(x)
    this.updateNode(y)
    return y
  }

  private balance(node: OSTNode<T>): OSTNode<T> {
    this.updateNode(node)
    const bf = this.balanceFactor(node)
    if (bf > 1) {
      if (this.balanceFactor(node.left!) < 0) {
        node.left = this.rotateLeft(node.left!)
      }
      return this.rotateRight(node)
    }
    if (bf < -1) {
      if (this.balanceFactor(node.right!) > 0) {
        node.right = this.rotateRight(node.right!)
      }
      return this.rotateLeft(node)
    }
    return node
  }

  private insertNode(node: OSTNode<T> | null, key: T): OSTNode<T> {
    if (node === null) {
      return { key, left: null, right: null, height: 1, size: 1 }
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key)
    } else {
      return node
    }
    return this.balance(node)
  }

  insert(key: T): void {
    this.root = this.insertNode(this.root, key)
  }

  private findMin(node: OSTNode<T>): OSTNode<T> {
    while (node.left !== null) {
      node = node.left
    }
    return node
  }

  private deleteNode(node: OSTNode<T> | null, key: T): OSTNode<T> | null {
    if (node === null) {
      return null
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
    } else {
      if (node.left === null) {
        return node.right
      }
      if (node.right === null) {
        return node.left
      }
      const successor = this.findMin(node.right)
      node.key = successor.key
      node.right = this.deleteNode(node.right, successor.key)
    }
    return this.balance(node)
  }

  delete(key: T): boolean {
    if (!this.has(key)) {
      return false
    }
    this.root = this.deleteNode(this.root, key)
    return true
  }

  private findNode(key: T): boolean {
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp === 0) {
        return true
      }
      node = cmp < 0 ? node.left : node.right
    }
    return false
  }

  has(key: T): boolean {
    return this.findNode(key)
  }

  rank(key: T): number {
    let r = 0
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        r += 1 + this.nodeSize(node.left)
        node = node.right
      } else {
        r += this.nodeSize(node.left)
        return r
      }
    }
    return -1
  }

  select(i: number): T | undefined {
    if (i < 0 || i >= this.size()) {
      return undefined
    }
    let node = this.root
    while (node !== null) {
      const leftSize = this.nodeSize(node.left)
      if (i < leftSize) {
        node = node.left
      } else if (i === leftSize) {
        return node.key
      } else {
        i -= leftSize + 1
        node = node.right
      }
    }
    return undefined
  }

  size(): number {
    return this.nodeSize(this.root)
  }

  isEmpty(): boolean {
    return this.root === null
  }

  clear(): void {
    this.root = null
  }

  min(): T | undefined {
    if (this.root === null) {
      return undefined
    }
    return this.findMin(this.root).key
  }

  max(): T | undefined {
    if (this.root === null) {
      return undefined
    }
    let node = this.root
    while (node.right !== null) {
      node = node.right
    }
    return node.key
  }

  floor(key: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp === 0) {
        return node.key
      }
      if (cmp > 0) {
        result = node.key
        node = node.right
      } else {
        node = node.left
      }
    }
    return result
  }

  ceiling(key: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp === 0) {
        return node.key
      }
      if (cmp < 0) {
        result = node.key
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  lower(key: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp > 0) {
        result = node.key
        node = node.right
      } else {
        node = node.left
      }
    }
    return result
  }

  higher(key: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(key, node.key)
      if (cmp < 0) {
        result = node.key
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  range(lo: T, hi: T): T[] {
    const result: T[] = []
    this.rangeCollect(this.root, lo, hi, result)
    return result
  }

  private rangeCollect(node: OSTNode<T> | null, lo: T, hi: T, result: T[]): void {
    if (node === null) {
      return
    }
    const cmpLo = this.compare(node.key, lo)
    const cmpHi = this.compare(node.key, hi)
    if (cmpLo > 0) {
      this.rangeCollect(node.left, lo, hi, result)
    }
    if (cmpLo >= 0 && cmpHi <= 0) {
      result.push(node.key)
    }
    if (cmpHi < 0) {
      this.rangeCollect(node.right, lo, hi, result)
    }
  }

  count(lo: T, hi: T): number {
    return this.range(lo, hi).length
  }

  toArray(): T[] {
    const result: T[] = []
    this.inorderCollect(this.root, result)
    return result
  }

  private inorderCollect(node: OSTNode<T> | null, result: T[]): void {
    if (node === null) {
      return
    }
    this.inorderCollect(node.left, result)
    result.push(node.key)
    this.inorderCollect(node.right, result)
  }

  forEach(callback: (key: T, index: number) => void): void {
    let idx = 0
    const visit = (node: OSTNode<T> | null): void => {
      if (node === null) return
      visit(node.left)
      callback(node.key, idx++)
      visit(node.right)
    }
    visit(this.root)
  }
  *[Symbol.iterator](): Iterator<T> {
    const stack: OSTNode<T>[] = []
    let node = this.root
    while (stack.length > 0 || node !== null) {
      while (node !== null) {
        stack.push(node)
        node = node.left
      }
      node = stack.pop()!
      yield node.key
      node = node.right
    }
  }

  iterator(): Iterator<T> {
    const stack: OSTNode<T>[] = []
    let node: OSTNode<T> | null = this.root
    return {
      next: (): IteratorResult<T> => {
        while (node !== null) {
          stack.push(node)
          node = node.left
        }
        if (stack.length === 0) {
          return { value: undefined as unknown as T, done: true }
        }
        node = stack.pop()!
        const result = node.key
        node = node.right
        return { value: result, done: false }
      },
    }
  }

  toString(): string {
    return `OrderedStatisticsTree()`
  }

  toJSON() {
    return { type: 'OrderedStatisticsTree', items: this.toArray() }
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
    return 'OrderedStatisticsTree'
  }
}
