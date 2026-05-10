import type { SparseHashRingOptions, SparseHashRingStatistics, SparseRingEntry } from './types.js'
import { DEFAULT_SPARSE_HASH_RING_OPTIONS } from './types.js'

export class SparseHashRing<T extends string> {
  private ring: SparseRingEntry<T>[] = []
  private nodeWeights: Map<T, number> = new Map()
  private options: Required<SparseHashRingOptions>
  private stats: SparseHashRingStatistics = {
    adds: 0,
    removes: 0,
    lookups: 0,
    rebalances: 0,
    virtualNodes: 0,
    totalWeight: 0,
  }

  constructor(options?: SparseHashRingOptions) {
    this.options = { ...DEFAULT_SPARSE_HASH_RING_OPTIONS, ...options }
  }

  addNode(node: T, weight: number = 1): void {
    if (weight <= 0) {
      return
    }
    const existing = this.nodeWeights.get(node)
    if (existing !== undefined) {
      if (existing === weight) {
        return
      }
      this.removeVirtualNodes(node)
    }
    this.nodeWeights.set(node, weight)
    const vCount = Math.round(weight * this.options.virtualNodesPerUnit)
    for (let i = 0; i < vCount; i++) {
      const vKey = `${node}:vn:${i}`
      const h = this.options.hashFunction(vKey)
      this.ring.push({ hash: h, node })
    }
    this.sortRing()
    this.stats.adds++
    this.stats.virtualNodes = this.ring.length
    this.stats.totalWeight = this.getTotalWeight()
  }

  removeNode(node: T): boolean {
    if (!this.nodeWeights.has(node)) {
      return false
    }
    this.removeVirtualNodes(node)
    this.nodeWeights.delete(node)
    this.stats.removes++
    this.stats.virtualNodes = this.ring.length
    this.stats.totalWeight = this.getTotalWeight()
    return true
  }

  getNode(key: string): T | undefined {
    if (this.ring.length === 0) {
      return undefined
    }
    const h = this.options.hashFunction(key)
    const idx = this.lowerBound(h)
    this.stats.lookups++
    if (idx >= this.ring.length) {
      return this.ring[0]!.node
    }
    return this.ring[idx]!.node
  }

  getNodes(key: string, count: number): T[] {
    if (this.ring.length === 0 || count <= 0) {
      return []
    }
    const h = this.options.hashFunction(key)
    const idx = this.lowerBound(h)
    const result: T[] = []
    const seen = new Set<T>()
    const len = this.ring.length
    for (let i = 0; i < len && result.length < count; i++) {
      const entry = this.ring[(idx + i) % len]!
      if (!seen.has(entry.node)) {
        seen.add(entry.node)
        result.push(entry.node)
      }
    }
    this.stats.lookups++
    return result
  }

  get nodes(): T[] {
    return Array.from(this.nodeWeights.keys())
  }

  get size(): number {
    return this.nodeWeights.size
  }

  get isEmpty(): boolean {
    return this.nodeWeights.size === 0
  }

  clear(): void {
    this.ring = []
    this.nodeWeights.clear()
    this.stats.virtualNodes = 0
    this.stats.totalWeight = 0
  }

  getWeight(node: T): number {
    return this.nodeWeights.get(node) ?? 0
  }

  getTotalWeight(): number {
    let total = 0
    for (const w of this.nodeWeights.values()) {
      total += w
    }
    return total
  }

  containsNode(node: T): boolean {
    return this.nodeWeights.has(node)
  }

  rebalance(): void {
    const savedWeights = new Map(this.nodeWeights)
    this.ring = []
    this.nodeWeights.clear()
    for (const [node, weight] of savedWeights) {
      this.nodeWeights.set(node, weight)
      const vCount = Math.round(weight * this.options.virtualNodesPerUnit)
      for (let i = 0; i < vCount; i++) {
        const vKey = `${node}:vn:${i}`
        const h = this.options.hashFunction(vKey)
        this.ring.push({ hash: h, node })
      }
    }
    this.sortRing()
    this.stats.rebalances++
    this.stats.virtualNodes = this.ring.length
    this.stats.totalWeight = this.getTotalWeight()
  }

  forEach(callback: (entry: SparseRingEntry<T>, index: number) => void): void {
    for (let i = 0; i < this.ring.length; i++) {
      callback(this.ring[i]!, i)
    }
  }

  toArray(): SparseRingEntry<T>[] {
    return this.ring.slice()
  }

  getStatistics(): SparseHashRingStatistics {
    return { ...this.stats }
  }

  [Symbol.iterator](): Iterator<SparseRingEntry<T>> {
    let index = 0
    const ring = this.ring
    return {
      next(): IteratorResult<SparseRingEntry<T>> {
        if (index >= ring.length) {
          return { value: undefined as unknown as SparseRingEntry<T>, done: true }
        }
        const value = ring[index]!
        index++
        return { value, done: false }
      },
    }
  }

  private removeVirtualNodes(node: T): void {
    this.ring = this.ring.filter((e) => e.node !== node)
  }

  private sortRing(): void {
    this.ring.sort((a, b) => (a.hash >>> 0) - (b.hash >>> 0))
  }

  private lowerBound(targetHash: number): number {
    let lo = 0
    let hi = this.ring.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if ((this.ring[mid]!.hash >>> 0) < (targetHash >>> 0)) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }
}

export { DEFAULT_SPARSE_HASH_RING_OPTIONS } from './types.js'
export type { SparseHashRingOptions, SparseHashRingStatistics, SparseRingEntry } from './types.js'
