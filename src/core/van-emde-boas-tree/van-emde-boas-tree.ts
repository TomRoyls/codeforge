import type { VEBNode } from './types.js'

function createNode(universeSize: number): VEBNode {
  return {
    min: undefined,
    max: undefined,
    universeSize,
    summary: null,
    clusters: new Map(),
  }
}

function high(node: VEBNode, x: number): number {
  const ls = lowerSqrt(node)
  return Math.floor(x / ls)
}

function low(node: VEBNode, x: number): number {
  const ls = lowerSqrt(node)
  return x % ls
}

function index(node: VEBNode, h: number, l: number): number {
  return h * lowerSqrt(node) + l
}

function upperSqrt(node: VEBNode): number {
  return Math.pow(2, Math.ceil(Math.log2(node.universeSize) / 2))
}

function lowerSqrt(node: VEBNode): number {
  return Math.pow(2, Math.floor(Math.log2(node.universeSize) / 2))
}

function ensureCluster(node: VEBNode, idx: number): VEBNode {
  let cluster = node.clusters.get(idx)
  if (cluster === undefined) {
    cluster = createNode(lowerSqrt(node))
    node.clusters.set(idx, cluster)
  }
  return cluster
}

function vebHas(node: VEBNode, x: number): boolean {
  if (x === node.min) return true
  if (x === node.max) return true
  if (node.universeSize <= 2) return false
  const cluster = node.clusters.get(high(node, x))
  if (cluster === undefined) return false
  return vebHas(cluster, low(node, x))
}

function vebInsert(node: VEBNode, x: number): void {
  if (node.min === undefined) {
    node.min = x
    node.max = x
    return
  }
  if (x < node.min) {
    const temp = node.min
    node.min = x
    x = temp
  }
  if (node.universeSize > 2) {
    if (node.summary === null) {
      node.summary = createNode(upperSqrt(node))
    }
    const h = high(node, x)
    const l = low(node, x)
    const cluster = node.clusters.get(h)
    if (cluster === undefined || cluster.min === undefined) {
      vebInsert(node.summary, h)
      const c = ensureCluster(node, h)
      vebInsert(c, l)
    } else {
      vebInsert(cluster, l)
    }
  }
  if (node.max === undefined || x > node.max) {
    node.max = x
  }
}

