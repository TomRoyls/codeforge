import type { AVLTreeMapNode, AVLTreeMapOptions, AVLTreeEntry } from './types.js'
import { defaultComparator } from './types.js'

export class AVLTreeMap<K, V> {
  private root: AVLTreeMapNode<K, V> | null = null
  private _size: number = 0
  private compare: (a: K, b: K) => number

  constructor(options?: AVLTreeMapOptions<K, V>) {
    this.compare = options?.comparator ?? (defaultComparator as (a: K, b: K) => number)
    if (options?.entries) {
      for (const [key, value] of options.entries) {
        this.set(key, value)
      }
    }
  }

  private nodeHeight(node: AVLTreeMapNode<K, V> | null): number {
    return node === null ? 0 : node.height
  }

  private nodeCount(node: AVLTreeMapNode<K, V> | null): number {
    return node === null ? 0 : node.count
  }

  private updateNode(node: AVLTreeMapNode<K, V>): void {
    node.height = 1 + Math.max(this.nodeHeight(node.left), this.nodeHeight(node.right))
    node.count = 1 + this.nodeCount(node.left) + this.nodeCount(node.right)
  }

  private balanceFactor(node: AVLTreeMapNode<K, V>): number {
    return this.nodeHeight(node.left) - this.nodeHeight(node.right)
  }

  private rotateRight(y: AVLTreeMapNode<K, V>): AVLTreeMapNode<K, V> {
    const x = y.left!
    const t2 = x.right
    x.right = y
    y.left = t2
    this.updateNode(y)
    this.updateNode(x)
    return x
  }

  private rotateLeft(x: AVLTreeMapNode<K, V>): AVLTreeMapNode<K, V> {
    const y = x.right!
    const t2 = y.left
    y.left = x
    x.right = t2
    this.updateNode(x)
    this.updateNode(y)
    return y
  }

