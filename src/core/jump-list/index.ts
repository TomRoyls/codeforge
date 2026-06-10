import type { JumpListOptions } from './types.js'

type Node<T> = {
  value: T
  prev: Node<T> | null
  next: Node<T> | null
}

export class JumpList<T> {
  private head: Node<T> | null = null
  private tail: Node<T> | null = null
  private count = 0
  private blockSize: number
  private jumpPointers: Node<T>[] = []

  constructor(options?: JumpListOptions) {
    this.blockSize = options?.blockSize ?? 32
  }

  push(value: T): void {
    const node: Node<T> = { value, prev: this.tail, next: null }

    if (this.tail) {
      this.tail.next = node
    } else {
      this.head = node
    }

    this.tail = node
    this.count++
    this.maybeRebuildJumpPointers()
  }

  pop(): T | undefined {
    if (!this.tail) {
      return undefined
    }

    const value = this.tail.value
    this.tail = this.tail.prev

    if (this.tail) {
      this.tail.next = null
    } else {
      this.head = null
    }

    this.count--
    this.maybeRebuildJumpPointers()

    return value
  }

  unshift(value: T): void {
    const node: Node<T> = { value, prev: null, next: this.head }

    if (this.head) {
      this.head.prev = node
    } else {
      this.tail = node
    }

    this.head = node
    this.count++
    this.maybeRebuildJumpPointers()
  }

  shift(): T | undefined {
    if (!this.head) {
      return undefined
    }

    const value = this.head.value
    this.head = this.head.next

    if (this.head) {
      this.head.prev = null
    } else {
      this.tail = null
    }

    this.count--
    this.maybeRebuildJumpPointers()

    return value
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined
    }

    const node = this.findNode(index)
    return node?.value
  }

  set(index: number, value: T): boolean {
    if (index < 0 || index >= this.count) {
      return false
    }

    const node = this.findNode(index)
    if (node) {
      node.value = value
      return true
    }

    return false
  }

  insert(index: number, value: T): boolean {
    if (index < 0 || index > this.count) {
      return false
    }

    if (index === 0) {
      this.unshift(value)
      return true
    }

    if (index === this.count) {
      this.push(value)
      return true
    }

    const nextNode = this.findNode(index)
    if (!nextNode) {
      return false
    }

    const prevNode = nextNode.prev!
    const newNode: Node<T> = { value, prev: prevNode, next: nextNode }

    prevNode.next = newNode
    nextNode.prev = newNode

    this.count++
    this.maybeRebuildJumpPointers()

    return true
  }

  delete(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined
    }

    if (index === 0) {
      return this.shift()
    }

    if (index === this.count - 1) {
      return this.pop()
    }

    const node = this.findNode(index)
    if (!node) {
      return undefined
    }

    const prevNode = node.prev!
    const nextNode = node.next!

    prevNode.next = nextNode
    nextNode.prev = prevNode

    this.count--
    this.maybeRebuildJumpPointers()

    return node.value
  }

  indexOf(value: T): number {
    let current = this.head
    let index = 0

    while (current) {
      if (current.value === value) {
        return index
      }
      current = current.next
      index++
    }

    return -1
  }

  includes(value: T): boolean {
    return this.indexOf(value) !== -1
  }

  get size(): number {
    return this.count
  }

  get isEmpty(): boolean {
    return this.count === 0
  }

  clear(): void {
    this.head = null
    this.tail = null
    this.count = 0
    this.jumpPointers = []
  }

  toArray(): T[] {
    const result: T[] = []
    let current = this.head

    while (current) {
      result.push(current.value)
      current = current.next
    }

    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let current = this.head
    let index = 0

    while (current) {
      callback(current.value, index)
      current = current.next
      index++
    }
  }

  map<U>(callback: (value: T, index: number) => U): U[] {
    const result: U[] = []
    let current = this.head
    let index = 0

    while (current) {
      result.push(callback(current.value, index))
      current = current.next
      index++
    }

    return result
  }

  filter(callback: (value: T, index: number) => boolean): T[] {
    const result: T[] = []
    let current = this.head
    let index = 0

    while (current) {
      if (callback(current.value, index)) {
        result.push(current.value)
      }
      current = current.next
      index++
    }

    return result
  }

  [Symbol.iterator](): Iterator<T> {
    let current = this.head
    return {
      next(): IteratorResult<T> {
        if (!current) {
          return { done: true, value: undefined }
        }
        const value = current.value
        current = current.next
        return { done: false, value }
      }
    }
  }

  private findNode(index: number): Node<T> | null {
    if (!this.head) {
      return null
    }

    let current = this.head
    let currentIndex = 0

    if (this.jumpPointers.length > 0) {
      const jumpIndex = Math.floor(index / this.blockSize)
      if (jumpIndex > 0 && jumpIndex < this.jumpPointers.length) {
        const jumpNode = this.jumpPointers[jumpIndex]!
        current = jumpNode
        currentIndex = jumpIndex * this.blockSize
      }
    }

    while (current && currentIndex < index) {
      current = current.next!
      currentIndex++
    }

    return current
  }

  private maybeRebuildJumpPointers(): void {
    if (this.count <= this.blockSize) {
      this.jumpPointers = []
      return
    }

    this.jumpPointers = []
    let current = this.head
    let steps = 0

    while (current) {
      if (steps % this.blockSize === 0) {
        this.jumpPointers.push(current)
      }
      current = current.next
      steps++
    }
  }

  toString(): string {
    return `${JumpList}({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'JumpList', size: this.size, items: this.toArray() }
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

  slice(start?: number, end?: number): T[] {
    return this.toArray().slice(start, end)
  }

  drain(): T[] {
    const items = this.toArray()
    this.clear()
    return items
  }

  clone(): JumpList<T> {
    const c = new JumpList<T>()
    for (const item of this.toArray()) {
      c.push(item)
    }
    return c
  }


  static empty<T>(): JumpList<T> {
    return new JumpList<T>()
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    const i = index < 0 ? arr.length + index : index
    return arr[i]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
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
}
