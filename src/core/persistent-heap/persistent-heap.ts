import type { PersistentHeapOptions, PersistentHeapNode } from './types.js'

const DEFAULT_COMPARATOR = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function getRank<T>(node: PersistentHeapNode<T> | undefined): number {
  return node ? node.rank : 0
}

function mergeNodes<T>(
  a: PersistentHeapNode<T> | undefined,
  b: PersistentHeapNode<T> | undefined,
  comparator: (a: T, b: T) => number,
): PersistentHeapNode<T> | undefined {
  if (!a) return b
  if (!b) return a

  if (comparator(a.value, b.value) > 0) {
    const temp = a
    a = b
    b = temp
  }

  const node: PersistentHeapNode<T> = {
    value: a.value,
    left: a.left,
    right: mergeNodes(a.right, b, comparator),
    rank: 0,
  }

  const leftRank = getRank(node.left)
  const rightRank = getRank(node.right)

  if (leftRank < rightRank) {
    const temp = node.left
    node.left = node.right
    node.right = temp
  }

  node.rank = 1 + Math.min(getRank(node.left), getRank(node.right))

  return node
}

function collectValues<T>(node: PersistentHeapNode<T> | undefined, items: T[]): void {
  if (!node) return
  items.push(node.value)
  collectValues(node.left, items)
  collectValues(node.right, items)
}

export class PersistentHeap<T> {
  private readonly _root: PersistentHeapNode<T> | undefined
  private readonly _size: number
  private readonly _comparator: (a: T, b: T) => number

  constructor(options?: PersistentHeapOptions<T>)
  constructor(
    rootOrOptions: PersistentHeapNode<T> | undefined,
    size: number,
    comparator: (a: T, b: T) => number,
  )
  constructor(
    rootOrOptions?: PersistentHeapNode<T> | PersistentHeapOptions<T>,
    size?: number,
    comparator?: (a: T, b: T) => number,
  ) {
    if (typeof size === 'number' && comparator) {
      this._root = rootOrOptions as PersistentHeapNode<T> | undefined
      this._size = size
      this._comparator = comparator
    } else {
      const opts = rootOrOptions as PersistentHeapOptions<T> | undefined
      this._root = undefined
      this._size = 0
      this._comparator = opts?.comparator ?? DEFAULT_COMPARATOR
    }
  }

  insert(value: T): PersistentHeap<T> {
    const node: PersistentHeapNode<T> = {
      value,
      rank: 1,
    }
    const newRoot = mergeNodes(this._root, node, this._comparator)
    return new PersistentHeap(newRoot, this._size + 1, this._comparator)
  }

  deleteMin(): { value: T; heap: PersistentHeap<T> } | undefined {
    if (!this._root) return undefined
    const newRoot = mergeNodes(this._root.left, this._root.right, this._comparator)
    return {
      value: this._root.value,
      heap: new PersistentHeap(newRoot, this._size - 1, this._comparator),
    }
  }

  peek(): T | undefined {
    if (!this._root) return undefined
    return this._root.value
  }

  merge(other: PersistentHeap<T>): PersistentHeap<T> {
    const newRoot = mergeNodes(this._root, other._root, this._comparator)
    return new PersistentHeap(newRoot, this._size + other._size, this._comparator)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  toArray(): T[] {
    if (!this._root) return []
    const items: T[] = []
    collectValues(this._root, items)
    items.sort(this._comparator)
    return items
  }

  forEach(callback: (value: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const arr = this.toArray()
    for (const item of arr) {
      yield item
    }
  }

  static from<U>(array: U[], options?: PersistentHeapOptions<U>): PersistentHeap<U> {
    let heap = new PersistentHeap<U>(options)
    for (const item of array) {
      heap = heap.insert(item)
    }
    return heap
  }

  clone(): PersistentHeap<T> {
    return new PersistentHeap(this._root, this._size, this._comparator)
  }

  isValid(): boolean {
    if (!this._root) return true
    return this._isValidNode(this._root)
  }

  private _isValidNode(node: PersistentHeapNode<T>): boolean {
    const leftRank = getRank(node.left)
    const rightRank = getRank(node.right)

    if (leftRank < rightRank) return false

    const expectedRank = 1 + Math.min(leftRank, rightRank)
    if (node.rank !== expectedRank) return false

    if (node.left) {
      if (this._comparator(node.value, node.left.value) > 0) return false
      if (!this._isValidNode(node.left)) return false
    }

    if (node.right) {
      if (this._comparator(node.value, node.right.value) > 0) return false
      if (!this._isValidNode(node.right)) return false
    }

    return true
  }
}

export type { PersistentHeapOptions, PersistentHeapNode } from './types.js'
