export class ConsistentHashRing {
  private readonly ring: Map<number, string>
  private readonly sortedKeys: number[]
  private readonly virtualNodes: number

  constructor(nodes: string[], virtualNodes: number = 150) {
    this.ring = new Map()
    this.virtualNodes = virtualNodes
    this.sortedKeys = []
    for (const node of nodes) {
      this.addNode(node)
    }
    this.sortedKeys.sort((a, b) => a - b)
  }

  addNode(node: string): void {
    for (let i = 0; i < this.virtualNodes; i++) {
      const key = this.hash(`${node}:${i}`)
      this.ring.set(key, node)
      const idx = this.binarySearch(key)
      if (idx === -1 || this.sortedKeys[idx] !== key) {
        this.sortedKeys.splice(idx === -1 ? this.sortedKeys.length : idx, 0, key)
      }
    }
  }

  removeNode(node: string): void {
    for (let i = 0; i < this.virtualNodes; i++) {
      const key = this.hash(`${node}:${i}`)
      this.ring.delete(key)
      const idx = this.binarySearch(key)
      if (idx !== -1 && this.sortedKeys[idx] === key) {
        this.sortedKeys.splice(idx, 1)
      }
    }
  }

  getNode(key: string): string | undefined {
    if (this.sortedKeys.length === 0) return undefined
    const hash = this.hash(key)
    const idx = this.binarySearch(hash)
    const wrappedIdx = idx >= this.sortedKeys.length ? 0 : idx
    const ringKey = this.sortedKeys[wrappedIdx]
    return ringKey !== undefined ? this.ring.get(ringKey) : undefined
  }

  getNodes(key: string, count: number): string[] {
    if (this.sortedKeys.length === 0) return []
    const result: string[] = []
    const seen = new Set<string>()
    const hash = this.hash(key)
    let idx = this.binarySearch(hash)
    if (idx >= this.sortedKeys.length) idx = 0
    for (let i = 0; i < this.sortedKeys.length && result.length < count; i++) {
      const ringKey = this.sortedKeys[(idx + i) % this.sortedKeys.length]
      const node = ringKey !== undefined ? this.ring.get(ringKey) : undefined
      if (node && !seen.has(node)) {
        seen.add(node)
        result.push(node)
      }
    }
    return result
  }

  get nodeCount(): number {
    const nodes = new Set<string>()
    for (const node of this.ring.values()) {
      nodes.add(node)
    }
    return nodes.size
  }

  private hash(s: string): number {
    let h = 2166136261
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  }

  private binarySearch(key: number): number {
    let lo = 0
    let hi = this.sortedKeys.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this.sortedKeys[mid]! < key) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }
}
