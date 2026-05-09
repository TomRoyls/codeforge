import type { SortedMapNode, CompareFunction, SortedMapStats, SortedMapEntry } from './types.js'

export class SortedMap<K, V> {
  private root: SortedMapNode<K, V> | null = null
  private _size: number = 0
  private compare: CompareFunction<K>

  constructor(optionsOrCompare?: CompareFunction<K> | { compare?: CompareFunction<K> }) {
    if (typeof optionsOrCompare === 'function') {
      this.compare = optionsOrCompare
    } else if (optionsOrCompare && typeof optionsOrCompare === 'object') {
      this.compare = optionsOrCompare.compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
    } else {
      this.compare = (a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0)
    }
  }

  private nodeHeight(node: SortedMapNode<K, V> | null): number {
    return node === null ? 0 : node.height
  }

  private updateHeight(node: SortedMapNode<K, V>): void {
    node.height = 1 + Math.max(this.nodeHeight(node.left), this.nodeHeight(node.right))
  }

  private getBalanceFactor(node: SortedMapNode<K, V>): number {
    return this.nodeHeight(node.left) - this.nodeHeight(node.right)
  }

  private rotateRight(y: SortedMapNode<K, V>): SortedMapNode<K, V> {
    const x = y.left!
    const t2 = x.right
    x.right = y
    y.left = t2
    this.updateHeight(y)
    this.updateHeight(x)
    return x
  }

  private rotateLeft(x: SortedMapNode<K, V>): SortedMapNode<K, V> {
    const y = x.right!
    const t2 = y.left
    y.left = x
    x.right = t2
    this.updateHeight(x)
    this.updateHeight(y)
    return y
  }

  private balance(node: SortedMapNode<K, V>): SortedMapNode<K, V> {
    this.updateHeight(node)
    const bf = this.getBalanceFactor(node)
    if (bf > 1) {
      if (this.getBalanceFactor(node.left!) < 0) {
        node.left = this.rotateLeft(node.left!)
      }
      return this.rotateRight(node)
    }
    if (bf < -1) {
      if (this.getBalanceFactor(node.right!) > 0) {
        node.right = this.rotateRight(node.right!)
      }
      return this.rotateLeft(node)
    }
    return node
  }

  set(key: K, value: V): void {
    this.root = this.insertNode(this.root, key, value)
  }

  private insertNode(node: SortedMapNode<K, V> | null, key: K, value: V): SortedMapNode<K, V> {
    if (node === null) {
      this._size++
      return { key, value, left: null, right: null, height: 1 }
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

  get(key: K): V | undefined {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return current.value
      }
    }
    return undefined
  }

  has(key: K): boolean {
    let current = this.root
    while (current !== null) {
      const cmp = this.compare(key, current.key)
      if (cmp < 0) {
        current = current.left
      } else if (cmp > 0) {
        current = current.right
      } else {
        return true
      }
    }
    return false
  }

  delete(key: K): boolean {
    if (!this.has(key)) return false
    this.root = this.deleteNode(this.root, key)
    return true
  }

  private findMinNode(node: SortedMapNode<K, V>): SortedMapNode<K, V> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private deleteNode(node: SortedMapNode<K, V> | null, key: K): SortedMapNode<K, V> | null {
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

  first(): SortedMapEntry<K, V> | undefined {
    if (this.root === null) return undefined
    const node = this.findMinNode(this.root)
    return [node.key, node.value]
  }

  last(): SortedMapEntry<K, V> | undefined {
    if (this.root === null) return undefined
    let current = this.root
    while (current.right !== null) {
      current = current.right
    }
    return [current.key, current.value]
  }

  lowerBound(key: K): SortedMapEntry<K, V> | undefined {
    let result: SortedMapEntry<K, V> | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp >= 0) {
        result = [node.key, node.value]
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  upperBound(key: K): SortedMapEntry<K, V> | undefined {
    let result: SortedMapEntry<K, V> | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp > 0) {
        result = [node.key, node.value]
        node = node.left
      } else {
        node = node.right
      }
    }
    return result
  }

