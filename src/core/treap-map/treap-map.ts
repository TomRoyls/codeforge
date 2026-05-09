import type { TreapNode, TreapMapOptions, TreapEntry } from './types.js'
import { defaultComparator } from './types.js'

export class TreapMap<K, V> {
  private root: TreapNode<K, V> | null = null
  private _size: number = 0
  private compare: (a: K, b: K) => number

  constructor(options?: TreapMapOptions<K, V>) {
    this.compare = options?.comparator ?? (defaultComparator as (a: K, b: K) => number)
    if (options?.entries) {
      for (const [key, value] of options.entries) {
        this.set(key, value)
      }
    }
  }

  private nodeSize(node: TreapNode<K, V> | null): number {
    return node === null ? 0 : node.size
  }

  private updateSize(node: TreapNode<K, V>): void {
    node.size = 1 + this.nodeSize(node.left) + this.nodeSize(node.right)
  }

  private rotateRight(y: TreapNode<K, V>): TreapNode<K, V> {
    const x = y.left!
    const t2 = x.right
    x.right = y
    y.left = t2
    this.updateSize(y)
    this.updateSize(x)
    return x
  }

  private rotateLeft(x: TreapNode<K, V>): TreapNode<K, V> {
    const y = x.right!
    const t2 = y.left
    y.left = x
    x.right = t2
    this.updateSize(x)
    this.updateSize(y)
    return y
  }