function vebDelete(node: VEBNode, x: number): boolean {
  if (node.min === undefined) return false
  if (node.min === node.max) {
    if (x === node.min) {
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
    const firstCluster = node.summary !== null ? node.summary.min : undefined
    if (firstCluster === undefined) {
      node.min = undefined
      node.max = undefined
      return false
    }
    const cluster = node.clusters.get(firstCluster)
    if (cluster === undefined) {
      node.min = undefined
      node.max = undefined
      return false
    }
    x = index(node, firstCluster, cluster.min!)
    node.min = x
  }
  const h = high(node, x)
  const cluster = node.clusters.get(h)
  if (cluster === undefined) return false
  const deleted = vebDelete(cluster, low(node, x))
  if (!deleted) return false
  if (cluster.min === undefined) {
    if (node.summary !== null) {
      vebDelete(node.summary, h)
    }
    if (node.summary !== null && node.summary.min === undefined) {
      node.max = node.min
    } else {
      const summaryMax = node.summary !== null ? node.summary.max : undefined
      if (summaryMax !== undefined) {
        const maxCluster = node.clusters.get(summaryMax)
        if (maxCluster !== undefined) {
          node.max = index(node, summaryMax, maxCluster.max!)
        } else {
          node.max = node.min
        }
      } else {
        node.max = node.min
      }
    }
  } else if (node.max === x) {
    node.max = index(node, h, cluster.max!)
  }
  return true
}

function vebSuccessor(node: VEBNode, x: number): number | undefined {
  if (node.universeSize <= 2) {
    if (x === 0 && node.max === 1) return 1
    return undefined
  }
  if (node.min !== undefined && x < node.min) {
    return node.min
  }
  const h = high(node, x)
  const cluster = node.clusters.get(h)
  if (cluster !== undefined) {
    const clusterMax = cluster.max
    if (clusterMax !== undefined && low(node, x) < clusterMax) {
      const offset = vebSuccessor(cluster, low(node, x))
      if (offset !== undefined) {
        return index(node, h, offset)
      }
    }
  }
  if (node.summary === null) return undefined
  const succCluster = vebSuccessor(node.summary, h)
  if (succCluster === undefined) return undefined
  const succClusterNode = node.clusters.get(succCluster)
  if (succClusterNode === undefined) return undefined
  const offset2 = succClusterNode.min
  if (offset2 === undefined) return undefined
  return index(node, succCluster, offset2)
}

function vebPredecessor(node: VEBNode, x: number): number | undefined {
  if (node.universeSize <= 2) {
    if (x === 1 && node.min === 0) return 0
    return undefined
  }
  if (node.max !== undefined && x > node.max) {
    return node.max
  }
  const h = high(node, x)
  const cluster = node.clusters.get(h)
  if (cluster !== undefined) {
    const clusterMin = cluster.min
    if (clusterMin !== undefined && low(node, x) > clusterMin) {
      const offset = vebPredecessor(cluster, low(node, x))
      if (offset !== undefined) {
        return index(node, h, offset)
      }
    }
  }
  if (node.summary === null) return undefined
  const predCluster = vebPredecessor(node.summary, h)
  if (predCluster === undefined) {
    if (node.min !== undefined && x > node.min) {
      return node.min
    }
    return undefined
  }
  const predClusterNode = node.clusters.get(predCluster)
  if (predClusterNode === undefined) {
    if (node.min !== undefined && x > node.min) {
      return node.min
    }
    return undefined
  }
  const offset2 = predClusterNode.max
  if (offset2 === undefined) {
    if (node.min !== undefined && x > node.min) {
      return node.min
    }
    return undefined
  }
  return index(node, predCluster, offset2)
}

function deepCloneNode(node: VEBNode): VEBNode {
  const cloned = createNode(node.universeSize)
  cloned.min = node.min
  cloned.max = node.max
  if (node.summary !== null) {
    cloned.summary = deepCloneNode(node.summary)
  }
  for (const [key, cluster] of node.clusters) {
    cloned.clusters.set(key, deepCloneNode(cluster))
  }
  return cloned
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0
}

export class VEBTree {
  private root: VEBNode
  private _size: number
  private _universeSize: number

  constructor(universeSize: number) {
    if (universeSize < 2 || !isPowerOfTwo(universeSize)) {
      throw new Error('Universe size must be a power of 2')
    }
    this._universeSize = universeSize
    this.root = createNode(universeSize)
    this._size = 0
  }

  insert(x: number): void {
    if (x < 0 || x >= this._universeSize) {
      throw new RangeError(`Value ${x} out of universe range [0, ${this._universeSize})`)
    }
    if (!vebHas(this.root, x)) {
      vebInsert(this.root, x)
      this._size++
    }
  }

  remove(x: number): boolean {
    if (x < 0 || x >= this._universeSize) return false
    if (vebHas(this.root, x)) {
      const result = vebDelete(this.root, x)
      if (result) {
        this._size--
      }
      return result
    }
    return false
  }

  has(x: number): boolean {
    if (x < 0 || x >= this._universeSize) return false
    return vebHas(this.root, x)
  }

  min(): number | undefined {
    return this.root.min
  }

  max(): number | undefined {
    return this.root.max
  }

  successor(x: number): number | undefined {
    if (x < 0 || x >= this._universeSize) return undefined
    return vebSuccessor(this.root, x)
  }

  predecessor(x: number): number | undefined {
    if (x < 0 || x >= this._universeSize) return undefined
    return vebPredecessor(this.root, x)
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = createNode(this._universeSize)
    this._size = 0
  }

  clone(): VEBTree {
    const cloned = new VEBTree(this._universeSize)
    cloned.root = deepCloneNode(this.root)
    cloned._size = this._size
    return cloned
  }

  toArray(): number[] {
    const result: number[] = []
    let current = this.min()
    while (current !== undefined) {
      result.push(current)
      current = this.successor(current)
    }
    return result
  }

  [Symbol.iterator](): Iterator<number> {
    let current = this.min()
    const self = this
    return {
      next(): IteratorResult<number> {
        if (current === undefined) {
          return { done: true, value: undefined }
        }
        const value = current
        current = self.successor(current)
        return { done: false, value }
      },
    }
  }
}

export type { VEBNode } from './types.js'
