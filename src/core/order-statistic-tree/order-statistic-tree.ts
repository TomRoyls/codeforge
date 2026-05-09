import type { OSTNode, OrderStatisticTreeOptions } from './types.js'
import { defaultComparator } from './types.js'

export class OrderStatisticTree<T> {
  private root: OSTNode<T> | null = null
  private _size: number = 0
  private compare: (a: T, b: T) => number

  constructor(options?: OrderStatisticTreeOptions<T>) {
    this.compare = options?.comparator ?? (defaultComparator as (a: T, b: T) => number)
  }

  private nodeSize(node: OSTNode<T> | null): number {
    return node === null ? 0 : node.size
  }

  private updateSize(node: OSTNode<T>): void {
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private rotateRight(y: OSTNode<T>): OSTNode<T> {
    const x = y.left!
    const t2 = x.right
    x.right = y
    y.left = t2
    this.updateSize(y)
    this.updateSize(x)
    return x
  }

  private rotateLeft(x: OSTNode<T>): OSTNode<T> {
    const y = x.right!
    const t2 = y.left
    y.left = x
    x.right = t2
    this.updateSize(x)
    this.updateSize(y)
    return y
  }

  private insertNode(node: OSTNode<T> | null, value: T): OSTNode<T> {
    if (node === null) {
      this._size++
      return { value, priority: Math.random(), left: null, right: null, size: 1 }
    }
    const cmp = this.compare(value, node.value)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value)
      if (node.left!.priority > node.priority) {
        node = this.rotateRight(node)
      } else {
        this.updateSize(node)
      }
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value)
      if (node.right!.priority > node.priority) {
        node = this.rotateLeft(node)
      } else {
        this.updateSize(node)
      }
    }
    return node
  }

  insert(value: T): void {
    this.root = this.insertNode(this.root, value)
  }

  private findNode(value: T): OSTNode<T> | null {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(value, current.value)
      if (cmp === 0) return current
      current = cmp < 0 ? current.left : current.right
    }
    return null
  }

  contains(value: T): boolean {
    return this.findNode(value) !== null
  }

  private deleteNode(node: OSTNode<T> | null, value: T): OSTNode<T> | null {
    if (node === null) return null
    const cmp = this.compare(value, node.value)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, value)
      this.updateSize(node)
      return node
    }
    if (cmp > 0) {
      node.right = this.deleteNode(node.right, value)
      this.updateSize(node)
      return node
    }
    if (node.left === null && node.right === null) {
      this._size--
      return null
    }
    if (node.left === null) {
      this._size--
      return node.right
    }
    if (node.right === null) {
      this._size--
      return node.left
    }
    if (node.left.priority > node.right.priority) {
      node = this.rotateRight(node)
      node.right = this.deleteNode(node.right, value)
    } else {
      node = this.rotateLeft(node)
      node.left = this.deleteNode(node.left, value)
    }
    this.updateSize(node)
    return node
  }

  delete(value: T): boolean {
    if (!this.contains(value)) return false
    this.root = this.deleteNode(this.root, value)
    return true
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

  select(rank: number): T | undefined {
    if (rank < 0 || rank >= this._size) return undefined
    let node = this.root
    while (node !== null) {
      const leftSize = this.nodeSize(node.left)
      if (rank < leftSize) {
        node = node.left
      } else if (rank === leftSize) {
        return node.value
      } else {
        rank -= leftSize + 1
        node = node.right
      }
    }
    return undefined
  }

  rank(value: T): number {
    let result = 0
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(value, node.value)
      if (cmp < 0) {
        node = node.left
      } else if (cmp > 0) {
        result += this.nodeSize(node.left) + 1
        node = node.right
      } else {
        result += this.nodeSize(node.left)
        return result
      }
    }
    return -1
  }

  private findMinNode(node: OSTNode<T>): OSTNode<T> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private findMaxNode(node: OSTNode<T>): OSTNode<T> {
    let current = node
    while (current.right !== null) {
      current = current.right
    }
    return current
  }

  getMin(): T | undefined {
    if (this.root === null) return undefined
    return this.findMinNode(this.root).value
  }

  getMax(): T | undefined {
    if (this.root === null) return undefined
    return this.findMaxNode(this.root).value
  }

  predecessor(value: T): T | undefined {
    let result: OSTNode<T> | null = null
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(value, current.value)
      if (cmp > 0) {
        result = current
        current = current.right
      } else {
        current = current.left
      }
    }
    return result !== null ? result.value : undefined
  }

  successor(value: T): T | undefined {
    let result: OSTNode<T> | null = null
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(value, current.value)
      if (cmp < 0) {
        result = current
        current = current.left
      } else {
        current = current.right
      }
    }
    return result !== null ? result.value : undefined
  }

  private countLessThan(node: OSTNode<T> | null, value: T): number {
    if (node === null) return 0
    const cmp = this.compare(value, node.value)
    if (cmp <= 0) {
      return this.countLessThan(node.left, value)
    }
    return this.nodeSize(node.left) + 1 + this.countLessThan(node.right, value)
  }

  private countGreaterThan(node: OSTNode<T> | null, value: T): number {
    if (node === null) return 0
    const cmp = this.compare(value, node.value)
    if (cmp >= 0) {
      return this.countGreaterThan(node.right, value)
    }
    return this.nodeSize(node.right) + 1 + this.countGreaterThan(node.left, value)
  }

  countRange(low: T, high: T): number {
    if (this.compare(low, high) > 0) return 0
    const total = this._size
    const lessThanLow = this.countLessThan(this.root, low)
    const greaterThanHigh = this.countGreaterThan(this.root, high)
    return total - lessThanLow - greaterThanHigh
  }

  private collectInOrder(node: OSTNode<T> | null, result: T[]): void {
    if (node === null) return
    this.collectInOrder(node.left, result)
    result.push(node.value)
    this.collectInOrder(node.right, result)
  }

  toArray(): T[] {
    const result: T[] = []
    this.collectInOrder(this.root, result)
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    const traverse = (node: OSTNode<T> | null): void => {
      if (node === null) return
      traverse(node.left)
      callback(node.value, idx++)
      traverse(node.right)
    }
    traverse(this.root)
  }

  *[Symbol.iterator](): Iterator<T> {
    const stack: OSTNode<T>[] = []
    let current = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield current.value
      current = current.right
    }
  }

  clone(): OrderStatisticTree<T> {
    const result = new OrderStatisticTree<T>({ comparator: this.compare })
    for (const value of this) {
      result.insert(value)
    }
    return result
  }

  private computeHeight(node: OSTNode<T> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  getHeight(): number {
    return this.computeHeight(this.root)
  }

  private checkHeap(node: OSTNode<T> | null): boolean {
    if (node === null) return true
    if (node.left !== null && node.left.priority > node.priority) return false
    if (node.right !== null && node.right.priority > node.priority) return false
    return this.checkHeap(node.left) && this.checkHeap(node.right)
  }

  private checkBST(node: OSTNode<T> | null, min: T | null, max: T | null): boolean {
    if (node === null) return true
    if (min !== null && this.compare(node.value, min) <= 0) return false
    if (max !== null && this.compare(node.value, max) >= 0) return false
    return this.checkBST(node.left, min, node.value) && this.checkBST(node.right, node.value, max)
  }

  private checkSizes(node: OSTNode<T> | null): boolean {
    if (node === null) return true
    const expected = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
    if (node.size !== expected) return false
    return this.checkSizes(node.left) && this.checkSizes(node.right)
  }

  isValid(): boolean {
    if (this.root === null) return true
    return (
      this.checkHeap(this.root) &&
      this.checkBST(this.root, null, null) &&
      this.checkSizes(this.root) &&
      this.root.size === this._size
    )
  }
}

export { defaultComparator } from './types.js'
export type { OSTNode, OrderStatisticTreeOptions } from './types.js'
