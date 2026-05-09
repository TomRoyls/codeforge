import type { SkewHeapOptions, SkewHeapNode } from "./types.js"

const DEFAULT_COMPARATOR = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export class SkewHeap<T> {
  private _root: SkewHeapNode<T> | null
  private _size: number
  private readonly _comparator: (a: T, b: T) => number

  constructor(options?: SkewHeapOptions<T>) {
    this._root = null
    this._size = 0
    this._comparator = options?.comparator ?? DEFAULT_COMPARATOR
  }

  insert(value: T): void {
    const node: SkewHeapNode<T> = {
      value,
      left: null,
      right: null,
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

  merge(other: SkewHeap<T>): SkewHeap<T> {
    const result = new SkewHeap<T>({ comparator: this._comparator })
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
    const tempHeap = new SkewHeap<T>({ comparator: this._comparator })
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

  clone(): SkewHeap<T> {
    const result = new SkewHeap<T>({ comparator: this._comparator })
    result._root = this._cloneNode(this._root)
    result._size = this._size
    return result
  }

  isValid(): boolean {
    if (this._root === null) return true
    return this._isValidNode(this._root)
  }

  private _mergeNodes(
    a: SkewHeapNode<T> | null,
    b: SkewHeapNode<T> | null,
  ): SkewHeapNode<T> | null {
    if (a === null) return b
    if (b === null) return a

    if (this._comparator(a.value, b.value) > 0) {
      const temp = a
      a = b
      b = temp
    }

    const node: SkewHeapNode<T> = {
      value: a.value,
      left: a.left,
      right: this._mergeNodes(a.right, b),
    }

    const temp = node.left
    node.left = node.right
    node.right = temp

    return node
  }

  private _cloneNode(node: SkewHeapNode<T> | null): SkewHeapNode<T> | null {
    if (node === null) return null
    return {
      value: node.value,
      left: this._cloneNode(node.left),
      right: this._cloneNode(node.right),
    }
  }

  private _containsInNode(node: SkewHeapNode<T> | null, value: T): boolean {
    if (node === null) return false
    if (this._comparator(node.value, value) === 0) return true
    if (this._comparator(value, node.value) < 0) return false
    return (
      this._containsInNode(node.left, value) ||
      this._containsInNode(node.right, value)
    )
  }

  private _isValidNode(node: SkewHeapNode<T>): boolean {
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
