import type { VebTreeOptions, VebTreeStatistics, VebTreeJSON, VebTreeNodeJSON } from './types.js'
import { DEFAULT_VEB_TREE_OPTIONS } from './types.js'

class VebNode {
  min: number | undefined
  max: number | undefined
  universeSize: number
  summary: VebNode | null
  clusters: Map<number, VebNode> | null

  constructor(universeSize: number) {
    this.min = undefined
    this.max = undefined
    this.universeSize = universeSize
    if (universeSize <= 2) {
      this.summary = null
      this.clusters = null
    } else {
      const upper = upperSqrt(universeSize)
      this.summary = new VebNode(upper)
      this.clusters = new Map()
    }
  }
}

function upperSqrt(u: number): number {
  return Math.pow(2, Math.ceil(Math.log2(u) / 2))
}

function lowerSqrt(u: number): number {
  return Math.pow(2, Math.floor(Math.log2(u) / 2))
}

function high(x: number, u: number): number {
  return Math.floor(x / lowerSqrt(u))
}

function low(x: number, u: number): number {
  return x % lowerSqrt(u)
}

function index(i: number, j: number, u: number): number {
  return i * lowerSqrt(u) + j
}

function nextPowerOf2(n: number): number {
  if (n <= 2) return 2
  let p = 1
  while (p < n) p <<= 1
  return p
}

function emptyNodeInsert(node: VebNode, x: number): void {
  node.min = x
  node.max = x
}

function vebInsert(node: VebNode, x: number): void {
  if (node.min === undefined) {
    emptyNodeInsert(node, x)
    return
  }
  if (x < node.min) {
    const temp = x
    x = node.min
    node.min = temp
  }
  if (node.universeSize > 2) {
    const h = high(x, node.universeSize)
    const l = low(x, node.universeSize)
    const cluster = node.clusters!.get(h)
    if (cluster === undefined || cluster.min === undefined) {
      vebInsert(node.summary!, h)
      const newCluster = new VebNode(lowerSqrt(node.universeSize))
      emptyNodeInsert(newCluster, l)
      node.clusters!.set(h, newCluster)
    } else {
      vebInsert(cluster, l)
    }
  }
  if (x > node.max!) {
    node.max = x
  }
}

function vebRemove(node: VebNode, x: number): boolean {
  if (node.min === undefined) return false
  if (node.min === node.max) {
    if (node.min === x) {
      node.min = undefined
      node.max = undefined
      return true
    }
    return false
  }
  if (node.universeSize <= 2) {
    if (x === 0) {
      node.min = 1
    } else {
      node.min = 0
    }
    node.max = node.min
    return true
  }
  if (x === node.min) {
    const firstCluster = vebMinNode(node.summary!)
    if (firstCluster === undefined) {
      node.min = node.max
      node.max = node.min
      return true
    }
    const cluster = node.clusters!.get(firstCluster)
    x = index(firstCluster, cluster!.min!, node.universeSize)
    node.min = x
  }
  const h = high(x, node.universeSize)
  const l = low(x, node.universeSize)
  const cluster = node.clusters!.get(h)
  if (cluster === undefined) return false
  const removed = vebRemove(cluster, l)
  if (!removed) return false
  if (cluster.min === undefined) {
    node.clusters!.delete(h)
    vebRemove(node.summary!, h)
  }
  if (x === node.max) {
    const summaryMax = vebMaxNode(node.summary!)
    if (summaryMax === undefined) {
      node.max = node.min
    } else {
      const maxCluster = node.clusters!.get(summaryMax)!
      node.max = index(summaryMax, maxCluster.max!, node.universeSize)
    }
  }
  return true
}

function vebHas(node: VebNode, x: number): boolean {
  if (node.min === undefined) return false
  if (x === node.min || x === node.max) return true
  if (node.universeSize <= 2) return false
  const h = high(x, node.universeSize)
  const cluster = node.clusters!.get(h)
  if (cluster === undefined) return false
  return vebHas(cluster, low(x, node.universeSize))
}

