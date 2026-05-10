import type {
  AVLMultisetOptions,
  AVLMultisetJSON,
  AVLMultisetNodeJSON,
  AVLMultisetStatistics,
} from './types.js'
import { DEFAULT_AVL_MULTISET_OPTIONS } from './types.js'

interface AVLNode<T> {
  value: T
  count: number
  height: number
  left: AVLNode<T> | null
  right: AVLNode<T> | null
}

export class AVLMultiset<T = number> {
  private root: AVLNode<T> | null = null
  private _size: number = 0
  private _uniqueSize: number = 0
  private comparator: (a: T, b: T) => number
  private _stats: AVLMultisetStatistics = {
    adds: 0,
    removes: 0,
    rotations: 0,
    maxDepth: 0,
    uniqueCount: 0,
  }

  constructor(options?: AVLMultisetOptions<T>) {
    const opts = { ...DEFAULT_AVL_MULTISET_OPTIONS, ...options }
    this.comparator = opts.comparator as (a: T, b: T) => number
  }

  add(value: T): void {
    this.root = this.insertNode(this.root, value)
    this._stats.adds++
    this.updateStats()
  }

  remove(value: T): boolean {
    if (!this.has(value)) return false
    this.root = this.removeNode(this.root, value)
    this._stats.removes++
    this.updateStats()
    return true
  }

  has(value: T): boolean {
    return this.findNode(this.root, value) !== null
  }

  count(value: T): number {
    const node = this.findNode(this.root, value)
    return node !== null ? node.count : 0
  }

  get size(): number {
    return this._size
  }

  get uniqueSize(): number {
    return this._uniqueSize
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
    this._uniqueSize = 0
    this._stats = {
      adds: 0,
      removes: 0,
      rotations: 0,
      maxDepth: 0,
      uniqueCount: 0,
    }
  }

