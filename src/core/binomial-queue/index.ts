import type { BinomialQueueOptions, BinomialTreeNode } from './types.js'

export class BinomialQueue<T = number> {
  private head: BinomialTreeNode<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(options?: BinomialQueueOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  push(item: T): void {
    const node: BinomialTreeNode<T> = {
      key: item,
      degree: 0,
      parent: null,
      child: null,
      sibling: null,
    }
    const single = new BinomialQueue<T>({ comparator: this.compare })
    single.head = node
    single._size = 1
    this.union(single)
  }

  pop(): T {
    if (this.head === null) {
      throw new Error('Queue is empty')
    }
    const { prev, min } = this.findMinRoot()
    const minNode = min!
    if (prev !== null) {
      prev.sibling = minNode.sibling
    } else {
      this.head = minNode.sibling
    }
    const removedKey = minNode.key
    const childList = this.reverseChildren(minNode)
    this._size -= 1
    if (childList !== null) {
      this.head = this.mergeRoots(this.head, childList)
    }
    return removedKey
  }

  peek(): T {
    if (this.head === null) {
      throw new Error('Queue is empty')
    }
    return this.findMinRoot().min!.key
  }

  merge(other: BinomialQueue<T>): void {
    if (other === this) return
    this._size += other._size
    this.head = this.mergeRoots(this.head, other.head)
    other.head = null
    other._size = 0
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.head = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    this.collectKeys(this.head, result)
    return result
  }

  toSortedArray(): T[] {
    const cloned = this.clone()
    const result: T[] = []
    while (!cloned.isEmpty()) {
      result.push(cloned.pop())
    }
    return result
  }

  contains(item: T): boolean {
    return this.findNode(this.head, item) !== null
  }

  remove(item: T): boolean {
    const node = this.findNode(this.head, item)
    if (node === null) return false
    const root = this.bubbleToRoot(node)
    this.extractRootNode(root)
    return true
  }

  decreaseKey(oldItem: T, newItem: T): boolean {
    if (this.compare(newItem, oldItem) > 0) return false
    const node = this.findNode(this.head, oldItem)
    if (node === null) return false
    node.key = newItem
    this.bubbleUp(node)
    return true
  }

  clone(): BinomialQueue<T> {
    const cloned = new BinomialQueue<T>({ comparator: this.compare })
    if (this.head === null) return cloned
    cloned.head = this.cloneTree(this.head)
    cloned._size = this._size
    return cloned
  }

  static fromArray<U>(
    items: U[],
    options?: BinomialQueueOptions<U>
  ): BinomialQueue<U> {
    const queue = new BinomialQueue<U>(options)
    for (let i = 0; i < items.length; i++) {
      queue.push(items[i]!)
    }
    return queue
  }

  forEach(callback: (item: T) => void): void {
    this.forEachNode(this.head, callback)
  }

  *[Symbol.iterator](): Iterator<T> {
    const items = this.toArray()
    for (let i = 0; i < items.length; i++) {
      yield items[i]!
    }
  }

  private union(other: BinomialQueue<T>): void {
    this._size += other._size
    this.head = this.mergeRoots(this.head, other.head)
    other.head = null
    other._size = 0
  }

  private mergeRoots(
    h1: BinomialTreeNode<T> | null,
    h2: BinomialTreeNode<T> | null
  ): BinomialTreeNode<T> | null {
    if (h1 === null) return h2
    if (h2 === null) return h1
    const merged = this.interleaveByDegree(h1, h2)
    return this.linkPairs(merged)
  }

  private interleaveByDegree(
    h1: BinomialTreeNode<T>,
    h2: BinomialTreeNode<T>
  ): BinomialTreeNode<T> {
    let head: BinomialTreeNode<T>
    let a: BinomialTreeNode<T> | null = h1
    let b: BinomialTreeNode<T> | null = h2
    if (a.degree <= b.degree) {
      head = a
      a = a.sibling
    } else {
      head = b
      b = b.sibling
    }
    let tail = head
    while (a !== null && b !== null) {
      if (a.degree <= b.degree) {
        tail.sibling = a
        a = a.sibling
      } else {
        tail.sibling = b
        b = b.sibling
      }
      tail = tail.sibling
    }
    tail.sibling = a !== null ? a : b
    return head
  }

  private linkPairs(
    head: BinomialTreeNode<T>
  ): BinomialTreeNode<T> {
    let prev: BinomialTreeNode<T> | null = null
    let curr: BinomialTreeNode<T> | null = head
    let next: BinomialTreeNode<T> | null = curr.sibling
    while (next !== null) {
      const mergeCurrAndNext =
        curr.degree === next.degree &&
        (next.sibling === null || next.sibling.degree !== curr.degree)
      if (!mergeCurrAndNext) {
        prev = curr
        curr = next
        next = next.sibling
      } else if (this.compare(curr.key, next.key) <= 0) {
        curr.sibling = next.sibling
        this.linkTwoTrees(curr, next)
        next = curr.sibling
      } else {
        curr.sibling = next.sibling
        this.linkTwoTrees(next, curr)
        if (prev !== null) {
          prev.sibling = next
        } else {
          head = next
        }
        curr = next
        next = curr.sibling
      }
    }
    return head
  }

  private linkTwoTrees(
    smaller: BinomialTreeNode<T>,
    larger: BinomialTreeNode<T>
  ): void {
    larger.sibling = smaller.child
    larger.parent = smaller
    smaller.child = larger
    smaller.degree += 1
  }

  private findMinRoot(): {
    prev: BinomialTreeNode<T> | null
    min: BinomialTreeNode<T> | null
  } {
    if (this.head === null) return { prev: null, min: null }
    let minPrev: BinomialTreeNode<T> | null = null
    let minNode = this.head
    let prev: BinomialTreeNode<T> | null = null
    let current: BinomialTreeNode<T> | null = this.head.sibling
    while (current !== null) {
      if (this.compare(current.key, minNode.key) < 0) {
        minNode = current
        minPrev = prev
      }
      prev = current
      current = current.sibling
    }
    if (minPrev === null && minNode !== this.head) {
      minPrev = this.head
    }
    return { prev: minPrev, min: minNode }
  }

  private reverseChildren(node: BinomialTreeNode<T>): BinomialTreeNode<T> | null {
    let child = node.child
    let prev: BinomialTreeNode<T> | null = null
    while (child !== null) {
      const next = child.sibling
      child.sibling = prev
      child.parent = null
      prev = child
      child = next
    }
    return prev
  }

  private bubbleUp(node: BinomialTreeNode<T>): BinomialTreeNode<T> {
    let current = node
    while (
      current.parent !== null &&
      this.compare(current.key, current.parent.key) < 0
    ) {
      const temp = current.key
      current.key = current.parent.key
      current.parent.key = temp
      current = current.parent
    }
    return current
  }

  private bubbleToRoot(node: BinomialTreeNode<T>): BinomialTreeNode<T> {
    let current = node
    while (current.parent !== null) {
      const temp = current.key
      current.key = current.parent.key
      current.parent.key = temp
      current = current.parent
    }
    return current
  }

  private extractRootNode(target: BinomialTreeNode<T>): void {
    const { prev } = this.findNodePrev(this.head, target)
    if (prev !== null) {
      prev.sibling = target.sibling
    } else {
      this.head = target.sibling
    }
    const childList = this.reverseChildren(target)
    this._size -= 1
    if (childList !== null) {
      this.head = this.mergeRoots(this.head, childList)
    }
  }

  private findNodePrev(
    root: BinomialTreeNode<T> | null,
    target: BinomialTreeNode<T>
  ): { prev: BinomialTreeNode<T> | null; found: boolean } {
    let prev: BinomialTreeNode<T> | null = null
    let current = root
    while (current !== null) {
      if (current === target) return { prev, found: true }
      prev = current
      current = current.sibling
    }
    return { prev: null, found: false }
  }

  private findNode(
    root: BinomialTreeNode<T> | null,
    item: T
  ): BinomialTreeNode<T> | null {
    if (root === null) return null
    const stack: BinomialTreeNode<T>[] = [root]
    while (stack.length > 0) {
      const node = stack.pop()!
      if (this.compare(node.key, item) === 0) return node
      if (node.sibling !== null) stack.push(node.sibling)
      if (node.child !== null) stack.push(node.child)
    }
    return null
  }

  private collectKeys(
    node: BinomialTreeNode<T> | null,
    result: T[]
  ): void {
    if (node === null) return
    const stack: BinomialTreeNode<T>[] = [node]
    while (stack.length > 0) {
      const current = stack.pop()!
      result.push(current.key)
      if (current.sibling !== null) stack.push(current.sibling)
      if (current.child !== null) stack.push(current.child)
    }
  }

  private forEachNode(
    node: BinomialTreeNode<T> | null,
    callback: (item: T) => void
  ): void {
    if (node === null) return
    const stack: BinomialTreeNode<T>[] = [node]
    while (stack.length > 0) {
      const current = stack.pop()!
      callback(current.key)
      if (current.sibling !== null) stack.push(current.sibling)
      if (current.child !== null) stack.push(current.child)
    }
  }

  private cloneTree(node: BinomialTreeNode<T>): BinomialTreeNode<T> {
    const cloned: BinomialTreeNode<T> = {
      key: node.key,
      degree: node.degree,
      parent: null,
      child: null,
      sibling: null,
    }
    if (node.child !== null) {
      cloned.child = this.cloneTree(node.child)
      this.setParentRefs(cloned.child, cloned)
    }
    if (node.sibling !== null) {
      cloned.sibling = this.cloneTree(node.sibling)
    }
    return cloned
  }

  private setParentRefs(
    child: BinomialTreeNode<T>,
    parent: BinomialTreeNode<T>
  ): void {
    let current: BinomialTreeNode<T> | null = child
    while (current !== null) {
      current.parent = parent
      current = current.sibling
    }
  }

  toString(): string {
    return `${BinomialQueue}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }

  has(item: T): boolean {
    return this.contains(item)
  }

  toJSON() {
    return { type: 'BinomialQueue', items: this.toArray() }
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

  tap(fn: (collection: BinomialQueue<T>) => void): BinomialQueue<T> {
    fn(this)
    return this
  }

  equals(other: BinomialQueue<T>): boolean {
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

  static empty<T>(): BinomialQueue<T> {
    return new BinomialQueue<T>()
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
    return 'BinomialQueue'
  }

  indexOf(item: T, fromIndex: number = 0): number {
    return this.toArray().indexOf(item, fromIndex)
  }









}

export type { BinomialQueueOptions } from './types.js'
