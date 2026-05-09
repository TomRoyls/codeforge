import type { BSTNode, BSTMapOptions, BSTEntry } from './types.js'
import { defaultComparator } from './types.js'

export class BSTMap<K, V> {
  private root: BSTNode<K, V> | null = null
  private _size: number = 0
  private compare: (a: K, b: K) => number

  constructor(options?: BSTMapOptions<K, V>) {
    this.compare = options?.comparator ?? (defaultComparator as (a: K, b: K) => number)
    if (options?.entries) {
      for (const [key, value] of options.entries) {
        this.set(key, value)
      }
    }
  }

  set(key: K, value: V): void {
    this.root = this.insertNode(this.root, key, value)
  }

  private insertNode(node: BSTNode<K, V> | null, key: K, value: V): BSTNode<K, V> {
    if (node === null) {
      this._size++
      return { key, value, left: null, right: null }
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key, value)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key, value)
    } else {
      node.value = value
    }
    return node
  }

  private findNode(key: K): BSTNode<K, V> | null {
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

  contains(key: K): boolean {
    return this.has(key)
  }

  insert(key: K, value: V): void {
    this.set(key, value)
  }

  delete(key: K): boolean {
    if (!this.has(key)) return false
    this.root = this.deleteNode(this.root, key)
    return true
  }

  private deleteNode(node: BSTNode<K, V> | null, key: K): BSTNode<K, V> | null {
    if (node === null) return null
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
      return node
    }
    if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
      return node
    }
    this._size--
    if (node.left === null) return node.right
    if (node.right === null) return node.left
    const successor = this.findMinNode(node.right)
    node.key = successor.key
    node.value = successor.value
    this._size++
    node.right = this.deleteNode(node.right, successor.key)
    return node
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

  private findMinNode(node: BSTNode<K, V>): BSTNode<K, V> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private findMaxNode(node: BSTNode<K, V>): BSTNode<K, V> {
    let current = node
    while (current.right !== null) {
      current = current.right
    }
    return current
  }

  getMin(): BSTEntry<K, V> | undefined {
    if (this.root === null) return undefined
    const node = this.findMinNode(this.root)
    return { key: node.key, value: node.value }
  }

  getMax(): BSTEntry<K, V> | undefined {
    if (this.root === null) return undefined
    const node = this.findMaxNode(this.root)
    return { key: node.key, value: node.value }
  }

  predecessor(key: K): BSTEntry<K, V> | undefined {
    let result: BSTNode<K, V> | null = null
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

  successor(key: K): BSTEntry<K, V> | undefined {
    let result: BSTNode<K, V> | null = null
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
    node: BSTNode<K, V> | null,
    start: K,
    end: K,
    result: BSTEntry<K, V>[],
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

  range(start: K, end: K): BSTEntry<K, V>[] {
    const result: BSTEntry<K, V>[] = []
    this.rangeTraversal(this.root, start, end, result)
    return result
  }

  private collectKeys(node: BSTNode<K, V> | null, result: K[]): void {
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

  private collectValues(node: BSTNode<K, V> | null, result: V[]): void {
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

  private collectEntries(node: BSTNode<K, V> | null, result: BSTEntry<K, V>[]): void {
    if (node === null) return
    this.collectEntries(node.left, result)
    result.push({ key: node.key, value: node.value })
    this.collectEntries(node.right, result)
  }

  entries(): BSTEntry<K, V>[] {
    const result: BSTEntry<K, V>[] = []
    this.collectEntries(this.root, result)
    return result
  }

  forEach(callback: (entry: BSTEntry<K, V>, index: number) => void): void {
    let idx = 0
    const traverse = (node: BSTNode<K, V> | null): void => {
      if (node === null) return
      traverse(node.left)
      callback({ key: node.key, value: node.value }, idx++)
      traverse(node.right)
    }
    traverse(this.root)
  }

  *[Symbol.iterator](): Iterator<BSTEntry<K, V>> {
    const stack: BSTNode<K, V>[] = []
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

  toArray(): BSTEntry<K, V>[] {
    return this.entries()
  }

  clone(): BSTMap<K, V> {
    const result = new BSTMap<K, V>({ comparator: this.compare })
    for (const entry of this) {
      result.set(entry.key, entry.value)
    }
    return result
  }

  private computeHeight(node: BSTNode<K, V> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeHeight(node.left), this.computeHeight(node.right))
  }

  getHeight(): number {
    return this.computeHeight(this.root)
  }
}

export { defaultComparator } from './types.js'
export type { BSTNode, BSTMapOptions, BSTEntry } from './types.js'
