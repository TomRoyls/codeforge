import type { AVLNode, Comparator, CountedTreeOptions } from './types.js'

export class CountedTree<T> {
  private root: AVLNode<T> | null = null
  private _size: number = 0
  private cmp: Comparator<T>

  constructor(items?: Iterable<T>, options?: CountedTreeOptions<T>) {
    this.cmp =
      options?.comparator ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0))
    if (items) {
      for (const item of items) {
        this.insert(item)
      }
    }
  }

  private nodeHeight(node: AVLNode<T> | null): number {
    return node ? node.height : 0
  }

  private nodeSize(node: AVLNode<T> | null): number {
    return node ? node.size : 0
  }

  private updateNode(node: AVLNode<T>): void {
    node.height =
      1 +
      Math.max(this.nodeHeight(node.left), this.nodeHeight(node.right))
    node.size =
      1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private balanceFactor(node: AVLNode<T>): number {
    return this.nodeHeight(node.left) - this.nodeHeight(node.right)
  }

  private rotateRight(y: AVLNode<T>): AVLNode<T> {
    const x = y.left!
    y.left = x.right
    x.right = y
    this.updateNode(y)
    this.updateNode(x)
    return x
  }

  private rotateLeft(x: AVLNode<T>): AVLNode<T> {
    const y = x.right!
    x.right = y.left
    y.left = x
    this.updateNode(x)
    this.updateNode(y)
    return y
  }

  private balance(node: AVLNode<T>): AVLNode<T> {
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

  private insertNode(node: AVLNode<T> | null, value: T): AVLNode<T> {
    if (node === null) {
      return { value, left: null, right: null, height: 1, size: 1 }
    }
    const c = this.cmp(value, node.value)
    if (c < 0) {
      node.left = this.insertNode(node.left, value)
    } else if (c > 0) {
      node.right = this.insertNode(node.right, value)
    } else {
      return node
    }
    return this.balance(node)
  }

  insert(value: T): void {
    this.root = this.insertNode(this.root, value)
    this._size = this.nodeSize(this.root)
  }

  private findMin(node: AVLNode<T>): AVLNode<T> {
    while (node.left !== null) {
      node = node.left
    }
    return node
  }

  private findMax(node: AVLNode<T>): AVLNode<T> {
    while (node.right !== null) {
      node = node.right
    }
    return node
  }

  private removeNode(node: AVLNode<T> | null, value: T): AVLNode<T> | null {
    if (node === null) {
      return null
    }
    const c = this.cmp(value, node.value)
    if (c < 0) {
      node.left = this.removeNode(node.left, value)
    } else if (c > 0) {
      node.right = this.removeNode(node.right, value)
    } else {
      if (node.left === null) {
        return node.right
      }
      if (node.right === null) {
        return node.left
      }
      const successor = this.findMin(node.right)
      node.value = successor.value
      node.right = this.removeNode(node.right, successor.value)
    }
    return this.balance(node)
  }

  remove(value: T): boolean {
    if (!this.containsNode(this.root, value)) {
      return false
    }
    this.root = this.removeNode(this.root, value)
    this._size = this.nodeSize(this.root)
    return true
  }

  private containsNode(node: AVLNode<T> | null, value: T): boolean {
    if (node === null) {
      return false
    }
    const c = this.cmp(value, node.value)
    if (c < 0) {
      return this.containsNode(node.left, value)
    }
    if (c > 0) {
      return this.containsNode(node.right, value)
    }
    return true
  }

  contains(value: T): boolean {
    return this.containsNode(this.root, value)
  }

  rank(value: T): number {
    let count = 0
    let node = this.root
    while (node !== null) {
      const c = this.cmp(value, node.value)
      if (c < 0) {
        node = node.left
      } else if (c > 0) {
        count += 1 + this.nodeSize(node.left)
        node = node.right
      } else {
        count += this.nodeSize(node.left)
        return count
      }
    }
    return count
  }

  select(k: number): T | undefined {
    if (k < 0 || k >= this._size) {
      return undefined
    }
    let node = this.root
    while (node !== null) {
      const leftSize = this.nodeSize(node.left)
      if (k < leftSize) {
        node = node.left
      } else if (k === leftSize) {
        return node.value
      } else {
        k -= leftSize + 1
        node = node.right
      }
    }
    return undefined
  }

  min(): T | undefined {
    if (this.root === null) {
      return undefined
    }
    return this.findMin(this.root).value
  }

  max(): T | undefined {
    if (this.root === null) {
      return undefined
    }
    return this.findMax(this.root).value
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
    const result: T[] = []
    const stack: AVLNode<T>[] = []
    let current = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      result.push(current.value)
      current = current.right
    }
    return result
  }

  toArraySorted(): T[] {
    return this.toArray()
  }

  private findPredecessor(value: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const c = this.cmp(value, node.value)
      if (c > 0) {
        result = node.value
        node = node.right
      } else {
        node = node.left
      }
    }
    return result
  }

  predecessor(value: T): T | undefined {
    if (!this.contains(value)) {
      return undefined
    }
    return this.findPredecessor(value)
  }

  private findSuccessor(value: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const c = this.cmp(value, node.value)
      if (c < 0) {
        result = node.value
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  successor(value: T): T | undefined {
    if (!this.contains(value)) {
      return undefined
    }
    return this.findSuccessor(value)
  }

  lowerBound(value: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const c = this.cmp(value, node.value)
      if (c <= 0) {
        result = node.value
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  upperBound(value: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const c = this.cmp(value, node.value)
      if (c < 0) {
        result = node.value
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    const stack: AVLNode<T>[] = []
    let current = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      callback(current.value, idx)
      idx++
      current = current.right
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const stack: AVLNode<T>[] = []
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

  clone(): CountedTree<T> {
    const tree = new CountedTree<T>(undefined, {
      comparator: this.cmp,
    })
    tree.root = this.cloneNode(this.root)
    tree._size = this._size
    return tree
  }

  private cloneNode(node: AVLNode<T> | null): AVLNode<T> | null {
    if (node === null) {
      return null
    }
    return {
      value: node.value,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
      height: node.height,
      size: node.size,
    }
  }

  static fromArray<U>(
    items: U[],
    options?: CountedTreeOptions<U>,
  ): CountedTree<U> {
    return new CountedTree<U>(items, options)
  }

  count(lo: T, hi: T): number {
    if (this.cmp(lo, hi) > 0) {
      return 0
    }
    return this.rankUpperBound(hi) - this.rankLowerBound(lo)
  }

  private rankLowerBound(value: T): number {
    let count = 0
    let node = this.root
    while (node !== null) {
      const c = this.cmp(value, node.value)
      if (c < 0) {
        node = node.left
      } else if (c > 0) {
        count += 1 + this.nodeSize(node.left)
        node = node.right
      } else {
        count += this.nodeSize(node.left)
        return count
      }
    }
    return count
  }

  private rankUpperBound(value: T): number {
    let count = 0
    let node = this.root
    while (node !== null) {
      const c = this.cmp(value, node.value)
      if (c < 0) {
        node = node.left
      } else {
        count += 1 + this.nodeSize(node.left)
        node = node.right
      }
    }
    return count
  }

  atIndex(index: number): T | undefined {
    return this.select(index)
  }

  indexOf(value: T): number {
    if (!this.contains(value)) {
      return -1
    }
    return this.rank(value)
  }

  toString(): string {
    return `${CountedTree}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toJSON() {
    return { type: 'CountedTree', size: this.size, items: this.toArray() }
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


  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
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

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }

  tap(fn: (collection: CountedTree<T>) => void): CountedTree<T> {
    fn(this)
    return this
  }

  equals(other: CountedTree<T>): boolean {
    const a = this.toArray()
    const b = other.toArray()
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  static empty<T>(): CountedTree<T> {
    return new CountedTree<T>()
  }

  toSorted(compareFn?: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
  }

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
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

  get [Symbol.toStringTag](): string {
    return 'CountedTree'
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
}
