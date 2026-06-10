/**
 * Rendezvous Hashing (HRW - Highest Random Weight hashing).
 *
 * A consistent hashing algorithm that maps keys to nodes by computing
 * a hash of each (key, node) pair and selecting the node with the highest
 * hash value. Provides uniform distribution and minimal disruption when
 * nodes are added or removed.
 *
 * Based on: Thaler & Ravishankar, "Using Name-Based Mapping to Increase Hit Rates"
 */
export class RendezvousHash<T> {
  private nodes: Map<string, T> = new Map()

  constructor(entries?: Iterable<readonly [string, T]>) {
    if (entries) {
      for (const [key, value] of entries) {
        this.nodes.set(key, value)
      }
    }
  }

  /** Add a node with the given key */
  add(key: string, value: T): void {
    this.nodes.set(key, value)
  }

  /** Remove a node by key */
  remove(key: string): boolean {
    return this.nodes.delete(key)
  }

  /** Get a node by key */
  get(key: string): T | undefined {
    return this.nodes.get(key)
  }

  /** Check if a node exists */
  has(key: string): boolean {
    return this.nodes.has(key)
  }

  /** Select the best node for a given item key */
  select(itemKey: string): T | undefined {
    if (this.nodes.size === 0) return undefined
    let bestNode: string | undefined
    let bestHash = -1

    for (const nodeKey of this.nodes.keys()) {
      const hash = this.hashPair(itemKey, nodeKey)
      if (hash > bestHash) {
        bestHash = hash
        bestNode = nodeKey
      }
    }

    return bestNode !== undefined ? this.nodes.get(bestNode) : undefined
  }

  /** Select the node key for a given item (returns the key, not the value) */
  selectKey(itemKey: string): string | undefined {
    if (this.nodes.size === 0) return undefined
    let bestNode: string | undefined
    let bestHash = -1

    for (const nodeKey of this.nodes.keys()) {
      const hash = this.hashPair(itemKey, nodeKey)
      if (hash > bestHash) {
        bestHash = hash
        bestNode = nodeKey
      }
    }

    return bestNode
  }

  /** Select top N nodes for an item (useful for replication) */
  selectN(itemKey: string, n: number): T[] {
    if (this.nodes.size === 0 || n <= 0) return []

    const entries: Array<{ key: string; hash: number }> = []
    for (const nodeKey of this.nodes.keys()) {
      entries.push({ key: nodeKey, hash: this.hashPair(itemKey, nodeKey) })
    }
    entries.sort((a, b) => b.hash - a.hash)

    const result: T[] = []
    for (let i = 0; i < Math.min(n, entries.length); i++) {
      const value = this.nodes.get(entries[i]!.key)
      if (value !== undefined) result.push(value)
    }
    return result
  }

  /** Get the number of nodes */
  get size(): number {
    return this.nodes.size
  }

  /** Check if there are no nodes */
  isEmpty(): boolean {
    return this.nodes.size === 0
  }

  /** Get all node keys */
  keys(): string[] {
    return Array.from(this.nodes.keys())
  }

  /** Get all node values */
  values(): T[] {
    return Array.from(this.nodes.values())
  }

  /** Get all entries */
  entries(): Array<[string, T]> {
    return Array.from(this.nodes.entries())
  }

  /** Remove all nodes */
  clear(): void {
    this.nodes.clear()
  }

  /** Clone the hash ring */
  clone(): RendezvousHash<T> {
    const copy = new RendezvousHash<T>()
    for (const [key, value] of this.nodes) {
      copy.nodes.set(key, value)
    }
    return copy
  }

  toString(): string {
    return `RendezvousHash(nodes=${this.nodes.size})`
  }

  /** Hash a (key, node) pair using double hashing */
  private hashPair(key: string, node: string): number {
    let h1 = this.murmurHash(key, node)
    let h2 = this.murmurHash(node, key)
    return (h1 ^ h2) >>> 0
  }

  private murmurHash(a: string, b: string): number {
    const combined = a + ':' + b
    let h = 0x12345678
    for (let i = 0; i < combined.length; i++) {
      const ch = combined.charCodeAt(i)
      h = Math.imul(h ^ ch, 0x5bd1e995)
      h ^= h >>> 15
    }
    h = Math.imul(h, 0x27d4eb2d)
    h ^= h >>> 15
    return h >>> 0
  }
}
