import type { DisjointMapNode, DisjointMapOptions, DisjointMapStats } from './types.js'

export class DisjointMap<K, V> {
  private nodes: Map<K, DisjointMapNode<K, V>> = new Map()
  private merge: (a: V, b: V) => V
  private componentCount: number = 0

  constructor(options: DisjointMapOptions<V>) {
    this.merge = options.merge
  }

  makeSet(key: K, value: V): void {
    if (this.nodes.has(key)) return
    this.nodes.set(key, { key, rank: 0, parent: key, value })
    this.componentCount++
  }

  find(key: K): K {
    const node = this.nodes.get(key)
    if (!node) throw new Error(`Element not found`)
    if (node.parent !== key) {
      node.parent = this.find(node.parent)
    }
    return node.parent
  }

  getValue(key: K): V {
    const node = this.nodes.get(key)
    if (!node) throw new Error(`Element not found`)
    const root = this.find(key)
    return this.nodes.get(root)!.value
  }

  union(a: K, b: K): boolean {
    if (!this.nodes.has(a) || !this.nodes.has(b)) return false
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA === rootB) return false
    const nodeA = this.nodes.get(rootA)!
    const nodeB = this.nodes.get(rootB)!
    if (nodeA.rank < nodeB.rank) {
      nodeA.parent = rootB
      nodeB.value = this.merge(nodeB.value, nodeA.value)
    } else if (nodeA.rank > nodeB.rank) {
      nodeB.parent = rootA
      nodeA.value = this.merge(nodeA.value, nodeB.value)
    } else {
      nodeB.parent = rootA
      nodeA.rank++
      nodeA.value = this.merge(nodeA.value, nodeB.value)
    }
    this.componentCount--
    return true
  }

  connected(a: K, b: K): boolean {
    if (!this.nodes.has(a) || !this.nodes.has(b)) return false
    return this.find(a) === this.find(b)
  }

  get size(): number {
    return this.nodes.size
  }

  setSize(key: K): number {
    if (!this.nodes.has(key)) return 0
    const root = this.find(key)
    let count = 0
    for (const node of this.nodes.values()) {
      if (this.find(node.key) === root) count++
    }
    return count
  }

  keys(): K[] {
    return Array.from(this.nodes.keys())
  }

  groups(): Map<K, K[]> {
    const sets = new Map<K, K[]>()
    for (const key of this.nodes.keys()) {
      const root = this.find(key)
      if (!sets.has(root)) {
        sets.set(root, [])
      }
      sets.get(root)!.push(key)
    }
    return sets
  }

  toArray(): { key: K, value: V }[] {
    const result: { key: K, value: V }[] = []
    for (const node of this.nodes.values()) {
      const root = this.find(node.key)
      result.push({ key: node.key, value: this.nodes.get(root)!.value })
    }
    return result
  }

  static from<K, V>(entries: Array<[K, V]>, options: DisjointMapOptions<V>): DisjointMap<K, V> {
    const map = new DisjointMap<K, V>(options)
    for (const [key, value] of entries) {
      map.makeSet(key, value)
    }
    return map
  }

  stats(): DisjointMapStats {
    const groups = this.groups()
    let maxComponentSize = 0
    let minComponentSize = this.nodes.size > 0 ? Infinity : 0
    for (const members of groups.values()) {
      if (members.length > maxComponentSize) maxComponentSize = members.length
      if (members.length < minComponentSize) minComponentSize = members.length
    }
    if (minComponentSize === Infinity) minComponentSize = 0
    return {
      elementCount: this.nodes.size,
      componentCount: this.componentCount,
      maxComponentSize,
      minComponentSize,
    }
  }
}

export { DEFAULT_DISJOINT_MAP_OPTIONS } from './types.js'
export type { DisjointMapNode, DisjointMapOptions, DisjointMapStats } from './types.js'
