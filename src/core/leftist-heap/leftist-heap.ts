import type { LeftistHeapOptions, LeftistHeapNode } from "./types.js"

const DEFAULT_COMPARATOR = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class LeftistHeap<T> {
  private _root: LeftistHeapNode<T> | null
  private _size: number
  private readonly _comparator: (a: T, b: T) => number

  constructor(options?: LeftistHeapOptions<T>) {
    this._root = null
    this._size = 0
    this._comparator = options?.comparator ?? DEFAULT_COMPARATOR
  }

  insert(value: T): void {
    const node: LeftistHeapNode<T> = {
      value,
      left: null,
      right: null,
      npl: 1,
    }
    this._root = this._mergeNodes(this._root, node)
    this._size++
  }

  extractMin(): T | undefined {
    if (this._root === null) return undefined
    const minValue = this._root.value
    this._root = this._mergeNodes(this._root.left, this._root.right)
    this._size--
    return minValue
  }

  peek(): T | undefined {
    if (this._root === null) return undefined
    return this._root.value
  }

  merge(other: LeftistHeap<T>): LeftistHeap<T> {
    const result = new LeftistHeap<T>({ comparator: this._comparator })
    result._root = this._cloneNode(this._root)
    result._size = this._size
    const otherRoot = this._cloneNode(other._root)
    result._root = this._mergeNodes(result._root, otherRoot)
    result._size = this._size + other._size
    return result
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

  toArray(): T[] {
    const result: T[] = []
    const temp = this._cloneNode(this._root)
    const tempHeap = new LeftistHeap<T>({ comparator: this._comparator })
    tempHeap._root = temp
    tempHeap._size = this._size
    while (!tempHeap.isEmpty()) {
      const val = tempHeap.extractMin()
      if (val !== undefined) {
        result.push(val)
      }
    }
    return result
  }

  contains(value: T): boolean {
    return this._containsInNode(this._root, value)
  }

  clone(): LeftistHeap<T> {
    const result = new LeftistHeap<T>({ comparator: this._comparator })
    result._root = this._cloneNode(this._root)
    result._size = this._size
    return result
  }

  isValid(): boolean {
    if (this._root === null) return true
    return this._isValidNode(this._root)
  }

  private _mergeNodes(
    a: LeftistHeapNode<T> | null,
    b: LeftistHeapNode<T> | null,
  ): LeftistHeapNode<T> | null {
    if (a === null) return b
    if (b === null) return a

    if (this._comparator(a.value, b.value) > 0) {
      const temp = a
      a = b
      b = temp
    }

    const node: LeftistHeapNode<T> = {
      value: a.value,
      left: a.left,
      right: this._mergeNodes(a.right, b),
      npl: a.npl,
    }

    const leftNpl = node.left !== null ? node.left.npl : 0
    const rightNpl = node.right !== null ? node.right.npl : 0

    if (leftNpl < rightNpl) {
      const temp = node.left
      node.left = node.right
      node.right = temp
    }

    const newRightNpl = node.right !== null ? node.right.npl : 0
    const newLeftNpl = node.left !== null ? node.left.npl : 0
    node.npl = Math.min(newLeftNpl, newRightNpl) + 1

    return node
  }

  private _cloneNode(node: LeftistHeapNode<T> | null): LeftistHeapNode<T> | null {
    if (node === null) return null
    return {
      value: node.value,
      left: this._cloneNode(node.left),
      right: this._cloneNode(node.right),
      npl: node.npl,
    }
  }

  private _containsInNode(node: LeftistHeapNode<T> | null, value: T): boolean {
    if (node === null) return false
    if (this._comparator(node.value, value) === 0) return true
    if (this._comparator(value, node.value) < 0) return false
    return (
      this._containsInNode(node.left, value) ||
      this._containsInNode(node.right, value)
    )
  }

  private _isValidNode(node: LeftistHeapNode<T>): boolean {
    const leftNpl = node.left !== null ? node.left.npl : 0
    const rightNpl = node.right !== null ? node.right.npl : 0

    if (leftNpl < rightNpl) return false

    const expectedNpl = Math.min(leftNpl, rightNpl) + 1
    if (node.npl !== expectedNpl) return false

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
