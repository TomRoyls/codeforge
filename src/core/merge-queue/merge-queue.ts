import type { MergeQueueOptions, MergeNode } from "./types.js"

const DEFAULT_COMPARATOR = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class MergeQueue<T> {
  private _root: MergeNode<T> | null
  private _size: number
  private readonly _comparator: (a: T, b: T) => number

  constructor(options?: MergeQueueOptions<T>) {
    this._root = null
    this._size = 0
    this._comparator = options?.comparator ?? DEFAULT_COMPARATOR
  }

  enqueue(item: T): void {
    const node: MergeNode<T> = {
      value: item,
      left: null,
      right: null,
      rank: 1,
    }
    this._root = this._mergeNodes(this._root, node)
    this._size++
  }

  dequeue(): T | undefined {
    if (this._root === null) return undefined
    const value = this._root.value
    this._root = this._mergeNodes(this._root.left, this._root.right)
    this._size--
    return value
  }

  peek(): T | undefined {
    if (this._root === null) return undefined
    return this._root.value
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._root = null
    this._size = 0
  }

  merge(other: MergeQueue<T>): MergeQueue<T> {
    const result = new MergeQueue<T>({ comparator: this._comparator })
    result._root = this._cloneNode(this._root)
    result._size = this._size
    const otherRoot = this._cloneNode(other._root)
    result._root = this._mergeNodes(result._root, otherRoot)
    result._size = this._size + other._size
    return result
  }

  enqueueMany(items: Iterable<T>): void {
    for (const item of items) {
      this.enqueue(item)
    }
  }

  dequeueMany(count: number): T[] {
    const result: T[] = []
    for (let i = 0; i < count && this._size > 0; i++) {
      const val = this.dequeue()
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  toArray(): T[] {
    const result: T[] = []
    const temp = this._cloneNode(this._root)
    const tempQueue = new MergeQueue<T>({ comparator: this._comparator })
    tempQueue._root = temp
    tempQueue._size = this._size
    while (!tempQueue.isEmpty()) {
      const val = tempQueue.dequeue()
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  static fromArray<U>(items: Iterable<U>, options?: MergeQueueOptions<U>): MergeQueue<U> {
    const queue = new MergeQueue<U>(options)
    queue.enqueueMany(items)
    return queue
  }

  contains(item: T): boolean {
    return this._containsInNode(this._root, item)
  }

  remove(item: T): boolean {
    const result = this._removeFromNode(this._root, item)
    if (result.removed) {
      this._root = result.node
      this._size--
      return true
    }
    return false
  }

  decreaseKey(oldValue: T, newValue: T): boolean {
    const values = this.toArray()
    let found = false
    for (let i = 0; i < values.length; i++) {
      if (!found && this._comparator(values[i]!, oldValue) === 0) {
        values[i] = newValue
        found = true
      }
    }
    if (!found) return false
    this._root = null
    this._size = 0
    for (const v of values) {
      this.enqueue(v)
    }
    return true
  }

  clone(): MergeQueue<T> {
    const result = new MergeQueue<T>({ comparator: this._comparator })
    result._root = this._cloneNode(this._root)
    result._size = this._size
    return result
  }

  isValid(): boolean {
    if (this._root === null) return true
    return this._isValidNode(this._root)
  }

  private _mergeNodes(
    a: MergeNode<T> | null,
    b: MergeNode<T> | null,
  ): MergeNode<T> | null {
    if (a === null) return b
    if (b === null) return a

    if (this._comparator(a.value, b.value) > 0) {
      const temp = a
      a = b
      b = temp
    }

    const node: MergeNode<T> = {
      value: a.value,
      left: a.left,
      right: this._mergeNodes(a.right, b),
      rank: a.rank,
    }

    const leftRank = node.left !== null ? node.left.rank : 0
    const rightRank = node.right !== null ? node.right.rank : 0

    if (leftRank < rightRank) {
      const temp = node.left
      node.left = node.right
      node.right = temp
    }

    const newRightRank = node.right !== null ? node.right.rank : 0
    const newLeftRank = node.left !== null ? node.left.rank : 0
    node.rank = Math.min(newLeftRank, newRightRank) + 1

    return node
  }

  private _cloneNode(node: MergeNode<T> | null): MergeNode<T> | null {
    if (node === null) return null
    return {
      value: node.value,
      left: this._cloneNode(node.left),
      right: this._cloneNode(node.right),
      rank: node.rank,
    }
  }

  private _containsInNode(node: MergeNode<T> | null, item: T): boolean {
    if (node === null) return false
    if (this._comparator(node.value, item) === 0) return true
    if (this._comparator(item, node.value) < 0) return false
    return (
      this._containsInNode(node.left, item) ||
      this._containsInNode(node.right, item)
    )
  }

  private _removeFromNode(
    node: MergeNode<T> | null,
    item: T,
  ): { node: MergeNode<T> | null; removed: boolean } {
    if (node === null) return { node: null, removed: false }

    if (this._comparator(node.value, item) === 0) {
      return {
        node: this._mergeNodes(node.left, node.right),
        removed: true,
      }
    }

    if (this._comparator(item, node.value) < 0) {
      return { node, removed: false }
    }

    const leftResult = this._removeFromNode(node.left, item)
    if (leftResult.removed) {
      const newNode: MergeNode<T> = {
        value: node.value,
        left: leftResult.node,
        right: node.right,
        rank: node.rank,
      }
      this._updateRank(newNode)
      return { node: newNode, removed: true }
    }

    const rightResult = this._removeFromNode(node.right, item)
    if (rightResult.removed) {
      const newNode: MergeNode<T> = {
        value: node.value,
        left: node.left,
        right: rightResult.node,
        rank: node.rank,
      }
      this._updateRank(newNode)
      return { node: newNode, removed: true }
    }

    return { node, removed: false }
  }

  private _updateRank(node: MergeNode<T>): void {
    const leftRank = node.left !== null ? node.left.rank : 0
    const rightRank = node.right !== null ? node.right.rank : 0
    if (leftRank < rightRank) {
      const temp = node.left
      node.left = node.right
      node.right = temp
    }
    const newLeftRank = node.left !== null ? node.left.rank : 0
    const newRightRank = node.right !== null ? node.right.rank : 0
    node.rank = Math.min(newLeftRank, newRightRank) + 1
  }

  private _isValidNode(node: MergeNode<T>): boolean {
    const leftRank = node.left !== null ? node.left.rank : 0
    const rightRank = node.right !== null ? node.right.rank : 0

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
}
