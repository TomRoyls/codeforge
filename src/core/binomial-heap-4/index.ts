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

}
