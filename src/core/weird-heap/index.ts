import type { WeirdHeapOptions, WeirdHeapNode } from './types.js'
import { DEFAULT_WEIRD_HEAP_OPTIONS } from './types.js'

export class WeirdHeap<T = unknown> {
  private head: WeirdHeapNode<T> | null = null
  private _size = 0
  private compare: (a: T, b: T) => number

  constructor(options?: Partial<WeirdHeapOptions>) {
    const opts = { ...DEFAULT_WEIRD_HEAP_OPTIONS, ...options }
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

  insert(value: T): void {
    const node: WeirdHeapNode<T> = {
      value,
      rank: 0,
      parent: null,
      child: null,
      sibling: null,
      weird: false,
    }
    this.head = this.weirdUnion(this.head, node)
    this._size++
  }

  peek(): T | undefined {
    if (this.head === null) return undefined
    return this.findMinNode().value
  }

  extractMin(): T | undefined {
    if (this.head === null) return undefined

    const { prev: minPrev, node: minNode } = this.findMinNodeWithPrev()

    if (minPrev !== null) {
      minPrev.sibling = minNode.sibling
    } else {
      this.head = minNode.sibling
    }

    const childList = this.reverseChildList(minNode.child)
    if (childList !== null) {
      this.head = this.weirdUnion(this.head, childList)
    }
    this._size--

    return minNode.value
  }

  merge(other: WeirdHeap<T>): void {
    if (other.head === null) return
    this.head = this.weirdUnion(this.head, other.head)
    this._size += other._size
    other.clear()
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
    this.collectValues(this.head, result)
    return result
  }

  contains(value: T): boolean {
    return this.findNodeByValue(this.head, value) !== null
  }

  clone(): WeirdHeap<T> {
    const cloned = new WeirdHeap<T>()
    if (this.head === null) return cloned
    cloned.head = this.cloneTree(this.head)
    cloned._size = this._size
    return cloned
  }

  isValid(): boolean {
    if (this.head === null) return true
    let current: WeirdHeapNode<T> | null = this.head
    const ranks = new Set<number>()
    while (current !== null) {
      if (!this.isValidWeirdTree(current)) return false
      if (ranks.has(current.rank)) return false
      ranks.add(current.rank)
      if (current.sibling !== null && current.rank >= current.sibling.rank) {
        return false
      }
      current = current.sibling
    }
    return true
  }

  decreaseKey(oldValue: T, newValue: T): boolean {
    if (this.compare(newValue, oldValue) > 0) return false
    const node = this.findNodeByValue(this.head, oldValue)
    if (node === null) return false
    node.value = newValue
    node.weird = true
    this.bubbleUp(node)
    return true
  }

  delete(value: T): boolean {
    const node = this.findNodeByValue(this.head, value)
    if (node === null) return false
    node.weird = true
    const rootNode = this.bubbleToRoot(node)
    const { prev } = this.findRootNode(rootNode)
    if (prev !== null) {
      prev.sibling = rootNode.sibling
    } else {
      this.head = rootNode.sibling
    }
    const childList = this.reverseChildList(rootNode.child)
    if (childList !== null) {
      this.head = this.weirdUnion(this.head, childList)
    }
    this._size--
    return true
  }

  private weirdUnion(
    h1: WeirdHeapNode<T> | null,
    h2: WeirdHeapNode<T> | null
  ): WeirdHeapNode<T> | null {
    if (h1 === null) return h2
    if (h2 === null) return h1

    let mergedHead: WeirdHeapNode<T>
    let a: WeirdHeapNode<T> | null = h1
    let b: WeirdHeapNode<T> | null = h2

    if (a.rank <= b.rank) {
      mergedHead = a
      a = a.sibling
    } else {
      mergedHead = b
      b = b.sibling
    }

    let tail = mergedHead

    while (a !== null && b !== null) {
      if (a.rank <= b.rank) {
        tail.sibling = a
        a = a.sibling
      } else {
        tail.sibling = b
        b = b.sibling
      }
      tail = tail.sibling!
    }

    tail.sibling = a !== null ? a : b

    return this.weirdConsolidate(mergedHead)
  }

  private weirdConsolidate(head: WeirdHeapNode<T>): WeirdHeapNode<T> {
    if (head.sibling === null) return head

    let prev: WeirdHeapNode<T> | null = null
    let current: WeirdHeapNode<T> = head
    let next: WeirdHeapNode<T> | null = current.sibling

    while (next !== null) {
      const mergeNext =
        next.sibling !== null && next.sibling.rank === current.rank

      if (current.rank !== next.rank) {
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
          this.weirdLink(current, next)
        } else {
          if (prev === null) {
            head = next
          } else {
            prev.sibling = next
          }
          this.weirdLink(next, current)
          current = next
        }
        next = current.sibling
      }
    }

    return head
  }

