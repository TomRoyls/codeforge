import type { PagodaHeapOptions, PagodaNode } from './types.js'

export class PagodaHeap<T = unknown> {
  private root: PagodaNode<T> | null = null
  private _size: number = 0
  private compare: (a: T, b: T) => number

  constructor(options?: PagodaHeapOptions<T>) {
    this.compare =
      options?.comparator ??
      ((a: T, b: T) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
  }

  push(item: T): void {
    const node: PagodaNode<T> = { value: item, left: null, right: null, parent: null }
    this.root = this.mergeNodes(this.root, node)
    this._size++
  }

  pop(): T {
    if (!this.root) throw new Error('Heap is empty')
    const value = this.root.value
    if (this.root.left) this.root.left.parent = null
    if (this.root.right) this.root.right.parent = null
    this.root = this.mergeNodes(this.root.left, this.root.right)
    this._size--
    return value
  }

  peek(): T {
    if (!this.root) throw new Error('Heap is empty')
    return this.root.value
  }

  merge(other: PagodaHeap<T>): void {
    if (other === this) return
    this.root = this.mergeNodes(this.root, other.root)
    this._size += other._size
    other.root = null
    other._size = 0
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  toArray(): T[] {
    const result: T[] = []
    this.collectAll(this.root, result)
    result.sort(this.compare)
    return result
  }

  contains(item: T): boolean {
    return this.findNode(this.root, item) !== null
  }

  remove(item: T): boolean {
    const node = this.findNode(this.root, item)
    if (!node) return false
    this.root = this.extractNode(node)
    this._size--
    return true
  }

  decreaseKey(item: T, newPriority: T): boolean {
    if (!this.remove(item)) return false
    this.push(newPriority)
    return true
  }

  clone(): PagodaHeap<T> {
    const cloned = new PagodaHeap<T>({ comparator: this.compare })
    cloned.root = this.cloneTree(this.root, null)
    cloned._size = this._size
    return cloned
  }

  static fromArray<U>(items: U[], options?: PagodaHeapOptions<U>): PagodaHeap<U> {
    const heap = new PagodaHeap<U>(options)
    for (const item of items) {
      heap.push(item)
    }
    return heap
  }

  private mergeNodes(
    a: PagodaNode<T> | null,
    b: PagodaNode<T> | null,
  ): PagodaNode<T> | null {
    if (!a) return b
    if (!b) return a
    return this.skewMerge(a, b)
  }

  private skewMerge(a: PagodaNode<T>, b: PagodaNode<T>): PagodaNode<T> {
    const stack: PagodaNode<T>[] = []
    let pa: PagodaNode<T> | null = a
    let pb: PagodaNode<T> | null = b

    while (pa && pb) {
      if (this.compare(pa.value, pb.value) > 0) {
        const tmp: PagodaNode<T> | null = pa
        pa = pb
        pb = tmp
      }
      stack.push(pa)
      pa = pa.right
    }

    let result: PagodaNode<T> | null = pa ?? pb

    while (stack.length > 0) {
      const node = stack.pop()!
      node.right = node.left
      node.left = result
      if (result) result.parent = node
      result = node
      node.parent = null
    }

    return result!
  }

  private extractNode(node: PagodaNode<T>): PagodaNode<T> | null {
    const leftChild = node.left
    const rightChild = node.right

    if (leftChild) leftChild.parent = null
    if (rightChild) rightChild.parent = null
    node.left = null
    node.right = null

    const merged = this.mergeNodes(leftChild, rightChild)

    if (node === this.root) {
      return merged
    }

    const parent = node.parent!
    if (parent.left === node) {
      parent.left = merged
    } else {
      parent.right = merged
    }
    if (merged) merged.parent = parent

    let current: PagodaNode<T> = parent
    while (current.parent) {
      current = current.parent
    }
    return current
  }

  private findNode(node: PagodaNode<T> | null, item: T): PagodaNode<T> | null {
    if (!node) return null
    if (this.compare(node.value, item) === 0) return node
    const leftResult = this.findNode(node.left, item)
    if (leftResult) return leftResult
    return this.findNode(node.right, item)
  }

  private collectAll(node: PagodaNode<T> | null, result: T[]): void {
    if (!node) return
    this.collectAll(node.left, result)
    result.push(node.value)
    this.collectAll(node.right, result)
  }

  private cloneTree(
    node: PagodaNode<T> | null,
    parent: PagodaNode<T> | null,
  ): PagodaNode<T> | null {
    if (!node) return null
    const cloned: PagodaNode<T> = {
      value: node.value,
      left: null,
      right: null,
      parent,
    }
    cloned.left = this.cloneTree(node.left, cloned)
    cloned.right = this.cloneTree(node.right, cloned)
    return cloned
  }
}

export type { PagodaHeapOptions, PagodaNode } from './types.js'
