import type { SplayMapOptions, SplayMapStatistics, SplayMapJSON, SplayMapNodeJSON } from './types.js'
import { DEFAULT_SPLAY_MAP_OPTIONS } from './types.js'

interface SplayNode<K, V> {
  key: K
  value: V
  left: SplayNode<K, V> | null
  right: SplayNode<K, V> | null
}

export class SplayMap<K = unknown, V = unknown> {
  private root: SplayNode<K, V> | null = null
  private _size: number = 0
  private _comparator: (a: K, b: K) => number
  private _stats: SplayMapStatistics = {
    sets: 0,
    gets: 0,
    deletes: 0,
    splayOperations: 0,
    rotations: 0,
    maxDepth: 0,
  }

  constructor(options?: SplayMapOptions<K>) {
    const opts = { ...DEFAULT_SPLAY_MAP_OPTIONS, ...options }
    this._comparator = opts.comparator
  }

  set(key: K, value: V): void {
    if (this.root === null) {
      this.root = { key, value, left: null, right: null }
      this._size++
      this._stats.sets++
      this.updateMaxDepth()
      return
    }

    this.splay(key)

    const cmp = this._comparator(key, this.root!.key)
    if (cmp === 0) {
      this.root!.value = value
      this._stats.sets++
      return
    }

    const newNode: SplayNode<K, V> = { key, value, left: null, right: null }
    if (cmp < 0) {
      newNode.right = this.root
      newNode.left = this.root!.left
      this.root!.left = null
    } else {
      newNode.left = this.root
      newNode.right = this.root!.right
      this.root!.right = null
    }
    this.root = newNode
    this._size++
    this._stats.sets++
    this.updateMaxDepth()
  }

  get(key: K): V | undefined {
    this._stats.gets++
    if (this.root === null) return undefined
    this.splay(key)
    if (this._comparator(key, this.root!.key) === 0) {
      return this.root!.value
    }
    return undefined
  }

  delete(key: K): boolean {
    if (this.root === null) return false

    this.splay(key)
    if (this._comparator(key, this.root!.key) !== 0) return false

    if (this.root!.left === null) {
      this.root = this.root!.right
    } else {
      const rightSubtree = this.root!.right
      this.root = this.root!.left
      this.splay(key)
      this.root!.right = rightSubtree
    }

    this._size--
    this._stats.deletes++
    this.updateMaxDepth()
    return true
  }

  has(key: K): boolean {
    if (this.root === null) return false
    this.splay(key)
    return this._comparator(key, this.root!.key) === 0
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
    this._stats = {
      sets: 0,
      gets: 0,
      deletes: 0,
      splayOperations: 0,
      rotations: 0,
      maxDepth: 0,
    }
  }

