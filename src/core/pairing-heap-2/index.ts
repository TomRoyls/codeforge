import type { Comparator, ForEachCallback, PairingHeap2Node, PairingHeap2Options } from './types.js'

const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class PairingHeap2<T> {
  private _root: PairingHeap2Node<T> | null
  private _size: number
  private readonly _comparator: Comparator<T>

  constructor(options?: PairingHeap2Options<T>) {
    this._comparator = options?.comparator ?? defaultComparator
    this._root = null
    this._size = 0
  }

  private _mergeNodes(
    a: PairingHeap2Node<T> | null,
    b: PairingHeap2Node<T> | null
  ): PairingHeap2Node<T> | null {
    if (a === null) return b
    if (b === null) return a

    if (this._comparator(a.value, b.value) <= 0) {
      b.sibling = a.child
      if (a.child !== null) {
        a.child.prev = b
      }
      b.prev = a
      a.child = b
      return a
    } else {
      a.sibling = b.child
      if (b.child !== null) {
        b.child.prev = a
      }
      a.prev = b
      b.child = a
      return b
    }
  }

  push(value: T): PairingHeap2Node<T> {
    return this.insert(value)
  }

  insert(value: T): PairingHeap2Node<T> {
    const node: PairingHeap2Node<T> = {
      value,
      child: null,
      sibling: null,
      prev: null,
    }
    this._root = this._mergeNodes(this._root, node)
    if (this._root !== null) {
      this._root.prev = null
    }
    this._size++
    return node
  }

  pop(): T {
    if (this._root === null) {
      throw new Error('pop called on empty heap')
    }
    const result = this._root.value
    this._root = this._twoPassPair(this._root.child)
    if (this._root !== null) {
      this._root.prev = null
    }
    this._size--
    return result
  }

  private _twoPassPair(node: PairingHeap2Node<T> | null): PairingHeap2Node<T> | null {
    if (node === null || node.sibling === null) {
      return node
    }

    const pairs: PairingHeap2Node<T>[] = []
    let current: PairingHeap2Node<T> | null = node
    while (current !== null) {
      const next: PairingHeap2Node<T> | null = current.sibling
      current.sibling = null
      current.prev = null
      if (next !== null) {
        const nextNext: PairingHeap2Node<T> | null = next.sibling
        next.sibling = null
        next.prev = null
        pairs.push(this._mergeNodes(current, next)!)
        current = nextNext
      } else {
        pairs.push(current)
        current = null
      }
    }

    let result: PairingHeap2Node<T> | null = null
    for (let i = pairs.length - 1; i >= 0; i--) {
      result = this._mergeNodes(result, pairs[i]!)
    }
    if (result !== null) {
      result.prev = null
    }
    return result
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

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._root = null
    this._size = 0
  }

  toArray(): T[] {
    const cloned = this.clone()
    const result: T[] = []
    while (!cloned.isEmpty) {
      result.push(cloned.pop())
    }
    return result
  }

  clone(): PairingHeap2<T> {
    const result = new PairingHeap2<T>({ comparator: this._comparator })
    if (this._root === null) return result
    result._root = this._cloneTree(this._root)
    result._size = this._size
    return result
  }

  private _cloneTree(node: PairingHeap2Node<T>): PairingHeap2Node<T> {
    const cloned: PairingHeap2Node<T> = {
      value: node.value,
      child: null,
      sibling: null,
      prev: null,
    }
    if (node.child !== null) {
      cloned.child = this._cloneSiblingList(node.child, cloned)
    }
    return cloned
  }

  private _cloneSiblingList(
    node: PairingHeap2Node<T>,
    parent: PairingHeap2Node<T>
  ): PairingHeap2Node<T> {
    const head: PairingHeap2Node<T> = {
      value: node.value,
      child: null,
      sibling: null,
      prev: parent,
    }
    if (node.child !== null) {
      head.child = this._cloneSiblingList(node.child, head)
    }
    let dest: PairingHeap2Node<T> = head
    let current: PairingHeap2Node<T> | null = node.sibling
    while (current !== null) {
      const cloned: PairingHeap2Node<T> = {
        value: current.value,
        child: null,
        sibling: null,
        prev: dest,
      }
      if (current.child !== null) {
        cloned.child = this._cloneSiblingList(current.child, cloned)
      }
      dest.sibling = cloned
      dest = cloned
      current = current.sibling
    }
    return head
  }

  static fromArray<U>(items: U[], options?: PairingHeap2Options<U>): PairingHeap2<U> {
    const heap = new PairingHeap2<U>(options)
    for (const item of items) {
      heap.insert(item)
    }
    return heap
  }

  merge(other: PairingHeap2<T>): void {
    if (other === this) return
    if (other._root === null) return
    if (this._root === null) {
      this._root = other._root
    } else {
      this._root = this._mergeNodes(this._root, other._root)
      this._root!.prev = null
    }
    this._size += other._size
    other._root = null
    other._size = 0
  }

  decreaseKey(node: PairingHeap2Node<T>, newValue: T): void {
    if (this._root === null) {
      throw new Error('Heap is empty')
    }
    if (this._comparator(newValue, node.value) > 0) {
      throw new Error('New value is greater than current value')
    }
    node.value = newValue
    if (node === this._root) return
    this._cutNode(node)
    this._root = this._mergeNodes(this._root, node)
    this._root!.prev = null
  }

  decreaseKeyOrDefault(node: PairingHeap2Node<T>, newValue: T): boolean {
    if (this._root === null) return false
    if (this._comparator(newValue, node.value) > 0) return false
    if (!this.contains(node)) return false
    this.decreaseKey(node, newValue)
    return true
  }

  private _cutNode(node: PairingHeap2Node<T>): void {
    if (node.prev !== null) {
      if (node.prev.child === node) {
        node.prev.child = node.sibling
      } else {
        node.prev.sibling = node.sibling
      }
      if (node.sibling !== null) {
        node.sibling.prev = node.prev
      }
    }
    node.prev = null
    node.sibling = null
  }

  delete(node: PairingHeap2Node<T>): void {
    if (this._root === null) return
    if (node === this._root) {
      this.pop()
      return
    }
    const childForest = node.child
    this._cutNode(node)
    this._size--
    if (childForest !== null) {
      this._reinsertChildrenNoCount(childForest)
    }
  }

  private _reinsertChildrenNoCount(node: PairingHeap2Node<T>): void {
    const children: PairingHeap2Node<T>[] = []
    let current: PairingHeap2Node<T> | null = node
    while (current !== null) {
      const next: PairingHeap2Node<T> | null = current.sibling
      if (current.child !== null) {
        this._reinsertChildrenNoCount(current.child)
      }
      children.push(current)
      current = next
    }
    for (const child of children) {
      child.child = null
      child.sibling = null
      child.prev = null
      this._root = this._mergeNodes(this._root, child)
      if (this._root !== null) {
        this._root.prev = null
      }
    }
  }

  contains(node: PairingHeap2Node<T>): boolean {
    if (this._root === null) return false
    return this._findNode(this._root, node)
  }

  private _findNode(root: PairingHeap2Node<T>, target: PairingHeap2Node<T>): boolean {
    let current: PairingHeap2Node<T> | null = root
    while (current !== null) {
      if (current === target) return true
      if (current.child !== null) {
        if (this._findNode(current.child, target)) return true
      }
      current = current.sibling
    }
    return false
  }

  update(node: PairingHeap2Node<T>, newValue: T): void {
    if (this._root === null) return
    const cmp = this._comparator(newValue, node.value)
    if (cmp === 0) return
    if (cmp < 0) {
      this.decreaseKey(node, newValue)
    } else {
      if (node === this._root) {
        this.pop()
        this.insert(newValue)
      } else {
        this._cutNode(node)
        this._size--
        const childForest = node.child
        node.child = null
        node.value = newValue
        if (childForest !== null) {
          this._reinsertChildren(childForest)
        }
        this._root = this._mergeNodes(this._root, node)
        this._root!.prev = null
        this._size++
      }
    }
  }

  private _reinsertChildren(node: PairingHeap2Node<T>): void {
    const children: PairingHeap2Node<T>[] = []
    let current: PairingHeap2Node<T> | null = node
    while (current !== null) {
      const next: PairingHeap2Node<T> | null = current.sibling
      if (current.child !== null) {
        this._reinsertChildren(current.child)
      }
      children.push(current)
      current = next
    }
    for (const child of children) {
      child!.child = null
      child!.sibling = null
      child!.prev = null
      this._root = this._mergeNodes(this._root, child)
      if (this._root !== null) {
        this._root.prev = null
      }
      this._size++
    }
  }

  isValid(): boolean {
    if (this._root === null) return true
    return this._isValidSubtree(this._root.value, this._root)
  }

  private _isValidSubtree(parentValue: T, node: PairingHeap2Node<T>): boolean {
    let current: PairingHeap2Node<T> | null = node
    while (current !== null) {
      if (this._comparator(current.value, parentValue) < 0) {
        return false
      }
      if (current.child !== null) {
        if (!this._isValidSubtree(current.value, current.child)) return false
      }
      current = current.sibling
    }
    return true
  }

  forEach(callback: ForEachCallback<T>): void {
    let idx = 0
    const cloned = this.clone()
    while (!cloned.isEmpty) {
      callback(cloned.pop(), idx++)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const cloned = this.clone()
    while (!cloned.isEmpty) {
      yield cloned.pop()
    }
  }

  pushPop(value: T): T {
    if (this._root === null) {
      return value
    }
    const node: PairingHeap2Node<T> = {
      value,
      child: null,
      sibling: null,
      prev: null,
    }
    this._root = this._mergeNodes(this._root, node)
    const root = this._root!
    const result = root.value
    this._root = this._twoPassPair(root.child)
    if (this._root !== null) {
      this._root.prev = null
    }
    return result
  }

  replacePeek(value: T): T {
    if (this._root === null) {
      throw new Error('replacePeek called on empty heap')
    }
    const result = this._root.value
    this._root.value = value
    if (this._comparator(value, result) > 0) {
      const oldRoot = this._root
      this._root = this._twoPassPair(oldRoot.child)
      if (this._root !== null) {
        this._root.prev = null
      }
      oldRoot.child = null
      oldRoot.sibling = null
      oldRoot.prev = null
      this._root = this._mergeNodes(this._root, oldRoot)
      if (this._root !== null) {
        this._root.prev = null
      }
    }
    return result
  }

  has(node: PairingHeap2Node<T>): boolean {
    return this.contains(node)
  }

  toString(): string {
    return `PairingHeap2({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'PairingHeap2', size: this.size, items: this.toArray() }
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
    return 'PairingHeap2'
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
}

export type { PairingHeap2Options, PairingHeap2Node, Comparator, ForEachCallback } from './types.js'