  private rangeTraversal(
    node: SortedMapNode<K, V> | null,
    start: K,
    end: K,
    result: SortedMapEntry<K, V>[],
  ): void {
    if (node === null) return
    const cmpStart = this.compare(node.key, start)
    const cmpEnd = this.compare(node.key, end)
    if (cmpStart > 0) {
      this.rangeTraversal(node.left, start, end, result)
    }
    if (cmpStart >= 0 && cmpEnd <= 0) {
      result.push([node.key, node.value])
    }
    if (cmpEnd < 0) {
      this.rangeTraversal(node.right, start, end, result)
    }
  }

  range(lower: K, upper: K): SortedMapEntry<K, V>[] {
    if (this.compare(lower, upper) > 0) return []
    const result: SortedMapEntry<K, V>[] = []
    this.rangeTraversal(this.root, lower, upper, result)
    return result
  }

  forEach(callback: (value: V, key: K) => void): void {
    const entries = this.entries()
    for (const [key, value] of entries) {
      callback(value, key)
    }
  }

  private inOrderTraversal(node: SortedMapNode<K, V> | null, result: SortedMapEntry<K, V>[]): void {
    if (node === null) return
    this.inOrderTraversal(node.left, result)
    result.push([node.key, node.value])
    this.inOrderTraversal(node.right, result)
  }

  entries(): SortedMapEntry<K, V>[] {
    const result: SortedMapEntry<K, V>[] = []
    this.inOrderTraversal(this.root, result)
    return result
  }

  keys(): K[] {
    const result: SortedMapEntry<K, V>[] = []
    this.inOrderTraversal(this.root, result)
    return result.map(([k]) => k)
  }

  values(): V[] {
    const result: SortedMapEntry<K, V>[] = []
    this.inOrderTraversal(this.root, result)
    return result.map(([, v]) => v)
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  clone(): SortedMap<K, V> {
    const result = new SortedMap<K, V>(this.compare)
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      result.set(key, value)
    }
    return result
  }

  static from<K, V>(
    entries: SortedMapEntry<K, V>[],
    optionsOrCompare?: CompareFunction<K> | { compare?: CompareFunction<K> },
  ): SortedMap<K, V> {
    const map = new SortedMap<K, V>(optionsOrCompare)
    for (const [key, value] of entries) {
      map.set(key, value)
    }
    return map
  }

  union(other: SortedMap<K, V>): SortedMap<K, V> {
    const result = this.clone()
    const otherEntries = other.entries()
    for (const [key, value] of otherEntries) {
      result.set(key, value)
    }
    return result
  }

  intersection(other: SortedMap<K, V>): SortedMap<K, V> {
    const result = new SortedMap<K, V>(this.compare)
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      if (other.has(key)) {
        result.set(key, value)
      }
    }
    return result
  }

  difference(other: SortedMap<K, V>): SortedMap<K, V> {
    const result = new SortedMap<K, V>(this.compare)
    const allEntries = this.entries()
    for (const [key, value] of allEntries) {
      if (!other.has(key)) {
        result.set(key, value)
      }
    }
    return result
  }

  stats(): SortedMapStats {
    const height = this.nodeHeight(this.root)
    const balanced = this.checkBalanced(this.root)
    return {
      size: this._size,
      height,
      isBalanced: balanced,
    }
  }

  private checkBalanced(node: SortedMapNode<K, V> | null): boolean {
    if (node === null) return true
    const bf = this.getBalanceFactor(node)
    if (bf < -1 || bf > 1) return false
    return this.checkBalanced(node.left) && this.checkBalanced(node.right)
  }

  [Symbol.iterator](): Iterator<SortedMapEntry<K, V>> {
    const allEntries = this.entries()
    let index = 0
    return {
      next: () => {
        if (index < allEntries.length) {
          const value = allEntries[index]!
          index++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<SortedMapEntry<K, V>>
      },
    }
  }
}

export type { SortedMapNode, CompareFunction, SortedMapStats, SortedMapEntry, SortedMapOptions } from './types.js'
