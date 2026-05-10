import type { TreapMultimapOptions, TreapMultimapJSON, TreapMultimapStatistics } from './types.js'
import { DEFAULT_TREAP_MULTIMAP_OPTIONS } from './types.js'

interface TreapNode<K, V> {
  key: K
  values: V[]
  priority: number
  left: TreapNode<K, V> | null
  right: TreapNode<K, V> | null
}

export class TreapMultimap<K = string, V = unknown> {
  private root: TreapNode<K, V> | null = null
  private _size = 0
  private _keyCount = 0
  private _comparator: (a: K, b: K) => number
  private _priorityGen: () => number
  private _stats: TreapMultimapStatistics = {
    sets: 0,
    deletes: 0,
    rotations: 0,
    maxDepth: 0,
    totalValues: 0,
  }

  constructor(options?: TreapMultimapOptions<K>) {
    const opts = { ...DEFAULT_TREAP_MULTIMAP_OPTIONS, ...options }
    this._comparator = opts.comparator as (a: K, b: K) => number
    this._priorityGen = opts.priorityGenerator
  }

  set(key: K, value: V): void {
    const depth = { value: 0 }
    this.root = this.insertNode(this.root, key, value, depth)
    this._stats.sets++
    this._stats.maxDepth = Math.max(this._stats.maxDepth, depth.value)
    this.recalcCounts()
  }

  get(key: K): V[] {
    const node = this.findNode(this.root, key)
    return node ? [...node.values] : []
  }

  getAll(key: K): V[] {
    return this.get(key)
  }

  delete(key: K, value?: V): boolean {
    const node = this.findNode(this.root, key)
    if (!node) return false
    if (value === undefined) {
      this.root = this.removeNode(this.root, key)
      this._stats.deletes++
      this.recalcCounts()
      return true
    }
    const idx = node.values.indexOf(value)
    if (idx === -1) return false
    node.values.splice(idx, 1)
    this._stats.deletes++
    if (node.values.length === 0) {
      this.root = this.removeNode(this.root, key)
    }
    this.recalcCounts()
    return true
  }

  deleteKey(key: K): boolean {
    const node = this.findNode(this.root, key)
    if (!node) return false
    this.root = this.removeNode(this.root, key)
    this._stats.deletes++
    this.recalcCounts()
    return true
  }

  has(key: K): boolean {
    return this.findNode(this.root, key) !== null
  }

  hasEntry(key: K, value: V): boolean {
    const node = this.findNode(this.root, key)
    if (!node) return false
    return node.values.includes(value)
  }

  get size(): number {
    return this._size
  }

  get keyCount(): number {
    return this._keyCount
  }

  get isEmpty(): boolean {
    return this._keyCount === 0
  }

  clear(): void {
    this.root = null
    this._size = 0
    this._keyCount = 0
    this._stats = {
      sets: 0,
      deletes: 0,
      rotations: 0,
      maxDepth: 0,
      totalValues: 0,
    }
  }

  keys(): K[] {
    const result: K[] = []
    this.inorderKeys(this.root, result)
    return result
  }

  values(): V[] {
    const result: V[] = []
    this.inorderValues(this.root, result)
    return result
  }

  entries(): Array<[K, V[]]> {
    const result: Array<[K, V[]]> = []
    this.inorderEntries(this.root, result)
    return result
  }

  forEach(callback: (values: V[], key: K, map: TreapMultimap<K, V>) => void): void {
    this.inorderForEach(this.root, callback)
  }

