import type { ConcTreeNode, ConcConcatNode } from './types.js'

function nodeSize<T>(node: ConcTreeNode<T>): number {
  return node.kind === 'leaf' ? node.values.length : node.size
}

function nodeHeight<T>(node: ConcTreeNode<T>): number {
  return node.kind === 'leaf' ? 0 : node.height
}

function makeConc<T>(left: ConcTreeNode<T>, right: ConcTreeNode<T>): ConcConcatNode<T> {
  return {
    kind: 'conc',
    left,
    right,
    size: nodeSize(left) + nodeSize(right),
    height: Math.max(nodeHeight(left), nodeHeight(right)) + 1,
  }
}

function rebalanceLeft<T>(left: ConcConcatNode<T>, right: ConcTreeNode<T>): ConcTreeNode<T> {
  const ll = left.left
  const lr = left.right
  if (nodeHeight(ll) >= nodeHeight(lr)) {
    return makeConc(ll, makeConc(lr, right))
  }
  if (lr.kind === 'conc') {
    return makeConc(makeConc(ll, lr.left), makeConc(lr.right, right))
  }
  return makeConc(ll, makeConc(lr, right))
}

function rebalanceRight<T>(left: ConcTreeNode<T>, right: ConcConcatNode<T>): ConcTreeNode<T> {
  const rl = right.left
  const rr = right.right
  if (nodeHeight(rr) >= nodeHeight(rl)) {
    return makeConc(makeConc(left, rl), rr)
  }
  if (rl.kind === 'conc') {
    return makeConc(makeConc(left, rl.left), makeConc(rl.right, rr))
  }
  return makeConc(makeConc(left, rl), rr)
}

function concatNodes<T>(left: ConcTreeNode<T>, right: ConcTreeNode<T>): ConcTreeNode<T> {
  if (left.kind === 'leaf' && left.values.length === 0) return right
  if (right.kind === 'leaf' && right.values.length === 0) return left
  const lh = nodeHeight(left)
  const rh = nodeHeight(right)
  if (lh > rh + 1 && left.kind === 'conc') {
    return rebalanceLeft(left, right)
  }
  if (rh > lh + 1 && right.kind === 'conc') {
    return rebalanceRight(left, right)
  }
  return makeConc(left, right)
}

function getNode<T>(node: ConcTreeNode<T>, index: number): T {
  if (node.kind === 'leaf') {
    return node.values[index]!
  }
  const leftSize = nodeSize(node.left)
  if (index < leftSize) return getNode(node.left, index)
  return getNode(node.right, index - leftSize)
}

function updateNode<T>(node: ConcTreeNode<T>, index: number, value: T): ConcTreeNode<T> {
  if (node.kind === 'leaf') {
    const newValues = [...node.values]
    newValues[index] = value
    return { kind: 'leaf', values: newValues }
  }
  const leftSize = nodeSize(node.left)
  if (index < leftSize) {
    return makeConc(updateNode(node.left, index, value), node.right)
  }
  return makeConc(node.left, updateNode(node.right, index - leftSize, value))
}

function splitNode<T>(node: ConcTreeNode<T>, index: number): [ConcTreeNode<T> | null, ConcTreeNode<T> | null] {
  if (node.kind === 'leaf') {
    if (index <= 0) return [null, node]
    if (index >= node.values.length) return [node, null]
    return [
      { kind: 'leaf', values: node.values.slice(0, index) },
      { kind: 'leaf', values: node.values.slice(index) },
    ]
  }
  const leftSize = nodeSize(node.left)
  if (index < leftSize) {
    const [leftPart, rightPartOfLeft] = splitNode(node.left, index)
    const rightResult = rightPartOfLeft === null ? node.right : concatNodes(rightPartOfLeft, node.right)
    return [leftPart, rightResult]
  }
  if (index > leftSize) {
    const [leftPartOfRight, rightPart] = splitNode(node.right, index - leftSize)
    const leftResult = leftPartOfRight === null ? node.left : concatNodes(node.left, leftPartOfRight)
    return [leftResult, rightPart]
  }
  return [node.left, node.right]
}

function flattenNode<T>(node: ConcTreeNode<T>, result: T[]): void {
  if (node.kind === 'leaf') {
    for (const v of node.values) result.push(v)
  } else {
    flattenNode(node.left, result)
    flattenNode(node.right, result)
  }
}

function mapNode<T, U>(node: ConcTreeNode<T>, fn: (value: T, index: number) => U, counter: { val: number }): ConcTreeNode<U> {
  if (node.kind === 'leaf') {
    return {
      kind: 'leaf',
      values: node.values.map(v => {
        const result = fn(v, counter.val)
        counter.val++
        return result
      }),
    }
  }
  const left = mapNode(node.left, fn, counter)
  const right = mapNode(node.right, fn, counter)
  return makeConc(left, right)
}

