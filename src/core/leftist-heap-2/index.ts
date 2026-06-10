import type {
  Comparator,
  ForEachCallback,
  LeftistHeapOptions,
  LeftistHeapNode,
  LeftistHeapHandle,
} from './types.js'

const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class LeftistHeap<T> {
  private _root: LeftistHeapNode<T> | null
  private _size: number
  private readonly _comparator: Comparator<T>

  constructor()
  constructor(elements: T[])
  constructor(options: LeftistHeapOptions<T>)
  constructor(elements: T[], options: LeftistHeapOptions<T>)
  constructor(arg1?: T[] | LeftistHeapOptions<T>, arg2?: LeftistHeapOptions<T>) {
    let elements: T[] | undefined
    let comparator: Comparator<T> | undefined

    if (Array.isArray(arg1)) {
      elements = arg1
      comparator = arg2?.comparator
    } else if (arg1 !== undefined) {
      elements = arg1.elements
      comparator = arg1.comparator
    }

    this._comparator = comparator ?? defaultComparator
    this._root = null
    this._size = 0

    if (elements) {
      for (const el of elements) {
        this.insert(el)
      }
    }
  }

  private static _rank<T>(node: LeftistHeapNode<T> | null): number {
    return node === null ? 0 : node.rank
  }

  private _mergeNodes(
    a: LeftistHeapNode<T> | null,
    b: LeftistHeapNode<T> | null,
  ): LeftistHeapNode<T> | null {
    if (a === null) return b
    if (b === null) return a

    if (this._comparator(a.value, b.value) > 0) {
      const tmp = a
      a = b
      b = tmp
    }

    a.right = this._mergeNodes(a.right, b)

    if (LeftistHeap._rank(a.left) < LeftistHeap._rank(a.right)) {
      const tmp = a.left
      a.left = a.right
      a.right = tmp
    }

    a.rank = LeftistHeap._rank(a.right) + 1
    return a
  }

  insert(value: T): LeftistHeapHandle<T> {
    const handle: LeftistHeapHandle<T> = { value }
    const node: LeftistHeapNode<T> = {
      value,
      left: null,
      right: null,
      rank: 1,
      handle,
    }
    this._root = this._mergeNodes(this._root, node)
    this._size++
    return handle
  }

  extractMin(): T {
    if (this._root === null) {
      throw new Error('extractMin called on empty heap')
    }
    const min = this._root.value
    this._root = this._mergeNodes(this._root.left, this._root.right)
    this._size--
    return min
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

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._root = null
    this._size = 0
  }

  merge(other: LeftistHeap<T>): LeftistHeap<T> {
    const result = new LeftistHeap<T>({ comparator: this._comparator })
    result._root = this._cloneNode(this._root)
    result._size = this._size
    const otherClone = this._cloneNode(other._root)
    result._root = this._mergeNodes(result._root, otherClone)
    result._size = this._size + other._size
    return result
  }

  toArray(): T[] {
    const result: T[] = []
    const temp = new LeftistHeap<T>({ comparator: this._comparator })
    temp._root = this._cloneNode(this._root)
    temp._size = this._size
    while (!temp.isEmpty()) {
      result.push(temp.extractMin())
    }
    return result
  }

  toSortedArray(): T[] {
    return this.toArray()
  }

  contains(value: T): boolean {
    return this._containsIn(this._root, value)
  }

  private _containsIn(node: LeftistHeapNode<T> | null, value: T): boolean {
    if (node === null) return false
    const cmp = this._comparator(node.value, value)
    if (cmp === 0) return true
    if (cmp > 0) return false
    return this._containsIn(node.left, value) || this._containsIn(node.right, value)
  }

  decreaseKey(handle: LeftistHeapHandle<T>, newValue: T): void {
    if (this._comparator(newValue, handle.value) > 0) {
      throw new Error('newValue must be less than or equal to oldValue')
    }
    const node = this._findNodeByHandle(this._root, handle)
    if (node === null) {
      throw new Error('handle not found in heap')
    }
    node.value = newValue
    handle.value = newValue
    this._root = this._rebuildPreservingHandles(this._root)
  }

  delete(handle: LeftistHeapHandle<T>): boolean {
    const node = this._findNodeByHandle(this._root, handle)
    if (node === null) return false
    const remaining: LeftistHeapNode<T>[] = []
    this._collectNodesExcept(this._root, node.handle, remaining)
    this._size = remaining.length
    this._root = this._mergeAllNodes(remaining)
    return true
  }

  clone(): LeftistHeap<T> {
    const result = new LeftistHeap<T>({ comparator: this._comparator })
    result._root = this._cloneNode(this._root)
    result._size = this._size
    return result
  }

  forEach(callback: ForEachCallback<T>): void {
    let idx = 0
    this._inOrder(this._root, (val) => {
      callback(val, idx++)
    })
  }

  private _inOrder(node: LeftistHeapNode<T> | null, fn: (val: T) => void): void {
    if (node === null) return
    this._inOrder(node.left, fn)
    fn(node.value)
    this._inOrder(node.right, fn)
  }

  *[Symbol.iterator](): Iterator<T> {
    const temp = new LeftistHeap<T>({ comparator: this._comparator })
    temp._root = this._cloneNode(this._root)
    temp._size = this._size
    while (!temp.isEmpty()) {
      yield temp.extractMin()
    }
  }

  static fromArray<U>(elements: U[], comparator?: Comparator<U>): LeftistHeap<U> {
    return new LeftistHeap<U>({ elements, comparator })
  }

  static merge<U>(a: LeftistHeap<U>, b: LeftistHeap<U>): LeftistHeap<U> {
    return a.merge(b)
  }

  private _cloneNode(node: LeftistHeapNode<T> | null): LeftistHeapNode<T> | null {
    if (node === null) return null
    const clonedHandle: LeftistHeapHandle<T> = { value: node.value }
    return {
      value: node.value,
      left: this._cloneNode(node.left),
      right: this._cloneNode(node.right),
      rank: node.rank,
      handle: clonedHandle,
    }
  }

  private _findNodeByHandle(
    node: LeftistHeapNode<T> | null,
    handle: LeftistHeapHandle<T>,
  ): LeftistHeapNode<T> | null {
    if (node === null) return null
    if (node.handle === handle) return node
    const left = this._findNodeByHandle(node.left, handle)
    if (left !== null) return left
    return this._findNodeByHandle(node.right, handle)
  }

  private _collectNodesExcept(
    node: LeftistHeapNode<T> | null,
    exclude: LeftistHeapHandle<T>,
    out: LeftistHeapNode<T>[],
  ): void {
    if (node === null) return
    const left = node.left
    const right = node.right
    if (node.handle !== exclude) {
      node.left = null
      node.right = null
      node.rank = 1
      out.push(node)
    }
    this._collectNodesExcept(left, exclude, out)
    this._collectNodesExcept(right, exclude, out)
  }

  private _rebuildPreservingHandles(node: LeftistHeapNode<T> | null): LeftistHeapNode<T> | null {
    if (node === null) return null
    const nodes: LeftistHeapNode<T>[] = []
    this._collectAllNodes(node, nodes)
    return this._mergeAllNodes(nodes)
  }

  private _collectAllNodes(
    node: LeftistHeapNode<T> | null,
    out: LeftistHeapNode<T>[],
  ): void {
    if (node === null) return
    out.push(node)
    this._collectAllNodes(node.left, out)
    this._collectAllNodes(node.right, out)
  }

  private _mergeAllNodes(nodes: LeftistHeapNode<T>[]): LeftistHeapNode<T> | null {
    for (const n of nodes) {
      n.left = null
      n.right = null
      n.rank = 1
    }
    let root: LeftistHeapNode<T> | null = null
    for (const n of nodes) {
      root = this._mergeNodes(root, n)
    }
    return root
  }

  isValid(): boolean {
    if (this._root === null) return true
    return this._isValidNode(this._root)
  }

  private _isValidNode(node: LeftistHeapNode<T>): boolean {
    const leftRank = LeftistHeap._rank(node.left)
    const rightRank = LeftistHeap._rank(node.right)

    if (leftRank < rightRank) return false

    const expectedRank = Math.min(leftRank, rightRank) + 1
    if (node.rank !== expectedRank) return false

    if (node.left !== null) {
      if (this._comparator(node.value, node.left.value) > 0) return false
      if (!this._isValidNode(node.left)) return false
    }

    if (node.right !== null) {
      if (this._comparator(node.value, node.right.value) > 0) return false
      if (!this._isValidNode(node.right)) return false
    }

    return true
  }

  has(value: T): boolean {
    return this.contains(value)
  }

  toString(): string {
    return `LeftistHeap({ size: ${this.size} })`
  }

  toJSON() {
    return { type: 'LeftistHeap', size: this.size, items: this.toArray() }
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

  static empty<T>(): LeftistHeap<T> {
    return new LeftistHeap<T>()
  }
}
