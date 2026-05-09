import type { AANode, AATreeOptions, AATreeStats, CompareFunction } from './types.js'
import { DEFAULT_AA_TREE_OPTIONS } from './types.js'

export class AATree<K, V> {
  private root: AANode<K, V> | null = null
  private _size: number = 0
  private allowDuplicates: boolean
  private compare: CompareFunction<K>

  constructor(options?: Partial<AATreeOptions>, compare?: CompareFunction<K>) {
    const opts: AATreeOptions = { ...DEFAULT_AA_TREE_OPTIONS, ...options }
    this.allowDuplicates = opts.allowDuplicates
    this.compare = compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))
  }

  private skew(node: AANode<K, V>): AANode<K, V> {
    if (node.left !== null && node.left.level === node.level) {
      const l = node.left
      node.left = l.right
      l.right = node
      return l
    }
    return node
  }

  private split(node: AANode<K, V>): AANode<K, V> {
    if (node.right !== null && node.right.right !== null && node.right.right.level === node.level) {
      const r = node.right
      node.right = r.left
      r.left = node
      r.level++
      return r
    }
    return node
  }

  private insertNode(node: AANode<K, V> | null, key: K, value: V): AANode<K, V> {
    if (node === null) {
      this._size++
      return { key, value, left: null, right: null, level: 1 }
    }
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.insertNode(node.left, key, value)
    } else if (cmp > 0) {
      node.right = this.insertNode(node.right, key, value)
    } else {
      if (this.allowDuplicates) {
        node.right = this.insertNode(node.right, key, value)
      } else {
        node.value = value
        return node
      }
    }
    node = this.skew(node)
    node = this.split(node)
    return node
  }

  insert(key: K, value: V): void {
    this.root = this.insertNode(this.root, key, value)
  }

  private searchNode(node: AANode<K, V> | null, key: K): V | undefined {
    if (node === null) return undefined
    const cmp = this.compare(key, node.key)
    if (cmp < 0) return this.searchNode(node.left, key)
    if (cmp > 0) return this.searchNode(node.right, key)
    return node.value
  }

  search(key: K): V | undefined {
    return this.searchNode(this.root, key)
  }

  contains(key: K): boolean {
    return this.search(key) !== undefined
  }

  private findMin(node: AANode<K, V>): AANode<K, V> {
    let current = node
    while (current.left !== null) {
      current = current.left
    }
    return current
  }

  private findMax(node: AANode<K, V>): AANode<K, V> {
    let current = node
    while (current.right !== null) {
      current = current.right
    }
    return current
  }

  min(): [K, V] | undefined {
    if (this.root === null) return undefined
    const node = this.findMin(this.root)
    return [node.key, node.value]
  }

  max(): [K, V] | undefined {
    if (this.root === null) return undefined
    const node = this.findMax(this.root)
    return [node.key, node.value]
  }

  successor(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
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

  predecessor(key: K): [K, V] | undefined {
    let result: [K, V] | undefined
    let node = this.root
    while (node !== null) {
      const cmp = this.compare(node.key, key)
      if (cmp < 0) {
        result = [node.key, node.value]
        node = node.right
      } else {
        node = node.left
      }
    }
    return result
  }

  private deleteNode(node: AANode<K, V> | null, key: K): AANode<K, V> | null {
    if (node === null) return null
    const cmp = this.compare(key, node.key)
    if (cmp < 0) {
      node.left = this.deleteNode(node.left, key)
    } else if (cmp > 0) {
      node.right = this.deleteNode(node.right, key)
    } else {
      this._size--
      if (node.left === null && node.right === null) {
        return null
      }
      if (node.left === null) {
        return node.right
      }
      if (node.right === null) {
        return node.left
      }
      const successor = this.findMin(node.right)
      node.key = successor.key
      node.value = successor.value
      this._size++
      node.right = this.deleteNode(node.right, successor.key)
    }
    node = this.decreaseLevel(node)
    node = this.skew(node)
    if (node.right !== null) {
      node.right = this.skew(node.right)
      if (node.right.right !== null) {
        node.right.right = this.skew(node.right.right)
      }
    }
    node = this.split(node)
    if (node.right !== null) {
      node.right = this.split(node.right)
    }
    return node
  }

  private decreaseLevel(node: AANode<K, V>): AANode<K, V> {
    const leftLevel = node.left?.level ?? 0
    const rightLevel = node.right?.level ?? 0
    const expectedLevel = Math.min(leftLevel, rightLevel) + 1
    if (expectedLevel < node.level) {
      node.level = expectedLevel
      if (node.right !== null && expectedLevel < node.right.level) {
        node.right.level = expectedLevel
      }
    }
    return node
  }

  delete(key: K): boolean {
    if (!this.contains(key)) return false
    this.root = this.deleteNode(this.root, key)
    return true
  }

  private rangeTraversal(node: AANode<K, V> | null, lower: K, upper: K, result: [K, V][]): void {
    if (node === null) return
    const cmpLow = this.compare(node.key, lower)
    const cmpHigh = this.compare(node.key, upper)
    if (cmpLow > 0) {
      this.rangeTraversal(node.left, lower, upper, result)
    }
    if (cmpLow >= 0 && cmpHigh <= 0) {
      result.push([node.key, node.value])
    }
    if (cmpHigh < 0) {
      this.rangeTraversal(node.right, lower, upper, result)
    }
  }

  range(lower: K, upper: K): [K, V][] {
    if (this.compare(lower, upper) > 0) return []
    const result: [K, V][] = []
    this.rangeTraversal(this.root, lower, upper, result)
    return result
  }

  private forEachNode(node: AANode<K, V> | null, callback: (value: V, key: K) => void): void {
    if (node === null) return
    this.forEachNode(node.left, callback)
    callback(node.value, node.key)
    this.forEachNode(node.right, callback)
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.forEachNode(this.root, callback)
  }

  toArray(): [K, V][] {
    const result: [K, V][] = []
    this.forEachNode(this.root, (value, key) => {
      result.push([key, value])
    })
    return result
  }

  size(): number {
    return this._size
  }

  private heightNode(node: AANode<K, V> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.heightNode(node.left), this.heightNode(node.right))
  }

  height(): number {
    return this.heightNode(this.root)
  }

  isEmpty(): boolean {
    return this.root === null
  }

  clear(): void {
    this.root = null
    this._size = 0
  }

  private cloneNode(node: AANode<K, V> | null): AANode<K, V> | null {
    if (node === null) return null
    return {
      key: node.key,
      value: node.value,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
      level: node.level,
    }
  }

  clone(): AATree<K, V> {
    const result = new AATree<K, V>({ allowDuplicates: this.allowDuplicates }, this.compare)
    result.root = this.cloneNode(this.root)
    result._size = this._size
    return result
  }

  static from<K, V>(entries: [K, V][], options?: Partial<AATreeOptions>, compare?: CompareFunction<K>): AATree<K, V> {
    const tree = new AATree<K, V>(options, compare)
    for (const [key, value] of entries) {
      tree.insert(key, value)
    }
    return tree
  }

  stats(): AATreeStats {
    const arr = this.toArray()
    const minKey = arr.length > 0 ? (typeof arr[0]![0] === 'number' ? (arr[0]![0] as unknown as number) : null) : null
    const maxKey = arr.length > 0 ? (typeof arr[arr.length - 1]![0] === 'number' ? (arr[arr.length - 1]![0] as unknown as number) : null) : null
    return {
      nodeCount: this._size,
      height: this.height(),
      isBalanced: this.validate(),
      minKey,
      maxKey,
    }
  }

  private validateNode(node: AANode<K, V> | null): boolean {
    if (node === null) return true
    if (node.level < 1) return false
    if (node.left !== null && node.left.level !== node.level - 1) return false
    if (node.right !== null && node.right.level !== node.level && node.right.level !== node.level - 1) return false
    if (node.right !== null && node.right.right !== null && node.right.right.level >= node.level) return false
    if (node.level > 1 && (node.left === null || node.right === null)) return false
    if (node.left !== null && this.compare(node.left.key, node.key) > 0) return false
    if (node.right !== null && this.compare(node.right.key, node.key) < 0) return false
    return this.validateNode(node.left) && this.validateNode(node.right)
  }

  validate(): boolean {
    return this.validateNode(this.root)
  }
}

export { DEFAULT_AA_TREE_OPTIONS } from './types.js'
export type { AANode, AATreeOptions, AATreeStats, CompareFunction } from './types.js'