  *[Symbol.iterator](): Iterator<[K, V[]]> {
    const stack: Array<TreapNode<K, V>> = []
    let current: TreapNode<K, V> | null = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      yield [current.key, [...current.values]]
      current = current.right
    }
  }

  get min(): K | undefined {
    if (!this.root) return undefined
    let node = this.root
    while (node.left !== null) {
      node = node.left
    }
    return node.key
  }

  get max(): K | undefined {
    if (!this.root) return undefined
    let node = this.root
    while (node.right !== null) {
      node = node.right
    }
    return node.key
  }

  getStatistics(): TreapMultimapStatistics {
    const currentMaxDepth = this.computeDepth(this.root, 0)
    return {
      sets: this._stats.sets,
      deletes: this._stats.deletes,
      rotations: this._stats.rotations,
      maxDepth: currentMaxDepth,
      totalValues: this._size,
    }
  }

  toJSON(): TreapMultimapJSON<K, V> {
    const nodes: TreapMultimapJSON<K, V>['nodes'] = []
    this.collectNodes(this.root, nodes)
    return {
      nodes,
      statistics: { ...this.getStatistics() },
    }
  }

  static fromJSON<K, V>(
    data: TreapMultimapJSON<K, V>,
    options?: TreapMultimapOptions<K>,
  ): TreapMultimap<K, V> {
    const map = new TreapMultimap<K, V>(options)
    for (const node of data.nodes) {
      for (const val of node.values) {
        map.set(node.key, val)
      }
    }
    map._stats.sets = data.statistics.sets
    map._stats.deletes = data.statistics.deletes
    map._stats.rotations = data.statistics.rotations
    return map
  }

  private insertNode(
    node: TreapNode<K, V> | null,
    key: K,
    value: V,
    depth: { value: number },
  ): TreapNode<K, V> {
    if (node === null) {
      depth.value++
      return { key, values: [value], priority: this._priorityGen(), left: null, right: null }
    }
    const cmp = this._comparator(key, node.key)
    if (cmp < 0) {
      depth.value++
      node.left = this.insertNode(node.left, key, value, depth)
      if (node.left!.priority < node.priority) {
        this._stats.rotations++
        return this.rotateRight(node)
      }
      return node
    }
    if (cmp > 0) {
      depth.value++
      node.right = this.insertNode(node.right, key, value, depth)
      if (node.right!.priority < node.priority) {
        this._stats.rotations++
        return this.rotateLeft(node)
      }
      return node
    }
    node.values.push(value)
    return node
  }

  private removeNode(node: TreapNode<K, V> | null, key: K): TreapNode<K, V> | null {
    if (node === null) return null
    const cmp = this._comparator(key, node.key)
    if (cmp < 0) {
      node.left = this.removeNode(node.left, key)
      return node
    }
    if (cmp > 0) {
      node.right = this.removeNode(node.right, key)
      return node
    }
    if (node.left === null) return node.right
    if (node.right === null) return node.left
    if (node.left.priority < node.right.priority) {
      this._stats.rotations++
      const rotated = this.rotateRight(node)
      rotated.right = this.removeNode(rotated.right, key)
      return rotated
    }
    this._stats.rotations++
    const rotated = this.rotateLeft(node)
    rotated.left = this.removeNode(rotated.left, key)
    return rotated
  }

  private findNode(node: TreapNode<K, V> | null, key: K): TreapNode<K, V> | null {
    if (node === null) return null
    const cmp = this._comparator(key, node.key)
    if (cmp < 0) return this.findNode(node.left, key)
    if (cmp > 0) return this.findNode(node.right, key)
    return node
  }

  private rotateLeft(node: TreapNode<K, V>): TreapNode<K, V> {
    const right = node.right!
    node.right = right.left
    right.left = node
    return right
  }

  private rotateRight(node: TreapNode<K, V>): TreapNode<K, V> {
    const left = node.left!
    node.left = left.right
    left.right = node
    return left
  }

  private recalcCounts(): void {
    let totalValues = 0
    let keyCount = 0
    const stack: Array<TreapNode<K, V>> = []
    let current: TreapNode<K, V> | null = this.root
    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current)
        current = current.left
      }
      current = stack.pop()!
      totalValues += current.values.length
      keyCount++
      current = current.right
    }
    this._size = totalValues
    this._keyCount = keyCount
    this._stats.totalValues = totalValues
  }

  private inorderKeys(node: TreapNode<K, V> | null, result: K[]): void {
    if (node === null) return
    this.inorderKeys(node.left, result)
    result.push(node.key)
    this.inorderKeys(node.right, result)
  }

  private inorderValues(node: TreapNode<K, V> | null, result: V[]): void {
    if (node === null) return
    this.inorderValues(node.left, result)
    result.push(...node.values)
    this.inorderValues(node.right, result)
  }

  private inorderEntries(node: TreapNode<K, V> | null, result: Array<[K, V[]]>): void {
    if (node === null) return
    this.inorderEntries(node.left, result)
    result.push([node.key, [...node.values]])
    this.inorderEntries(node.right, result)
  }

  private inorderForEach(
    node: TreapNode<K, V> | null,
    callback: (values: V[], key: K, map: TreapMultimap<K, V>) => void,
  ): void {
    if (node === null) return
    this.inorderForEach(node.left, callback)
    callback([...node.values], node.key, this)
    this.inorderForEach(node.right, callback)
  }

  private computeDepth(node: TreapNode<K, V> | null, current: number): number {
    if (node === null) return current
    return Math.max(
      this.computeDepth(node.left, current + 1),
      this.computeDepth(node.right, current + 1),
    )
  }

  private collectNodes(
    node: TreapNode<K, V> | null,
    result: TreapMultimapJSON<K, V>['nodes'],
  ): void {
    if (node === null) return
    this.collectNodes(node.left, result)
    result.push({ key: node.key, values: [...node.values], priority: node.priority })
    this.collectNodes(node.right, result)
  }
}

export { DEFAULT_TREAP_MULTIMAP_OPTIONS } from './types.js'
export type { TreapMultimapOptions, TreapMultimapJSON, TreapMultimapStatistics } from './types.js'