  private insertNode(node: TreapNode<K, V> | null, key: K, value: V): TreapNode<K, V> {
    if (node === null) {
      this._size++
      return { key, value, priority: Math.random(), left: null, right: null, size: 1 }
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key, value)
      if (node.left!.priority > node.priority) {
        node = this.rotateRight(node)
      } else {
        this.updateSize(node)
      }
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key, value)
      if (node.right!.priority > node.priority) {
        node = this.rotateLeft(node)
      } else {
        this.updateSize(node)
      }
    } else {
      node.value = value
    }
    return node
  }

  set(key: K, value: V): void {
    this.root = this.insertNode(this.root, key, value)
  }

  private findNode(key: K): TreapNode<K, V> | null {
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

  private deleteNode(node: TreapNode<K, V> | null, key: K): TreapNode<K, V> | null {
    if (node === null) return null
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
      this.updateSize(node)
      return node
    }
    if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
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
      node.right = this.deleteNode(node.right, key)
    } else {
      node = this.rotateLeft(node)
      node.left = this.deleteNode(node.left, key)
    }
    this.updateSize(node)
    return node
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

  private findMinNode(node: TreapNode<K, V>): TreapNode<K, V> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private findMaxNode(node: TreapNode<K, V>): TreapNode<K, V> {
    let current = node
    while (current.right !== null) {
      current = current.right
    }
    return current
  }

  getMin(): TreapEntry<K, V> | undefined {
    if (this.root === null) return undefined
    const node = this.findMinNode(this.root)
    return { key: node.key, value: node.value }
  }

  getMax(): TreapEntry<K, V> | undefined {
    if (this.root === null) return undefined
    const node = this.findMaxNode(this.root)
    return { key: node.key, value: node.value }
  }

  extractMin(): TreapEntry<K, V> | undefined {
    if (this.root === null) return undefined
    const node = this.findMinNode(this.root)
    const entry: TreapEntry<K, V> = { key: node.key, value: node.value }
    this.root = this.deleteNode(this.root, node.key)
    return entry
  }

  extractMax(): TreapEntry<K, V> | undefined {
    if (this.root === null) return undefined
    const node = this.findMaxNode(this.root)
    const entry: TreapEntry<K, V> = { key: node.key, value: node.value }
    this.root = this.deleteNode(this.root, node.key)
    return entry
  }

  predecessor(key: K): TreapEntry<K, V> | undefined {
    let result: TreapNode<K, V> | null = null
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

  successor(key: K): TreapEntry<K, V> | undefined {
    let result: TreapNode<K, V> | null = null
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
    node: TreapNode<K, V> | null,
    start: K,
    end: K,
    result: TreapEntry<K, V>[],
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

  range(start: K, end: K): TreapEntry<K, V>[] {
    const result: TreapEntry<K, V>[] = []
    this.rangeTraversal(this.root, start, end, result)
    return result
  }

  private collectKeys(node: TreapNode<K, V> | null, result: K[]): void {
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

  private collectValues(node: TreapNode<K, V> | null, result: V[]): void {
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

  private collectEntries(node: TreapNode<K, V> | null, result: TreapEntry<K, V>[]): void {
    if (node === null) return
    this.collectEntries(node.left, result)
    result.push({ key: node.key, value: node.value })
    this.collectEntries(node.right, result)
  }

  entries(): TreapEntry<K, V>[] {
    const result: TreapEntry<K, V>[] = []
    this.collectEntries(this.root, result)
    return result
  }

  private nodeAtIndex(node: TreapNode<K, V> | null, index: number): TreapEntry<K, V> | undefined {
    if (node === null || index < 0 || index >= node.size) return undefined
    const leftSize = this.nodeSize(node.left)
    if (index < leftSize) {
      return this.nodeAtIndex(node.left, index)
    }
    if (index === leftSize) {
      return { key: node.key, value: node.value }
    }
    return this.nodeAtIndex(node.right, index - leftSize - 1)
  }

  atIndex(index: number): TreapEntry<K, V> | undefined {
    if (index < 0 || index >= this._size) return undefined
    return this.nodeAtIndex(this.root, index)
  }

  private indexOfNode(node: TreapNode<K, V> | null, key: K): number {
    if (node === null) return -1
    const cmp = this.compare(key, node.key)
    if (cmp === 0) return this.nodeSize(node.left)
    if (cmp < 0) return this.indexOfNode(node.left, key)
    const rightIdx = this.indexOfNode(node.right, key)
    if (rightIdx === -1) return -1
    return this.nodeSize(node.left) + 1 + rightIdx
  }

  indexOf(key: K): number {
    return this.indexOfNode(this.root, key)
  }

  forEach(callback: (entry: TreapEntry<K, V>, index: number) => void): void {
    let idx = 0
    const traverse = (node: TreapNode<K, V> | null): void => {
      if (node === null) return
      traverse(node.left)
      callback({ key: node.key, value: node.value }, idx++)
      traverse(node.right)
    }
    traverse(this.root)
  }

  *[Symbol.iterator](): Iterator<TreapEntry<K, V>> {
    const stack: TreapNode<K, V>[] = []
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

  toArray(): TreapEntry<K, V>[] {
    return this.entries()
  }

  clone(): TreapMap<K, V> {
    const result = new TreapMap<K, V>({ comparator: this.compare })
    for (const entry of this) {
      result.set(entry.key, entry.value)
    }
    return result
  }

  merge(other: TreapMap<K, V>): TreapMap<K, V> {
    const result = this.clone()
    for (const entry of other) {
      result.set(entry.key, entry.value)
    }
    return result
  }

  private splitNode(
    node: TreapNode<K, V> | null,
    key: K,
  ): [TreapNode<K, V> | null, TreapNode<K, V> | null] {
    if (node === null) return [null, null]
    const cmp = this.compare(key, node.key)
    if (cmp <= 0) {
      const [left, right] = this.splitNode(node.left, key)
      node.left = right
      this.updateSize(node)
      return [left, node]
    }
    const [left, right] = this.splitNode(node.right, key)
    node.right = left
    this.updateSize(node)
    return [node, right]
  }

  split(key: K): [TreapMap<K, V>, TreapMap<K, V>] {
    const [leftRoot, rightRoot] = this.splitNode(this.root, key)
    const left = new TreapMap<K, V>({ comparator: this.compare })
    const right = new TreapMap<K, V>({ comparator: this.compare })
    left.root = leftRoot
    right.root = rightRoot
    left._size = this.nodeSize(leftRoot)
    right._size = this.nodeSize(rightRoot)
    return [left, right]
  }

  private checkHeap(node: TreapNode<K, V> | null): boolean {
    if (node === null) return true
    if (node.left !== null && node.left.priority > node.priority) return false
    if (node.right !== null && node.right.priority > node.priority) return false
    return this.checkHeap(node.left) && this.checkHeap(node.right)
  }

  private checkBST(node: TreapNode<K, V> | null, min: K | null, max: K | null): boolean {
    if (node === null) return true
    if (min !== null && this.compare(node.key, min) <= 0) return false
    if (max !== null && this.compare(node.key, max) >= 0) return false
    return this.checkBST(node.left, min, node.key) && this.checkBST(node.right, node.key, max)
  }

  private checkSizes(node: TreapNode<K, V> | null): boolean {
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
      this.checkSizes(this.root)
    )
  }

  private computeHeight(node: TreapNode<K, V> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  getHeight(): number {
    return this.computeHeight(this.root)
  }
}

export { defaultComparator } from './types.js'
export type { TreapNode, TreapMapOptions, TreapEntry } from './types.js'