function vebMinNode(node: VebNode): number | undefined {
  return node.min
}

function vebMaxNode(node: VebNode): number | undefined {
  return node.max
}

function vebSuccessor(node: VebNode, x: number): number | undefined {
  if (node.min === undefined) return undefined
  if (node.universeSize <= 2) {
    if (x === 0 && node.max === 1) return 1
    return undefined
  }
  if (node.min !== undefined && x < node.min) return node.min
  const h = high(x, node.universeSize)
  const l = low(x, node.universeSize)
  const cluster = node.clusters!.get(h)
  if (cluster !== undefined && cluster.max !== undefined && l < cluster.max) {
    const offset = vebSuccessor(cluster, l)
    if (offset !== undefined) return index(h, offset, node.universeSize)
  }
  const succCluster = vebSuccessor(node.summary!, h)
  if (succCluster === undefined) return undefined
  const succClusterNode = node.clusters!.get(succCluster)!
  return index(succCluster, succClusterNode.min!, node.universeSize)
}

function vebPredecessor(node: VebNode, x: number): number | undefined {
  if (node.min === undefined) return undefined
  if (node.universeSize <= 2) {
    if (x === 1 && node.min === 0) return 0
    return undefined
  }
  if (node.max !== undefined && x > node.max) return node.max
  const h = high(x, node.universeSize)
  const l = low(x, node.universeSize)
  const cluster = node.clusters!.get(h)
  if (cluster !== undefined && cluster.min !== undefined && l > cluster.min) {
    const offset = vebPredecessor(cluster, l)
    if (offset !== undefined) return index(h, offset, node.universeSize)
  }
  const predCluster = vebPredecessor(node.summary!, h)
  if (predCluster === undefined) {
    if (node.min !== undefined && x > node.min) return node.min
    return undefined
  }
  const predClusterNode = node.clusters!.get(predCluster)!
  return index(predCluster, predClusterNode.max!, node.universeSize)
}

function vebCollectSorted(node: VebNode, result: number[]): void {
  if (node.min === undefined) return
  result.push(node.min)
  if (node.min === node.max) return
  if (node.universeSize <= 2) {
    if (node.min !== node.max) result.push(node.max!)
    return
  }
  const keys = Array.from(node.clusters!.keys()).sort((a, b) => a - b)
  for (const k of keys) {
    const cluster = node.clusters!.get(k)!
    const sub: number[] = []
    vebCollectSorted(cluster, sub)
    for (const v of sub) {
      result.push(index(k, v, node.universeSize))
    }
  }
}

function vebContainsRange(node: VebNode, start: number, end: number): boolean {
  for (let v = start; v <= end; v++) {
    if (!vebHas(node, v)) return false
  }
  return true
}

function countClusters(node: VebNode): number {
  if (node.universeSize <= 2) return 0
  let count = node.clusters!.size
  for (const cluster of node.clusters!.values()) {
    count += countClusters(cluster)
  }
  count += countClusters(node.summary!)
  return count
}

function nodeToJSON(node: VebNode): VebTreeNodeJSON {
  const json: VebTreeNodeJSON = {
    min: node.min,
    max: node.max,
    universeSize: node.universeSize,
    clusters: null,
    summary: null,
  }
  if (node.universeSize > 2) {
    json.summary = nodeToJSON(node.summary!)
    const entries: Array<[number, VebTreeNodeJSON]> = []
    for (const [k, v] of node.clusters!) {
      entries.push([k, nodeToJSON(v)])
    }
    json.clusters = entries
  }
  return json
}

function nodeFromJSON(json: VebTreeNodeJSON): VebNode {
  const node = new VebNode(json.universeSize)
  node.min = json.min
  node.max = json.max
  if (json.universeSize > 2 && json.clusters && json.summary) {
    node.summary = nodeFromJSON(json.summary)
    node.clusters = new Map()
    for (const [k, v] of json.clusters) {
      node.clusters.set(k, nodeFromJSON(v))
    }
  }
  return node
}

export class VebTree {
  private _root: VebNode
  private _universeSize: number
  private _size: number
  private _stats: VebTreeStatistics