  private balance(node: AVLTreeMapNode<K, V>): AVLTreeMapNode<K, V> {
    this.updateNode(node)
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

  private insertNode(node: AVLTreeMapNode<K, V> | null, key: K, value: V): AVLTreeMapNode<K, V> {
    if (node === null) {
      this._size++
      return { key, value, left: null, right: null, height: 1, count: 1 }
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key, value)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key, value)
    } else {
      node.value = value
      return node
    }
    return this.balance(node)
  }

  set(key: K, value: V): void {
    const prevSize = this._size
    this.root = this.insertNode(this.root, key, value)
    void prevSize
  }

  private findNode(key: K): AVLTreeMapNode<K, V> | null {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp === 0) return current
      current = cmp < 0 ? current.left : current.right
    }
    return null
  }

  get(key: K): V | undefined {
    return this.findNode(key)?.value
  }

  has(key: K): boolean {
    return this.findNode(key) !== null
  }

  private findMinNode(node: AVLTreeMapNode<K, V>): AVLTreeMapNode<K, V> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private findMaxNode(node: AVLTreeMapNode<K, V>): AVLTreeMapNode<K, V> {
    let current = node
    while (current.right !== null) {
      current = current.right
    }
    return current
  }

  private deleteNode(node: AVLTreeMapNode<K, V> | null, key: K): AVLTreeMapNode<K, V> | null {
    if (node === null) return null
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
    } else {
      this._size--
      if (node.left === null) return node.right
      if (node.right === null) return node.left
      const successor = this.findMinNode(node.right)
      node.key = successor.key
      node.value = successor.value
      this._size++
      node.right = this.deleteNode(node.right, successor.key)
    }
    return this.balance(node)
  }

  delete(key: K): boolean {
    if (!this.has(key)) return false
    this.root = this.deleteNode(this.root, key)
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

  getMin(): AVLTreeEntry<K, V> | undefined {
    if (this.root === null) return undefined
    const node = this.findMinNode(this.root)
    return { key: node.key, value: node.value }
  }

  getMax(): AVLTreeEntry<K, V> | undefined {
    if (this.root === null) return undefined
    const node = this.findMaxNode(this.root)
    return { key: node.key, value: node.value }
  }

  extractMin(): AVLTreeEntry<K, V> | undefined {
    if (this.root === null) return undefined
    const node = this.findMinNode(this.root)
    const entry: AVLTreeEntry<K, V> = { key: node.key, value: node.value }
    this.root = this.deleteNode(this.root, node.key)
    return entry
  }

  extractMax(): AVLTreeEntry<K, V> | undefined {
    if (this.root === null) return undefined
    const node = this.findMaxNode(this.root)
    const entry: AVLTreeEntry<K, V> = { key: node.key, value: node.value }
    this.root = this.deleteNode(this.root, node.key)
    return entry
  }

  predecessor(key: K): AVLTreeEntry<K, V> | undefined {
    let result: AVLTreeMapNode<K, V> | null = null
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp > 0) {
        result = current
        current = current.right
      } else {
        current = current.left
      }
    }
    return result !== null ? { key: result.key, value: result.value } : undefined
  }

  successor(key: K): AVLTreeEntry<K, V> | undefined {
    let result: AVLTreeMapNode<K, V> | null = null
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        result = current
        current = current.left
      } else {
        current = current.right
      }
    }
    return result !== null ? { key: result.key, value: result.value } : undefined
  }

  private rangeTraversal(
    node: AVLTreeMapNode<K, V> | null,
    start: K,
    end: K,
    result: AVLTreeEntry<K, V>[],
  ): void {
    if (node === null) return
    const cmpStart = this.compare(node.key, start)
    const cmpEnd = this.compare(node.key, end)
    if (cmpStart > 0) {
      this.rangeTraversal(node.left, start, end, result)
    }
    if (cmpStart >= 0 && cmpEnd <= 0) {
      result.push({ key: node.key, value: node.value })
    }
    if (cmpEnd < 0) {
      this.rangeTraversal(node.right, start, end, result)
    }
  }

  range(start: K, end: K): AVLTreeEntry<K, V>[] {
    const result: AVLTreeEntry<K, V>[] = []
    this.rangeTraversal(this.root, start, end, result)
    return result
  }

  private collectKeys(node: AVLTreeMapNode<K, V> | null, result: K[]): void {
    if (node === null) return
    this.collectKeys(node.left, result)
    result.push(node.key)
    this.collectKeys(node.right, result)
  }

  keys(): K[] {
    const result: K[] = []
    this.collectKeys(this.root, result)
    return result
  }

  private collectValues(node: AVLTreeMapNode<K, V> | null, result: V[]): void {
    if (node === null) return
    this.collectValues(node.left, result)
    result.push(node.value)
    this.collectValues(node.right, result)
  }

  values(): V[] {
    const result: V[] = []
    this.collectValues(this.root, result)
    return result
  }

  private collectEntries(node: AVLTreeMapNode<K, V> | null, result: AVLTreeEntry<K, V>[]): void {
    if (node === null) return
    this.collectEntries(node.left, result)
    result.push({ key: node.key, value: node.value })
    this.collectEntries(node.right, result)
  }

  entries(): AVLTreeEntry<K, V>[] {
    const result: AVLTreeEntry<K, V>[] = []
    this.collectEntries(this.root, result)
    return result
  }

  private nodeAtIndex(node: AVLTreeMapNode<K, V> | null, index: number): AVLTreeEntry<K, V> | undefined {
    if (node === null || index < 0 || index >= node.count) return undefined
    const leftCount = this.nodeCount(node.left)
    if (index < leftCount) {
      return this.nodeAtIndex(node.left, index)
    }
    if (index === leftCount) {
      return { key: node.key, value: node.value }
    }
    return this.nodeAtIndex(node.right, index - leftCount - 1)
  }

  atIndex(index: number): AVLTreeEntry<K, V> | undefined {
    if (index < 0 || index >= this._size) return undefined
    return this.nodeAtIndex(this.root, index)
  }

  private indexOfNode(node: AVLTreeMapNode<K, V> | null, key: K): number {
    if (node === null) return -1
    const cmp = this.compare(key, node.key)
    if (cmp === 0) return this.nodeCount(node.left)
    if (cmp < 0) return this.indexOfNode(node.left, key)
    const rightIdx = this.indexOfNode(node.right, key)
    if (rightIdx === -1) return -1
    return this.nodeCount(node.left) + 1 + rightIdx
  }

  indexOf(key: K): number {
    return this.indexOfNode(this.root, key)
  }

  forEach(callback: (entry: AVLTreeEntry<K, V>, index: number) => void): void {
    let idx = 0
    const traverse = (node: AVLTreeMapNode<K, V> | null): void => {
      if (node === null) return
      traverse(node.left)
      callback({ key: node.key, value: node.value }, idx++)
      traverse(node.right)
    }
    traverse(this.root)
  }

  *[Symbol.iterator](): Iterator<AVLTreeEntry<K, V>> {
    const stack: AVLTreeMapNode<K, V>[] = []
    let current = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield { key: current.key, value: current.value }
      current = current.right
    }
  }

  toArray(): AVLTreeEntry<K, V>[] {
    return this.entries()
  }

  clone(): AVLTreeMap<K, V> {
    const result = new AVLTreeMap<K, V>({ comparator: this.compare })
    for (const entry of this) {
      result.set(entry.key, entry.value)
    }
    return result
  }

  merge(other: AVLTreeMap<K, V>): AVLTreeMap<K, V> {
    const result = this.clone()
    for (const entry of other) {
      result.set(entry.key, entry.value)
    }
    return result
  }

  private checkBalance(node: AVLTreeMapNode<K, V> | null): boolean {
    if (node === null) return true
    const bf = this.balanceFactor(node)
    if (bf < -1 || bf > 1) return false
    return this.checkBalance(node.left) && this.checkBalance(node.right)
  }

  private checkCounts(node: AVLTreeMapNode<K, V> | null): boolean {
    if (node === null) return true
    const expected = 1 + this.nodeCount(node.left) + this.nodeCount(node.right)
    if (node.count !== expected) return false
    return this.checkCounts(node.left) && this.checkCounts(node.right)
  }

  private checkBST(node: AVLTreeMapNode<K, V> | null, min: K | null, max: K | null): boolean {
    if (node === null) return true
    if (min !== null && this.compare(node.key, min) <= 0) return false
    if (max !== null && this.compare(node.key, max) >= 0) return false
    return this.checkBST(node.left, min, node.key) && this.checkBST(node.right, node.key, max)
  }

  private checkHeights(node: AVLTreeMapNode<K, V> | null): boolean {
    if (node === null) return true
    const expected = 1 + Math.max(this.nodeHeight(node.left), this.nodeHeight(node.right))
    if (node.height !== expected) return false
    return this.checkHeights(node.left) && this.checkHeights(node.right)
  }

  isValid(): boolean {
    if (this.root === null) return true
    return (
      this.checkBalance(this.root) &&
      this.checkCounts(this.root) &&
      this.checkBST(this.root, null, null) &&
      this.checkHeights(this.root)
    )
  }

  getHeight(): number {
    return this.nodeHeight(this.root)
  }
}

export { defaultComparator } from './types.js'
export type { AVLTreeMapNode, AVLTreeMapOptions, AVLTreeEntry } from './types.js'