  private weirdLink(
    parent: WeirdHeapNode<T>,
    child: WeirdHeapNode<T>
  ): void {
    child.parent = parent
    child.sibling = parent.child
    parent.child = child
    parent.rank++
    if (child.weird) {
      parent.weird = true
    }
  }

  private findMinNode(): WeirdHeapNode<T> {
    let min: WeirdHeapNode<T> = this.head!
    let current: WeirdHeapNode<T> | null = this.head!.sibling
    while (current !== null) {
      if (this.compare(current.value, min.value) < 0) {
        min = current
      }
      current = current.sibling
    }
    return min
  }

  private findMinNodeWithPrev(): {
    prev: WeirdHeapNode<T> | null
    node: WeirdHeapNode<T>
  } {
    let minPrev: WeirdHeapNode<T> | null = null
    let minNode: WeirdHeapNode<T> = this.head!
    let prev: WeirdHeapNode<T> | null = null
    let current: WeirdHeapNode<T> | null = this.head!
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

  private reverseChildList(
    node: WeirdHeapNode<T> | null
  ): WeirdHeapNode<T> | null {
    if (node === null) return null
    let prev: WeirdHeapNode<T> | null = null
    let current: WeirdHeapNode<T> | null = node
    while (current !== null) {
      const next: WeirdHeapNode<T> | null = current.sibling
      current.sibling = prev
      current.parent = null
      prev = current
      current = next
    }
    return prev
  }

  private bubbleUp(node: WeirdHeapNode<T>): void {
    let current = node
    while (current.parent !== null) {
      if (this.compare(current.value, current.parent.value) < 0) {
        const temp = current.value
        current.value = current.parent.value
        current.parent.value = temp

        const tempWeird = current.weird
        current.weird = current.parent.weird
        current.parent.weird = tempWeird

        current = current.parent
      } else {
        break
      }
    }
  }

  private bubbleToRoot(node: WeirdHeapNode<T>): WeirdHeapNode<T> {
    let current = node
    while (current.parent !== null) {
      const temp = current.value
      current.value = current.parent.value
      current.parent.value = temp

      const tempWeird = current.weird
      current.weird = current.parent.weird
      current.parent.weird = tempWeird

      current = current.parent
    }
    return current
  }

  private findRootNode(
    target: WeirdHeapNode<T>
  ): { prev: WeirdHeapNode<T> | null; node: WeirdHeapNode<T> } {
    let prev: WeirdHeapNode<T> | null = null
    let current: WeirdHeapNode<T> | null = this.head!
    while (current !== null) {
      if (current === target) {
        return { prev, node: current }
      }
      prev = current
      current = current.sibling
    }
    return { prev: null, node: target }
  }

  private collectValues(root: WeirdHeapNode<T> | null, result: T[]): void {
    let current = root
    while (current !== null) {
      result.push(current.value)
      this.collectValues(current.child, result)
      current = current.sibling
    }
  }

  private findNodeByValue(
    root: WeirdHeapNode<T> | null,
    value: T
  ): WeirdHeapNode<T> | null {
    let current = root
    while (current !== null) {
      if (current.value === value) return current
      const childResult = this.findNodeByValue(current.child, value)
      if (childResult !== null) return childResult
      current = current.sibling
    }
    return null
  }

  private cloneTree(
    root: WeirdHeapNode<T> | null
  ): WeirdHeapNode<T> | null {
    if (root === null) return null
    const node: WeirdHeapNode<T> = {
      value: root.value,
      rank: root.rank,
      parent: null,
      child: this.cloneTree(root.child),
      sibling: this.cloneTree(root.sibling),
      weird: root.weird,
    }
    if (node.child !== null) {
      this.setParent(node.child, node)
    }
    return node
  }

  private setParent(
    child: WeirdHeapNode<T>,
    parent: WeirdHeapNode<T>
  ): void {
    let current: WeirdHeapNode<T> | null = child
    while (current !== null) {
      current.parent = parent
      current = current.sibling
    }
  }

  private isValidWeirdTree(node: WeirdHeapNode<T>): boolean {
    let child: WeirdHeapNode<T> | null = node.child
    let expectedRank = node.rank - 1
    while (child !== null) {
      if (child.rank !== expectedRank) return false
      if (this.compare(child.value, node.value) < 0) return false
      if (!this.isValidWeirdTree(child)) return false
      expectedRank--
      child = child.sibling
    }
    return true
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }

  forEach(callback: (item: T, index: number) => void): void {
    let i = 0
    for (const item of this) {
      callback(item, i++)
    }
  }

  toJSON() {
    return { type: 'WeirdHeap', items: this.toArray() }
  }

  toString(): string {
    return `WeirdHeap({ size: ${this._size} })`
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
}

export { DEFAULT_WEIRD_HEAP_OPTIONS } from './types.js'
export type { WeirdHeapOptions, WeirdHeapNode } from './types.js'