function* iterNode<T>(node: ConcTreeNode<T>): Generator<T> {
  if (node.kind === 'leaf') {
    for (const v of node.values) yield v
  } else {
    yield* iterNode(node.left)
    yield* iterNode(node.right)
  }
}

export class ConcTree<T> {
  private root: ConcTreeNode<T> | null = null

  get size(): number {
    return this.root === null ? 0 : nodeSize(this.root)
  }

  isEmpty(): boolean {
    return this.root === null
  }

  append(value: T): void {
    const leaf: ConcTreeNode<T> = { kind: 'leaf', values: [value] }
    this.root = this.root === null ? leaf : concatNodes(this.root, leaf)
  }

  prepend(value: T): void {
    const leaf: ConcTreeNode<T> = { kind: 'leaf', values: [value] }
    this.root = this.root === null ? leaf : concatNodes(leaf, this.root)
  }

  concat(other: ConcTree<T>): void {
    if (other.root === null) return
    if (this.root === null) {
      this.root = other.root
      return
    }
    this.root = concatNodes(this.root, other.root)
  }

  get(index: number): T | undefined {
    if (this.root === null || index < 0 || index >= this.size) return undefined
    return getNode(this.root, index)
  }

  update(index: number, value: T): void {
    if (this.root === null || index < 0 || index >= this.size) return
    this.root = updateNode(this.root, index, value)
  }

  split(index: number): [ConcTree<T>, ConcTree<T>] {
    if (this.root === null || index <= 0) {
      return [new ConcTree<T>(), this.clone()]
    }
    if (index >= this.size) {
      return [this.clone(), new ConcTree<T>()]
    }
    const [left, right] = splitNode(this.root, index)
    const l = new ConcTree<T>()
    l.root = left
    const r = new ConcTree<T>()
    r.root = right
    return [l, r]
  }

  clear(): void {
    this.root = null
  }

  toArray(): T[] {
    const result: T[] = []
    if (this.root !== null) flattenNode(this.root, result)
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    if (this.root === null) return
    let idx = 0
    const walk = (node: ConcTreeNode<T>) => {
      if (node.kind === 'leaf') {
        for (const v of node.values) callback(v, idx++)
      } else {
        walk(node.left)
        walk(node.right)
      }
    }
    walk(this.root)
  }

  map<U>(callback: (value: T, index: number) => U): ConcTree<U> {
    const result = new ConcTree<U>()
    if (this.root === null) return result
    const counter = { val: 0 }
    result.root = mapNode(this.root, callback, counter)
    return result
  }

  filter(predicate: (value: T, index: number) => boolean): ConcTree<T> {
    const result = new ConcTree<T>()
    if (this.root === null) return result
    let idx = 0
    const collect = (node: ConcTreeNode<T>) => {
      if (node.kind === 'leaf') {
        for (const v of node.values) {
          if (predicate(v, idx)) result.append(v)
          idx++
        }
      } else {
        collect(node.left)
        collect(node.right)
      }
    }
    collect(this.root)
    return result
  }

  clone(): ConcTree<T> {
    const tree = new ConcTree<T>()
    tree.root = this.root
    return tree
  }

  *[Symbol.iterator](): Iterator<T> {
    if (this.root !== null) {
      yield* iterNode(this.root)
    }
  }

  static from<T>(values: T[]): ConcTree<T> {
    const tree = new ConcTree<T>()
    for (const v of values) tree.append(v)
    return tree
  }

  toString(): string {
    return `${ConcTree}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  toJSON() {
    return { type: 'ConcTree', size: this.size, items: this.toArray() }
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

  tap(fn: (collection: ConcTree<T>) => void): ConcTree<T> {
    fn(this)
    return this
  }

  equals(other: ConcTree<T>): boolean {
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

  static of<T>(...items: T[]): ConcTree<T> {
    return ConcTree.from(items)
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

  merge(other: ConcTree<T>): ConcTree<T> {
    return ConcTree.from([...this.toArray(), ...other.toArray()])
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

  sortBy(compareFn: (a: T, b: T) => number): T[] {
    return [...this.toArray()].sort(compareFn)
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

  toSet(): Set<T> {
    return new Set(this.toArray())
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

  forEachRight(callback: (item: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      callback(arr[i]!, i)
    }
  }

  toReversed(): T[] {
    return [...this.toArray()].reverse()
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
    return 'ConcTree'
  }

  indexOf(item: T, fromIndex: number = 0): number {
    return this.toArray().indexOf(item, fromIndex)
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
