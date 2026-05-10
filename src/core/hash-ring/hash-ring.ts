import type { HashRingOptions, RingEntry } from './types.js'
import { DEFAULT_HASH_RING_OPTIONS } from './types.js'

export class HashRing<T extends string> {
  private ring: RingEntry<T>[] = []
  private nodeSet: Set<T> = new Set()
  private options: HashRingOptions

  constructor(options?: Partial<HashRingOptions>) {
    this.options = { ...DEFAULT_HASH_RING_OPTIONS, ...options }
  }

  addNode(node: T): void {
    if (this.nodeSet.has(node)) {
      return
    }
    this.nodeSet.add(node)
    for (let i = 0; i < this.options.virtualNodes; i++) {
      const vKey = `${node}:${i}`
      const h = this.options.hash(vKey)
      const entry: RingEntry<T> = { hash: h, node }
      const idx = this.lowerBound(h)
      this.ring.splice(idx, 0, entry)
    }
  }

  removeNode(node: T): boolean {
    if (!this.nodeSet.has(node)) {
      return false
    }
    this.nodeSet.delete(node)
    this.ring = this.ring.filter((e) => e.node !== node)
    return true
  }

  getNode(key: string): T | undefined {
    if (this.ring.length === 0) {
      return undefined
    }
    const h = this.options.hash(key)
    const idx = this.lowerBound(h)
    if (idx >= this.ring.length) {
      return this.ring[0]!.node
    }
    return this.ring[idx]!.node
  }

  getNodes(key: string, count: number): T[] {
    if (this.ring.length === 0 || count <= 0) {
      return []
    }
    const h = this.options.hash(key)
    const idx = this.lowerBound(h)
    const result: T[] = []
    const seen = new Set<T>()
    for (let i = 0; i < this.ring.length && result.length < count; i++) {
      const entry = this.ring[(idx + i) % this.ring.length]!
      if (!seen.has(entry.node)) {
        seen.add(entry.node)
        result.push(entry.node)
      }
    }
    return result
  }

  getRing(): RingEntry<T>[] {
    return this.ring.slice()
  }

  get size(): number {
    return this.nodeSet.size
  }

  get virtualSize(): number {
    return this.ring.length
  }

  contains(node: T): boolean {
    return this.nodeSet.has(node)
  }

  get nodes(): T[] {
    return Array.from(this.nodeSet)
  }

  getLoadEstimate(node: T): number {
    if (!this.nodeSet.has(node) || this.ring.length === 0) {
      return 0
    }
    if (this.ring.length === 1) {
      return 1
    }
    let ownedArc = 0
    for (let i = 0; i < this.ring.length; i++) {
      if (this.ring[i]!.node !== node) {
        continue
      }
      const prevIdx = i === 0 ? this.ring.length - 1 : i - 1
      const prevHash = this.ring[prevIdx]!.hash
      const currHash = this.ring[i]!.hash
      if (currHash >= prevHash) {
        ownedArc += currHash - prevHash
      } else {
        ownedArc += (0xffffffff - prevHash) + currHash + 1
      }
    }
    return ownedArc / (0xffffffff + 1)
  }

  getPartition(key: string): { node: T; index: number } | undefined {
    if (this.ring.length === 0) {
      return undefined
    }
    const h = this.options.hash(key)
    const idx = this.lowerBound(h)
    const ringIdx = idx >= this.ring.length ? 0 : idx
    return { node: this.ring[ringIdx]!.node, index: ringIdx }
  }

  hash(key: string): number {
    return this.options.hash(key)
  }

  private lowerBound(targetHash: number): number {
    let lo = 0
    let hi = this.ring.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.ring[mid]!.hash < targetHash) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }
}

export { DEFAULT_HASH_RING_OPTIONS } from './types.js'
export type { HashRingOptions, RingEntry } from './types.js'