  get min(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.left !== null) {
      node = node.left
    }
    return node.value
  }

  get max(): T | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) {
      node = node.right
    }
    return node.value
  }

  lowerBound(value: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.comparator(node.value, value)
      if (cmp >= 0) {
        result = node.value
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  upperBound(value: T): T | undefined {
    let result: T | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.comparator(node.value, value)
      if (cmp > 0) {
        result = node.value
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  toArray(): T[] {
    const result: T[] = []
    this.inorderCollect(this.root, result)
    return result
  }

  forEach(callback: (value: T, count: number) => void): void {
    this.inorderForEach(this.root, callback)
  }

  *[Symbol.iterator](): Iterator<T> {
    const stack: AVLNode<T>[] = []
    let current = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      for (let i = 0; i < current.count; i++) {
        yield current.value
      }
      current = current.right
    }
  }

  toArraySorted(): T[] {
    return this.toArray()
  }

  getStatistics(): AVLMultisetStatistics {
    return { ...this._stats }
  }

  toJSON(): AVLMultisetJSON<T> {
    return {
      root: this.nodeToJSON(this.root),
      size: this._size,
      uniqueSize: this._uniqueSize,
      statistics: { ...this._stats },
    }
  }

  static fromJSON<T = number>(data: AVLMultisetJSON<T>): AVLMultiset<T> {
    const multiset = new AVLMultiset<T>()
    multiset.root = multiset.nodeFromJSON(data.root)
    multiset._size = data.size
    multiset._uniqueSize = data.uniqueSize
    multiset._stats = { ...data.statistics }
    return multiset
  }

  private nodeToJSON(node: AVLNode<T> | null): AVLMultisetNodeJSON<T> | null {
    if (node === null) return null
    return {
      value: node.value,
      count: node.count,
      height: node.height,
      left: this.nodeToJSON(node.left),
      right: this.nodeToJSON(node.right),
    }
  }

  private nodeFromJSON(json: AVLMultisetNodeJSON<T> | null): AVLNode<T> | null {
    if (json === null) return null
    return {
      value: json.value,
      count: json.count,
      height: json.height,
      left: this.nodeFromJSON(json.left),
      right: this.nodeFromJSON(json.right),
    }
  }

  private height(node: AVLNode<T> | null): number {
    return node === null ? 0 : node.height
  }

  private balanceFactor(node: AVLNode<T>): number {
    return this.height(node.left) - this.height(node.right)
  }

  private updateHeight(node: AVLNode<T>): void {
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right))
  }

  private rotateRight(y: AVLNode<T>): AVLNode<T> {
    const x = y.left!
    const t2 = x.right
    x.right = y
    y.left = t2
    this.updateHeight(y)
    this.updateHeight(x)
    this._stats.rotations++
    return x
  }

  private rotateLeft(x: AVLNode<T>): AVLNode<T> {
    const y = x.right!
    const t2 = y.left
    y.left = x
    x.right = t2
    this.updateHeight(x)
    this.updateHeight(y)
    this._stats.rotations++
    return y
  }

  private balance(node: AVLNode<T>): AVLNode<T> {
    this.updateHeight(node)
    const bf = this.balanceFactor(node)
    if (bf > 1) {
      if (this.balanceFactor(node.left!) < 0) {
        node.left = this.rotateLeft(node.left!)
      }
      return this.rotateRight(node)
    }
    if (bf < -1) {
      if (this.balanceFactor(node.right!) > 0) {
        node.right = this.rotateRight(node.right!)
      }
      return this.rotateLeft(node)
    }
    return node
  }

  private createNode(value: T): AVLNode<T> {
    return { value, count: 1, height: 1, left: null, right: null }
  }

  private insertNode(node: AVLNode<T> | null, value: T): AVLNode<T> {
    if (node === null) {
      this._size++
      this._uniqueSize++
      return this.createNode(value)
    }
    const cmp = this.comparator(value, node.value)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, value)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, value)
    } else {
      node.count++
      this._size++
      return node
    }
    return this.balance(node)
  }

  private removeNode(node: AVLNode<T> | null, value: T): AVLNode<T> | null {
    if (node === null) return null
    const cmp = this.comparator(value, node.value)
    if (cmp < 0) {
      node.left = this.removeNode(node.left, value)
    } else if (cmp > 0) {
      node.right = this.removeNode(node.right, value)
    } else {
      if (node.count > 1) {
        node.count--
        this._size--
        return node
      }
      this._size--
      this._uniqueSize--
      if (node.left === null) return node.right
      if (node.right === null) return node.left
      let successor = node.right
      while (successor.left !== null) {
        successor = successor.left
      }
      node.value = successor.value
      node.count = successor.count
      const savedUniqueSize = this._uniqueSize
      this._uniqueSize++
      node.right = this.removeNodeFull(node.right, successor.value)
      this._uniqueSize = savedUniqueSize
    }
    return this.balance(node)
  }

  private removeNodeFull(node: AVLNode<T> | null, value: T): AVLNode<T> | null {
    if (node === null) return null
    const cmp = this.comparator(value, node.value)
    if (cmp < 0) {
      node.left = this.removeNodeFull(node.left, value)
    } else if (cmp > 0) {
      node.right = this.removeNodeFull(node.right, value)
    } else {
      if (node.left === null) return node.right
      if (node.right === null) return node.left
      let successor = node.right
      while (successor.left !== null) {
        successor = successor.left
      }
      node.value = successor.value
      node.count = successor.count
      node.right = this.removeNodeFull(node.right, successor.value)
    }
    return this.balance(node)
  }

  private findNode(node: AVLNode<T> | null, value: T): AVLNode<T> | null {
    if (node === null) return null
    const cmp = this.comparator(value, node.value)
    if (cmp < 0) return this.findNode(node.left, value)
    if (cmp > 0) return this.findNode(node.right, value)
    return node
  }

  private inorderCollect(node: AVLNode<T> | null, result: T[]): void {
    if (node === null) return
    this.inorderCollect(node.left, result)
    for (let i = 0; i < node.count; i++) {
      result.push(node.value)
    }
    this.inorderCollect(node.right, result)
  }

  private inorderForEach(
    node: AVLNode<T> | null,
    callback: (value: T, count: number) => void,
  ): void {
    if (node === null) return
    this.inorderForEach(node.left, callback)
    callback(node.value, node.count)
    this.inorderForEach(node.right, callback)
  }

  private updateStats(): void {
    this._stats.maxDepth = this.height(this.root)
    this._stats.uniqueCount = this._uniqueSize
  }
}

export { DEFAULT_AVL_MULTISET_OPTIONS } from './types.js'
export type {
  AVLMultisetOptions,
  AVLMultisetJSON,
  AVLMultisetNodeJSON,
  AVLMultisetStatistics,
} from './types.js'