  min(): [K, V] | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.left !== null) {
      node = node.left
    }
    return [node.key, node.value]
  }

  max(): [K, V] | undefined {
    if (this.root === null) return undefined
    let node = this.root
    while (node.right !== null) {
      node = node.right
    }
    return [node.key, node.value]
  }

  first(): V | undefined {
    const entry = this.min()
    return entry ? entry[1] : undefined
  }

  last(): V | undefined {
    const entry = this.max()
    return entry ? entry[1] : undefined
  }

  lowerBound(key: K): [K, V] | undefined {
    let result: SplayNode<K, V> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this._comparator(key, node.key)
      if (cmp <= 0) {
        result = node
        node = node.left
      } else {
        node = node.right
      }
    }
    return result ? [result.key, result.value] : undefined
  }

  upperBound(key: K): [K, V] | undefined {
    let result: SplayNode<K, V> | null = null
    let node = this.root
    while (node !== null) {
      const cmp = this._comparator(key, node.key)
      if (cmp < 0) {
        result = node
        node = node.left
      } else {
        node = node.right
      }
    }
    return result ? [result.key, result.value] : undefined
  }

  keys(): K[] {
    const result: K[] = []
    this.inOrderTraversal(this.root, (node) => {
      result.push(node.key)
    })
    return result
  }

  values(): V[] {
    const result: V[] = []
    this.inOrderTraversal(this.root, (node) => {
      result.push(node.value)
    })
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    this.inOrderTraversal(this.root, (node) => {
      result.push([node.key, node.value])
    })
    return result
  }

  forEach(callback: (value: V, key: K, map: SplayMap<K, V>) => void): void {
    this.inOrderTraversal(this.root, (node) => {
      callback(node.value, node.key, this)
    })
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    const stack: SplayNode<K, V>[] = []
    let current = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield [current.key, current.value]
      current = current.right
    }
  }

  getStatistics(): SplayMapStatistics {
    return { ...this._stats }
  }

  toJSON(): SplayMapJSON<K, V> {
    return {
      root: this.serializeNode(this.root),
      size: this._size,
      statistics: { ...this._stats },
    }
  }

  static fromJSON<K, V>(data: SplayMapJSON<K, V>): SplayMap<K, V> {
    const map = new SplayMap<K, V>()
    map.root = map.deserializeNode(data.root)
    map._size = data.size
    map._stats = { ...data.statistics }
    map.updateMaxDepth()
    return map
  }

  private splay(key: K): void {
    if (this.root === null) return

    const header: SplayNode<K, V> = { key: key, value: undefined as V, left: null, right: null }
    let leftMax = header
    let rightMin = header
    let node = this.root

    this._stats.splayOperations++

    while (true) {
      const cmp = this._comparator(key, node!.key)
      if (cmp < 0) {
        if (node!.left === null) break
        if (this._comparator(key, node!.left!.key) < 0) {
          const temp = node!.left!
          node!.left = temp.right
          temp.right = node
          node = temp
          this._stats.rotations++
          if (node!.left === null) break
        }
        rightMin.left = node
        rightMin = node
        node = node!.left!
        this._stats.rotations++
      } else if (cmp > 0) {
        if (node!.right === null) break
        if (this._comparator(key, node!.right!.key) > 0) {
          const temp = node!.right!
          node!.right = temp.left
          temp.left = node
          node = temp
          this._stats.rotations++
          if (node!.right === null) break
        }
        leftMax.right = node
        leftMax = node
        node = node!.right!
        this._stats.rotations++
      } else {
        break
      }
    }

    leftMax.right = node!.left
    rightMin.left = node!.right
    node!.left = header.right
    node!.right = header.left
    this.root = node
  }

  private inOrderTraversal(node: SplayNode<K, V> | null, callback: (node: SplayNode<K, V>) => void): void {
    if (node === null) return
    this.inOrderTraversal(node.left, callback)
    callback(node)
    this.inOrderTraversal(node.right, callback)
  }

  private computeDepth(node: SplayNode<K, V> | null): number {
    if (node === null) return 0
    return 1 + Math.max(this.computeDepth(node.left), this.computeDepth(node.right))
  }

  private updateMaxDepth(): void {
    const depth = this.computeDepth(this.root)
    if (depth > this._stats.maxDepth) {
      this._stats.maxDepth = depth
    }
  }

  private serializeNode(node: SplayNode<K, V> | null): SplayMapNodeJSON<K, V> | null {
    if (node === null) return null
    return {
      key: node.key,
      value: node.value,
      left: this.serializeNode(node.left),
      right: this.serializeNode(node.right),
    }
  }

  private deserializeNode(data: SplayMapNodeJSON<K, V> | null): SplayNode<K, V> | null {
    if (data === null) return null
    return {
      key: data.key,
      value: data.value,
      left: this.deserializeNode(data.left),
      right: this.deserializeNode(data.right),
    }
  }
}

export { DEFAULT_SPLAY_MAP_OPTIONS } from './types.js'
export type { SplayMapOptions, SplayMapStatistics, SplayMapJSON, SplayMapNodeJSON } from './types.js'