  constructor(universeSize?: number)
  constructor(options?: Partial<VebTreeOptions>)
  constructor(universeSizeOrOptions?: number | Partial<VebTreeOptions>) {
    let opts: Required<VebTreeOptions>
    if (typeof universeSizeOrOptions === 'object' && universeSizeOrOptions !== null) {
      opts = { ...DEFAULT_VEB_TREE_OPTIONS, ...universeSizeOrOptions }
    } else if (universeSizeOrOptions !== undefined) {
      opts = { ...DEFAULT_VEB_TREE_OPTIONS, universeSize: universeSizeOrOptions }
    } else {
      opts = { ...DEFAULT_VEB_TREE_OPTIONS }
    }
    this._universeSize = nextPowerOf2(opts.universeSize)
    this._root = new VebNode(this._universeSize)
    this._size = 0
    this._stats = {
      inserts: 0,
      removes: 0,
      successorQueries: 0,
      predecessorQueries: 0,
      universeSize: this._universeSize,
      clusterCount: 0,
    }
  }

  insert(value: number): void {
    if (value < 0 || value >= this._universeSize) {
      throw new RangeError(`Value ${value} out of range [0, ${this._universeSize - 1}]`)
    }
    if (vebHas(this._root, value)) {
      this._stats.inserts++
      return
    }
    vebInsert(this._root, value)
    this._size++
    this._stats.inserts++
  }

  remove(value: number): boolean {
    if (value < 0 || value >= this._universeSize) return false
    if (!vebHas(this._root, value)) return false
    const removed = vebRemove(this._root, value)
    if (removed) {
      this._size--
      this._stats.removes++
    }
    return removed
  }

  has(value: number): boolean {
    if (value < 0 || value >= this._universeSize) return false
    return vebHas(this._root, value)
  }

  min(): number | undefined {
    return vebMinNode(this._root)
  }

  max(): number | undefined {
    return vebMaxNode(this._root)
  }

  successor(value: number): number | undefined {
    this._stats.successorQueries++
    if (value < 0 || value >= this._universeSize) return this.min()
    return vebSuccessor(this._root, value)
  }

  predecessor(value: number): number | undefined {
    this._stats.predecessorQueries++
    if (value < 0) return undefined
    if (value >= this._universeSize) return this.max()
    return vebPredecessor(this._root, value)
  }

  next(value: number): number | undefined {
    return this.successor(value)
  }

  prev(value: number): number | undefined {
    return this.predecessor(value)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this._root = new VebNode(this._universeSize)
    this._size = 0
    this._stats = {
      inserts: 0,
      removes: 0,
      successorQueries: 0,
      predecessorQueries: 0,
      universeSize: this._universeSize,
      clusterCount: 0,
    }
  }

  toArray(): number[] {
    const result: number[] = []
    vebCollectSorted(this._root, result)
    return result
  }

  forEach(callback: (value: number, index: number) => void): void {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    const arr = this.toArray()
    for (const v of arr) {
      yield v
    }
  }

  containsRange(start: number, end: number): boolean {
    if (start > end) return false
    if (start < 0 || end >= this._universeSize) return false
    return vebContainsRange(this._root, start, end)
  }

  getStatistics(): VebTreeStatistics {
    return {
      ...this._stats,
      clusterCount: countClusters(this._root),
    }
  }

  toJSON(): VebTreeJSON {
    return {
      universeSize: this._universeSize,
      size: this._size,
      root: nodeToJSON(this._root),
      statistics: this.getStatistics(),
    }
  }

  static fromJSON(data: VebTreeJSON): VebTree {
    const tree = new VebTree(data.universeSize)
    tree._root = nodeFromJSON(data.root)
    tree._size = data.size
    tree._stats = { ...data.statistics }
    return tree
  }
}

export { DEFAULT_VEB_TREE_OPTIONS } from './types.js'
export type { VebTreeOptions, VebTreeStatistics, VebTreeJSON, VebTreeNodeJSON } from './types.js'
