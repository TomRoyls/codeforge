import type { Comparator, ForEachCallback, RankPairingHeapNode, RankPairingHeapOptions } from './types.js'

const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class RankPairingHeap<T> {
  private _firstRoot: RankPairingHeapNode<T> | null
  private _minRoot: RankPairingHeapNode<T> | null
  private _size: number
  private readonly _comparator: Comparator<T>

  constructor(options?: RankPairingHeapOptions<T>) {
    this._comparator = options?.comparator ?? defaultComparator
    this._firstRoot = null
    this._minRoot = null
    this._size = 0
  }

  push(value: T): RankPairingHeapNode<T> {
    return this.insert(value)
  }

  insert(value: T): RankPairingHeapNode<T> {
    const node: RankPairingHeapNode<T> = {
      value,
      rank: 0,
      child: null,
      sibling: null,
      prev: null,
    }
    this._addToRootList(node)
    this._size++
    return node
  }

  pop(): T {
    if (this._minRoot === null) {
      throw new Error('pop called on empty heap')
    }
    const result = this._minRoot.value
    const minRef = this._minRoot
    const child = minRef.child
    this._removeFromRootList(minRef)
    if (child !== null) {
      this._addChildrenToRootList(child)
    }
    this._size--
    if (this._firstRoot !== null) {
      this._consolidate()
    }
    return result
  }

  peek(): T {
    if (this._minRoot === null) {
      throw new Error('peek called on empty heap')
    }
    return this._minRoot.value
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._firstRoot = null
    this._minRoot = null
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

  clone(): RankPairingHeap<T> {
    const result = new RankPairingHeap<T>({ comparator: this._comparator })
    if (this._firstRoot === null) return result

    const clonedRoots: RankPairingHeapNode<T>[] = []
    let current: RankPairingHeapNode<T> | null = this._firstRoot
    while (current !== null) {
      clonedRoots.push(this._cloneTree(current))
      current = current.sibling
    }

    for (let i = clonedRoots.length - 1; i >= 0; i--) {
      const cloned = clonedRoots[i]!
      cloned.prev = null
      cloned.sibling = result._firstRoot
      result._firstRoot = cloned
      if (result._minRoot === null || this._comparator(cloned.value, result._minRoot.value) < 0) {
        result._minRoot = cloned
      }
    }

    result._size = this._size
    return result
  }

  static fromArray<U>(items: U[], options?: RankPairingHeapOptions<U>): RankPairingHeap<U> {
    const heap = new RankPairingHeap<U>(options)
    for (const item of items) {
      heap.insert(item)
    }
    return heap
  }

  merge(other: RankPairingHeap<T>): void {
    if (other === this) return
    if (other._firstRoot === null) return
    if (this._firstRoot === null) {
      this._firstRoot = other._firstRoot
      this._minRoot = other._minRoot
    } else {
      let last = other._firstRoot
      while (last.sibling !== null) {
        last = last.sibling
      }
      last.sibling = this._firstRoot
      this._firstRoot = other._firstRoot
      if (other._minRoot !== null && (this._minRoot === null || this._comparator(other._minRoot.value, this._minRoot.value) < 0)) {
        this._minRoot = other._minRoot
      }
    }
    this._size += other._size
    other._firstRoot = null
    other._minRoot = null
    other._size = 0
  }

  decreaseKey(node: RankPairingHeapNode<T>, newValue: T): void {
    if (this._minRoot === null) {
      throw new Error('Heap is empty')
    }
    if (this._comparator(newValue, node.value) > 0) {
      throw new Error('New value is greater than current value')
    }
    node.value = newValue
    if (this._isInRootList(node)) {
      if (this._comparator(newValue, this._minRoot.value) < 0) {
        this._minRoot = node
      }
      return
    }
    this._cutNode(node)
    this._addToRootList(node)
  }

  delete(node: RankPairingHeapNode<T>): void {
    if (this._minRoot === null) return
    if (node === this._minRoot) {
      this.pop()
      return
    }
    const childForest = node.child
    if (this._isInRootList(node)) {
      this._removeFromRootList(node)
      this._size--
      if (childForest !== null) {
        this._addChildrenToRootList(childForest)
      }
      return
    }
    this._cutNode(node)
    this._size--
    if (childForest !== null) {
      this._addChildrenToRootList(childForest)
    }
  }

  contains(node: RankPairingHeapNode<T>): boolean {
    if (this._firstRoot === null) return false
    let current: RankPairingHeapNode<T> | null = this._firstRoot
    while (current !== null) {
      if (current === node) return true
      if (current.child !== null && this._findNode(current.child, node)) return true
      current = current.sibling
    }
    return false
  }

  isValid(): boolean {
    if (this._firstRoot === null) return true
    let current: RankPairingHeapNode<T> | null = this._firstRoot
    while (current !== null) {
      if (!this._isValidTree(current)) return false
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
    if (this._minRoot === null) {
      return value
    }
    this.insert(value)
    return this.pop()
  }

  replacePeek(value: T): T {
    if (this._minRoot === null) {
      throw new Error('replacePeek called on empty heap')
    }
    const result = this._minRoot.value
    this._minRoot.value = value
    if (this._comparator(value, result) > 0) {
      const oldRoot = this._minRoot
      this._removeFromRootList(oldRoot)
      if (oldRoot.child !== null) {
        this._addChildrenToRootList(oldRoot.child)
      }
      oldRoot.child = null
      oldRoot.sibling = null
      oldRoot.prev = null
      oldRoot.rank = 0
      this._addToRootList(oldRoot)
    }
    return result
  }

  update(node: RankPairingHeapNode<T>, newValue: T): void {
    if (this._minRoot === null) return
    const cmp = this._comparator(newValue, node.value)
    if (cmp === 0) return
    if (cmp < 0) {
      this.decreaseKey(node, newValue)
    } else {
      if (node === this._minRoot) {
        this.pop()
        this.insert(newValue)
        return
      }
      const childForest = node.child
      if (this._isInRootList(node)) {
        this._removeFromRootList(node)
      } else {
        this._cutNode(node)
      }
      this._size--
      node.child = null
      node.value = newValue
      node.rank = 0
      if (childForest !== null) {
        this._addChildrenToRootList(childForest)
      }
      this._addToRootList(node)
      this._size++
    }
  }

  private _addToRootList(node: RankPairingHeapNode<T>): void {
    node.prev = null
    node.sibling = this._firstRoot
    this._firstRoot = node
    if (this._minRoot === null || this._comparator(node.value, this._minRoot.value) < 0) {
      this._minRoot = node
    }
  }

  private _removeFromRootList(node: RankPairingHeapNode<T>): void {
    if (this._firstRoot === node) {
      this._firstRoot = node.sibling
    } else {
      let prev: RankPairingHeapNode<T> | null = this._firstRoot
      while (prev !== null && prev.sibling !== node) {
        prev = prev.sibling
      }
      if (prev !== null) {
        prev.sibling = node.sibling
      }
    }
    node.sibling = null
    node.prev = null
    if (node === this._minRoot) {
      this._updateMinRoot()
    }
  }

  private _updateMinRoot(): void {
    this._minRoot = this._firstRoot
    if (this._minRoot === null) return
    let current = this._firstRoot!.sibling
    while (current !== null) {
      if (this._comparator(current.value, this._minRoot!.value) < 0) {
        this._minRoot = current
      }
      current = current.sibling
    }
  }

  private _addChildrenToRootList(child: RankPairingHeapNode<T>): void {
    const children: RankPairingHeapNode<T>[] = []
    let current: RankPairingHeapNode<T> | null = child
    while (current !== null) {
      children.push(current)
      current = current.sibling
    }
    for (const c of children) {
      c.prev = null
      c.sibling = this._firstRoot
      this._firstRoot = c
      if (this._minRoot === null || this._comparator(c.value, this._minRoot!.value) < 0) {
        this._minRoot = c
      }
    }
  }

  private _isInRootList(node: RankPairingHeapNode<T>): boolean {
    let current: RankPairingHeapNode<T> | null = this._firstRoot
    while (current !== null) {
      if (current === node) return true
      current = current.sibling
    }
    return false
  }

  private _link(a: RankPairingHeapNode<T>, b: RankPairingHeapNode<T>): RankPairingHeapNode<T> {
    let parent: RankPairingHeapNode<T>
    let newChild: RankPairingHeapNode<T>
    if (this._comparator(a.value, b.value) <= 0) {
      parent = a
      newChild = b
    } else {
      parent = b
      newChild = a
    }
    newChild.sibling = parent.child
    if (parent.child !== null) {
      parent.child.prev = newChild
    }
    newChild.prev = parent
    parent.child = newChild
    parent.rank++
    return parent
  }

  private _consolidate(): void {
    if (this._firstRoot === null) {
      this._minRoot = null
      return
    }
    const roots: RankPairingHeapNode<T>[] = []
    let current: RankPairingHeapNode<T> | null = this._firstRoot
    while (current !== null) {
      roots.push(current)
      current = current.sibling
    }
    const rankBuckets = new Map<number, RankPairingHeapNode<T>>()
    for (const root of roots) {
      let tree = root
      tree.prev = null
      tree.sibling = null
      while (rankBuckets.has(tree.rank)) {
        const other = rankBuckets.get(tree.rank)!
        rankBuckets.delete(tree.rank)
        tree = this._link(tree, other)
      }
      rankBuckets.set(tree.rank, tree)
    }
    this._firstRoot = null
    this._minRoot = null
    for (const tree of rankBuckets.values()) {
      tree.prev = null
      tree.sibling = this._firstRoot
      this._firstRoot = tree
      if (this._minRoot === null || this._comparator(tree.value, this._minRoot.value) < 0) {
        this._minRoot = tree
      }
    }
  }

  private _cutNode(node: RankPairingHeapNode<T>): void {
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

  private _findNode(root: RankPairingHeapNode<T>, target: RankPairingHeapNode<T>): boolean {
    let current: RankPairingHeapNode<T> | null = root
    while (current !== null) {
      if (current === target) return true
      if (current.child !== null && this._findNode(current.child, target)) return true
      current = current.sibling
    }
    return false
  }

  private _isValidTree(node: RankPairingHeapNode<T>): boolean {
    let current: RankPairingHeapNode<T> | null = node.child
    while (current !== null) {
      if (this._comparator(current.value, node.value) < 0) return false
      if (!this._isValidTree(current)) return false
      current = current.sibling
    }
    return true
  }

  private _cloneTree(node: RankPairingHeapNode<T>): RankPairingHeapNode<T> {
    const cloned: RankPairingHeapNode<T> = {
      value: node.value,
      rank: node.rank,
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
    node: RankPairingHeapNode<T>,
    parent: RankPairingHeapNode<T>
  ): RankPairingHeapNode<T> {
    const head: RankPairingHeapNode<T> = {
      value: node.value,
      rank: node.rank,
      child: null,
      sibling: null,
      prev: parent,
    }
    if (node.child !== null) {
      head.child = this._cloneSiblingList(node.child, head)
    }
    let dest: RankPairingHeapNode<T> = head
    let current: RankPairingHeapNode<T> | null = node.sibling
    while (current !== null) {
      const cloned: RankPairingHeapNode<T> = {
        value: current.value,
        rank: current.rank,
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

  toString(): string {
    return `RankPairingHeap({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'RankPairingHeap', size: this.size, items: this.toArray() }
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
    return 'RankPairingHeap'
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

  indexedForEach(fn: (item: T, index: number) => void): void {
    this.toArray().forEach((item, i) => fn(item, i))
  }

  occurrencesOf(value: T): number {
    return this.toArray().filter(item => item === value).length
  }
}

export type { RankPairingHeapOptions, RankPairingHeapNode, Comparator, ForEachCallback } from './types.js'
